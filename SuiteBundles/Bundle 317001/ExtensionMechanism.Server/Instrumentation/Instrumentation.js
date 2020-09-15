/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */

define(
    [
        './Logger'
    ,   'N/search'
    ,   'N/log'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        logger
    ,   search
    ,   log
    ,   ExtensionHelper
    )
{

    var instrumentation = {

        //JobToProcessHelper is passed to avoid circular dependencies
        instrument: function (job_id, job_type, JobToProcessHelper) {
            try
            {
                this.jobToProcessHelper = JobToProcessHelper;

                var error = null
                ,   data = {
                        type: 'SCEM'
                    ,   info: null
                    ,   error: null
                    };

                var to_log = this._getJobsDataToInstrument(job_id, job_type);

                if (error)
                {
                    data.error = to_log;
                }
                data.info = to_log;

                logger.logData(data);
            }
            catch(error)
            {
                log.error({title: 'ERROR: SCEM Instrumentation', details: error});
            }
        },

        _getJobsDataToInstrument: function(parent_job_id, parent_job_type) {
            var self = this
            ,   result
            ,   filters = [
                    ['custrecord_ns_sc_extmech_parent_job_id', search.Operator.IS, parent_job_id]
                ,   'or'
                ,   ['id', search.Operator.EQUALTO, parent_job_id]
                ]
            ,   jobs = this.jobToProcessHelper.getJobsToProcess(null, null, filters);

            var componentAreas = {};
            componentAreas[this.jobToProcessHelper.ACTIVATION_JOB] = 'SCEM Activation';
            componentAreas[this.jobToProcessHelper.EXTENSION_JOB] = 'SCEM Extension Installation';

            var componentArea = componentAreas[parent_job_type] || 'SCEM';

            result = _.map(jobs, function(job)
            {
                var data = job.data
                ,   job_type = self._mapJobType(job.type)
                ,   to_log = {};

                to_log.componentArea = componentArea;
                to_log.timeToStart = self._dateDiff(job.created, job.start_date);
                to_log.timeToFinish = self._dateDiff(job.start_date, job.end_date);
                to_log.jobState = job.state;
                to_log.jobType = job_type;
                to_log.jobId = parent_job_id;

                if(job.type === self.jobToProcessHelper.ACTIVATION_JOB)
                {
                    var activation_metadata = data.activation_metadata || {}
                    ,   app_manifest = (data.ssp_application || {}).app_manifest || {}
                    ,   activation_id = activation_metadata.activation_id
                    ,   activation_data = (data.all_app_extensions || {})[activation_id] || {}
                    ,   extensions = activation_data.extensions || [];

                    to_log.targetApp = app_manifest.type;
                    to_log.targetAppVersion = app_manifest.version;
                    to_log.activationId = activation_id;
                    to_log.extensionsCount = extensions.length;
                    to_log.extensions = self._getExtensionsNames(extensions);
                    to_log.websiteId = activation_data.website_id;
                    to_log.targetDomain = activation_data.domain;
                    to_log.subsidiary = activation_data.subsidiary;
                    to_log.location = activation_data.location;
                }
                else if(job.type === self.jobToProcessHelper.EXTENSION_JOB)
                {
                    to_log.extensionName = data.name;
                    to_log.extensionDisplayName = data.fantasy_name;
                    to_log.extensionVendor = data.vendor;
                    to_log.extensionVersion = data.version;
                    to_log.extensionType = data.type;
                    to_log.targetApp = data.target;
                    to_log.targetAppVersion = data.target_version || 'N/A';
                    to_log.extensionBundleId = data.bundle_id || 'N/A';
                }

                return to_log;
            });

            return result;
        },

        _dateDiff: function(from, to) {
            return ((new Date(to)).getTime() - (new Date(from)).getTime())/1000;
        },

        _mapJobType: function(job_type) {
            var type = job_type.toLowerCase();
            type = type.split('_');

            for(var i = 1; i < type.length; i++)
            {
                type[i] = type[i][0].toUpperCase() + type[i].slice(1);
            }

            return type.join('');
        },

        _getExtensionsNames: function(extensions) {
            var result = []
            ,   all_extensions = _.indexBy(ExtensionHelper.getExtensions(), 'id');

            _.each(extensions, function(ext)
            {
                var extensions_id = ext.extension_id
                ,   extension = all_extensions[extensions_id];

                if(!extension)
                {
                    return;
                }

                result.push([
                    extension.vendor
                ,   extension.name
                ,   extension.version
                ].join('-'));
            });

            return result.join(',');
        },

        extractDependencies: function (activationId, extensionName, extensionId, fileContent) {
            try{
                var fakeDefine = 'var extensionDependencies = {};';
                fakeDefine += 'function define(name, dependencies, callback){';
                fakeDefine += 'if(Array.isArray(name)){';
                fakeDefine += 'dependencies = name;';
                fakeDefine += 'name = "' + extensionName + '";';
                fakeDefine += '}';
                fakeDefine += 'dependencies = Array.isArray(dependencies) ? dependencies : [];';
                fakeDefine += 'extensionDependencies[name] = dependencies';
                fakeDefine += '}\n';
                fakeDefine += fileContent;

                eval(fakeDefine);

                extensionDependencies = _.mapObject(extensionDependencies || {}, function (dependencies) {
                    var deps = _.map(dependencies, function (dependency){
                        if(/\.tpl$/.test(dependency)){
                            return null;
                        }
                        return dependency.replace(/\.\.\//g, '');
                    });
                    return _.compact(deps);
                });

                return {
                    activationId: activationId,
                    extensionName: extensionName,
                    extensionId: extensionId,
                    dependencies: extensionDependencies
                };
            } catch (error) {
                return undefined;
            }
        },

        processExtractedDependencies: function (resource, extractedDependencies, preResult) {
            var result = preResult || {};
            var extensionModules = [];
            _.each(extractedDependencies || [], function (dependencies) {
                extensionModules = _.union(extensionModules, _.keys(dependencies.dependencies));
            });

            _.each(extractedDependencies || [], function (dependencies) {
                var activationDeps = result[dependencies.activationId] = result[dependencies.activationId] || {};
                var extensionDeps = activationDeps[dependencies.extensionId] = activationDeps[dependencies.extensionId] || {extension: dependencies.extensionName};
                extensionDeps[resource] = extensionDeps[resource] || [];

                var deps = _.flatten(_.values(dependencies.dependencies));
                deps = _.reject(deps, function (module) {
                    return _.contains(extensionModules, module);
                });
                extensionDeps[resource] = _.union(extensionDeps[resource], deps);
            });

            return result;
        },

        mergeExtractedDependencies: function (src, target) {
            _.each(src, function(value, activationId){
                target[activationId] = target[activationId] || {};
                _.each(value, function (resources, extensionId) {
                    var extDeps = target[activationId][extensionId] = target[activationId][extensionId] || {extension: value.extension};
                    _.each(resources, function(resourceDeps, resource){
                        if(resource === 'extension'){
                            extDeps[resource] = resourceDeps;
                            return;
                        }

                        extDeps[resource] = extDeps[resource] || [];
                        extDeps[resource] = extDeps[resource].concat(resourceDeps);
                    });
                });
            });
            return target;
        }

    };

    return instrumentation;
});
