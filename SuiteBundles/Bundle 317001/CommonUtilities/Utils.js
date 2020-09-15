define(
	'Utils'
,	[
	]
,	function (
	)
{
	'use strict';

	var Utils = {

		requestToNLApiRequest: function requestToNLApiRequest(req)
		{
			if(req.getParameter)
			{
				return req;
			}
			else
			{
				req = _.isString(req) ? JSON.parse(req) : req;

				if(!req.method)
				{
					var method = 'POST';

					switch(req.operation)
					{
						
						case 'copy':
						case 'move':
						case 'update_extension':
						case 'update_skin':
							method = 'PUT';
							break;

						case 'search_skin':
						case 'delete_skin':
							method = 'GET';
							break;

						case 'create_folder':
						case 'create_folders':
						case 'create_extension':
						case 'create_skin':
							method = 'POST';
							break;

						default:
							method = 'POST';
							break;
					}

					req = { method: method, data: req };
				}

				req.getParameter = function getParameter(param)
				{
					return req[param];
				};

				req.getMethod = function getMethod()
				{
					return req.method;
				};

				req.getBody = function getBody()
				{
					if(req.method === 'GET' || req.method === 'DELETE')
					{
						return req;
					}
					else
					{
						return JSON.stringify(req.data);
					}
					
				};

				return req;

			}
		}
	};

	return Utils;
});