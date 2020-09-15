/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/task'
    ,   'N/log'
    ,   'N/runtime'
    ,   'N/error'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../JobToProcess/JobHandler'
    ]
,   function(
        task
    ,   log
    ,   runtime
    ,   error_module
    ,   JobToProcessHelper
    ,   JobHandler
    )
{
    var ext_to_process_job_user_event = {

        beforeSubmit: function beforeSubmit(context)
        {
            var operation =  context.type;

            if(operation === context.UserEventType.EDIT || operation === 'xedit')
            {
                var new_record = context.newRecord
                ,   old_record = context.oldRecord
                ,   old_state = old_record.getValue({fieldId: 'custrecord_ns_sc_extmech_state'})
                ,   new_state = new_record.getValue({fieldId: 'custrecord_ns_sc_extmech_state'});

                //validate invalid states transitions
                var pending_to_in_progress = old_state === JobToProcessHelper.PENDING && (new_state === JobToProcessHelper.IN_PROGRESS || new_state === JobToProcessHelper.ERROR)
                ,   in_progress_to_error = old_state === JobToProcessHelper.IN_PROGRESS && new_state === JobToProcessHelper.ERROR
                ,   in_progress_to_done = old_state === JobToProcessHelper.IN_PROGRESS && new_state === JobToProcessHelper.DONE;

                if(!pending_to_in_progress && !in_progress_to_error && !in_progress_to_done)
                {
                    throw error_module.create({name: 'Invalid job state transition', message: 'From ' + old_state + ' to ' + new_state});
                }
            }
        }

    ,   afterSubmit: function afterSubmit(context)
        {
            var new_record = context.newRecord
            ,   jobType = new_record && new_record.getValue({fieldId: 'custrecord_ns_sc_extmech_type'})
            ,   operation = context.type;

            if(jobType && jobType === JobToProcessHelper.EXTENSION_JOB &&
               operation === context.UserEventType.CREATE)
            {
                JobToProcessHelper.triggerMapReduceTask(JobToProcessHelper.EXTENSION_JOB);
            }
            else
            {
                var new_record_obj = {};
                new_record_obj.id = context.newRecord.getValue({fieldId: 'id'});
                new_record_obj.state = context.newRecord.getValue({fieldId: 'custrecord_ns_sc_extmech_state'});
                new_record_obj.data = context.newRecord.getValue({fieldId: 'custrecord_ns_sc_extmech_data'});

                if(operation === context.UserEventType.CREATE)
                {
                    JobHandler.createJob(new_record_obj, jobType);
                }
                else if(operation === context.UserEventType.EDIT || operation === 'xedit')
                {
                    var old_record_obj = {};
                    old_record_obj.id = context.oldRecord.getValue({fieldId: 'id'});
                    old_record_obj.parent_id = context.oldRecord.getValue({fieldId: 'custrecord_ns_sc_extmech_parent_job_id'});
                    old_record_obj.job_type = context.oldRecord.getValue({fieldId: 'custrecord_ns_sc_extmech_type'});
                    old_record_obj.data = context.oldRecord.getValue({fieldId: 'custrecord_ns_sc_extmech_data'});

                    JobHandler.editJob(old_record_obj, new_record_obj);
                }
            }

            //Block commented because in the early releases we want to keep the jobs record information for debuggin. This should be uncommented in the future
            //HEADS UP!!! The code below should be modified to contemplate the extension installer jobs. As is it now it will delete them

            //Delete those jobs that are not associated with any activation
            // var scriptObj = runtime.getCurrentScript()
            // ,   activations = _.indexBy(ExtensionHelper.getActivations() || [], 'activation_job')
            // ,   jobs = JobToProcessHelper.getJobsToProcess(null, null, []);
            // _.each(jobs, function(job)
            // {
            //     if(scriptObj.getRemainingUsage() < 20)
            //     {
            //         return;
            //     }

            //     var activation_job_id = job.parent_job_id || job.id;
            //     if(!activations[activation_job_id])
            //     {
            //         JobToProcessHelper.deleteExtensionToProcess(job.id);
            //     }
            // });
        }

    };

    return ext_to_process_job_user_event;
});
