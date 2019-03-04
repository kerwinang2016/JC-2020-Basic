/**
 * © 2015 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */
if (!_9384) {
    var _9384 = {};
}

if (!_9384.responsebuilder) {
    _9384.responsebuilder = {};
}

_9384.responsebuilder.SIGNATURE_TEMPLATE = "{apiKey}~{merchantId}~{transactionId}~{amount}~{currency}~{state}";
_9384.responsebuilder.INVALID_SIGNATURE_MESSAGE = "Payment signature is not valid";
_9384.responsebuilder.PAYMENT_HOLD_MESSAGE = "Payment for this transaction is on hold due to pending confirmation from the gateway. To continue processing credit card payment, check first the payment status on the PayU gateway portal to determine the next action to take. To cancel the order or override the payment hold, see help topic Managing Payment Holds.";

_9384.responsebuilder.PAYU_APPROVED = 4;
_9384.responsebuilder.PAYU_DECLINED = 6;
_9384.responsebuilder.PAYU_PENDING = 7;
_9384.responsebuilder.PAYU_ERROR = 104;
_9384.responsebuilder.PAYU_EXPIRED = 5;


_9384.responsebuilder.PayUResponseBuilder = function PayUResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser) {
    var obj = new _5038.responsebuilder.AbstractResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);

    obj.buildResponseFromRedirectData = function buildResponseFromRedirectData(input, redirectData) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.PayUResponseBuilder.buildResponseFromRedirectData");

        nlapiLogExecution("AUDIT", "Raw Redirect Response", redirectData);

        var gatewayProfileData = getProfileData(input);
        var responseObj = new _5038.response.Response();

        try {
            redirectData = redirectData || "";
            var parsedData = obj.parseResponse(redirectData);

            responseObj.setRawResponse(redirectData);
            responseObj.setExternalCheckout(true);
            responseObj.setDetails(parsedData.lapResponseCode);

            var isSignatureValid = validateSignature({
                apiKey : gatewayProfileData.apiKey,
                merchantId : parsedData.merchantId,
                transactionId : parsedData.referenceCode,
                amount : roundRedirectAmount(parsedData.TX_VALUE),
                currency : parsedData.currency,
                state : parsedData.transactionState,
                signature : parsedData.signature,
            });
            
            if(!isSignatureValid){
				//TODO: Issue 502562: change status to FRAUDREJECTEXTERNAL when PayU changes the algorithm for response signature. 
            	responseObj.setSuccess(false);
                responseObj.setHoldReason('GENERAL_HOLD');
                responseObj.setDetails(_9384.responsebuilder.PAYMENT_HOLD_MESSAGE);
                
            } else if(parsedData.transactionState == _9384.responsebuilder.PAYU_APPROVED) {
                responseObj.setSuccess(true);

                var authCode = parsedData.reference_pol || "";
                var pnref = parsedData.transactionId || "";

                responseObj.setReferenceCode(pnref);
                responseObj.setSaveAuthorizationCode(true);
                responseObj.setAuthorizationCode(authCode);
                
            } else if( parsedData.transactionState == _9384.responsebuilder.PAYU_PENDING) {
                responseObj.setPending(true);
                responseObj.setHoldReason('CONFIRMATION_PENDING');
            } else if( parsedData.transactionState == _9384.responsebuilder.PAYU_EXPIRED) {
                responseObj.setSuccess(false);
                responseObj.setHoldReason('PAYMENT_TERMINATED');
            }  else if( parsedData.transactionState == _9384.responsebuilder.PAYU_ERROR) {
                responseObj.setPending(true);
                responseObj.setHoldReason('GATEWAYERROR');
            } else { // declined
                responseObj.setSuccess(false);
                responseObj.setHoldReason('FRAUDREJECTEXTERNAL');
            }

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
            .addLogEntry("_9384.responsebuilder.PayUResponseBuilder.buildResponseFromPostData");

        nlapiLogExecution("AUDIT", "Raw Postback Response", postData);

        var gatewayProfileData = getProfileData(input);
        var responseObj = new _5038.response.Response();

        try {
            postData = postData || "";
            var parsedData = obj.parseResponse(postData);

            responseObj.setRawResponse(postData);
            responseObj.setExternalCheckout(true);
            responseObj.setDetails(parsedData.response_message_pol);
            
            var isSignatureValid = validateSignature({
                apiKey : gatewayProfileData.apiKey,
                merchantId : parsedData.merchant_id,
                transactionId : parsedData.reference_sale,
                amount : roundPostbackAmount(parsedData.value),
                currency : parsedData.currency,
                state : parsedData.state_pol,
                signature : parsedData.sign,
            });

            if(!isSignatureValid){
                responseObj.setSuccess(false);
                responseObj.setHoldReason('FRAUDREJECTEXTERNAL');
                responseObj.setDetails(_9384.responsebuilder.INVALID_SIGNATURE_MESSAGE);
            } else if(parsedData.state_pol == _9384.responsebuilder.PAYU_APPROVED) {
                responseObj.setSuccess(true);

                var authCode = parsedData.reference_pol || "";
                var pnref = parsedData.transaction_id || "";

                responseObj.setReferenceCode(pnref);
                responseObj.setSaveAuthorizationCode(true);
                responseObj.setAuthorizationCode(authCode);
                return responseObj;
            } else if(parsedData.state_pol == _9384.responsebuilder.PAYU_EXPIRED) {
                responseObj.setSuccess(false);
                responseObj.setHoldReason('PAYMENT_TERMINATED');
            } else { // declined
                responseObj.setPending(true);
                responseObj.setHoldReason('GENERAL_HOLD');
            }

        } catch (e) {
            responseObj.setPending(true);
            responseObj.setHoldReason('SYSTEMERROR');
            responseObj.setDetails(postData);
        }

        return responseObj;
    };

    function getProfileData(input) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.PayUResponseBuilder.getProfileData");

        // DO NOT print this info in logs
        var gatewayProfileData = {};
        var profileExtRec = input.getProfileExtensionRecord();
        gatewayProfileData['merchantId'] = profileExtRec.getFieldValue('custrecord_payu_config_rec_merchant_id');
        gatewayProfileData['apiKey'] = profileExtRec.getFieldValue('custrecord_payu_config_rec_api_key');
        gatewayProfileData['accountId'] = profileExtRec.getFieldValue('custrecord_payu_config_rec_acct_id');
        return gatewayProfileData;
    }

    /*
    From PayU's specification
    Redirect response: Rounding rules
    - If the first decimal is even and the second is 5, round it to the lower value
    - If the first decimal is odd and the second is 5, round it to the higher value
    - Otherwise you must round it to the nearest decimal
    */
    function roundRedirectAmount(amount) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.PayUResponseBuilder.roundRedirectAmount");

        if (amount.toString().match(/.*\.[02468]5/)) {
            amount = Number(amount) - 0.05;
        }
        amount = (Math.round(amount * 10)/10);
        amount = Number(amount).toFixed(1);
        return amount;
    }

    /*
    From PayU's specification
    Postback response: Rounding rules
    - If the second decimal of the value parameter is zero, e.g. 150.00
         the parameter new_value to generate the signature should only have one decimal, as follows: 150.0
    - If the second decimal of the value parameter is different from zero, e.g. 150.26
         the parameter new_value to generate the signature should have two decimals, as follows: 150.26
    */
    function roundPostbackAmount(amount) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.PayUResponseBuilder.roundPostbackAmount");

        amount = Number(amount).toFixed(2);
        if (amount.toString().match(/(.*\.\d)0/)) {
            amount = amount.toString().replace(/(.*\.\d)0/, "$1");
        }
        return amount;
    }

    function validateSignature(data) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_9384.responsebuilder.PayUResponseBuilder.validateSignature");

        var stringFormatter = new _5038.string.StringFormatter(_9384.responsebuilder.SIGNATURE_TEMPLATE);
        var str = stringFormatter.replaceParameters(data).toString();

        var hashGenerator = new _9384.hashgenerator.SHA1();
        var sha1Hash = hashGenerator.generateHash(str);

        return (sha1Hash == data.signature);
    }

    return obj;
};
