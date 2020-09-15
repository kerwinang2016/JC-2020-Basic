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

_5247.requestbuilder.ASIAPAY_REQUEST_SECUREHASH_TEMPLATE = '{merchantId}|{merchantReference}|{currencyCode}|{amount}|{paymentType}|{secureHashSecret}';

_5247.requestbuilder.AsiaPayRequestBuilder = function AsiaPayRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials, input, operationType) {
    var obj = _5038.requestbuilder
        .BaseRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials, input, operationType);
    
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
    
    obj.compileParameters = function compileParameters(dataAccessObject, gatewayConfiguration, obj, input) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.requestbuilder.AsiaPayRequestBuilder.compileParameters");
        
        var secureHash = "";
        var gatewayProfileData = getProfileData(input);
        
        //Check if PPP has extension record
        if(gatewayProfileData){
            var transactionData = dataAccessObject.RetrieveTransactionData().GetAsObject();
            var otherData = {};
            var payType = _CCP.ASIAPAY_PAY_TYPE_SALE;
            
            otherData['currencyCode'] = getGatewayVariable("ASIAPAY_CURR_CODE", transactionData.transactionCurrencyISO);
            
            // N for sale, H for authorize
            if((operationType == _CCP.GATEWAY_OPERATION_AUTHORIZATION) || (operationType == _CCP.GATEWAY_OPERATION_REFUND)){
            	payType = _CCP.ASIAPAY_PAY_TYPE_AUTH;
            }

            otherData['paymentType'] = payType;

            //core bug for null transaction ID for customer payment
            if(!transactionData.transactionId){
            	otherData['transactionReference'] = transactionData.transactionInternalId;
            	obj['transactionId'] = transactionData.transactionInternalId;
            }
            else{
            	otherData['transactionReference'] = transactionData.transactionId;
            }

            secureHash = generateAsiaPaySignature(_5247.requestbuilder.ASIAPAY_REQUEST_SECUREHASH_TEMPLATE,
                                                               gatewayProfileData,
                                                               transactionData,
                                                               otherData);
        }
        

        var expiryDateObj = _5038.creditcard
            .CreditCardDate(obj["creditCardExpirationDate"]);
        obj["creditCardExpiryYear"] = expiryDateObj.getYear();
        obj["creditCardExpiryMonth"] = expiryDateObj.getMonth();
        
        obj["ASIAPAY_CURRENCY"] = getCurrency(obj["transactionCurrencyISO"]);
        obj["ASIAPAY_METHOD"] = getMethod(obj["transactionPaymentMethod"]);
        obj['secureHash'] = secureHash;

        //for payment transactions
        obj = findOriginalTransactionId(obj);

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

    function getProfileData(input) {
        // retrieve payment gateway hard-coded id's - permission is restricted, and USE ENCRYPTED FORMAT is checked in custom record type field record
        // DO NOT print this info in logs
        var gatewayProfileData;
        var profileExtRec = input.getProfileExtensionRecord();
        if(profileExtRec){
        	gatewayProfileData = {};
            gatewayProfileData['merchantId'] = profileExtRec.getFieldValue('custrecord_asiapay_dir_conf_merchant_id');
            gatewayProfileData['secureHashSecret'] = profileExtRec.getFieldValue('custrecord_asiapay_dir_conf_hash_secret');
        }

        return gatewayProfileData;
    }
    
    function generateAsiaPaySignature(signatureTemplate, gatewayProfileData, transactionData, otherData) {
        var paymentSignatureDetails = {
            merchantId: gatewayProfileData.merchantId,
            merchantReference: otherData.transactionReference,
            currencyCode: otherData.currencyCode,
            amount: transactionData.transactionAmount,
            paymentType: otherData.paymentType,
            secureHashSecret: gatewayProfileData.secureHashSecret,
        };
        
        return obj.generateSignature(signatureTemplate, paymentSignatureDetails);
    }

    function getGatewayVariable(type, key) {
        var value = null;

        if (obj.variables == null) {
            obj.variables = gatewayDataAccessObject.RetrievePaymentGatewayVariables(gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables;
        }

        if (obj.variables[type] != null) {
            value = obj.variables[type][key];
        }

        return value;
    }

    /**
     * Replace transactionId from Created from or Invoice
     *
     * @param params
     * @return {*}
     */
    function findOriginalTransactionId(params) {
        if (params['transactionCreatedFrom']) {
            var refTransaction = dataAccessObject.RetrieveReferenceTransactionDetails(params['transactionCreatedFrom']);
            if (refTransaction.tranid) {
                params['transactionId'] = refTransaction.tranid;
            }
        }
        //for payment, use invoice number for transaction id
        else if(params['salesTranNumber']){
            params['transactionId'] = params['salesTranNumber'];
        }

        return params;
    };
    
    return obj;
};
