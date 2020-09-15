/**
 *@NApiVersion 2.x
 */
 define(
    [
        'N/search'
    ,   'N/error'
    ,   'N/record'
    ,   '../../CommonUtilities/UtilsSS2'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        search
    ,   error
    ,   record
    ,   utils
    )
{
    var ext_search_helper = {

        getTargets: function getTargets()
		{
            var targets_search = search.create({
                type: 'customlist_ns_sc_extmech_ext_targets'
            ,	columns: [
                    'internalid'
                ,   'name'
                ]
            })
            .run();

			var targets_result = [];

			targets_search.each(function(target) {
				targets_result.push({
					name: target.getValue({name: 'name'})
				,	target_id: target.id
				});

                return true;
			});

			return targets_result;
        }

    ,	getExtensionTypes: function getExtensionTypes()
		{
            var extension_types_search = search.create({
                type: 'customlist_ns_sc_extmech_ext_types'
            ,	columns: ['name']
            })
            .run();

			var extension_types_result = [];
			extension_types_search.each(function(type)
            {
				var formatted_type = {
					name: type.getValue({name: 'name'})
				,	type_id: type.id
				};

				extension_types_result.push(formatted_type);

                return true;
			});

			return extension_types_result;
		}

    ,	searchExtensions: function searchExtensions(name, vendor, version)
		{
			var filters = [];

			if(name)
			{
                filters.push([
                    'name'
                ,   search.Operator.IS
                ,   name
                ]);
			}

			if(vendor)
			{
                filters.length && filters.push('and');

                filters.push([
                    'custrecord_extension_vendor'
                ,   search.Operator.IS
                ,   vendor
                ]);
			}

			if(version)
			{
                filters.length && filters.push('and');

                filters.push([
                    'custrecord_extension_version'
                ,   search.Operator.IS
                ,   version
                ]);
			}

            var extensions_search_result = search.create({
                type: 'customrecord_ns_sc_extmech_extension'
            ,   filters: filters
            ,	columns: [
                    'name'
                ,   'custrecord_extension_fantasy_name'
                ,   'custrecord_extension_vendor'
                ,   'custrecord_extension_version'
                ,   'custrecord_extension_type'
                ,   'custrecord_extension_targets'
                ,   'custrecord_extension_target_version'
                ,   'custrecord_extension_description'
                ,   'custrecord_extension_manifest'
                ,   'custrecord_extension_bundleid'
                ]
            })
            .run();

			var extensions_result = []
            ,   self = this;
			extensions_search_result.each(function(extension)
            {
                var target_version = self._getTargetVersion(extension);

				var formatted_extension = {
					extension_id: extension.id
				,	name: extension.getValue({name: 'name'})
				,	fantasy_name: extension.getValue({name: 'custrecord_extension_fantasy_name'})
				,	type: extension.getText({name: 'custrecord_extension_type'})
				,	targets:  extension.getText({name: 'custrecord_extension_targets'})
				,	target_version:  target_version
				,	description: extension.getValue({name: 'custrecord_extension_description'})
				,	version: extension.getValue({name: 'custrecord_extension_version'})
				,	vendor: extension.getValue({name: 'custrecord_extension_vendor'})
				,	manifest_id: extension.getValue({name: 'custrecord_extension_manifest'})
				,	bundle_id: extension.getValue({name: 'custrecord_extension_bundleid'})
				};

                var targets = self._getTargets(extension);

				formatted_extension.targets = targets;
				extensions_result.push(formatted_extension);

                return true;
			});

			return extensions_result;
		}

	,   _getTargets: function (field)
        {
            var target_ids = field.getValue({name: 'custrecord_extension_targets'}).split(',')
            ,	target_names = field.getText({name: 'custrecord_extension_targets'}).split(',')
            ,	targets = [];

            _.each(target_ids, function(id, index)
            {
                targets.push({name: target_names[index], target_id: id});
            });

            return targets;
        }

    ,	createExtension: function createExtension(extension)
		{
			var self = this;

            extension.fantasy_name = extension.fantasy_name || extension.fantasyName;

            var extension_type = search.create({
                type: 'customlist_ns_sc_extmech_ext_types'
            ,   filters: [
                    ['name', search.Operator.IS, extension.type]
                ]
            })
            .run()
            .getRange({start: 0, end: 1});

			if (!extension_type || !extension_type[0])
			{
                throw error.create({
                    name: 'SCE_EXTENSION_INVALID_TYPE'
                ,   message: 'Could not find the Extension type: ' + extension.type
                });
			}
            else if(extension.type !== extension.type.toLowerCase())
            {
                throw error.create({
                    name: 'SCE_EXTENSION_INVALID_TYPE'
                ,   message: 'Extension type: ' + extension.type + ' must be in lowercase.' +
                        ' Valid types are: "extension" or "theme".'
                });
            }

			var targets = extension.targets;
			var lastFilter;
			var filters = [];

			_.each(targets, function(target_id)
			{
				if (lastFilter)
				{
					filters.push('or');
				}

                lastFilter = [
                    'internalid'
                ,   search.Operator.IS
                ,   target_id
                ];

                filters.push(lastFilter);
			});

            var extension_targets = search.create({
                type: 'customlist_ns_sc_extmech_ext_targets'
            ,   filters: filters
            })
            .run()
            .getRange({start: 0, end: 1});

			if (!extension_targets || !extension_targets[0])
			{
                throw error.create({
                    name: 'SCE_EXTENSION_WRONG_TARGET'
                ,   message: 'Could not find the Supported Target Application/s: ' + extension.targets.join(',')
                });
			}

			var existent_extension = self.searchExtensions(extension.name, extension.vendor, extension.version);

			if(existent_extension.length > 0)
			{
                throw error.create({
                    name: 'SCE_EXTENSION_ALREADY_EXISTS'
                ,   message: 'There is already an extension with vendor: ' + extension.vendor + ', name: ' + extension.name + ' and version: ' + extension.version
                });
			}

            // add the extension
            var ext_record = record.create({type: 'customrecord_ns_sc_extmech_extension'});

            ext_record.setValue({fieldId: 'name', value: extension.name});
            ext_record.setValue({fieldId: 'custrecord_extension_fantasy_name', value: extension.fantasy_name || extension.name});
            ext_record.setValue({fieldId: 'custrecord_extension_type', value: extension_type[0].id});
            ext_record.setValue({fieldId: 'custrecord_extension_description', value: extension.description});
            ext_record.setValue({fieldId: 'custrecord_extension_manifest', value: extension.manifest_id});
            ext_record.setValue({fieldId: 'custrecord_extension_targets', value: extension.targets});
            ext_record.setValue({fieldId: 'custrecord_extension_vendor', value: extension.vendor});
            ext_record.setValue({fieldId: 'custrecord_extension_version', value: extension.version});

            ext_record.setValue({fieldId: 'custrecord_extension_target_version', value: JSON.stringify(extension.target_version)});
            ext_record.setValue({fieldId: 'custrecord_extension_bundleid', value: extension.bundle_id});
            ext_record.setValue({fieldId: 'custrecord_extension_scriptid', value: extension.scriptid});

            return ext_record.save();
		}

    ,	updateExtension: function updateExtension(extension)
		{
            extension.id = extension.id || extension.extension_id;
            extension.fantasy_name = extension.fantasy_name || extension.fantasyName;

			var ext_record = record.load({type: 'customrecord_ns_sc_extmech_extension', id: extension.id});

			if(!ext_record)
			{
                throw new Error('SCE_EXTENSION_NOT_EXIST', 'Could not find extension with id: ' + extension.extension_id);
            }

            extension.name && ext_record.setValue({fieldId: 'name', value: extension.name});
            (extension.fantasy_name || extension.name) && ext_record.setValue({fieldId: 'custrecord_extension_fantasy_name', value: extension.fantasy_name || extension.name});
            extension.description && ext_record.setValue({fieldId: 'custrecord_extension_description', value: extension.description});
            extension.manifest_id && ext_record.setValue({fieldId: 'custrecord_extension_manifest', value: extension.manifest_id});
            extension.targets && ext_record.setValue({fieldId: 'custrecord_extension_targets', value: extension.targets});
            extension.target_version && ext_record.setValue({fieldId: 'custrecord_extension_target_version', value: JSON.stringify(extension.target_version)});
            extension.vendor && ext_record.setValue({fieldId: 'custrecord_extension_vendor', value: extension.vendor});
            extension.version && ext_record.setValue({fieldId: 'custrecord_extension_version', value: extension.version});

            var extension_id = ext_record.save();
            return extension_id;
		}

	,   getSupportedTargetsIds: function(manifest_targets)
        {
            var targets = manifest_targets.split(',')
            ,   lastFilter
            ,   filters = [];

            for (var i = 0; i < targets.length; i++)
            {
                if(targets[i] !== targets[i].toUpperCase())
                {
                    throw error.create({
                        name: 'SCE_MANIFEST_INVALID_TARGET'
                    ,   message: targets[i] + ' target must be in uppercase'
                    });
                }

                if (lastFilter)
                {
                    filters.push('or');
                }

                lastFilter = ['name', search.Operator.IS, targets[i].trim()];
                filters.push(lastFilter);
            }

            var extension_targets = search.create({
                type: 'customlist_ns_sc_extmech_ext_targets'
            ,   filters: filters
            })
            .run();

            var extension_targets_id = [];

            if (extension_targets)
            {
                extension_targets.each(function(result)
                {
                    extension_targets_id.push(result.id);
                    return true;
                });
            }

            return extension_targets_id;
        }

     ,  _getTargetVersion: function (field)
        {
            var target_version = field.getValue({name: 'custrecord_extension_target_version'});
            target_version = !target_version || target_version === 'undefined' ? '{}' : target_version;
            target_version = JSON.parse(target_version);
            return target_version;
        }

    ,   getExtensionsByAppType: function(app)
        {
            var targets = this.getTargets();

			var app_target_found = _.find(targets, function(target)
			{
				return target.name === app.type;
			});

			if(!app_target_found)
			{
				throw error.create({
                    name: 'ERROR'
                ,   message: 'Invalid Application Type.'
                });
			}

			var extensions_data = search.create({
                type: 'customrecord_ns_sc_extmech_extension'
            ,   filters: [
                    ['custrecord_extension_targets', search.Operator.ANYOF, [app_target_found.target_id]]
                ]
            ,	columns: [
                    'name'
                ,   'custrecord_extension_fantasy_name'
                ,   'custrecord_extension_type'
                ,   'custrecord_extension_description'
                ,   'custrecord_extension_version'
                ,   'custrecord_extension_target_version'
                ,   'custrecord_extension_vendor'
                ,   'custrecord_extension_manifest'
                ,   'custrecord_extension_bundleid'
                ]
            })
            .run();

			var aux = {}
            ,   self = this;
			extensions_data.each(function(extension_data)
            {
                var target_version = self._getTargetVersion(extension_data);

                //Ignore those extensions that are not targeted to the app version
                if(target_version[app.type] && !utils.satisfiesSemver(app.version, target_version[app.type]))
                {
                    return true;
                }

				aux[extension_data.id] = {
				    extension_id: extension_data.id
				,   name: extension_data.getValue({name: 'name'})
				,   fantasy_name: extension_data.getValue({name: 'custrecord_extension_fantasy_name'})
				,   type: extension_data.getText({name: 'custrecord_extension_type'})
				,   description: extension_data.getValue({name: 'custrecord_extension_description'})
				,   version: extension_data.getValue({name: 'custrecord_extension_version'})
				,   target_version: target_version
				,   vendor: extension_data.getValue({name: 'custrecord_extension_vendor'})
				,   manifest_id: extension_data.getValue({name: 'custrecord_extension_manifest'})
                ,   bundle_id: extension_data.getValue({name: 'custrecord_extension_bundleid'})
				};

                return true;
			});

			return aux;
        }

    ,   getActiveExtensions: function(website_id, domain, subsidiary, location, app_id)
        {
            var filters = [
                search.createFilter({name: 'custrecord_website_id', join: 'custrecord_activation_id', operator: search.Operator.IS, values: website_id})
            ,   search.createFilter({name: 'custrecord_domain_id', join: 'custrecord_activation_id', operator: search.Operator.IS, values: domain})
            ,   search.createFilter({name: 'custrecord_application_id', join: 'custrecord_activation_id', operator: search.Operator.IS, values: app_id})
            ];

            if(subsidiary)
            {
                filters.push(
                    search.createFilter({
                        name: 'custrecord_subsidiary_id'
                    ,   join: 'custrecord_activation_id'
                    ,   operator: search.Operator.IS
                    ,   values: subsidiary
                    })
                );

                location && filters.push(
                    search.createFilter({
                        name: 'custrecord_location_id'
                    ,   join: 'custrecord_activation_id'
                    ,   operator: search.Operator.IS
                    ,   values: location
                    })
                );
            }

			var active_extensions = search.create({
                type: 'customrecord_ns_sc_extmech_ext_active'
            ,   filters: filters
            ,	columns: [
                    'custrecord_extension_id'
                ,   'custrecord_priority'
                ,   search.createColumn({name: 'custrecord_website_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_domain_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_subsidiary_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_location_id', join: 'custrecord_activation_id'})
                ]
            })
            .run();

			var aux = {};
			active_extensions.each(function(active_extension) {
                var extension_id = active_extension.getValue({name: 'custrecord_extension_id'});

				aux[extension_id] = {
					extension_id: extension_id
				,	priority: active_extension.getValue({name: 'custrecord_priority'})
				,	website_id: active_extension.getValue({name: 'custrecord_website_id', join: 'custrecord_activation_id'})
				,	domain_id: active_extension.getValue({name: 'custrecord_domain_id', join: 'custrecord_activation_id'})
				,	subsidiary_id: active_extension.getValue({name: 'custrecord_subsidiary_id', join: 'custrecord_activation_id'})
				,	location_id: active_extension.getValue({name: 'custrecord_location_id', join: 'custrecord_activation_id'})
				};

                return true;
			});

			return aux;
        }

    ,   getAllAppActiveExtensions: function(app_id)
        {
            var all_app_extensions = search.create({
                type: 'customrecord_ns_sc_extmech_ext_active'
            ,   filters: [
                    search.createFilter({
                        name: 'custrecord_application_id'
                    ,   join: 'custrecord_activation_id'
                    ,   operator: search.Operator.IS
                    ,   values: app_id
                    })
                ]
            ,	columns: [
                    'custrecord_extension_id'
                ,   'custrecord_activation_id'
                ,   'custrecord_priority'
                ,   search.createColumn({name: 'custrecord_website_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_domain_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_subsidiary_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_location_id', join: 'custrecord_activation_id'})
                ,   search.createColumn({name: 'custrecord_extension_type', join: 'custrecord_extension_id'})
                ,   search.createColumn({name: 'custrecord_extension_manifest', join: 'custrecord_extension_id'})
                ]
            })
            .run();

			var aux = {};
			all_app_extensions.each(function(extension_search)
            {
				var extension_id = extension_search.getValue({name: 'custrecord_extension_id'})
				,	activation_id = extension_search.getValue({name: 'custrecord_activation_id'})
				,	extension = {
						extension_id: extension_id
					,	type: extension_search.getText({name: 'custrecord_extension_type', join: 'custrecord_extension_id'})
					,	manifest_id: extension_search.getValue({name: 'custrecord_extension_manifest', join: 'custrecord_extension_id'})
					,	priority: extension_search.getValue({name: 'custrecord_priority'}) || '0'
					};

				aux[activation_id] = aux[activation_id] || {
					activation_id: activation_id
				,	website_id: extension_search.getValue({name: 'custrecord_website_id', join: 'custrecord_activation_id'})
				,	domain: extension_search.getValue({name: 'custrecord_domain_id', join: 'custrecord_activation_id'})
                ,	subsidiary: extension_search.getValue({name: 'custrecord_subsidiary_id', join: 'custrecord_activation_id'})
				,	location: extension_search.getValue({name: 'custrecord_location_id', join: 'custrecord_activation_id'})
				,	extensions: []
				};

				aux[activation_id].extensions.push(extension);

                return true;
			});

			return aux;
        }

     ,  getExtensionsActive: function getExtensionsActive(activation_id)
		{
			var active_ext_search = search.create({
                type: 'customrecord_ns_sc_extmech_ext_active'
            ,   filters: [
                    ['custrecord_activation_id', search.Operator.IS, activation_id]
                ]
            ,   columns: [
                    'custrecord_activation_id'
                ,   'custrecord_extension_id'
                ,   'custrecord_priority'
                ]
            })
            .run();

            var search_result = [];
            active_ext_search.each(function(result)
            {
                search_result.push({
                    id: result.id
                ,   activation_id: result.getValue({name: 'custrecord_activation_id'})
                ,   extension_id: result.getValue({name: 'custrecord_extension_id'})
                ,   priority: result.getValue({name: 'custrecord_priority'})
                });

                return true;
            });

            return search_result;
		}

    ,   getActivations: function getActivations(include_job_data)
        {
            var columns = [
                'custrecord_website_id'
            ,   'custrecord_domain_id'
            ,   'custrecord_subsidiary_id'
            ,   'custrecord_location_id'
            ,   'custrecord_activation_state'
            ,   'custrecord_activation_user'
            ,   'custrecord_activation_job'
            ,   'custrecord_application_id'
            ,   'lastmodified'
            ];

            if(include_job_data)
            {
                columns.push(search.createColumn({name: 'custrecord_ns_sc_extmech_data', join: 'custrecord_activation_job'}));
            }

            var activations_search = search.create({
                type: 'customrecord_ns_sc_extmech_activation'
            ,   columns: columns
            ,   filters: []
            }).run();

            var search_result = [];
            activations_search.each(function(result)
            {
                var data = {
                    id: result.id
                ,   website_id: result.getValue('custrecord_website_id')
                ,   website: result.getText('custrecord_website_id')
                ,   domain: result.getValue('custrecord_domain_id')
                ,   subsidiary_id: result.getValue('custrecord_subsidiary_id')
                ,   location_id: result.getValue('custrecord_location_id')
                ,   subsidiary: result.getText('custrecord_subsidiary_id')
                ,   location: result.getText('custrecord_location_id')
                ,   activation_state: result.getValue('custrecord_activation_state')
                ,   activation_user: result.getValue('custrecord_activation_user')
                ,   activation_job: result.getValue('custrecord_activation_job')
                ,   application_id: result.getValue('custrecord_application_id')
                ,   lastmodified: result.getValue('lastmodified')
                };

                if(include_job_data)
                {
                    data.activation_job_data = result.getValue({name: 'custrecord_ns_sc_extmech_data', join: 'custrecord_activation_job'});
                    data.activation_job_data = data.activation_job_data ? JSON.parse(data.activation_job_data) : {};
                }

                search_result.push(data);

                return true;
            });

            return search_result;
        }

    ,   getAllExtensionsActive: function()
        {
            var activations_extensions_search = search.create({
                type: 'customrecord_ns_sc_extmech_ext_active'
            ,   columns: [
                    search.createColumn({name: 'custrecord_extension_type', join: 'custrecord_extension_id'})
                ,   search.createColumn({name: 'name', join: 'custrecord_extension_id'})
                ,   search.createColumn({name: 'custrecord_extension_fantasy_name', join: 'custrecord_extension_id'})
                ,   search.createColumn({name: 'custrecord_extension_version', join: 'custrecord_extension_id'})
                ,   search.createColumn({name: 'custrecord_extension_vendor', join: 'custrecord_extension_id'})
                ,   'custrecord_activation_id'
                ,   'custrecord_extension_id'
                ],
                filters: []
            }).run();

            var search_result = [];
            activations_extensions_search.each(function(result)
            {
                search_result.push({
                    extension_id: result.getValue({name: 'custrecord_extension_id'})
                ,   activation_id: result.getValue({name: 'custrecord_activation_id'})
                ,   type: result.getText({name: 'custrecord_extension_type', join: 'custrecord_extension_id'})
                ,   name: result.getValue({name: 'name', join: 'custrecord_extension_id'})
                ,   fantasy_name: result.getValue({name: 'custrecord_extension_fantasy_name', join: 'custrecord_extension_id'})
                ,   version: result.getValue({name: 'custrecord_extension_version', join: 'custrecord_extension_id'})
                ,   vendor: result.getValue({name: 'custrecord_extension_vendor', join: 'custrecord_extension_id'})
                });

                return true;
            });
            return search_result;
        }

    ,   getExtensions: function getExtensions()
        {
            var extensions_search = search.create({
                type: 'customrecord_ns_sc_extmech_extension'
            ,   columns: [
                    'name'
                ,   'custrecord_extension_vendor'
                ,   'custrecord_extension_version'
                ,   'custrecord_extension_type'
                ,   'custrecord_extension_fantasy_name'
                ,   'custrecord_extension_targets'
                ,   'custrecord_extension_target_version'
                ]
            ,   filters: []
            }).run();

            var search_result = []
            ,   self = this;
            extensions_search.each(function(result)
            {
                var targets = self._getTargets(result);
                var target_version = self._getTargetVersion(result);

                search_result.push({
                    id: result.id
                ,   name: result.getValue('name')
                ,   vendor: result.getValue('custrecord_extension_vendor')
                ,   version: result.getValue('custrecord_extension_version')
                ,   type: result.getText('custrecord_extension_type')
                ,   fantasy_name: result.getValue('custrecord_extension_fantasy_name')
                ,   targets: targets
                ,   target_version: target_version
                });

                return true;
            });

            return search_result;
        }

    ,   getExtensionsByVendorAndName: function getExtensionsByVendorAndName(vendor, name)
        {
            var result = [];
            var extensions = search.create({
                type: 'customrecord_ns_sc_extmech_extension'
            ,   filters:  [
                    ['name', search.Operator.IS, name]
                ,   'and'
                ,   ['custrecord_extension_vendor', search.Operator.IS, vendor]
                ]
            ,   columns: [
                    'custrecord_extension_scriptid'
                ,   'custrecord_extension_version'
                ,   'custrecord_extension_type'
                ]
            }).run();

            extensions.each(function(extension)
            {
                result.push({
                    id: extension.id
                ,   script_id: extension.getValue({name: 'custrecord_extension_scriptid'})
                ,   type: extension.getText({name: 'custrecord_extension_type'})
                ,   version: extension.getValue({name: 'custrecord_extension_version'})
                });
                return true;
            });

            return result;
        }

    ,   getExtensionsByScriptId: function getExtensionsByScriptId(script_id)
        {
            var result = [];
            var extensions = search.create({
                type: 'customrecord_ns_sc_extmech_extension'
            ,   filters:  [
                    ['custrecord_extension_scriptid', search.Operator.IS, script_id]
                ]
            ,   columns: ['custrecord_extension_version', 'custrecord_extension_vendor', 'name', 'custrecord_extension_manifest']
            }).run();

            extensions.each(function(extension)
            {
                result.push({
                    id: extension.id
                ,   version: extension.getValue({name: 'custrecord_extension_version'})
                ,   vendor: extension.getValue({name: 'custrecord_extension_vendor'})
                ,   name: extension.getValue({name: 'name'})
                ,   manifest_id: extension.getValue({name: 'custrecord_extension_manifest'})
                });

                return true;
            });

            return result;
        }

    ,   getLatestExtension: function getLatestExtension(extensions)
        {
            var last_version, last_extension;
            _.each(extensions, function(ext)
            {
                if(!last_extension)
                {
                    last_extension = ext;
                    last_version = ext.version;
                }

                if(utils.compareSemverVersions(last_version, ext.version))
                {
                    last_version = ext.version;
                    last_extension = ext;
                }
            });

            return last_extension;
        }

    ,	getActivationsPerAppId: function getActivationsPerAppId(website_id, application_id)
		{
            var activations_search = search.create({
                type: 'customrecord_ns_sc_extmech_activation'
            ,   filters: [
                    ['custrecord_website_id', search.Operator.IS, website_id]
                ,   'and'
                ,   ['custrecord_application_id', search.Operator.IS, application_id]
                ]
            ,   columns: [
                    'custrecord_domain_id'
                ,   'custrecord_subsidiary_id'
                ,   'custrecord_location_id'
                ,   'custrecord_activation_user'
                ,   'custrecord_activation_state'
                ,   'lastmodified'
                ]
            })
            .run();

            var search_result = [];
            activations_search.each(function(result)
            {
                search_result.push({
                    id: result.id
                ,   domain_id: result.getValue({name: 'custrecord_domain_id'})
                ,   subsidiary_id: result.getValue({name: 'custrecord_subsidiary_id'})
                ,   location_id: result.getValue({name: 'custrecord_location_id'})
                ,   activation_user: result.getText({name: 'custrecord_activation_user'})
                ,   activation_state: result.getValue({name: 'custrecord_activation_state'})
                ,   lastmodified: result.getValue({name: 'lastmodified'})
                });

                return true;
            });

            return search_result;
		}

    ,	getActiveExtensionsOfOldWebsite: function getActiveExtensionsOfOldWebsite(domain, subsidiary, location, app_id)
		{
            var filters = [
                search.createFilter({name: 'custrecord_application_id', join: 'custrecord_activation_id', operator: search.Operator.ISNOT, values: app_id})
            ,	search.createFilter({name: 'custrecord_domain_id', join: 'custrecord_activation_id', operator: search.Operator.IS, values: domain})
            ];

            if(subsidiary)
            {
                filters.push(
                    search.createFilter({
                        name: 'custrecord_subsidiary_id'
                    ,   join: 'custrecord_activation_id'
                    ,   operator: search.Operator.IS
                    ,   values: subsidiary
                    })
                );

                location && filters.push(
                    search.createFilter({
                        name: 'custrecord_location_id'
                    ,   join: 'custrecord_activation_id'
                    ,   operator: search.Operator.IS
                    ,   values: location
                    })
                );
            }

            var active_extensions = search.create({
                type: 'customrecord_ns_sc_extmech_ext_active'
            ,   filters: filters
            ,   columns: [
                    'custrecord_activation_id'
                ]
            })
            .run();

			var result = {
				extensions: []
			};
			active_extensions.each(function(active_extension)
			{
				result.activation_id = active_extension.getValue({name: 'custrecord_activation_id'});
				result.extensions.push(active_extension.id);

                return true;
			});

			return result;
		}

    ,	updateExtensionsActivePriority: function updateExtensionsActivePriority(id, extension)
		{
			var extension_active_record = record.load({type: 'customrecord_ns_sc_extmech_ext_active', id: id});
			extension_active_record.setValue({fieldId: 'custrecord_priority', value: extension.priority});
			extension_active_record.save();
		}

    ,	deleteExtensionActive: function deleteExtensionActive(extension_id)
		{
			record.delete({type: 'customrecord_ns_sc_extmech_ext_active', id: extension_id});
		}

	,	createExtensionsActive: function createExtensionsActive(activation_id, extension, extensionDependencies)
		{
			var extension_active_record = record.create({type: 'customrecord_ns_sc_extmech_ext_active'});
			extension_active_record.setValue({fieldId: 'custrecord_activation_id', value: activation_id});
			extension_active_record.setValue({fieldId: 'custrecord_extension_id', value: extension.id});
			extension_active_record.setValue({fieldId: 'custrecord_priority', value: extension.priority});

			if(!_.isEmpty(extensionDependencies)){
                extension_active_record.setValue({fieldId: 'custrecord_extact_dependencies', value: JSON.stringify(extensionDependencies)});
            }

			extension_active_record.save();
		}

    };

    return ext_search_helper;
});
