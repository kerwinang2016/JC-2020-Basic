/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
    [
        '../../CommonUtilities/ErrorHandler'

    ,   '../Services/WebsiteServiceSS2'
    ,   '../Services/FileServiceSS2'
    ,   '../Services/SkinServiceSS2'
    ,   '../Services/ExtensionServiceSS2'
    ,   '../SMTEndPoints/EMBEndpoints'
    ,   '../SMTEndPoints/SassCompiler'
    ,   '../SMTEndPoints/SMTSassCompiler'
    ,   '../SMTEndPoints/UserSkinsService'
    ,   '../Assistant/AssistantSS2.Step0'
    ,   '../Assistant/AssistantSS2.Step1'
    ,   '../Assistant/AssistantSS2.Step2'
    ,   'N/error'
    ,   'N/runtime'
    ,   'N/log'
    ]
,   function(
        error_handler

    ,   WebsiteService
    ,   FileService
    ,   SkinService
    ,   ExtensionService
    ,   EMBEndpoints
    ,   SassCompiler
    ,   SMTSassCompiler
    ,   UserSkinsService
    ,   AssistantSS2Step0
    ,   AssistantSS2Step1
    ,   AssistantSS2Step2

    ,   error_module
    ,   runtime
    ,   log
    )
{
	var request_handler = {

        services: {
            'WEBSITE_SERVICE': WebsiteService
        ,   'FILE_SERVICE': FileService
        ,   'SKIN_SERVICE': SkinService
        ,   'EXTENSION_SERVICE': ExtensionService
        ,   'EMB_ENDPOINTS': EMBEndpoints
        ,   'SASS_COMPILER': SassCompiler
        ,   'SMT_SASS_COMPILER': SMTSassCompiler
        ,   'USER_SKINS_SERVICE': UserSkinsService
        ,   'STEP_0': AssistantSS2Step0
        ,   'STEP_1': AssistantSS2Step1
        ,   'STEP_2': AssistantSS2Step2
        }

    ,   onRequest: function onRequest(context)
        {
            try
            {
                var script = runtime.getCurrentScript()
                ,   service_name = context.request.parameters.service_name || script.getParameter({name: 'custscript_service_name'});

                if(!service_name)
                {
                    throw error_module.create({
                        name: 'SERVICE_ERROR'
                    ,	message: 'Service name is required'
                    });
                }

                var service = this.services[service_name];
                if(!service)
                {
                    throw error_module.create({
                        name: 'SERVICE_ERROR'
                    ,	message: 'Service ' + service_name + ' not found'
                    });
                }

                var result = service.onRequest(context);
                return result;
            }
            catch(error)
            {
                log.error({
                    title: 'SERVICES ENTRYPOINT ERROR'
                 ,  details: error.stack
                });
                var response = error_handler.handleError(error);
                context.response.write(JSON.stringify(response));
            }
        }

	};

	return request_handler;
});
