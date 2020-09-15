/**
 *@NApiVersion 2.x
 */
define(
	[
	    'N/runtime'
    ,   '../ExtensionMechanism.Server/Services/FileApiSS2'
    ,   '../third_parties/semver.js'
    ,   '../third_parties/underscore.js'
	]
,	function (
        runtime
    ,   FileApi
	)
{
    var utils = {

        /*emb_suiteapp_id: 'com.netsuite.extensionmanager'*/

        getEMBFolderId: function getEMBFolderId()
        {
            var folder_id = this.getBundleFolderId();

            //in the case that SCEM was deployed
            if(!folder_id)
            {
                folder_id = -15;
                folder_id = FileApi.searchFolder('extension-mechanism', folder_id);
            }

            return folder_id;
        }

    ,   getBundleFolderId: function getBundleFolderId()
        {
            var script = runtime.getCurrentScript()
                ,   bundle_id = script.bundleIds.length && script.bundleIds[0]
                ,   folder_id = bundle_id ? FileApi.searchFolder('Bundle ' + bundle_id, '-16') : null;

            return folder_id;
        }

    ,   getEMBFolderPath: function getEMBFolderPath()
        {
            var bundleFolder = this.getEMBFolderId();
            return this.getBundleFolderPath(bundleFolder);
        }

    ,   getBundleFolderPath: function getBundleFolderPath(folderId)
        {
            var bundleFolder = FileApi.getFolder(folderId, ['parent']);

            return '/' + bundleFolder.parent[0].text + '/' + bundleFolder.name;
        }

        //Returns true if version_2 is greater than version_1
    ,   compareSemverVersions: function compareSemverVersions(version_1, version_2)
        {
            return SemVer.gt(_.unescape(version_2), _.unescape(version_1));
        }

    ,   satisfiesSemver: function satisfiesSemver(version, range)
        {
            return SemVer.satisfies(_.unescape(version), _.unescape(range));
        }

    ,   validSemver: function validSemver(version)
        {
            return SemVer.valid(_.unescape(version));
        }

    ,   validSemverRange: function validSemverRange(range)
        {
            return SemVer.validRange(_.unescape(range));
        }

    };

    return utils;
});
