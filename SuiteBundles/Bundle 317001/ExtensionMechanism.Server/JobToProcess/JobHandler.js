/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */

 /**

 */
define(
    [
        'N/search'
    ,   'N/record'
    ,   'N/log'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/ActivationHelper'
    ,   '../../third_parties/underscore.js'

    ]
,   function(
        search
    ,   record
    ,   log
    ,   JobToProcessHelper
    ,   ActivationHelper
    )
{
    var job_handler = {

        createJob: function createJob(new_record_obj, type)
        {
            var job_id;
            try
            {
                if(type === JobToProcessHelper.ACTIVATION_JOB)
                {
                    job_id = JobToProcessHelper.createJobToProcess(
                        JobToProcessHelper.MANIFEST_LOADER_JOB
                    ,   JobToProcessHelper.PENDING
                    ,   new_record_obj.data
                    ,   new_record_obj.id
                    );

                    var job_data = JSON.parse(new_record_obj.data)
                    ,   activation_id = job_data.activation_metadata.activation_id;

                    ActivationHelper.updateActivationState(activation_id, ActivationHelper.PENDING_STATUS, null, null, new_record_obj.id);

                    var filters = [
                            ['custrecord_ns_sc_extmech_type', search.Operator.IS, JobToProcessHelper.ACTIVATION_JOB]
                        ,   'and'
                        ,   ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.ERROR]
                        ,   'and'
                        ,   ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.DONE]
                        ,   'and'
                        ,   ['id', search.Operator.NOTEQUALTO, new_record_obj.id]
                        ]
                    ,   jobs = JobToProcessHelper.getJobsToProcess(null, null, filters);

                    if(!jobs.length)
                    {
                        //Triggers the manifest loader only if there is not another activation taking place
                        JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.MANIFEST_LOADER_JOB);
                    }
                }
                else
                {
                    JobToProcessHelper.triggerMapReduceTask(type);
                }
            }
            catch(error)
            {
                log.error({
                    title: 'JobHandler createJob Error'
                ,   details: error.stack
                });

                if(job_id)
                {
                    JobToProcessHelper.updateToProcessState(job_id, JobToProcessHelper.ERROR, error.message, JobToProcessHelper.MANIFEST_LOADER_JOB);
                }
                JobToProcessHelper.updateToProcessState(new_record_obj.id, JobToProcessHelper.ERROR, null, type);
            }
        }

    ,   editJob: function editJob(old_record_obj, new_record_obj)
        {
            if(new_record_obj.state === old_record_obj.state)
            {
                return;
            }

            var parent_job_data
            ,   activation_id;

            try
            {
                if(new_record_obj.state === JobToProcessHelper.ERROR)
                {
                    if(old_record_obj.parent_id)
                    {
                        JobToProcessHelper.updateToProcessState(old_record_obj.parent_id, JobToProcessHelper.ERROR, null, JobToProcessHelper.ACTIVATION_JOB);

                        parent_job_data = JobToProcessHelper.getJobToProcessData(old_record_obj.parent_id);
                        activation_id = parent_job_data.activation_metadata.activation_id;

                        ActivationHelper.updateActivationState(activation_id, ActivationHelper.ERROR_STATUS);

                        if(old_record_obj.job_type === JobToProcessHelper.IMPACT_CHANGES_JOB)
                        {
                            if(new_record_obj.data)
                            {
                                var output_files = [];
                                try
                                {
                                    output_files = JSON.parse(new_record_obj.data).output_files;

                                }catch(error)
                                {
                                    log.error({title: 'Impact changes don´t have output files', details: error});
                                }

                                if(!_.isEmpty(output_files))
                                {
                                    //restore backup
                                    JobToProcessHelper.createJobToProcess(
                                        JobToProcessHelper.RESTORE_BACKUP_JOB
                                    ,   JobToProcessHelper.PENDING
                                    ,   {bkp_files: output_files}
                                    ,   old_record_obj.parent_id
                                    );
                                    JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.RESTORE_BACKUP_JOB);
                                }
                            }
                        }

                        JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.MANIFEST_LOADER_JOB);
                    }
                }
                else if(new_record_obj.state === JobToProcessHelper.IN_PROGRESS)
                {
                    if(old_record_obj.job_type === JobToProcessHelper.MANIFEST_LOADER_JOB)
                    {
                        JobToProcessHelper.updateToProcessState(old_record_obj.parent_id, JobToProcessHelper.IN_PROGRESS, null, JobToProcessHelper.ACTIVATION_JOB);

                        parent_job_data = JobToProcessHelper.getJobToProcessData(old_record_obj.parent_id);

                        activation_id = parent_job_data.activation_metadata.activation_id;
                        ActivationHelper.updateActivationState(activation_id, ActivationHelper.IN_PROGRESS_STATUS);
                    }
                }
                else if(new_record_obj.state === JobToProcessHelper.DONE)
                {
                    if(old_record_obj.job_type === JobToProcessHelper.MANIFEST_LOADER_JOB)
                    {
                        var jobs = this._getActivationResources(old_record_obj.parent_id);
                        if(!JSON.parse(new_record_obj.data).execute_sass_copier)
                        {
                            var jobIndex = jobs.indexOf(JobToProcessHelper.SASS_JOB);
                            if(jobIndex !== -1)
                            {
                                jobs[jobIndex] = JobToProcessHelper.SASS_COMPILER_JOB;
                            }
                        }

                        _.each(jobs, function(compile_job)
                        {
                           JobToProcessHelper.createJobToProcess(
                                compile_job
                            ,   JobToProcessHelper.PENDING
                            ,   {}
                            ,   old_record_obj.parent_id
                            );

                           JobToProcessHelper.triggerMapReduceTask(compile_job);
                        });
                    }
                    else if(old_record_obj.job_type === JobToProcessHelper.IMPACT_CHANGES_JOB)
                    {
                        JobToProcessHelper.updateToProcessState(old_record_obj.parent_id, JobToProcessHelper.DONE, null, JobToProcessHelper.ACTIVATION_JOB);

                        parent_job_data = JobToProcessHelper.getJobToProcessData(old_record_obj.parent_id);
                        activation_id = parent_job_data.activation_metadata.activation_id;
                        //set activation status to finished
                        ActivationHelper.updateActivationState(activation_id, ActivationHelper.FINISHED_STATUS);

                        JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.MANIFEST_LOADER_JOB);
                    }
                    else if(old_record_obj.job_type === JobToProcessHelper.SASS_JOB)
                    {
                        JobToProcessHelper.createJobToProcess(
                            JobToProcessHelper.SASS_COMPILER_JOB
                        ,   JobToProcessHelper.PENDING
                        ,   {}
                        ,   old_record_obj.parent_id
                        );

                        JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.SASS_COMPILER_JOB);
                    }
                    else if(old_record_obj.parent_id)
                    {
                       //if EDIT and job type is javascript, sass, templates or configs and the status is DONE, then check if all others childs jobs are
                       //DONE to throw the impact changes

                       var resources = this._getActivationResources(old_record_obj.parent_id);

                       if(_.contains(resources, JobToProcessHelper.SASS_JOB))
                       {
                           resources = resources.concat(JobToProcessHelper.SASS_COMPILER_JOB);
                       }

                       var compilation_jobs =  _.object(resources, resources);

                       if(compilation_jobs[old_record_obj.job_type])
                       {
                           var filters = [['custrecord_ns_sc_extmech_parent_job_id', search.Operator.IS, old_record_obj.parent_id]]
                           ,    child_jobs = JobToProcessHelper.getJobsToProcess(null, null, filters);

                           var has_not_finished = _.find(child_jobs, function(child)
                           {
                               delete compilation_jobs[child.type];
                               return child.state !== JobToProcessHelper.DONE;
                           });

                           if(!has_not_finished && (_.isEmpty(compilation_jobs) || _.isEqual(compilation_jobs, { 'SASS_JOB' : JobToProcessHelper.SASS_JOB})))
                           {
                               JobToProcessHelper.createJobToProcess(
                                   JobToProcessHelper.IMPACT_CHANGES_JOB
                               ,   JobToProcessHelper.PENDING
                               ,   {}
                               ,   old_record_obj.parent_id
                               );

                               JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.IMPACT_CHANGES_JOB);
                           }
                       }
                   }
                }
            }
            catch(error)
            {
                log.error({
                    title: 'JobHandler editJob Error'
                ,   details: error.stack
                });

                JobToProcessHelper.updateToProcessState(old_record_obj.id, JobToProcessHelper.ERROR, error.message, old_record_obj.job_type);
                if(old_record_obj.parent_id)
                {
                    JobToProcessHelper.updateToProcessState(old_record_obj.parent_id, JobToProcessHelper.ERROR, null, JobToProcessHelper.ACTIVATION_JOB);
                }
            }
        }

    ,   _getActivationResources: function _getActivationResources(job_id)
        {
            var activation_job_data = JobToProcessHelper.getJobToProcessData(job_id)
            ,   ssp_application = activation_job_data.ssp_application || {}
            ,   app_manifest = ssp_application.app_manifest || {};

            var activation_resources = app_manifest.extensible_resources
            ,   jobs = JobToProcessHelper.extensionResourcesToJobNames(activation_resources);
            return _.intersection(jobs,  JobToProcessHelper.getCompilationJobs());
        }

    };

    return job_handler;
});
