/**
 * @NApiVersion 2.x
 * @NScriptType platformextensionplugin
 */
define(
    [
        'N/log'
    ,   '../Helpers/PluginImplementationHelper'
    ,   '../Helpers/ExtensionHelperSS2'
    ,   'N/file'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        log
    ,   PluginImplementationHelper
    ,   ExtensionHelper
    ,   File
    )
{
    return {

        getMetadata : function(context)
        {
            var metadata = {
                objectType : 'commercetheme'
            ,   lockable : 'T'
            };
            context.output.metadata = metadata;
        },

        validate : function(context)
        {
            PluginImplementationHelper.logDatetime('starting ', 'validate');

            try
            {
                var sdf_object = context.input.object;

                PluginImplementationHelper.commonValidations(sdf_object, context.input.project.type);

                var resourcesWithEntryPoints = ['sass'];
                _.each(resourcesWithEntryPoints, function(resource)
                {
                    PluginImplementationHelper.validateEntryPoints(sdf_object, resource, context.input.project.files);
                });

                var resoucesWithApplication = ['templates'];
                _.each(resoucesWithApplication, function(resource)
                {
                    PluginImplementationHelper.validateApplication(sdf_object, resource);
                });

                var resources = _.union(resourcesWithEntryPoints, resoucesWithApplication, ['assets']);
                _.each(resources, function(resource)
                {
                    PluginImplementationHelper.validateFilesObject(sdf_object, resource, context.input.project.files);
                });

                PluginImplementationHelper.validateOverrides(sdf_object);
                PluginImplementationHelper.validateSkins(sdf_object, context.input.project.files);

                context.output.warnings = sdf_object.warnings || [];
            }
            catch(error)
            {
                log.error({title:'VALIDATE ERROR', details: error.stack});
                context.output.errors = [error.message];
            }

            PluginImplementationHelper.logDatetime('finishing ', 'validate');
        },

        create : function(context)
        {
            PluginImplementationHelper.logDatetime('starting ', 'create');

            try
            {
                var sdf_object = context.input.object;
                var manifest = PluginImplementationHelper.createManifest(sdf_object);

                if(context.input.deployment.mode === PluginImplementationHelper.DEVELOPMENT_MODE)
                {
                    var supported_targets_ids = PluginImplementationHelper.getSupportedTargetsIds(manifest.target);

                    var extension = {
                        name: sdf_object.name
                    ,   fantasy_name: sdf_object.fantasyname
                    ,   type: sdf_object.type
                    ,   targets: supported_targets_ids
                    ,   target_version: sdf_object.target_version
                    ,   version: sdf_object.version
                    ,	vendor: sdf_object.vendor
                    ,   manifest_id: manifest.id
                    ,   scriptid: manifest.scriptid
                    };

                    var theme_id = ExtensionHelper.createExtension(extension);

                    PluginImplementationHelper.createSkins(sdf_object.skins, theme_id);
                }
                else if(context.input.deployment.mode === PluginImplementationHelper.PRODUCTION_MODE)
                {
                    PluginImplementationHelper.validateVersion(sdf_object);
                    PluginImplementationHelper.createRecordToProcess(manifest, manifest.id, context.input.project.appId);
                }
            }
            catch(error)
            {
                log.error({title:'CREATE ERROR', details: error.stack});
                context.output.errors = [error.message];
            }

            PluginImplementationHelper.logDatetime('finishing ', 'create');
        },

        update : function(context)
        {
            PluginImplementationHelper.logDatetime('starting ', 'update');

            try
            {
                var sdf_object = context.input.object;
                var manifest = PluginImplementationHelper.createManifest(sdf_object);

                if(context.input.deployment.mode === PluginImplementationHelper.DEVELOPMENT_MODE)
                {
                    var extension_targets_id = PluginImplementationHelper.getSupportedTargetsIds(sdf_object.target);
                    var extension = {
                        name: sdf_object.name
                    ,   fantasy_name: sdf_object.fantasyname
                    ,   targets: extension_targets_id
                    ,   target_version: sdf_object.target_version
                    ,   version: sdf_object.version
                    ,   vendor: sdf_object.vendor
                    ,   manifest_id: manifest.id
                    ,   scriptid: manifest.scriptid
                    };

                    var theme_id = PluginImplementationHelper.updateExtensionRecord(extension);
                    PluginImplementationHelper.updateSkins(sdf_object.skins, theme_id);
                }
                else if(context.input.deployment.mode === PluginImplementationHelper.PRODUCTION_MODE)
                {
                    PluginImplementationHelper.validateVersion(sdf_object);
                    PluginImplementationHelper.createRecordToProcess(manifest, manifest.id, context.input.project.appId);
                }
            }
            catch(error)
            {
                log.error({title:'UPDATE ERROR', details: error.stack});
                context.output.errors = [error.message];
            }

            PluginImplementationHelper.logDatetime('finishing ', 'update');
        },

        validateDelete : function(context)
        {
            PluginImplementationHelper.logDatetime('starting ', 'validateDelete');

            try
            {
                var sdf_object = context.input.object;
                PluginImplementationHelper.validateDelete(sdf_object);
            }
            catch(error)
            {
                log.error({title:'VALIDATE DELETE ERROR', details: error.stack});
                context.output.errors = [error.message];
            }

            PluginImplementationHelper.logDatetime('finishing ', 'validateDelete');
        },

        'delete' : function(context)
        {
            PluginImplementationHelper.logDatetime('starting ', 'delete');

            try
            {
                var sdf_object = context.input.object;
                PluginImplementationHelper.deleteExtensions(sdf_object);
            }
            catch(error)
            {
                log.error({title:'DELETE ERROR', details: error.stack});
                context.output.errors = [error.message];
            }

            PluginImplementationHelper.logDatetime('finishing ', 'delete');
        },

        serialize : function(context)
        {
            PluginImplementationHelper.logDatetime('starting ', 'serialize');

            try
            {
                var sdf_object = context.input.object;
                var manifest_id = PluginImplementationHelper.getManifestIdByScriptId(sdf_object.scriptid);
                var manifest = File.load({id : manifest_id});
                var basepath = PluginImplementationHelper.getBasepath(manifest);
                var manifest_json = JSON.parse(manifest.getContents());
                var manifest_sdf_format = PluginImplementationHelper.convertManifestToSDFFormat(manifest_json, basepath);

                context.output.object = manifest_sdf_format;
            }
            catch(error)
            {
                log.error({title:'SERIALIZE ERROR', details: error.stack});
                context.output.errors = [error.message];
            }

            PluginImplementationHelper.logDatetime('finishing ', 'serialize');
        }
    };
});
