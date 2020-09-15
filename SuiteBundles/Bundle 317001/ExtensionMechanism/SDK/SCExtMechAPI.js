// -------------
// Extension API
// -------------

/*exported SCExtension*/
/*jshint funcscope:true*/
var SCExtension = {

	afterInstall: function ()
	{
		var bundle_id = nlapiGetContext().getBundleId();
		// Search the folder of the bundle where the Extension was installed, under the 'SuiteBundles' (-16) folder
		// The name of the folder will be 'Bundle XXXX', where XXXX is the bundle ID
		var folder_bundle = nlapiSearchRecord(
			'folder'
		,	null
		,	[
                new nlobjSearchFilter('parent', null, 'is', -16)
            ,   new nlobjSearchFilter('name', null, 'is', 'Bundle ' + bundle_id)
            ]
		);

		if (!folder_bundle || !folder_bundle[0])
		{
            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_BUNDLE_MISSING_FOLDER',
                'Could not find the bundle folder at SuiteBundles/Bundle ' + bundle_id + '.');
        }

        var folder_bundle_id = folder_bundle[0].getId();

        // Search for the folder of the Extension to get the name
        var folder_extension = nlapiSearchRecord(
            'folder'
        ,	null
        ,	[new nlobjSearchFilter('parent', null, 'is', folder_bundle_id)]
        ,	[new nlobjSearchColumn('name')]
        );

        // The Extension should have at least one folder
        if (!folder_extension || !folder_extension.length)
        {
            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_EXTENSION_WRONG_STRUCTURE',
                'The extension inside SuiteBundles/Bundle ' + bundle_id + ' must have at least one folder.' +
                '\nCheck that your extension has a main folder inside SuiteBundles/Bundle ' + bundle_id + ' named with the format "name@version".');
        }

        var has_manifest = false;
        var is_there_new_version = false;
        var last_manifest_checked = null;

        for(var j = 0; j < folder_extension.length; j++)
        {
            var folder_extension_name = folder_extension[j].getValue('name');
            var path = 'SuiteBundles/Bundle ' + bundle_id + '/' + folder_extension_name + '/manifest.json';
            var manifest;

            try
            {
                manifest = nlapiLoadFile(path);
            }
            catch(error)
            {
                //If there is no manifest ignore the folder
                continue;
            }

            has_manifest = true;

            var manifest_id = manifest.getId();
            var manifest_json = JSON.parse(manifest.getValue());

            manifest_json.manifest_id = manifest_id;
            manifest_json.bundle_id = bundle_id;

            var required_fields = manifest_json.vendor && manifest_json.name && manifest_json.version && manifest_json.type && manifest_json.target;

            if (!required_fields)
            {
                throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_INCOMPLETE',
                    'Missing manifest.json information: vendor, name, version, type and target are mandatory.\n' +
                                'Received' +
                                '\nname: ' +  manifest_json.name +
                                '\nvendor: ' + manifest_json.vendor +
                                '\nversion: ' + manifest_json.version +
                                '\ntype: ' + manifest_json.type +
                                '\ntarget: ' + manifest_json.target + '.' +
                        '\nBundle ID: ' + manifest_json.bundle_id +
                        '.\nPlease check these fields inside the manifest.json file of the extension ' +
                        manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.');
            }

            if (!/^\d+\.\d+\.\d+$/.test(manifest_json.version))
            {
                throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_VERSION_INVALID_FORMAT',
                    'Invalid version format in ' + manifest_json.version + '. It must be MAJOR.MINOR.PATCH where each of them are numbers.' +
                    '\nCheck the manifest.json version for extension at Bundle ID: ' + manifest_json.bundle_id +
                    '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.');
            }

            if (manifest_json.type === 'theme' && manifest_json.skins && manifest_json.skins.length)
            {
                for(var i = 0; i < manifest_json.skins.length; i++)
                {
                    var skin = manifest_json.skins[i];

                    required_fields = skin && skin.name && skin.file;

                    if (!required_fields)
                    {
                        throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_INCOMPLETE',
                            'Missing Skin information (name or file).' +
                            '\nReceived skin name: ' + (skin && skin.name) + ', skin file: ' + (skin && skin.file) +
                            '.\nCheck the manifest.json skins section for extension at Bundle ID: ' + manifest_json.bundle_id +
                            '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.');
                    }

                    try{
                        var skin_path = 'SuiteBundles/Bundle ' + bundle_id + '/' + folder_extension_name + '/' + skin.file;
                        nlapiLoadFile(skin_path);
                    }
                    catch(error)
                    {
                        throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_SKIN_NOEXISTS',
                            'The skin file "' + skin_path + '" was not found.' +
                            '\nCheck that the skin ' + skin.file + ' is correctly included inside the theme (usually all the skins are inside a folder called "skins") and check in the manifest.json --> skins section if the file path is correct.' +
                            '\nBundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest_json.name) + '.');
                    }
                }
            }

            if (manifest_json.cct)
            {
                if (Object.prototype.toString.call(manifest_json.cct) !== '[object Array]')
                {
                    manifest_json.cct.label = manifest_json.cct.label || manifest_json.fantasyName || manifest_json.name;
                    manifest_json.cct = [manifest_json.cct];
                }

                for (i = 0; i < manifest_json.cct.length; i++)
                {
                    var cct_json = manifest_json.cct[i];

                    required_fields = required_fields && cct_json.settings_record && cct_json.registercct_id && cct_json.label;

                    if (!required_fields)
                    {
                        throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_INCOMPLETE',
                            'Missing CCT information (setting_record or registercct_id)' +
                            '\nCheck that the manifest.json -> cct section. The fields settings_record, registercct_id and label are mandatory.' +
                            '\nReceived' +
                            '\nsettings_record: ' + cct_json.settings_record +
                            '\nregistercct_id ' + cct_json.registercct_id +
                            '\nlabel ' + cct_json.label +
                            '\nfor extension with Bundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.');
                    }

                    if (cct_json.label.length > 18)
                    {
                        throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_INCOMPLETE',
                            'The maximum number of characters for the CCT label is 18. ' + cct_json.label + ' is ' + cct_json.label.length + ' characters long.' +
                            '\nCheck the manifest.json -> cct section -> label field for extension with Bundle ID: ' +
                                    manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.');
                    }

                    if (!this._getContentTypeid(cct_json.settings_record))
                    {
                        try
                        {
                            nlapiCreateRecord(cct_json.settings_record);
                        }
                        catch(error)
                        {
                            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_SETTINGRECORD_NOEXISTS',
                                'The record "' + cct_json.settings_record + '" does not exists.' +
                                '\nThe manifest.json -> cct section -> settings_record indicates that a custom record with id ' + cct_json.settings_record  +
                                ' must be added with the Extension. However it was not found in the bundle.' +
                                '\nBundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.');
                        }
                    }
                }
            }

            if (manifest_json.page && manifest_json.page.types)
            {
				var types = manifest_json.page.types;

                for (i = 0; i < types.length; i++)
                {
                    var type = types[i];

                    required_fields = required_fields && type.name && type.displayName;

                    if (!required_fields)
                    {
                        throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_INCOMPLETE',
                            'Missing PageType information ("name" or "displayName")' +
                            '\nCheck that the manifest.json -> "page" section. The fields "name", "displayName" are mandatory.' +
                            '\nReceived' +
                            '\nname: ' + type.name +
                            '\ndisplayName ' + type.displayName +
                            '\nfor extension with Bundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.');
                    }

					if (type.settingsRecord)
					{
						try
						{
							nlapiCreateRecord(type.settingsRecord);
						}
						catch(error)
						{
							throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_SETTINGRECORD_NOEXISTS',
								'The record "' + type.settingsRecord + '" does not exists.' +
								'\nThe manifest.json -> "page" section -> "settingsRecord" indicates that a custom record with id ' + type.settingsRecord  +
								' must be added with the Extension. However it was not found in the bundle.' +
								'\nBundle ID: ' + manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + (manifest_json.fantasyName || manifest.json.name) + '.');
						}
					}
                }
            }

            var extension_type = nlapiSearchRecord(
                'customlist_ns_sc_extmech_ext_types'
            ,   null
            ,   [new nlobjSearchFilter('name', null, 'is', manifest_json.type)]
            ,   null
            );

            if (!extension_type || !extension_type[0])
            {
                throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_EXTENSION_INVALID_TYPE',
                    'Could not find the Extension type: ' + manifest_json.type + '.\n' +
                    '\nCheck the type is correct in the manifest.json of extension with Bundle ID: ' +  manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + manifest_json.name +
                    '.\nValid types are: "extension" or "theme".');
            }
            else if(manifest_json.type !== manifest_json.type.toLowerCase())
            {
                throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_EXTENSION_INVALID_TYPE',
                    'Extension type: ' + manifest_json.type + ' must be in lowercase.\n' +
                    '\nCheck the type in the manifest.json of extension with Bundle ID: ' +  manifest_json.bundle_id + '. Extension ' + manifest_json.vendor + '-' + manifest_json.name +
                    '.\nValid types are: "extension" or "theme".');
            }

            is_there_new_version = this.addExtensionToProcess(manifest_json) || is_there_new_version;
            last_manifest_checked = manifest_json;
        }

        if(!has_manifest)
        {
            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_NOT_FOUND',
                'Could not find "manifest.json" file.\n' +
                'Check that a "manifest.json" file exists for at least one folder inside the Bundle ID: ' + bundle_id + '.');
        }

        if(!is_there_new_version)
        {
            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_NOT_NEW_VERSION_FOUND',
                 last_manifest_checked.version + ' is a version minor or equal that the one already installed.' +
                    '\nAn update of the extension must have a greater version than the one installed in the account.\n' +
                    'Update the version inside the "manifest.json" file for bundle ' +  last_manifest_checked.bundle_id +
                    '.\nExtension: ' + last_manifest_checked.vendor + '-' + (last_manifest_checked.fantasyName || last_manifest_checked.name) + '.');
        }
	}

    //Returns true if version_2 is greater than version_1
