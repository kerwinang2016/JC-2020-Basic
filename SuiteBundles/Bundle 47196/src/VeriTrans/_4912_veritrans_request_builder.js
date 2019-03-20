/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_4912) {
    var _4912 = {};
}

if (!_4912.requestbuilder) {
    _4912.requestbuilder = {};
}

_4912.requestbuilder.VeriTransRequestBuilder = function VeriTransRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, parameters) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.VeriTransRequestBuilder.compileParameters");
        
        //creditCardExpirationDate format is MM/YY
        var expiryDateObj = new _5038.creditcard.CreditCardDate(parameters["creditCardExpirationDate"]);
        parameters["creditCardExpirationDate"] = new _5038.string.StringFormatter(expiryDateObj
            .getMonth()).padLeft(2, "0").toString()
                                                 + "/"
                                                 + String(expiryDateObj
                                                     .getYear()).substring(2);
        parameters["GMT_DATE"] = new _5038.date.DateFormatter().getGMT();
        parameters["DUMMY_REQUEST"] = gatewayConfiguration.GetAsObject().isTestMode ? 1 : 0;
        
        //Truncate digits
        var amt = new Number(parameters['transactionAmount']);

        if (isNaN(amt)) {
            amt = "0";
        } else {
            amt = new String(amt.toFixed(0));
        }
        
        parameters['transactionAmount'] = amt;
        
        if (parameters.transactionCreatedFrom) {
            var refTransaction = dataAccessObject
                .RetrieveReferenceTransactionDetails(parameters.transactionCreatedFrom);
            while (refTransaction.tranid && refTransaction.pnrefnum) {
                parameters['transactionCreatedFrom'] = refTransaction.tranid;
                parameters['transactionExternalId'] = refTransaction.tranid;
                
                if (refTransaction.createdfrom == null
                    || refTransaction.createdfrom == '') {
                    break;
                }
                
                refTransaction = dataAccessObject
                    .RetrieveReferenceTransactionDetails(refTransaction.createdfrom);
            }
        }
        
        return parameters;
    };
    
    obj.processPost = function processPost(post) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.VeriTransRequestBuilder.compileParameters");
        var gatewayObj = gatewayConfiguration.GetAsObject();
        var domain = gatewayObj.isTestMode ? gatewayObj.testDomain : gatewayObj.liveDomain;
        
        var merchID = "{" + credentials.getValue("merchant_id") + "}";
        var verificationKey = "{" + credentials.getValue("verification_key")
                              + "}";
        
        nlapiLogExecution("AUDIT", "Request Verification", new _5038.string.StringFormatter(merchID
                                                                                            + post
                                                                                            + verificationKey, domain)
            .hideCardNumbers(dataAccessObject.RetrieveCreditCardData()
                .GetAsObject().creditCardNumber).toString());
        

        var shastr = new nlobjCredentialBuilder(merchID + post
                                                + verificationKey, domain);
        shastr.sha256();
        var combined = new nlobjCredentialBuilder(post + "&authHash=", domain);
        combined.append(shastr);
        combined.utf8();
        combined.base64();
        combined.replace(/=/g, '*');
        combined.replace(/\+/g, '_');
        combined.replace(/\//g, '-');
        var post = {};
        post["3gpsBody"] = combined;
        return post;
    };
    
    obj.processHeader = function processHeader(header) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.VeriTransRequestBuilder.processHeader");
        
        return (new _5038.parser.JSONParser()).parse(header);
    };
    
    obj.addRequestVariables = function addRequestVariables(request, parameters, urlTemplate, postTemplate, headerTemplate) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.requestbuilder.AbstractRequestBuilder.addRequestVariables");
        request.setVariable("POST_VALUE", obj
            .replaceParameters(postTemplate, parameters).split("&").join("\n"));
        // sets original templates by default
    };
    
    return obj;
};