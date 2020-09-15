/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        './AssistantSS2'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   '../../ExtensionMechanism.Server/Helpers/JobToProcessHelperSS2'
    ,   '../../ExtensionMechanism.Server/Helpers/ActivationHelper'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   'N/ui/serverWidget'
    ,   'N/runtime'
    ,   'N/search'
    ,   'N/url'
    ,   'N/https'
    ,   'N/error'
    ,   'N/log'
    ,   'N/format'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        Assistant
    ,   ExtensionHelper
    ,   JobToProcessHelper
    ,   ActivationHelper
    ,   Utils
    ,   serverWidget
    ,   runtime
    ,   search
    ,   url
    ,   http_module
    ,   error_module
    ,   log
    ,   format
    )
{
    var step_0 = {

        loadInputData: function(request)
        {
            this.activation_extensions = ExtensionHelper.getAllExtensionsActive();
            this.activations = ExtensionHelper.getActivations(true);

            this.activations = this._getAppManifest(this.activations, request);

            this.extensions = ExtensionHelper.getExtensions();

            this.all_extensions = _.groupBy(this.extensions, function(extension)
            {
                return extension.vendor + '-' + extension.name;
            });
            this.extensions = _.indexBy(this.extensions, 'id');
        }

    ,   _getAppManifest: function(activations, request)
        {
            if(_.isEmpty(activations)){
                return activations;
            }

            var app_folder_ids = _.pluck(activations, 'application_id');
            app_folder_ids = _.unique(app_folder_ids);

            var app_manifests_search = search.create({
                type: 'file'
            ,   columns: ['folder']
            ,   filters: [
                    ['folder', search.Operator.ANYOF, app_folder_ids]
                ,   'and'
                ,   ['name', search.Operator.IS, 'app_manifest.json']
                ]
            }).run();

            var app_manifest_ids = [];
            app_manifests_search.each(function (result)
            {
                app_manifest_ids.push(result.id);
                return true;
            });

            //Make a request to the file service to avoid governance
            var script = runtime.getCurrentScript();
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });

            var file_service_url = 'https://' + host + url.resolveScript({
                scriptId: script.id
            ,   deploymentId: 'customdeploy_ns_sc_ext_mech_services'
            ,   params: {service_name: 'FILE_SERVICE'}
            });

            var response = http_module.post({
                url: file_service_url
            ,   headers: request.headers
            ,   body: JSON.stringify({
                    operation: 'get_files',
                    files: app_manifest_ids
                })
            })
            ,   json_response = JSON.parse(response.body)
            ,   code = json_response.header.status.code
            ,   msg = json_response.header.status.message;

            if(code !== 'SUCCESS')
            {
                log.debug({title: 'ERROR GETTING APP MANIFEST - STEP 0', details: app_manifest_ids});
                log.debug({title: 'ERROR GETTING APP MANIFEST - STEP 0', details: msg});

                return activations;
            }

            var app_manifests = _.indexBy(json_response.result.files, 'folder_id');
            _.each(activations, function (activation)
            {
                var app_manifest = app_manifests[activation.application_id] || {};
                app_manifest = JSON.parse(app_manifest.content || '{}');

                activation.app_type = app_manifest.type;
                activation.app_version = app_manifest.version;
            });

            return activations;
        }

    ,   _areUpdatesAvailable: function(extensions, activation)
        {
            var self = this
            ,   app_type = activation.app_type
            ,   app_version = activation.app_version;

            var update_available = _.find(extensions, function(extension)
            {
                var extension_versions = self.all_extensions[extension.vendor + '-' + extension.name];

                var greater_version = extension.version;
                _.each(extension_versions, function(ext_version)
                {
                    var targets = _.pluck(ext_version.targets, 'name');
                    var target_version = ext_version.target_version && ext_version.target_version[app_type];

                    if(!_.contains(targets, app_type) || target_version && !Utils.satisfiesSemver(app_version, target_version))
                    {
                        return;
                    }

                    if(Utils.compareSemverVersions(greater_version, ext_version.version))
                    {
                        greater_version = ext_version.version;
                    }
                });

                return greater_version !== extension.version;
            });

            return update_available;
        }

    ,   initializeStates: function()
        {
            var states = {};
            states[ActivationHelper.FINISHED_STATUS] = 'Completed';
            states[ActivationHelper.ERROR_STATUS] = 'Error';
            states[ActivationHelper.CANCELLED_STATUS] = 'Canceled';
            states[ActivationHelper.IN_PROGRESS_STATUS] = 'In Progress';
            states[ActivationHelper.PENDING_STATUS] = 'Pending';
            return states;
        }

    ,   initializeColors: function(states)
        {
            var colors = {};
            colors[states[ActivationHelper.FINISHED_STATUS]] = 'green';
            colors[states[ActivationHelper.ERROR_STATUS]] = 'red';
            colors[states[ActivationHelper.CANCELLED_STATUS]] = 'red';
            colors[states[ActivationHelper.IN_PROGRESS_STATUS]] = 'black';
            colors[states[ActivationHelper.PENDING_STATUS]] = 'black';
            return colors;
        }

    ,    fillList: function(list)
        {
            var self = this
            ,   activation_extensions = _.groupBy(this.activation_extensions, 'activation_id')
            ,   states = self.initializeStates()
            ,   colors = self.initializeColors(states);

            var state_tpl = _.template('<span style="color: <%= color %>"><%= state %><%= progress %></span> <%= error %>')
            ,   error_tpl = _.template('(<a href="#" data-modal="<%= activation_id %>" class="showModal">view log</a>)<div id="<%= activation_id %>" style="display: none"><%= errors %></div>');

            this.checkTimeOutJobs();

            this.activations = _.filter(_.map(this.activations, function(activation)
            {
                activation.activatelink = 'Edit';

                var error = ''
                ,   progress = ''
                ,   extensionsActive = [];

                extensionsActive = activation_extensions[activation.id] || [];

                if(activation.activation_job && activation.activation_state !== ActivationHelper.FINISHED_STATUS)
                {
                    var app_exts = activation.activation_job_data.all_app_extensions || {}
                    ,   extensionsBeingActivated = []
                    ,   app_ext = app_exts[activation.id] || {};

                    _.each(app_ext.extensions || [], function(ext)
                    {
                        var ext_data = self.extensions[ext.extension_id];

                        extensionsBeingActivated.push({
                            activation_id: activation.id,
                            extension_id: ext.extension_id,
                            type: ext_data.type,
                            name: ext_data.name,
                            fantasy_name: ext_data.fantasy_name,
                            vendor: ext_data.vendor,
                            version: ext_data.version,
                        });
                    });

                    var filters = [['custrecord_ns_sc_extmech_parent_job_id', search.Operator.IS, activation.activation_job]]
                    ,   child_jobs = JobToProcessHelper.getJobsToProcess(null, null, filters)
                    ,   jobs_states = self.getJobStates(child_jobs, extensionsBeingActivated, activation);

                    if(activation.activation_state === ActivationHelper.ERROR_STATUS)
                    {
                        error = error_tpl({
                            activation_id: activation.id
                        ,   errors: JSON.stringify(jobs_states)
                        });
                    }
                    else
                    {
                        if(activation.activation_state === ActivationHelper.IN_PROGRESS_STATUS)
                        {
                            var jobs_done = _.where(child_jobs, {state: JobToProcessHelper.DONE});
                            progress = ' ' + jobs_done.length + '/' + child_jobs.length;
                        }
                        activation.activatelink = '';
                        extensionsActive = extensionsBeingActivated;
                    }
                }

                activation.status = states[activation.activation_state];
                activation.subsidiary = activation.subsidiary || 'All';
                activation.location = activation.location || 'All';
                activation.theme = '';
                activation.extentions_html = '';

                if(extensionsActive.length > 0)
                {
                    var extensions = _.where(extensionsActive, {type: 'Extension'})
                    ,   theme = _.findWhere(extensionsActive, {type: 'Theme'});

                    var theme_have_update = (theme && self._areUpdatesAvailable([theme], activation)) ? '<p class="have-update" title="There is a new version available">' : '<p>';
                    activation.theme = theme ? (theme_have_update + ' ' + (theme.fantasy_name || theme.name) + ' - ' + theme.version) + '</p>' : 'N/A';
                    activation.extentions_html = _.map(extensions, function(extension)
                    {
                        var extension_name = extension.fantasy_name || extension.name;
                        var ext_have_update = self._areUpdatesAvailable([extension], activation) ? '<li class="have-update" title="There is a new version available">' : '<li>';
                        return ext_have_update + extension_name + ' - ' + extension.version + '</li>';
                    })
                    .join('');
                    activation.extentions_html = '<style>.have-update {background-image: url(\'/images/icons/highlights/sb-notify-exclam3.png\'); background-repeat: no-repeat; background-position-x: right; width: fit-content; padding-right: 20px;}</style><ul>' + activation.extentions_html + '</ul>';
                }
                else if(activation.status === states[ActivationHelper.FINISHED_STATUS])
                {
                    return;
                }

                activation.status = state_tpl({
                    state: activation.status
                ,   progress: progress
                ,   color: colors[activation.status]
                ,   error: error
                });

                return activation;

            }), _.identity);

            // Rows
            list.addRows({
                rows: _.values(this.activations)
            });
        }

    ,   checkTimeOutJobs: function(){
            var filters = [
                    ['custrecord_ns_sc_extmech_type', search.Operator.ISNOT, JobToProcessHelper.ACTIVATION_JOB],
                    'and',
                    ['custrecord_ns_sc_extmech_type', search.Operator.ISNOT, JobToProcessHelper.EXTENSION_JOB],
                    'and',
                    ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.ERROR],
                    'and',
                    ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT, JobToProcessHelper.DONE]
                ],
                child_jobs = JobToProcessHelper.getJobsToProcess(null, null, filters);

            _.each(child_jobs, function(job){
                var start_date,
                    timeout;

                if(job.state === JobToProcessHelper.IN_PROGRESS) {
                    start_date = job.start_date;
                    timeout = JobToProcessHelper.JOB_IN_PROGRESS_TIME_OUT;
                }
                else if(job.state === JobToProcessHelper.PENDING) {
                    start_date = job.created;
                    timeout = JobToProcessHelper.JOB_PENDING_TIME_OUT;
                }

                if(start_date) {
                    var olson_tz = runtime.getCurrentUser().getPreference('TIMEZONE');

                    start_date = format.parse(start_date, format.Type.DATETIMETZ, olson_tz);//parse start_date string to date
                    var current_time = format.format(new Date(), format.Type.DATETIMETZ, olson_tz);//create current_time as string
                    current_time = format.parse(current_time, format.Type.DATETIMETZ, olson_tz);//parse current_time to date

                    current_time = current_time.getTime();
                    start_date = start_date.getTime();

                    if((current_time - timeout) > start_date) {
                        job.data = {msg: 'Job execution time exceeded. The job has been ' + job.state + ' for more than ' + timeout / 60 / 1000 + ' minutes.'};
                        job.state = JobToProcessHelper.ERROR;
                        JobToProcessHelper.updateToProcessState(job.id, JobToProcessHelper.ERROR, job.data);
                    }
                }
            });
        }

    ,   getJobStates: function(child_jobs, extensionsBeingActivated, activation)
        {
            var jobs_states = {};
            _.each(child_jobs, function(job)
            {
                jobs_states[job.type] = {
                    state: job.state
                };
                if(job.state === JobToProcessHelper.ERROR)
                {
                    job.data = job.data || {};
                    jobs_states[job.type].errors = job.data.errors || job.data;
                    jobs_states[job.type].extensions = extensionsBeingActivated;

                    activation.activation_state = ActivationHelper.ERROR_STATUS;
                }
            });

            return jobs_states;
        }

    ,   renderStep: function(request)
        {
            var list = serverWidget.createList({
                title : 'Extension Manager'
            });

            // Columns
            var edit_url = list.addColumn({
                id: 'activatelink'
            ,   label: 'Edit'
            ,   type: serverWidget.FieldType.URL
            });

            var script = runtime.getCurrentScript();
            edit_url.setURL({
                url: url.resolveScript({
                    scriptId: script.id
                ,   deploymentId: script.deploymentId
                ,   params: {service_name: 'STEP_2'}
                })
            });
            edit_url.addParamToURL({
                param : 'website_id'
            ,   value : 'website_id'
            ,   dynamic: true
            });
            edit_url.addParamToURL({
                param : 'domain_id'
            ,   value : 'domain'
            ,   dynamic: true
            });
            edit_url.addParamToURL({
                param : 'subsidiary_id'
            ,   value : 'subsidiary_id'
            ,   dynamic: true
            });
            edit_url.addParamToURL({
                param : 'location_id'
            ,   value : 'location_id'
            ,   dynamic: true
            });

            list.addColumn({
                id: 'website'
            ,   label: 'Website'
            ,   type: serverWidget.FieldType.TEXT
            });
            list.addColumn({
                id: 'domain'
            ,   label: 'Domain'
            ,   type: serverWidget.FieldType.TEXT
            });
            list.addColumn({
                id: 'subsidiary'
            ,   label: 'Subsidiary'
            ,   type: serverWidget.FieldType.TEXT
            });
            list.addColumn({
                id: 'location'
            ,   label: 'Location'
            ,   type: serverWidget.FieldType.TEXT
            });
            list.addColumn({
                id: 'theme'
            ,   label: 'Theme'
            ,   type: serverWidget.FieldType.RICHTEXT
            });
            list.addColumn({
                id: 'extentions_html'
            ,   label: 'Active Extensions'
            ,   type: serverWidget.FieldType.LONGTEXT
            });
            list.addColumn({
                id: 'status'
            ,   label: 'Status'
            ,   type: serverWidget.FieldType.LONGTEXT
            });
            list.addColumn({
                id: 'lastmodified'
            ,   label: 'Last Activation Date'
            ,   type: serverWidget.FieldType.TEXT
            });

            list.addButton({
                id : 'new_activation'
            ,   label : 'New Activation'
            ,   functionName: 'new_activation'
            });

            this.loadInputData(request);
            this.fillList(list);

            list.clientScriptModulePath = '../../ExtensionMechanism.Client/Assistant/Step0.ActivationsListSS2.js';

            return list;
        }

    };

    return _.extend({}, Assistant, step_0);
});
