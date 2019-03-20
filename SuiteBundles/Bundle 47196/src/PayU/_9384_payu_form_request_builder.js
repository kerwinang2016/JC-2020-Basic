/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!_9384) {
    var _9384 = {};
}

if (!_9384.formrequestbuilder) {
    _9384.formrequestbuilder = {};
}

_9384.formrequestbuilder.PAYU_REQUEST_SECUREHASH_TEMPLATE = '{apiKey}~{merchantId}~{referenceCode}~{amount}~{currency}';

_9384.formrequestbuilder.PayUFormRequestBuilder = function PayUFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials) {

    var obj = _9384.formrequestbuilder
        .BaseFormRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
    
    obj.getFormParameters = function getFormParameters(input, responseUrls) {
        _5038.stacktrace.StackTrace
        .addLogEntry("_9384.requestbuilder.PayUFormRequestBuilder.getFormParameters");

        // get payment info needed in the form
        var gatewayConfigurationObj = gatewayConfiguration.GetAsObject();

        var gatewayProfileData = getProfileData(input);
        var customerData = dataAccessObject.RetrieveCustomerData().GetAsObject();
        var transactionData = dataAccessObject.RetrieveTransactionData().GetAsObject();

        var otherData = {};
        otherData['description'] = transactionData['transactionId'];
        otherData['signature'] = generatePayUFormSignature(_9384.formrequestbuilder.PAYU_REQUEST_SECUREHASH_TEMPLATE, 
                                                           gatewayProfileData,
                                                           transactionData);
        otherData['isTestMode'] = (gatewayConfigurationObj['isTestMode']) ? '1' : '0';
        otherData['algorithmSignature'] = 'SHA';
        otherData['language'] = getCustomerLanguage(obj["customerLanguage"]);

        var paymentFormData = {
            merchantId: gatewayProfileData['merchantId'],
            accountId: gatewayProfileData['accountId'],
            description: otherData['description'],
            referenceCode: transactionData['transactionId'],
            amount: transactionData['transactionAmount'],
            currency: transactionData['transactionCurrencyISO'],
            signature: otherData['signature'],
            buyerEmail: customerData['customerEmail'],
            gd:'',
            mobilePhone: customerData['customerBillingPhone'] ,
            billingAddress: customerData['customerBillingStreet'],
            billingCity: customerData['customerBillingCity'],
            billingCountry: customerData['customerBillingCountry'],
            zipCode: customerData['customerBillingZip'],
            payerDocument: otherData['payerDocument'],
            shippingAddress: customerData['customerShippingStreet1'],
            shippingCity: customerData['customerShippingCity'],
            shippingCountry: customerData['customerShippingCountry'],
            officeTelephone: customerData['customerBillingPhone'],
            telephone: customerData['customerBillingPhone'] ,
            responseUrl: responseUrls['returnUrl'],
            confirmationUrl: responseUrls['postBackUrl'],
            algorithmSignature: otherData['algorithmSignature'],
            lng: otherData['language'],
            tax: '0',
            taxReturnBase: '0',
            test: otherData['isTestMode'],
            extra1: transactionData['transactionPaymentRequestId'],
        };

        return paymentFormData;
    };
    
    function getProfileData(input) {
        // retrieve payment gateway hard-coded id's - permission is restricted, and USE ENCRYPTED FORMAT is checked in custom record type field record
        // DO NOT print this info in logs
        var gatewayProfileData = {};
        var profileExtRec = input.getProfileExtensionRecord();
        gatewayProfileData['merchantId'] = profileExtRec.getFieldValue('custrecord_payu_config_rec_merchant_id');
        gatewayProfileData['apiKey'] = profileExtRec.getFieldValue('custrecord_payu_config_rec_api_key');
        gatewayProfileData['accountId'] = profileExtRec.getFieldValue('custrecord_payu_config_rec_acct_id');
        return gatewayProfileData;
    }

    function generatePayUFormSignature(signatureTemplate, gatewayProfileData, transactionData) {
        var paymentSignatureDetails = {
            merchantId: gatewayProfileData['merchantId'] ,
            apiKey: gatewayProfileData['apiKey'],
            referenceCode: transactionData['transactionId'],
            amount: transactionData['transactionAmount'],
            currency: transactionData['transactionCurrencyISO'],
        };

        return obj.generateSignature(signatureTemplate, paymentSignatureDetails);
    }
    
    function getCustomerLanguage(language) {
        var acceptedLanguages = ['en', 'es', 'pt'];
        //TODO: defaults to en for now 
        var result = 'en';

        if (language) {
            language = language.substring(0, 2);
            language = language.toLowerCase();

            var acceptedLangIndx = acceptedLanguages.indexOf(language);
            if (acceptedLangIndx != -1) {
                result = acceptedLanguages[acceptedLangIndx];
            }
        }

        return result;
    }

    return obj;
    
};
