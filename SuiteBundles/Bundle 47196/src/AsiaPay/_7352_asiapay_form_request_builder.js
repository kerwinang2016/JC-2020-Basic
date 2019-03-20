/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!_7352) {
    var _7352 = {};
}

if (!_7352.formrequestbuilder) {
    _7352.formrequestbuilder = {};
}

_7352.formrequestbuilder.ASIAPAY_REQUEST_SECUREHASH_TEMPLATE = '{merchantId}|{merchantReference}|{currencyCode}|{amount}|{paymentType}|{secureHashSecret}';

_7352.formrequestbuilder.AsiaPayFormRequestBuilder = function AsiaPayFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {
    
    var obj = _9384.formrequestbuilder
        .BaseFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    obj.variables = null;
    
    obj.getFormParameters = function getFormParameters(input, responseUrls) {
        _5038.stacktrace.StackTrace
        .addLogEntry("_7352.requestbuilder.AsiaPayFormRequestBuilder.getFormParameters");

        var gatewayProfileData = getProfileData(input);
        var transactionData = dataAccessObject.RetrieveTransactionData().GetAsObject();
        var accountSettings = dataAccessObject.RetrieveAccountSettings().GetAsObject();

        var otherData = {};
        otherData['language'] = getGatewayVariable("ASIAPAY_LANGUAGE", accountSettings.language) || 'E'; // defaults to E or English
        otherData['currencyCode'] = getGatewayVariable("ASIAPAY_CURR_CODE", transactionData.transactionCurrencyISO);
        otherData['servicePlatform'] = getGatewayVariable("ASIAPAY_SERVICE", gatewayProfileData.service);
        otherData['paymentType'] = 'N'; // N for sale, H for authorize
        otherData['transactionReference'] = transactionData.transactionInternalId + '-' + transactionData.transactionId;
        otherData['secureHash'] = generateAsiaPaySignature(_7352.formrequestbuilder.ASIAPAY_REQUEST_SECUREHASH_TEMPLATE,
                                                           gatewayProfileData,
                                                           transactionData,
                                                           otherData);
        var timeoutTag = '<input type="hidden" name="timeoutValue" value="' + gatewayProfileData.timeoutValue + '">';
        otherData['timeoutTag'] = gatewayProfileData.timeoutValue ? timeoutTag : '';

        var paymentFormData = {
            orderRef: otherData.transactionReference,
            currCode: otherData.currencyCode,
            amount: transactionData.transactionAmount,
            remark: transactionData.transactionPaymentRequestId,
            lang: otherData.language,
            cancelUrl: responseUrls['returnUrl'] + '&result=cancel',
            failUrl: responseUrls['returnUrl'] + '&result=fail',
            successUrl: responseUrls['returnUrl'] + '&result=success',
            merchantId: gatewayProfileData.merchantId,
            payType: otherData.paymentType, 
            payMethod: 'ALL',
            secureHash: otherData.secureHash,
            installment_service: gatewayProfileData.installmentEnabled,
            timeoutTag: otherData.timeoutTag,
            servicePlatform: otherData.servicePlatform,
            failRetry: 'no',
        };

        return paymentFormData;
    };

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

    function getProfileData(input) {
        // retrieve payment gateway hard-coded id's - permission is restricted, and USE ENCRYPTED FORMAT is checked in custom record type field record
        // DO NOT print this info in logs
        var gatewayProfileData = {};
        var profileExtRec = input.getProfileExtensionRecord();
        gatewayProfileData['merchantId'] = profileExtRec.getFieldValue('custrecord_asiapay_conf_rec_merchant_id');
        gatewayProfileData['secureHashSecret'] = profileExtRec.getFieldValue('custrecord_asiapay_conf_rec_hash_secret');
        gatewayProfileData['installmentEnabled'] = profileExtRec.getFieldValue('custrecord_asiapay_conf_rec_installment');
        gatewayProfileData['timeoutValue'] = profileExtRec.getFieldValue('custrecord_asiapay_conf_rec_timeout');
        gatewayProfileData['service'] = profileExtRec.getFieldText('custrecord_asiapay_conf_rec_service');

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

    return obj;
    
};
