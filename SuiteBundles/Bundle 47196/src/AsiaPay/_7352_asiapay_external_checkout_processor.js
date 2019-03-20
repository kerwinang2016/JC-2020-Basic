/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!_7352) {
    var _7352 = {};
}

if (!_7352.processor) {
    _7352.processor = {};
}

_7352.processor.ASIAPAY_RESPONSE_SIGNATURE_TEMPLATE = '{src}|{prc}|{successcode}|{Ref}|{PayRef}|{Cur}|{Amt}|{payerAuth}|{secureHashSecret}';


_7352.processor.AsiaPayExternalCheckoutProcessor = function AsiaPayExternalCheckoutProcessor(input, output, paymentOperationType) {
    _5038.stacktrace.StackTrace
        .addLogEntry("_7352.processor.AsiaPayExternalCheckoutProcessor");

    var obj = _7939.processor.BaseExternalCheckoutProcessor(input, output);

    obj.validatePostBack = function validatePostBack(input, output){
        _5038.stacktrace.StackTrace
            .addLogEntry("_7352.processor.AsiaPayExternalCheckoutProcessor.validatePostBack");

        var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
        var gatewayConfiguration = gatewayDataAccessObject.RetrievePaymentGatewayConfiguration();
        var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);
        var parser = classLoader.createParser();
        
        var body = input.getBody();
        var jsonBody = parser.parse(body);

        var gatewayProfileData = getProfileData(input);
        var isSignatureValid = validateSignature(_7352.processor.ASIAPAY_RESPONSE_SIGNATURE_TEMPLATE, gatewayProfileData, jsonBody);

        var status = null;
        var responseMessage = null;
        if (isSignatureValid) {
            var transactionKey = parseTransactionKey(jsonBody.Ref);
            output.setPaymentRequestId(jsonBody.remark);
            output.setTransactionKey(transactionKey);
            output.setUpdateData(body);
            status = 'ACCEPT';
            responseMessage = 'OK';
        } else {
            output.getResponse().setErrorCode(_CCP.VALIDATE_POSTBACK_UNAUTHORIZE_CODE);
            status = 'REJECT';
            responseMessage = _CCP.VALIDATE_POSTBACK_UNAUTHORIZE_MESSAGE;
        }

        output.setStatus(status);
        output.getResponse().write(responseMessage);
    };

    // Parse key 101 from TransactionReference 101-SO123
    function parseTransactionKey(transactionReference) {
        var transactionKey = null;
        var refArray = transactionReference.split('-');

        if (refArray != null && refArray[0]) {
            transactionKey = refArray[0];
        }

        return transactionKey;
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

    function validateSignature(signatureTemplate, gatewayProfileData, jsonBody) {
        jsonBody.secureHashSecret = gatewayProfileData.secureHashSecret;
        
        var hashGenerator = new _9384.hashgenerator.SHA1();
        var signatureGenerator = new _7352.signaturegenerator.SignatureGenerator(hashGenerator);

        var signature = signatureGenerator.generateSignature(signatureTemplate, jsonBody);
        return (jsonBody && jsonBody.secureHash == signature);
    }

    return obj;
};
