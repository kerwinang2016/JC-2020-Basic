define(
	'WebsiteApi'
,	[
		'ExtensionSearchHelper'
	]
,	function (
		ExtensionSearchHelper
	)
{
	'use strict';

	var targets = ExtensionSearchHelper.getTargets();

	var validAppManifest = function validAppManifest(manifest)
	{
		return _.find(targets, function(target)
		{
			return target.name === manifest.type;
		});
	};

	var website_api = {

		getWebsite: function getWebsite(website_id)
		{
			var ws = nlapiLoadRecord('website', website_id)
			,	domains_length = ws.getLineItemCount('shoppingdomain')
			,	siteregion_length = ws.getLineItemCount('siteregion')
			,	ws_data = {
					website_id: ws.getId()
				,	name: ws.getFieldValue('displayname')
				,	domains: []
                ,   subsidiaries: []
				};

			for(var j = 0; j < domains_length; j++)
			{
				var domain =  ws.getLineItemValue('shoppingdomain', 'domain', j + 1)
				,	touchpoints =  ws.getLineItemValue('shoppingdomain', 'touchpoints', j + 1) || [];

				if(domain)
				{
					try
					{
						touchpoints = JSON.parse(touchpoints);
					}
					catch(e)
					{
						touchpoints = [];
					}

					var webapp_id = touchpoints.length ? _.values(_.first(touchpoints))[0] : null
					,	result = this.getAppManifest(webapp_id)
					,	manifest = result && result.manifest
					,	folder_id = result && result.folder_id;

					if(manifest && folder_id)
					{
						if(manifest && validAppManifest(manifest))
						{
							ws_data.domains.push({
									domain: domain
								//HEADS UP! we'd rather use the folder_id than the app_id because the last change every time that the bundle is updated. folder id remains unchanged
								,	app_id: folder_id //webapp_id
								,	folder_id: folder_id
								,	manifest: manifest
								}
							);
						}
					}
				}
			}

            for(var i = 0; i < siteregion_length; i++)
            {
                var subsidiary =  {
                    'subsidiary_id': ws.getLineItemValue('siteregion', 'subsidiary', i + 1)
                ,   'subsidiary_name': ws.getLineItemText('siteregion', 'subsidiary', i + 1)
                };
                ws_data.subsidiaries.push(subsidiary);
            }

			return ws_data;
		}

	,	getWebsites: function getWebsites()
		{
			var	websites = nlapiSearchRecord(
				'website'
			,	null
			, 	[
					new nlobjSearchFilter('sitetype', null, 'is', 'ADVANCED')
				/*,	new nlobjSearchFilter('isinactive',null, 'is', 'F')*/
                ]
			,	[new nlobjSearchColumn('displayname')]
			);

			var website_data = {};
			for (var i = 0; i < websites.length; i++)
			{
				var ws = websites[i]
				,	ws_data = {
						website_id: ws.getId()
					,	name: ws.getValue('displayname')
					,	domains: []
				};

				website_data[ws.getId()] = ws_data;
			}

			return website_data;
		}

	,	getActivationManifest: function getActivationManifest(folder_id, domain)
		{
			try
			{
				if(!folder_id || !domain)
				{
				   return {};
				}

				var manifestRecords = nlapiSearchRecord(
					'file'
				,	null
				,	[
						new nlobjSearchFilter('folder', null, 'is', folder_id)
					,	new nlobjSearchFilter('name', null, 'is', 'activationManifest-' + domain + '.json')
					]
				);

				if(manifestRecords && manifestRecords.length === 1)
				{
					var manifest = nlapiLoadFile(manifestRecords[0].getId()).getValue();
					return JSON.parse(manifest);
				}
			}
			catch(error)
			{
				nlapiLogExecution('ERROR','Error getting activation manifest file', JSON.stringify(error));
			}
			return {};
		}

	,	getAppManifest: function getAppManifest(webapp_id)
		{
			if(!webapp_id)
			{
				return;
			}

			var manifest_name = 'app_manifest.json'
			,	folder_id = nlapiLookupField('webapp', webapp_id, 'folderid');

			var manifestRecords = nlapiSearchRecord(
				'file'
			,	null
			,	[new nlobjSearchFilter('folder', null, 'is', folder_id), new nlobjSearchFilter('name', null, 'is', manifest_name)]
			);

			var result = {};
			if(folder_id && manifestRecords)
			{
                var manifest = nlapiLoadFile(manifestRecords[0].getId()).getValue();
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
				,	manifest: manifest
				};
			}

			return result;
		}

    ,   getSubsidiaryLocations: function getSubsidiaryLocations(subsidiary_id)
        {
            var	locations = nlapiSearchRecord(
				'location'
			,	null
			, 	[
					new nlobjSearchFilter('subsidiary', null, 'is', subsidiary_id)
				,	new nlobjSearchFilter('isinactive',null, 'is', 'F')
				]
			,	[new nlobjSearchColumn('name')]
			);

			var location_data = {};
			for (var i = 0; i < locations.length; i++)
			{
				var location = locations[i];

				location_data[location.getId()] = {
                    location_id: location.getId()
                ,	location_name: location.getValue('name')
                };
			}

			return location_data;
        }

	};

	return website_api;
});
