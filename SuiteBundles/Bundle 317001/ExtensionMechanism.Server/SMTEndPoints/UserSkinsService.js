/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        '../Helpers/SkinHelperSS2'
    ,   '../../CommonUtilities/CommonHelper'
    ]
,   function (
        skins_helper
    ,   common_helper
    )
{

    var service = {

        onRequest: function(context)
        {
            try
            {
                var request = context.request;

                common_helper.validateRequestOrigin(request);

                if(request.method !== 'GET')
                {
                    common_helper.throwError('SCE_USER_SKINS_SERVICE_ERROR', 'Invalid HTTP Method ' + request.method);
                }

                var skin_id
                ,   skin_name
                ,   skin_values
                ,   domain
                ,   result = {};

                switch (request.parameters.operation)
                {
                    case 'create':
                        domain = request.parameters.domain;
                        skin_name = request.parameters.name;
                        skin_values = request.parameters.values;
                        result.skin_id = skins_helper.createUserSkin(domain, skin_name, skin_values);
                    break;
                    case 'edit':
                        skin_id = request.parameters.id;
                        skin_name = request.parameters.name;
                        skin_values = request.parameters.values;
                        skins_helper.updateUserSkin(skin_id, skin_name, skin_values);
                    break;
                    case 'get':
                        skin_id = request.parameters.id;
                        domain = request.parameters.domain;
                        result = skins_helper.searchUserSkins(domain, skin_id);
                    break;
                    case 'delete':
                        skin_id = request.parameters.id;
                        skins_helper.deleteUserSkin(skin_id);
                    break;
                    default:
                        common_helper.throwError('SCE_USER_SKINS_SERVICE_ERROR', 'Invalid operation');
                }

                common_helper.buildResponse(context, {result: result});
            }
            catch(error)
            {
                common_helper.buildErrorResponse(context, error);
            }
        }
    };

    return service;
});
