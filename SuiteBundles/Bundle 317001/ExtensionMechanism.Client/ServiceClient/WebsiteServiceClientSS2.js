/**
 *@NApiVersion 2.x
 */
define(
	[
		'../Helpers/RequestHelperSS2'
    ,   'N/url'
	]
,	function (
		RequestHelper
    ,   url_module
	)
{
    var url = url_module.resolveScript({
        scriptId: 'customscript_ns_sc_ext_mech_services'
    ,   deploymentId: 'customdeploy_ns_sc_ext_mech_services'
    ,   returnExternalUrl: false
    ,   params: {
            service_name: 'WEBSITE_SERVICE'
        }
    });

    var website_service_client =  {

		getWebsite: function getWebsite(website_id)
		{
			var options = {
				url: url + '&website_id=' + website_id
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
