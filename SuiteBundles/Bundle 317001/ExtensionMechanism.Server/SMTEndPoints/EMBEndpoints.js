/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@NModuleScope TargetAccount
 */
define(
	[
		'../../CommonUtilities/CommonHelper'
	,	'../Helpers/SkinHelperSS2'
	,	'N/search'
	,	'N/url'
	]
,	function(
		common_helper
	,	skins_helper
	,	search_module
	,	url_module
	)
	{
		var emb_endpoints = {

			validateInput: function validateInput(input)
			{
				var domain = input.domain;

				if(!domain)
				{
					common_helper.throwError('SCE_MISSING_PARAMETER', 'domain input parameter is required');
				}
			}

		,	getThemeName: function getThemeName(domain)
			{
				var manifests = common_helper.getActivationManifest(domain)
				,	theme = common_helper.getThemeManifest(manifests);

				return theme ? theme.vendor + '/' + theme.name : '';
			}

		,	onRequest: function onRequest(context)
			{
				try
				{
                    common_helper.validateRequestOrigin(context.request);

                    if (context.request.method === 'GET')
					{
						this.validateInput(context.request.parameters);

						var domain = context.request.parameters.domain

                        ,   host = url_module.resolveDomain({
								hostType: url_module.HostType.APPLICATION
							})

						,	compiler_endpoint_url = 'https://' + host + url_module.resolveScript({
								scriptId: 'customscript_ns_sc_ext_mech_services'
							,	deploymentId: 'customdeploy_ns_sc_ext_mech_services'
							,	returnExternalUrl: false
                            ,   params: {
                                    service_name: 'SMT_SASS_COMPILER'
                                }
							}) + '&callback=?'

                        ,	skins_endpoint_url = 'https://' + host + url_module.resolveScript({
                                scriptId: 'customscript_ns_sc_ext_mech_services'
                            ,	deploymentId: 'customdeploy_ns_sc_ext_mech_services'
                            ,	returnExternalUrl: false
                            ,   params: {
                                    service_name: 'USER_SKINS_SERVICE'
                                }
                            }) + '&callback=?'

						,	endpoints = {
								compileEndpoint: {
									url: compiler_endpoint_url
								,	method: 'GET'
                                ,   timeout: 6 * 60 * 1000
								,	dataType: 'jsonp'
								,	data: {
										domain: domain
                                    ,   timeout: 6 * 60 * 1000
									}
								}

							,	saveEndpoint: {
									url: compiler_endpoint_url
								,	method: 'GET'
                                ,   timeout: 6 * 60 * 1000
								,	dataType: 'jsonp'
								,	data: {
										domain: domain
									,	save: true
                                    ,   timeout: 6 * 60 * 1000
									}
								}

                            ,	skinsEndpoint: {
                                    url: skins_endpoint_url
                                ,	method: 'GET'
                                ,   timeout: 6 * 60 * 1000
                                ,	dataType: 'jsonp'
                                ,	data: {
                                        domain: domain
                                    ,   timeout: 6 * 60 * 1000
                                    }
                                }
							};

						var theme_name = this.getThemeName(domain)
						,	custom_skin = common_helper.getCustomSkin(theme_name, domain);

						endpoints.editedSettings = custom_skin && JSON.parse(custom_skin.json) || {};

						endpoints.skins = skins_helper.getPresets(domain);
						endpoints.userSkins = skins_helper.searchUserSkins(domain);

						common_helper.buildResponse(context, endpoints);
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

		return emb_endpoints;
	}
);
