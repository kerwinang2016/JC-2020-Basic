define(
	'WebsiteServiceClient'
,	[
		'../../../../../DevTools/gulp/extension-mechanism/client-script/RequestHelper'
	]
,	function (
		RequestHelper
	)
{
	'use strict';

	var url = nlapiResolveURL('suitelet', 'customscript_ns_sc_ext_mech_web_service', 'customdeploy_ns_sc_ext_mech_web_service', false);

	var website_service_client =  {

		getWebsite: function getWebsite(website_id)
		{
			var options = {
				url: url +'&website_id=' + website_id
			,	method: 'GET'
			,	data: null
			};

			var promise = RequestHelper.request(options)
			.then(function (response)
			{
				if(response.header.status.code !== 'SUCCESS')
				{
					return Promise.reject(response.header.status.message);
				}

				return response.result;
			});

			return promise;
		}

    ,   getSubsidiaryLocations: function getSubsidiaryLocations(subsidiary_id)
        {
            var options = {
				url: url +'&subsidiary_id=' + subsidiary_id
			,	method: 'GET'
			,	data: null
			};

            var promise = RequestHelper.request(options)
			.then(function (response)
			{
				if(response.header.status.code !== 'SUCCESS')
				{
					return Promise.reject(response.header.status.message);
				}

				return response.result;
			});

			return promise;
        }

	};

	return website_service_client;
});
