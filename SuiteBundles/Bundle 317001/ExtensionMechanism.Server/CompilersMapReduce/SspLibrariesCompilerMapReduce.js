/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/log'
    ,   'N/file'
    ,   'N/search'
    ,   'N/error'
    ,   'N/runtime'
    ,   'N/url'
    ,   '../Instrumentation/Instrumentation'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../Services/FileApiSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   file
    ,   search
    ,   error_module
    ,   runtime
    ,   url_module
    ,   Instrumentation
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   MapReduceErrorHelper
    ,   Utils
    ,   FileApi
    )
{
    var ssp_libraries_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.SSP_LIBRARIES_JOB

    ,   ACTIVATION_CONTEXT_PATH: 'Common/ActivationContext'

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this),
                ssp_lib_files = [],
                self = this;

            var Cache = CacheHelper('MANIFEST_LOADER');

            _.each(jobs_to_process, function(job_to_process)
            {
                var job_id;
                try
                {
                    job_id = job_to_process.id;

                    JobToProcessHelper.updateToProcessState(job_id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id)
                    ,   app_extensions = parent_data.all_app_extensions
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   ssp_application = parent_data.ssp_application || {}
                    ,   ssp2_application = parent_data.ssp2_application || {}
                    ,   app2_folder_id = ssp2_application.folder_id
                    ,   app_folder_id = ssp_application.folder_id
                    ,   app_manifest = ssp_application.app_manifest
                    ,   extensions_folder = JSON.parse(ssp_application.extensions_folder)
                    ,   app_themes = {}
                    ,   job_files = [];

                    var activationContextFolder;
                    if(app2_folder_id){
                        _.each(self.ACTIVATION_CONTEXT_PATH.split('/'), function(folderName){
                            // If any of the folders in the path does not exist return
                            if(!app2_folder_id){
                                return;
                            }
                            app2_folder_id = FileApi.searchFolder(folderName, app2_folder_id);
                        });
                        activationContextFolder = app2_folder_id;
                    }

                    _.each(app_extensions, function(app_exts) {
                        _.each(app_exts.extensions, function(ext, index) {
                            var manifest = Cache.get(ext.manifest_id);
                            manifest = JSON.parse(manifest);

                            var manifest_path = manifest.path;

                            manifest = JSON.parse(manifest.contents);

                            var extension_name = [
                                manifest.vendor
                            ,   manifest.name
                            ,   manifest.version
                            ];

                            if(manifest.type.toLowerCase() === 'theme') {
                                app_themes[app_exts.activation_id] = extension_name.join('/');
                                return;
                            }

                            extension_name = extension_name.join('.');

                            var ssp_libraries = manifest['ssp-libraries'] || {};

                            if(!ssp_libraries.entry_point && !_.isEmpty(ssp_libraries.files))
                            {
                                throw error_module.create({
                                    name: 'SSP_LIBRARIES_ERROR'
                                ,   message: 'Missing entrypoint'
                                });
                            }

                            _.each(ssp_libraries.files || [], function(ssp_file)
                            {
                                job_files.push({
                                    job_id: job_id,
                                    file_path: manifest_path + '/' + ssp_file,
                                    is_entry_point: ssp_libraries.entry_point === ssp_file,
                                    extension_name: extension_name,
                                    extensionId: ext.extension_id,
                                    activation_id: app_exts.activation_id,
                                    priority: index
                                });
                            });
                        });
                    });

                    job_files.push({
                        job_id: job_id
                    ,   activation_id: activation_id
                    ,   app_folder_id: app_folder_id
                    ,   activationContextFolder: activationContextFolder
                    ,   app_type: app_manifest.type
                    ,   app_manifest: app_manifest
                    ,   app_themes: app_themes
                    ,   extensions: app_extensions
                    ,   extensions_folder: extensions_folder
                    ,   is_metadata: true
                    });

                    ssp_lib_files = ssp_lib_files.concat(job_files);
                }
                catch(error)
                {
                    log.error({
                        title: 'SSP_LIBRARIES_COMPILER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_to_process.id, error));
                }
            });

            return ssp_lib_files;
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var data = JSON.parse(context.value);
                job_id = data.job_id;

                if(!data.is_metadata)
                {
                    var ssp_file = file.load({id: data.file_path});
                    data.content = ssp_file.getContents();

                    data.dependencies = Instrumentation.extractDependencies(
                        data.activation_id,
                        data.extension_name,
                        data.extensionId,
                        data.content
                    );
                }

                context.write(job_id, data);
            }
            catch(error)
            {
                log.error({
                    title: 'SSP_LIBRARIES_MAP_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   reduce: function reduce(context)
        {
            var job_id;
            try
            {
                var generated_files = [],
                    job_metadata,
                    dependencies = [];

                var ssp_files = _.map(context.values, function(value)
                {
                    var data = JSON.parse(value);
                    if(data.is_metadata)
                    {
                       job_metadata = data;
                    }

                    data.dependencies && dependencies.push(data.dependencies);
                    return data;
                });

                job_id = job_metadata.job_id;

                //for backward compatibility SCS ssp-libraries is generated with entrypoint SCA
                var content = job_metadata.app_type === 'SCS' ? 'require(\'SCA\');\n\n' : 'require(\'' + job_metadata.app_type + '\');\n\n';

                content += this.generateDefinesSection(ssp_files);
                content += this.generateKeyMappingSection(job_metadata);
                content += this.generateKeySelectionSection(job_metadata);
                content += this.generateRequireSection(ssp_files);
                content += this.generateIECssMapping(job_metadata);
                content += this.generateIncludeMapping(job_metadata);
                content += this.generateSMTEndpoint();

                if(job_metadata.activationContextFolder){
                    var file_id = FileApi.searchFile('tmp_ActivationContext.js', job_metadata.activationContextFolder, true);
                    if(file_id){
                        file.delete({id: file_id});
                    }
                    var ssp2Content = 'define([], function(){';
                    ssp2Content += '\n\treturn {';
                    ssp2Content += '\n\t\tgetExtensionsDefaultValues: function(domain){';
                    // This function is generated by the Configuration Job
                    if(job_metadata.app_type === 'SCIS'){
                        ssp2Content += '\n\t\t\treturn {};';
                    } else {
                        ssp2Content += '\n\t\t\treturn _getExtensionsDefaultValues(domain);';
                    }
                    ssp2Content += '\n\t\t},';
                    ssp2Content += '\n\t\tgetActivationContext: function(unmanagedResourcesFolderName){';
                    ssp2Content += '\n\t\t\treturn {};'; // TODO replace this line with the proper content
                    ssp2Content += '\n\t\t}';
                    ssp2Content += '\n\t};';
                    ssp2Content += '\n});';

                    var activationContextFile = file.create({
                        name: 'tmp_ActivationContext.js',
                        contents: ssp2Content,
                        folder: job_metadata.activationContextFolder,
                        fileType: file.Type.PLAINTEXT
                    });
                    activationContextFile.save();

                    generated_files.push({'name': activationContextFile.name, 'folder_id': job_metadata.activationContextFolder});
                }

                var ssp_libs_file = file.create({
                    name: 'tmp_ssp_libraries_ext.js'
                ,	contents: content
                ,   folder: job_metadata.app_folder_id
                ,   fileType: file.Type.PLAINTEXT
                });
                ssp_libs_file.save();

                generated_files.push({'name': ssp_libs_file.name, 'folder_id': job_metadata.app_folder_id});

                context.write(
                    job_id,
                    {
                        files: generated_files,
                        activation_id: job_metadata.activation_id,
                        dependencies: dependencies
                    }
                );
            }
            catch(error)
            {
                log.error({
                    title: 'SSP_LIBRARIES_REDUCE_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   summarize: function summarize(context)
        {
            var jobs = {}
            ,   error_jobs = MapReduceErrorHelper.handleErrors(context);
            context.output.iterator().each(function(job_id, value)
            {
                value = JSON.parse(value);

                var activation_id = value.activation_id;

                jobs[job_id] = jobs[job_id] || {
                    status: JobToProcessHelper.DONE
                ,   data: {
                        'activation_id': activation_id,
                        'output_files': [],
                        'dependencies': Instrumentation.processExtractedDependencies('SuiteScript1', value.dependencies)
                    }
                };

                if(error_jobs[job_id])
                {
                    jobs[job_id] = {
                        status: JobToProcessHelper.ERROR
                    ,   data: error_jobs[job_id]
                    };
                }
                else
                {
                    var files = jobs[job_id].data.output_files;
                    files = files.concat(value.files);

                    jobs[job_id].data.output_files = files;
                    jobs[job_id].data.dependencies = Instrumentation.processExtractedDependencies(
                        'SuiteScript1',
                        value.dependencies,
                        jobs[job_id].data.dependencies
                    );
                }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);

            JobToProcessHelper.reTriggerTask(this);
        }

    ,   _enforceAppResources: function _enforceAppResources(default_resources, app_manifest, extended_resources)
        {
            var extensible_resources = app_manifest.extensible_resources
            ,   resources_map = {
                    'js': 'javascript'
                ,   'css': 'sass'
                ,   'templates': 'templates'
                };

            _.each(extended_resources, function(value, resource)
            {
                if(!_.contains(extensible_resources, resources_map[resource]))
                {
                    extended_resources[resource] = default_resources[resource];
                }
            });

            return extended_resources;
        }

    ,   generateSMTEndpoint: function generateSMTEndpoint()
        {
            var emb_endpoint_url = url_module.resolveDomain({
                hostType: url_module.HostType.APPLICATION
            });

            var content = '\nvar embEndpointUrl = {';
            content += '\n\turl: \'https://' + emb_endpoint_url + '\' + nlapiResolveURL(\'SUITELET\', \'customscript_ext_mech_emb_endpoints\', \'customdeploy_ext_mech_emb_endpoints\') + \'&callback=?\'';
            content += '\n,\tmethod: \'GET\'';
            content += '\n,\tdataType: \'jsonp\'';
            content += '\n,\tdata: {';
            content += '\n\t\tdomain: current_domain';
            content += '\n\t\t}';
            content += '\n};';

            return content;
        }

    ,   generateIncludeMapping: function generateIncludeMapping(job_metadata)
        {
            var self = this
            ,   app_manifest = job_metadata.app_manifest
            ,   ssp_applications = app_manifest.application
            ,   extensions_folder = job_metadata.extensions_folder;

            var default_include_map = {};
            _.each(ssp_applications, function(application)
            {
                default_include_map[application] = {
                    templates: [application + '-templates.js']
                ,   js: ['javascript/' + application + '.js']
                ,   css: ['css/' + application + '.css']
                ,   ie: []
                };
            });

            extensions_folder = extensions_folder.name + '/';

            var	include_map = {}
            ,   theme_assets_paths = {};

            _.each(job_metadata.app_themes, function(theme_path, activation_id)
            {
                //theme may not be defined for SCIS
                if(!theme_path)
                {
                    theme_assets_paths[activation_id] = '';
                    return;
                }

                theme_assets_paths[activation_id] = extensions_folder + theme_path + '/';
            });

            _.each(job_metadata.extensions, function(activation)
            {
                var activation_id = activation.activation_id;

                include_map[activation.website_id] = include_map[activation.website_id] || {};
                include_map[activation.website_id][activation_id] = include_map[activation.website_id][activation_id] || {};

                _.each(ssp_applications, function(application)
                {
                    var extended_file_prefix = extensions_folder + application;

                    include_map[activation.website_id][activation_id][application] = self._enforceAppResources(
                        default_include_map[application]
                    ,   app_manifest
                    ,   {
                            templates: [extended_file_prefix + '-templates_' + activation_id + '.js']
                        ,	js: [
                                'javascript/' + application + '.js'
                            ,	extended_file_prefix + '_' + activation_id + '.js'
                            ]
                        ,	css: [extended_file_prefix + '_' + activation_id + '.css']
                        ,	ie: []
                        }
                    );
                });
            });
            var content = 'var include_mapping = ' + JSON.stringify(include_map, null, 4) + ';\n';
            content += 'var theme_assets_paths = ' + JSON.stringify(theme_assets_paths, null, 4) + ';\n';

            content += 'var Application = require(\'Application\');\n';
            content += '\nvar app_includes;\n';
            content += '\nvar isExtended = false;\n';
            content += '\nvar themeAssetsPath = \'\';\n';
            content += 'if(include_mapping[website_id] && include_mapping[website_id][key]){\n';

            content += '	app_includes = include_mapping[website_id][key];\n';
            content += '\n  isExtended = true;\n';
            content += '\n  themeAssetsPath = theme_assets_paths[key];\n';

            content += '}\n';
            content += 'else{\n';

            content += '	app_includes = ' + JSON.stringify(default_include_map, null, 4) + ';\n';
            content += '	_.each(app_includes, function(app){\n';
            content += '		app.templates = _.map(app.templates, function(file){\n';
            content += '			return Application.getNonManageResourcesPathPrefix() + file;\n';
            content += '		});\n';
            content += '		app.css = _.map(app.css, function(file){\n';
            content += '			return Application.getNonManageResourcesPathPrefix() + file;\n';
            content += '		});\n';

            if(job_metadata.app_type !== 'SCIS')
            {
                 //For older versions than 18.2 use old configuration
                if(Utils.compareSemverVersions(app_manifest.version, '18.2.0'))
                {
                    content += '        if(SC.Configuration.unmanagedResourcesFolderName)\n';
                }
                else
                {
                    content += '        if(Configuration.get().unmanagedResourcesFolderName)\n';
                }
                content += '        {\n';
                content += '            app.js.unshift(\'backward-compatibility-amd-unclean.js\');\n';
                content += '        }\n';
            }

            content += '	});\n';

            content += '}\n';

            content += '_.each(app_includes, function(app, app_name){\n';
            content += '	app.js = app.templates.concat(app.js);\n';

            content += '	key = key || \'core\';\n';
            content += '	if(ie_css[key] && ie_css[key][app_name]){\n';
            content += '	    for(var i=0; i < ie_css[key][app_name]; i++){\n';
            content += '	      var prefix = \'' + extensions_folder + 'ie_\'\n';
            content += '	      var posfix = \'_\' + i + \'_\' + key\n';
            content += '	      if(key === \'core\'){\n';
            content += '	          prefix = \'css_ie/\';\n';
            content += '	          posfix = i > 0 ? \'_\' + i : \'\';\n';
            content += '	      }\n';
            content += '		  app.ie.push(prefix + app_name + posfix + \'.css\');\n';
            content += '	    }\n';
            content += '	}\n';

            content += '});\n';

            return content;
        }

    ,   _countIECssFiles: function(job_metadata)
        {
            var folder_id = job_metadata.extensions_folder.folder_id
            ,   app_folder_id = job_metadata.app_folder_id;

            var ie_css_files = search.create({
                type: 'file'
            ,   filters: [
                    ['folder', search.Operator.IS, folder_id]
                ,   'and'
                ,   ['name', search.Operator.STARTSWITH, 'ie_']
                ]
            ,	columns: ['name']
            })
            .run();

			var ie_css_map = {};
			ie_css_files.each(function(css_file)
			{
				var file_name = css_file.getValue({name: 'name'})
				,	match = file_name.match(/^ie_([^_]+)_\d+_(\d+).css$/)
				,	app = match[1]
				,	activation_id = match[2];

                if(_.contains(job_metadata.app_manifest.application, app))
                {
                    ie_css_map[activation_id] = ie_css_map[activation_id] || {};
                    ie_css_map[activation_id][app] = (ie_css_map[activation_id][app] || 0) + 1;
                }

                return true;
			});

            if(job_metadata.app_manifest.type === 'SCS')
            {
                app_folder_id = FileApi.searchFolder('default', app_folder_id);
            }
            var css_ie_folder = FileApi.searchFolder('css_ie', app_folder_id);
            if(css_ie_folder)
            {
                ie_css_files = search.create({
                    type: 'file'
                ,   filters: [
                        ['folder', search.Operator.IS, css_ie_folder]
                    ]
                ,   columns: ['name']
                })
                .run();

                ie_css_files.each(function (css_file)
                {
                    var file_name = css_file.getValue({name: 'name'})
                    ,   match = file_name.match(/^([^_]+)(_\d+)?.css$/)
                    ,   app = match[1];

                    if (_.contains(job_metadata.app_manifest.application, app))
                    {
                        ie_css_map.core = ie_css_map.core || {};
                        ie_css_map.core[app] = (ie_css_map.core[app] || 0) + 1;
                    }

                    return true;
                });
            }

			return ie_css_map;
        }

    ,   generateIECssMapping: function generateIECssMapping(job_metadata)
        {
            if(job_metadata.app_type === 'SCIS')
            {
                return 'var ie_css = {};';
            }

            var ie_css_map = this._countIECssFiles(job_metadata)
            ,   content = 'var ie_css_map = ' + JSON.stringify(ie_css_map, null, 4) + ';\n';

            //Merge the pre activated IE css files with the current activation IE css files
            content += 'ie_css = _.extend(ie_css_map, ie_css);\n\n';

            return content;
        }

    ,   generateRequireSection: function generateRequireSection(ssp_files)
        {
            var content = ''
            ,   extensions = _.groupBy(ssp_files, 'activation_id');

            _.each(extensions, function(ssp_files, activation_id)
            {
                content += 'if(key === \'' + activation_id + '\'){\n';

                ssp_files = _.sortBy(ssp_files, function(ssp_file)
                {
                    return ssp_file.priority || 0;
                });

                _.each(ssp_files, function(ssp_file)
                {
                    if(!ssp_file.is_entry_point)
                    {
                        return;
                    }

                    var name = ssp_file.file_path.match(/([^\/\\]*)\.js$/)
                    ,	module_name = name.length && name[1]
                    ,	extension_name = ssp_file.extension_name;

                    content += 'try{\n';
                    content += '	extensions[\'' + extension_name + '\'](\'' + extension_name + '\');\n';
                    content += '	require(\'' + module_name + '\');\n';
                    content += '}\ncatch(error){\n';
                    content += '	nlapiLogExecution(\'ERROR\', \'ERROR_SSP_LIBRARIES_EXT\', JSON.stringify(error));\n';
                    content += '}\n\n';
                });

                content += '}\n\n';
            });

            return content;
        }

    ,   generateKeySelectionSection: function generateKeySelectionSection(ssp_lib_metadata)
        {
            var content = 'var key;\n'
            ,   extensions = ssp_lib_metadata.extensions
            ,	websites = _.uniq(_.pluck(extensions, 'website_id'));

            content += 'var ctx = nlapiGetContext();\n';
            content += 'var subsidiary = ctx.getSubsidiary();\n';
            content += 'var location = ctx.getLocation();\n';

            content += 'var subsidiary_key = current_domain + \'-\' + subsidiary;\n';
            content += 'var location_key = subsidiary_key + \'-\' + location;\n';

            _.each(websites, function(website_id)
            {
                content += 'if(website_id === ' + website_id + ' && key_mapping[website_id]){\n';
                content += '	var mapping = key_mapping[website_id];\n';

                content += '	if(mapping[location_key]){\n';
                content += '		key = mapping[location_key];\n';
                content += '	}\n';

                content += '	else if(mapping[subsidiary_key]){\n';
                content += '		key = mapping[subsidiary_key];\n';
                content += '	}\n';

                content += '	else if(mapping[current_domain]){\n';
                content += '		key = mapping[current_domain];\n';
                content += '	}\n';

                content += '	else if(mapping[\'activation_id\']){\n';
                content += '		key = mapping[\'activation_id\'];\n';
                content += '	}\n';
                content += '}\n\n';
            });

            return content;
    },

    generateDefineOverride: function generateDefineOverride() {
      var content =
        '  var define = function(moduleName, dependencies, callback) {\n';
      content += '      for (var i = 0; i < dependencies.length; i++){\n';
      content += '          var dep = dependencies[i];\n';
      content +=
        '          if (dep === \'Application\' && dep.indexOf(extensionName + \'.Plugin!\') === -1) {\n';
      content +=
        '              dependencies[i] = extensionName + \'.Plugin!\' + dep;\n';
      content += '          }\n';
      content += '      }\n';
      content +=
        '      return srcDefine(moduleName, dependencies, callback);\n';
      content += '  };\n\n';

      content += '  define(extensionName + \'.Plugin\', [], function (){\n';
      content += '      return {\n';
      content += '	        load: function (name, req, onload, config){\n';
      content += '              try{\n';
      content += '	                req(\n';
      content += '                      [name],\n';
      content += '                      function (value) {\n';
      content += '                          const proxy = new ProxyPolyfill(value, {\n';
      content += '                              get: function (target, prop, receiver){\n';
      content += '                                  var targetProp = target[prop];\n';
      content += '                                  if(typeof targetProp === \'function\'){\n';
      content += '                                      targetProp = function() {\n';
      content += '                                          return target[prop].apply(target, arguments);\n';
      content += '                                      }\n';
      content += '                                  }';
      content += '                                  return prop === \'extensionName\' ? extensionName : targetProp;\n';
      content += '                              }\n';
      content += '                          });\n';
      content += '                          onload(proxy);\n';
      content += '                      },\n';
      content += '                      function () {\n';
      content += '                          onload(null);\n';
      content += '                      });\n';
      content += '              }catch (e) {}\n';
      content += '          }\n';
      content += '      };\n';
      content += '  });\n\n';

      return content;
    }

,   generateDefinesSection: function generateDefinesSection(ssp_files) {
      var content = 'var extensions = {};\n\n var srcDefine = define;\n',
        extensions = _.groupBy(ssp_files, 'extension_name'),
        self = this;

      content += '  ProxyPolyfill = function(target, handler) {\n';
      content += '      var proxy = this;\n';
      content += '	    const getter = handler.get ? function(prop) {\n';
      content += '         return handler.get(this, prop, proxy);\n';
      content += '	    } : function(prop) {\n';
      content += '         return this[prop];\n';
      content += '      };\n';
      content +=
        '      const propertyNames = Object.getOwnPropertyNames(target);\n';
      content += '      propertyNames.forEach(function(prop) {\n';
      content += '          const desc = {\n';
      content += '              get: getter.bind(target, prop)\n';
      content += '          };\n';
      content += '          Object.defineProperty(proxy, prop, desc);\n';
      content += '      });\n';
      content += '      return proxy;\n';
      content += '  };\n';

      _.each(extensions, function(ssp_files, extension_name) {
        if (extension_name === 'undefined') {
          //Ignore the metadata entry
          return;
        }

        var extension_content =
            'extensions[\'' +
            extension_name +
            '\'] = function(extensionName){\n\n' +
            self.generateDefineOverride(),
          entry_point_content = '';

                _.each(ssp_files, function(ssp_file)
                {
                    if(ssp_file.is_entry_point)
                    {
                        entry_point_content = ssp_file.content + '\n\n';
                    }
                    else
                    {
                        extension_content += ssp_file.content + '\n\n';
                    }
                });

                extension_content += entry_point_content + '\n};\n\n';
				content += extension_content;
            });

            return content;
        }

    ,   generateKeyMappingSection: function generateKeyMappingSection(ssp_lib_metadata)
        {
            var extensions = ssp_lib_metadata.extensions
            ,   content;

            if(ssp_lib_metadata.app_type === 'SCIS')
            {
                content = 'var session = nlapiGetWebContainer().getShoppingSession();\n';
                content += 'var website_id = session.getSiteSettings([\'siteid\']).siteid;\n';
            }
            else
            {
                content = 'var SiteSettings = require(\'SiteSettings.Model\').get();\n';
                content += 'var website_id = SiteSettings.siteid;\n';
            }

            content += 'var key_mapping = {\n';
            var websites = _.uniq(_.pluck(extensions, 'website_id'));
            _.each(websites, function(website_id, index)
            {
                content += (index ? ',' : '') + '\t\'' + website_id + '\': {\n';

                var activations = _.where(extensions, {website_id: website_id})
                ,	aux = [];

                _.each(activations, function(activation)
                {
                    var activation_key = _.compact([
                        activation.domain
                    ,   activation.subsidiary
                    ,   activation.location
                    ]).join('-');

                    aux.push('\t\t\'' + activation_key + '\': \'' + activation.activation_id + '\'\n');
                });

                content += aux.join(',') + '\t}\n';

            });
            content += '};\n\n';

            return content;
        }
    };

    return ssp_libraries_compiler;
});
