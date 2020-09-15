/**
 *@NApiVersion 2.x
 */
define(
	[
		'../../CommonUtilities/CommonHelper'
	,	'N/search'
	,	'N/file'
	,	'N/encode'
	,	'N/error'
	,	'N/record'
	]
,	function(
		common_helper
	,	search_module
	,	file_module
	,	encode_module
	,	error_module
	,	record
	)
	{
		var skins_helper = {

			getThemePresets: function getThemePresets(theme_id)
			{
				return search_module.create({
					type: 'customrecord_ns_sc_extmech_skin_preset',
					columns: ['name', 'custrecord_skin_preset_file'],
					filters: [
						['custrecord_skin_preset_theme', search_module.Operator.IS, theme_id]
					]
				}).run();
			}

		,	readPresetFile: function readPresetFile(file_id, file_name)
			{
				var is_json = /\.json$/.test(file_name)
				,	preset_file = file_module.load({id: file_id})
				,	preset_decoded_file;

				if(is_json)
				{
				   preset_decoded_file = preset_file.getContents();
				}
				else
				{
					var is_sass = /\.scss$/.test(file_name);
					if(is_sass)
					{
						preset_decoded_file = encode_module.convert({
							string: preset_file.getContents()
						,	inputEncoding: encode_module.Encoding.BASE_64
						,	outputEncoding: encode_module.Encoding.UTF_8
						});

						//TODO transform to json
					}
					else
					{
						common_helper.throwError('SCE_INVALID_PRESET_FORMAT', 'Preset file must be json or scss');
					}
				}

				return JSON.parse(preset_decoded_file);
			}

		,	getThemeId: function getThemeId(domain, theme_data)
			{
				var activation_id
				,	activation_id_search = search_module.create({
						type: 'customrecord_ns_sc_extmech_activation'
					,	filters: [
							['custrecord_domain_id', search_module.Operator.IS, domain]
						]
					}).run();

				activation_id_search.each(function(result)
				{
					activation_id = result.id;
				});

				var	theme_id_search = search_module.create({
					type: 'customrecord_ns_sc_extmech_ext_active',
					columns: [
						'custrecord_extension_id'
					,	search_module.createColumn({
							name: 'custrecord_extension_type'
						,	join: 'custrecord_extension_id'
						})
                    ,	search_module.createColumn({
                            name: 'custrecord_extension_vendor'
                        ,	join: 'custrecord_extension_id'
                        })
                    ,	search_module.createColumn({
                            name: 'name'
                        ,	join: 'custrecord_extension_id'
                        })
					],
					filters: [
						['custrecord_activation_id', search_module.Operator.IS, activation_id]
					]
				}).run();

				var theme;
				theme_id_search.each(function(result)
				{
					var type = result.getText({name: 'custrecord_extension_type', join: 'custrecord_extension_id'});
					if(type === 'Theme')
					{
						theme = {
                            'id': result.getValue({name: 'custrecord_extension_id'})
                        ,   'vendor': result.getValue({name: 'custrecord_extension_vendor', join: 'custrecord_extension_id'})
                        ,   'name': result.getValue({name: 'name', join: 'custrecord_extension_id'})
                        };
					}
					else
					{
						return true;
					}
				});

				return !!theme_data ? theme : theme && theme.id;
			}

		,	getPresets: function getPresets(domain)
			{
				var	self = this
				,	presets = [];

				var theme_id = this.getThemeId(domain);

				this.getThemePresets(theme_id).each(function(result)
				{
					var file_id = result.getValue({name: 'custrecord_skin_preset_file'})
					,	file_name = result.getText({name: 'custrecord_skin_preset_file'});

                    if(file_id)
                    {
                        presets.push({
                            name: result.getValue({name: 'name'})
                        ,   values: self.readPresetFile(file_id, file_name)
                        });
                    }

					return true;
				});

				return presets;
			}

        ,   searchSkins: function searchSkins(name, theme)
            {
                var filters = [];

                if(name)
                {
                    filters.push(search_module.createFilter({
                        name: 'name'
                    ,   operator: search_module.Operator.IS
                    ,	values: name
                    }));
                }

                if(theme)
                {
                    filters.push(search_module.createFilter({
                        name: 'custrecord_skin_preset_theme'
                    ,   operator: search_module.Operator.IS
                    ,	values: theme
                    }));
                }

                var skins_search_result = search_module.create({
					type: 'customrecord_ns_sc_extmech_skin_preset'
				,   columns: [
						'name'
					,	'custrecord_skin_preset_theme'
					,	'custrecord_skin_preset_file'
					]
				,   filters: filters
				}).run();

                var skins_result = [];
                skins_search_result.each(function(skin)
                {
                    var formatted_skin = {
                        skin_id: skin.id
                    ,	name: skin.getValue({name: 'name'})
                    ,	theme: skin.getValue({name: 'custrecord_skin_preset_theme'})
					,	file:  skin.getValue({name: 'custrecord_skin_preset_file'})
					,	filename:  skin.getText({name: 'custrecord_skin_preset_file'})
                    };

                    skins_result.push(formatted_skin);

                    return true;
                });

                return skins_result;
            }

        ,	createSkin: function createSkin(skin)
            {
                var self = this;

                var existent_skin = self.searchSkins(skin.name, skin.theme);

                if(existent_skin.length > 0)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'There is already a skin with name: ' + skin.name + ', and theme id: ' + skin.theme
                    });
                }
                else
                {
                    var skin_record = record.create({type: 'customrecord_ns_sc_extmech_skin_preset'});

                    if(skin.name)
                    {
                        skin_record.setValue({fieldId: 'name', value: skin.name});
                    }

                    if(skin.theme)
                    {
                        skin_record.setValue({fieldId: 'custrecord_skin_preset_theme', value: skin.theme});
                    }

                    if(skin.file)
                    {
                        skin_record.setValue({fieldId: 'custrecord_skin_preset_file', value: skin.file});
                    }

                    var skin_id = skin_record.save();
                    return skin_id;
                }
            }

        ,	updateSkin: function updateSkin(skin)
            {
                var skin_record = record.load({
                    type: 'customrecord_ns_sc_extmech_skin_preset'
                ,   id: skin.skin_id
                });

                if(skin_record)
                {
                    skin_record.setValue({fieldId: 'name', value: skin.name});
                    skin_record.setValue({fieldId: 'custrecord_skin_preset_theme', value: skin.theme});
                    skin_record.setValue({fieldId: 'custrecord_skin_preset_file', value: skin.file});

                    var skin_id = skin_record.save();
                    return skin_id;
                }
                else
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'Could not find skin with id: ' + skin.skin_id
                    });
                }
            }

        ,	deleteSkin: function deleteSkin(id)
            {
                var skin_record = record.load({
                    type: 'customrecord_ns_sc_extmech_skin_preset'
                ,   id: id
                });

                if(skin_record)
                {
                    record.delete({type: 'customrecord_ns_sc_extmech_skin_preset', id: id});
                }
                else
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'Could not find skin with id: ' + id
                    });
                }
            }

        ,   createUserSkin: function(domain, skin_name, skin_values)
            {
                if(!domain || !skin_name || !skin_values)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'domain, skin_name and skin_values are required'
                    });
                }

                var theme = this.getThemeId(domain, true);
                if(!theme)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'Theme not found for domain ' + domain
                    });
                }
                var theme_name = theme.vendor + '/' + theme.name;

                var skin_record = record.create({type: 'customrecord_ns_sc_extmech_skins'});
                skin_record.setValue({fieldId: 'name', value: skin_name});
                skin_record.setValue({fieldId: 'custrecord_ns_sc_extmech_skin_json', value: skin_values});
                skin_record.setValue({fieldId: 'custrecord_ns_sc_extmech_theme', value: theme_name});
                return skin_record.save();
            }

        ,   updateUserSkin: function(skin_id, skin_name, skin_values)
            {
                if(!skin_id)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'skin_id is required'
                    });
                }

                var skin_record = record.load({type: 'customrecord_ns_sc_extmech_skins', id: skin_id});
                if(!skin_record)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'Skin not found for id: ' + skin_id
                    });
                }

                skin_name && skin_record.setValue({fieldId: 'name', value: skin_name});
                skin_values && skin_record.setValue({fieldId: 'custrecord_ns_sc_extmech_skin_json', value: skin_values});
                skin_record.save();
            }

        ,   searchUserSkins: function(domain, skin_id)
            {
                if(!domain)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'domain or skin_id are required'
                    });
                }

                var theme = this.getThemeId(domain, true);
                if (!theme)
                {
                    throw error_module.create({
                        name: 'SCE_SKIN_HELPER'
                    ,   message: 'Theme not found for domain ' + domain
                    });
                }
                var theme_name = theme.vendor + '/' + theme.name;

                var filter = {
                    name: 'custrecord_ns_sc_extmech_theme'
                ,   operator: search_module.Operator.IS
                ,   values: theme_name
                };

                if(skin_id)
                {
                    filter.name = 'id';
                    filter.values = skin_id;
                }

                var skins_search_result = search_module.create({
                    type: 'customrecord_ns_sc_extmech_skins'
                ,   columns: [
                        'name'
                    ,	'custrecord_ns_sc_extmech_skin_json'
                    ]
                ,   filters: [search_module.createFilter(filter)]
                }).run();

                var custom_skin = common_helper.getCustomSkin(theme_name, domain);
                custom_skin = custom_skin ? custom_skin.skin_id : null;

                var skins_result = [];
                skins_search_result.each(function(skin)
                {
                    var formatted_skin = {
                        id: skin.id
                    ,	name: skin.getValue({name: 'name'})
                    ,	values: JSON.parse(skin.getValue({name: 'custrecord_ns_sc_extmech_skin_json'}) || '{}')
                    ,	current: custom_skin === skin.id
                    };

                    skins_result.push(formatted_skin);
                    if(skin_id)
                    {
                        skins_result = formatted_skin;
                    }

                    return !skin_id;
                });

                return skins_result;
            }

        ,   deleteUserSkin: function(skin_id)
            {
                record.delete({type: 'customrecord_ns_sc_extmech_skins', id: skin_id});
            }

		};

		return skins_helper;
	}
);
