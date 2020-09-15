/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(
    [
        '../../CommonUtilities/ErrorHandler'

    ,   '../Services/WebsiteServiceSS2'
    ,   '../Services/FileServiceSS2'
    ,   '../Services/SkinServiceSS2'
    ,   '../Services/ExtensionServiceSS2'

    ,   'N/runtime'
    ,   'N/error'
    ]
,   function(
        error_handler

    ,   WebsiteServiceSS2
    ,   FileServiceSS2
    ,   SkinServiceSS2
    ,   ExtensionServiceSS2

    ,   runtime
    ,   error_module
    )
{
    var restlet = {

        services: {
            'WEBSITE_SERVICE': WebsiteServiceSS2
        ,   'FILE_SERVICE': FileServiceSS2
        ,   'SKIN_SERVICE': SkinServiceSS2
        ,   'EXTENSION_SERVICE': ExtensionServiceSS2
        }

    ,   _instanceService: function(service_name)
        {
            if(!service_name)
            {
                throw error_module.create({
                    name: 'RESTLET_ERROR'
                ,	message: 'Service name is required'
                });
            }

            var service = this.services[service_name];
            if(!service)
            {
                throw error_module.create({
                    name: 'RESTLET_ERROR'
                ,	message: 'Service ' + service_name + ' not found'
                });
            }

            return service;
        }

    ,   _genericCall: function(service_name, params)
        {
            try
            {
                var context = {
                        request: params
                    }
                ,   instance = this._instanceService(service_name);

                return instance.onRequest(context);
            }
            catch(error)
            {
                return error_handler.handleError(error);
            }
        }

    ,   get: function(params)
        {
            var service_name = params.service_name;

            return this._genericCall(service_name, {
                method: 'GET'
            ,   parameters: params
            });
        }

    ,   post: function(params)
        {
            var service_name = JSON.parse(params).service_name;

            return this._genericCall(service_name, {
                method: 'POST'
            ,   body: params
            });
        }

    ,   put: function(params)
        {
            var service_name = JSON.parse(params).service_name;

            return this._genericCall(service_name, {
                method: 'PUT'
            ,   body: params
            });
        }

    ,   delete: function(params)
        {
            var service_name = params.service_name;

            return this._genericCall(service_name, {
                method: 'DELETE'
            ,   parameters: params
            });
        }

    };

    return restlet;
});
