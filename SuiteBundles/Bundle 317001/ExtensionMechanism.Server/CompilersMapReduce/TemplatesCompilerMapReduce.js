/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/log'
    ,   'N/file'
    ,   'N/error'
    ,   'N/encode'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../../third_parties/handlebars.js'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../Services/FileApiSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   file
    ,   error_module
    ,   encode
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   Handlebars
    ,   MapReduceErrorHelper
    ,   FileApi
    )
{
    var templates_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.TEMPLATES_JOB

    ,   getInputData: function getInputData()
        {
            var self = this;

            var jobs_to_process = JobToProcessHelper.getJobs(this);

            CacheHelper = CacheHelper('MANIFEST_LOADER');

            var tpl_files = [];
            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id)
                    ,   applications = JobToProcessHelper._getJobApplications(job_to_process.parent_job_id)
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   ssp_app_folder_id = parent_data.ssp_application.folder_id
                    ,   extensions_folder = JSON.parse(parent_data.ssp_application.extensions_folder)
                    ,   job_files = [];

                    _.each(applications, function(application)
                    {
                        var app_files = []
                        ,   theme_manifest;

                        _.each(parent_data.manifests, function(manifest_id)
                        {
                            var manifest = CacheHelper.get(manifest_id);
                            manifest = JSON.parse(manifest);

                            var manifest_content = JSON.parse(manifest.contents)
                            ,   templates_entry = manifest_content.templates || {}
                            ,   template_applications = templates_entry.application || {}
                            ,   template_data = template_applications[application] || {};

                            if(manifest_content.type === 'theme')
                            {
                                theme_manifest = manifest_content;
                                theme_manifest.path = manifest.path;
                            }

                            if(!_.isArray(template_data.files))
                            {
                                return;
                            }

                            var folder = !_.isEmpty(templates_entry.folder) ? templates_entry.folder + '/' : '';

                            _.each(template_data.files, function(file)
                            {
                                app_files.push({
                                    application: application,
                                    path: folder + file,
                                    manifest_path: manifest.path,
                                    activation_id: activation_id,
                                    job_id: job_to_process.id,
                                    manifest_vendor: manifest_content.vendor,
                                    manifest_name: manifest_content.name,
                                    manifest_version: manifest_content.version,
                                    ssp_app_folder_id: ssp_app_folder_id,
                                    extensions_folder: extensions_folder
                                });
                            });
                        });

                        app_files = self._handleOverrides(app_files, theme_manifest);

                        job_files = job_files.concat(app_files);
                    });

                    tpl_files = tpl_files.concat(job_files);
                }
                catch(error)
                {
                    log.error({
                        title: 'TEMPLATES_COMPILER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_to_process.id, error));
                }

            });

            return tpl_files;
        }

    ,   _handleOverrides: function _handleOverrides(files, theme_manifest)
        {
            files = _.indexBy(files, 'path');

            _.each(theme_manifest.override || [], function(override)
            {
                var src_path = override.src;

                if(/\.tpl$/.test(src_path))
                {
                    var segments = override.dst.split('/')
                    ,   prefix = segments[0] + '/' + segments[1] + '/'
                    ,   dst_path = override.dst.replace(prefix, '');

                    if(!/\.tpl$/.test('.tpl'))
                    {
                        throw error_module.create({name: 'HANDLE_OVERRIDES_ERROR', message: 'You can only override .tpl files in the templates override section. Check ' + override.src + ' or ' + override.dst});
                    }

                    if(files[dst_path])
                    {
                        if(!files[src_path])
                        {
                            throw error_module.create({name: 'HANDLE_OVERRIDES_ERROR', message: 'Could not find overriding file'});
                        }

                        files[dst_path].path = src_path;
                        files[dst_path].manifest_path = theme_manifest.path;
                    }

                    if(files[src_path])
                    {
                        delete files[src_path];
                    }
                }
            });

            return _.values(files);
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var tpl_file = JSON.parse(context.value);
                job_id = tpl_file.job_id;
                tpl_file.file_content = this._compileFile(tpl_file);

                context.write(tpl_file.application + '-templates_' + tpl_file.activation_id, tpl_file);
            }
            catch(error)
            {
                log.error({
                    title: 'TEMPLATES_COMPILER_MAP_ERROR'
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
                var extensions_folder
                ,   file_name = 'tmp_' + context.key + '.js'
                ,   activation_id
                ,   ssp_app_folder_id
                ,   total_content = '';

                _.each(context.values, function(value)
                {
                    var tpl_file = JSON.parse(value);

                    activation_id = tpl_file.activation_id;
                    job_id = tpl_file.job_id;
                    extensions_folder = tpl_file.extensions_folder;
                    ssp_app_folder_id = tpl_file.ssp_app_folder_id;

                    total_content += tpl_file.file_content;
                });

                if(!ssp_app_folder_id)
                {
                    throw error_module.create({name: 'REDUCE_ERROR', message: 'No SSP Application folder given. Needed to get javascript-libs.js file.'});
                }

                var javascript_libs_id = FileApi.searchFile('javascript-libs.js', ssp_app_folder_id);
                if(!javascript_libs_id)
                {
                    throw error_module.create({name: 'REDUCE_ERROR', message: 'javascript-libs.js file not found'});
                }

                var javascript_libs = file.load({id: javascript_libs_id});

                var newFile = file.create({
                    name: file_name
                ,   fileType: file.Type.PLAINTEXT
                ,   contents: javascript_libs.getContents() + '\n\n' + total_content
                ,   folder: extensions_folder.folder_id
                ,   isOnline: true
                });
                newFile && newFile.save();

                context.write(activation_id, {file_name: file_name, job_id: job_id, folder_id: extensions_folder.folder_id });
            }
            catch(error)
            {
                log.error({
                    title: 'TEMPLATES_COMPILER_REDUCE_ERROR'
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
                    jobs[job_id].data.output_files.push({'name': value.file_name, 'folder_id': value.folder_id});
                }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);

            JobToProcessHelper.reTriggerTask(this);
        }

    ,   _compileFile: function _compileFile(tpl_to_compile)
        {
            var compiled_file = ''
            ,   tpl_file = file.load({id: tpl_to_compile.manifest_path + '/' + tpl_to_compile.path});

            var theme_assets_paths = [
                tpl_to_compile.extensions_folder.name
            ,   tpl_to_compile.manifest_vendor
            ,   tpl_to_compile.manifest_name
            ,   tpl_to_compile.manifest_version
            ,   ''
            ].join('/');

            var extension_path = [
                tpl_to_compile.extensions_folder.name
            ,   tpl_to_compile.manifest_vendor
            ,   tpl_to_compile.manifest_name
            ,   tpl_to_compile.manifest_version
            ,   ''
            ].join('/');

            var file_name_regex = tpl_file.name.match(/([^\/\\]*)\.tpl$/);
            var template_name = file_name_regex.length && file_name_regex[1];

            var content = tpl_file.getContents();
            if(tpl_file.fileType === 'MISCBINARY')
            {
            	content = encode.convert({
                	string: content
                ,   inputEncoding: encode.Encoding.BASE_64
                ,   outputEncoding: encode.Encoding.UTF_8
                });
            }
            content = this.minifyMarkup(content);

            Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name)
            {
                return 'compilerNameLookup(' + parent + ',"' + name + '")';
            };

            var ast = Handlebars.parse(content)
            ,   compiled = Handlebars.precompile(ast, {}).toString();

            compiled_file += 'define(\'' + template_name + '.tpl\', [' + this.findTemplateDependencies(compiled).join(',') + '], ';
            compiled_file += 'function(Handlebars, compilerNameLookup){ ';
            compiled_file += 'var t = ' + compiled + '; ';
            compiled_file += 'var main = t.main; ';
            compiled_file += 't.main = function(){\n';
            compiled_file += 'arguments[1] = arguments[1] || {};\n';
            compiled_file += 'var ctx = arguments[1];\n';
            compiled_file += 'ctx._extension_path = \'' + extension_path + '\';\n';
            compiled_file += 'ctx._theme_path = \'' + theme_assets_paths + '\';\n';
            compiled_file += 'return main.apply(this, arguments);\n';
            compiled_file += '};\n';
            compiled_file += 'var template = Handlebars.template(t); ';
            compiled_file += 'template.Name = \'' + template_name + '\'; ';
            compiled_file += 'return template;';
            compiled_file += '});\n\n';


            return compiled_file;
        }

    ,   findTemplateDependencies: function findTemplateDependencies(content)
        {
            var regex = /data-\w*\-{0,1}template=\\"([^"]+)\\"/gm
            ,   result
            ,   deps = ['\'Handlebars\'', '\'Handlebars.CompilerNameLookup\''];

            do
            {
                result = regex.exec(content);
                if(result && result.length > 1)
                {
                    deps.push('\'' + result[1] + '.tpl\'');
                }
            }
            while(result);

            return deps;
        }

    ,   minifyMarkup: function minifyMarkup(text)
        {
            var minified = text
            // remove spaces between tags.
            .replace(/\>\s+</g, '><')
            // remove html comments that our markup could have.
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/[\n\r\s]+</g, ' <')
            .replace(/>[\n\r\s]+/g, '> ')
            .replace(/[\n\r\s]+\{\{/g, ' {{')
            .replace(/\}\}[\n\r\s]+/g, '}} ');

            return minified;
        }

    };

    return templates_compiler;
});