,   compareVersions: function compareVersions(version_1, version_2)
    {
        var i
        ,   ver_1 = version_1.split('.')
        ,   ver_2 = version_2.split('.');

        //Completes with 0s
        for(i = 0; i < 3; i++)
        {
            ver_1[i] = ver_1[i] || 0;
            ver_2[i] = ver_2[i] || 0;
        }

        var is_greater = false;
        for(i = 0; i < ver_1.length; i++)
        {
            var v1 = parseInt(ver_1[i])
            ,   v2 = parseInt(ver_2[i]);

            if(v1 !== v2)
            {
                is_greater = v2 > v1;
                break;
            }
        }

        return is_greater;
    }

,   checkNewVersion: function(manifest)
    {
        var extensions = nlapiSearchRecord(
			'customrecord_ns_sc_extmech_extension'
		,	null
		,	[
                new nlobjSearchFilter('name', null, 'is', manifest.name)
            ,   new nlobjSearchFilter('custrecord_extension_vendor', null, 'is', manifest.vendor)
            ]
        ,   [new nlobjSearchColumn('custrecord_extension_version')]
		) || [];

        var is_newer = true;
        for (var i = 0; (i < extensions.length) && is_newer; i++)
        {
            var version = extensions[i].getValue('custrecord_extension_version');
            is_newer = this.compareVersions(version, manifest.version);
        }

        //I do not let install or update if there is an installation in progress of an extension of the same vendor and name
        var extensions_in_progress = nlapiSearchRecord(
			'customrecord_ns_sc_extmech_to_process'
		,	null
		,	[
                new nlobjSearchFilter('custrecord_ns_sc_extmech_type', null, 'is', 'EXTENSION_JOB')
            ,   new nlobjSearchFilter('custrecord_ns_sc_extmech_state', null, 'isnot', 'ERROR')
            ,   new nlobjSearchFilter('custrecord_ns_sc_extmech_state', null, 'isnot', 'DONE')
            ]
        ,  [    new nlobjSearchColumn('custrecord_ns_sc_extmech_data')]

		) || [];

        for (var ind = 0; ind < extensions_in_progress.length; ind++)
        {
            var data;
            try
            {
                data = JSON.parse(extensions_in_progress[ind].getValue('custrecord_ns_sc_extmech_data'));
            }
            catch(error)
            {
                return false;
            }

            if(data.name === manifest.name && data.vendor === manifest.vendor) {
                is_newer = false;
                break;
            }
        }

        return is_newer;
    }

