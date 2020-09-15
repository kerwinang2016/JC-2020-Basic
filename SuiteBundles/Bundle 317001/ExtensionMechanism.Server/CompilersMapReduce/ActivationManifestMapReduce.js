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
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   file_module
    ,   JobToProcessHelperSS2
    ,   CacheHelper
    ,   MapReduceErrorHelper
    )
{
    var sass_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelperSS2.ACT_MANIFEST_COMPILER_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelperSS2.getJobs(this)
            ,   manifests = [];

            var Cache = CacheHelper('MANIFEST_LOADER');
            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    JobToProcessHelperSS2.updateToProcessState(job_to_process.id, JobToProcessHelperSS2.IN_PROGRESS);

                    var parent_data = JobToProcessHelperSS2.getJobToProcessData(job_to_process.parent_job_id)
                    ,   domain = parent_data.activation_metadata.domain
                    ,   subsidiary = parent_data.activation_metadata.subsidiary
                    ,   location = parent_data.activation_metadata.location
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   extensions_folder = JSON.parse(parent_data.ssp_application.extensions_folder)
                    ,   extensions = [];

                    if(parent_data.all_app_extensions[activation_id] && parent_data.all_app_extensions[activation_id].extensions)
                    {
                        extensions = _.values(parent_data.all_app_extensions[activation_id].extensions);
                    }

                    var job_manifests = [];

                    job_manifests = _.map(parent_data.manifests, function(manifest_id)
                    {
                        var manifest = Cache.get(manifest_id);
                        manifest = JSON.parse(manifest);
                        var manifest_path = manifest.path;
                        manifest = JSON.parse(manifest.contents);

                        manifest.path = manifest_path;

                        var extension = _.find(extensions, function(ext){return ext.manifest_id === manifest_id;});

                        return {
                            job_id: job_to_process.id
                        ,   manifest: manifest
                        ,   domain: domain
                        ,   subsidiary: subsidiary
                        ,   location: location
                        ,   extensions_folder: extensions_folder
                        ,   activation_id: activation_id
                        ,   extension_id: extension.extension_id
                        };
                    });

                    job_manifests.push({
                        is_metadata: true
                    ,   job_id: job_to_process.id
                    ,   domain: domain
                    ,   subsidiary: subsidiary
                    ,   location: location
                    ,   extensions_folder: extensions_folder
                    ,   activation_id: activation_id
                    });

                    manifests = manifests.concat(job_manifests);
                }
                catch(error)
                {
                    log.error({
                        title: 'ACT_MANIFEST_COMPILER_JOB'
                    ,   details: error
                    });

                    JobToProcessHelperSS2.updateToProcessState(job_to_process.id, JobToProcessHelperSS2.ERROR, MapReduceErrorHelper.getErrorMessage(job_to_process.id, error));
                }
            });
            return manifests;
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var manifest = JSON.parse(context.value);
                job_id = manifest.job_id;

                context.write(job_id, manifest);
            }
            catch(error)
            {
                log.error({
                    title: 'ACT_MANIFEST_MAP_JOB'
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
                var manifests = []
                ,   domain
                ,   subsidiary
                ,   location
                ,   extensions_folder
                ,   activation_id
                ,   extension_id
                ,   is_metadata;

                _.each(context.values, function(value)
                {
                    var data = JSON.parse(value);
                    job_id = data.job_id;
                    domain = data.domain;
                    subsidiary = data.subsidiary;
                    location = data.location;
                    extensions_folder = data.extensions_folder;
                    activation_id = data.activation_id;
                    extension_id = data.extension_id;
                    is_metadata = data.is_metadata;

                    if(!is_metadata)
                    {
                        data.manifest.activation_id = activation_id;
                        data.manifest.extension_id = extension_id;
                        manifests.push(data.manifest);
                    }

                });

                var activation_key = _.compact([
                    domain
                ,   subsidiary
                ,   location
                ]).join('-');

                var file_name = 'tmp_activationManifest-' + activation_key + '.json';

                var newFile = file_module.create({
                    name: file_name
                ,   fileType: file_module.Type.PLAINTEXT
                ,   folder: extensions_folder.folder_id
                ,   contents: JSON.stringify(manifests, null, 4)
                ,   isOnline: true
                });
                newFile.save();

                context.write(job_id, {
                    file: file_name
                ,   activation_id: activation_id
                ,   folder_id: extensions_folder.folder_id
                });
            }
            catch(error)
            {
                log.error({
                    title: 'ACT_MANIFEST_REDUCE_JOB'
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
                    status: JobToProcessHelperSS2.DONE
                ,   data: {'activation_id' : activation_id, 'output_files' : []}
                };

                if(error_jobs[job_id])
                {
                    jobs[job_id] = {
                        status: JobToProcessHelperSS2.ERROR
                    ,   data: error_jobs[job_id]
                    };
                }
                else
                {
                    var files = jobs[job_id].data.output_files;
                    files = files.concat({'name': value.file, 'folder_id' : value.folder_id});

                    jobs[job_id].data.output_files = files;
                }

                return true;
            });

            JobToProcessHelperSS2.setJobsData(jobs, error_jobs);

            JobToProcessHelperSS2.reTriggerTask(this);
        }
    };

    return sass_compiler;
});
