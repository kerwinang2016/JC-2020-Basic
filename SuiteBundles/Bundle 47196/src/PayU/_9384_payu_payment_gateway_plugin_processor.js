/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 */

// For some reason, plugin does not accept "funcName =
// SecurePayPlugin.FuncName;" function declaration.

function getProperties(properties) {
	(new _5038.processor.PaymentGatewayProcessor()).getProperties(properties);
};

function getName(input, output) {
}; //FIXME: this is to be deprecated but must still be defined in the plug-in with empty body. See Issue:372512

function displaySetup(input, output) {
    (new _5038.processor.PaymentGatewayProcessor()).displaySetup(input, output);
};

function processSetup(input, output) {
    (new _5038.processor.PaymentGatewayProcessor()).processSetup(input, output);
};

function authorization(input, output) {
    (new _5038.processor.PaymentGatewayProcessor())
        .transact(input, output, _CCP.GATEWAY_OPERATION_AUTHORIZATION);
};

function capture(input, output) {
    (new _5038.processor.PaymentGatewayProcessor())
        .transact(input, output, _CCP.GATEWAY_OPERATION_CAPTURE);
};

function sale(input, output) {
    
    if( input.getTransactionDetails().getPaymentMethodObject().getType() == _CCP.EXTERNAL_CHECKOUT){
        (new _5038.processor.PaymentGatewayProcessor())
            .transactByExtChckout(input, output, _CCP.GATEWAY_OPERATION_PAYMENT);
    }
    else{
        (new _5038.processor.PaymentGatewayProcessor())
            .transact(input, output, _CCP.GATEWAY_OPERATION_PAYMENT);
    }
};

function credit(input, output) {
	(new _5038.processor.PaymentGatewayProcessor())
        .transact(input, output, _CCP.GATEWAY_OPERATION_CREDIT);
};

function refund(input, output) {
    (new _5038.processor.PaymentGatewayProcessor())
        .transact(input, output, _CCP.GATEWAY_OPERATION_REFUND);
};

function validatePostBack(input, output){
    (new _5038.processor.PaymentGatewayProcessor())
        .validatePostBack(input, output);
}