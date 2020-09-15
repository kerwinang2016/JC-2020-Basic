/**
 *@NApiVersion 2.x
 */
define(
    [
        'N/error'
    ,   'N/record'
    ,   'N/log'
    ,   '../Services/FileApiSS2'
    ,   'N/search'
    ,   'N/file'
    ,   '../Helpers/SkinHelperSS2'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/ManifestResourceNameHelper'
    ,   '../Helpers/ExtensionHelperSS2'
    ,	'N/format'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        error
    ,   record
    ,   log
    ,   FileApi
    ,   search
    ,   File
    ,   SkinHelper
    ,   utils
    ,   JobToProcessHelper
    ,   ManifestResourceNameHelper
    ,   ExtensionHelper
    ,   format_module
    )
{
    var plugin_implementation_helper = {

        DEVELOPMENT_MODE: 'DEVELOPMENT',
        PRODUCTION_MODE: 'PRODUCTION',

        alphanumeric_regex: /^[a-z0-9]*$/i,
        file_extension_regex: /.+\.([^\.]+)]$/,
        square_brackets_regex: /[\[\]]/g,

        logDatetime: function logDatetime(message, function_name)
        {
            var date_time = format_module.format({
                value: new Date()
            ,	type: format_module.Type.DATETIME
            });

            log.debug({title: message + function_name, details: date_time});
        },

        commonValidations: function commonValidations(sdf_object, type)
        {
            this.validateInstallationInProgress(sdf_object);
            this.validateDifferentScriptId(sdf_object);
            this.validateFirstLevelElements(sdf_object, type);
            this.validateEmptyResources(sdf_object);
            this._validateTags(sdf_object);
        },

        _validateTags: function _validateTags(sdf_object)
        {
            var self = this;

            if(!_.isArray(sdf_object) || !_.isObject(sdf_object))
            {
                return;
            }
            _.each(sdf_object, function(value, key)
            {
                if(!self.alphanumeric_regex.test(key))
                {
                    throw error.create({
                        name: 'ERROR_TAG_NAME'
                    ,   message: 'Error in tag ' + key + ' tags only allow alphanumeric characters'
                    });
                }
                self._validateTags(sdf_object[key]);
            });

        },

        deleteExtensions: function deleteExtensions(sdf_object)
        {
            var self = this;

            if(sdf_object.scriptid)
            {
                var extensionsByScriptId = ExtensionHelper.getExtensionsByScriptId(sdf_object.scriptid);

                if(extensionsByScriptId)
                {
                    _.each(extensionsByScriptId, function(extension)
                    {
                        self._deleteSkinsForTheme(extension);
                        record.delete({type: 'customrecord_ns_sc_extmech_extension', id: extension.id});
                    });
                }
            }

            if(sdf_object.vendor && sdf_object.name)
            {
                var extensionsByVendorAndName = ExtensionHelper.getExtensionsByVendorAndName(sdf_object.vendor, sdf_object.name);

                if(extensionsByVendorAndName)
                {
                    _.each(extensionsByVendorAndName, function(extension)
                    {
                        log.debug({title: 'extnsion type', details: extension.type});
                        if(extension.type === 'theme')
                        {
                            self._deleteSkinsForTheme(extension);
                        }
                        record.delete({type: 'customrecord_ns_sc_extmech_extension', id: extension.id});
                    });
                }
            }
        },

        _deleteSkinsForTheme: function _deleteSkinsForTheme(theme)
        {
            var skins = search.create({
                type: 'customrecord_ns_sc_extmech_skin_preset'
            ,   filters:  [
                    ['custrecord_skin_preset_theme', search.Operator.IS, theme.id]
                ]
            }).run();

            if(skins)
            {
                skins.each(function(skin)
                {
                    record.delete({type: 'customrecord_ns_sc_extmech_skin_preset', id: skin.id});
                    return true;
                });
            }
        },

        validateDifferentScriptId: function validateDifferentScriptId(sdf_object)
        {
            var extensions = ExtensionHelper.getExtensionsByVendorAndName(sdf_object.vendor, sdf_object.name);

            _.each(extensions, function(ext)
            {
                if(ext.script_id !== sdf_object.scriptid)
                {
                    throw error.create({
                        name: 'ERROR_DIFFERENT_SCRIPT_ID'
                    ,   message: 'An extension for this name and vendor with different script id already exists.'
                    });
                }
                return true;
            });

            var extensionsByScriptId = ExtensionHelper.getExtensionsByScriptId(sdf_object.scriptid);

            _.each(extensionsByScriptId, function(ext)
            {
                if(ext.name !== sdf_object.name || ext.vendor !== sdf_object.vendor)
                {
                    throw error.create({
                        name: 'ERROR_DIFFERENT_VENDOR_OR_NAME'
                    ,   message: 'An extension for this script id with different nsme and vendor already exists.'
                    });
                }
            });

        },

        validateDelete: function validateDelete(sdf_object)
        {
            var extensions = ExtensionHelper.getExtensionsByScriptId(sdf_object.scriptid);

            if(!extensions)
            {
                throw error.create({
                    name: 'ERROR_EXTENSION_NOT_FOUND'
                ,   message: 'There is no extension for this script id'
                });
            }

            if (extensions.length)
            {
                _.each(extensions, function(ext)
                {
                    var extension_active = search.create({
                        type : 'customrecord_ns_sc_extmech_ext_active'
                    ,   filters : [['custrecord_extension_id', search.Operator.IS, ext.id]]
                    ,   columns : ['custrecord_activation_id']
                    }).run();

                    if (extension_active && extension_active.getRange({start: 0, end: 1}).length)
                    {
                        throw error.create({
                            name: 'ERROR_ACTIVE_EXTENSION'
                        ,   message: 'There is an active extension for this script id'
                        });
                    }
                });
            }
        },

        updateExtensionRecord: function updateExtensionRecord(extension)
        {
            var extensions = ExtensionHelper.getExtensionsByVendorAndName(extension.vendor, extension.name);

            if(!extensions || !extensions.length)
            {
                throw error.create({
                    name: 'ERROR_EXTENSION_NOT_FOUND'
                ,   message: 'There is no extension for this vendor and name'
                });
            }

            var last_extension = ExtensionHelper.getLatestExtension(extensions);

            extension.id = last_extension.id;
            return ExtensionHelper.updateExtension(extension);
        },

        validateVersion: function validateVersion(sdf_object)
        {
            var extensions = search.create({
                type : 'customrecord_ns_sc_extmech_extension'
            ,   filters :  [
                    ['name', search.Operator.IS, sdf_object.name]
                ,   'and'
                ,   ['custrecord_extension_vendor', search.Operator.IS,  sdf_object.vendor]
                ]
            ,   columns : ['custrecord_extension_version']
            }).run();

            if(extensions)
            {
                extensions.each(function(result)
                {
                    var version = result.getValue({name : 'custrecord_extension_version'});
                    var is_newer = utils.compareSemverVersions(version, sdf_object.version);

                    if(!is_newer)
                    {
                        throw error.create({
                            name: 'ERROR_UPDATE_VERSION_MUST_BE_GREATER'
                        ,   message: 'Update version must be greater than previous installed versions'
                        });
                    }

                    return true;
                });
            }
        },

        validateInstallationInProgress: function validateInstallationInProgress(sdf_object)
        {
            var extensions_in_progress = JobToProcessHelper.getJobsToProcess(search.Sort.DESC, null, [
                ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.ERROR]
            ,   'and'
            ,   ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.DONE]
            ,   'and'
            ,   ['custrecord_ns_sc_extmech_type', search.Operator.IS, JobToProcessHelper.EXTENSION_JOB]
            ]);

            extensions_in_progress = _.where(_.pluck(extensions_in_progress, 'data'), {
                name: sdf_object.name,
                vendor: sdf_object.vendor,
                version: sdf_object.version
            });

            if(!_.isEmpty(extensions_in_progress))
            {
                throw error.create({
                    name: 'ERROR_INSTALLATION_IN_PROGRESS'
                ,   message: 'There is already an installation in progress for this vendor name and version'
                });
            }
        },

        isAnUpdate: function isAnUpdate(sdf_object)
        {
            var extensions = search.create({
                type : 'customrecord_ns_sc_extmech_extension'
            ,   filters :  [
                    ['name', search.Operator.IS, sdf_object.name]
                ,   'and'
                ,   ['custrecord_extension_vendor', search.Operator.IS,  sdf_object.vendor]
                ]
            ,   columns : ['custrecord_extension_version']
            }).run();

            return extensions && extensions.getRange({start: 0, end: 1}).length;
        },

        getBasepath: function getBasepath(manifest)
        {
            return manifest.path.substring(0, _.lastIndexOf(manifest.path, '/') + 1);
        },

        validateEntryPoints: function validateEntryPoints(sdf_object, resource, files_in_project)
        {
            if(!sdf_object[resource])
            {
                return;
            }

            var self = this;

            if(!sdf_object[resource].entrypoints)
            {
                throw error.create({
                    name: 'ERROR_MISSING_ENTRY_POINT'
                ,   message: 'Missing entry point in ' + resource
                });
            }

            _.each(sdf_object[resource].entrypoints, function(entry_point)
            {
                self.validateFilePathIsAbsolute(entry_point, sdf_object.basepath);

                entry_point = entry_point.replace(self.square_brackets_regex,'');
                if(!_.contains(files_in_project, entry_point))
                {
                    throw error.create({
                        name: 'ERROR_ENTRYPOINT_NOT_PRESENT_IN_SDF_PROJECT'
                    ,   message: entry_point + ' is not present on sdf project'
                    });
                }
            });
        },

        validateApplication: function validateApplication(sdf_object, resource)
        {
            if(sdf_object[resource])
            {
                if(!sdf_object[resource].application)
                {
                    throw error.create({
                        name: 'ERROR_MISSING_APPLICATION'
                    ,   message: 'Missing application in ' + resource
                    });
                }
                else if (sdf_object[resource].entrypoints)
                {
                    var applications = sdf_object[resource].application;
                    var entrypoints = sdf_object[resource].entrypoints;
                    _.each(applications || {}, function(app_data, app)
                    {
                        var isAppInEntryPoint = _.has(entrypoints, app);
                        if(!isAppInEntryPoint)
                        {
                            throw error.create({
                                name: 'ERROR_MISSING_APPLICATION_ENTRYPOINT'
                            ,   message: 'Missing application ' + app + ' in entrypoints of ' + resource
                            });
                        }
                    });
                }
            }
        },

        validateFilesObject: function validateFilesObject(sdf_object, resource, files_in_project)
        {
            var self = this;
            var files;

            if(!sdf_object[resource])
            {
                return;
            }

            var applications = sdf_object[resource].application;

            if(sdf_object[resource].files)
            {
                files = sdf_object[resource].files;
                self.validateFiles(files, sdf_object.basepath, files_in_project, resource);
            }
            else if(applications)
            {
                _.each(applications || {}, function(app_data)
                {
                    if(app_data.files)
                    {
                        files = app_data.files;
                        self.validateFiles(files, sdf_object.basepath, files_in_project, resource);
                    }
                });
            }
            else
            {
                _.each(sdf_object[resource], function (obj_data)
                {
                    if(obj_data.files)
                    {
                        files = obj_data.files;
                        self.validateFiles(files, sdf_object.basepath, files_in_project, resource);
                    }
                });
            }
        },

        validateFileExtension: function validateFileExtension(file, resource)
        {
            var resourceExtensionMap = {'javascript': ['js'], 'templates': ['tpl'], 'sass': ['scss'], 'configuration': ['json'],
            'ssplibraries': ['js'], 'skins': ['json'], 'suitescript2': ['ss', 'js']};

            var extension = file.filename.replace(this.file_extension_regex, '$1');

            if(resourceExtensionMap[resource] && !_.contains(resourceExtensionMap[resource], extension))
            {
                throw error.create({
                    name: 'ERROR_FILE_EXTENSION'
                ,   message: 'Wrong file extension in file '+ JSON.stringify(file)
                });
            }
        },

        validateFiles: function validateFiles(files, basepath, files_in_project, resource)
        {
            var self = this;
            var keys = _.keys(files);
            if(keys.length > 1 || !_.contains(keys, 'file'))
            {
                throw error.create({
                    name: 'ERROR_FILES'
                ,   message: 'Wrong structure on files. Must contain one tag file'
                });
            }

            files.file = _.isArray(files.file) ? files.file : [files.file];
            _.each(files.file, function(file_data)
            {
                self.validateFileContainsFilename(file_data);
                self.validateFilePathIsAbsolute(file_data, basepath);
                self.validateProjectFilesContainFile(files_in_project, file_data);
                self.validateFileExtension(file_data, resource);
            });
        },

        validateProjectFilesContainFile: function validateProjectFilesContainFile(files_in_project, file_data)
        {
            if(!_.contains(files_in_project, file_data.filename.replace(this.square_brackets_regex,'')))
            {
                throw error.create({
                    name: 'ERROR_FILE_NOT_PRESENT_IN_SDF_PROJECT'
                ,   message: file_data.filename + ' is not present on sdf project'
                });
            }
        },

        validateFileContainsFilename: function validateFileContainsFilename(file_data)
        {
            if(!_.contains(_.keys(file_data), 'filename'))
            {
                throw error.create({
                    name: 'ERROR_MISSING_FILENAME_FILE'
                ,   message: 'Missing filename in ' + JSON.stringify(file_data)
                });
            }
        },

        validateFilePathIsAbsolute: function validateFilePathIsAbsolute(file_data, basepath)
        {
            if(_.first(basepath) !== '/')
            {
                throw error.create({
                    name: 'ERROR_BASE_PATH_MUST_BE_ABSOLUTE'
                ,   message: basepath + ' basepath must be absolute (start with /)'
                });
            }

            var file_name = file_data.filename || file_data;

            if(_.first(file_name) !== '[' || _.last(file_name) !== ']')
            {
                throw error.create({
                    name: 'ERROR_FILE_PATHS_WRONG_FORMAT'
                ,   message: file_name + ' path must be wrapped by []'
                });
            }

            if(file_name.indexOf('[' + basepath) !== 0)
            {
                throw error.create({
                    name: 'ERROR_FILE_PATHS_MUST_BE_ABSOLUTE'
                ,   message: file_name + ' path must be absolute and relative to ' + basepath
                });
            }
        },

        validateFirstLevelElements: function validateFirstLevelElements(sdf_object, project_type)
        {
            if(!sdf_object.name)
            {
                throw error.create({
                    name: 'ERROR_MISSING_NAME'
                ,   message: 'Error missing name'
                });
            }
            if(!/^[\w]+$/i.test(sdf_object.name))
            {
                throw error.create({
                    name: 'ERROR_WRONG_NAME'
                ,   message: 'Name only allows alphanumeric and underscore characters'
                });
            }
            if(!sdf_object.vendor)
            {
                throw error.create({
                    name: 'ERROR_MISSING_VENDOR'
                ,   message: 'Error missing vendor'
                });
            }
            if(!/^[a-zA-Z0-9]*$/i.test(sdf_object.vendor))
            {
                throw error.create({
                    name: 'ERROR_WRONG_VENDOR'
                ,   message: 'Vendor only allows alphanumeric characters'
                });
            }
            if(!sdf_object.type)
            {
                throw error.create({
                    name: 'ERROR_MISSING_TYPE'
                ,   message: 'Error missing type'
                });
            }
            if(!_.contains(['extension', 'theme'], sdf_object.type))
            {
                throw error.create({
                    name: 'ERROR_TYPE_MUST_BE_THEME_OR_EXTENSION'
                ,   message: 'Error type must be theme or extension'
                });
            }
            if(!sdf_object.version)
            {
                throw error.create({
                    name: 'ERROR_MISSING_VERSION'
                ,   message: 'Error missing version'
                });
            }

            if(!utils.validSemver(sdf_object.version))
            {
                throw error.create({
                    name: 'ERROR_WRONG_VERSION'
                ,   message: 'Version number should follow this pattern 1.1.1'
                });
            }
            if(!sdf_object.target)
            {
                throw error.create({
                    name: 'ERROR_MISSING_TARGET'
                ,   message: 'Error missing target'
                });
            }
            var targets = sdf_object.target.split(',');
            var invalidTargets = _.filter(targets, function(target)
            {
                return !_.contains(['SCA', 'SCS', 'SCIS'], target);
            });

            if(invalidTargets.length > 0)
            {
                throw error.create({
                    name: 'ERROR_TARGET_UNKNOWN'
                ,   message: 'Error target must be SCA SCS or SCIS'
                });
            }
            if((sdf_object.target.indexOf('SCIS') > 0) && sdf_object.type === 'theme')
            {
                throw error.create({
                    name: 'ERROR_TARGET_TYPE'
                ,   message: 'Error target SCIS and type theme are nos compatible'
                });
            }

            if(sdf_object.target_version)
            {
                _.each(sdf_object.target_version, function (target_version, target)
                {
                    if(!_.contains(targets, target))
                    {
                        throw error.create({
                            name: 'ERROR_TARGET_UNKNOWN'
                        ,   message: 'Error unknown target ' + target
                        });
                    }

                    if(!utils.validSemverRange(target_version))
                    {
                        throw error.create({
                            name: 'ERROR_INVALID_TARGET_VERSION'
                        ,   message: 'Error invalid target version of ' + target
                        });
                    }
                });
            }

            if(!sdf_object.scriptid)
            {
                throw error.create({
                    name: 'ERROR_MISSING_SCRIPTID'
                ,   message: 'Error missing scriptid'
                });
            }
            if(!sdf_object.basepath)
            {
                throw error.create({
                    name: 'ERROR_MISSING_BASEPATH'
                ,   message: 'Error missing basepath'
                });
            }
            var firstFolder = sdf_object.basepath.indexOf('/') === 0 ? sdf_object.basepath.split('/')[1] : sdf_object.basepath.split('/')[0];

            if(!(firstFolder === 'SuiteApps' && project_type === 'SUITEAPP')  &&
            !(firstFolder === 'SuiteScripts' && project_type === 'ACCOUNTCUSTOMIZATION'))
            {
                throw error.create({
                    name: 'ERROR_BASEPATH'
                ,   message: 'Error root folder must be SuiteApps if project type is SuiteApp or SuiteScripts if project type is ACP'
                });
            }
            if(sdf_object.type === 'extension')
            {
                if(sdf_object.skins || sdf_object.overrides)
                {
                    this._addWarning(sdf_object, 'WARNING: SKINS OR OVERRIDES CANT BE PRESENT IN EXTENSION');
                }
            }
            else if(sdf_object.type === 'theme')
            {
                if(sdf_object.javascript || sdf_object.ssplibraries || sdf_object.suitescript2)
                {
                    this._addWarning(sdf_object, 'WARNING: JAVASCRIPT OR SSPLIBRARIES OR SUITE SCRIPT 2 CANT BE PRESENT IN A THEME');
                }
            }

            if(sdf_object.assets)
            {
                this.validateAssets(sdf_object);
            }
        },

        _addWarning: function _addWarning(sdf_object, warningText)
        {
            sdf_object.warnings = sdf_object.warnings || [];
            sdf_object.warnings.push(warningText);
        },

        validateEmptyResources: function validateEmptyResources(sdf_object)
        {
            var self = this;
            _.each(sdf_object, function(value, resource)
            {
                if(_.isEmpty(value))
                {
                    self._addWarning(sdf_object, 'WARNING: EMPTY RESOURCE ' + resource);
                }
            });
        },

        validateAssets: function validateAssets(sdf_object)
        {
            var assets = sdf_object.assets
            , self = this;

            _.each(assets, function(asset, asset_name)
            {
               var files = assets.files && asset.files.file;
               files = _.isArray(files) ? files : [files];

                _.each(files, function(file)
                {
                    if(!_.isEmpty(file))
                    {
                        var splittedPath = file.filename.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, '').split('/');

                        if(splittedPath[0] !== 'assets')
                        {
                            throw error.create({
                                name: 'ERROR_INCORRECT_ASSETS_PATH'
                                ,   message: 'Error in assets path, missing assets on path'
                            });
                        }

                        if(splittedPath[1] !== asset_name)
                        {
                            throw error.create({
                                name: 'ERROR_INCORRECT_ASSETS_PATH'
                                ,   message: 'Error in assets path, file path must be  ' + sdf_object.basepath + 'assets/' + asset_name + '/' + splittedPath[2]
                            });
                        }
                    }
                });
            });
        },

        validateOverrides: function validateOverrides(sdf_object)
        {
            var self = this;

            if(!sdf_object.overrides)
            {
                return;
            }

            if(!sdf_object.overrides.override)
            {
                throw error.create({
                    name: 'ERROR_OVERRIDE_MISSING_IN_OVERRIDES'
                ,   message: 'Error override missing in overrides'
                });
            }

            _.each(sdf_object.overrides, function(override_data)
            {
                var data = _.isArray(override_data) ? override_data : [override_data];
                _.each(data, function(override)
                {
                    self._validateOverride(override);
                });
            });
        },

        _validateOverride: function _validateOverride(override_data)
        {
            if(!override_data.src || !override_data.dst)
            {
                throw error.create({
                    name: 'ERROR_MISSING_SRC_OR_DST_IN_OVERRIDE'
                ,   message: 'Error missing src or dst in override ' + JSON.stringify(override_data)
                });
            }

            var srcExtension = override_data.src.replace(this.file_extension_regex, '$1');
            var dstExtension = override_data.dst.replace(/.+\.([^\.]+)$/, '$1');

            if(srcExtension !== dstExtension)
            {
                throw error.create({
                    name: 'ERROR_OVERRIDE_SRC_DST_EXTENSIONS_ARE_DIFFERENT'
                ,   message: 'Error override src and dst extensions must be the same ' + JSON.stringify(override_data)
                });
            }
        },

        validateSkins: function validateSkins(sdf_object, files_in_project)
        {
            var self = this;
            if(!sdf_object.skins)
            {
                return;
            }

            if(!sdf_object.skins.skin)
            {
                throw error.create({
                    name: 'ERROR_SKIN_MISSING_IN_SKINS'
                ,   message: 'Error skin missing in skins'
                });
            }

            _.each(sdf_object.skins, function(skin_data)
            {
                var data = _.isArray(skin_data) ? skin_data : [skin_data];
                _.each(data, function(skin)
                {
                    self._validateSkin(skin, sdf_object.basepath, files_in_project);
                });
            });
        },

        _validateSkin: function _validateSkin(skin_data, basepath, files_in_project)
        {
            if(!skin_data.name || !skin_data.file)
            {
                throw error.create({
                    name: 'ERROR_MISSING_NAME_OR_FILE_IN_SKIN'
                ,   message: 'Error missing name or file in skin ' + JSON.stringify(skin_data)
                });
            }

            this.validateFileContainsFilename(skin_data.file);
            this.validateFilePathIsAbsolute(skin_data.file, basepath);

            if(!_.contains(files_in_project, skin_data.file.filename.replace(this.square_brackets_regex,'')))
            {
                throw error.create({
                    name: 'ERROR_SKIN_NOT_PRESENT_IN_SDF_PROJECT'
                ,   message: skin_data.file.filename + ' is not present on sdf project'
                });
            }
        },

        _converToManifest: function _converToManifest(sdf_object)
		{
            var self = this;
            var em_manifest = {};

            em_manifest.scriptid = sdf_object.scriptid;
            this._handleFirstLevelElements(sdf_object, em_manifest);

            var resources = {
                'javascript': this._handleJSAndTemplatesProcesses,
                'templates': this._handleJSAndTemplatesProcesses,
                'sass': this._handleProcesses,
                'assets': this._handleAssetsProcess,
                'suitescript2': this._handleProcesses,
                'configuration': this._handleProcesses,
                'ssplibraries': this._handleProcesses,
                'skins': this._handleSkins,
                'overrides': this._handleOverrides
            };

            _.each(resources, function(resource_data, resource)
            {
                self._handleEntrypoints(sdf_object, em_manifest, resource);
                resource_data.call(self, sdf_object, em_manifest, resource);
            });

            return em_manifest;
        },

        createManifest: function createManifest(sdf_object)
        {
            var manifest = this._converToManifest(sdf_object);

            var manifest_file = File.create({
                name    : 'manifest.json',
                fileType: File.Type.JSON,
                contents: JSON.stringify(manifest, null, 4)
            });

            manifest_file.folder = this.getExtensionsFolderId(sdf_object.basepath);
            manifest.id = manifest_file.save();

            if(!manifest_file || !manifest.id)
            {
                throw error.create({
                    name: 'ERROR_CREATING_MANIFEST'
                ,   message: 'Error creating manifest'
                });
            }

            return manifest;
        },

        createSkins: function createSkins(skins, theme_id)
        {
            if(skins)
            {
                var self = this;
                skins = skins.skin;
                skins = _.isArray(skins) ? skins : [skins];

                _.each(skins, function (skin_data)
                {
                    var skin_file = File.load(skin_data.file.filename.replace(self.square_brackets_regex,''));
                    var skin = {name: skin_data.name, file: skin_file.id, theme: theme_id};
                    SkinHelper.createSkin(skin);
                });
            }
        },

        updateSkins: function updateSkins(skins, theme_id)
        {
            var existing_skins = SkinHelper.searchSkins(null, theme_id);
            existing_skins = _.indexBy(existing_skins, 'name');

            if(skins)
            {
                skins = skins.skin;
                skins = _.isArray(skins) ? skins : [skins];

                var self = this;
                _.each(skins, function (skin_data)
                {
                    var skin_record = existing_skins[skin_data.name];
                    var skin_file = skin_data.file.filename;

                    var skin = {name: skin_data.name, theme: theme_id};

                    if(skin_record)
                    {
                        skin.skin_id = skin_record.skin_id;
                        var skin_data_filename = skin_data.file.filename.replace(/^\[?.+\/(\w+\.\w+)\]?$/, '$1');

                        if(skin_record.filename !== skin_data_filename)
                        {
                            skin_file = File.load(skin_data.file.filename.replace(self.square_brackets_regex,''));
                            skin.file = skin_file.id;
                            SkinHelper.updateSkin(skin);
                        }

                        delete existing_skins[skin_data.name];
                    }
                    else
                    {
                        skin_file = File.load(skin_data.file.filename.replace(self.square_brackets_regex,''));
                        skin.file = skin_file.id;
                        SkinHelper.createSkin(skin);
                    }
                });
            }

            _.each(existing_skins, function(skin)
            {
                SkinHelper.deleteSkin(skin.skin_id);
            });

        },

        _handleFirstLevelElements: function _handleFirstLevelElements(sdf_object, em_manifest)
        {
            em_manifest.scriptid = sdf_object.scriptid;
            em_manifest.name = sdf_object.name;
            em_manifest.fantasyName = sdf_object.fantasyname;
            em_manifest.vendor = sdf_object.vendor;
            em_manifest.type = sdf_object.type;
            em_manifest.version = sdf_object.version;
            em_manifest.target = sdf_object.target;
            em_manifest.target_version = sdf_object.target_version;
            em_manifest.description = sdf_object.description;
        },

        _handleEntrypoints: function _handleEntrypoints(sdf_object, em_manifest, resource)
        {
            if(sdf_object[resource] && sdf_object[resource].entrypoints)
            {
                var em_resource = ManifestResourceNameHelper.getSDFToEMResourceMap()[resource] || resource
                ,   self = this;

                em_manifest[em_resource] = em_manifest[em_resource] || {};
                em_manifest[em_resource].entry_points = em_manifest[em_resource].entry_points || {};
                var sdf_em_resource_map = ManifestResourceNameHelper.getSDFToEMResourceMap();

                _.each(sdf_object[resource].entrypoints, function(entrypoint_data, entrypoint)
                {
                    var em_entry_point = sdf_em_resource_map[entrypoint] || entrypoint;
                    em_manifest[em_resource].entry_points[em_entry_point] = entrypoint_data.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, '');
                });
            }
        },

        _handleJSAndTemplatesProcesses: function _handleJSAndTemplatesProcesses(sdf_object, em_manifest, resource)
        {
            if(!sdf_object[resource])
            {
                return;
            }

            em_manifest[resource] = em_manifest[resource] || {};

            var applications = sdf_object[resource].application
            ,   self = this;
            _.each(applications || {}, function(app_data, app)
            {
                if(!app_data)
                {
                    return;
                }

                em_manifest[resource].application = em_manifest[resource].application || {};
                em_manifest[resource].application[app] = em_manifest[resource].application[app] || {};
                em_manifest[resource].application[app].files = [];

                var files = app_data.files.file;
                files = _.isArray(files) ? files : [files];

                _.each(files, function(file)
                {
                    var filename = file.filename.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, '');
                    em_manifest[resource].application[app].files.push(filename);
                });

                if(sdf_object[resource].entrypoints)
                {
                    var entrypoint_path = sdf_object[resource].entrypoints[app].replace(self.square_brackets_regex,'').replace(sdf_object.basepath, '');
                    em_manifest[resource].application[app].files.push(entrypoint_path);
                }
            });
        },

        _handleProcesses: function _handleProcesses(sdf_object, em_manifest, resource)
        {
            if(!sdf_object[resource])
            {
                return;
            }

            var em_resource = ManifestResourceNameHelper.getSDFToEMResourceMap()[resource] || resource;

            em_manifest[em_resource] = em_manifest[em_resource] || {};

            em_manifest[em_resource].files = [];

            var files = sdf_object[resource].files.file
            , self = this;
            files = _.isArray(files) ? files : [files];

            _.each(files, function (file)
            {
                if(file)
                {
                    var filename = file.filename.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, '');
                    em_manifest[em_resource].files.push(filename);
                }
            });
            em_manifest[em_resource].files = _.uniq(em_manifest[em_resource].files);

            var entrypoints = sdf_object[resource].entrypoints || sdf_object[resource].entrypoint;

            if(entrypoints)
            {
                entrypoints = _.isString(entrypoints) ? [entrypoints] : entrypoints;

                _.each(entrypoints, function(entrypoint_data)
                {
                    em_manifest[em_resource].files.push(entrypoint_data.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, ''));
                });
                em_manifest[em_resource].files = _.uniq(em_manifest[em_resource].files);
            }
        },

        _handleAssetsProcess: function _handleAssetsProcess(sdf_object, em_manifest, resource)
        {
            if(!sdf_object[resource])
            {
                return;
            }

            em_manifest[resource] = em_manifest[resource] || {};
            var self = this;

            _.each(sdf_object[resource], function(asset_data, asset)
            {
                var files = asset_data.files && asset_data.files.file;
                files = _.isArray(files) ? files : [files];
                em_manifest[resource][asset] = em_manifest[resource][asset] || {files: []};
                _.each(files, function (file)
                {
                    if(file && file.filename)
                    {
                        var filename = file.filename.replace(self.square_brackets_regex,'');
                        em_manifest[resource][asset].files.push(filename.replace(sdf_object.basepath, ''));
                    }
                });
            });
        },

        _handleSkins: function _handleSkins(sdf_object, em_manifest, resource)
        {
            if(!sdf_object[resource])
            {
                return;
            }

            em_manifest[resource] = em_manifest[resource] || [];
            var skins = _.isArray(sdf_object[resource].skin) ? sdf_object[resource].skin : [sdf_object[resource].skin]
            ,   self = this;

            _.each(skins, function (skin_data)
            {
                var skin = {name: skin_data.name, file: skin_data.file.filename.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, '')};
                em_manifest[resource].push(skin);
            });
        },

        _handleOverrides: function _handleOverrides(sdf_object, em_manifest, resource)
        {
            if(!sdf_object[resource])
            {
                return;
            }

            em_manifest[resource] = em_manifest[resource] || [];
            var overrides_obj = sdf_object[resource].override;
            var overrides = _.isArray(overrides_obj) ? overrides_obj : [overrides_obj]
            ,   self = this;

            _.each(overrides, function (override_data)
            {
                em_manifest[resource].push({src: override_data.src.replace(self.square_brackets_regex,'').replace(sdf_object.basepath, ''), dst: override_data.dst});
            });
        },

        getExtensionsFolderId: function getExtensionsFolderId(extension_path)
        {
            var folders_map = {
                    'SuiteApps': '-19'
                ,   'SuiteScripts': '-15'
                }
            ,   parent_id;

            var extension_path_array = extension_path.split('/');
            _.each(extension_path_array, function(folder_name)
            {
                if(!parent_id)
                {
                    parent_id = folders_map[folder_name];
                    return;
                }

                if(folder_name)
                {
                    parent_id = FileApi.searchFolder(folder_name, parent_id);
                }
            });

            if(!parent_id)
            {
                throw error.create({
                    name: 'ERROR_SEARCHING_EXTENSION_FOLDER_ID'
                ,   message: 'Error searching extension folder id'
                });
            }

            return parent_id;
        },

        getSupportedTargetsIds: function getSupportedTargetsIds(manifest_targets)
        {
            return ExtensionHelper.getSupportedTargetsIds(manifest_targets);
        },

        createRecordToProcess: function createRecordToProcess(manifest, manifest_id, suiteapp_id)
        {
            var data = {
                name: manifest.name,
                vendor: manifest.vendor,
                version: manifest.version,
                type: manifest.type.replace(/^./, manifest.type[0].toUpperCase()),
                fantasy_name: manifest.fantasyName || manifest.name,
                manifest: manifest_id,
                bundle_id: suiteapp_id,
                target: manifest.target,
                description: manifest.description || ' ',
                target_version: manifest.target_version
            };

            JobToProcessHelper.createJobToProcess(JobToProcessHelper.EXTENSION_JOB, JobToProcessHelper.PENDING, data);
        },

        getManifestIdByScriptId: function getManifestIdByScriptId(script_id)
        {
            var extensions = ExtensionHelper.getExtensionsByScriptId(script_id);
            var latest_extension = ExtensionHelper.getLatestExtension(extensions);

            if (!latest_extension)
			{
                throw error.create({
                    name: 'SCE_EXTENSION_INVALID_SCRIPT_ID'
                ,   message: 'Could not find the Extension with script id: ' + script_id
                });
            }

            var manifest_id = latest_extension.manifest_id;

            if(!manifest_id)
            {
                throw error.create({
                    name: 'SCE_EXTENSION_INVALID_SCRIPT_ID'
                ,   message: 'Could not find the manifest in extension with script id: ' + script_id
                });
            }

            return manifest_id;
        },

        convertManifestToSDFFormat: function convertManifestToSDFFormat(em_manifest, basepath)
        {
            var self = this;
            var sdf_manifest = {};

            sdf_manifest.basepath = _.first(basepath) === '/' ? basepath : '/' + basepath;

            this._convertFirstLevelElementsToSDFFormat(em_manifest, sdf_manifest);

            var resources = {
                'javascript': this._convertJSAndTemplatesToSDFFormat,
                'templates': this._convertJSAndTemplatesToSDFFormat,
                'sass': this._convertResourceFilesToSDFFormat,
                'assets': this._convertAssetsProcessToSDFFormat,
                'suitescript2': this._convertResourceFilesToSDFFormat,
                'configuration': this._convertResourceFilesToSDFFormat,
                'ssp-libraries': this._convertResourceFilesToSDFFormat,
                'skins': this._convertSkinsToSDFFormat,
                'overrides': this._convertOverridesToSDFFormat
            };

            _.each(resources, function(resource_data, resource)
            {
                self._convertEntryPointsToSDFFormat(em_manifest, sdf_manifest, resource);
                resource_data.call(self, em_manifest, sdf_manifest, resource);
            });

            return sdf_manifest;
        },

        _convertFirstLevelElementsToSDFFormat: function _convertFirstLevelElementsToSDFFormat(em_manifest, sdf_manifest)
        {
            sdf_manifest.name = em_manifest.name;
            sdf_manifest.fantasyname = em_manifest.fantasyName;
            sdf_manifest.vendor = em_manifest.vendor;
            sdf_manifest.type = em_manifest.type;
            sdf_manifest.version = em_manifest.version;
            sdf_manifest.target = em_manifest.target;
            sdf_manifest.target_version = em_manifest.target_version;
            sdf_manifest.description = em_manifest.description;
        },

        _formatFilename: function _formatFilename(path, dont_wrap)
        {
            path = _.first(path) === '/' ? path : '/' + path;
            path =  '[' + path + ']';

            return dont_wrap ? path : {filename: path};
        },

        _convertEntryPointsToSDFFormat: function _convertEntryPointsToSDFFormat(em_manifest, sdf_manifest, resource)
        {
            var self = this;

            if(!em_manifest[resource] || !em_manifest[resource].entry_points)
            {
                return;
            }

            var sdf_resource = ManifestResourceNameHelper.getEMToSDFResourceMap()[resource] || resource;

            sdf_manifest[sdf_resource] = sdf_manifest[sdf_resource] || {};
            sdf_manifest[sdf_resource].entrypoints = sdf_manifest[sdf_resource].entrypoints || {};

            _.each(em_manifest[resource].entry_points, function(entrypoint_data, entrypoint)
            {
                var sdf_entry_point = ManifestResourceNameHelper.getEMToSDFResourceMap()[entrypoint] || entrypoint;
                sdf_manifest[sdf_resource].entrypoints[sdf_entry_point] = self._formatFilename(sdf_manifest.basepath + entrypoint_data, true);
            });
        },

        _convertJSAndTemplatesToSDFFormat: function _convertJSAndTemplatesToSDFFormat(em_manifest, sdf_manifest, resource)
        {
            var self = this;
            if(!em_manifest[resource])
            {
                return;
            }

            sdf_manifest[resource] = sdf_manifest[resource] || {};

            var manifest_entry_points = _.values(em_manifest[resource].entry_points || {});

            var applications = em_manifest[resource].application;
            _.each(applications || {}, function(app_data, app)
            {
                if(!app_data)
                {
                    return;
                }

                sdf_manifest[resource].application = sdf_manifest[resource].application || {};
                sdf_manifest[resource].application[app] = sdf_manifest[resource].application[app] || {};
                sdf_manifest[resource].application[app].files = sdf_manifest[resource].application[app].files || {};
                sdf_manifest[resource].application[app].files.file = sdf_manifest[resource].application[app].files.file || [];

                _.each(app_data.files, function(file)
                {
                    if(!_.contains(manifest_entry_points, file))
                    {
                        sdf_manifest[resource].application[app].files.file.push(self._formatFilename(sdf_manifest.basepath + file));
                    }
                });
            });
        },

        _convertResourceFilesToSDFFormat: function _convertResourceFilesToSDFFormat(em_manifest, sdf_manifest, resource)
        {
            if(!em_manifest[resource])
            {
                return;
            }

            var sdf_resource = ManifestResourceNameHelper.getEMToSDFResourceMap()[resource] || resource;

            sdf_manifest[sdf_resource] = sdf_manifest[sdf_resource] || {};

            sdf_manifest[sdf_resource].files = sdf_manifest[sdf_resource].files || {};
            sdf_manifest[sdf_resource].files.file = sdf_manifest[sdf_resource].files.file || [];

            var manifest_entry_points = _.values(em_manifest[resource].entry_point || em_manifest[resource].entry_points || {})
            , self = this;

            _.each(em_manifest[resource].files, function (file)
            {
                if(!_.contains(manifest_entry_points, file))
                {
                    var filepath = sdf_manifest.basepath + file;
                    sdf_manifest[sdf_resource].files.file.push(self._formatFilename(filepath));
                }
            });

            if(_.isEmpty(sdf_manifest[sdf_resource].files))
            {
                delete sdf_manifest[sdf_resource].files;
            }
        },

        _convertAssetsProcessToSDFFormat: function _convertAssetsProcessToSDFFormat(em_manifest, sdf_manifest, resource)
        {
            var self = this;
            if(em_manifest[resource])
            {
                sdf_manifest[resource] = sdf_manifest[resource] || {};

                _.each(em_manifest[resource], function (asset_data, asset)
                {
                    var files = asset_data.files;
                    files = _.isArray(files) ? files : [files];
                    sdf_manifest[resource][asset] = sdf_manifest[resource][asset] || {};
                    sdf_manifest[resource][asset].files = sdf_manifest[resource][asset].files || {};
                    sdf_manifest[resource][asset].files.file = sdf_manifest[resource][asset].files.file || [];

                    _.each(files, function (file)
                    {
                        var filepath = sdf_manifest.basepath + 'assets/' + file;
                        sdf_manifest[resource][asset].files.file.push(self._formatFilename(filepath));
                    });

                    if(_.isEmpty(sdf_manifest[resource][asset].files))
                    {
                        delete sdf_manifest[resource][asset].files;
                    }
                });
            }
        },

        _convertSkinsToSDFFormat: function _convertSkinsToSDFFormat(em_manifest, sdf_manifest, resource)
        {
            var self = this;
            if(em_manifest[resource])
            {
                sdf_manifest[resource] = sdf_manifest[resource] || {};
                sdf_manifest[resource].skin = sdf_manifest[resource].skin || [];

                _.each(em_manifest[resource], function (skin_data)
                {
                    var skin = {name: skin_data.name, file: self._formatFilename(sdf_manifest.basepath + skin_data.file)};
                    sdf_manifest[resource].skin.push(skin);
                });
            }
        },

        _convertOverridesToSDFFormat: function _convertOverridesToSDFFormat(em_manifest, sdf_manifest, resource)
        {
            if(em_manifest[resource])
            {
                sdf_manifest[resource] = sdf_manifest[resource] || {};
                sdf_manifest[resource].override = sdf_manifest[resource].override || [];

                _.each(em_manifest[resource], function (override_data)
                {
                    sdf_manifest[resource].override.push({src: '[' + sdf_manifest.basepath + override_data.src + ']', dst: override_data.dst});
                });
            }
        }
    };

    return plugin_implementation_helper;
});
