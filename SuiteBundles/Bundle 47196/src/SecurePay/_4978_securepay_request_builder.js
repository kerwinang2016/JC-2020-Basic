/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author mmoya
 */
if (!_4978) {
    
    var _4978 = {};
    
}


if (!_4978.requestbuilder) {
    
    _4978.requestbuilder = {};
    
}


_4978.requestbuilder.SecurePayRequestBuilder = function SecurePayRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    obj.processHeader = function processHeader(header) {
        
        _5038.stacktrace.StackTrace

        .addLogEntry("_4978.requestbuilder.SecurePayRequestBuilder.processHeader");
        
        return {};
        
    };
    

    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, obj) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_4978.requestbuilder.SecurePayRequestBuilder.compileParameters");
        
        var stringFormatter = new _5038.string.StringFormatter();
        
        var currency = obj['transactionCurrencyISO'];
        
        if (currency == 'JPY') {
        	obj['transactionAmount'] = stringFormatter.formatTruncateDecimal(obj['transactionAmount']);
        } else {
        	obj['transactionAmount'] = stringFormatter.formatToCents(obj['transactionAmount']);
        }

        // find original transaction ID
        if (obj['transactionCreatedFrom']) {
        	obj = findOriginalTransactionId(obj);
        }
        
        // support old SecurePay implementation
        var oldParams = new String(obj['transactionExternalId']);
        if (oldParams && /"gid"/.test(oldParams)) {
        	
            oldParams = (new _5038.parser.JSONParser()).parse(oldParams);
            
            if (oldParams.gid) {
                obj['transactionExternalId'] = oldParams.gid;
                obj['transactionAuthCode'] = obj['transactionAuthCode'] || oldParams.gid;
                obj["purchaseOrderNumber"] = oldParams.pon;
            }
        }
        
        // if transaction ID is null, we must be refunding from a Credit Memo
        if (!obj['transactionId'] && obj['transactionExternalId']) {
        	
        	// this will try to find the transactions with the same pnrefnum
        	var pnrefnum = new String (obj['transactionExternalId']);
        	pnrefnum = "\"gid\":" +  "\"" + pnrefnum.trim() + "\"";
               
            var relatedTransactionsArray = dataAccessObject.RetrieveRelatedTransactionDetails(pnrefnum, obj['customerId']);
        	
        	// for now, expect only 1 related transaction
        	if (relatedTransactionsArray.length > 0) {
        		obj['transactionId'] = relatedTransactionsArray[0].tranid;	//this is the payment record
        		obj['transactionCreatedFrom'] = dataAccessObject.RetrieveAppliedToTransactionId(relatedTransactionsArray[0]);
        		
        		nlapiLogExecution("DEBUG", "transactionCreatedFrom", obj['transactionCreatedFrom']);
        	}
        }
        
        // Support existing transactions where purchaseOrderNumber is not yet stored
        if (!obj["purchaseOrderNumber"]) {
            obj["purchaseOrderNumber"] = obj["transactionCreatedFrom"];
        }

        obj['cardNumber'] = obj['creditCardNumber'];
        
        // credit card date
        var expDateSplit = obj['creditCardExpirationDate'].split("/");
        obj['expirationMonth'] = stringFormatter.setString(expDateSplit[0]).padLeft(2, "0").toString();
        obj['expirationYear'] = expDateSplit[1].substring(2);
        
        // custom fields
        obj['messageTimestamp'] = getMessageTimestamp();
        obj['messageTimeout'] = 60;
        obj['messageId'] = getMessageID();
        obj['apiVersion'] = getAPIVersion(obj['transactionIsRecurring']);
        
        for ( var i in obj) {
            obj[i] = stringFormatter.setString(obj[i]).encodeHTML().toString();
        }

        // credit card security code
        var useCardSecurityCode = dataAccessObject.RetrieveAccountSettings().GetAsObject().useCardSecurityCode;
        var cvv = stringFormatter.setString(obj["creditCardSecurityCode"]).encodeHTML().toString();
        obj['cvvTag'] = useCardSecurityCode ? ('<cvv>' + cvv + '</cvv> ') : '';
        
        obj["transactionId"] = stringFormatter.setString(obj["transactionId"]).encodeHTML().toString();
        obj["creditCardName"] = stringFormatter.setString(obj["creditCardName"]).encodeHTML().toString();
        obj["customerFirstName"] = stringFormatter.setString(obj["customerFirstName"]).encodeHTML().toString();
        obj["customerLastName"] = stringFormatter.setString(obj["customerLastName"]).encodeHTML().toString();
        obj["customerBillingCity"] = stringFormatter.setString(obj["customerBillingCity"]).encodeHTML().toString();
        obj["customerBillingCountry"] = stringFormatter.setString(obj["customerBillingCountry"]).encodeHTML()
            .toString();
        obj["customerShippingCountry"] = stringFormatter.setString(obj["customerShippingCountry"]).encodeHTML()
            .toString();
        obj["customerEmail"] = stringFormatter.setString(obj["customerEmail"]).encodeHTML().toString();
        obj["creditCardName"] = stringFormatter.setString(obj["creditCardName"]).encodeHTML().toString();

        return obj;
    };
    

    obj.buildRequest = function buildRequest(parameters, urlTemplate, postTemplate, headerTemplate, operationType) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.requestbuilder.SecurePayRequestBuilder.buildRequest");

        var request = new _5038.request.Request();
        request.setOperationType(operationType);

        // if with IP address
        if (operationType === _CCP.GATEWAY_OPERATION_AUTHORIZATION && !isIPAddressEmpty(parameters)) {
            parameters['spPrefix'] = "www";
            parameters['spPortal'] = "antifraud";
        } else {
            parameters['spPrefix'] = "api";
            parameters['spPortal'] = "xmlapi";
        }
        
        var url = obj.replaceParameters(urlTemplate, parameters);
        request.setURL(url);

        var post = obj.processPost(obj.replaceParameters(postTemplate, parameters));
        request.setPost(post);
        
        var header = obj.processHeader(obj.replaceParameters(headerTemplate, parameters));
        request.setHeader(header);
        
        request.setCredentials(credentials.getCredentialList());
        obj.addRequestVariables(request, parameters, urlTemplate, postTemplate, headerTemplate);
        
        return request;
    };
    

    function isIPAddressEmpty(parameters) {
        
        return (parameters['customerIPAddress'] == null || parameters['customerIPAddress'] == '');
        
    }

    function getAPIVersion(isRecurring) {
        
        return Boolean(isRecurring) ? "spxml-4.2" : "xml-4.2";
    }

    function getMessageID() {
        return Math.uuid();
    }
    
    function getMessageTimestamp() {
        
        var now = new Date();
        var ts = now.toString("yyyyddMMHHmmss");
        
        return ts + _Pad(now.getMilliseconds(), 3) + "000" + (now.getTimezoneOffset() >= 0 ? "+" : "")
               + now.getTimezoneOffset();

        function _Pad(n, length)

        {
            for ( var s = n.toString(); s.length < length; s = "0" + s)

            {
                /* empty */
            };

            return s;
            
        }
    }
 
    function findOriginalTransactionId(params) {
    	if (params['transactionCreatedFrom']) {
            
            var refTransaction = dataAccessObject.RetrieveReferenceTransactionDetails(params['transactionCreatedFrom']);
            
            if (refTransaction && refTransaction.tranid && refTransaction.pnrefnum) {
                
            	params['transactionExternalId'] = refTransaction.pnrefnum;
            	params['transactionAuthCode'] = refTransaction.authcode;
            	params['transactionCreatedFrom'] = refTransaction.tranid;

                while (refTransaction.tranid && refTransaction.pnrefnum) {
                	params['transactionCreatedFrom'] = refTransaction.tranid;
                	params['transactionAuthCode'] = refTransaction.authcode;
                    
                    if (refTransaction.createdfrom == null || refTransaction.createdfrom == '') {
                        break;
                    }

                    refTransaction = dataAccessObject.RetrieveReferenceTransactionDetails(refTransaction.createdfrom);
                }
            }
        }
    	
    	return params;
    }

    return obj;
    
};