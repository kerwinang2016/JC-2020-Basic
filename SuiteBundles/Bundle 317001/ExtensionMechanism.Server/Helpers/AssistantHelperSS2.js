/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */

 define(
    [
        'N/search'
    ,   '../Services/WebsiteApiSS2'
    ,   './ExtensionHelperSS2'
    ,   './JobToProcessHelperSS2'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        search
    ,   WebsiteApi
    ,   ExtensionHelper
    ,   JobToProcessHelper
    ,   Utils
    )
{
    var assistant_helper = {

        getQueryStringData: function(request)
        {
            var params = request.parameters
            ,   input_parameters = params.entryformquerystring
            ,   query_string_data = {
                    website_id: null
                ,   domain_id: null
                ,   subsidiary_id: null
                ,   location_id: null
                ,   service_name: null
                };

                query_string_data = _.mapObject(query_string_data, function(value, key)
                {
                    var regexp = new RegExp('[\?&]' + key + '=([^&]*)')
                    ,   match = input_parameters.match(regexp);
                    return match && match[1];
                });

                return query_string_data;
        }

    ,   processExtToUpdateInstallData: function(extensions_data, active_extensions, app_manifest)
        {
            var extensions_to_process
            ,   extensions_being_installed
            ,   greater_ext_versions = {};

            //Group extentions by vendor and name
            extensions_data = _.groupBy(extensions_data, function(extension)
            {
                return extension.vendor + '-' + extension.name;
            });

            //Get all the extensions to process (being updated/installed)
            var filters = [
                ['custrecord_ns_sc_extmech_type', search.Operator.IS,  JobToProcessHelper.EXTENSION_JOB],
                'and',
                ['custrecord_ns_sc_extmech_state', search.Operator.ISNOT,  JobToProcessHelper.DONE]
            ];
            extensions_to_process = _.map(JobToProcessHelper.getJobsToProcess(search.Sort.DESC, null, filters), function(ext)
            {
                ext.data.job_id = ext.id;
                ext.data.job_state = ext.state;
                ext.data.job_type = ext.type;
                ext.data.job_created = ext.created;
                return ext.data;
            });

            extensions_to_process = _.filter(extensions_to_process, function(ext_to_process)
            {
                var target_version = ext_to_process.target_version && ext_to_process.target_version[app_manifest.type];
                return !target_version || Utils.satisfiesSemver(app_manifest.version, target_version);
            });

            //the new ones are the ones being installed
            extensions_being_installed = _.filter(extensions_to_process, function(ext_to_process)
            {
                var match_target =  ext_to_process.target && _.contains(ext_to_process.target.split(','), app_manifest.type);
                return !extensions_data[ext_to_process.vendor + '-' + ext_to_process.name] && match_target;
            });

            extensions_to_process = _.groupBy(extensions_to_process, function(extension)
            {
                return extension.vendor + '-' + extension.name;
            });

            //Modify the current extensions_data to return the active version
            //or the greater available one, if a previous one was not active
            extensions_data = _.map(extensions_data, function(ext_versions)
            {
                var active
                ,   greater;

                _.each(ext_versions, function(ext_version)
                {
                    if(active_extensions[ext_version.extension_id])
                    {
                        active = ext_version;
                    }

                    if(!greater)
                    {
                        greater = ext_version;
                        return;
                    }

                    if(Utils.compareSemverVersions(greater.version, ext_version.version))
                    {
                        greater = ext_version;
                    }
                });

                if(active)
                {
                    if(active.extension_id !== greater.extension_id)
                    {
                       greater_ext_versions[active.extension_id] = greater;
                    }

                    return active;
                }

                return greater;
            });

            extensions_data = _.indexBy(extensions_data, 'extension_id');

            return {
                extensions_to_process: extensions_to_process
            ,   extensions_being_installed: extensions_being_installed
            ,   greater_ext_versions: greater_ext_versions
            ,   extensions_data: extensions_data
            };
        }

    ,   getAllAppExtensions: function(options)
        {
            //I need to get all the active extensions for all the domains
            //to compile ssp-libraries and configuration (default values)
            //I can't filter by website because the same ssp-libraries can be used for different websites
            var all_app_extensions = ExtensionHelper.getAllAppActiveExtensions(options.app_id);

            //Checks if there was an activation for the current website and domain
            var current_activation = _.find(_.values(all_app_extensions), function(activation)
            {
                var same_subsidiary = activation.subsidiary === options.subsidiary
                ,   same_location = activation.location === options.location
                ,   same_website = activation.website_id === options.website_id
                ,   same_domain = activation.domain === options.domain;

                return same_website && same_domain && same_subsidiary && same_location;
            });

            var current_activation_id;
            if(current_activation)
            {
                current_activation_id = current_activation.activation_id;
            }
            else
            {
                current_activation_id = 'new_activation';
                all_app_extensions[current_activation_id] = {
                    activation_id: current_activation_id
                ,   website_id: options.website_id
                ,   domain: options.domain
                ,   subsidiary: options.subsidiary
                ,   location: options.location
                ,   extensions: []
                };
            }

            //Updates the activation's extensions list with the just checked/unchecked by the user
            //Excludes the Theme
            all_app_extensions[current_activation_id].extensions = _.map(options.extensions_active, function(extension)
            {
                return {
                    extension_id: extension.id
                ,   type: extension.type
                ,   priority: extension.priority
                ,   manifest_id: extension.manifest_id
                };
            });

            if(_.isEmpty(options.extensions_active))
            {
                //If there are no extensions checked ignore the activation
                delete all_app_extensions[current_activation_id];
            }

            //Sort the activation's extensions list by the extension's priority
            all_app_extensions = _.map(all_app_extensions, function(activation)
            {
                activation.extensions = _.sortBy(activation.extensions, function(extension)
                {
                    return parseInt(extension.priority);
                });

                return activation;
            });

            return _.indexBy(all_app_extensions, 'activation_id');
        }
    };

    return assistant_helper;
});
