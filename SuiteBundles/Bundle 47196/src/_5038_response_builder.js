/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}

if (!_5038.responsebuilder) {
    _5038.responsebuilder = {};
}

_5038.responsebuilder.AbstractResponseBuilder = function AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    
    this.getErrorDetails = function getErrorDetails(errors) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.responsebuilder.AbstractResponseBuilder.getErrorDetails");
        
        if (errors.length === 0) {
            return "PGP101 - Unknown error encountered";
        }
        
        var details = [];
        
        var errorVariables = gatewayDataAccessObject
            .RetrievePaymentGatewayVariablesByType(_CCP.PGP_VARIABLE_ERROR, gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables;
        
        for ( var i = 0; i < errors.length; i++) {
            var currError = [errors[i]];
            if (errorVariables[errors[i]]) {
                currError.push(errorVariables[errors[i]]);
            }
            details.push(currError.join(" - "));
        }
        
        return details.join("<br />");
    };
    
    this.setParser = function setParser(newParser){
    	parser = newParser;
    };
    
    this.parseResponse = function parseResponse(responseBody) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.responsebuilder.AbstractResponseBuilder.parseResponse");
        
        return parser.parse(responseBody);
    };
    
    this.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.responsebuilder.AbstractResponseBuilder.buildResponse");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractResponseBuilder");
    };

    this.buildResponseFromRedirectData = function buildResponseFromRedirectData(redirectData) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.responsebuilder.AbstractResponseBuilder.buildResponseFromRedirectData");
        
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractResponseBuilder");
    };

    this.logMessages = function logMessages(responseObj, requestText, responseText, gatewayConfiguration) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.responsebuilder.AbstractResponseBuilder.logMessages");
        
        var cardData = dataAccessObject.RetrieveCreditCardData().GetAsObject();
        var cardNumber = cardData.creditCardNumber;
        var cardSecurityCode = cardData.creditCardSecurityCode;
        var cardSecurityCodeName = gatewayConfiguration.GetSecurityCodeName();
        
        var stringFormatter = new _5038.string.StringFormatter();
        var rawRequest = stringFormatter.setString(requestText)
            .hideCardNumbers(cardNumber).hideSecurityCode(cardSecurityCodeName, cardSecurityCode).toString();
        responseObj.setRawRequest(rawRequest);
        nlapiLogExecution("AUDIT", "Raw Request", rawRequest);
        
        var rawResponse = stringFormatter.setString(responseText)
            .hideCardNumbers(cardNumber).hideSecurityCode(cardSecurityCode).toString();
        responseObj.setRawResponse(rawResponse);
        nlapiLogExecution("AUDIT", "Raw Response", rawResponse);
    };
    
    this.getResponse = function getResponse(request, nlResponse, dataAccessObject) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.responsebuilder.AbstractResponseBuilder.getResponse");

        var transactionData = dataAccessObject.RetrieveTransactionData().GetAsObject();
        var isECommerce = transactionData.transactionIsECommerce;

        var response = this.buildResponse(request, nlResponse);
        response.setECommerce(isECommerce);

        return response;
    };
    
    return this;
};