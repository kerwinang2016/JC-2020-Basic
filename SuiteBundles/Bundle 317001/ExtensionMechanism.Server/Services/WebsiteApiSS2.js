/**
 * @NApiVersion 2.x
 */

/**
 * This API defines a series of methods to script websites, domains,
 * subsidiaries and locations available in the account: Also allows to get the
 * activation and application manifest files, very relevant for extensibility. -
 * getWebsites: Get all the websites available. - getWebsiteInfo(website_id):
 * Get info about the website with id website_id. - getLocations: Get all the
 * locations in the account. - getSubsidiaries: Get subsidiaries -
 * getActivationManifest: get the Activation Manifest File (registers all the
 * extensions-theme active for a specific domain) - getApplicationManifest: get
 * the Application Manifest file (register the type of application (SCIS,
 * SCA,SCS) and resources available to extend(css, suitescript, configuration,
 * etc.))
 */
define(
    [
        'N/record'
    ,   'N/search'
    ,   'N/file'
    ,   'N/log'
    ,	'N/https'
	,	'N/url'
	,	'N/error'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   '../../CommonUtilities/ErrorHandler'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        record
    ,   search
    ,   file
    ,   log
    ,	http_module
	,	url_module
	,	error_module
    ,   ExtensionHelper
    ,   error_handler
    )
{
    var website_api = {

        getWebsites: function getWebsites()
        {
            try
            {
                var search_websites = search.create({
                    type: 'website'
                ,   filters: [
                        ['sitetype', search.Operator.IS, 'ADVANCED']
                    /*,   'and'
                    ,   ['isinactive', search.Operator.IS, 'F']*/
                    ]
                ,   columns: [
                        'displayname'
                    ]
                }).run();

                var website_data = {};

                search_websites.each(function(result)
                {
                    website_data[result.id] = {
                        name : result.getText({name : 'displayname'})
                    ,   website_id : result.id
                    ,   domains : []
                    };
                    return true;
                });

                return website_data;
            }
            catch (e)
            {
                return error_handler.handleError({
                    code : 'WEBSITE_API_ERROR'
                ,   error : e
                ,   line : 'WebsiteApi.js/getWebsites'
                });
            }
        }

    ,	getActivationManifest: function getActivationManifest(folder_id, domain)
		{
			try
			{
				if(!folder_id || !domain)
				{
                    return {};
                }

				var manifestRecords = search.create({
                    type: 'file'
                ,	filters: [
                        ['folder', search.Operator.IS, folder_id]
                    ,	'and'
                    ,	['name', search.Operator.IS, 'activationManifest-' + domain + '.json']
                    ]
                })
                .run()
                .getRange({start: 0, end: 1});

				if(manifestRecords && manifestRecords.length === 1)
				{
					var manifest = file.load({id: manifestRecords[0].id}).getContents();
					return JSON.parse(manifest);
				}
			}
			catch(error)
			{
				log.error({
                    title: 'Error getting activation manifest file'
                ,   details: error
                });
			}
			return {};
		}

    ,   getAppManifest: function getAppManifest(webapp_id, folderid)
        {
            if(!webapp_id && !folderid)
            {
                return;
            }

            var manifest_name = 'app_manifest.json';

            var folder_id = folderid || search.lookupFields({
                    type: 'webapp'
                ,   id: webapp_id
                ,   columns: ['folderid']
                }).folderid;

            var manifestRecords = search.create({
                    type: 'file'
                ,   filters: [
                        ['folder', search.Operator.IS, folder_id]
                    ,   'and'
                    ,   ['name', search.Operator.IS, manifest_name]
                    ]
                })
                .run()
                .getRange({start: 0, end: 1});

            var result = {};
            if(folder_id && manifestRecords && manifestRecords.length)
            {
                var manifest = file.load({id: manifestRecords[0].id}).getContents();
                manifest = JSON.parse(manifest);

                //Because of backward compatibility add the applications if are not defined in the app_manifest
                if(_.isUndefined(manifest.application))
                {
                    if(manifest.type === 'SCA' || manifest.type === 'SCS')
                    {
                        manifest.application = [
                            'shopping'
                        ,   'myaccount'
                        ,   'checkout'
                        ];
                    }
                    else if(manifest.type === 'SCIS')
                    {
                        manifest.application = ['instore'];
                    }
                }

                result = {
                    folder_id: folder_id
                ,   manifest: manifest
                };
            }

            return result;
        }

    ,   validAppManifest: function validAppManifest(manifest)
        {
            var targets = ExtensionHelper.getTargets();

            return _.find(targets, function(target)
            {
                return target.name === manifest.type;
            });
        }

    ,   getWebsite: function getWebsite(website_id, domain_id)
        {
            var ws = record.load({type: record.Type.WEBSITE, id: website_id})
            ,   domains_length = ws.getLineCount({sublistId: 'shoppingdomain'})
            ,   ws_data = {
                    website_id : ws.id
                ,   name : ws.getValue({fieldId: 'displayname'})
                ,   domains : []
                };

            for (var j = 0; j < domains_length; j++)
            {
                var domain = ws.getSublistValue({sublistId: 'shoppingdomain', fieldId: 'domain', line: j})
                ,   touchpoints = ws.getSublistValue({sublistId: 'shoppingdomain', fieldId: 'touchpoints', line: j});

                if (domain && touchpoints)
                {
                    if(domain_id && domain_id !== domain){
                        continue;
                    }

                    /*
                    * touchpoints looks like:
                    * "CART\u0003\u0003View Cart\u000398\u0003SCA_DPELAEZ\u0004REGISTER\u0003\u0003Register\u000398\u0003SCA_DPELAEZ"
                    * */
                    touchpoints = _.map(touchpoints.split('\u0004'), function(touchpoint){
                        //['CART', '', 'View Cart', 98, 'SCA_DPELAEZ']
                        return touchpoint.split('\u0003')[3];
                    });

                    var webapp_id = touchpoints.length ? _.first(touchpoints) : null
                    ,   result = this.getAppManifest(webapp_id)
                    ,   manifest = result && result.manifest
                    ,   folder_id = result && result.folder_id;

                    if (manifest && folder_id)
                    {
                        if (manifest && this.validAppManifest(manifest))
                        {
                            ws_data.domains.push({
                                domain : domain
                                // HEADS UP! we'd rather use the folder_id
                                // than the app_id because the last change
                                // every time that the bundle is updated.
                                // folder id remains unchanged
                            ,   app_id : folder_id // webapp_id
                            ,   folder_id : folder_id
                            ,   manifest : manifest
                            });
                        }
                    }
                }
            }

            return ws_data;
        }

    ,   getSubsidiaryLocations: function getSubsidiaryLocations(subsidiary_id)
        {
            var	locations = search.create({
                    type: 'location'
                ,	filters: [
                        ['subsidiary', search.Operator.IS, subsidiary_id]
                    ,   'and'
                    ,   ['isinactive', search.Operator.IS, 'F']
                    ]
                ,   columns: ['name']
                })
                .run();

			var location_data = {};
			locations.each(function(result)
			{
				location_data[result.id] = {
                    location_id: result.id
                ,	location_name: result.getValue({name: 'name'})
                };

                return true;
			});

			return location_data;
        }

    };

    return website_api;

});
