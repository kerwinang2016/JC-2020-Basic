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

_6788.responsebuilder.EWAYXMLResponseBuilder = function EWAYXMLResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
    
    function getErrorList(jsonObj) {
        var errorList = [];
        if (jsonObj.ewayResponse.ewayTrxnError
            && jsonObj.ewayResponse.ewayTrxnError.length > 0) {
            errorList = [jsonObj.ewayResponse.ewayTrxnError];
        } else {
            errorList = ["PGP005"];
        }
        return errorList;
    }
    
    obj.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_6788.responsebuilder.EWAYXMLResponseBuilder.buildResponse");
        
        var responseObj = new _5038.response.Response();
        var responseBody = nlResponse.getBody()
                           || "<ewayResponse></ewayResponse>";
        var jsonObj = obj.parseResponse(responseBody);

        obj.logMessages(responseObj, request.getPost(), responseBody, gatewayConfiguration);        

        var isSuccess = jsonObj.ewayResponse.ewayTrxnStatus === "True";
        responseObj.setSuccess(isSuccess);
        
        if (request.getOperationType() === _CCP.GATEWAY_OPERATION_AUTHORIZATION) {
            responseObj.setAuthorize(true);
        }
        
        if (isSuccess) {
            responseObj.setReferenceCode(jsonObj.ewayResponse.ewayTrxnNumber);
            if (responseObj.isAuthorize()) {
                responseObj
                    .setAuthorizationCode(jsonObj.ewayResponse.ewayAuthCode);
            }
            
        } else {
            var errorDetails = obj
                .getErrorDetails(getErrorList(jsonObj), gatewayConfiguration
                    .GetAsObject().internalId);
            responseObj.setDetails(errorDetails);
        }
        return responseObj;
        
    };
    
    return obj;
};
