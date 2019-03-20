/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */


if (!_9384) {
    var _9384 = {};
}

if (!_9384.formrequestbuilder) {
    _9384.formrequestbuilder = {};
}

_9384.formrequestbuilder.AbstractFormRequestBuilder = function AbstractFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    this.getFormParameters = function getFormParameters(input, responseUrls) {
        _5038.stacktrace.StackTrace
                .addLogEntry("_9384.formrequestbuilder.AbstractFormRequestBuilder.getFormParameters");

        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractFormRequestBuilder.");
    };

    return this;
};

_9384.formrequestbuilder.BaseFormRequestBuilder = function BaseFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    var obj = new _9384.formrequestbuilder.AbstractFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);

    function getFormPageParamObj(paymentFormData) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.formrequestbuilder.BaseFormRequestBuilder.getFormPageParamObj");

        var gatewayConfigurationObj = gatewayConfiguration.GetAsObject();

        var paymentFormPageParamObj = {
            gatewayId: gatewayConfigurationObj.internalId,
            paymentFormData: paymentFormData,
            testMode: gatewayConfigurationObj.isTestMode
        };

        return paymentFormPageParamObj;
    }
    
    function getFormRedirectUrl(param) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.formrequestbuilder.BaseFormRequestBuilder.getFormRedirectUrl");

        var suiteletUrl = nlapiResolveURL('SUITELET', _CCP.FORM_SUBMITTER_SCRIPT_ID, _CCP.FORM_SUBMITTER_DEPLOYMENT, true); // externalURL
        suiteletUrl = suiteletUrl + '&param=' + param;

        return suiteletUrl;
    }

    obj.getFormUrl = function getFormUrl(input, output, responseUrls) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.formrequestbuilder.BaseFormRequestBuilder.getFormUrl");

        var formParams = obj.getFormParameters(input, responseUrls);

        // save parameters sent in form in payment event
        var result = output.getResult();
        result.setRequest(JSON.stringify(formParams));
        nlapiLogExecution('AUDIT', 'Form Request Parameters', JSON.stringify(formParams));

        var formPageParamObj = getFormPageParamObj(formParams);
        var formPageParam = JSON.stringify(formPageParamObj);

        var encoder = _9384.encoder.Base64URL();
        var encodedUrlParams = encoder.encode(formPageParam);

        return getFormRedirectUrl(encodedUrlParams);
    };

    obj.generateSignature = function generateSignature(signatureTemplate, signatureParams) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.formrequestbuilder.BaseFormRequestBuilder.generateSignature");

        var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);
        var hashGenerator = classLoader.createHashGenerator();

        var signatureGenerator = new _7352.signaturegenerator.SignatureGenerator(hashGenerator);
        return signatureGenerator.generateSignature(signatureTemplate, signatureParams);
    };

    return obj;
};
