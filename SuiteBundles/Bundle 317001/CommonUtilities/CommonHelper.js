/**
 *@NApiVersion 2.x
 */
define(
	[
		'N/search'
	,	'N/file'
	,	'N/error'
	,	'N/runtime'
	,	'N/util'
	]
,	function(
		search_module
	,	file_module
	,	error_module
	,	runtime
	,	util
	)
	{
		var common_helper = {

			activations: {}

		,	getActivationManifest: function getActivationManifest(domain)
			{
				var extensions_folder_id = this.getExtensionsFolderId(domain);

				var	activation_manifest
				,	activation_manifest_search = search_module.create({
						type: 'file'
					,	filters: [
							['folder', search_module.Operator.IS, extensions_folder_id]
						,	'and'
						,	['name', search_module.Operator.IS, 'activationManifest-' + domain + '.json']
						]
					}).run();

				activation_manifest_search.each(function(result)
				{
					activation_manifest = file_module.load({id: result.id}).getContents();
				});

				return JSON.parse(activation_manifest);
			}

		,	getActivation: function getActivation(domain)
			{
				if(!this.activations[domain])
				{
					var activation
					,	activation_search = search_module.create({
						type: 'customrecord_ns_sc_extmech_activation'
					,	columns: [
							'custrecord_application_id'
						,	'custrecord_activation_state'
						,	'custrecord_activation_user'
						,	'lastmodified'
						]
					,	filters: [
							['custrecord_domain_id', search_module.Operator.IS, domain]
						]
					}).run();

					activation_search.each(function(result)
					{
						activation = {
							activation_id: result.id
						,	domain: domain
						,	app_folder_id: result.getValue({name: 'custrecord_application_id'})
						,	state: result.getValue({name: 'custrecord_activation_state'})
						,	user: result.getText({name: 'custrecord_activation_user'})
						,	lastmodified: result.getValue({name: 'lastmodified'})
						};
					});

					this.activations[domain] = activation;
				}

				return this.activations[domain];
			}

		,	getExtensionsFolderId: function getExtensionsFolderId(domain)
			{
				var app_folder_id = this.getActivation(domain).app_folder_id
				,	extensions_folder_id
				,	extensions_folder_search = search_module.create({
						type: 'folder'
					,	filters: [
							['parent', search_module.Operator.IS, app_folder_id]
						,	'and'
						,	['name', search_module.Operator.IS, 'extensions']
						]
					}).run();

				extensions_folder_search.each(function(result)
				{
					extensions_folder_id = result.id;
				});

				return extensions_folder_id;
			}

		,	getCustomSkin: function getCustomSkin(theme_name, domain)
			{
				var activation_id = this.getActivation(domain).activation_id
				,	custom_skin
				,	custom_skin_search = search_module.create({
						type: 'customrecord_ns_sc_extmech_custom_skin'
					,	columns: [
							'custrecord_custom_skin_theme'
						,	'custrecord_custom_skin_json'
						,	'custrecord_custom_skin_sass'
						,	'custrecord_custom_skin_skin_id'
						]
					,	filters: [
							['custrecord_custom_skin_theme', search_module.Operator.IS, theme_name]
						,	'and'
						,	['custrecord_custom_skin_activation', search_module.Operator.IS, activation_id]
						]
					}).run();

				custom_skin_search.each(function(result)
				{
					custom_skin = {
						id: result.id
					,	theme_name: result.getValue({name: 'custrecord_custom_skin_theme'})
					,	json: result.getValue({name: 'custrecord_custom_skin_json'})
					,	sass: result.getValue({name: 'custrecord_custom_skin_sass'})
					,	skin_id: result.getValue({name: 'custrecord_custom_skin_skin_id'})
					};
				});

				return custom_skin;
			}

		,	getThemeManifest: function getThemeManifest(manifests)
			{
				var theme_manifest;
				util.each(manifests, function(manifest)
				{
					if(manifest.type === 'theme')
					{
						theme_manifest = manifest;
					}
				});

				return theme_manifest;
			}

		,	getGovernance: function getGovernance()
			{
				var scriptObj = runtime.getCurrentScript();
				return scriptObj.getRemainingUsage();
			}

		,	throwError: function throwError(name, message)
			{
				throw error_module.create({
					header: {
						status: {
							code: 'ERROR'
						}
					}
				,	error_code: name
				,	message: message
				});
			}

		,	buildErrorResponse: function buildErrorResponse(context, error)
			{
				var extra_data = error.data || {};
				error = error.cause || error;

				var result = error;
				if(!result.header)
				{
					result = {
						header: {
							status: {
								code: 'ERROR'
							}
						}
					,	error_code: error.name || error.code || 'Unexpected Error'
					,	message: error.message || error.details || 'Unexpected Error'
					,	extra_data: extra_data
					};
				}

				return this.buildResponse(context, result);
			}

		,	buildResponse: function buildResponse(context, result)
			{
				result.governance = this.getGovernance();

				result.header = result.header || {
					status: {
						code: 'SUCCESS'
					}
				};

				var	callback = context.request.parameters.callback
				,	response = JSON.stringify(result);

				if(callback)
				{
					response = callback + '(' + response +')';
				}

				context.response.write(response);
			}

        ,   validateRequestOrigin: function validateRequestOrigin(request)
            {
                var origin = request.headers.Referer || request.headers.referer || ''
                ,   domain = request.parameters.domain;

                origin = origin.match(/(https?:\/\/)?([^\/]*)\/?/i);
                origin = origin && origin[2];

                if(!domain || !origin || origin !== domain)
                {
                    this.throwError('SCE_INVALID_ORIGIN', 'Invalid request origin: ' + origin + ' or domain: ' + domain);
                }
            }

		};

		return common_helper;
	}
);
