/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/search'
    ,   'N/file'
    ,   'N/util'
    ,   'N/record'
    ,   'N/runtime'
    ,   'N/encode'
    ,   'N/error'
    ,   'N/log'
    ,   'N/task'
    ,   '../Services/FileApiSS2'
    ,   '../Helpers/ActivationHelper'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../Helpers/MapReduceErrorHelper'
    ]
,   function(
        search
    ,   file
    ,   util
    ,   record
    ,   runtime
    ,   encode
    ,   error_module
    ,   log
    ,   task
    ,   FileApi
    ,   ActivationHelper
    ,   JobToProcessHelper
    ,   ExtensionHelper
    ,   Utils
    ,   MapReduceErrorHelper
    )
{
    var extension_installer = {

        MAX_TO_PROCESS: 1

    ,   JOB_TYPE: JobToProcessHelper.EXTENSION_JOB

    ,    _getExtensionFiles: function _getExtensionFiles(manifest, extension)
        {
            var files = ['manifest.json']
            //Enforces <<name>>@<<version>> as the extension folder name
            ,   extension_dest_path = extension.extension_dest_path + manifest.name + '@' + manifest.version + '/';

            util.each(manifest.assets || [], function(asset)
            {
                util.each(asset.files || [], function(file)
                {
                    files.push('assets/' + file);
                });
            });

            util.each(manifest.skins || [], function(skin)
            {
                files.push(skin.file);
            });

            if(manifest.configuration)
            {
                files = files.concat(manifest.configuration.files || []);
            }

            if(manifest.templates && manifest.templates.application)
            {
                util.each(manifest.templates.application || [], function(app)
                {
                    files = files.concat(app.files || []);
                });
            }

            if(manifest.sass)
            {
                files = files.concat(manifest.sass.files || []);
            }

            if(manifest.javascript && manifest.javascript.application)
            {
                util.each(manifest.javascript.application || [], function(app)
                {
                    files = files.concat(app.files || []);
                });
            }

            if(manifest['ssp-libraries'])
            {
                files = files.concat(manifest['ssp-libraries'].files || []);
            }

            if(manifest.suitescript2)
            {
                files = files.concat(manifest.suitescript2.files || []);
            }

            var data = []
            ,   files_added = {}; //Used to not add the same file twice
            util.each(files, function(file)
            {
                if(!files_added[file])
                {
                    data.push({
                        job_id: extension.id
                    ,   bundle_id: extension.data.bundle_id
                    ,   parent_id: extension.parent_id
                    ,   manifest_id: extension.data.manifest
                    ,   state: extension.state
                    ,   file: extension.extension_path + file
                    ,   file_dest: extension_dest_path + file
                    });

                    files_added[file] = true;
                }
            });

            return data;
        }

    ,	_getContentTypeid: function(customrecordscriptid)
        {
            try
            {
                var cct_search = search.create({
                    type: 'cmscontenttype'
                ,	filters: [
                        ['customrecordscriptid', search.Operator.IS, customrecordscriptid.toUpperCase()]
                    ]
                })
                .run()
                .getRange({start:0, end: 1});

                return cct_search && cct_search.length && cct_search[0].id || '';
            }
            catch(error)
            {
                log.error({
                    title: 'EXTENSION_INSTALLER_ERROR'
                ,   details: error
                });

                throw error_module.create({
                    name: 'SCE_CMSCONTENTTYPE_NOEXISTS'
                ,   message: 'The record "cmscontenttype" does not exists'
                });
            }
        }

	,	_getPageTypeId: function(name)
		{
			try{
                var page_search = search.create({
                    type: 'cmspagetype'
                ,	filters: [
                        ['name', search.Operator.IS, name]
                    ]
                })
                .run()
                .getRange({start:0, end: 1});

				return page_search && page_search.length && page_search[0].id || '';
			}
			catch(error)
			{
				log.error({
                    title: 'EXTENSION_INSTALLER_ERROR'
                ,   details: error
                });

				throw error_module.create({
                     name: 'SCE_CMSPAGETYPE_NOEXISTS'
                 ,   message: 'The record "cmspagetype" does not exists. Make sure that CMS is enable in your account.'
                 });
			}
		}

    ,   _createExtension: function _createExtension(manifest_id, bundle_id)
        {
            var i
            ,   skin
            ,   manifest = file.load({id: manifest_id})
            ,   extension_path = manifest.path.replace('manifest.json', '')
            ,   manifest_json = JSON.parse(manifest.getContents())
            ,   required_fields = manifest_json.vendor && manifest_json.name && manifest_json.version && manifest_json.type && manifest_json.target;

            if (!required_fields)
            {
                throw error_module.create({
                    name: 'SCE_MANIFEST_INCOMPLETE'
                ,   message: 'Missing manifest information (vendor, name, version, type or target)'
                });
            }

            if (manifest_json.type === 'theme' && manifest_json.skins && manifest_json.skins.length)
            {
                for(i = 0; i < manifest_json.skins.length; i++)
                {
                    skin = manifest_json.skins[i];

                    required_fields = skin && skin.name && skin.file;

                    if (!required_fields)
                    {
                        throw error_module.create({
                            name: 'SCE_MANIFEST_INCOMPLETE'
                        ,   message: 'Missing Skin information (name or file)'
                        });
                    }
                }
            }

            if (manifest_json.cct)
            {
                if (Object.prototype.toString.call(manifest_json.cct) !== '[object Array]')
                {
                    manifest_json.cct.label = manifest_json.cct.label || manifest_json.fantasyName || manifest_json.name;
                    manifest_json.cct = [manifest_json.cct];
                }

                for (i = 0; i < manifest_json.cct.length; i++)
                {
                    var cct_json = manifest_json.cct[i];

                    required_fields = required_fields && cct_json.settings_record && cct_json.registercct_id && cct_json.label;

                    if (!required_fields)
                    {
                        throw error_module.create({
                            name: 'SCE_MANIFEST_INCOMPLETE'
                        ,   message: 'Missing CCT information (setting_record or registercct_id)'
                        });
                    }

                    var cct
                    ,   cct_id = this._getContentTypeid(cct_json.settings_record);
                    if (!cct_id)
                    {
                        cct = record.create({type: 'cmscontenttype'});
                    }
                    else
                    {
                        cct = record.load({type: 'cmscontenttype', id: cct_id});
                    }

                    var cct_settings_record_id;
                    try
                    {
                        var cct_settings_record = record.create({type: cct_json.settings_record});
                        cct_settings_record_id = cct_settings_record.getValue({fieldId: 'rectype'});
                    }
                    catch(error)
                    {
                        log.error({
                            title: 'EXTENSION_INSTALLER_ERROR'
                        ,   details: error
                        });

                        throw error_module.create({
                            name: 'SCE_SETTINGRECORD_NOEXISTS'
                        ,   message: 'The record "' + cct_json.settings_record + '" does not exists'
                        });
                    }

                    var icon = '';

                    try
                    {
                        var icon_file = file.load({id: extension_path + 'assets/' + cct_json.icon});
                        icon = icon_file.url;
                    }
                    catch (error)
                    {
                        // jshint noempty: false
                    }

                    cct.setValue({fieldId: 'name', value: cct_json.registercct_id});
                    cct.setValue({fieldId: 'label', value: cct_json.label});
                    cct.setValue({fieldId: 'description', value: cct_json.description || ''});
                    cct.setValue({fieldId: 'iconimagepath', value: icon});
                    cct.setValue({fieldId: 'customrecordid', value: cct_settings_record_id});

                    try
                    {
                        cct.save();
                    }
                    catch(error)
                    {
                        log.error({
                            title: 'EXTENSION_INSTALLER_ERROR'
                        ,   details: error
                        });

                        throw error_module.create({
                            name: 'SCE_CMSCONTENTTYPE_ERROR'
                        ,   message: 'Error when adding the CCT to the "cmscontentype" record'
                        });
                    }
                }
            }

            if (manifest_json.page && manifest_json.page.types)
            {
				var types = manifest_json.page.types;

                for (i = 0; i < types.length; i++)
                {
					var type = types[i];

					required_fields = required_fields && type.name && type.displayName;

                    if (!required_fields)
                    {
                        throw error_module.create({
                            name: 'SCE_MANIFEST_INCOMPLETE'
                        ,   message: 'Missing PageType information ("name" or "displayName")'
                        });
                    }

                    var pagetype
                    ,   pagetype_id = this._getPageTypeId(type.name);

                    if (!pagetype_id)
                    {
                        pagetype = record.create({type: 'cmspagetype'});
                    }
                    else
                    {
                        pagetype = record.load({type: 'cmspagetype', id: pagetype_id});
                    }

                    var page_settings_record_id;

					if (type.settingsRecord)
					{
						try
						{
							var page_settings_record = record.create({type: type.settingsRecord});
							page_settings_record_id = page_settings_record.getValue({fieldId: 'rectype'});
						}
						catch(error)
						{
							log.error({
								title: 'EXTENSION_INSTALLER_ERROR'
							,   details: error
							});

							throw error_module.create({
								name: 'SCE_SETTINGRECORD_NOEXISTS'
							,   message: 'The record "' + type.settingsRecord + '" does not exists'
							});
						}
					}

                    pagetype.setValue({fieldId: 'name', value: type.name});
                    pagetype.setValue({fieldId: 'displayname', value: type.displayName});
                    pagetype.setValue({fieldId: 'description', value: type.description || ''});
                    pagetype.setValue({fieldId: 'baseurlpath', value: type.baseUrlPath || ''});
                    pagetype.setValue({fieldId: 'cmscreatable', value: type.cmsCreatable || 'T'});

					if (page_settings_record_id)
					{
						pagetype.setValue({fieldId: 'fieldsschemacustomrecordtype', value: page_settings_record_id});
					}

                    try
                    {
                        pagetype.save();
                    }
                    catch(error)
                    {
                        log.error({
                            title: 'EXTENSION_INSTALLER_ERROR'
                        ,   details: error
                        });

                        throw error_module.create({
                            name: 'SCE_CMSPAGETYPE_ERROR'
                        ,   message: 'Error when adding the PageType to the "cmspagetype" record'
                        });
                    }
                }
            }

            manifest_json.bundle_id = bundle_id;
            manifest_json.manifest_id = manifest_id;
            manifest_json.targets = ExtensionHelper.getSupportedTargetsIds(manifest_json.target);
            var extension_id = ExtensionHelper.createExtension(manifest_json);

            if (manifest_json.type === 'theme' && manifest_json.skins && manifest_json.skins.length)
            {
                for(i = 0; i < manifest_json.skins.length; i++)
                {
                    skin = manifest_json.skins[i];

                    var	skin_path = extension_path + skin.file
                    ,	skin_file = file.load({id: skin_path});

                    var	preset = record.create({type: 'customrecord_ns_sc_extmech_skin_preset'});

                    preset.setValue({fieldId: 'name', value: skin.name});
                    preset.setValue({fieldId: 'custrecord_skin_preset_file', value: skin_file.id});
                    preset.setValue({fieldId: 'custrecord_skin_preset_theme', value: extension_id});

                    preset.save();
                }
            }
        }

    ,   getInputData: function getInputData()
        {
            log.debug({ title: 'BEGIN EXTENSION INSTALLER MAP REDUCE'});

            var ext_to_process = JobToProcessHelper.getJobs(this);

            if(!ext_to_process)
            {
                return null;
            }

            //Create the folder which is going to host all the installed extensions
            var parent_id = FileApi.createFolder('extensions', -15);

            var self = this
            ,   data = [];

            util.each(ext_to_process, function(job)
            {
                try
                {
                    JobToProcessHelper.updateToProcessState(job.id, JobToProcessHelper.IN_PROGRESS);

                    var manifest = file.load({id: job.data.manifest});
                    job.extension_dest_path = manifest.path.replace(/[^\/]+\/manifest.json$/, '');
                    job.extension_path = manifest.path.replace(/manifest.json$/, '');

                    manifest = JSON.parse(manifest.getContents());

                    job.parent_id = FileApi.createFolder(manifest.vendor, parent_id);

                    var files = self._getExtensionFiles(manifest, job);
                    data = data.concat(files);
                }
                catch(error)
                {
                    log.error({
                        title: 'EXTENSION_INSTALLER_ERROR'
                    ,   details: error
                    });

                    JobToProcessHelper.updateToProcessState(job.id, JobToProcessHelper.ERROR, error.message);
                }
            });

            return data;
        }

    ,   map: function map(context)
        {
            if(!context.value)
            {
                return;
            }

            var job_id;
            try
            {
                var data = JSON.parse(context.value)
                ,   file_dest_path = data.file_dest
                ,   bundle_id = data.bundle_id
                ,   parent_id = data.parent_id;

                job_id = data.job_id;

                //Removes the bundle folder and their parents. Also removes the file.
                var folders_to_create = file_dest_path.match(new RegExp('^.*\/Bundle ' + bundle_id + '\/(.*)\/[^\/]+$'))[1];
                folders_to_create = folders_to_create.split('/');

                util.each(folders_to_create, function(folder)
                {
                    parent_id = FileApi.createFolder(folder, parent_id);
                });

                context.write(parent_id, data);
            }
            catch(error)
            {
                log.error({
                    title: 'EXTENSION_INSTALLER_MAP_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error.message);
            }
        }

    ,   reduce: function reduce(context)
        {
            if(!context.values || !context.values.length)
            {
                return;
            }

            var job_id;

            try
            {
                var dst_folder = context.key;

                util.each(context.values, function(value)
                {
                    var data = JSON.parse(value)
                    ,   src_file = data.file;

                    job_id = data.job_id;
                    var file_id = FileApi.copyFiles([src_file], [{folder_id: dst_folder}], true)[0];

                    //If it is the manifest write the id
                    if(file_id && /\/manifest\.json$/.test(src_file))
                    {
                        context.write(
                            data.job_id
                        ,   {
                                manifest_id: file_id
                            ,   bundle_id: data.bundle_id
                            ,   state: data.state
                        });
                    }
                });
            }
            catch(error)
            {
                log.error({
                    title: 'EXTENSION_INSTALLER_REDUCE_ERROR'
                ,   details: error
                });

                MapReduceErrorHelper.throwError(job_id, error.message);
            }
        }

    ,   summarize: function summarize(context)
        {
            if(!context.output)
            {
                return;
            }

            var self = this;

            var error_jobs = MapReduceErrorHelper.handleErrors(context)
            ,   jobs = {};

            context.output.iterator().each(function(job_id, data)
            {
                try
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
                    else
                    {
                        data = JSON.parse(data);
                        self._createExtension(data.manifest_id, data.bundle_id);
                    }
                }
                catch(error)
                {
                    log.error({
                        title: 'EXTENSION_INSTALLER_ERROR'
                    ,   details: error
                    });

                    error_jobs[job_id] = error;
                    jobs[job_id] = {
                        status: JobToProcessHelper.ERROR
                    ,   data: error_jobs[job_id]
                    };
                }

                return true;
            });

            JobToProcessHelper.setJobsData(jobs, error_jobs, this.JOB_TYPE);

            //If there are more extensions to be installed re-schedule this script
            JobToProcessHelper.reTriggerTask(this);

            log.debug({ title: 'END EXTENSION INSTALLER MAP REDUCE'});
        }

    };

    return extension_installer;
});
