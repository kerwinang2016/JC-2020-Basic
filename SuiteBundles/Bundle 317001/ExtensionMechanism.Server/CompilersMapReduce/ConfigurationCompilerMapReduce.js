/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/log'
    ,   'N/error'
    ,   'N/file'
    ,   'N/runtime'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../Services/FileApiSS2'
    ,   '../Configuration/Configuration'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   error_module
    ,   file
    ,   runtime
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   FileApi
    ,   Configuration
    ,   MapReduceErrorHelper
    ,   Utils
    )
{
    var configuration_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.CONFIGURATION_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this)
            ,   config_files = [];

            var Cache = CacheHelper('MANIFEST_LOADER');

            _.each(jobs_to_process, function(job_to_process)
            {
                var job_id;
                try
                {
                    job_id = job_to_process.id;

                    JobToProcessHelper.updateToProcessState(job_id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id)
                    ,   domain = parent_data.activation_metadata.domain
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   ssp_application = parent_data.ssp_application || {}
                    ,   ssp2_application = parent_data.ssp2_application || {}
                    ,   app_manifest = ssp_application.app_manifest
                    ,   app_folder_id = ssp_application.folder_id
                    ,   extensions_folder = JSON.parse(ssp_application.extensions_folder);

                    extensions_folder.ssp2 = ssp2_application;

                    var config_paths = [];

                    _.each(parent_data.manifests, function(manifest_id)
                    {
                        var manifest = Cache.get(manifest_id);
                        manifest = JSON.parse(manifest);

                        var manifest_path = manifest.path;
                        manifest = JSON.parse(manifest.contents);

                        var config_entry = manifest.configuration || {};

                        _.each(config_entry.files || [], function(config_file)
                        {
                            config_paths.push({
                                file_name: manifest_path + '/' + config_file
                            ,   job_id: job_id
                            ,   domain: domain
                            ,   app_type: app_manifest.type
                            ,   app_version: app_manifest.version
                            ,   extensions_folder: extensions_folder
                            ,   activation_id: activation_id
                            });
                        });
                    });

                    config_paths.push({
                        folder_id: app_folder_id
                    ,   file_name: 'configurationManifest.json'
                    ,   is_manifest: true
                    ,   job_id: job_id
                    ,   domain: domain
                    ,   app_type: app_manifest.type
                    ,   app_version: app_manifest.version
                    ,   extensions_folder: extensions_folder
                    ,   activation_id: activation_id
                    });

                    var domains = _.pluck(parent_data.all_app_extensions, 'domain');
                    _.each(domains, function(act_domain)
                    {
                        if (act_domain !== domain)
                        {
                            config_paths.push({
                                folder_id: extensions_folder.folder_id
                            ,   file_name: 'configurationManifest-' + act_domain + '.json'
                            ,   is_manifest: true
                            ,   job_id: job_id
                            ,   domain: domain
                            ,   act_domain: act_domain
                            ,   app_type: app_manifest.type
                            ,   app_version: app_manifest.version
                            ,   extensions_folder: extensions_folder
                            ,   activation_id: activation_id
                            });
                        }
                    });

                    config_files = config_files.concat(config_paths);
                }
                catch(error)
                {
                    log.error({
                        title: 'CONFIGURATION_COMPILER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_id, error));
                }
            });

            return config_files;
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var data = JSON.parse(context.value);
                job_id = data.job_id;

                var file_id = data.file_name;
                if(data.is_manifest)
                {
                    file_id = FileApi.searchFile(data.file_name, data.folder_id);
                }

                var config_file = file.load({id: file_id});

                data.content = config_file.getContents();

                context.write(job_id, data);
            }
            catch(error)
            {
                log.error({
                    title: 'CONFIGURATION_MAP_ERROR'
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
                var config_manifests = []
                ,   config_files = []
                ,   domain
                ,   extensions_folder
                ,   app_type
                ,   activation_id
                ,   app_version;

                _.each(context.values, function(value)
                {
                    var data = JSON.parse(value);
                    job_id = data.job_id;
                    app_type = data.app_type;
                    app_version = data.app_version;
                    activation_id = data.activation_id;
                    domain = data.domain;
                    extensions_folder = data.extensions_folder;

                    if(data.is_manifest)
                    {
                        config_manifests.push(data);
                        return;
                    }
                    config_files.push(data);
                });

                var generated_files = [];

                var configurationManifestExt = this.generateConfigManifest(config_files);

                var config_manifest_file = file.create({
                    name: 'tmp_configurationManifest-' + domain + '.json'
                ,	contents: JSON.stringify(configurationManifestExt)
                ,   folder: extensions_folder.folder_id
                ,   fileType: file.Type.PLAINTEXT
                });
                config_manifest_file.save();
                generated_files.push({'name': config_manifest_file.name, 'folder_id' : extensions_folder.folder_id});

                var defaultValues = this.generateDefaultValues(domain, configurationManifestExt, config_manifests);

                var content = '';
                var ssp2Content = '{}';
                if(app_type !== 'SCIS') {
                    //For older versions than 18.2 use old configuration
                    if(Utils.compareSemverVersions(app_version, '18.2.0')) {
                        content += 'var domain = _getDomain();\n\n';
                        content += this.generateOldConfigSection(defaultValues);
                    } else {
                        content += 'var Configuration = require(\'Configuration\');\n';
                        content += 'Configuration.overwriteByDomain(' + JSON.stringify(defaultValues) + ');\n\n';
                    }

                    if(!_.isEmpty(extensions_folder.ssp2)){
                        ssp2Content = JSON.stringify(defaultValues) + '[domain]';
                    }
                }

                if(!_.isEmpty(extensions_folder.ssp2)) {
                    ssp2Content = 'function _getExtensionsDefaultValues(domain){\n\treturn ' + ssp2Content + ';\n}\n';
                    var ssp2DefaultValuesFile = file.create({
                        name: 'tmp_defaultValues-' + domain + '.js',
                        contents: ssp2Content,
                        folder: extensions_folder.ssp2.folder_id,
                        fileType: file.Type.PLAINTEXT
                    });
                    ssp2DefaultValuesFile.save();

                    generated_files.push({
                        name: ssp2DefaultValuesFile.name,
                        folder_id: extensions_folder.ssp2.folder_id,
                        concat_with: 'tmp_ActivationContext.js'
                    });
                }

                var default_values_file = file.create({
                    name: 'tmp_defaultValues-' + domain + '.js'
                ,	contents: content
                ,   folder: extensions_folder.folder_id
                ,   fileType: file.Type.PLAINTEXT
                });
                default_values_file.save();

                generated_files.push({
                    name: default_values_file.name
                ,   folder_id: extensions_folder.folder_id
                ,	concat_with: 'tmp_ssp_libraries_ext.js'
                });

                context.write(
                    job_id
                ,   {
                        files: generated_files
                    ,   activation_id: activation_id
                    });
            }
            catch(error)
            {
                log.error({
                    title: 'CONFIGURATION_REDUCE_ERROR'
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
                ,   data: {'activation_id' : activation_id, 'output_files' : []}
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
                }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);

            JobToProcessHelper.reTriggerTask(this);
        }

    ,   generateOldConfigSection: function generateOldConfigSection(defaultValues)
        {
            var deepExtend = function deepExtend(target, source)
            {
                if(_.isArray(target) || !_.isObject(target))
                {
                    return source;
                }

                _.each(source, function(value, key)
                {
                    if(key in target)
                    {
                        target[key] = deepExtend(target[key], value);
                    }
                    else
                    {
                        target[key] = value;
                    }
                });

                return target;
            };

            var content = 'var deepExtend = ' + deepExtend.toString() + ';\n\n';

            _.each(defaultValues, function(defaultValue, domain)
            {
                content += '// Start ' + domain + '\n';
                content += 'if (domain === "' + domain + '") {\n';
                content += '\tdeepExtend(ConfigurationManifestDefaults, ' + JSON.stringify(defaultValue) + ');\n';
                content += '}\n';
                content += '// End ' + domain + '\n\n';
            });

            return content;
        }

    ,   generateDefaultValues: function generateDefaultValues(domain, configurationManifestExt, config_manifests)
        {
            var self = this
            ,   ConfigurationTool = new Configuration()
            ,   configuration_default = _.findWhere(config_manifests, {file_name: 'configurationManifest.json'})
            ,   configurationManifest = JSON.parse(configuration_default.content);

            var modifications = ConfigurationTool.getModifications(configurationManifestExt);

            var originalConfigurationManifest = configurationManifest.concat(configurationManifestExt);

            var errors;

            _.each(configurationManifestExt, function(config)
            {
                errors = ConfigurationTool.validateJSONSchema(config);

                if (errors)
                {
                    throw error_module.create({
                        name: 'CONFIGURATION_ERROR'
                    ,   message: 'Configuration Validations JSON Schema error'
                    });
                }
            });

            if (modifications.length)
            {
                errors = ConfigurationTool.modifications(originalConfigurationManifest, modifications);

                if (errors.length)
                {
                    throw error_module.create({
                        name: 'CONFIGURATION_ERROR'
                    ,   message: 'Configuration Modifications error'
                    });
                }
            }

            var defaultValues = {}
            ,   configurationGroup = this.getConfigurationGroup();

            defaultValues[domain] = this.getDifferenceValues(this.getDefaultValues(configurationManifest), this.getDefaultValues(originalConfigurationManifest));

            _.each(config_manifests, function(configuration_default_domain)
            {
                if(configuration_default_domain.file_name === 'configurationManifest.json')
                {
                    return;
                }

                var domain = configuration_default_domain.act_domain;

                configurationManifestExt = [configurationGroup];
                configurationManifestExt = configurationManifestExt.concat(JSON.parse(configuration_default_domain.content));

                modifications = ConfigurationTool.getModifications(configurationManifestExt);
                originalConfigurationManifest = JSON.parse(configuration_default.content).concat(configurationManifestExt);

                _.each(configurationManifestExt, function(config)
                {
                    errors = ConfigurationTool.validateJSONSchema(config);

                    if (errors)
                    {
                        throw error_module.create({
                            name: 'CONFIGURATION_ERROR'
                        ,   message: 'Configuration Validations JSON Schema error for domain ' + domain
                        });
                    }
                });

                if (modifications.length)
                {
                    errors = ConfigurationTool.modifications(originalConfigurationManifest, modifications);

                    if (errors.length)
                    {
                        throw error_module.create({
                            name: 'CONFIGURATION_ERROR'
                        ,   message: 'Configuration Modifications error for domain ' + domain
                        });
                    }
                }

                defaultValues[domain] = self.getDifferenceValues(self.getDefaultValues(configurationManifest), self.getDefaultValues(originalConfigurationManifest));
            });

            return defaultValues;
        }

    ,   getConfigurationGroup: function getConfigurationGroup()
        {
            var configurationGroup = {
                'type': 'object'
            ,   'group': {
                    'id': 'extensions'
                ,   'title': 'Extensions'
                ,   'description': 'Extensions configuration'
                }
            };

            return configurationGroup;
        }

    ,   generateConfigManifest: function generateConfigManifest(configuration_files)
        {
            var configurationGroup = this.getConfigurationGroup()
            ,   configurationManifestExt = [configurationGroup];

            _.each(configuration_files, function(configuration_file)
            {
                configurationManifestExt.push(JSON.parse(configuration_file.content));
            });

            return configurationManifestExt;
        }

    ,   getDifferenceValues: function getDifferenceValues(a, b)
        {
            var r = {};

            _.each(a, function(v, k)
            {
                if (b[k] === v)
                {
                    return;
                }

                if (_.isArray(v))
                {
                    //Get Array Diff
                    if (JSON.stringify(b[k]) !== JSON.stringify(v))
                    {
                        r[k] = b[k];
                    }
                }
                else if (_.isObject(v))
                {
                    var diff = getDifferenceValues(v, b[k]);

                    if (_.keys(diff).length)
                    {
                        r[k] = diff;
                    }
                }
                else
                {
                    r[k] = b[k];
                }
            });

            _.each(b, function(v, k)
            {
                if (typeof a[k] === 'undefined')
                {
                    r[k] = v;
                }
            });

            return r;
        }

    ,   getDefaultValues: function getDefaultValues(configurationManifest)
        {
            // @method setPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} value the value to set
            var setPathFromObject = function (object, path, value)
            {
                if (!path || !object)
                {
                    return;
                }

                var tokens = path.split('.')
                ,	prev = object;

                for(var token_idx = 0; token_idx < tokens.length-1; ++token_idx)
                {
                    var current_token = tokens[token_idx];

                    if( _.isUndefined(prev[current_token]))
                    {
                        prev[current_token] = {};
                    }
                    prev = prev[current_token];
                }

                prev[_.last(tokens)] = value;
            };

            var defaultConfig = {};

            _.each(configurationManifest, function(entry)
            {
                _.each(entry.properties, function(value, key)
                {
                    if (value.default !== undefined)
                    {
                        setPathFromObject(defaultConfig, key, value.default);
                    }
                });
            });

            return defaultConfig;
        }
    };

    return configuration_compiler;
});
