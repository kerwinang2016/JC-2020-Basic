/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_6788) {
    var _6788 = {};
}

if (!_6788.requestbuilder) {
    _6788.requestbuilder = {};
}

_6788.requestbuilder.EWAYXMLRequestBuilder = function EWAYXMLRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    

    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, obj) {
        _5038.stacktrace.StackTrace.addLogEntry("_6788.requestbuilder.EWAYXMLRequestBuilder.compileParameters");
        
        var stringFormatter = new _5038.string.StringFormatter();
        obj["transactionAmount"] = stringFormatter.formatToCents(obj['transactionAmount']);
        
        var expiryDateObj = new _5038.creditcard.CreditCardDate(obj["creditCardExpirationDate"]);
        obj["creditCardExpiryMonth"] = stringFormatter.setString(expiryDateObj.getMonth()).padLeft(2, "0").toString();
        obj["creditCardExpiryYear"] = expiryDateObj.getYear();
        
        var issueDateObj = new _5038.creditcard.CreditCardDate(obj["creditCardIssueDate"]);
        obj["creditCardIssueMonth"] = issueDateObj.getMonth() ? stringFormatter.setString(issueDateObj.getMonth())
            .padLeft(2, "0").toString() : "";
        obj["creditCardIssueYear"] = issueDateObj.getYear() || "";
        
        obj["transactionId"] = stringFormatter.setString(obj["transactionId"]).encodeHTML().toString();
        obj["transactionDescription"] = stringFormatter.setString(obj["transactionDescription"]).encodeHTML().toString();
        obj["customerFirstName"] = stringFormatter.setString(obj["customerFirstName"]).encodeHTML().toString();
        obj["customerLastName"] = stringFormatter.setString(obj["customerLastName"]).encodeHTML().toString();
        obj["customerEmail"] = stringFormatter.setString(obj["customerEmail"]).encodeHTML().toString();
        obj["creditCardStreet"] = stringFormatter.setString(obj["creditCardStreet"]).encodeHTML().toString();
        obj["creditCardName"] = stringFormatter.setString(obj["creditCardName"]).encodeHTML().toString();
        
        return obj;
    };
    
    obj.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace.addLogEntry("_6788.requestbuilder.EWAYXMLRequestBuilder.processHeader");
        return null;
    };
    
    return obj;
};
