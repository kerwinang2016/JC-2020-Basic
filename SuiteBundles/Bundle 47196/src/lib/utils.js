/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_CCP) {
    var _CCP = {};
}

_CCP.logAndShowError = function logAndShowError(exceptionObject, nsObjError, resourceFile) {
    var errorMsgLogForUser = "";
    var errorMsgLogForAdmin = "";
    var errorCode = !resourceFile ? "PAYMENT GATEWAY ERROR" : resourceFile.GLOBAL_TRY_CATCH.title;
    var errorHeading = !resourceFile ? " [ERROR ENCOUNTERED] - " : resourceFile.GLOBAL_TRY_CATCH['messages'].ERROR_HEADING.message;
    var errorTriggeredByUser = !resourceFile ? "TRIGGERED BY USER: " : resourceFile.GLOBAL_TRY_CATCH['messages'].ERROR_TRIGGER.message;
    var errorTriggeredByScript = 'SCRIPT ID: ';
    var userName = nlapiGetContext().getName();
    var scriptId = nlapiGetContext().getScriptId() || "";
    var scriptStackTrace = [
        'SCRIPT STACK TRACE: <br/>',
        _CCP.logEntries.join("<br/>")].join("");
    
    if (exceptionObject instanceof nsObjError) {
        errorMsgLogForUser = [
            'CODE: ',
            exceptionObject.getCode(),
            '\n',
            'DETAILS: ',
            exceptionObject.getDetails(),
            '\n'].join("");
        errorMsgLogForAdmin = [
            'CODE: ',
            exceptionObject.getCode(),
            '<br/>',
            'DETAILS: ',
            exceptionObject.getDetails(),
            '<br/>',
            'STACK TRACE:\n',
            (exceptionObject.getStackTrace()),
            '<br/>'].join("");
    } else {
        errorMsgLogForUser = ['DETAILS: ', exceptionObject.rhinoException, '\n']
            .join("");
        errorMsgLogForAdmin = [
            "DETAILS: ",
            exceptionObject.rhinoException,
            '<br/>',
            "STACK:\n",
            (exceptionObject.stack)].join("");
    }
    
    // LOG error for administrator
    nlapiLogExecution("SYSTEM", errorCode, [
        errorHeading + errorCode,
        "<br/>",
        errorTriggeredByUser,
        userName,
        "<br/>",
        errorTriggeredByScript,
        scriptId,
        "<br/>",
        errorMsgLogForAdmin,
        scriptStackTrace].join(""));
    
    // THROW error for user
    throw nlapiCreateError(errorCode, [
        errorHeading + errorCode,
        "\n",
        errorTriggeredByUser,
        userName,
        "\n",
        errorTriggeredByScript,
        scriptId,
        "\n",
        errorMsgLogForUser].join(""));
};

_CCP.addLogEntry = function addLogEntry(functionName) {
    if (!_CCP.logEntries) {
        _CCP.initializeLogs();
    }
    _CCP.logEntries.push("Order: " + (++_CCP.logSequence)
                         + " | Function called: " + functionName + "");
};

_CCP.initializeLogs = function initializeLogs(functionName) {
    _CCP.logEntries = [];
    _CCP.logSequence = 0;
};

_CCP.encodeHTML = function encodeHTML(input) {
    return input.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};


_CCP.decodeHTML = function decodeHTML(input) {
    return input.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&amp;/g, '&');
};

_CCP.hideCardNumbers = function hideCardNumbers(input, cardNumber) {
    var regex = /([0-9]{12})([0-9]{4})/g;
    if (!!cardNumber) {
        regex = new RegExp("(" + cardNumber.substring(0, 12) + ")" + "("
                           + cardNumber.substring(12) + ")", "g");
    }
    
    return input.toString().replace(regex, "************$2");
};

_CCP.getGMT = function getGMT(){
    var date = new Date();
    //Adjust timezone
    //date.setUTCMinutes(date.getUTCMinutes() - date.getTimezoneOffset());

    var s = "";
    s += SFC2.Pad(date.getUTCFullYear(), 4);
    s += SFC2.Pad(date.getUTCMonth() + 1, 2);
    s += SFC2.Pad(date.getUTCDate(), 2);
    s += SFC2.Pad(date.getUTCHours(), 2);
    s += SFC2.Pad(date.getUTCMinutes(), 2);
    s += SFC2.Pad(date.getUTCSeconds(), 2);
    s += SFC2.Pad(date.getUTCMilliseconds(), 3);

    return s;
};