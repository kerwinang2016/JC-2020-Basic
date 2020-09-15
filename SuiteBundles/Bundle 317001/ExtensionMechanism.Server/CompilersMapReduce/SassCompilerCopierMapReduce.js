/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/log'
    ,   'N/error'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../Helpers/ActivationHelper'
    ,   '../Services/FileApiSS2'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   error_module
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   ActivationHelper
    ,   FileApi
    ,   Utils
    ,   MapReduceErrorHelper
    )
{
    var sass_compiler = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.SASS_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this);

            var Cache = CacheHelper('MANIFEST_LOADER');

            var job_files = [];
            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id)
                    ,   emb_folder_id = Utils.getEMBFolderId()
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   theme_manifest
                    ,   theme_manifest_path
                    ,   sass_files = [];

                    _.each(parent_data.manifests, function(manifest_id)
                    {
                        var manifest = Cache.get(manifest_id);
                        manifest = JSON.parse(manifest);

                        var manifest_path = manifest.path;
                        manifest = JSON.parse(manifest.contents);

                        if(manifest.type === 'theme')
                        {
                            theme_manifest = manifest;
                            theme_manifest_path = manifest_path;
                        }

                        var resource = manifest.sass;
                        if(resource && _.isArray(resource.files))
                        {
                            var files = _.map(resource.files, function(file_path)
                            {
                                return {
                                    job_id: job_to_process.id
                                ,   emb_folder_id: emb_folder_id
                                ,   activation_id: activation_id
                                ,   extension_path: manifest_path
                                ,   extension_name: manifest.name
                                ,   extension_vendor: manifest.vendor
                                ,   file_path: file_path
                                };
                            });

                            sass_files = _.union(sass_files, files);
                        }
                    });

					var	overrides = theme_manifest && theme_manifest.override;

					_.each(overrides, function(override)
					{
						var index = _.findIndex(sass_files, function(sass_file)
                        {
                            var file_path = [
                                sass_file.extension_vendor
                            ,   sass_file.extension_name
                            ,   sass_file.file_path
                            ].join('/');

                            return file_path === override.dst;
                        });

						if(index > 0)
						{
                            sass_files[index].override = [
                                theme_manifest_path
                            ,	override.src
                            ].join('/');
						}
					});

                    job_files = job_files.concat(sass_files);
                }
                catch(error)
                {
                    log.error({
                        title: 'SASS_COMPILER_COPIER_INPUTDATA_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_to_process.id, error));
                }
            });

            return job_files;
        }

    ,   map: function map(context)
        {
            //Creates the folders for the given file
            var job_id;
            try
            {
                var data = JSON.parse(context.value);
                job_id = data.job_id;

                var parent_id = data.emb_folder_id
                ,   activation_id = data.activation_id
                ,   file_path = [
                        'overrides'
                    ,   'activation ' + activation_id
                    ,   data.extension_vendor
                    ,   data.extension_name
                    ,   data.file_path
                    ].join('/');

                var folders_to_create = _.initial(file_path.split('/'));
                _.each(folders_to_create, function(folder)
                {
                    parent_id = FileApi.createFolder(folder, parent_id);
                });

                //Group files under the same folder
                context.write(parent_id, data);
            }
            catch(error)
            {
                log.error({
                    title: 'SASS_COMPILER_COPIER_MAP_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   reduce: function reduce(context)
        {
            //Copies all the files to the given destination folder (context.key)
            var job_id;

            try
            {
                _.each(context.values, function(value)
                {
                    var data = JSON.parse(value);
                    job_id = data.job_id;

                    var src_file = data.override || [
                        data.extension_path
                    ,   data.file_path
                    ].join('/');

                    var file_name = _.last(data.file_path.split('/'));

                    FileApi.copyFiles(
                        [src_file]
                    ,   [{
                            name: file_name
                        ,   folder_id: context.key
                        }]);
                });

                context.write(job_id, {});
            }
            catch(error)
            {
                log.error({
                    title: 'SASS_COMPILER_COPIER_REDUCE_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   summarize: function summarize(context)
        {
            var error_jobs = MapReduceErrorHelper.handleErrors(context)
            ,   jobs = {};
            context.output.iterator().each(function(job_id)
            {
                jobs[job_id] = jobs[job_id] || {
                    status: JobToProcessHelper.DONE
                ,   data: {}
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

            JobToProcessHelper.reTriggerTask(this);
        }
    };

    return sass_compiler;
});
