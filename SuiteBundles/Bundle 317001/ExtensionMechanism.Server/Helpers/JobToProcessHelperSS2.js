/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */

 /**
    Handles both extension to process job, handled during installation of extensions
    and activations to process jobs, created during an activation
 */
 define(
    [
        'N/search'
    ,   'N/record'
    ,   'N/task'
    ,   'N/format'
    ,   'N/log'
    ,   '../Instrumentation/Instrumentation'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        search
    ,   record
    ,   task
    ,   format
    ,   log
    ,   Instrumentation
    )
{
    var ext_to_process_helper = {

        PENDING: 'PENDING'
    ,   ERROR: 'ERROR'
    ,   IN_PROGRESS: 'IN_PROGRESS'
    ,   DONE: 'DONE'

    ,   EXTENSION_JOB: 'EXTENSION_JOB'
    ,   ACTIVATION_JOB: 'ACTIVATION_JOB'
    ,   ACT_MANIFEST_COMPILER_JOB: 'ACT_MANIFEST_COMPILER_JOB'
    ,   SASS_JOB: 'SASS_JOB'
    ,   SASS_COMPILER_JOB: 'SASS_COMPILER_JOB'
    ,   JAVASCRIPT_JOB: 'JAVASCRIPT_JOB'
    ,   TEMPLATES_JOB: 'TEMPLATES_JOB'
    ,   SSP_LIBRARIES_JOB: 'SSP_LIBRARIES_JOB'
    ,   CONFIGURATION_JOB: 'CONFIGURATION_JOB'
    ,   MANIFEST_LOADER_JOB: 'MANIFEST_LOADER_JOB'
    ,   IMPACT_CHANGES_JOB: 'IMPACT_CHANGES_JOB'
    ,   RESTORE_BACKUP_JOB: 'RESTORE_BACKUP_JOB'

    ,   JOB_IN_PROGRESS_TIME_OUT: 15 * 60 * 1000 //ms (mins * 60 * 1000)
    ,   JOB_PENDING_TIME_OUT: 60 * 60 * 1000 //ms (mins * 60 * 1000)

    ,   getJobScriptMapping: function getJobScriptMapping(type)
        {
            var job_mr_mapping = {};

            job_mr_mapping[this.EXTENSION_JOB] = {
                scriptId: 'customscript_ext_mech_ext_installer'
            ,   deployId: 'customdeploy_ext_mech_ext_installer'
            };

            job_mr_mapping[this.ACTIVATION_JOB] = {
                scriptId: 'customscript_ext_mech_mr_manifest_loader'
            ,   deployId: 'customdeploy_ext_mech_mr_manifest_loader'
            };

            job_mr_mapping[this.ACT_MANIFEST_COMPILER_JOB] = {
                scriptId: 'customscript_ext_mech_mr_act_manifest'
            ,   deployId: 'customdeploy_ext_mech_mr_act_manifest'
            };

            job_mr_mapping[this.JAVASCRIPT_JOB] = {
                scriptId: 'customscript_ext_mech_mr_js_job'
            ,   deployId: 'customdeploy_ext_mech_mr_js_job'
            };

            job_mr_mapping[this.SASS_JOB] = {
                scriptId: 'customscript_ext_mech_mr_sass_job'
            ,   deployId: 'customdeploy_ext_mech_mr_sass_job'
            };

            job_mr_mapping[this.SASS_COMPILER_JOB] = {
                scriptId: 'customscript_ext_mech_mr_sass_comp_job'
            ,   deployId: 'customdeploy_ext_mech_mr_sass_comp_job'
            };

            job_mr_mapping[this.TEMPLATES_JOB] = {
                scriptId: 'customscript_ext_mech_mr_templates_job'
            ,   deployId: 'customdeploy_ext_mech_mr_templates_job'
            };

            job_mr_mapping[this.SSP_LIBRARIES_JOB] = {
                scriptId: 'customscript_ext_mech_mr_ssp_lib_job'
            ,   deployId: 'customdeploy_ext_mech_mr_ssp_lib_job'
            };

            job_mr_mapping[this.CONFIGURATION_JOB] = {
                scriptId: 'customscript_ext_mech_mr_config_job'
            ,   deployId: 'customdeploy_ext_mech_mr_config_job'
            };

            job_mr_mapping[this.MANIFEST_LOADER_JOB] = {
                scriptId: 'customscript_ext_mech_mr_manifest_loader'
            ,   deployId: 'customdeploy_ext_mech_mr_manifest_loader'
            };

            job_mr_mapping[this.IMPACT_CHANGES_JOB] = {
                scriptId: 'customscript_ext_mech_mr_impact_changes'
            ,   deployId: 'customdeploy_ext_mech_mr_impact_changes'
            };

            job_mr_mapping[this.RESTORE_BACKUP_JOB] = {
                scriptId: 'customscript_ext_mech_mr_restore_backup'
            ,   deployId: 'customdeploy_ext_mech_mr_restore_backup'
            };

            return job_mr_mapping[type];
        }

    ,   _getJobApplications : function _getJobApplications(job_id)
        {
            var parent_data = this.getJobToProcessData(job_id);
            var applications = parent_data.ssp_application.app_manifest.application;
            if(!applications)
            {
                if(parent_data.ssp_application.app_manifest.type === 'SCIS')
                {
                    applications = ['instore'];
                }
                else
                {
                    applications = ['shopping', 'myaccount', 'checkout'];
                }
            }
            return applications;
        }

        /**
        * sort_order: DESC or ASC
        * max_to_process: an int value
        * filters: array of filters to apply in the search
        */
    ,   getJobsToProcess: function getJobsToProcess(sort_order, max_to_process, filters)
        {
            var ext_to_process_search = search.create({
                type: 'customrecord_ns_sc_extmech_to_process'
            ,   filters: filters || []
            ,   columns: [
                    'custrecord_ns_sc_extmech_type'
                ,   'custrecord_ns_sc_extmech_state'
                ,   'custrecord_ns_sc_extmech_data'
                ,   'custrecord_ns_sc_extmech_parent_job_id'
                ,   'custrecord_ns_sc_extmech_start_date'
                ,   'custrecord_ns_sc_extmech_end_date'
                ,   search.createColumn({
                        name: 'custrecord_ns_sc_extmech_create_date'
                    ,   sort: sort_order || search.Sort.ASC
                    })
                ]
            })
            .run();

            var ext_to_process = [];
            ext_to_process_search.each(function(result)
            {
                var data = result.getValue({name: 'custrecord_ns_sc_extmech_data'}) || '{}';

                ext_to_process.push({
                    id:             result.id
                ,   type:           result.getValue({name: 'custrecord_ns_sc_extmech_type'})
                ,   state:          result.getValue({name: 'custrecord_ns_sc_extmech_state'})
                ,   data:           JSON.parse(data)
                ,   created:        result.getValue({name: 'custrecord_ns_sc_extmech_create_date'})
                ,   parent_job_id:  result.getValue({name: 'custrecord_ns_sc_extmech_parent_job_id'})
                ,   start_date:     result.getValue({name: 'custrecord_ns_sc_extmech_start_date'})
                ,   end_date:       result.getValue({name: 'custrecord_ns_sc_extmech_end_date'})
                });

                return !max_to_process || ext_to_process.length < max_to_process;
            });
            return ext_to_process;
        }

    ,   getJobs: function getJobs(context)
        {
            var filters = [
                ['custrecord_ns_sc_extmech_type', search.Operator.IS,  context.JOB_TYPE],
                'and',
                ['custrecord_ns_sc_extmech_state', search.Operator.IS,  this.PENDING]
            ];

            var jobs_to_process = this.getJobsToProcess(search.Sort.ASC, context.MAX_TO_PROCESS, filters);

            return jobs_to_process;
        }

    ,   reTriggerTask: function reTriggerTask(context)
        {
            //search for other jobs to process and re-trigger this map reduce if is needed
            var job_to_process = this.getJobsToProcess(search.Sort.ASC, 1, [
                ['custrecord_ns_sc_extmech_state', search.Operator.IS, this.PENDING]
            ,   'and'
            ,   ['custrecord_ns_sc_extmech_type', search.Operator.IS, context.JOB_TYPE]
            ]);
            if(!_.isEmpty(job_to_process))
            {
                this.triggerMapReduceTask(context.JOB_TYPE);
            }
        }

    ,   triggerMapReduceTask: function triggerMapReduceTask(type)
        {
            try
            {
                var map = this.getJobScriptMapping(type)
                ,   job_task = task.create({taskType: task.TaskType.MAP_REDUCE});

                job_task.scriptId = map.scriptId;
                job_task.deploymentId = map.deployId;
                job_task.submit();
            }
            catch(error)
            {
                if(error.name !== 'MAP_REDUCE_ALREADY_RUNNING')
                {
                    throw error;
                }
            }
        }

    ,   getJobToProcessData: function(job_id)
        {
            var job_to_process = search.lookupFields({
                type: 'customrecord_ns_sc_extmech_to_process'
            ,   id: job_id
            ,   columns: ['custrecord_ns_sc_extmech_data']
            });

            if(!job_to_process || !job_to_process.custrecord_ns_sc_extmech_data)
            {
                return null;
            }

            return JSON.parse(job_to_process.custrecord_ns_sc_extmech_data);
        }

    ,   getCompilationJobs: function()
        {
            return [
                this.SASS_JOB
            ,   this.JAVASCRIPT_JOB
            ,   this.TEMPLATES_JOB
            ,   this.SSP_LIBRARIES_JOB
            ,   this.CONFIGURATION_JOB
            ,   this.ACT_MANIFEST_COMPILER_JOB
            ];
        }

    ,   extensionResourcesToJobNames: function(resources_array)
        {
            if(!resources_array)
            {
                return [];
            }

            var activation_manifest_resource = this.ACT_MANIFEST_COMPILER_JOB.replace('_JOB', '');
            resources_array.push(activation_manifest_resource);

            resources_array = _.map(resources_array, function(resource)
            {
                return resource.toUpperCase().replace('-','_') + '_JOB';
            });

            return resources_array;
        }

    ,   deleteExtensionToProcess: function deleteExtensionToProcess(job_id)
        {
            record.delete({
                type: 'customrecord_ns_sc_extmech_to_process'
            ,   id: job_id
            });
        }

    ,   updateToProcessState: function updateToProcessState(job_id, job_state, data, job_type)
        {
            this._validateJobState(job_state);

            var values = {'custrecord_ns_sc_extmech_state': job_state};

            if(!_.isEmpty(data))
            {
                var job_data = _.isString(data) ? {msg: data} : data;
                job_data = JSON.stringify(job_data);

                values.custrecord_ns_sc_extmech_data = job_data;
            }

            var date_string = format.format({
                value: new Date(),
                type: format.Type.DATETIMETZ
            });

            if(job_state === this.IN_PROGRESS)
            {
                values.custrecord_ns_sc_extmech_start_date = date_string;
            }
            else if(job_state === this.DONE || job_state === this.ERROR)
            {
                values.custrecord_ns_sc_extmech_end_date = date_string;
            }

            record.submitFields({
                type: 'customrecord_ns_sc_extmech_to_process'
            ,   id: job_id
            ,   values: values
            });

            this._instrument(job_id, job_type, job_state);
        }

    ,   _instrument: function(job_id, job_type, job_state)
        {
            var jobs_to_instrument = [this.ACTIVATION_JOB, this.EXTENSION_JOB]
            ,   states_to_instrument = [this.DONE, this.ERROR];

            if(_.contains(jobs_to_instrument, job_type) && _.contains(states_to_instrument, job_state))
            {
                Instrumentation.instrument(job_id, job_type, this);
            }
        }

    ,   _validateJobState: function _validateJobState(job_state)
        {
            var states = [this.PENDING, this.ERROR, this.IN_PROGRESS, this.DONE];
            if(!_.contains(states, job_state))
            {
                throw new Error('Invalid job state: ' + job_state);
            }
        }

    ,   createJobToProcess: function createJobToProcess(type, job_state, data, parent_job)
        {
            data = _.isString(data) ? data : JSON.stringify(data);

            var extension_to_process = record.create({type: 'customrecord_ns_sc_extmech_to_process'});
            extension_to_process.setValue({fieldId: 'custrecord_ns_sc_extmech_type', value: type});
            extension_to_process.setValue({fieldId: 'custrecord_ns_sc_extmech_state', value: job_state});
            extension_to_process.setValue({fieldId: 'custrecord_ns_sc_extmech_data', value: data});

            if(parent_job)
            {
                extension_to_process.setValue({fieldId: 'custrecord_ns_sc_extmech_parent_job_id', value: parent_job});
            }

            var record_id = extension_to_process.save();

            return record_id;
        }

    ,   getParentJobId: function getParentJobId(job_id)
        {
            var job_to_process = search.lookupFields({
                type: 'customrecord_ns_sc_extmech_to_process'
            ,   id: job_id
            ,   columns: ['custrecord_ns_sc_extmech_parent_job_id']
            });
            return job_to_process.custrecord_parent_job_id;
        }

    ,   setJobsData: function setJobsData(jobs, error_jobs, type)
        {
            var self = this;

            if(!_.isEmpty(jobs))
            {
                _.each(jobs, function(job, job_id)
                {
                    self.updateToProcessState(job_id, job.status, job.data, type);
                });
            }
            else
            {
                _.each(error_jobs, function(job, job_id)
                {
                    self.updateToProcessState(job_id, self.ERROR, job, type);
                });
            }
        }

    ,   needsExecuteSassCopierJob: function needsExecuteSassCopierJob(manifests)
        {
            var executeSassCopier = false;
            _.each(manifests, function(manifest)
            {
                if(manifest.type === 'theme' && manifest.override)
                {
                    _.each(manifest.override, function(override)
                    {
                        if(override.src && override.src.replace(/^.*(\..*)$/, '$1') === '.scss')
                        {
                            executeSassCopier = true;
                            return;
                        }
                    });
                }
            });
            return executeSassCopier;
        }
    };

    return ext_to_process_helper;
});
