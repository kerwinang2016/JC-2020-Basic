/**
 * @NApiVersion 2.x
 * @NScriptType BundleInstallationScript
 */
define(
    [
        'N/search'
    ,   'N/runtime'
    ,   'N/config'
    ,   'N/error'
    ,   'N/file'
    ]
,   function(
        Nsearch
    ,   Nruntime
    ,   Nconfig
    ,   Nerror
    ,   Nfile
    )
{

    var emb_installer = {

        _getSDKPath: function _getSDKPath()
        {
            var script = Nruntime.getCurrentScript();

            var bundleInstallationScript = Nsearch.create({
                type: 'bundleinstallationscript'
                ,   columns: ['scriptfile']
                ,   filters: [
                    ['scriptid', Nsearch.Operator.IS, script.id]
                ]
            }).run().getRange({start:0, end: 1});

            var scriptFileId = bundleInstallationScript[0].getValue('scriptfile')
            ,   file = Nfile.load({id: scriptFileId})
            ,   filePath = file.path;

            return filePath.replace('SCExtMechAPIBundleScript.js', 'SDK');
        }

    ,   afterInstall: function afterInstall()
        {
            var sdkPath = this._getSDKPath()
            ,   pathSS1 = sdkPath + '/SCExtMechAPI.js'
            ,   pathSS2 = sdkPath + '/SCExtMechAPISS2.js'
            ,   company_pref = Nconfig.load({
                    type: Nconfig.Type.COMPANY_PREFERENCES
                });

            company_pref.setText({fieldId: 'custscript_sc_extmech_api_path', text: pathSS1});
            company_pref.setText({fieldId: 'custscript_sc_extmech_api_path_ss2', text: pathSS2});

            company_pref.save();
        }

    ,   afterUpdate: function afterUpdate()
        {
            this.afterInstall();
        }

    ,   beforeUninstall: function beforeUninstall()
        {
            // Search for extensions
            var extensions = Nsearch.create({
                type: 'customrecord_ns_sc_extmech_extension'
            ,	columns: ['name']
            })
            .run()
            .getRange({start: 0, end: 1});

            if (extensions && extensions.length)
            {
                throw Nerror.create({
                    name: 'SCE_EXTENSION_INSTALLED'
                ,   message: 'There are extensions installed. Please uninstall them.'
                });
            }
        }
    };

    return emb_installer;
});
