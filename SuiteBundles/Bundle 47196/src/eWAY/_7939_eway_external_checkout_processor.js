/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 */

if (!_7939) {
    var _7939 = {};
}

if (!_7939.processor) {
	_7939.processor = {};
}

_7939.processor.EWAYExternalCheckoutProcessor = function EWAYExternalCheckoutProcessor(input, output, paymentOperationType) {
    _5038.stacktrace.StackTrace
    	.addLogEntry("_7939.processor.EWAYExternalCheckoutProcessor");
    
	var obj = _7939.processor
    	.AbstractExternalCheckoutProcessor(input, output);
    
    obj.processRedirectUrl = function processRedirectUrl(){
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.EWAYExternalCheckoutProcessor.processRedirectUrl");
        
    	var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
        var gatewayConfiguration = gatewayDataAccessObject
            .RetrievePaymentGatewayConfiguration();
        
        var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);

        // instantiate classes in configuration
        var dataAccessObject = classLoader.createTransactionDataAccessObject(input, gatewayConfiguration);
        var credentials = classLoader.loadCredentials(input, gatewayConfiguration.GetAsObject());
        var requestBuilder = classLoader.createRequestBuilder( dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
        var parser = classLoader.createParser();
        var responseBuilder = classLoader.createResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
        
        var requestParameters = requestBuilder.getDefaultParameters();
        requestParameters = requestBuilder.addParameter('REDIRECT_URL', obj.getReturnUrl() , requestParameters);
        
        // request eway the shared page url
        var urlFetchOperation = (paymentOperationType == _CCP.GATEWAY_OPERATION_AUTHORIZATION) ? _CCP.GATEWAY_OPERATION_AUTH_CHKOUT_URLFETCH : _CCP.GATEWAY_OPERATION_PAYMENT_CHKOUT_URLFETCH;
        var operationProcessor = new _7939.processor.OperationProcessor(output);
        var responseFromGetUrl = operationProcessor.executeOperation( urlFetchOperation , gatewayConfiguration, gatewayDataAccessObject, dataAccessObject, requestBuilder, responseBuilder, requestParameters );
        var parsedResponse = responseFromGetUrl.getParsedResponse();

        nlapiLogExecution("DEBUG", "Response in getting redirect url.", JSON.stringify(parsedResponse));
    	
        var fetchedUrl = parsedResponse.SharedPaymentUrl;
        obj.redirectUrl = fetchedUrl;
    	
    	return fetchedUrl;
    };
    
    obj.processRedirectData = function processRedirectData() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.EWAYExternalCheckoutProcessor.processRedirectData");

        var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
        var gatewayConfiguration = gatewayDataAccessObject.RetrievePaymentGatewayConfiguration();
        
        var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);
        
        // instantiate classes in configuration
        var dataAccessObject = classLoader.createTransactionDataAccessObject(input, gatewayConfiguration);
        var credentials = classLoader.loadCredentials(input, gatewayConfiguration.GetAsObject());
        var requestBuilder = classLoader.createRequestBuilder( dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
        var parser = classLoader.createParser();
        var responseBuilder = classLoader.createResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
        
        // parse redirect data, get access code
        var urlParser = new _5038.parser.URLStringParser();
        obj.redirectData = obj.getDataFromRedirect();
        var parsedRedirectData = urlParser.parse(obj.redirectData);
        var accessCode = parsedRedirectData.AccessCode;
        
        var requestParameters = requestBuilder.getDefaultParameters();
        requestParameters = requestBuilder.addParameter('AccessCode', accessCode , requestParameters);
    	
        // request result using accesscode
        var resultFetchOperation = (paymentOperationType == _CCP.GATEWAY_OPERATION_AUTHORIZATION) ? _CCP.GATEWAY_OPERATION_AUTH_CHKOUT_RESULTFETCH : _CCP.GATEWAY_OPERATION_PAYMENT_CHKOUT_RESULTFETCH;
        var operationProcessor = new _7939.processor.OperationProcessor(output);
        var response = operationProcessor.executeOperation( resultFetchOperation, gatewayConfiguration, gatewayDataAccessObject, dataAccessObject, requestBuilder, responseBuilder, requestParameters );
        
        var responseHandler = new _5038.responsehandler.ResponseHandler();
        responseHandler.handleResponse(response, output.getResult());
    };
    
    return obj;
};
