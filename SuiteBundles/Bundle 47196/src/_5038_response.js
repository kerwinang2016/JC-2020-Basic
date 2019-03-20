/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.response) {
    _5038.response = {};
}

_5038.response.Response = function() {
    
    var referenceCode = "";
    var authorizationCode = "";
    var rawRequest = "";
    var rawResponse = "";
    var parsedResponse;
    var details = "";
    var holdReason = "";
    var success = false;
    var pending = false;
    var authorize = false;
    var saveAuthorizationCode = false;
    var externalCheckout = false;
    var eCommerce = false;
    var payerAuthenticationURL = "";
    var paRequest = "";
    var requirePayerAuthentication = false;
    var authenticationParameters = {};
    
    this.getReferenceCode = function getReferenceCode() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getReferenceCode");
        
        return referenceCode;
    };
    
    this.getAuthorizationCode = function getAuthorizationCode() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getAuthorizationCode");
        
        return authorizationCode;
    };
    
    this.getRawRequest = function getRawRequest() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getRawRequest");
        
        return rawRequest;
    };
    
    this.getRawResponse = function getRawResponse() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getRawResponse");
        
        return rawResponse;
    };
    
    this.getParsedResponse = function getParsedResponse() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getRawResponse");
        
        return parsedResponse;
    };
    
    this.getDetails = function getDetails() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getDetails");
        
        return details;
    };
    
    this.getHoldReason = function getHoldReason() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.getHoldReason");
        
        return holdReason;
    };
    
    this.isSuccess = function isSuccess() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.isSuccess");
        
        return success;
    };
    
    this.isPending = function isPending() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.isPending");
        
        return pending;
    };
    
    this.isAuthorize = function isAuthorize() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.isAuthorize");
        
        return authorize;
    };
    
    this.isExternalCheckout = function isExternalCheckout() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.isExternalCheckout");
        
        return externalCheckout;
    };
    
    this.isSaveAuthorizationCode = function isSaveAuthorizationCode() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.isSaveAuthorizationCode");
        
        return saveAuthorizationCode;
    };
    
    this.getPayerAuthenticationURL = function getPayerAuthenticationURL() {
        return payerAuthenticationURL;
    };
    
    this.getPARequest = function getPARequest() {
        return paRequest;
    };
    
    this.needsPayerAuthentication = function needsPayerAuthentication() {
        return requirePayerAuthentication;
    };
    
    this.getAuthenticationParameters = function getAuthenticationParameters() {
        return authenticationParameters;
    };
    
    this.isECommerce = function isECommerce() {
        return eCommerce;
    };
    
    this.setReferenceCode = function setReferenceCode(newCode) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setReferenceCode");
        
        referenceCode = newCode;
        return this;
    };
    
    this.setAuthorizationCode = function setAuthorizationCode(newCode) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setAuthorizationCode");
        
        authorizationCode = newCode;
        return this;
    };
    
    this.setRawRequest = function setRawRequest(newRequest) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setRawRequest");
        
        rawRequest = newRequest;
        return this;
    };
    
    this.setParsedResponse = function setParsedResponse(newResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setParsedResponse");
        
        parsedResponse = newResponse;
        return this;
    };
    
    this.setRawResponse = function setRawResponse(newResponse) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setRawResponse");
        
        rawResponse = newResponse;
        return this;
    };
    
    this.setDetails = function setDetails(newDetails) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setDetails");
        
        details = newDetails;
        return this;
    };
    
    this.setHoldReason = function setHoldReason(newHoldReason) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setHoldReason");
        
        holdReason = newHoldReason;
        return this;
    };
    
    this.setSuccess = function setSuccess(isSuccess) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setSuccess");
        
        success = isSuccess;
        return this;
    };
    
    this.setPending = function setPending(isPending) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setPending");
        
        pending = isPending;
        return this;
    };
    
    this.setAuthorize = function setAuthorize(isAuthorize) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setAuthorize");
        
        authorize = isAuthorize;
        return this;
    };
    
    this.setSaveAuthorizationCode = function setSaveAuthorizationCode(isSaveAuthorizationCode) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setSaveAuthorizationCode");
        
        saveAuthorizationCode = isSaveAuthorizationCode;
        return this;
    };
    
    this.setExternalCheckout = function setExternalCheckout(isExternalCheckout) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.response.Response.setExternalCheckout");
        
        externalCheckout = isExternalCheckout;
        return this;
    };
    
    this.setPayerAuthenticationURL = function setPayerAuthenticationURL(url) {
        payerAuthenticationURL = url;
    };
    
    this.setPARequest = function setPARequest(key) {
        paRequest = key;
    };
    
    this.setNeedsPayerAuthentication = function setNeedsPayerAuthentication(required) {
        requirePayerAuthentication = required;
    };
    
    this.setAuthenticationParameters = function setAuthenticationParameters(object) {
        authenticationParameters = object;
    };

    this.setECommerce = function setECommerce(isECommerce) {
        eCommerce = isECommerce;
    };

    return this;
};