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

_6788.requestbuilder.EWAYRequestBuilder = function EWAYRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, obj) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.EWAYRequestBuilder.compileParameters");
        var formatter =  new _5038.string.StringFormatter();
        var formattedAmt = formatter.formatToCents(obj['transactionAmount']);
        obj["transactionAmount"] = formatter.removePrecedingZero(formattedAmt);
        
        var expiryDateObj = new _5038.creditcard.CreditCardDate(obj["creditCardExpirationDate"]);
        obj["creditCardExpiryMonth"] = new _5038.string.StringFormatter(expiryDateObj
            .getMonth()).padLeft(2, "0").toString();
        obj["creditCardExpiryYear"] = expiryDateObj.getYear();
        
        var issueDateObj = new _5038.creditcard.CreditCardDate(obj["creditCardIssueDate"]);
        obj["creditCardIssueMonth"] = issueDateObj.getMonth() ? new _5038.string.StringFormatter(issueDateObj
            .getMonth()).padLeft(2, "0").toString() : "";
        obj["creditCardIssueYear"] = issueDateObj.getYear() || "";
        
        var useCardSecurityCode = dataAccessObject.RetrieveAccountSettings().GetAsObject().useCardSecurityCode;
        obj["transactionType"] = useCardSecurityCode ? "Purchase" : "MOTO";
        
        obj["customerBillingStreet"] = obj["customerBillingStreet"].substr(0, 50);
        obj["customerBillingStreet2"] = obj["customerBillingStreet2"].substr(0, 50);

        var stringFormatter = new _5038.string.StringFormatter();
        for ( var i in obj) {
            obj[i] = stringFormatter.setString(obj[i]).escapeJSON().toString();
        }

        return obj;
    };
    
    
    obj.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.EWAYRequestBuilder.processHeader");
        
        return (new _5038.parser.JSONParser()).parse(header);
    };
    
    return obj;
};
