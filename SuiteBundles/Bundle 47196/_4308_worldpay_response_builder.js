if (!_4308) {
    var _4308 = {};
}

if (!_4308.responsebuilder) {
    _4308.responsebuilder = {};
}

_4308.responsebuilder.WorldPayResponseBuilder = function WorldPayResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
    
    function isSuccess(object, request) {
        var success = false;
        
        if (request.getOperationType() === _CCP.GATEWAY_OPERATION_AUTHORIZATION) {
            success = is3DSecure(object) ? object.orderStatus.requestInfo.request3DSecure.paRequest
                                           && object.orderStatus.requestInfo.request3DSecure.issuerURL : object.orderStatus
                                                                                                         && object.orderStatus.payment
                                                                                                         && object.orderStatus.payment.lastEvent
                                                                                                         && object.orderStatus.payment.lastEvent
                                                                                                             .toString() == "AUTHORISED";
        } else {
            var resultKey = (request.getOperationType() === _CCP.GATEWAY_OPERATION_CAPTURE) ? "captureReceived" : "refundReceived";
            
            success = object.ok && (object.ok[resultKey] !== undefined);
        }
        return success;
    }
    
    function is3DSecure(jsonObj) {
        return jsonObj.orderStatus && jsonObj.orderStatus.requestInfo
               && jsonObj.orderStatus.requestInfo.request3DSecure;
    }
    
    function handle3DSecure(responseObj, jsonObj) {
        responseObj.setNeedsPayerAuthentication(true);
        responseObj
            .setPayerAuthenticationURL(jsonObj.orderStatus.requestInfo.request3DSecure.issuerURL);
        responseObj
            .setPARequest(jsonObj.orderStatus.requestInfo.request3DSecure.paRequest);
    }
    
    function handleMOTO(request, responseObj, jsonObj) {
        var opType = gatewayDataAccessObject
            .RetrievePaymentGatewayVariables(_CCP.PGP_VARIABLE_OPERATION_TYPE_KEY, null).GetAsObject().variables[request
            .getOperationType()];
        
        var nodeName = gatewayDataAccessObject
            .RetrievePaymentGatewayVariables("WORLDPAY_REPLY_NODE", gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables[opType];
        
        var responseNode = responseObj.isAuthorize() ? jsonObj : jsonObj.ok;

        responseObj.setReferenceCode(responseNode[nodeName]["-orderCode"]);
        if (responseObj.isAuthorize()) {
            responseObj
                .setAuthorizationCode(responseNode[nodeName]["-orderCode"]);
        }
    }
    
    function handleFailure(responseObj, jsonObj) {
        var error = jsonObj ? jsonObj.error ? jsonObj.error["#cdata-section"] ? jsonObj.error["#cdata-section"] : new _5038.string.StringFormatter()
            .stringify(jsonObj.error) : new _5038.string.StringFormatter()
            .stringify(jsonObj) : "PGP005";
        responseObj.setDetails(error);
    }
    

    obj.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_4308.responsebuilder.WorldPayResponseBuilder.buildResponse");
        
        var responseObj = new _5038.response.Response();
        var responseBody = nlResponse.getBody() || "";
        responseObj
            .setAuthorize(request.getOperationType() === _CCP.GATEWAY_OPERATION_AUTHORIZATION);
        
        try {
            
            obj
                .logMessages(responseObj, _5038.string.StringFormatter()
                    .stringify(request.getHeader())
                                          + "\n"
                                          + nlapiEscapeXML(request.getPost()), nlapiEscapeXML(responseBody));
            
            var jsonObj = obj.parseResponse(responseBody).paymentService.reply;
            
            var success = isSuccess(jsonObj, request);
            responseObj.setSuccess(success);
            
            if (success && is3DSecure(jsonObj)) {
                handle3DSecure(responseObj, jsonObj);
            } else
                if (success) {
                    handleMOTO(request, responseObj, jsonObj);
                } else {
                    handleFailure(responseObj, jsonObj);
                }
            
        } catch (e) {
            nlapiLogExecution("ERROR", "Plugin Error", e);
            responseObj.setSuccess(false);
            responseObj.setDetails(e + "\n" + nlapiEscapeXML(responseBody));
        }
        return responseObj;
    };
    
    return obj;
};
