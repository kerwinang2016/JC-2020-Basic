/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        '../Helpers/JobToProcessHelperSS2'
    ,   'N/file'
    ,   'N/search'
    ,   'N/error'
    ,   'N/log'
    ,   '../Helpers/CacheHelper'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        JobToProcessHelper
    ,   file
    ,   search
    ,   error_module
    ,   log
    ,   CacheHelper
    ,   MapReduceErrorHelper
    )
{
    var manifest_loader = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.MANIFEST_LOADER_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this);

            var result = [];
            _.each(jobs_to_process, function(job)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job.id, JobToProcessHelper.IN_PROGRESS);
                    var job_data = job.data || {};

                    var manifests = {};

                    _.each(job_data.all_app_extensions, function(app_exts)
                    {
                        _.each(app_exts.extensions, function(ext)
                        {
                            manifests[ext.manifest_id] = {
                                job_id: job.id
                            ,   manifest_id: ext.manifest_id
                            };
                        });
                    });

                    result.push({
                        is_metadata: true,
                        job_id: job.id
                    });

                    result = result.concat(_.values(manifests));
                }
                catch(error)
                {
                    log.error({
                        title: 'MANIFEST_LOADER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job.id, JobToProcessHelper.ERROR, error.message);
                }
            });
            return result;
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
                    var Cache = CacheHelper('MANIFEST_LOADER');
                    var manifest = Cache.get(data.manifest_id);
                    manifest = JSON.parse(manifest);
                    try
                    {
                        manifest = JSON.parse(manifest.contents);
                    }
                    catch(err)
                    {
                        var extension_name = manifest.path.match('(?!.*\/).+');
                      	var error_message = 'Manifest of extension '+ extension_name + ' isn\'t in the correct JSON format ' + err.message;
                        log.error({
                            title: 'MANIFEST_LOADER_MANIFEST_PARSE_ERROR'
                        ,   details: error_message
                        });
        
                        MapReduceErrorHelper.throwError(job_id, error_message);
                    }
                    if(manifest.type === 'theme')
                    {
                        data.execute_sass_copier = JobToProcessHelper.needsExecuteSassCopierJob([manifest]);
                    }
                }
                context.write(job_id, data);
            }
            catch(error)
            {
                log.error({
                    title: 'MANIFEST_LOADER_MAP_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error.message);
            }
        }

    ,   reduce: function reduce(context)
        {
            var job_id = context.key;
            try
            {
                var execute_sass_copier = false;
                _.each(context.values, function (value)
                {
                    var data = JSON.parse(value);
                    execute_sass_copier = execute_sass_copier || !!data.execute_sass_copier;
                    if(execute_sass_copier)
                    {
                        return;
                    }
                });

                context.write(job_id, {execute_sass_copier: execute_sass_copier});
            }
            catch(error)
            {
                log.error({
                    title: 'MANIFEST_LOADER_REDUCE_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error.message);
            }
        }

    ,   summarize: function summarize(context)
        {
            var error_jobs = MapReduceErrorHelper.handleErrors(context)
            ,   jobs = {};
            context.output.iterator().each(function(job_id, value)
            {
                jobs[job_id] = jobs[job_id] || {
                    status: JobToProcessHelper.DONE
                ,   data: JSON.parse(value)
                };

                if(error_jobs[job_id])
                {
                    jobs[job_id] = {
                        status: JobToProcessHelper.ERROR
                    ,   data: error_jobs[job_id]
                    };
                }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);
        }

    };

    return manifest_loader;
});
