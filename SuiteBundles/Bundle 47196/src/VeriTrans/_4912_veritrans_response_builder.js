/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_4912) {
    var _4912 = {};
}

if (!_4912.responsebuilder) {
    _4912.responsebuilder = {};
}

_4912.responsebuilder.VeriTransResponseBuilder = function VeriTransResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    
    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
    

    obj.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_4912.requestbuilder.VeriTransResponseBuilder.buildResponse");
        
        var responseObj = new _5038.response.Response();
        var responseBody = nlResponse.getBody() || "{}";
        
        obj
            .logMessages(responseObj, request.getVariable("POST_VALUE"), new _5038.string.StringFormatter(responseBody)
                .encodeHTML().toString(), gatewayConfiguration);
        

        responseObj
            .setAuthorize(request.getOperationType() === _CCP.GATEWAY_OPERATION_AUTHORIZATION);
        
        try {
            var responseAsJSON = obj.parseResponse(responseBody).GWPaymentResponseDto.result;
            
            responseObj.setSuccess(responseAsJSON.mstatus === "success");
            if (responseObj.isSuccess()) {
                responseObj.setReferenceCode(responseAsJSON.custTxn);
                responseObj.setAuthorizationCode(responseAsJSON.custTxn);
            } else {
                var errDetails = [responseAsJSON.mstatus];
                if (responseAsJSON.vResultCode
                    && responseAsJSON.vResultCode !== "") {
                    errDetails.splice(0, 0, responseAsJSON.vResultCode);
                }
                responseObj.setDetails(errDetails.join(" - "));
            }
        } catch (e) {
            responseObj.setSuccess(false);
            responseObj.setDetails(responseBody);
        }
        

        return responseObj;
        
    };
    

    return obj;
};