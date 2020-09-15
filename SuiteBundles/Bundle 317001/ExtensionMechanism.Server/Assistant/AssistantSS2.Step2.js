/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        './AssistantSS2'
    ,   '../Services/WebsiteApiSS2'
    ,   '../Services/FileApiSS2'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   '../Helpers/JobToProcessHelperSS2'
    ,   '../../CommonUtilities/ActivationManifestValidatorSS2'
    ,   '../Helpers/AssistantHelperSS2'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   'N/ui/serverWidget'
    ,   'N/error'
    ,   'N/ui/message'
    ,   'N/runtime'
    ,   '../Helpers/ActivationHelper'
    ,   '../../third_parties/semver.js'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        Assistant
    ,   WebsiteApi
    ,   FileApi
    ,   ExtensionHelper
    ,   JobToProcessHelperSS2
    ,   ActivationManifestValidator
    ,   AssistantHelper
    ,   Utils
    ,   serverWidget
    ,   error_module
    ,   message
    ,   runtime
    ,   ActivationHelper
    )
{
    var step_2 = {

        _getWebsiteData: function(request, params_data)
        {
            var params = request.parameters
            ,   domain_id = params.domain_id || (params_data && params_data.domain_id)
            ,   subsidiary_id = params.subsidiary_id || (params_data && params_data.subsidiary_id)
            ,   location_id = params.location_id || (params_data && params_data.location_id)
            ,   website_id = params.website_id || (params_data && params_data.website_id);

            if(!website_id || !domain_id)
            {
                throw error_module.create({
                    name: 'ERROR_WRONG_PARAMETERS'
                ,   message: 'website_id and domain_id are required'
                });
            }

            this.website_id = website_id;
            this.website = WebsiteApi.getWebsite(website_id, domain_id);

            var domain_data = _.findWhere(this.website.domains, {domain: domain_id});
            if(!domain_data)
            {
                throw error_module.create({
                    name: 'ERROR_WRONG_DOMAIN'
                ,   message: 'domain ' + domain_id + ' not found'
                });
            }

            this.domain = domain_data.domain;
            this.app_manifest = domain_data.manifest;
            this.folder_id = domain_data.folder_id;
            this.app_id = domain_data.app_id;
            this.subsidiary = subsidiary_id === '-' ? null : subsidiary_id;
            this.location = location_id === '-' ? null : location_id;
        }

    ,   loadInputData: function(request)
        {
            this._getWebsiteData(request);
            //Get all the active extensions for website_id and domain_id
            this.active_extensions = ExtensionHelper.getActiveExtensions(
                this.website_id,
                this.domain,
                this.subsidiary,
                this.location,
                this.app_id
            );

            this.extensions_data = ExtensionHelper.getExtensionsByAppType(this.app_manifest);

            var ext_to_process_result = AssistantHelper.processExtToUpdateInstallData(
                this.extensions_data,
                this.active_extensions,
                this.app_manifest
            );

            this.extensions_data = ext_to_process_result.extensions_data;
            this.extensions_to_process =  ext_to_process_result.extensions_to_process;
            this.extensions_being_installed = ext_to_process_result.extensions_being_installed;
            this.greater_ext_versions = ext_to_process_result.greater_ext_versions;
        }

    ,   _getUpdateStatus: function(extension)
        {
            var ext_to_process = this.extensions_to_process[extension.vendor + '-' + extension.name] &&
                    this.extensions_to_process[extension.vendor + '-' + extension.name][0];

            var result = ' ';
            var newer_version = this.greater_ext_versions[extension.extension_id];

            if(ext_to_process && extension.bundle_id)
            {
                // if the extension to process is an update compared to the extension record currently available
                // take into account the one active might not be the latest version available of the
                var is_update = newer_version ? Utils.compareSemverVersions(newer_version.version, ext_to_process.version) :
                        Utils.compareSemverVersions(extension.version, ext_to_process.version);

                if(is_update)
                {
                    if(ext_to_process.job_state === JobToProcessHelperSS2.PENDING || ext_to_process.job_state === JobToProcessHelperSS2.IN_PROGRESS)
                    {
                        result = 'Update to ' + ext_to_process.version + ' in Progress';
                    }
                    else if(ext_to_process.job_state === JobToProcessHelperSS2.ERROR)
                    {
                        result = 'Update to ' + ext_to_process.version + ' Failed';
                    }
                }
            }

            return result;
        }

    ,   _getInstallStatus: function(ext_to_process)
        {
            if(ext_to_process.job_state === JobToProcessHelperSS2.PENDING || ext_to_process.job_state === JobToProcessHelperSS2.IN_PROGRESS)
            {
                return 'Installation in Progress';
            }
            else if(ext_to_process.job_state === JobToProcessHelperSS2.ERROR)
            {
                return 'Installation Process Failed';
            }
        }

    ,   renderExtensionsTable: function(type, title, form)
        {
            if(this.app_manifest.type === 'SCIS' && type === 'Theme')
            {
                return;
            }

            var list_id = type.toLowerCase() + 's_list';

            var sublist = form.addSublist({id: list_id, type: serverWidget.SublistType.LIST, label: title});
            var tab_name = type === 'Theme' ? 'Theme ' : (type === 'Extension' ? 'Extension ': '');

            var self = this;
            sublist.addField({id: 'extension_id', type: serverWidget.FieldType.TEXT, label: 'Id'})
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
            sublist.addField({id: 'extension_new_id', type: serverWidget.FieldType.TEXT, label: 'New Id'})
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            if(type !== 'Active')
            {
                sublist.addField({id: 'extension_active', type: serverWidget.FieldType.CHECKBOX, label: 'Active'});
            }

            sublist.addField({id: 'extension_name', type: serverWidget.FieldType.TEXT, label: tab_name + 'Name'});

            if(type === 'Active')
            {
                sublist.addField({id: 'extension_type', type: serverWidget.FieldType.TEXT, label: 'Type'});
            }

            sublist.addField({id: 'extension_vendor', type: serverWidget.FieldType.TEXT, label: 'Vendor Name'});
            sublist.addField({id: 'extension_version', type: serverWidget.FieldType.TEXT, label: 'Version #'});
            sublist.addField({id: 'extension_new_version', type: serverWidget.FieldType.TEXT, label: 'Update Available'});

            if(type !== 'Active')
            {
                sublist.addField({id: 'extension_update', type: serverWidget.FieldType.CHECKBOX, label: 'Update'});
            }
            sublist.addField({id: 'extension_update_status', type: serverWidget.FieldType.TEXT, label: 'Update Status'});
            sublist.addField({id: 'extension_description', type: serverWidget.FieldType.TEXTAREA, label: 'Description'});

            sublist.addField({id: 'is_install', type: serverWidget.FieldType.CHECKBOX, label: 'Is Install'})
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            var priority_select = sublist.addField({id: 'extension_priority', type: serverWidget.FieldType.SELECT, label: 'Priority'})
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            var max_priority = _.max(this.active_extensions || [], function(active)
            {
                return parseInt(active.priority || '0');
            }).priority || 0;

            var extensions;

            if(type === 'Active')
            {
                extensions = _.filter(self.extensions_data, function(extension)
                {
                    return self.active_extensions[extension.extension_id];
                });

                extensions = _.sortBy(extensions, function(ext)
                {
                    return ext.type !== 'Theme';
                });
            }
            else
            {
                extensions = _.where(this.extensions_data, {type: type});
            }

            //priority options are values between 0 and the count of available non-theme extensions or the maximun priority already set
            max_priority = Math.max(extensions.length - 1, parseInt(max_priority) + 1);
            for(var i = 0; i < max_priority; i++){
                priority_select.addSelectOption({
                    value: i
                ,   text: i
                });
            }

            for(i = 0; i < extensions.length; i++)
            {
                var extension = extensions[i]
                ,   ext_name = extension.fantasy_name || extension.name
                ,   update_status = this._getUpdateStatus(extension);

                sublist.setSublistValue({id: 'extension_id', line: i, value: extension.extension_id});
                sublist.setSublistValue({id: 'extension_name', line: i, value: ext_name});
                sublist.setSublistValue({id: 'extension_vendor', line: i, value: extension.vendor});
                sublist.setSublistValue({id: 'extension_version', line: i, value: extension.version});
                sublist.setSublistValue({id: 'extension_update_status', line: i, value: update_status});
                sublist.setSublistValue({id: 'is_install', line: i, value: 'F'});

                var newer_version = this.greater_ext_versions[extension.extension_id];
                if(newer_version)
                {
                    if(type !== 'Active')
                    {
                        sublist.setSublistValue({id: 'extension_update', line: i, value: 'F'});
                    }

                    sublist.setSublistValue({
                        id: 'extension_new_version'
                    ,   line: i
                    ,   value: '<style>.have-update {background-image: url(\'/images/icons/highlights/sb-notify-exclam3.png\'); background-repeat: no-repeat; background-position-x: right; width: fit-content; padding-right: 20px;}</style><p class="have-update" title="There is a new version available">' + newer_version.version + '</p>'
                    });
                    sublist.setSublistValue({id: 'extension_new_id', line: i, value: newer_version.extension_id});
                }

                if(type === 'Active')
                {
                    sublist.setSublistValue({id: 'extension_type', line: i, value: extension.type});
                }

                sublist.setSublistValue({id: 'extension_description', line: i, value: extension.description || ' '});

                var active_extension = this.active_extensions[extension.extension_id];
                if(type !== 'Active')
                {
                    sublist.setSublistValue({id: 'extension_active', line: i, value: active_extension ? 'T' : 'F'});
                }

                var priority = active_extension && !_.isEmpty(active_extension.priority) ? active_extension.priority : i.toString();

                sublist.setSublistValue({id: 'extension_priority', line: i, value: priority});
            }

            if(type !== 'Active')
            {
                var aux = this.extensions_being_installed;
                var extensions_being_installed = _.where(aux, {type: type});

                // installation of extensions go at the bottom of the list
                for(i = extensions.length; i < extensions.length + extensions_being_installed.length; i++)
                {
                    var extension_new = extensions_being_installed[i - extensions.length]
                    ,   install_status = this._getInstallStatus(extension_new);

                    sublist.setSublistValue({id: 'extension_id', line: i, value: extension_new.job_id});
                    sublist.setSublistValue({id: 'extension_name', line: i, value: extension_new.fantasy_name || extension_new.name});
                    sublist.setSublistValue({id: 'extension_vendor', line: i, value: extension_new.vendor});
                    sublist.setSublistValue({id: 'extension_version', line: i, value: extension_new.version});
                    sublist.setSublistValue({id: 'extension_update_status', line: i, value: install_status});
                    sublist.setSublistValue({id: 'extension_description', line: i, value: extension_new.description || ' '});
                    sublist.setSublistValue({id: 'extension_active', line: i, value: 'F'});
                    sublist.setSublistValue({id: 'is_install', line: i, value: 'T'});
                }
            }
        }

    ,   validateActivationManifest: function(form, extension_folder_id)
        {
            var activation_key = _.compact([
                this.domain
            ,   this.subsidiary
            ,   this.location
            ])
            .join('-');

            if(!ActivationManifestValidator.validate(activation_key, extension_folder_id, this.active_extensions))
            {
                this.handleErrors(
                    form
                ,   {
                        title: 'Warning'
                    ,   message: 'There is some inconsistency between your activation records and the actual activations. We strongly recommend to re-activate your extensions.'
                    ,   type: message.Type.WARNING
                    }
                );
            }
        }

    ,   renderStep: function(request, form)
        {
            form.title = 'Activate Themes and Extensions';

            this.loadInputData(request);
            this.renderStepLabel(form);

            //Creteas the extensions folder only if it does not exists already
            var extensions_folder = {
                name: 'extensions'
            };
            extensions_folder.folder_id = FileApi.createFolder(extensions_folder.name, this.folder_id);

            // Create the extension folder inside SSPv2 folder if it exists
            var ssp_folder = FileApi.getFolder(this.folder_id, ['parent']);
            var ssp2_folder_name = ssp_folder.name + '2';
            var ssp2FolderId = FileApi.searchFolder(ssp2_folder_name, ssp_folder.parent[0].value);

            var ssp2ExtensionsFolderId;
            if(ssp2FolderId)
            {
                ssp2ExtensionsFolderId = FileApi.createFolder('extensions', ssp2FolderId);
            }

            this.renderExtensionsTable('Active', 'Active Themes & Extensions', form);
            this.renderExtensionsTable('Theme', 'Themes', form);
            this.renderExtensionsTable('Extension', 'Extensions', form);

            this.validateActivationManifest(form, extensions_folder.folder_id);

            form.addField({
                id: 'custpage_sc_extensions_folder'
            ,   type: serverWidget.FieldType.LONGTEXT
            ,   label: 'custpage_sc_extensions_folder'
            })
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            form.updateDefaultValues({
                custpage_sc_extensions_folder: JSON.stringify(extensions_folder)
            });

            form.addField({
                id: 'custpage_sc_ssp2_extensions_folder',
                type: serverWidget.FieldType.LONGTEXT,
                label: 'custpage_sc_ssp2_extensions_folder'
            })
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            form.updateDefaultValues({
                custpage_sc_ssp2_extensions_folder: JSON.stringify({
                    ssp2FolderId: ssp2FolderId,
                    ssp2ExtensionsFolderId: ssp2ExtensionsFolderId
                })
            });

            form.addSubmitButton({
                label : 'Activate'
            });

            form.addButton({
                id : 'custpage_sc_extensions_cancel_button'
            ,   label : 'Cancel'
            ,   functionName: 'step_back'
            });

            form.clientScriptModulePath = '../../ExtensionMechanism.Client/Assistant/Step2.SelectExtensionsSS2.js';

            return form;
        }

    ,   redirectStep: function redirectStep(request)
        {
            //Validate and create ExtMechToProcess -> Activation and redirect to step 1, or redirect to
            //step 1 if cancelling
            var params = request.parameters
            ,   self = this
            ,   delimiter = /\u0001/
            ,   extensions_list = params.extensions_listdata.split('\u0002')
            ,   extensions_list_fields = params.extensions_listfields.split(delimiter)
            ,   themes_list = params.themes_listdata && params.themes_listdata.split('\u0002')
            ,   extensions_folder = params.custpage_sc_extensions_folder
            ,   ssp2ExtensionsFolder = JSON.parse(params.custpage_sc_ssp2_extensions_folder);

            var activation_data = {}
            ,   query_string_data =  AssistantHelper.getQueryStringData(request)
            ,   next_step_data = {
                    service_name: 'STEP_0'
                };

            //Removes null values
            query_string_data = _.pick(query_string_data, _.identity);
            //get website, domain_data and application manifest
            this._getWebsiteData(request, query_string_data);

            activation_data.activation_metadata = {
                activation_id: null,
                website_id: this.website_id,
                domain: this.domain,
                subsidiary: this.subsidiary,
                location:  this.location
            };

            activation_data.ssp_application = {
                folder_id: this.folder_id,
                app_id: this.app_id,
                extensions_folder: extensions_folder,
                app_manifest: this.app_manifest
            };

            if(ssp2ExtensionsFolder.ssp2FolderId && ssp2ExtensionsFolder.ssp2ExtensionsFolderId){
                activation_data.ssp2_application = {
                    folder_id: ssp2ExtensionsFolder.ssp2FolderId,
                    extensions_folder_id: ssp2ExtensionsFolder.ssp2ExtensionsFolderId
                };
            }

            this.extensions_data = ExtensionHelper.getExtensionsByAppType(this.app_manifest);

            //Merge columns names with row values
            extensions_list = (themes_list || []).concat(extensions_list);
            var extensions_active = _.map(extensions_list, function(ext)
            {
                var extension = _.object(extensions_list_fields, ext.split(delimiter));
                if(extension.extension_active === 'T')
                {
                    //If the update checkbox was checked use the newest extension id
                    if(extension.extension_update === 'T' && extension.extension_new_id)
                    {
                        extension.extension_id = extension.extension_new_id;
                    }

                    return {
                        id: extension.extension_id
                    ,   priority: extension.extension_priority
                    };
                }
            });

            /*
                Generate extensions_active data ordered by priority and adding extension type and manifest_id
            */
            extensions_active = _.sortBy(_.compact(extensions_active), 'priority');
            extensions_active = _.sortBy(extensions_active, function(active)
            {
                var extension_id = active.id
                ,   extension = self.extensions_data[extension_id];

                active.manifest_id = extension.manifest_id;
                active.type = extension.type;

                return active.type === 'Theme' ? -1 : parseInt(active.priority);
            });

            activation_data.manifests = _.pluck(extensions_active, 'manifest_id');
            activation_data.all_app_extensions = AssistantHelper.getAllAppExtensions({
                extensions_active: extensions_active
            ,   app_id: this.app_id
            ,   subsidiary: this.subsidiary || ''
            ,   location: this.location || ''
            ,   website_id: this.website_id
            ,   domain: this.domain
            });

            var user = runtime.getCurrentUser();

            //if the activation exist update the existing activation, else create a new activation record
            var activation = ActivationHelper.getActivation(this.website_id, this.domain, this.subsidiary, this.location)
            ,   activation_id;

            if(!activation)
            {
                activation_id = ActivationHelper.createActivation(this.website_id, this.domain, this.subsidiary, this.location, this.app_id, user.id);
            }
            else
            {
                if(activation.state === ActivationHelper.PENDING_STATUS || activation.state === ActivationHelper.IN_PROGRESS_STATUS)
                {
                    return next_step_data;
                }

                activation_id = activation.id;
                ActivationHelper.updateActivationState(activation_id, ActivationHelper.PENDING_STATUS, user.id, this.app_id);
            }

            if(activation_data.all_app_extensions.new_activation)
            {
                activation_data.all_app_extensions.new_activation.activation_id = activation_id;

                activation_data.all_app_extensions[activation_id] = activation_data.all_app_extensions.new_activation;
				delete activation_data.all_app_extensions.new_activation;
            }

            activation_data.activation_metadata.activation_id = activation_id;

            JobToProcessHelperSS2.createJobToProcess(
                JobToProcessHelperSS2.ACTIVATION_JOB,
                JobToProcessHelperSS2.PENDING,
                activation_data
            );

            return next_step_data;
        }

    };

    return _.extend({}, Assistant, step_2);
});
