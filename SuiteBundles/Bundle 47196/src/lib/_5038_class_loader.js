/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.classloader) {
    _5038.classloader = {};
}

_5038.classloader.ClassLoader = (function ClassLoader(gatewayConfiguration) {
    _5038.stacktrace.StackTrace.addLogEntry("_5038.classloader.ClassLoader");

    this.loadClass = function loadClass(className) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.classloader.ClassLoader.loadClass: " + className+ ";");
    
        return eval("(function (){return " + className + ";})()");
    };
    
    
    this.createRequestBuilder = function createRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    	_5038.stacktrace.StackTrace
    	    .addLogEntry("_5038.classloader.createRequestBuilder: " + gatewayConfiguration.GetRequestBuilder() + ";");
    	
    	var requestBuilderClass = this.loadClass(gatewayConfiguration.GetRequestBuilder());
        return new requestBuilderClass(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    };
    
    this.createParser = function createParser() {
    	_5038.stacktrace.StackTrace
			.addLogEntry("_5038.classloader.createParser: " + gatewayConfiguration.GetParser() + ';');
    	
        var parserClass = this.loadClass(gatewayConfiguration.GetParser());
        return new parserClass();
    };
    
    this.createResponseBuilder = function createResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    	_5038.stacktrace.StackTrace
    		.addLogEntry("_5038.classloader.createResponseBuilder: " + gatewayConfiguration.GetResponseBuilder() + ";");
    	
    	var responseBuilderClass = this.loadClass(gatewayConfiguration.GetResponseBuilder());
        return new responseBuilderClass(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
    };
    
    this.createTransactionDataAccessObject = function createTransactionDataAccessObject(input, gatewayConfiguration) {
    	_5038.stacktrace.StackTrace
        	.addLogEntry("_5038.classloader.createTransactionDataAccessObject: " + gatewayConfiguration.GetTransactionDataAccessObject() + ";");
        
    	var transactionDAOClass = this.loadClass(gatewayConfiguration.GetTransactionDataAccessObject());
        return new transactionDAOClass(input);
    };
    
    this.loadCredentials = function loadCredentials(input, gatewayConfigurationObject) {
    	return new _5038.credential.Credentials(gatewayConfigurationObject.properties.CredentialRecord, input
            .getPartnerUniqueIdentifier());
    };
    
    this.createExternalCheckoutProcessor  = function createExternalCheckoutProcessor(input, output, operationType) {
    	_5038.stacktrace.StackTrace
    	    .addLogEntry("_5038.classloader.createExternalCheckoutProcessor : " + gatewayConfiguration.GetRequestBuilder() + ";");
    	
    	var externalCheckoutProcessor  = this.loadClass(gatewayConfiguration.GetExternalCheckoutProcessor());
        return new externalCheckoutProcessor(input, output, operationType);
    };

    this.createFormRequestBuilder  = function createFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.classloader.createFormRequestBuilder : " + gatewayConfiguration.GetFormRequestBuilder() + ";");

        var formRequestBuilderClass = this.loadClass(gatewayConfiguration.GetFormRequestBuilder());
        return new formRequestBuilderClass(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    };

    this.createHashGenerator = function createHashGenerator() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.classloader.createHashGenerator: " + gatewayConfiguration.GetHashGenerator() + ';');

        var parserClass = this.loadClass(gatewayConfiguration.GetHashGenerator());
        return new parserClass();
    };

    return this;
});
