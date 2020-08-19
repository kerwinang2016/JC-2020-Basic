function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod();

		switch (method)
		{
			case 'GET':

			var data = {appsecrect:"80dec8520q6e9r7dk4oy8cr89o6t7ow3"};

			var response = nlapiRequestURL("https://api.dayang.cn/TokenService.asmx/GetCustomerLiningUrl",data);
			var response1 = nlapiRequestURL("https://api.dayang.cn/TokenService.asmx/GetStyylcartUrl",data);
			var responseData = [];
			responseData.push(response.getBody());
			responseData.push(response1.getBody());
			Application.sendContent(responseData);
			break;
			default:
			// methodNotAllowedError is defined in ssp library commons.js
			Application.sendError(methodNotAllowedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}
