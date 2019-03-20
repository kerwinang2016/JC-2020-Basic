/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!_12268) {
    var _12268 = {};
}

if (!_12268.processor) {
	_12268.processor = {};
}


_12268.processor.PayUExternalCheckoutProcessor = function PayUExternalCheckoutProcessor(input, output, paymentOperationType) {
    _5038.stacktrace.StackTrace
        .addLogEntry("_12268.processor.PayUExternalCheckoutProcessor");

    var obj = _7939.processor.BaseExternalCheckoutProcessor(input, output);

    obj.validatePostBack = function validatePostBack(input, output){
    	_5038.stacktrace.StackTrace
            .addLogEntry("_12268.processor.PayUExternalCheckoutProcessor.validatePostBack");

        var parser = new _5038.parser.URLStringParser();
        var body = input.getBody();
        var jsonBody = parser.parse(body);

        output.setPaymentRequestId(jsonBody.extra1);
        output.setStatus('ACCEPT');
        output.setUpdateData(body);
        output.getResponse().write('OKAY');
    };

    return obj;
};