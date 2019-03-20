/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5247) {
    var _5247 = {};
}

if (!_5247.requestbuilder) {
    _5247.requestbuilder = {};
}

_5247.requestbuilder.AsiaPayRequestBuilder = function AsiaPayRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    function getCurrency(currencyISO) {
        var currencies = gatewayDataAccessObject
            .RetrievePaymentGatewayVariablesByType("ASIAPAY_CURR_CODE", gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables;
        return currencies[currencyISO];
    }
    
    function getMethod(method) {
        var paymentMethods = {};
        var rec = nlapiCreateRecord("cashsale");
        var options = rec.getField("paymentmethod").getSelectOptions();
        for ( var i = 0; i < options.length; ++i) {
            paymentMethods[options[i].getId()] = options[i].getText()
                .toLowerCase();
        }
        
        var asiaPayMethods = gatewayDataAccessObject
            .RetrievePaymentGatewayVariablesByType("ASIAPAY_PAYMENT_METHOD", gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables;
        return asiaPayMethods[paymentMethods[method]];
    }
    
    function isExempt(i) {
       // Add to this map other indexes for exemption; with a value of true
       var EXEMPT_MAP = {
              "creditCardNumber" : true,
              "creditCardSecurityCode" : true
       };
       
       return EXEMPT_MAP[i] ? EXEMPT_MAP[i] : false;          
    }
    
    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, obj) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.AsiaPayRequestBuilder.compileParameters");
        
        var expiryDateObj = _5038.creditcard
            .CreditCardDate(obj["creditCardExpirationDate"]);
        obj["creditCardExpiryYear"] = expiryDateObj.getYear();
        obj["creditCardExpiryMonth"] = expiryDateObj.getMonth();
        
        obj["ASIAPAY_CURRENCY"] = getCurrency(obj["transactionCurrencyISO"]);
        obj["ASIAPAY_METHOD"] = getMethod(obj["transactionPaymentMethod"]);
        
        var stringFormatter = new _5038.string.StringFormatter();
        for (var i in obj) {
              if(!isExempt(i)) {                
                     obj[i] = stringFormatter.setString(obj[i]).encodeURI().toString();
              }
        }
        
        return obj;
    };
    
    obj.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.AsiaPayRequestBuilder.processHeader");
        return null;
    };
    
    obj.buildRequest = function buildRequest(parameters, urlTemplate, postTemplate, headerTemplate, operationType) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AsiaPayRequestBuilder.buildRequest");
        
        var request = new _5038.request.Request();
        request.setOperationType(operationType);
        
        var url = this.processURL(this
            .replaceParameters(urlTemplate + "?" + postTemplate, parameters));
        
        request.setURL(url);
        request.setPost("");
        request.setHeader(null);
        
        request.setCredentials(credentials.getCredentialList());
        
        return request;
    };
    
    return obj;
};
