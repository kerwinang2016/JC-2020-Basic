/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/search'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   'N/util'
    ,   '../Helpers/CacheHelper'
    ,   'N/record'
    ,   'N/file'
    ,   'N/log'
    ,   'N/error'
    ,   '../Instrumentation/Instrumentation'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        search
    ,   JobToProcessHelper
    ,   util
    ,   CacheHelper
    ,   record
    ,   file
    ,   log
    ,   error_module
    ,   Instrumentation
    ,   MapReduceErrorHelper
    )
{
    var js_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.JAVASCRIPT_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this);

            CacheHelper = CacheHelper('MANIFEST_LOADER');

            var js_files = [];
            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id),
                        applications = JobToProcessHelper._getJobApplications(job_to_process.parent_job_id),
                        activation_id = parent_data.activation_metadata.activation_id,
                        extensions_folder = JSON.parse(parent_data.ssp_application.extensions_folder),
                        job_files = [];

                    var all_app_extensions = parent_data.all_app_extensions || {};
                    var extensions = all_app_extensions[activation_id] || {};
                    extensions = extensions.extensions || {};
                    extensions = _.indexBy(extensions, 'manifest_id');

                    _.each(applications, function(application)
                    {
                        var app_files = [];

                        _.each(parent_data.manifests, function(manifest_id, index)
                        {
                            var manifest = CacheHelper.get(manifest_id);
                            manifest = JSON.parse(manifest);

                            var manifest_content = JSON.parse(manifest.contents);

                            if(manifest_content.type.toLowerCase() === 'theme')
                            {
                                return;
                            }

                            var javascript_entry = manifest_content.javascript || {}
                            ,   js_applications = javascript_entry.application || {}
                            ,   javascript_data = js_applications[application] || {}
                            ,   javascript_entry_points = javascript_entry.entry_points || {};

                            if(!_.isArray(javascript_data.files))
                            {
                                return;
                            }

                            if(!javascript_entry_points[application])
                            {
                                throw error_module.create({name: 'INPUT_DATA_ERROR', message: 'Manifest ' + manifest_content.name + ': missing entry point for ' + application});
                            }

                            var files_extension = javascript_data.files
                            ,   entry_point = javascript_entry_points[application];

                            _.each(files_extension, function(file_path)
                            {
                                var folder = !_.isEmpty(javascript_entry.folder) ? javascript_entry.folder + '/' : '';
                                var path = manifest.path + '/' + folder + file_path;

                                app_files.push(
                                {
                                    application: application,
                                    path: path,
                                    activation_id: activation_id,
                                    job_id: job_to_process.id,
                                    manifest_vendor: manifest_content.vendor,
                                    manifest_name: manifest_content.name,
                                    manifest_version: manifest_content.version,
                                    extensions_folder: extensions_folder,
                                    is_entry_point: entry_point === file_path,
                                    extensionId: extensions[manifest_id].extension_id,
                                    priority: index
                                });
                            });

                        });

                        //fake_entry is used to create the output file even if there is not any js files
                        var fake_entry = {
                            application: application,
                            job_id: job_to_process.id,
                            activation_id: activation_id,
                            extensions_folder: extensions_folder
                        };

                        app_files = _.isEmpty(app_files) ? [fake_entry] : app_files;
                        job_files = job_files.concat(app_files);
                    });

                    js_files = js_files.concat(job_files);
                }
                catch(error)
                {
                    log.error({
                        title: 'JS_COMPILER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(
                        job_to_process.id,
                        JobToProcessHelper.ERROR,
                        MapReduceErrorHelper.getErrorMessage(job_to_process.id, error)
                    );
                }

            });

            return js_files;
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var js_file = JSON.parse(context.value);
                job_id = js_file.job_id;

                if(js_file.path)
                {
                    js_file.file_content = file.load({id: js_file.path}).getContents();

                    var extensionName = [
                        js_file.manifest_vendor,
                        js_file.manifest_name,
                        js_file.manifest_version
                    ].join('.');

                    js_file.dependencies = Instrumentation.extractDependencies(
                        js_file.activation_id,
                        extensionName,
                        js_file.extensionId,
                        js_file.file_content
                    );
                }
                context.write(js_file.application + '_' + js_file.activation_id, js_file);
            }
            catch(error)
            {
                log.error({
                    title: 'JS_COMPILER_MAP_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   reduce: function reduce(context)
        {
            var self = this
            ,   job_id;

            try
            {
                var define_section_content = 'var extensions = {};\n\n',
                    require_section_content = '',
                    file_name = 'tmp_' + context.key + '.js',
                    extensions_folder,
                    activation_id;

                var dependencies = [];

                var extensions = {}
                ,   values = _.sortBy(context.values, function (value)
                    {
                        value = JSON.parse(value);
                        return value.priority || 0;
                    });

                _.each(values, function(value)
                {
                    var js_file = JSON.parse(value);

                    activation_id = js_file.activation_id;
                    job_id = js_file.job_id;
                    extensions_folder = js_file.extensions_folder;

                    if(js_file.path)
                    {
                        var extension_name = [
                            js_file.manifest_vendor
                        ,   js_file.manifest_name
                        ,   js_file.manifest_version
                        ].join('.');

                        extensions[extension_name] = extensions[extension_name] || [];
                        extensions[extension_name].push(js_file);

                        require_section_content += self._generateRequireSectionContent(js_file, extension_name);
                        js_file.dependencies && dependencies.push(js_file.dependencies);
                    }
                });

                _.each(extensions, function(js_files, extension_name)
                {
                    define_section_content += 'extensions[\'' + extension_name + '\'] = function(){\n\n';

                    extension_name = extension_name.split('.');

                    var manifest_vendor = extension_name[0]
                    ,   manifest_name = extension_name[1]
                    ,   manifest_version = extension_name[2] + '.' + extension_name[3] + '.' + extension_name[4];

                    define_section_content += self._generateGetAssetsPathFunction(manifest_vendor, manifest_name, manifest_version, extensions_folder);

                    var entry_point_content = '';
                    _.each(js_files, function(js_file)
                    {
                        if(js_file.is_entry_point)
                        {
                            entry_point_content = js_file.file_content + '\n\n';
                        }
                        else
                        {
                            define_section_content += js_file.file_content + '\n\n';
                        }
                    });

                    define_section_content += entry_point_content + '};\n\n';
                });

                var newFile = file.create({
                    name: file_name
                ,   fileType: file.Type.PLAINTEXT
                ,   contents: define_section_content + require_section_content
                ,   folder: extensions_folder.folder_id
                ,   isOnline: true
                });
                newFile && newFile.save();

                context.write(
                    activation_id,
                    {
                        file_name: file_name,
                        job_id: job_id,
                        folder_id: extensions_folder.folder_id,
                        dependencies: dependencies
                    }
                );
            }
            catch(error)
            {
                log.error({
                    title: 'JS_COMPILER_REDUCE_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }

        }

    ,   summarize: function summarize(context)
        {
            var jobs = {}
            ,   error_jobs = MapReduceErrorHelper.handleErrors(context);
            context.output.iterator().each(function(activation_id, value)
            {
                value = JSON.parse(value);

                var job_id = value.job_id;
                jobs[job_id] = jobs[job_id] || {
                    status: JobToProcessHelper.DONE
                ,   data: {
                        'activation_id': activation_id,
                        'output_files': [],
                        'dependencies': Instrumentation.processExtractedDependencies('JavaScript', value.dependencies)
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
                    jobs[job_id].data.output_files.push({'name': value.file_name, 'folder_id': value.folder_id});
                    jobs[job_id].data.dependencies = Instrumentation.processExtractedDependencies(
                        'JavaScript',
                        value.dependencies,
                        jobs[job_id].data.dependencies
                    );
                }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);

            JobToProcessHelper.reTriggerTask(this);
        }

    ,   _generateGetAssetsPathFunction : function _generateGetAssetsPathFunction(vendor, name, version, extensions_folder)
        {
            extensions_folder = extensions_folder.name + '/';
            extensions_folder += vendor + '/' + name + '/' + version + '/';

            var function_string = 'function getExtensionAssetsPath(asset){\n';
            function_string += 'return \'' + extensions_folder + '\' + asset;\n';
            function_string += '};\n\n';

            return function_string;
        }

    ,   _generateRequireSectionContent : function _generateRequireSectionContent(js_file, extension_name)
        {
            var require_section_content = '';

            if(js_file.is_entry_point)
            {
                require_section_content += '\n';
                var name = js_file.path.match(/([^\/\\]*)\.js$/);

                var module_name = name.length && name[1];

                require_section_content = 'try{\n';
                require_section_content += '	extensions[\'' + extension_name + '\']();\n';
                require_section_content += '	SC.addExtensionModule(\'' + module_name + '\');\n';
                require_section_content += '}\n';
                require_section_content += 'catch(error)\n';
                require_section_content += '{\n';
                require_section_content += '	console.error(error)\n';
                require_section_content += '}\n\n';
            }

            return require_section_content;
        }

    };

    return js_compiler;
});
