/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.

 * 

 * @author aalcabasa

 */

if (!_5038) {

    var _5038 = {};

}



if (!_5038.responsehandler) {

    _5038.responsehandler = {};

}



_5038.responsehandler.ResponseHandler = function ResponseHandler() {

    

    function handleStandardTrans(response, result) {

        _5038.stacktrace.StackTrace

            .addLogEntry("_5038.responsehandler.ResponseHandler.handleStandardTrans");

        result.setStatus("ACCEPT");

        result.setReferenceCode(response.getReferenceCode());

        

        if (response.isAuthorize() || response.isSaveAuthorizationCode() ) {

            result.setAuthorizationCode(response.getAuthorizationCode());

        }



        result.setAnExternalSystemWasContacted(response.isExternalCheckout());



    }

    

    function handlePayerAuthentication(response, result) {

        _5038.stacktrace.StackTrace

            .addLogEntry("_5038.responsehandler.ResponseHandler.handle3DTrans");

        

        throw nlapiCreateError("PGP008", "");

        

        /* 2nd parameter md is specific to a single gateway (cybersource?) */

        result

            .doPayerAuthentication(response.getPayerAuthenticationURL(), null, response

                .getPARequest(), null);

    }

    

    function handleSuccess(response, result) {

        _5038.stacktrace.StackTrace

            .addLogEntry("_5038.responsehandler.ResponseHandler.handleSuccess");

        

        if (response.needsPayerAuthentication()) {

            handlePayerAuthentication(response, result);

        } else {

            handleStandardTrans(response, result);

        }

    }


    function handleFailure(response, result) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.responsehandler.ResponseHandler.handleFailure");

        var holdReason = response.getHoldReason();
        var status = "REJECT";

        if (response.isECommerce()) {
            holdReason = holdReason || 'FATAL_ERROR';
            result.setExternalRejectMessageForFailure(_CCP.WEBSTORE_REJECT_MESSAGE);
        } else if (response.isAuthorize()) {
            status = "HOLD";
            holdReason = holdReason || 'AUTHORIZATION';
        } else {
            holdReason = holdReason || 'FRAUDREJECTEXTERNAL';
        }

        result.setStatus(holdReason);
        result.setStatusDetails(response.getDetails());
    }

    function handlePending(response, result) {

        _5038.stacktrace.StackTrace

            .addLogEntry("_5038.responsehandler.ResponseHandler.handlePending");

        
        var holdReason = response.getHoldReason();
        
        result.setStatus(holdReason);
        
        result.setStatusDetails(response.getDetails());

    }

    this.handleResponse = function handleResponse(response, result) {

        _5038.stacktrace.StackTrace

            .addLogEntry("_5038.responsehandler.ResponseHandler.handleResponse");

        

        result.setRequest(response.getRawRequest());

        result.setResponse(response.getRawResponse());

        

        if (response.isPending()) {

            handlePending(response, result);

        } else if (response.isSuccess()) {

            handleSuccess(response, result);

        } else {

            handleFailure(response, result);

        }

        

    };

    

    return this;

    

};
