/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author mmoya
 */
if (!_4978) {
    var _4978 = {};
}

if (!_4978.responsebuilder) {
    _4978.responsebuilder = {};
}

_4978.responsebuilder.SECUREPAY_PAYMENT_RESPONSE_MAP = {
        transactionBody : "Payment",
        transactionList : "TxnList",
        transactionItem : "Txn"
};

_4978.responsebuilder.SECUREPAY_PERIODIC_RESPONSE_MAP = {
        transactionBody : "Periodic",
        transactionList : "PeriodicList",
        transactionItem : "PeriodicItem"
};

_4978.responsebuilder.SecurePayResponseBuilder = function SecurePayResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    
    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
    
    obj.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace.addLogEntry("_4978.responsebuilder.SecurePayResponseBuilder.buildResponse");
        
        var responseObj = new _5038.response.Response();
        var responseBody = nlResponse.getBody() || "<SecurePayMessage></SecurePayMessage>";
        
        try {
            obj.logMessages(responseObj, nlapiEscapeXML(request.getPost()), responseBody, gatewayConfiguration);
            
            var jsonObj = obj.parseResponse(responseBody);
            responseObj.setAuthorize(request.getOperationType() === _CCP.GATEWAY_OPERATION_AUTHORIZATION);
             
            processResponseStatus(jsonObj, responseObj);
        } catch (ex) {
            responseObj.setSuccess(false);
            responseObj.setDetails(responseBody);
        }
       

        return responseObj;
    };
    
    function processResponseStatus(jsonObj, responseObj) {
        _5038.stacktrace.StackTrace.addLogEntry("_4978.responsebuilder.SecurePayResponseBuilder.processResponseStatus");
        
        var result = false;
        //check status code
        if (jsonObj.SecurePayMessage) {
            if (jsonObj.SecurePayMessage.Status.statusCode) {
                if (['000', '0'].indexOf(jsonObj.SecurePayMessage.Status.statusCode) != -1) {
                    //check response code
                    var isRecurring = !(jsonObj.SecurePayMessage.Payment);
                    result = processTransactionStatus(isRecurring, jsonObj.SecurePayMessage, responseObj);
                } else {
                    responseObj.setDetails(jsonObj.SecurePayMessage.Status.statusDescription);
                                }
                            } else {
                responseObj.setDetails("PGP005 - Error processing SecurePay response. Status not found");
                            }
                        }
        
        responseObj.setSuccess(result);
        
        return;
    }
    
    function processTransactionStatus(isRecurring, transactionMessageObj, responseObj) {
        var transactionMessageMap = isRecurring ? _4978.responsebuilder.SECUREPAY_PERIODIC_RESPONSE_MAP : _4978.responsebuilder.SECUREPAY_PAYMENT_RESPONSE_MAP;
        var transactionBody = transactionMessageObj[transactionMessageMap.transactionBody];
        var result = false;
        
        if (transactionBody) {
            
            var transactionItem = transactionBody[transactionMessageMap.transactionList][transactionMessageMap.transactionItem];
            var responseCode = transactionItem['responseCode'];
            
            if (responseCode) {
                  
                if (['00', '11', '77', '08', '16'].indexOf(responseCode) != -1) {
                    result = true;
                    
                    var transactionReference = transactionItem['txnID'] || transactionItem['clientID'];
                    var transactionInternalId = dataAccessObject.RetrieveTransactionData().GetAsObject().transactionInternalId;
                    var purchaseOrderNumber = transactionItem['purchaseOrderNo'] || transactionItem['ponum'];

                    responseObj.setReferenceCode(buildReferenceCode(transactionReference, transactionInternalId, purchaseOrderNumber));
                    if (responseObj.isAuthorize()) {
                        var preauthID = transactionItem['preauthID'] || transactionItem['clientID'];
                        responseObj.setAuthorizationCode(preauthID);
                    }
                } else {
                    responseObj.setDetails(transactionItem['responseText']);
                }
                }
            }
        
        return result;
        } 
        
    function buildReferenceCode(transactionReference, transactionInternalId, purchaseOrderNumber) {
        var referenceObj = {};
        
        referenceObj.gid = transactionReference;
        referenceObj.mid = transactionInternalId;
        if (purchaseOrderNumber != null && purchaseOrderNumber != "null") { referenceObj.pon = purchaseOrderNumber; }
        
        return JSON.stringify(referenceObj);
    }
    
    return obj;
};