/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        '../Helpers/ExtensionHelperSS2'
    ,   'N/runtime'
    ,   'N/log'
    ,   'N/error'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        ExtensionHelper
    ,   runtime
    ,   log
    ,   error_module
    )
{
    var service = {

        onRequest: function(context)
        {
            var	retobj = {
                header: {
				    status: {
                        code: 'SUCCESS'
				    ,   message: 'success'
                    }
                }
            ,   result: {}
            };

            var ctx = runtime.getCurrentScript();

            try
            {
                var request = context.request;
                var request_body
                ,	req_operation
                ,	extension;

                if(request.method === 'GET')
                {
                    if(request.parameters.operation === 'get_targets')
                    {
                        retobj.result.available_targets = ExtensionHelper.getTargets();
                    }
                    else
                    {
                        var name = request.parameters.name || ''
                        ,	vendor = request.parameters.vendor || ''
                        ,	version = request.parameters.version || '';

                        retobj.result.extensions = ExtensionHelper.searchExtensions(name, vendor, version);
                    }
                }
                else if(request.method === 'POST')
                {
                    request_body = JSON.parse(request.body);
                    req_operation = request_body.operation;

                    if(req_operation && req_operation === 'create_active_extension')
				    {
                        var activation_id = request_body.activation_id
                        ,	extensions_active = request_body.extensions_active
                        ,	gov_limit = 100;

                        if(!activation_id || !extensions_active)
                        {
                            throw error_module.create({
                                name: 'SCE_EXTENSIONS_SERVICE_ERROR'
                            ,   message: 'activation_id and extensions_active data is required.'
                            });
                        }

                        var extensions_currently_active = ExtensionHelper.getExtensionsActive(activation_id) || [];

                        var ext
                        ,	i;

                        for(i = 0; i < extensions_active.length; i++)
                        {
                            if(ctx.getRemainingUsage() < gov_limit)
                            {
                                retobj.result.call_again = 1;
                                break;
                            }

                            extension = extensions_active[i];

                            /*jshint -W083*/
                            ext = _.find(extensions_currently_active, function(currently_active)
                            {
                                return extension.id === currently_active.extension_id;
                            });
                            /*jshint +W083*/

                            if(ext)
                            {
                                if(extension.priority && extension.priority !== ext.priority)
                                {
                                    ExtensionHelper.updateExtensionsActivePriority(ext.id, extension);
                                }
                            }
                            else
                            {
                                ExtensionHelper.createExtensionsActive(activation_id, extension);
                            }
                        }

                        if(!retobj.result.call_again)
                        {
                            for(i = 0; i < extensions_currently_active.length; i++)
                            {
                                if(ctx.getRemainingUsage() < gov_limit)
                                {
                                    retobj.result.call_again = 1;
                                    break;
                                }

                                extension = extensions_currently_active[i];

                                /*jshint -W083*/
                                ext = _.find(extensions_active, function(extension_active)
                                {
                                    return extension_active.id === extension.extension_id;
                                });
                                /*jshint +W083*/

                                if(!ext)
                                {
                                    ExtensionHelper.deleteExtensionActive(extension.id);
                                }
                            }
                        }
                    }
                    else if(req_operation && req_operation === 'create_extension')
                    {
                        extension = request_body.extension;
                        if(!extension)
                        {
                            throw error_module.create({
                                name: 'SCE_EXTENSIONS_SERVICE_ERROR'
                            ,   message: 'extension data is required.'
                            });
                        }

                        if(!extension.name || !extension.version || !extension.vendor ||
						!extension.type || !extension.targets || !extension.manifest_id)
                        {
                            throw error_module.create({
                                name: 'SCE_EXTENSIONS_SERVICE_ERROR'
                            ,   message: 'Extension name, vendor, version, type, targets and manifest_id are required fields. Received: ' + JSON.stringify(extension)
                            });
                        }

                        retobj.result.extension_id = ExtensionHelper.createExtension(extension);
                    }
                    else
                    {
                        throw error_module.create({
                            name: 'SCE_EXTENSIONS_SERVICE_ERROR'
                        ,   message: 'Invalid extension operation'
                        });
                    }
                }
                else if(request.method === 'PUT')
                {
                    request_body = JSON.parse(request.body);
                    req_operation = request_body.operation;

                    extension = request_body.extension;

                    if(!extension || !extension.extension_id)
                    {
                        throw error_module.create({
                            name: 'SCE_EXTENSIONS_SERVICE_ERROR'
                        ,   message: 'extension data and extension id are required. Received: extension id ' + extension.extension_id + ', extension ' + JSON.stringify(extension)
                        });
                    }

                    if(req_operation && req_operation === 'update_extension')
                    {
                        retobj.result.extension_id = ExtensionHelper.updateExtension(extension);
                    }
                    else
                    {
                        throw error_module.create({
                            name: 'SCE_EXTENSIONS_SERVICE_ERROR'
                        ,   message: 'Invalid extension operation'
                        });
                    }
                }
            }
            catch(error)
            {
                log.error({
                    title: 'SCE_EXTENSIONS_SERVICE_ERROR'
                ,   details: error
                });

                retobj.header.status.code = error.name;
                retobj.header.status.message = error.message;
            }

            retobj.governance = ctx.getRemainingUsage();

            // rest services
            if(!context.response)
            {
                return retobj;
            }

            context.response.setHeader({name: 'Content-Type', value: 'application/json'});
            context.response.write({output: JSON.stringify(retobj)});
        }

    };

    return service;
});
