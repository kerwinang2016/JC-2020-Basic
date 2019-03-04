/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_6788) {
    var _6788 = {};
}

if (!_6788.responsebuilder) {
    _6788.responsebuilder = {};
}

_6788.responsebuilder.EWAYResponseBuilder = function EWAYResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
    
    function getErrorList(jsonObj) {
        var errorList = [];
        if (jsonObj.Errors && jsonObj.Errors.length > 0) {
            errorList = jsonObj.Errors.split(",");
        } else
            if (jsonObj.ResponseMessage && jsonObj.ResponseMessage.length > 0) {
                errorList = [jsonObj.ResponseMessage];
            } else {
                errorList = ["PGP005"];
            }
        return errorList;
    }
    
    obj.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.responsebuilder.EWAYResponseBuilder.buildResponse");
        
        var responseObj = new _5038.response.Response();
        var responseBody = nlResponse.getBody() || "{}";
        
        
        nlapiLogExecution("DEBUG", "Header", JSON.stringify(request.getHeader()));
        
        obj.logMessages(responseObj, request.getPost(), responseBody, gatewayConfiguration);
        
        try {
            var jsonObj = obj.parseResponse(responseBody);
            
            responseObj.setSuccess(jsonObj.TransactionStatus);
            responseObj.setParsedResponse(jsonObj);
            
            var externalCheckoutOperations = [
                _CCP.GATEWAY_OPERATION_PAYMENT_CHKOUT_RESULTFETCH,
                _CCP.GATEWAY_OPERATION_AUTH_CHKOUT_RESULTFETCH
            ];
            
            
            var authorizeOperations = [
                _CCP.GATEWAY_OPERATION_AUTHORIZATION,
            ];

            var authCode = '';
            
            if (externalCheckoutOperations.indexOf(request.getOperationType()) > -1) {
                authCode = jsonObj.AuthorisationCode;
                responseObj.setExternalCheckout(true);
                responseObj.setSaveAuthorizationCode(true);
            }
            
            if (authorizeOperations.indexOf(request.getOperationType()) > -1 ) {
                authCode = jsonObj.AuthorisationCode;
                responseObj.setAuthorize(true);
        	}
            
            // setting the response object as "authorize" 
            // to store authcode returned by eway from a capture operation in Cash Sales
            if (request.getOperationType() === _CCP.GATEWAY_OPERATION_CAPTURE) { 
                authCode = jsonObj.ResponseCode;
                responseObj.setSaveAuthorizationCode(true);
            }
            
            if (jsonObj.TransactionStatus) {
                if ( (responseObj.isAuthorize() || responseObj.isSaveAuthorizationCode() ) && authCode) {
                    responseObj.setAuthorizationCode(authCode);
                }
                responseObj.setReferenceCode(jsonObj.TransactionID);
            } else {
                var errorDetails = obj
                    .getErrorDetails(getErrorList(jsonObj), gatewayConfiguration
                        .GetAsObject().internalId);
                responseObj.setDetails(errorDetails);

                // Only set the hold reason if the transaction is from external checkout
                // This is to preserve the general behavior of UI gateways
                var transactionData = dataAccessObject.RetrieveTransactionData().GetAsObject();
                var isExternalCheckout = transactionData.transactionIsExternalCheckout;
                if (isExternalCheckout) {
                    responseObj.setHoldReason('FRAUDREJECTEXTERNAL');
                }
            }
        } catch (e) {
            responseObj.setSuccess(false);
            responseObj.setDetails(responseBody);
        }
        return responseObj;
        
    };
    
    return obj;
};
