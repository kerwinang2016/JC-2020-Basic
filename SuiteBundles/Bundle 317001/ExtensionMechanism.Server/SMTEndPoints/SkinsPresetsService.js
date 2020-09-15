/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
	[
		'../../CommonUtilities/CommonHelper'
    ,   '../Helpers/SkinHelperSS2'
	]
,	function(
		common_helper
    ,   skin_helper
	)
	{
		var presets_service = {

			onRequest: function onRequest(context)
			{
				try
				{
                    common_helper.validateRequestOrigin(context.request);

                    if (context.request.method === 'GET')
					{
						var domain = context.request.parameters.domain;

						if(!domain)
						{
							common_helper.throwError('SCE_MISSING_PARAMETER', 'domain input parameter is required');
						}

						var presets = skin_helper.getPresets(domain);

						common_helper.buildResponse(context, {skins: presets});
					}
					else
					{
						common_helper.throwError('SCE_INVALID_HTTP_METHOD', context.request.method + ' method is not supported');
					}
				}
				catch(error)
				{
					common_helper.buildErrorResponse(context, error);
				}
			}
		};

		return presets_service;
	}
);
