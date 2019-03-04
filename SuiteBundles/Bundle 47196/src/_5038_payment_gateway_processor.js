/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */

//create package _5038.processor;
//confirm is credit card processing plugin still overwrite package
if (!_5038) {
    _5038 = {};
}

if (!_5038.processor) {
    _5038.processor = {};
}

_5038.processor.PaymentGatewayProcessor = (function() {
    
    function PaymentGatewayProcessor() {
        function loadClass(className) {
            _5038.stacktrace.StackTrace
                .addLogEntry("_5038.processor.PaymentGatewayProcessor.loadClass");
            
            return eval("(function (){return " + className + ";})()");
        }
        
        function getGatewayConfigurationObject(input) {
            return (new _5038.dataaccess.PaymentGatewayDataAccessObject(input))
                .RetrievePaymentGatewayConfiguration().GetAsObject();
        }
        
        this.getName = function getName(input, output) {
            _5038.stacktrace.StackTrace
                .addLogEntry("_5038.processor.PaymentGatewayProcessor.getName");
            
            var gatewayConfigurationObject = getGatewayConfigurationObject(input);
            
            output.setString(gatewayConfigurationObject.name);
            
        };
        
        this.getProperties = function getProperties(properties) {
            _5038.stacktrace.StackTrace
                .addLogEntry("_5038.processor.PaymentGatewayProcessor.getProperties");
            
            var dao = new _5038.dataaccess.PaymentGatewayDataAccessObject();
            var gatewayConfigurationObject = dao.RetrievePaymentGatewayConfiguration().GetAsObject();
            
            properties.setName(gatewayConfigurationObject.name);
            var gatewayProperties = gatewayConfigurationObject.properties;
            
            if(gatewayProperties && gatewayProperties.SupportedOperations){
            	properties.setSupportedOperations(gatewayProperties.SupportedOperations);
            }else{
            	properties.setSupportedOperations(["AUTHORIZATION","CAPTURE","SALE","REFUND"]);
            }
            
            // Set the static URL property only if the value is true
            var enableStaticPostbackURL = (gatewayProperties && gatewayProperties.StaticPostbackUrlEnabled === true);
            if (enableStaticPostbackURL) {
                properties.setStaticPostBackUrlIsRequired(enableStaticPostbackURL);
            }
        };
        
        function loadCredentials(input, gatewayConfigurationObject) {
            return new _5038.credential.Credentials(gatewayConfigurationObject.properties.CredentialRecord, input
                .getPartnerUniqueIdentifier());
        }
        
        this.displaySetup = function displaySetup(input, output) {
            _5038.stacktrace.StackTrace
                .addLogEntry("_5038.processor.PaymentGatewayProcessor.displaySetup");
            
            var gatewayConfigurationObject = getGatewayConfigurationObject(input);
            
            if(gatewayConfigurationObject.properties.ConfigRecordType){
                output.setProfileExtensionRecordType(gatewayConfigurationObject.properties.ConfigRecordType);
            }
            
            if(gatewayConfigurationObject.properties.Banner){
                var bannerProp = gatewayConfigurationObject.properties.Banner;
	        	var bannerMsg = ['<div class="uir-alert-box ',bannerProp.type,'">',
	        	                  '<div class="icon ',bannerProp.type,'">',
	        	                  '<img src="/images/icons/messagebox/icon_msgbox_',bannerProp.type,'.png">',
	        	                  '</div>',
	        	                  '<div class="content">',
	        	                  '<div class="title">',bannerProp.title,'</div>',
	        	                  '<div class="descr">',bannerProp.msg,
	        	                  '</div>','</div>','</div>','<br/>'].join('');
	        	output.setDescriptiveContent(bannerMsg);
            }
            
            if(gatewayConfigurationObject.properties.CredentialRecord){
                var credentials = loadCredentials(input, gatewayConfigurationObject);
                var credentialFields = gatewayConfigurationObject.credentialFields;
                var scriptId = nlapiGetContext().getScriptId();
                var domain = gatewayConfigurationObject.domains;
                
                for ( var i = 0; i < credentialFields.length; i++) {
                    output
                        .addCredentialField(credentialFields[i].id, credentialFields[i].label, domain, scriptId, credentials
                            .getValue(credentialFields[i].id));
                }            	
            }
            
        };
        
        this.processSetup = function processSetup(input, output) {
            _5038.stacktrace.StackTrace
                .addLogEntry("_5038.processor.PaymentGatewayProcessor.processSetup");

            var gatewayConfigurationObject = getGatewayConfigurationObject(input);
            
            if(gatewayConfigurationObject.properties.CredentialRecord){
                var credentials = loadCredentials(input, gatewayConfigurationObject);
                var credentialFields = gatewayConfigurationObject.credentialFields;
                
                for ( var i = 0; i < credentialFields.length; i++) {
                    credentials.setValue(credentialFields[i].id, input
                        .getCredentialFieldValue(credentialFields[i].id));
                }
                var puid = credentials.save();
                output.setPartnerUniqueIdentifier(puid);
            }
        };
        
        /**
         * Sends messages to the gateway (at least one).
         * 
         * So far only tracks the last response since we're only expecting a
         * single exchange with the gateway
         */
        function requestGatewayTransaction(input, output, operationType) {
            _5038.stacktrace.StackTrace
                .addLogEntry("_5038.processor.PaymentGatewayProcessor.requestGatewayTransaction");
            
            var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
            var gatewayConfiguration = gatewayDataAccessObject
                .RetrievePaymentGatewayConfiguration();
            
            var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);
            
            var dataAccessObject = classLoader.createTransactionDataAccessObject(input, gatewayConfiguration);

            var operation = retrieveGatewayOperationDetails(operationType, gatewayConfiguration, gatewayDataAccessObject, dataAccessObject);
            var urlArray = operation.paymentGatewayURL ? operation.paymentGatewayURL.paymentGatewayURLArray : [];
            var postTemplate = operation.paymentGatewayTemplate ? operation.paymentGatewayTemplate.template : [];
            var headerTemplate = (operation.header && operation.header.length > 0) ? operation.header : gatewayConfiguration
                .GetAsObject().headerTemplate;
            var credentials = classLoader.loadCredentials(input, gatewayConfiguration.GetAsObject());
            var requestBuilder = classLoader.createRequestBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, credentials);
            var parser = classLoader.createParser();
            var responseBuilder = classLoader.createResponseBuilder(dataAccessObject, gatewayDataAccessObject, gatewayConfiguration, parser);
            var messageHandler = new _5038.message.MessageHandler();
            var response = null;
            
            if (urlArray.length === 0) {
                throw nlapiCreateError("PGP004", "No gateway urls assigned to "
                                                 + gatewayConfiguration
                                                     .GetAsObject().name);
            }
            
            var requestParameters = requestBuilder.getDefaultParameters();
            for ( var i = 0; i < urlArray.length; i++) {
                var request = requestBuilder
                    .buildRequest(requestParameters, urlArray[i].operationURL, postTemplate, headerTemplate, operationType);
                var nlResponse = messageHandler.sendMessage(request, output);
                response = responseBuilder.getResponse(request, nlResponse, dataAccessObject);
                if (response.isSuccess()) {
                    break;
                }
            }
            
            return response;
        }
        
        function retrieveGatewayOperationDetails(operationType, gatewayConfiguration, gatewayDataAccessObject, dataAccessObject) {
        	var operationDetails = null;
        	var transactionDetails = dataAccessObject.RetrieveTransactionData().GetAsObject();
        	
        	if (transactionDetails) {
        		operationDetails = gatewayDataAccessObject
	                 .RetrievePaymentGatewayOperationDetails(operationType, gatewayConfiguration, transactionDetails.transactionIsRecurring)
	                 .GetAsObject();
        	}
        	
        	return operationDetails;
        }
        
        
        // do stuff here
        this.transact = function transact(input, output, operationType) {
            try {
                _5038.stacktrace.StackTrace
                    .addLogEntry("_5038.processor.PaymentGatewayProcessor.transact "
                                 + operationType);
                
                var response = requestGatewayTransaction(input, output, operationType);
                var responseHandler = new _5038.responsehandler.ResponseHandler();
                responseHandler.handleResponse(response, output.getResult());
            } catch (ex) {
                _5038.stacktrace.StackTrace
                    .logAndShowError(ex, nlobjError, null);
            }
        };
        
        
        this.transactByExtChckout = function transact(input, output, operationType) {
            try {
                _5038.stacktrace.StackTrace
                    .addLogEntry("_5038.processor.PaymentGatewayProcessor.transactByExtChckOut "
                                 + operationType);
                var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
                var gatewayConfiguration = gatewayDataAccessObject
                    .RetrievePaymentGatewayConfiguration();
                
                var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);
                var externalCheckoutProcessor = classLoader.createExternalCheckoutProcessor(input, output, operationType); 
                externalCheckoutProcessor.execute();
                
            } catch (ex) {
                _5038.stacktrace.StackTrace
                    .logAndShowError(ex, nlobjError, null);
            }
        };
        
        this.validatePostBack = function(input,output){
            try {
                _5038.stacktrace.StackTrace
                    .addLogEntry("_5038.processor.PaymentGatewayProcessor.validatePostBack");
                var gatewayDataAccessObject = new _5038.dataaccess.PaymentGatewayDataAccessObject(input);
                var gatewayConfiguration = gatewayDataAccessObject
                    .RetrievePaymentGatewayConfiguration();
                
                var classLoader = new _5038.classloader.ClassLoader(gatewayConfiguration);
                var externalCheckoutProcessor = classLoader.createExternalCheckoutProcessor(input, output); 
                externalCheckoutProcessor.validatePostBack(input, output);
                
            } catch (ex) {
                _5038.stacktrace.StackTrace
                    .logAndShowError(ex, nlobjError, null);
            }
        };
        
        return this;
    }
    
    return PaymentGatewayProcessor;
})();
