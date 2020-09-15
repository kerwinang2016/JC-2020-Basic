/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        '../Helpers/SkinHelperSS2'
    ,   'N/runtime'
    ,   'N/log'
    ,   'N/error'
    ]
,   function(
        SkinHelper
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
                        code: 'SUCCESS',
                        message: 'success'
                    }
                },
                result: {}
            };

            try
            {
                var request = context.request;

                var request_body
                ,	req_operation
                ,	skin;

                if(request.method === 'GET')
                {
                    if(request.parameters.operation === 'search_skin')
                    {
                        var theme = request.parameters.theme || ''
                        ,	name = request.parameters.name || '';

                        retobj.result.skins = SkinHelper.searchSkins(name, theme);
                    }
                    //hack there was no way to return data on a DELETE operation
                    else if(request.parameters.operation === 'delete_skin')
                    {
                        var skin_id = request.parameters.skin_id;

                        if(!skin_id)
                        {
                            throw error_module.create({
                                name: 'SCE_SKIN_SERVICE_ERROR'
                            ,   message: 'skin_id is a required parameter. Received: ' + skin_id
                            });
                        }

                        SkinHelper.deleteSkin(skin_id);
                        retobj.result.delete_result = skin_id;
                    }
                }
                else if(request.method === 'POST')
                {
                    request_body = JSON.parse(request.body);
                    req_operation = request_body.operation;

                    skin = request_body.skin;

                    if(!skin)
                    {
                        throw error_module.create({
                            name: 'SCE_SKIN_SERVICE_ERROR'
                        ,   message: 'Error creating skin preset: No skin data provided in POST method.'
                        });
                    }

                    if(req_operation && req_operation === 'create_skin')
                    {
                        if(!skin.name || !skin.file || !skin.theme)
                        {
                            throw error_module.create({
                                name: 'SCE_SKIN_SERVICE_ERROR'
                            ,   message: 'Error creating skin preset: name, file and theme are required fields. Received: ' + JSON.stringify(skin)
                            });
                        }

                        retobj.result.skin_id = SkinHelper.createSkin(skin);
                    }
                    else
				    {
                        throw error_module.create({
                            name: 'SCE_SKIN_SERVICE_ERROR'
                        ,   message: 'Invalid operation field sent.'
                        });
				    }

                }
                else if(request.method === 'PUT')
                {
                    request_body = JSON.parse(request.body);
				    req_operation = request_body.operation;

				    skin = request_body.skin;

                    if(!skin || !skin.skin_id)
                    {
                        throw error_module.create({
                            name: 'SCE_SKIN_SERVICE_ERROR'
                        ,   message: 'Skin data and skin.skin_id are required fields. Received: ' + JSON.stringify(skin)
                        });
                    }

                    if(req_operation && req_operation === 'update_skin')
                    {
                        retobj.result.skin_id = SkinHelper.updateSkin(skin);
                    }
                    else
                    {
                        throw error_module.create({
                            name: 'SCE_SKIN_SERVICE_ERROR'
                        ,   message: 'Invalid operation field sent.'
                        });
                    }
                }

            }
            catch(error)
            {
                log.error({
                    title: 'SCE_SKIN_SERVICE_ERROR'
                ,   details: error
                });

                retobj.header.status.code = error.name;
                retobj.header.status.message = error.message;
            }

            var script = runtime.getCurrentScript();
            retobj.governance = script.getRemainingUsage();

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
