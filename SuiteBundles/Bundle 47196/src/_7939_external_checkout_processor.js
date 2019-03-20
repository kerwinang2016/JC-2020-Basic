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

_7939.processor.AbstractExternalCheckoutProcessor = function AbstractExternalCheckoutProcessor(input, output, paymentOperationType) {
    var redirectUrl;
    var returnUrl;
    var redirectData;
    var postBackUrl;
    var postBackData;
    
    // getters
    
    this.getRedirectUrl = function getRedirectUrl() {
        _5038.stacktrace.StackTrace
                .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.getRedirectUrl");
     
            return this.redirectUrl;
    };
    
    this.getReturnUrl = function getReturnUrl() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.getReturnUrl");
        
        return this.returnUrl;
    };
    
    this.getPostBackUrl = function getReturnUrl() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.getReturnUrl");
        
        return this.postBackUrl;
    };
    
    this.getRedirectData = function getRedirectData() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.setCredentials.getRedirectData");
        
        return this.redirectData;
    };
    
    this.getRedirectData = function getRedirectData() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.setCredentials.getRedirectData");
        
        return this.redirectData;
    };
    
    // wrappers
    
    this.getDataFromRedirect = function getDataFromRedirect() {
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.getDataFromRedirect");
        
        var dataFromRedirect =  this.getRedirectDetails().getDataFromRedirect();
        return dataFromRedirect;
    };
    
    this.getDataFromPostBack = function getDataFromPostBack() {
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.getDataFromPostBack");
        
        var dataFromPostBack =  this.getRedirectDetails().getDataFromPostBack();
        return dataFromPostBack;
    };
    
    this.getRedirectDetails = function getRedirectDetails() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.getRedirectDetails");
        
        var tranDetails = input.getTransactionDetails();
        var redirectDetails = tranDetails.getRedirectDetails();
        return redirectDetails;
    };
    

    // core functions
    
    this.processReturnUrl = function processReturnUrl() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.processReturnUrl");

        var url =  this.getRedirectDetails().getReturnUrl();

        if(!url) {
            throw nlapiCreateError("PGP011", "Return URL for external checkout is not set");
        }

        this.returnUrl = url;
        
        return url;
    };
    
    this.processPostBackUrl = function processPostBackUrl(timeout) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.processReturnUrl");

        var url =  this.getRedirectDetails().getPostBackUrl(timeout);

        if(!url) {
            throw nlapiCreateError("PGP017", "PostBack URL for external checkout is not set");
        }

        this.postBackUrl = url;

        return url;
    };
    
    this.redirect = function redirect() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.redirect");
        
        if (!this.getRedirectUrl()) {
            throw nlapiCreateError("PGP010", "Redirect URL for external checkout is not set.");
        }
        
        var result = output.getResult();
        result.setRequestedRedirectData(this.getRedirectUrl());
    };
    
    // abstract methods
    
    this.processRedirectUrl = function processRedirectUrl() {
        
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.processRedirectUrl");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractExternalCheckoutProcessor.");
    };
    
    this.processPostBackData = function processRedirectUrl() {
        
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.processPostBackData");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractExternalCheckoutProcessor.");
    };
    
    this.processRedirectData = function processRedirectData() {
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.processRedirectData");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractExternalCheckoutProcessor.");
    };
    
    this.validatePostback = function validatePostback() {
        _5038.stacktrace.StackTrace
        .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.validatePostback");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractExternalCheckoutProcessor.");
    };
    
    this.execute = function execute() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.AbstractExternalCheckoutProcessor.execute");
        
        this.redirectData = this.getDataFromRedirect();
        this.postBackData = this.getDataFromPostBack();
        
        if(this.redirectData) {
            this.processRedirectData();
        }else if(this.postBackData) {
            this.processPostBackData();
        } else { //before redirect
            if (!input.getTransactionDetails().isECommerceTransaction() ) {
                throw nlapiCreateError("PGP009", "Unable to process transaction. The payment method you selected is available for webstore orders only. Select a credit card payment method and try again.");
            }
            this.processReturnUrl();
            this.processRedirectUrl();
            this.redirect();
        }
        return this;
    };

    return this;
};

_7939.processor.BaseExternalCheckoutProcessor = function BaseExternalCheckoutProcessor(input, output, paymentOperationType) {
    var obj = new _7939.processor.AbstractExternalCheckoutProcessor(input, output, paymentOperationType);

    function getResponseUrls(postBackTimeout) {
        var urlData = {};
        urlData['returnUrl'] = obj.getReturnUrl();
        urlData['postBackUrl'] = obj.processPostBackUrl(postBackTimeout);

        return urlData;
    }

    obj.processRedirectUrl = function processRedirectUrl(){
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.BaseExternalCheckoutProcessor.processRedirectUrl");
        
        var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
        var gatewayConfiguration = gatewayDataAccessObject
            .RetrievePaymentGatewayConfiguration();
        
        var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);

        var dataAccessObject = classLoader.createTransactionDataAccessObject(input, gatewayConfiguration);
        var formRequestBuilder = classLoader.createFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, null);

        var postBackTimeout = gatewayConfiguration.GetPostBackTimeout();
        var returnUrls = getResponseUrls(postBackTimeout);

        // redirect to payment form page
        obj.redirectUrl = formRequestBuilder.getFormUrl(input, output, returnUrls);

        return obj.redirectUrl;
    };

    obj.processRedirectData = function processRedirectData() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.BaseExternalCheckoutProcessor.processRedirectData");

        obj.redirectData = obj.getDataFromRedirect();

        if(obj.redirectData){
            var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
            var gatewayConfiguration = gatewayDataAccessObject.RetrievePaymentGatewayConfiguration();

            var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);

            var dataAccessObject = classLoader.createTransactionDataAccessObject(input, gatewayConfiguration);
            var parser = new _5038.parser.URLStringParser();
            var responseBuilder = classLoader.createResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);

            var response = responseBuilder.buildResponseFromRedirectData(input, obj.redirectData);

            var responseHandler = new _5038.responsehandler.ResponseHandler();
            responseHandler.handleResponse(response, output.getResult());
        }

    };

    obj.processPostBackData = function processPostBackData() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.BaseExternalCheckoutProcessor.processPostBackData");

        obj.postBackData = obj.getDataFromPostBack();

        if (obj.postBackData){
            var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
            var gatewayConfiguration = gatewayDataAccessObject.RetrievePaymentGatewayConfiguration();

            var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);

            var dataAccessObject = classLoader.createTransactionDataAccessObject(input, gatewayConfiguration);
            var parser = classLoader.createParser();
            var responseBuilder = classLoader.createResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);

            var response = responseBuilder.buildResponseFromPostData(input, obj.postBackData);

            var responseHandler = new _5038.responsehandler.ResponseHandler();
            responseHandler.handleResponse(response, output.getResult());
        }

    };

    // TODO - Add validation for secureHash
    obj.validatePostBack = function validatePostBack(input, output){
        _5038.stacktrace.StackTrace
            .addLogEntry("_7939.processor.BaseExternalCheckoutProcessor.validatePostBack");

        var body = input.getBody();

        output.setStatus('ACCEPT');
        output.setUpdateData(body);
        output.getResponse().write('OKAY');
    };

    return obj;
};
