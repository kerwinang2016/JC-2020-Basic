/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
	[
		'../SMTEndPoints/SassCompiler'
	,	'../../CommonUtilities/CommonHelper'
	,	'N/search'
	,	'N/record'
	,	'N/runtime'
	,	'N/format'
	,	'N/https'
	,	'N/util'
	,	'N/file'
	]
,	function(
		sass_compiler
	,	common_helper
	,	search_module
	,	record_module
	,	runtime_module
	,	format_module
	,	http_module
	,	util
	,	file_module
	)
	{
		var smt_sass_compiler = {

			updateCustomSkin: function updateCustomSkin(domain, activation_id, theme_name, custom_skin_json, skin_id)
			{
				var custom_skin_record
				,	custom_skin = common_helper.getCustomSkin(theme_name, domain);

				if(custom_skin)
				{
					custom_skin_record = record_module.load({
						type: 'customrecord_ns_sc_extmech_custom_skin'
					,	id: custom_skin.id
					});
				}
				else
				{
					custom_skin_record = record_module.create({
						type: 'customrecord_ns_sc_extmech_custom_skin'
					});

					custom_skin_record.setValue({
						fieldId: 'custrecord_custom_skin_theme'
					,	value: theme_name
					});
					custom_skin_record.setValue({
						fieldId: 'custrecord_custom_skin_activation'
					,	value: activation_id
					});
				}

				custom_skin_record.setValue({
					fieldId: 'custrecord_custom_skin_json'
				,	value: JSON.stringify(custom_skin_json)
				});
				custom_skin_record.setValue({
					fieldId: 'custrecord_custom_skin_sass'
				,	value: this.jsonToSass(custom_skin_json)
				});
				custom_skin_record.setValue({
					fieldId: 'custrecord_custom_skin_skin_id'
				,	value: skin_id
				});

				custom_skin_record.save();
			}

		,	jsonToSass: function jsonToSass(custom_skin_json)
			{
				var custom_skin_sass = '$overrides: (\n'
				,	variables_aux = [];

				util.each(custom_skin_json, function(value, key)
				{
					variables_aux.push('\'' + key + '\': '+value);
				});

				custom_skin_sass += variables_aux.join(',\n') + '\n);';

				return custom_skin_sass;
			}

		,	validateInput: function validateInput(input)
			{
				var params = input.parameters
				,	domain = params.domain
				,	app = params.app
				,	skin = params.skin;

				if(!domain)
				{
					common_helper.throwError('SCE_MISSING_PARAMETER', 'domain input parameter is required');
				}

				if(!app)
				{
					common_helper.throwError('SCE_MISSING_PARAMETER', 'app input parameter is required');
				}

				if(!skin)
				{
					common_helper.throwError('SCE_MISSING_PARAMETER', 'skin input parameter is required');
				}
			}

		,	startBlockinMechanism: function startBlockinMechanism(activation)
			{
                var olson_tz = runtime_module.getCurrentUser().getPreference('TIMEZONE');

                var current_time = format_module.format(new Date(), format_module.Type.DATETIMETZ, olson_tz);//create current_time as string
                current_time = format_module.parse(current_time, format_module.Type.DATETIMETZ, olson_tz);//parse current_time to date
                current_time = current_time.getTime();

                var	last_modified = format_module.parse(activation.lastmodified, format_module.Type.DATETIMETZ, olson_tz);
                last_modified = last_modified.getTime();

				var	time_passed = current_time - last_modified;

				if(activation.state === 'IN_PROGRESS' && time_passed < 3*60*1000)
				{
					common_helper.throwError('SCE_INVALID_ACTIVATION', 'There is another activation process currently running by the user ' + activation.user);
				}

				this.activation_record = record_module.load({
					type: 'customrecord_ns_sc_extmech_activation'
				,	id: activation.activation_id
				});

				this.activation_record.setValue('custrecord_activation_state', 'IN_PROGRESS');
				this.activation_record.setValue('custrecord_activation_user', runtime_module.getCurrentUser().id);

				this.activation_record.save({enableSourcing: true});
			}

		,	stopBlockinMechanism: function stopBlockinMechanism(activation_id, is_error)
			{
				if(!activation_id)
				{
					return;
				}

				this.activation_record = record_module.load({
					type: 'customrecord_ns_sc_extmech_activation'
				,	id: activation_id
				});

				var state = is_error ? 'ERROR' : 'FINISHED';

				this.activation_record.setValue('custrecord_activation_state', state);
				this.activation_record.save({enableSourcing: true});
			}

		,	onRequest: function onRequest(context)
			{
				var save = false
				,   options;

				try
				{
                    var callback = context.request.parameters.callback
                    ,   session = runtime_module.getCurrentSession()
                    ,   session_key = context.request.parameters.session_key || Math.floor(Math.random() * 100000);

                    options = session.get({name: session_key});

                    if(options)
                    {
                        //Redirect Case
                        options = JSON.parse(options);
                    }
                    else
                    {
                        //Original Case
                        common_helper.validateRequestOrigin(context.request);

                        if (context.request.method === 'GET' || context.request.method === 'POST')
                        {
                            this.validateInput(context.request);

                            var params = context.request.parameters
                            ,	domain = params.domain
                            ,	activation = common_helper.getActivation(domain)
                            ,	activation_id = activation.activation_id;

                            options = {
                                activation_id:  activation_id
                            };

                            save = params.save;
                            save = save && (save === 'true' || save === true);

                            save && this.startBlockinMechanism(activation);

                            var	app = params.app
                            ,	manifests = common_helper.getActivationManifest(domain);

                            if(!manifests || !manifests.length)
                            {
                                common_helper.throwError('SCE_INVALID_ACTIVATION', 'There is no activation for ' + domain);
                            }

                            var	theme = common_helper.getThemeManifest(manifests);
                            if(!theme)
                            {
                                common_helper.throwError('SCE_INVALID_ACTIVATION', 'There is no active theme for ' + domain);
                            }

                            var	theme_name = theme.vendor + '/' + theme.name
                            ,	custom_skin_json = util.isString(params.skin) ? JSON.parse(params.skin) : params.skin;

                            options = {
                                domain: domain
                            ,   activation_id: activation_id
                            ,	manifests: manifests
                            ,   theme_name: theme_name
                            ,	save: save
                            ,	app: app
                            ,	output_prefix: !save ? 'tmp_emb_' : 'tmp_css_'
                            ,   custom_skin_json: custom_skin_json
                            ,	custom_skin: this.jsonToSass(custom_skin_json)
                            ,   skin_id: params.skin_id
							,   compiled_apps: {}
                            ,   result: {
									files: []
                                }
                            };

                        }
                        else
                        {
                            common_helper.throwError('SCE_INVALID_HTTP_METHOD', context.request.method + ' method is not supported');
                        }
                    }
					save = options.save;

					var result = sass_compiler.compile(options);
					options.files_paths = options.files_paths ? options.files_paths.concat(result.files_paths) : result.files_paths;
					options.compiled_apps[result.compiled_app] = true;
					var previous_save_changes = options.save_changes;
					options.save_changes = Object.keys(options.compiled_apps).length === result.total_apps;

                    //Merge results
                    options.result.css = options.result.css || result.css;
                    options.result.files = options.result.files.concat(result.files);

                    session.set({
                        name: session_key
                    ,   value: JSON.stringify(options)
					});

					if (!previous_save_changes)
					{
					 	this._sendRedirect(context, session_key, callback);
					}
                    else
                    {
                        //Clean the session key
                        session.set({
                            name: session_key
                        ,   value: ''
						});

						util.each(options.files_paths, function(file_path)
						{
							var file = file_module.load({id: file_path});
							var original_file = file_module.create({
									name    : file.name.replace(options.output_prefix, ''),
									fileType: file_module.Type.STYLESHEET,
									contents: file.getContents()
								});
                            original_file.encoding = file_module.Encoding.UTF_8;
							original_file.folder = file.folder;
							original_file.save();
						});

                        if(save)
                        {
                            this.updateCustomSkin(
                                options.domain
                            ,   options.activation_id
                            ,   options.theme_name
                            ,   options.custom_skin_json
                            ,   options.skin_id
                            );
                            this.stopBlockinMechanism(options.activation_id);
                        }

                        common_helper.buildResponse(context, options.result);
                    }
				}
				catch(error)
				{
					save && this.stopBlockinMechanism(options ? options.activation_id : null, true);

					common_helper.buildErrorResponse(context, error);
				}
			},

			_sendRedirect: function _sendRedirect(context, session_key, callback)
			{
				var script = runtime_module.getCurrentScript();

				context.response.sendRedirect({
					type: http_module.RedirectType.SUITELET
				,   identifier: script.id
				,   id: script.deploymentId
				,   parameters: {
						session_key: session_key
					,   service_name: 'SMT_SASS_COMPILER'
					,   callback: callback
					}
				});
			}

		};

		return smt_sass_compiler;
	}
);