,   addExtensionToProcess: function(manifest)
    {
        if(!this.checkNewVersion(manifest))
        {
            return false;
        }

        var targets = manifest.target.split(',').map(function(target_name) {
            return target_name.trim();
        });

        for (var i = 0; i < targets.length; i++)
        {
            if(targets[i] !== targets[i].toUpperCase())
            {
                throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_MANIFEST_INVALID_TARGET',
                    targets[i] + ' target must be in uppercase.');
            }
        }

        var data = {
                    name:           manifest.name,
                    vendor:         manifest.vendor,
                    version:        manifest.version,
                    type:           manifest.type.replace(/^./, manifest.type[0].toUpperCase()),
                    fantasy_name:   manifest.fantasyName || manifest.name,
                    manifest:       manifest.manifest_id,
                    bundle_id:      manifest.bundle_id,
                    target:         targets.join(','),
                    description:    manifest.description || ' ',
                    target_version: manifest.target_version
                    };

        var extension_to_process = nlapiCreateRecord('customrecord_ns_sc_extmech_to_process');
        extension_to_process.setFieldValue('custrecord_ns_sc_extmech_type', 'EXTENSION_JOB');
        extension_to_process.setFieldValue('custrecord_ns_sc_extmech_state', 'PENDING');
        extension_to_process.setFieldValue('custrecord_ns_sc_extmech_data', JSON.stringify(data));
		nlapiSubmitRecord(extension_to_process);

        return true;
    }

