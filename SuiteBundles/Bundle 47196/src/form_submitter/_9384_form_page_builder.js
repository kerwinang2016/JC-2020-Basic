/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */


if (!_9384) {
    var _9384 = {};
};

_9384.formsubmitter = _9384.formsubmitter || {};

_9384.formsubmitter.GatewayFormPageBuilder = function GatewayFormPageBuilder() {
    this.buildPage = function buildPage(gatewayId, testmode, dataObj) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.formsubmitter.GatewayFormPageBuilder.buildPage");

        // get template
        var gatewayFormPageTemplateDAO = new _9384.formsubmitter.GatewayFormPageTemplateDAO();
        var templateData = gatewayFormPageTemplateDAO.getTemplate(gatewayId);
        
        if (!templateData) {
            throw (nlapiCreateError('PGP016', 'No gateway form template'));
        }

        var templateForm = templateData.template;
        var actionUrl = testmode ? templateData.testActionUrl : templateData.liveActionUrl;
        
        var stringFormatter = new _5038.string.StringFormatter(actionUrl);
        dataObj.actionUrl = stringFormatter.replaceParameters(dataObj).toString();

        dataObj.redirectImgUrl = this.getRedirectImgUrl(); // TODO: add caching of URL per template

        stringFormatter.setString(templateForm);
        return stringFormatter.replaceParameters(dataObj).toString();
    };
    
    this.getRedirectImgUrl = function getRedirectImgUrl(){
        _5038.stacktrace.StackTrace.addLogEntry("_9384.formsubmitter.GatewayFormPageBuilder.getRedirectImgUrl");
        var url;
        try {
            // find url of redirect image
            var FILE_NAME = 'pgp_redirect.png';
            var res = nlapiSearchRecord('file', 
                                        null, 
                                        [ new nlobjSearchFilter('name', null, 'is', FILE_NAME) ],
                                        [ new nlobjSearchColumn('url') ]);
            if (!res) 
                throw "No image found";
            else if (res && res.length > 1) 
                throw "Duplicate image found";

            url = res[0].getValue('url');
        }
        catch (e){
            nlapiLogExecution("error", "GatewayFormPageBuilder.getRedirectImgUrl", "ERROR: Failed search for redirect image. " + e);
        }
        return url;
    }
};
