/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/log'
    ,   'N/file'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../Services/FileApiSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   file_module
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   MapReduceErrorHelper
    ,   FileApi
    )
{
    var restore_backup = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.RESTORE_BACKUP_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this)
            ,   files_to_restore = [];

            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.IN_PROGRESS);
                    var data = JobToProcessHelper.getJobToProcessData(job_to_process.id);
                    var job_files = data.bkp_files;

                    job_files = _.each(job_files, function(job_file)
                    {
                        job_file.job_id = job_to_process.id;
                    });

                    files_to_restore = files_to_restore.concat(job_files);
                    files_to_restore.push({
                        is_metadata: true
                    ,   job_id: job_to_process.id});
                }
                catch(error)
                {
                    log.error({
                        title: 'RESTORE_BACKUP_JOB'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_to_process.id, error));
                }
            });
            return files_to_restore;
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var file = JSON.parse(context.value);
                job_id = file.job_id;
                var file_id;

                if(file.is_metadata)
                {
                    context.write(_.uniqueId() + _.random(0, 1000), file);
                    return;
                }
                else
                {
                    file_id = FileApi.searchFile('bkp_' + file.name, file.folder_id, true);
                    if(!file_id)
                    {
                        log.debug({
                            title: 'RESTORE_BACKUP'
                        ,   details: 'There is no backup file to restore for ' + file.name
                        });
                        return;
                    }
                }

                var src_files = [file_id];
                var dest_files = [{folder_id: file.folder_id, name: file.name}];
                FileApi.copyFiles(src_files, dest_files);

                file.id = file_id;
                context.write(file_id, file);
            }
            catch(error)
            {
                log.error({
                    title: 'RESTORE_BACKUP_MAP_JOB'
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
                var files = [];
                _.each(context.values, function(value)
                {
                    var file = JSON.parse(value);
                    job_id = file.job_id;
                    try
                    {
                        if(!file.is_metadata)
                        {
                            file_module.delete(file.id);
                            file.name = file.name.replace('bkp_','');
                        }
                    }
                    catch(error)
                    {
                        log.debug({title: 'error deleting file:' + file.name});
                    }
                    files.push(file);
                });
                context.write(job_id, {output_files: files});
            }
            catch(error)
            {
                log.error({
                    title: 'RESTORE_BACKUP_REDUCE_JOB'
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

                jobs[job_id] = jobs[job_id] || {
                    status: JobToProcessHelper.DONE
                ,   data: {'output_files' : []}
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
                    files = files.concat(value.output_files);
                    jobs[job_id].data.output_files = files;
                 }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);
            JobToProcessHelper.reTriggerTask(this);
        }
    };

    return restore_backup;
});