,	afterUpdate: function()
	{
		this.afterInstall();
	}

,	_getContentTypeid: function(customrecordscriptid)
	{
        try{
            var search = nlapiSearchRecord(
              'cmscontenttype'
            ,   null
            ,   [
                    new nlobjSearchFilter('customrecordscriptid', null, 'is', customrecordscriptid.toUpperCase())
                ]
            ,   []
            );

            return search && search.length && search[0].getId() || '';
        }
        catch(error)
        {
            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_CMSCONTENTTYPE_NOEXISTS',
                'The record "cmscontenttype" does not exists. Make sure the Bundle "SMT Core Content Types" is installed in the account.');
        }
	}

,	_getExtensionRecords: function()
	{
		var bundle_id = nlapiGetContext().getBundleId();
		var extensions = null;

		if (bundle_id)
		{
			// Search for the extension
			extensions = nlapiSearchRecord(
				'customrecord_ns_sc_extmech_extension'
			,	null
			,	[new nlobjSearchFilter('custrecord_extension_bundleid', null, 'is', bundle_id)]
			,	[
					new nlobjSearchColumn('name')
				,	new nlobjSearchColumn('custrecord_extension_fantasy_name')
				,	new nlobjSearchColumn('custrecord_extension_type')
				,	new nlobjSearchColumn('custrecord_extension_vendor')
				,	new nlobjSearchColumn('custrecord_extension_manifest')
				]);
		}

		return extensions;
	}

,	_getPageTypeId: function(customrecordscriptid)
	{
        try{
            var search = nlapiSearchRecord(
              'cmspagetype'
            ,   null
            ,   [
                    new nlobjSearchFilter('customrecordscriptid', null, 'is', customrecordscriptid.toUpperCase())
                ]
            ,   []
            );

            return search && search.length && search[0].getId() || '';
        }
        catch(error)
        {
            throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_CMSPAGETYPE_NOEXISTS',
                'The record "cmspagetype" does not exists. Make sure that CMS is enable in your account.');
        }
	}

,	_deletePageTypeId: function(customrecordscriptid)
	{
		var id = this._getPageTypeId(customrecordscriptid);

		if (id)
		{
			var search = nlapiSearchRecord('cmspage', null, [new nlobjSearchFilter('fieldsdatacustomrecord', null, 'is', id)], []) || [];

			for (var i = 0; i < search.length; i++)
			{
				nlapiDeleteRecord('cmspage', search[i].getId());
			}

			nlapiDeleteRecord('cmspagetype', id);
		}
	}

,	_deleteContentTypeid: function(customrecordscriptid)
	{
		var id = this._getContentTypeid(customrecordscriptid);

		if (id)
		{
			var search = nlapiSearchRecord('cmscontent', null, [new nlobjSearchFilter('cmscontenttype', null, 'is', id)], []) || [];

			for (var i = 0; i < search.length; i++)
			{
				nlapiDeleteRecord('cmscontent', search[i].getId());
			}

			nlapiDeleteRecord('cmscontenttype', id);
		}
	}

,	_deleteSkinsPresets: function _deleteSkinsPresets(theme_id)
	{
		if (theme_id)
		{
			var search = nlapiSearchRecord(
				'customrecord_ns_sc_extmech_skin_preset'
			,	null
			,	[new nlobjSearchFilter('custrecord_skin_preset_theme', null, 'is', theme_id)]
			,	[]
			) || [];

			for (var i = 0; i < search.length; i++)
			{
				nlapiDeleteRecord('customrecord_ns_sc_extmech_skin_preset', search[i].getId());
			}
		}
	}

,	_deleteCustomSkin: function _deleteCustomSkin(theme_name)
	{
		if (theme_name)
		{
			var search = nlapiSearchRecord(
				'customrecord_ns_sc_extmech_custom_skin'
			,	null
			,	[new nlobjSearchFilter('custrecord_custom_skin_theme', null, 'is', theme_name)]
			,	null
			) || [];

			for (var i = 0; i < search.length; i++)
			{
				nlapiDeleteRecord('customrecord_ns_sc_extmech_custom_skin', search[i].getId());
			}
		}
	}

