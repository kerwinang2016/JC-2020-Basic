/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/log'
    ,   'N/error'
    ,   'N/file'
    ,   'N/util'
    ,	'N/sassCompiler'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../SMTEndPoints/SassCompiler'
    ,   '../../CommonUtilities/CommonHelper'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   error_module
    ,   file_module
    ,   util
    ,   sassCompiler
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   SassCompiler
    ,   common_helper
    ,   MapReduceErrorHelper
    )
{
    var sass_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.SASS_COMPILER_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this)
            ,   meta_entrypoints = [];

            var Cache = CacheHelper('MANIFEST_LOADER');

            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id)
                    ,   domain = parent_data.activation_metadata.domain
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   extensions_folder = JSON.parse(parent_data.ssp_application.extensions_folder);

                    var theme_manifest
                    ,   manifests = [];

                    _.each(parent_data.manifests, function(manifest_id)
                    {
                        var manifest = Cache.get(manifest_id);
                        manifest = JSON.parse(manifest);
                        var manifestPath = manifest.path;
                        manifest = JSON.parse(manifest.contents);
                        manifest.path = manifestPath;

                        if(manifest.type === 'theme')
                        {
                            theme_manifest = manifest;
                            return;
                        }

                        manifests.push(manifest);
                    });

                    //It may not exist, i.e. SCIS
                    var custom_skin;
                    if(theme_manifest)
                    {
                        var theme_name = theme_manifest.vendor + '/' + theme_manifest.name;
                        custom_skin = common_helper.getCustomSkin(theme_name, domain);
                        custom_skin = custom_skin ? custom_skin.sass : null;

                        manifests = [theme_manifest].concat(manifests);
                    }

                    var job_meta_entrypoints = SassCompiler.createMetaEntrypoints(manifests, activation_id, custom_skin, extensions_folder.folder_id, true);

                    var files_to_compile = [];
                    _.each(job_meta_entrypoints, function(meta_entrypoint, app)
                    {
                        files_to_compile.push({
                            id: meta_entrypoint.id
                        ,   name: meta_entrypoint.name
                        ,   path: meta_entrypoint.path
                        ,   job_id: job_to_process.id
                        ,   activation_id: activation_id
                        ,   extensions_folder: extensions_folder
                        ,   application: app
                        ,   prefix: 'smt_'
                        });

                        files_to_compile.push({
                            id: meta_entrypoint.id
                        ,   name: meta_entrypoint.name
                        ,   path: meta_entrypoint.path
                        ,   job_id: job_to_process.id
                        ,   activation_id: activation_id
                        ,   extensions_folder: extensions_folder
                        ,   application: app
                        ,   prefix: ''
                        });
                    });

                    meta_entrypoints = meta_entrypoints.concat(files_to_compile);
                }
                catch(error)
                {
                    log.error({
                        title: 'SASS_COMPILER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_to_process.id, error));
                }
            });

            return meta_entrypoints;
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var meta_entrypoint = JSON.parse(context.value);
                job_id = meta_entrypoint.job_id;

                var path = '/' + meta_entrypoint.path
                ,   output_path = path.replace(/[^\/]+$/, '');

                var output_filename = 'tmp_' + meta_entrypoint.name.replace('meta_', meta_entrypoint.prefix);
                output_filename = output_filename.replace('.scss', '.css');

                var outputStyle = meta_entrypoint.prefix === 'smt_' ? sassCompiler.OutputStyle.EXPANDED : sassCompiler.OutputStyle.COMPRESSED;

                var	options = {
                    inputPath: path
                ,	outputPath: output_path + output_filename
                ,	settings: {
                        outputStyle: outputStyle
                    ,	preProcessingEnabled: true
                    }
                };

				sassCompiler.compile(options);

                meta_entrypoint.path = output_path;
                meta_entrypoint.file = output_filename;

                context.write(meta_entrypoint.id, meta_entrypoint);
            }
            catch(error)
            {
                log.error({
                    title: 'SASS_COMPILER_MAP_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   reduce: function reduce(context)
        {
            var job_id
            ,   activation_id;
            try
            {
                var generated_files = []
                ,   extensions_folder;
                _.each(context.values, function(value)
                {
                    var data = JSON.parse(value);
                    job_id = data.job_id;
                    activation_id = data.activation_id;
                    extensions_folder = data.extensions_folder;

                    generated_files.push({name: data.file, folder_id: extensions_folder.folder_id});

                    if(data.file.indexOf('smt_') !== -1)
                    {
                        //Ignore the smt_ prefixed files
                        return;
                    }

                    var css_file = file_module.load({id: data.path + data.file});

                    var ie_files = SassCompiler.generateBless({
                        app: data.application
                    ,	activation_id: data.activation_id
                    ,	content: css_file.getContents()
                    ,	folder_id: data.extensions_folder.folder_id
                    ,	output_prefix: 'tmp_'
                    });

                    SassCompiler.writeFiles(ie_files);

                    generated_files = generated_files.concat(_.map(ie_files, function(ie_file)
                    {
                        return {name: ie_file.name, folder_id: ie_file.folder_id};
                    }));
                });

                file_module.delete({id: context.key});

                context.write(
                    job_id
                ,   {
                        files: generated_files
                    ,   activation_id: activation_id
                    }
                );
            }
            catch(error)
            {
                log.error({
                    title: 'SASS_COMPILER_REDUCE_ERROR'
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

            _.each(jobs, function(job)
            {
                if(job.status !== JobToProcessHelper.DONE)
                {
                    return;
                }

                var ie_css = {}
                ,   activation_id = job.data.activation_id;

                ie_css[activation_id] = {};
                _.each(job.data.output_files, function(file_data)
                {
                    var file_name = file_data.name;
                    if(file_name.indexOf('tmp_ie_') === 0)
                    {
                        var app = file_name.match(/^tmp_ie_([^_]+)_/);
                        app = app[1];

                        ie_css[activation_id][app] = (ie_css[activation_id][app] || 0) + 1;
                    }
                });

                job.data.output_files.push({
                    content: 'var ie_css = ' + JSON.stringify(ie_css) + ';'
                ,   concat_with: 'tmp_ssp_libraries_ext.js'
                });
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);

            JobToProcessHelper.reTriggerTask(this);
        }
    };

    return sass_compiler;
});
