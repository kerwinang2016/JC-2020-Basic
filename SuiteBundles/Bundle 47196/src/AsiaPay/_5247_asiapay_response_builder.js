/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5247) {
    var _5247 = {};
}

if (!_5247.responsebuilder) {
    _5247.responsebuilder = {};
}

_5247.responsebuilder.POSTBACK_ASIAPAY_SUCCESS = 0;

_5247.responsebuilder.AsiaPayResponseBuilder = function AsiaPayResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {

    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);

    obj.buildResponse = function buildResponse(request, nlResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5247.requestbuilder.AsiaPayResponseBuilder.buildResponse");

        var responseObj = new _5038.response.Response();
        var responseBody = nlResponse.getBody() || "{}";

        obj.logMessages(responseObj, request.getURL(), responseBody, gatewayConfiguration);

        responseObj
            .setAuthorize(request.getOperationType() === _CCP.GATEWAY_OPERATION_AUTHORIZATION);

        try {
            var jsonObj = obj.parseResponse(responseBody);
            var paymentOperation = responseObj.isAuthorize()
                                   || (request.getOperationType() === _CCP.GATEWAY_OPERATION_PAYMENT);
            var success = jsonObj[paymentOperation ? "successcode" : "resultCode"] === "0";
            responseObj.setSuccess(success);

            if (success) {
                responseObj
                    .setReferenceCode(jsonObj[paymentOperation ? "PayRef" : "payRef"]);
                if (responseObj.isAuthorize()) {
                    responseObj.setAuthorizationCode(jsonObj["AuthId"]);
                }
            } else {
                responseObj.setDetails(jsonObj.errMsg);
            }
        } catch (e) {
            nlapiLogExecution("ERROR", "Error Details", e);
            responseObj.setSuccess(false);
            responseObj.setDetails(e);
        }
        return responseObj;

    };

    obj.buildResponseFromRedirectData = function buildResponseFromRedirectData(input, redirectData) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.AsiaPayResponseBuilder.buildResponseFromRedirectData");

        nlapiLogExecution("AUDIT", "Raw Redirect Response", redirectData);

        var responseObj = new _5038.response.Response();

        try {
            redirectData = redirectData || "";
            var parsedData = obj.parseResponse(redirectData);
            var transactionResult = parsedData.result;

            responseObj.setRawResponse(redirectData);
            responseObj.setExternalCheckout(true);

            responseObj.setPending(true);
            responseObj.setHoldReason('CONFIRMATION_PENDING');
            responseObj.setDetails('Awaiting payment or payment confirmation');

        } catch (e) {
            nlapiLogExecution('ERROR', 'buildResponseFromRedirectData', e);
            responseObj.setPending(true);
            responseObj.setHoldReason('SYSTEMERROR');
            responseObj.setDetails(redirectData);
        }

        return responseObj;
    };

    obj.buildResponseFromPostData = function buildResponseFromPostData(input, postData) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.AsiaPayResponseBuilder.buildResponseFromPostData");

        nlapiLogExecution("AUDIT", "Raw Postback Response", postData);

        var responseObj = new _5038.response.Response();

        try {
            postData = postData || "";
            var parsedData = obj.parseResponse(postData);

            responseObj.setRawResponse(postData);
            responseObj.setExternalCheckout(true);

            var prc = parsedData.prc;

            if(prc == _5247.responsebuilder.POSTBACK_ASIAPAY_SUCCESS) {
                responseObj.setSuccess(true);
                var pnref = parsedData.PayRef || "";
                var authCode = parsedData.AuthId || "";

                responseObj.setReferenceCode(pnref);
                responseObj.setAuthorizationCode(authCode);
                responseObj.setSaveAuthorizationCode(true);
            }
            else {
                responseObj.setSuccess(false);
                responseObj.setHoldReason('FRAUDREJECTEXTERNAL');
                responseObj.setDetails(obj.getPrcDescription(prc));
            }

        } catch (e) {
            responseObj.setPending(true);
            responseObj.setHoldReason('SYSTEMERROR');
            responseObj.setDetails(postData);
        }

        return responseObj;
    };


    obj.getPrcDescription = function getPrcDescription(prc) {
        var prcDescVariables = gatewayDataAccessObject
            .RetrievePaymentGatewayVariablesByType('ASIAPAY_PRC_DESC', gatewayConfiguration
                .GetAsObject().internalId).GetAsObject().variables;

        var prcDescription = prcDescVariables[prc] || 'Other Error from Gateway';

        return prcDescription;
    };

    return obj;
};