,   _checkExtensionsInProgress: function()
    {
        var bundle_id = nlapiGetContext().getBundleId();

		if (bundle_id)
		{
			// Search for the extension of this bundle being installed
			var extensions = nlapiSearchRecord(
				'customrecord_ns_sc_extmech_to_process'
            ,   null
			,	[new nlobjSearchFilter('custrecord_ns_sc_extmech_type', null, 'is', 'EXTENSION_JOB')]
            ,   [
                    new nlobjSearchColumn('custrecord_ns_sc_extmech_state')
                ,   new nlobjSearchColumn('custrecord_ns_sc_extmech_data')
                ]
			);

            if(extensions && extensions.length)
            {
                var to_delete = [];
                for(var i = 0; i < extensions.length; i++)
				{
                    var extension = extensions[i]
                    ,   state = extension.getValue('custrecord_ns_sc_extmech_state')
                    ,   data = extension.getValue('custrecord_ns_sc_extmech_data');

                    data = data ? JSON.parse(data) : null;
                    data = data ? data.bundle_id : null;

                    //If there is one being installed fail
                    if(state === 'IN_PROGRESS' && data === bundle_id)
                    {
                        throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_EXTENSION_BEING_INSTALLED',
                            'There is an installation of the bundle ' + bundle_id + ' in progress already.' +
                            '\nPlease wait until if finishes to try again.');
                    }

                    //Gather all the PENDING and ERROR to be deleted
                    to_delete.push(extension.getId());
                }

                for(i = 0; i < to_delete.length; i++)
                {
                    nlapiDeleteRecord('customrecord_ns_sc_extmech_to_process', to_delete[i]);
                }
            }
		}
    }

,	beforeUninstall: function()
	{
		try
		{
            this._checkExtensionsInProgress();

            var extensions = this._getExtensionRecords();

			if (extensions && extensions.length > 0)
			{
				for(var i = 0; i < extensions.length; i++)
				{
					var extension = extensions[i]
					,	extension_id = extension.getId()
					,	extension_name = extension.getValue('name')
					,	extension_fantasy_name = extension.getValue('custrecord_extension_fantasy_name')
					,	extension_vendor = extension.getValue('custrecord_extension_vendor');

					var extension_active = nlapiSearchRecord(
						'customrecord_ns_sc_extmech_ext_active'
					,	null
					,	[new nlobjSearchFilter('custrecord_extension_id', null, 'is', extension_id)]
					,	[new nlobjSearchColumn('custrecord_activation_id')]);

					if (extension_active && extension_active.length)
					{
                        var activations = [];

                        for(var j = 0; j < extension_active.length; j++)
                        {
                            var ext_active = extension_active[j];
                            activations.push(ext_active.getValue('custrecord_activation_id'));
                        }

						throw nlapiCreateError('EXTMECH_INSTALL_SCRIPT: SCE_EXTENSION_ACTIVATED',
                            'The extension ' + (extension_fantasy_name || extension_name) + ' must not be active.\n' +
                            'Go to Setup -> SuiteCommerce Advanced -> Extension Management and deactivate (uncheck checkbox) the extension ' + (extension_fantasy_name || extension_name) +
                            '.\nIt is still associated with SC ExtMech Activation record/s ' + JSON.stringify(activations));
					}

					var manifest_id = extension.getValue('custrecord_extension_manifest');
					var manifest = nlapiLoadFile(manifest_id);
					var manifest_json = JSON.parse(manifest.getValue());

					if (manifest_json.cct)
					{
						if (Object.prototype.toString.call(manifest_json.cct) !== '[object Array]')
						{
							manifest_json.cct = [manifest_json.cct];
						}

						for (j = 0; j < manifest_json.cct.length; j++)
						{
							this._deleteContentTypeid(manifest_json.cct[j].settings_record);
						}

					}

					if (manifest_json.page && manifest_json.page.types)
					{
						var types = manifest_json.page.types;

						for (j = 0; j < types.length; j++)
						{
							if (types[j].settingsRecord)
							{
								this._deletePageTypeId(types[j].settingsRecord);
							}
						}
					}

					if(extension.getText('custrecord_extension_type') === 'Theme')
					{
						this._deleteSkinsPresets(extension_id);
						this._deleteCustomSkin(extension_vendor + '/' + extension_name);
					}

					nlapiDeleteRecord('customrecord_ns_sc_extmech_extension', extension_id);
				}
			}
		}
		catch (error)
		{
			nlapiLogExecution('DEBUG', 'beforeUninstall', JSON.stringify(error));
			throw error;
		}
	}
};
