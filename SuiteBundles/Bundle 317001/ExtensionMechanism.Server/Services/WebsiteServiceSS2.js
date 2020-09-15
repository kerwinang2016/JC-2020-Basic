/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        './WebsiteApiSS2'
    ,   'N/runtime'
    ,   'N/error'
    ,   'N/log'
    ]
,   function(
        WebsiteApi
    ,   runtime
    ,   error_module
    ,   log
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
            
            //TODO migrate utils
            //request = Utils.requestToNLApiRequest(request);

            try{
                var request = context.request;
                
                if(request.method === 'GET')
                {
                    var website_id = request.parameters.website_id
                    ,   subsidiary_id = request.parameters.subsidiary_id;

                    if(website_id)
                    {
                       retobj.result = WebsiteApi.getWebsite(website_id);
                    }
                    else if(subsidiary_id)
                    {
                       retobj.result = WebsiteApi.getSubsidiaryLocations(subsidiary_id);
                    }
                    else
                    {
                        retobj.result = WebsiteApi.getWebsites();
                    }
                }
            }
            catch(error)
            {
                log.error({
                    title: 'SCE_WEBSITE_SERVICE_ERROR'
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