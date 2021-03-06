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
	holdPayment(output);
};

function capture(input, output) {
	holdPayment(output);
};

function sale(input, output) {
	holdPayment(output);
};

function refund(input, output) {
	holdPayment(output);
};

function holdPayment(output){
	var result = output.getResult();
	var holddetails = 'Payment for this transaction is on hold due to an ongoing integration update of VeriTrans payment gateway. To continue processing credit card payment, edit the transaction and use another payment processing profile.';
	result.setStatus('GENERAL_HOLD');
	result.setStatusDetails(holddetails);
	result.setExternalRejectMessageForFailure(holddetails);
};