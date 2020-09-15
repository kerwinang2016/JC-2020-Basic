/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

/*jshint funcscope:true */
define(
    [
        'N/runtime'
    ,   'N/file'
    ,   'N/search'
    ,   'N/record'
    ,   'N/util'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../../CommonUtilities/ErrorHandler'
    ,   '../../ExtensionMechanism.Server/Helpers/JobToProcessHelperSS2'
    ]
,   function(
        runtime
    ,   file
    ,   search
    ,   record
    ,   util
    ,   utils
    ,   error_handler
    ,   JobToProcessHelper
    )
{
    var SCExtension = {

        getBundleIds : function getBundleIds()
        {
            var script = runtime.getCurrentScript();
            return script.bundleIds || [];
        }

    ,   _getExtensionFolders: function _getExtensionFolders(bundle_id, folder_bundle_id)
        {
            var folders = [];
            // Search for the folder of the Extension to get the name
            var folder_extension = search.create({
                type : search.Type.FOLDER
            ,   filters :  [['parent', search.Operator.IS, folder_bundle_id]]
            ,   columns : ['name']
            }).run();

            folder_extension.each(function(result)
            {
                var folder_extension_name = result.getValue({name : 'name'});
                folders.push(folder_extension_name);
                return true;
            });

            return folders;
        }

    ,   afterInstall: function afterInstall(folder_extension)
        {
            var self = this;
            // Search the folder of the bundle where the Extension was installed, under the 'SuiteBundles' (-16) folder
            // The name of the folder will be 'Bundle XXXX', where XXXX is the bundle ID
            var bundle_ids = this.getBundleIds();
            var has_bundle_processed = false;
            var error_result;

            util.each(bundle_ids, function(bundle_id)
            {
                try
                {
                    var folder_bundle = search.create({
                         type : search.Type.FOLDER
                     ,   filters : [
                            ['parent', search.Operator.IS, -16]
                        ,   'and'
                        ,   ['name', search.Operator.IS, 'Bundle ' + bundle_id]
                        ]
                     })
                    .run()
                    .getRange({start: 0, end: 1});

                    if (!folder_bundle || !folder_bundle[0])
                    {
                        throw error_handler.handleError({
                            code: 'EXTMECH_INSTALL_SCRIPT',
                            line: 'SCExtMechAPISS2.js/afterInstall',
                            description: 'Could not find the bundle folder at SuiteBundles/Bundle ' + bundle_id + '.',
                            error: {
                                name: 'SCE_BUNDLE_MISSING_FOLDER'
                            }
                        }, true);
                    }

                    var folder_bundle_id = folder_bundle[0].id;
                    folder_extension = folder_extension && folder_extension.length ? folder_extension : null;
                    folder_extension = folder_extension || self._getExtensionFolders(bundle_id, folder_bundle_id);

                    // The Extension should have at least one folder
                    if (!folder_extension || !folder_extension.length)
                    {
                        throw error_handler.handleError({
                            code: 'EXTMECH_INSTALL_SCRIPT',
                            line: 'SCExtMechAPISS2.js/afterInstall',
                            description: 'The extension inside SuiteBundles/Bundle ' + bundle_id + ' must have at least one folder.',
                            workaround: 'Check that your extension has a main folder inside SuiteBundles/Bundle ' + bundle_id + ' named with the format "name@version".',
                            error: {
                                name: 'SCE_EXTENSION_WRONG_STRUCTURE'
                            }
                        }, true);
                    }

                    var has_manifest = false
                    ,   is_there_new_version = false
                    ,   last_manifest_checked = null;

                    var bundleFolder = utils.getBundleFolderPath(folder_bundle_id);
                    for(var j = 0; j < folder_extension.length; j++)
                    {
                        var path = bundleFolder + '/' + folder_extension[j];
                        var manifest;

                        try
                        {
                            manifest = file.load({id: path + '/manifest.json'});
                        }
                        catch(error)
                        {
                            //If there is no manifest ignore the folder
                            return true;
                        }

                        has_manifest = true;

                        var manifest_id = manifest.id;
                        var manifest_json = JSON.parse(manifest.getContents());

                        manifest_json.manifest_id = manifest_id;
                        manifest_json.bundle_id = bundle_id;

                        var required_fields = manifest_json.vendor && manifest_json.name && manifest_json.version && manifest_json.type && manifest_json.target;

                        if (!required_fields)
                        {
                            throw error_handler.handleError({
                                code: 'EXTMECH_INSTALL_SCRIPT',
                                line: 'SCExtMechAPISS2.js/afterInstall',
                                description: 'Missing manifest.json information: vendor, name, version, type and target are mandatory.\n' +
                                        'Received' +
                                        '\nname: ' +  manifest_json.name +
                                        '\nvendor: ' + manifest_json.vendor +
                                        '\nversion: ' + manifest_json.version +
                                        '\ntype: ' + manifest_json.type +
                                        '\ntarget: ' + manifest_json.target + '.' +
                                        '\nBundle ID: ' + manifest_json.bundle_id + '.',
                                workaround: 'Please check these fields inside the manifest.json file of the extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.',
                                error: {
                                    name: 'SCE_MANIFEST_INCOMPLETE'
                                }
                            }, true);
                        }

                        if (!utils.validSemver(manifest_json.version))
                        {
                            throw error_handler.handleError({
                                code: 'EXTMECH_INSTALL_SCRIPT',
                                line: 'SCExtMechAPISS2.js/afterInstall',
                                description: 'Invalid version format in ' + manifest_json.version + '. It must be MAJOR.MINOR.PATCH where each of them are numbers.',
                                workaround: 'Check the manifest.json version for extension at Bundle ID: ' + manifest_json.bundle_id +
                                        '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.',
                                error: {
                                    name: 'SCE_MANIFEST_VERSION_INVALID_FORMAT'
                                }
                            }, true);
                        }

                        util.each(manifest_json.target_version || {}, function(target_version, target)
                        {
                            if (!utils.validSemverRange(target_version))
                            {
                                throw error_handler.handleError({
                                    code: 'EXTMECH_INSTALL_SCRIPT',
                                    line: 'SCExtMechAPISS2.js/afterInstall',
                                    description: 'Invalid target version format of '+ target + ': ' + target_version + '. It must be a valid semver range',
                                    workaround: 'Check the manifest.json target_version for extension at Bundle ID: ' + manifest_json.bundle_id +
                                        '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.',
                                    error: {name: 'SCE_MANIFEST_VERSION_INVALID_FORMAT'}
                                }, true);
                            }
                        });

                        if (manifest_json.type === 'theme' && manifest_json.skins && manifest_json.skins.length)
                        {
                            for(var i = 0; i < manifest_json.skins.length; i++)
                            {
                                var skin = manifest_json.skins[i];

                                required_fields = skin && skin.name && skin.file;

                                if (!required_fields)
                                {
                                     throw error_handler.handleError({
                                        code: 'EXTMECH_INSTALL_SCRIPT',
                                        line: 'SCExtMechAPISS2.js/afterInstall',
                                        description: 'Missing Skin information (name or file)',
                                        workaround: 'Received skin name: ' + (skin && skin.name) + ', skin file: ' + (skin && skin.file) +
                                            '.\nCheck the manifest.json skins section for extension at Bundle ID: ' + manifest_json.bundle_id +
                                                '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.',
                                        error: {
                                            name: 'SCE_MANIFEST_INCOMPLETE'
                                        }
                                    }, true);
                                }

                                try{
                                    var  skin_path = path + '/' + skin.file;
                                    file.load({id: skin_path});
                                }
                                catch(error)
                                {
                                    throw error_handler.handleError({
                                        code: 'EXTMECH_INSTALL_SCRIPT',
                                        line: 'SCExtMechAPISS2.js/afterInstall',
                                        description: 'The skin file "' + skin_path + '" was not found.',
                                        workaround: 'Check that the skin ' + skin.file + ' is correctly included inside the theme (usually all the skins are inside a folder called "skins") and check in the manifest.json --> skins section if the file path is correct .' +
                                                'Bundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.',
                                        error: {
                                            name: 'SCE_SKIN_NOEXISTS'
                                        }
                                    }, true);
                                }
                            }
                        }

                        if (manifest_json.cct)
                        {
                            if (Object.prototype.toString.call(manifest_json.cct) !== '[object Array]')
                            {
                                manifest_json.cct.label = manifest_json.cct.label || manifest_json.fantasyName || manifest_json.name;
                                manifest_json.cct = [manifest_json.cct];
                            }

                            for ( i = 0; i < manifest_json.cct.length; i++)
                            {
                                var cct_json = manifest_json.cct[i];

                                required_fields = required_fields && cct_json.settings_record && cct_json.registercct_id && cct_json.label;

                                if (!required_fields)
                                {
                                     throw error_handler.handleError({
                                        code: 'EXTMECH_INSTALL_SCRIPT',
                                        line: 'SCExtMechAPISS2.js/afterInstall',
                                        description: 'Missing CCT information (setting_record, registercct_id or label)',
                                        workaround: 'Check that the manifest.json -> cct section. The fields settings_record, registercct_id and label are mandatory.' +
                                        '\nReceived' +
                                        '\nsettings_record: ' + cct_json.settings_record +
                                        '\nregistercct_id ' + cct_json.registercct_id +
                                        '\nlabel ' + cct_json.label +
                                        '\nfor extension with Bundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.',
                                        error: {
                                            name: 'SCE_MANIFEST_INCOMPLETE'
                                        }
                                    }, true);
                                }

                                if (cct_json.label.length > 18)
                                {
                                    throw error_handler.handleError({
                                        code: 'EXTMECH_INSTALL_SCRIPT',
                                        line: 'SCExtMechAPISS2.js/afterInstall',
                                        description: 'The maximum number of characters for the CCT label is 18. ' + cct_json.label + ' is ' + cct_json.label.length + ' characters long.',
                                        workaround: 'Check the manifest.json -> cct section -> label field for extension with Bundle ID: ' +
                                            manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.',
                                        error: {
                                            name: 'SCE_MANIFEST_INCOMPLETE'
                                        }
                                    }, true);
                                }

                                if (!self._getContentTypeid(cct_json.settings_record))
                                {
                                    try
                                    {
                                        record.create({type: cct_json.settings_record});
                                    }
                                    catch(error)
                                    {
                                        throw error_handler.handleError({
                                            code: 'EXTMECH_INSTALL_SCRIPT',
                                            line: 'SCExtMechAPISS2.js/afterInstall',
                                            description: 'The record "' + cct_json.settings_record + '" does not exists',
                                            workaround: 'The manifest.json -> cct section -> settings_record indicates that a custom record with id ' + cct_json.settings_record  +
                                                ' must be added with the Extension. However it was not found in the bundle.' +
                                                '\nBundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.',
                                            error: {
                                                name: 'SCE_SETTINGRECORD_NOEXISTS'
                                            }
                                        }, true);
                                    }
                                }
                            }
                        }

						if (manifest_json.page && manifest_json.page.types)
						{
							var types = manifest_json.page.types;

							for (i = 0; i < types.length; i++)
							{
								var type = types[i];

								required_fields = required_fields && type.name && type.displayName;

								if (!required_fields)
								{
									throw error_handler.handleError({
                                        code: 'EXTMECH_INSTALL_SCRIPT',
                                        line: 'SCExtMechAPISS2.js/afterInstall',
                                        description: 'Missing PageType information ("name" or "displayName")',
                                        workaround: 'Check that the manifest.json -> "page" section. The fields "name", "displayName" are mandatory.' +
                                        '\nReceived' +
                                        '\nname: ' + type.name +
                                        '\ndisplayName ' + type.displayName +
                                        '\nfor extension with Bundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.',
                                        error: {
                                            name: 'SCE_MANIFEST_INCOMPLETE'
                                        }
                                    }, true);
								}

								if (type.settingsRecord)
								{
                                    try
                                    {
                                        record.create({type: type.settingsRecord});
                                    }
                                    catch(error)
                                    {
                                        throw error_handler.handleError({
                                            code: 'EXTMECH_INSTALL_SCRIPT',
                                            line: 'SCExtMechAPISS2.js/afterInstall',
                                            description: 'The record "' + type.settingsRecord + '" does not exists',
                                            workaround: 'The manifest.json -> "page" section -> "settingsRecord" indicates that a custom record with id ' + type.settingsRecord  +
                                                ' must be added with the Extension. However it was not found in the bundle.' +
                                                '\nBundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.',
                                            error: {
                                                name: 'SCE_SETTINGRECORD_NOEXISTS'
                                            }
                                        }, true);
                                    }
								}
							}
						}

                        var extension_type = search.create({
                            type : 'customlist_ns_sc_extmech_ext_types'
                        ,   filters :  [['name', search.Operator.IS, manifest_json.type]]
                        })
                        .run()
                        .getRange({start: 0, end: 1});

                        if (!extension_type || !extension_type[0])
                        {
                            throw error_handler.handleError({
                                code: 'EXTMECH_INSTALL_SCRIPT',
                                line: 'SCExtMechAPISS2.js/afterInstall',
                                description: 'Could not find the Extension type: ' + manifest_json.type + '.',
                                workaround: 'Check the type is correct in the manifest.json of extension with Bundle ID: ' +  manifest_json.bundle_id +
                                '. Extension ' + manifest_json.vendor + '-' + manifest_json.name +
                                '.\nValid types are: "extension" or "theme".',
                                error: {
                                    name: 'SCE_EXTENSION_INVALID_TYPE'
                                }
                            }, true);
                        }
                        else if(manifest_json.type !== manifest_json.type.toLowerCase()){

                            throw error_handler.handleError({
                                code: 'EXTMECH_INSTALL_SCRIPT',
                                line: 'SCExtMechAPISS2.js/afterInstall',
                                description: 'Extension type: ' + manifest_json.type + ' must be in lowercase.',
                                workaround: 'Check the type in the manifest.json of extension with Bundle ID: ' +  manifest_json.bundle_id +
                                '. Extension ' + manifest_json.vendor + '-' + manifest_json.name +
                                '.\nValid types are: "extension" or "theme".',
                                error: {
                                    name: 'SCE_EXTENSION_INVALID_TYPE'
                                }
                            }, true);
                        }

                        is_there_new_version = self.addExtensionToProcess(manifest_json) || is_there_new_version;
                        last_manifest_checked = manifest_json;
                    }

                    if(!has_manifest)
                    {
                        throw error_handler.handleError({
                            code: 'EXTMECH_INSTALL_SCRIPT',
                            line: 'SCExtMechAPISS2.js/afterInstall',
                            description: 'Could not find "manifest.json" file.',
                            workaround: 'Check that a "manifest.json" file exists for at least one folder inside the Bundle ID: ' + bundle_id + '.',
                            error: {
                                name: 'SCE_MANIFEST_NOT_FOUND'
                            }
                        }, true);
                    }

                    if(!is_there_new_version)
                    {
                        throw error_handler.handleError({
                            code: 'EXTMECH_INSTALL_SCRIPT',
                            line: 'SCExtMechAPISS2.js/afterInstall',
                            description: last_manifest_checked.version + ' is a version minor or equal that the one already installed.',
                            workaround: 'An update of the extension must have a greater version than the one installed in the account.\n' +
                                'Update the version inside the "manifest.json" file for bundle ' +  last_manifest_checked.bundle_id +
                                '.\nExtension: ' + last_manifest_checked.vendor + '-' + (last_manifest_checked.fantasyName || last_manifest_checked.name) + '.',
                            error: {
                                name: 'SCE_MANIFEST_NOT_NEW_VERSION_FOUND'
                            }
                        }, true);
                    }
                    has_bundle_processed = true;

                } catch(error) {
                    error_result = error;
                }
            });

            if(!has_bundle_processed)
            {
                throw error_handler.handleError(error_result, true);
            }

        }

    ,   checkNewVersion: function checkNewVersion(manifest)
        {
            var extensions = search.create({
                type : 'customrecord_ns_sc_extmech_extension'
            ,   filters :  [
                    ['name', search.Operator.IS, manifest.name]
                ,   'and'
                ,   ['custrecord_extension_vendor', search.Operator.IS,  manifest.vendor]
                ]
            ,   columns : ['custrecord_extension_version']
            }).run();

            var is_newer = true;
            extensions.each(function(result)
            {
                var version = result.getValue({name : 'custrecord_extension_version'});
                is_newer = utils.compareSemverVersions(version, manifest.version);

                return is_newer;
            });

            if(!is_newer)
            {
                return is_newer;
            }

            //I do not let install or update if there is an installation in progress of an extension of the same vendor and name
            var filters = [
                ['custrecord_ns_sc_extmech_type', search.Operator.IS,  JobToProcessHelper.EXTENSION_JOB],
                'and',
                ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.ERROR],
                'and',
                ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.DONE]
            ];

            var extensions_in_progress = JobToProcessHelper.getJobsToProcess(search.Sort.ASC, null, filters);

            for (var i = 0; i < extensions_in_progress.length; i++)
            {
                var data = extensions_in_progress[i].data;

                if(data.name === manifest.name && data.vendor === manifest.vendor)
                {
                    is_newer = false;
                    break;
                }
            }
            return is_newer;
        }

    ,   addExtensionToProcess: function addExtensionToProcess(manifest)
        {
            if(!this.checkNewVersion(manifest))
            {
                return false;
            }

            var targets = manifest.target.split(',').map(function(target_name)
            {
                return target_name.trim();
            });

            for (var i = 0; i < targets.length; i++)
            {
                if(targets[i] !== targets[i].toUpperCase())
                {
                     throw error_handler.handleError({
                        code: 'EXTMECH_INSTALL_SCRIPT',
                        line: 'SCExtMechAPISS2.js/afterInstall',
                        description: targets[i] + ' target must be in uppercase.',
                        workaround: 'Edit the manifest.json -> "target" section.',
                        error: {name: 'SCE_MANIFEST_INVALID_TARGET'}
                    }, true);
                }
            }

            var data = {
                name:           manifest.name,
                vendor:         manifest.vendor,
                version:        manifest.version,
                type:           manifest.type.replace(/^./, manifest.type[0].toUpperCase()),
                fantasy_name:   manifest.fantasyName || manifest.name,
                manifest:       manifest.manifest_id,
                bundle_id:      manifest.bundle_id,
                target:         targets.join(','),
                description:    manifest.description || ' ',
                target_version: manifest.target_version
            };

            JobToProcessHelper.createJobToProcess(JobToProcessHelper.EXTENSION_JOB, JobToProcessHelper.PENDING, data);

            return true;
        }

    ,   afterUpdate: function afterUpdate(folder_extension)
        {
            this.afterInstall(folder_extension);
        }

    ,   _getContentTypeid: function(customrecordscriptid)
        {
            try{
                var search_cct = search.create({
                    type : 'cmscontenttype'
                ,   filters :  [['customrecordscriptid', search.Operator.IS, customrecordscriptid.toUpperCase()]]
                })
                .run()
                .getRange({start: 0, end: 1});

                return search_cct && search_cct.length && search_cct[0].id || '';
            }
            catch(error)
            {
                throw error_handler.handleError({
                    code: 'EXTMECH_INSTALL_SCRIPT',
                    line: 'SCExtMechAPISS2.js/_getContentTypeid',
                    description: 'The record "cmscontenttype" does not exists',
                    workaround: 'Make sure the Bundle "SMT Core Content Types" is installed to work with Extensions containing CCTs.',
                    error: {
                        name: 'SCE_CMSCONTENTTYPE_NOEXISTS'
                    }
                }, true);
            }
        }

    ,    _getExtensionRecords: function()
        {
            var bundle_ids = this.getBundleIds();
            var extensions = null;

            if (bundle_ids)
            {
                var filters = [];
                for(var i = 0; i < bundle_ids.length; i++)
                {
                    var filter = ['custrecord_extension_bundleid', search.Operator.IS, bundle_ids[i]];
                    filters.push(filter);

                    i < bundle_ids.length -1 && filters.push('or');
                }

                // Search for the extension
                extensions = search.create({
                    type : 'customrecord_ns_sc_extmech_extension'
                ,   filters : filters
                ,   columns : ['name', 'custrecord_extension_fantasy_name', 'custrecord_extension_type', 'custrecord_extension_vendor', 'custrecord_extension_manifest']
                }).run();
            }

            return extensions;
        }

	,	_getPageTypeId: function(customrecordscriptid)
		{
            try{
                var search_pt = search.create({
                    type : 'cmspagetype'
                ,   filters :  [['customrecordscriptid', search.Operator.IS, customrecordscriptid.toUpperCase()]]
                })
                .run()
                .getRange({start: 0, end: 1});

                return search_pt && search_pt.length && search_pt[0].id || '';
            }
            catch(error)
            {
                throw error_handler.handleError({
                    code: 'EXTMECH_INSTALL_SCRIPT',
                    line: 'SCExtMechAPISS2.js/_getPageTypeId',
                    description: 'The record "cmspagetype" does not exists',
                    workaround: 'Make sure that CMS is enable in your account.',
                    error: {
                        name: 'SCE_CMSPAGETYPE_NOEXISTS'
                    }
                }, true);
            }

		}

,		_deletePageTypeId: function(customrecordscriptid)
		{
			var id = this._getPageTypeId(customrecordscriptid);

			if (id)
			{
                var search_cct = search.create({
                    type : 'cmspage'
                ,   filters : [['fieldsdatacustomrecord',  search.Operator.IS, id]]
                ,   columns : []
                }).run();

                search_cct.each(function(result)
                {
                    record.delete({ type : 'cmspage', id: result.id });
                    return true;
                });

				record.delete({ type : 'cmspagetype', id : id });
			}
		}

 ,      _deleteContentTypeid: function(customrecordscriptid)
        {
            var id = this._getContentTypeid(customrecordscriptid);

            if (id)
            {
                var search_cct = search.create({
                    type : 'cmscontent'
                ,   filters : [['cmscontenttype',  search.Operator.IS, id]]
                ,   columns : []
                }).run();

                search_cct.each(function(result)
                {
                    record.delete({ type : 'cmscontent', id: result.id });
                    return true;
                });

                record.delete({ type : 'cmscontenttype', id : id });
            }
        }

,       _deleteSkinsPresets: function _deleteSkinsPresets(theme_id)
        {
            if (theme_id)
            {
                var search_skin_preset = search.create({
                    type : 'customrecord_ns_sc_extmech_skin_preset'
                ,   filters :  [['custrecord_skin_preset_theme',  search.Operator.IS, theme_id]]
                ,   columns : []
                }).run();

                search_skin_preset.each(function(result)
                {
                    record.delete({ type : 'customrecord_ns_sc_extmech_skin_preset', id: result.id });
                    return true;
                });
            }
        }

,       _deleteCustomSkin: function _deleteCustomSkin(theme_name)
        {
            if (theme_name)
            {
                var search_custom_skin = search.create({
                    type : 'customrecord_ns_sc_extmech_custom_skin'
                ,   filters :  [['custrecord_custom_skin_theme',  search.Operator.IS, theme_name]]
                ,   columns : null
                }).run();

                search_custom_skin.each(function(result)
                {
                    record.delete({type : 'customrecord_ns_sc_extmech_custom_skin', id: result.id });
                    return true;
                });
            }
        }

,       _checkExtensionsInProgress: function _checkExtensionsInProgress()
        {
            var bundle_ids = this.getBundleIds();
            util.each(bundle_ids || [], function(bundle_id)
            {
                // Search for the extension of this bundle being installed
                var filters = [['custrecord_ns_sc_extmech_type', search.Operator.IS,  JobToProcessHelper.EXTENSION_JOB]];
                var extensions = JobToProcessHelper.getJobsToProcess(search.Sort.ASC, null, filters);

                if(extensions && extensions.length)
                {
                    var to_delete = [];
                    util.each(extensions, function(result)
                    {
                        var state = result.state
                        ,   bundle = result.bundle_id;

                        //If there is one being installed fail
                        if(state === JobToProcessHelper.IN_PROGRESS && bundle === bundle_id)
                        {
                            throw error_handler.handleError({
                                code: 'EXTMECH_INSTALL_SCRIPT',
                                line: 'SCExtMechAPISS2.js/_checkExtensionsInProgress',
                                description: 'There is an installation of the bundle ' + bundle_id + ' in progress already.',
                                workaround: 'Please wait until if finishes to try again.',
                                error: {
                                    name: 'SCE_EXTENSION_BEING_INSTALLED'
                                }
                            }, true);
                        }

                        //Gather all the PENDING and ERROR to be deleted
                        to_delete.push(result.id);
                    });

                    for(var i = 0; i < to_delete.length; i++)
                    {
                        record.delete({ type : 'customrecord_ns_sc_extmech_to_process', id: to_delete[i] });
                    }
                }
            });
        }

,       beforeUninstall : function beforeUninstall()
        {
            var self = this;
            try
            {
                self._checkExtensionsInProgress();

                var extensions = self._getExtensionRecords();

                if (extensions && extensions.getRange({start: 0, end: 1}).length > 0)
                {
                    extensions.each(function(result)
                    {
                        var extension_id = result.id
                        ,   extension_name = result.getValue({name : 'name'})
                        ,   extension_fantasy_name = result.getValue({name : 'custrecord_extension_fantasy_name'})
                        ,   extension_vendor = result.getValue({name : 'custrecord_extension_vendor'});

                        var extension_active = search.create({
                            type : 'customrecord_ns_sc_extmech_ext_active'
                        ,   filters : [['custrecord_extension_id', search.Operator.IS, extension_id]]
                        ,   columns : ['custrecord_activation_id']
                        }).run();

                        if (extension_active && extension_active.getRange({start: 0, end: 1}).length)
                        {
                            var activations = [];

                            extension_active.each(function(result)
                            {
                                activations.push(result.getValue({name : 'custrecord_activation_id'}));
                                return true;
                            });

                            throw error_handler.handleError({
                                code: 'EXTMECH_INSTALL_SCRIPT',
                                line: 'SCExtMechAPISS2.js/beforeUninstall',
                                description: 'The extension ' + (extension_fantasy_name || extension_name) + ' must not be active',
                                workaround: 'Go to Setup -> SuiteCommerce Advanced -> Extension Management and deactivate (uncheck checkbox) the extension ' + (extension_fantasy_name || extension_name) +
                                                '.\nIt is still associated with SC ExtMech Activation record/s ' + JSON.stringify(activations),
                                error: {
                                    name: 'SCE_EXTENSION_ACTIVATED'
                                }
                            }, true);
                        }

                        var manifest_id = result.getValue({name : 'custrecord_extension_manifest'});
                        var manifest = file.load({id : manifest_id});
                        var manifest_json = JSON.parse(manifest.getContents());

                        if (manifest_json.cct)
                        {
                            if (Object.prototype.toString.call(manifest_json.cct) !== '[object Array]')
                            {
                                manifest_json.cct = [manifest_json.cct];
                            }

                            for (var j = 0; j < manifest_json.cct.length; j++)
                            {
                                self._deleteContentTypeid(manifest_json.cct[j].settings_record);
                            }
                        }

						if (manifest_json.page && manifest_json.page.types)
						{
							var types = manifest_json.page.types;

							for (j = 0; j < types.length; j++)
							{
								if (types[j].settingsRecord)
								{
									self._deletePageTypeId(types[j].settingsRecord);
								}
							}
						}

                        if(result.getText({name : 'custrecord_extension_type'}) === 'Theme')
                        {
                            self._deleteSkinsPresets(extension_id);
                            self._deleteCustomSkin(extension_vendor + '/' + extension_name);
                        }

                        record.delete({ type : 'customrecord_ns_sc_extmech_extension', id : extension_id});
                        return true;
                    });
                }
            }
            catch (error)
            {
                throw error;
            }
        }
    };

    return SCExtension;
});
