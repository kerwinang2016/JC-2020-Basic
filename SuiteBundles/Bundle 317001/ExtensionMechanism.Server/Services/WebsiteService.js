/*exported websiteService*/

var websiteService = (function () {

	'use strict';

	var WebsiteApi = require('WebsiteApi')
	,	Utils = require('Utils');

	return function websiteService(request, response)
	{
		var	retobj = {
			header: {
				status: {
					code: 'SUCCESS',
					message: 'success'
				}
			},
			result: {}
		};

		request = Utils.requestToNLApiRequest(request);

		try{
			if(request.getMethod() === 'GET')
			{
				var website_id = request.getParameter('website_id')
				,   subsidiary_id = request.getParameter('subsidiary_id');

				if(website_id)
				{
				   retobj.result = WebsiteApi.getWebsite(website_id);
				}
                else if(subsidiary_id)
				{
				   retobj.result = WebsiteApi.getSubsidiaryLocations(subsidiary_id);
				}
				else
				{
					retobj.result = WebsiteApi.getWebsites();
				}
			}
		}
		catch(e)
		{
			var error = e instanceof nlobjError ? e : nlapiCreateError(e)
			,	code = error.getCode()
			,	msg = error.getDetails();

			nlapiLogExecution('ERROR', 'SCE_WEBSITE_SERVICE_ERROR', code + '\n' + msg);

			retobj.header.status.code = code;
			retobj.header.status.message = msg;
		}

		var ctx = nlapiGetContext();
		retobj.governance = ctx.getRemainingUsage();

		// test services
		if(!response)
		{
			return retobj;
		}

		response.setContentType('JSON');
		response.writeLine(JSON.stringify(retobj));
	};
})();
