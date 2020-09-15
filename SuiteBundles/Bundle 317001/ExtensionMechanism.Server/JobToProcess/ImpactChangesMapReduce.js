/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/record'
    ,   'N/search'
    ,   'N/log'
    ,   'N/file'
    ,   '../Instrumentation/Instrumentation'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/CacheHelper'
    ,   '../Services/FileApiSS2'
    ,   '../Helpers/MapReduceErrorHelper'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        record
    ,   search
    ,   log
    ,   file_module
    ,   Instrumentation
    ,   JobToProcessHelper
    ,   CacheHelper
    ,   FileApi
    ,   MapReduceErrorHelper
    ,   ExtensionHelper
    )
{
    var impact_changes = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.IMPACT_CHANGES_JOB

    ,   getInputData: function getInputData()
        {
            var jobs_to_process = JobToProcessHelper.getJobs(this)
            ,   jobs_files = []
            ,   job_id
            ,   self = this;

            var Cache = CacheHelper('MANIFEST_LOADER');

            _.each(jobs_to_process, function(job_to_process)
            {
                try
                {
                    job_id = job_to_process.id;
                    JobToProcessHelper.updateToProcessState(job_to_process.id, JobToProcessHelper.IN_PROGRESS);

                    var parent_data = JobToProcessHelper.getJobToProcessData(job_to_process.parent_job_id)
                    ,   ssp_app_folder_id = parent_data.ssp_application.folder_id
                    ,   extensions_folder = JSON.parse(parent_data.ssp_application.extensions_folder)
                    ,   activation_id = parent_data.activation_metadata.activation_id
                    ,   ssp2_application = parent_data.ssp2_application || {};

                    var extensions = parent_data.all_app_extensions[activation_id] || {};
                    extensions = extensions.extensions || {};
                    extensions = _.indexBy(extensions, 'manifest_id');

                    var filters = [['custrecord_ns_sc_extmech_parent_job_id', search.Operator.IS, job_to_process.parent_job_id]];

                    //adding files result of others jobs with the same parent
                    var sameParentJobs = JobToProcessHelper.getJobsToProcess(null, 9, filters);
                    var output_files = [];
                    _.each(sameParentJobs, function(job)
                    {
                        var job_data = job.data;
                        if(job_data) {
                            if (job_data.output_files) {
                                output_files = output_files.concat(_.map(job_data.output_files, function (file) {
                                    file.ssp_app_folder_id = ssp_app_folder_id;
                                    file.extensions_folder_id = extensions_folder.folder_id;
                                    file.job_id = job_id;
                                    return file;
                                }));
                            }

                            if (!_.isEmpty(job_data.dependencies)) {
                                job_data.dependencies.is_dependency = true;
                                job_data.dependencies.job_id = job_id;
                                job_data.dependencies.name = job_id + job.type;
                                output_files.push(job_data.dependencies);
                            }
                        }
                    });

                    output_files = self.concatWithPreprocessor(output_files);

                    _.each(parent_data.manifests, function(manifest_id)
                    {
                        var manifest = Cache.get(manifest_id);
                        manifest = JSON.parse(manifest);

                        var manifest_path = manifest.path;
                        manifest = JSON.parse(manifest.contents);

                        //adding assets entry
                        var assets_files = _.flatten(_.pluck(manifest.assets, 'files'));
                        assets_files = _.unique(assets_files);
                        _.each(assets_files, function(asset_resource)
                        {
                            output_files.push({
                                extension_path: manifest_path
                            ,   extension_vendor: manifest.vendor
                            ,   extension_name: manifest.name
                            ,   extension_version: manifest.version
                            ,   extensions_folder_id: extensions_folder.folder_id
                            ,   job_id: job_id
                            ,   file_path: asset_resource
                            ,   name: _.last(asset_resource.split('/'))
                            ,   is_asset: true
                            });
                        });

                        //adding SS2 entry
                        if(manifest.suitescript2 && !_.isEmpty(manifest.suitescript2.files) && !_.isEmpty(ssp2_application))
                        {
                            var extensionId = extensions[manifest_id] && extensions[manifest_id].extension_id;

                            var ss2_files = manifest.suitescript2.files;
                            _.each(ss2_files, function(ss2_resource)
                            {
                                output_files.push({
                                    extensionId: extensionId,
                                    extension_path: manifest_path,
                                    extension_vendor: manifest.vendor,
                                    extension_name: manifest.name,
                                    extension_version: manifest.version,
                                    extensions_folder_id: ssp2_application.extensions_folder_id,
                                    job_id: job_id,
                                    file_path: ss2_resource,
                                    name: _.last(ss2_resource.split('/')),
                                    activationId: activation_id,
                                    is_ss2: true
                                });
                            });
                        }
                    });

                    var extensions_to_activate = [];
                    if(parent_data.all_app_extensions[activation_id] && parent_data.all_app_extensions[activation_id].extensions)
                    {
                        extensions_to_activate = parent_data.all_app_extensions[activation_id].extensions;
                    }

                    //Add metadata entry
                    output_files.push({
                        is_metadata: true,
                        activation_id: activation_id,
                        extensions_to_activate: extensions_to_activate,
                        job_id: job_id
                    });
                    jobs_files = jobs_files.concat(output_files);
                }
                catch(error)
                {
                    log.error({
                        title: 'IMPACT_CHANGES_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job_id, JobToProcessHelper.ERROR, MapReduceErrorHelper.getErrorMessage(job_id, error));
                }
            });
            return jobs_files;
        }

    ,   concatWithPreprocessor: function concatWithPreprocessor(output_files)
        {
            var concat_with = _.filter(output_files, function(output_file){return output_file.concat_with;});
            concat_with = _.groupBy(concat_with, 'concat_with');
            output_files = _.filter(output_files, function(output_file){return !output_file.concat_with;});
            output_files = _.indexBy(output_files, 'name');
            _.each(output_files, function(output_file, name)
            {
                if(concat_with[name])
                {
                    output_file.concat_to = concat_with[name];
                }
            });
            return _.values(output_files);
        }

    ,   map: function map(context)
        {
            var job_id;
            try
            {
                var file_data = JSON.parse(context.value);
                job_id = file_data.job_id;
                if(!file_data.is_metadata && !file_data.is_dependency)
                {
                    this.manageConcatWith(file_data);
                    this.createFolders(file_data);
                    var fileContent = this.copyTmpFile(file_data, true);

                    if(file_data.is_ss2){
                        var extensionName = [
                            file_data.extension_vendor,
                            file_data.extension_name,
                            file_data.extension_version
                        ].join('.');

                        var dependencies = Instrumentation.extractDependencies(
                            file_data.activationId,
                            extensionName,
                            file_data.extensionId,
                            fileContent
                        );
                        dependencies = Instrumentation.processExtractedDependencies('SuiteScript2', [dependencies]);

                        dependencies.is_dependency = true;
                        dependencies.job_id= job_id;
                        context.write(_.uniqueId() + _.random(0, 1000), dependencies);
                    }
                }
                if(!file_data.concat_with)
                {
                    context.write(_.uniqueId() + _.random(0, 1000), file_data);
                }
            }
            catch(error)
            {
                log.error({
                    title: 'IMPACT_CHANGES_MAP_ERROR'
                ,   details: error
                });

                //write the error in cache for the current jobID in order to cancel the reduce
                var Cache = CacheHelper();
                Cache.put(job_id, error);

                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   manageConcatWith: function manageConcatWith(file_data)
        {
            var file_id
            ,   file
            ,   content = '';

            var sspFiles = [
                'tmp_ssp_libraries_ext.js',
                'tmp_ActivationContext.js'
            ];

            if(file_data.concat_to || sspFiles.indexOf(file_data.name) !== -1)
            {
                _.each(file_data.concat_to, function(file_to_concat)
                {
                    if(file_to_concat.content)
                    {
                        content += file_to_concat.content;
                        return;
                    }

                    if(file_to_concat.name && file_to_concat.folder_id)
                    {
                        file_id = FileApi.searchFile(file_to_concat.name, file_to_concat.folder_id);
                        file = file_module.load({id: file_id});
                        content += file.getContents();
                    }
                });

                file_id = FileApi.searchFile(file_data.name, file_data.folder_id, true);
                file = file_module.load({id: file_id});
                content += file.getContents();

                if(file_data.name === 'tmp_ssp_libraries_ext.js') {
                    content = '\ntry{\n' + this.getDomainContent() + '\n'+ content + '\n}catch(error){ nlapiLogExecution(\'ERROR\', \'ERROR_SSP_LIBRARIES_EXT\', JSON.stringify(error)); }';
                }else if(file_data.name === 'tmp_ActivationContext.js') {
                    var ss2Metadata = '/**';
                    ss2Metadata += '\n * @NApiVersion 2.x';
                    ss2Metadata += '\n * @NModuleScope TargetAccount';
                    ss2Metadata += '\n */\n';
                    content = ss2Metadata + content;
                }

                var newFile = file_module.create({
                    name: file.name
                ,   contents: content
                ,   fileType: file_module.Type.PLAINTEXT
                ,   folder: file_data.folder_id
                ,   isOnline: true
                });
                newFile && newFile.save();
            }
        }

    ,   createFolders: function createFolders(file_data)
        {
            if(file_data.is_asset || file_data.is_ss2)
            {
                var file_path = [
                    file_data.extension_vendor
                ,   file_data.extension_name
                ,   file_data.extension_version
                ].concat(file_data.file_path.split('/'));

                var folders_to_create = _.initial(file_path);

                var parent_id = file_data.extensions_folder_id;

                _.each(folders_to_create, function(folder)
                {
                    parent_id = FileApi.createFolder(folder, parent_id);
                    file_data.folder_id = parent_id;
                });
            }
        }

    ,   copyTmpFile: function copyTmpFile(file_data, returnFileContent)
        {
            if(file_data.is_asset || file_data.is_ss2)
            {
                var src_files = [file_data.extension_path + (file_data.is_asset ? '/assets/' : '/') + file_data.file_path];
                var dest_files = [{folder_id: file_data.folder_id, name: 'tmp_' + file_data.name}];
                return FileApi.copyFiles(src_files, dest_files, false, returnFileContent)[0];
            }
        }

    ,   reduce: function reduce(context)
        {
            var job_id
            ,   file
            ,   src_files = []//tmp files
            ,   src_files_bkp = []//files without 'tmp_'
            ,   dest_files_bkp = []//bkp files
            ,   dest_files = [];//destination files
            try
            {
                var Cache = CacheHelper()
                ,   cacheError;

                _.each(context.values, function(value)
                {
                    file = JSON.parse(value);
                    job_id = file.job_id;

                    cacheError = Cache.get(job_id);

                    //if an error has ocurred in map stage, then abort the reduce for this job
                    if(cacheError)
                    {
                        return;
                    }

                    if(file.is_metadata || file.is_dependency)
                    {
                        context.write(job_id, file);
                    }
                    else
                    {
                        file.name = file.name.replace('tmp_', '');
                        var file_id = FileApi.searchFile('tmp_' + file.name, file.folder_id, true);

                        src_files.push(file_id);
                        dest_files.push({folder_id: file.folder_id, name: file.name});

                        file_id = FileApi.searchFile(file.name, file.folder_id);
                        if(file_id)
                        {
                            src_files_bkp.push(file_id);
                            dest_files_bkp.push({folder_id: file.folder_id, name: 'bkp_' + file.name});
                        }
                    }
                });

                //if an error has ocurred in map stage, then abort the reduce for this job
                if(cacheError)
                {
                    return;
                }

                if(!file.is_metadata && !file.is_dependency)
                {
                    try
                    {
                        //backup files (src files will not exist in the first activation)
                        FileApi.copyFiles(src_files_bkp, dest_files_bkp);
                    }
                    catch(error)
                    {
                        log.debug({title: 'Error backuping files', details: error});
                    }

                    //write files
                    FileApi.moveFiles(src_files, dest_files);
                    context.write(job_id, {output_files: dest_files});
                }

            }
            catch(error)
            {
                log.error({
                    title: 'IMPACT_CHANGES_REDUCE_ERROR'
                ,   details: error
                });
                MapReduceErrorHelper.throwError(job_id, error);
            }
        }

    ,   summarize: function summarize(context)
        {
            var jobs = {};
            var error_jobs = MapReduceErrorHelper.handleErrors(context);
            var self = this;
            var data = {output_files: []};
            var dependencies = {};
            var toImpact = [];

            context.output.iterator().each(function(job_id, value)
            {
                value = JSON.parse(value);
                if(error_jobs[job_id])
                {
                    data.output_files = data.output_files.concat(value.output_files || []);
                    data.errors = error_jobs[job_id];
                    jobs[job_id] = {
                        status: JobToProcessHelper.ERROR
                    ,   data: data
                    };
                }
                else if(value.is_metadata)
                {
                    toImpact.push({
                        activation_id: value.activation_id,
                        extensions_to_activate: value.extensions_to_activate
                    });
                }
                else if(value.is_dependency){
                    dependencies = Instrumentation.mergeExtractedDependencies(value, dependencies);
                }
                else if(value.output_files)
                {
                    data.output_files = data.output_files.concat(value.output_files);
                    jobs[job_id] = jobs[job_id] || {
                        status: JobToProcessHelper.DONE
                    ,   data: data
                    };
                }

                return true;
            });

            _.each(toImpact, function (value) {
                self.impactRecords(value.activation_id, value.extensions_to_activate, dependencies[value.activation_id]);
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs);
            JobToProcessHelper.reTriggerTask(this);
        }

    ,   impactRecords: function impactRecords(activation_id, extensions, dependencies)
        {
            var extensions_active = ExtensionHelper.getExtensionsActive(activation_id);
            _.each(extensions_active, function(extension){
                ExtensionHelper.deleteExtensionActive(extension.id);
            });

            _.each(extensions, function(extension){
                extension.id = extension.extension_id;
                var extension_dependencies = _.isUndefined(dependencies) ? null : dependencies[extension.id];
                ExtensionHelper.createExtensionsActive(activation_id, extension, extension_dependencies);
            });

        }

    ,   getDomainContent: function getDomainContent()
        {
            var get_domain_content = 'function _getDomain(){\n';
            get_domain_content += '\tvar session = nlapiGetWebContainer().getShoppingSession();\n';
            get_domain_content += '\tvar domain;\n';

            get_domain_content += '\tif(_.isFunction(session.getEffectiveShoppingDomain)){\n';
            get_domain_content += '\t\tdomain = session.getEffectiveShoppingDomain();\n';
            get_domain_content += '\t}\n\telse{\n';

            get_domain_content += '\t\tvar home = session.getSiteSettings([\'touchpoints\']).touchpoints.home;\n';
            get_domain_content += '\t\tvar home_match = home.match(/https?:\\/\\/([^#?\\/]+)[#?\\/]?/);\n';

            get_domain_content += '\t\tif(!home_match){\n';
            get_domain_content += '\t\t\thome_match = home.match(/\\?btrgt=https?%3A%2F%2F([^#?\\/]+)[#?\\/]?/);\n';
            get_domain_content += '\t\t}\n';

            get_domain_content += '\t\tdomain = home_match[1];\n';
            get_domain_content += '\t}\n';
            get_domain_content += '\treturn domain;\n}\n\n';

            get_domain_content += 'var current_domain = _getDomain();\n\n';

            return get_domain_content;
        }
    };

    return impact_changes;
});
