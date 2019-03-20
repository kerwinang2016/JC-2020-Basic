/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}

if (!_5038.requestbuilder) {
    _5038.requestbuilder = {};
}
_5038.requestbuilder.AbstractRequestBuilder = function AbstractRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    
	this.getDefaultParameters = function getDefaultParameters(dataAccessObject, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.getDefaultParameters");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.addTransactionParameters = function addTransactionParameters(dataAccessObject, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.addTransactionParameters");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.addCredentialParameters = function addCredentialParameters(gatewayConfiguration, credentials, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.addCredentialParameters");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.compileParameters");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };

    this.addParameter = function addParameter(key, value, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.addParameter");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.replaceParameters = function replaceParameters(string, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.replaceParameters");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.processURL = function processURL(url) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.processURL");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.processPost = function processPost(post) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.processPost");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    this.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.processHeader");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };

    this.addRequestVariables = function addRequestVariables(request, parameters, urlTemplate, postTemplate, headerTemplate) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.addRequestVariables");
    };
    
    this.buildRequest = function buildRequest(parameters, urlTemplate, postTemplate, headerTemplate, operationType) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.buildRequest");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractRequestBuilder");
    };
    
    return this;
};


_5038.requestbuilder.BaseRequestBuilder = function BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    var obj = new _5038.requestbuilder.AbstractRequestBuilder();
    
    obj.getDefaultParameters = function getDefaultParameters() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.getDefaultParameters");
        
        var parameters = {};
        
        parameters = obj
        	.addTransactionParameters(dataAccessObject, parameters);
        parameters = obj
            .compileParameters(dataAccessObject, gatewayConfiguration, parameters);
        parameters = obj
            .addCredentialParameters(gatewayConfiguration, credentials, parameters);
        
        return parameters;
    };
    
    obj.addTransactionParameters = function addTransactionParameters(dataAccessObject, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.addTransactionParameters");

        var customerData = dataAccessObject.RetrieveCustomerData()
            .GetAsObject();
        var transactionData = dataAccessObject.RetrieveTransactionData()
            .GetAsObject();
        var cardData = dataAccessObject.RetrieveCreditCardData().GetAsObject();
        
        // add all customer data
        for ( var i in customerData) {
        	parameters[i] = customerData[i];
        }
        
        // add all transaction data
        for ( var i in transactionData) {
        	parameters[i] = transactionData[i];
        }
        
        // add all card data
        for ( var i in cardData) {
        	parameters[i] = cardData[i];
        }
        
        return parameters;
    };
    
    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.compileParameters");
        // get basic data here
        // decide if we want everything and add more parameters and call the
        // super method later
        // or we get data on demand
        return parameters;
    };
    
    obj.addCredentialParameters = function addCredentialParameters(gatewayConfiguration, credentials, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.addCredentialParameters");
        
        var credentialFields = gatewayConfiguration.GetAsObject().credentialFields;
        var credentialObj = credentials.getAsObject();
        for ( var i = 0; i < credentialFields.length; i++) {
            parameters[credentialFields[i].paramKey] = credentialObj[credentialFields[i].id];
        }
        return parameters;
    };
    
    obj.addParameter = function addParameter(key, value, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.addParameter");
        parameters[key] = value;
        return parameters;
    };
    
    obj.replaceParameters = function replaceParameters(string, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.replaceParameters");
        
        var stringFormatter = new _5038.string.StringFormatter(string);
        return stringFormatter.replaceParameters(parameters).toString();
    };
    
    obj.processURL = function processURL(url) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.processURL");
        return url;
    };
    
    obj.processPost = function processPost(post) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.processPost");
        return post;
    };
    
    obj.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.processHeader");
        return header;
    };
    
    obj.addRequestVariables = function addRequestVariables(request, parameters, urlTemplate, postTemplate, headerTemplate) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.addRequestVariables");
        request.setVariable("POST_TEMPLATE", postTemplate);
        request.setVariable("URL_TEMPLATE", urlTemplate);
        request.setVariable("HEADER_TEMPLATE", headerTemplate);
        // sets original templates by default
    };
    
    obj.buildRequest = function buildRequest(parameters, urlTemplate, postTemplate, headerTemplate, operationType) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.BaseRequestBuilder.buildRequest");
        
        var request = new _5038.request.Request();
        request.setOperationType(operationType);
        
        var url = this.processURL(this
            .replaceParameters(urlTemplate, parameters));
        request.setURL(url);
        
        var post = this.processPost(this
            .replaceParameters(postTemplate, parameters));
        request.setPost(post);
        
        var header = this.processHeader(this
            .replaceParameters(headerTemplate, parameters));
        request.setHeader(header);
        
        request.setCredentials(credentials.getCredentialList());
        obj.addRequestVariables(request, parameters, urlTemplate, postTemplate, headerTemplate);
        
        return request;
    };
    
    return obj;
};
