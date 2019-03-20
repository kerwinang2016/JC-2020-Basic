if (!_7939) {
    var _7939 = {};
}

if (!_7939.processor) {
	_7939.processor = {};
}

_7939.processor.OperationProcessor = function OperationProcessor(output) {
	
    this.retrieveGatewayOperationDetails = function retrieveGatewayOperationDetails(gatewayOperationType, gatewayConfiguration, gatewayDataAccessObject, dataAccessObject){
    	_5038.stacktrace.StackTrace
    		.addLogEntry("_7939.processor.OperationProcessor.retrieveGatewayOperationDetails");
    	
    	var operationDetails = null;
    	var transactionDetails = dataAccessObject.RetrieveTransactionData().GetAsObject();
    	
    	if (transactionDetails) {
    		operationDetails = gatewayDataAccessObject
                 .RetrievePaymentGatewayOperationDetails(gatewayOperationType, gatewayConfiguration, transactionDetails.transactionIsRecurring)
                 .GetAsObject();
    	}
    	return operationDetails;
    };
    
    this.executeOperation = function executeOperation(operationType, gatewayConfiguration, gatewayDataAccessObject, dataAccessObject, requestBuilder, responseBuilder, requestParameters){
        _5038.stacktrace.StackTrace
         	.addLogEntry("_7939.processor.OperationProcessor.executeOperation");
    	 
    	var operation = this.retrieveGatewayOperationDetails(operationType, gatewayConfiguration, gatewayDataAccessObject, dataAccessObject);
         
     	var urlArray = operation.paymentGatewayURL ? operation.paymentGatewayURL.paymentGatewayURLArray : [];
        var postTemplate = operation.paymentGatewayTemplate ? operation.paymentGatewayTemplate.template : [];
        var headerTemplate = (operation.header && operation.header.length > 0) ? operation.header : gatewayConfiguration
            .GetAsObject().headerTemplate;
        
        var messageHandler = new _5038.message.MessageHandler();
        var response = null;
        
        if (urlArray.length === 0) {
            throw nlapiCreateError("PGP004", "No gateway urls assigned to "
                                             + gatewayConfiguration
                                                 .GetAsObject().name);
        }
        
        for ( var i = 0; i < urlArray.length; i++) {
            var request = requestBuilder
                .buildRequest(requestParameters, urlArray[i].operationURL, postTemplate, headerTemplate, operationType);
            var nlResponse = messageHandler.sendMessage(request, output);
            response = responseBuilder.buildResponse(request, nlResponse);
            if (response.isSuccess()) {
                break;
            }
        }
        return response;
    };

    return this;
};
