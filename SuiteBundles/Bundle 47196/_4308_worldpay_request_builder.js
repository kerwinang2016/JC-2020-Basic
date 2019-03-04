if (!_4308) {
    var _4308 = {};
}

if (!_4308.requestbuilder) {
    _4308.requestbuilder = {};
}

_4308.requestbuilder.WorldPayRequestBuilder = function WorldPayRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, obj) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_4308.requestbuilder.WorldPayRequestBuilder.compileParameters");
        
        obj["amountExponent"] = gatewayDataAccessObject
            .RetrievePaymentGatewayVariables("WORLDPAY_EXPONENT", gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables[obj["transactionCurrencyISO"]]
                                || "2";
        
        obj["transactionAmount"] = Number(obj["transactionAmount"])
                                   * Math
                                       .pow(10, Number(obj["amountExponent"]));
        
        var expiryDateObj = new _5038.creditcard.CreditCardDate(obj["creditCardExpirationDate"]);
        obj["creditCardExpiryMonth"] = new _5038.string.StringFormatter(expiryDateObj
            .getMonth()).padLeft(2, "0").toString();
        obj["creditCardExpiryYear"] = expiryDateObj.getYear();
        
        obj["transactionDescription"] = obj["transactionDescription"]
                                        || obj["transactionMemo"]
                                        || obj["transactionId"] + " - "
                                        + obj["transactionAmount"];
        
        obj["customerIPAddress"] = obj["customerIPAddress"];
        
        var paymentMethods = new _5038.netsuite.NetSuiteObject("cashsale")
            .getOptionsAsMap("paymentmethod");
        var sslType = (paymentMethods[obj["transactionPaymentMethod"]] || "")
            .toUpperCase().replace(" ", "");
        
        var sslTypes = gatewayDataAccessObject
            .RetrievePaymentGatewayVariables("SSL_TYPE", gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables;
        
        if (obj["transactionExternalId"]) {
            obj["transactionId"] = obj["transactionExternalId"];
        }
        
        obj["SSL"] = sslTypes[sslType] === undefined ? sslTypes["card"] : sslTypes[sslType];
        
        return obj;
    };
    
    obj.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_4308.requestbuilder.WorldPayRequestBuilder.processHeader");
        return new _5038.parser.JSONParser().parse(header);
    };
    
    return obj;
};
