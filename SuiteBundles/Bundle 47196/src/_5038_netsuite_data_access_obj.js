/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author mmoya
 */
/**
 * Contains classes and functions for retrieving data from NetSuite
 * 
 * Version        Date            Author            Remarks
 * 1.00           26 Sep 2013     mmoya            Initial version
 * 2.00            07 Oct 2013        mmoya            Refactored to put all NS calls in the DataAccess class
 *
 */

var _5038;

if (!_5038) {
    _5038 = {};
}

_5038.dataaccess = {};

_5038.dataaccess.CreditCardData = function CreditCardData(cardDetails) {
    
    // set the data
    this.dataContainer = cardDetails;
    
    this.GetAsObject = function getAsObject() { 
        return this.dataContainer; };
        
    return this;
};

_5038.dataaccess.CustomerData = function CustomerData(customerDataObj) {
    // set the data
    this.dataContainer = customerDataObj;
    
    this.GetAsObject = function GetAsObject() {
        return this.dataContainer;
    }; 
    
    return this;
};

_5038.dataaccess.TransactionData = function TransactionData(transactionDataObj) {
       
    // set the data
    this.dataContainer = transactionDataObj;
    
    this.GetAsObject = function getAsObject() {
        return this.dataContainer;
    };
    
    return this;
};

_5038.dataaccess.AccountSettings = function AccountSettings(accountSettingsObj) {
    
    // set the data
    this.dataContainer = accountSettingsObj;
    
    this.GetAsObject = function getAsObject() {
        return this.dataContainer;
    };
    
    return this;
};

_5038.dataaccess.PaymentGatewayConfiguration = function PaymentGatewayConfiguration(scriptId, testMode, record) {
    var dataContainer = {};
    
    dataContainer.scriptId = scriptId;
    dataContainer.isTestMode = testMode;
    dataContainer.internalId = record.getId();
    dataContainer.name = record.getFieldValue('name');
    dataContainer.testDomain = record.getFieldValue(_CCP.CUST_FIELD_PREFIX + 'test_domain') || '';
    dataContainer.liveDomain = record.getFieldValue(_CCP.CUST_FIELD_PREFIX + 'live_domain') || '';
    dataContainer.domains = dataContainer.testDomain === dataContainer.liveDomain ? [dataContainer.testDomain] : [dataContainer.testDomain, dataContainer.liveDomain];
    dataContainer.headerTemplate = record.getFieldValue(_CCP.CUST_FIELD_PREFIX + 'header') || '';
    dataContainer.isPadDateValues = record.getFieldValue(_CCP.CUST_FIELD_PREFIX + "gateway_pad_date") === "T";
    dataContainer.propertiesString = record.getFieldValue(_CCP.CUST_FIELD_PREFIX + 'gateway_properties')  || '';
    dataContainer.credentialFields = setCredentials();
    
    if (dataContainer.propertiesString != null && dataContainer.propertiesString != '') {
        dataContainer.properties = JSON.parse(dataContainer.propertiesString);
    } else {
        dataContainer.properties = {};
    }
    
    function getAsObject() {
        return dataContainer;
    }
    
    function getRequestBuilder() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }
        
        if (!dataContainer.properties.RequestBuilder || dataContainer.properties.RequestBuilder == null) {
            return "_5038.requestbuilder.BaseRequestBuilder";
        }
        
        return dataContainer.properties.RequestBuilder;
    }
    
    function getFormRequestBuilder() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
            throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
       }
       
       if (!dataContainer.properties.FormRequestBuilder || dataContainer.properties.FormRequestBuilder == null) {
           return "_9384.formrequestbuilder.BaseFormRequestBuilder";
       }
       
       return dataContainer.properties.FormRequestBuilder;
    }
    
    function getParser() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '' ||
            !dataContainer.properties.Parser || dataContainer.properties.Parser == null) {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }
        
        return dataContainer.properties.Parser;
    }
    
    function getResponseBuilder() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '' ||
            !dataContainer.properties.ResponseBuilder  || dataContainer.properties.ResponseBuilder == null) {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }
        
        return dataContainer.properties.ResponseBuilder;
    }
    
    function getExternalCheckoutProcessor() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }

        if (!dataContainer.properties.ExternalCheckoutProcessor  || dataContainer.properties.ExternalCheckoutProcessor == null) {
            return "_7939.processor.BaseExternalCheckoutProcessor";
        }

        return dataContainer.properties.ExternalCheckoutProcessor;
    }
    
    function getTransactionDataAccessObject() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }
        
        if (!dataContainer.properties.TransactionDataAccessObject  || dataContainer.properties.TransactionDataAccessObject == null) {
            return "_5038.dataaccess.BaseTransactionDataAccessObject";
        }
        
        return dataContainer.properties.TransactionDataAccessObject;
    }
    
    function setCredentials() {
        var credentialsArray = [];
        var sublistName = _CCP.CUST_REC_MACH_PREFIX + "add_cred_gateway";
        
        for (var i = 1; i <= record.getLineItemCount(sublistName); i++) {
            credentialsArray.push({
                internalId : parseInt(record.getLineItemValue(sublistName, "id", i), 10),
                label : record.getLineItemValue(sublistName, _CCP.CUST_FIELD_PREFIX + "add_cred_label", i),
                id: record.getLineItemValue(sublistName, _CCP.CUST_FIELD_PREFIX + "gateway_cred_id", i), 
                paramKey: record.getLineItemValue(sublistName, _CCP.CUST_FIELD_PREFIX + "add_cred_param_key", i), 
            });
        }
        
        credentialsArray.sort(function sortCredentials(credA, credB){
            return credA.internalId > credB.internalId ? 1 : -1;
        });
        
        return credentialsArray;
    }
    
    function getSecurityCodeName() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }
        
        if (!dataContainer.properties.SecurityCodeName  || dataContainer.properties.SecurityCodeName == null) {
            return "";
        }
        
        return dataContainer.properties.SecurityCodeName;
    }
    
    function getPostBackTimeout() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
             throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }
        
        if (!dataContainer.properties.PostBackTimeout  || dataContainer.properties.PostBackTimeout == null) {
            return _CCP.POSTBACK_TIMEOUT;
        }
        
        return dataContainer.properties.PostBackTimeout;
    }

    function getHashGenerator() {
        if (dataContainer.propertiesString == null || dataContainer.propertiesString == '') {
            throw nlapiCreateError("PGP003", "Please define Properties for the Payment Gateway Configuration.");
        }

        if (!dataContainer.properties.HashGenerator || dataContainer.properties.HashGenerator == null) {
           return "_9384.hashgenerator.SHA1";
        }

        return dataContainer.properties.HashGenerator;
    }

    this.GetAsObject = getAsObject;
    this.GetRequestBuilder = getRequestBuilder;
    this.GetFormRequestBuilder = getFormRequestBuilder;
    this.GetResponseBuilder = getResponseBuilder;
    this.GetExternalCheckoutProcessor = getExternalCheckoutProcessor;
    this.GetParser = getParser;
    this.GetTransactionDataAccessObject = getTransactionDataAccessObject;
    this.GetSecurityCodeName = getSecurityCodeName;
    this.GetPostBackTimeout = getPostBackTimeout;
    this.GetHashGenerator = getHashGenerator;
};

_5038.dataaccess.PaymentGatewayOperation = function PaymentGatewayOperation(operationType, results) {
    var dataContainer = {};
    
    //only 1 gateway is expected
    //populate details, get URL
    if (results) {
        dataContainer.operationType = operationType;
        dataContainer.gatewayOperationId = results[0].getId();
        dataContainer.header = results[0].getValue(_CCP.CUST_FIELD_PREFIX + 'operation_header');
    } else {
        throw nlapiCreateError("PGP006", "You have selected a gateway request that is currently not supported by this gateway. Please contact the payment gateway for more information.");
    }
    
    function setGatewayOperationTemplate(template) {
        if (template && template != null) {
            dataContainer.paymentGatewayTemplate = template.GetAsObject();
        } else {
            dataContainer.paymentGatewayTemplate = null;
        }
    }
    
    function setGatewayOperationURL(url) {
        if (url && url != null) {
            dataContainer.paymentGatewayURL = url.GetAsObject();
        } else {
            dataContainer.paymentGatewayURL = null;
        }
    }
    
    function getAsObject() {
        return dataContainer;
    } 
    
    this.GetAsObject = getAsObject;
    this.SetGatewayOperationTemplate = setGatewayOperationTemplate;
    this.SetGatewayOperationURL = setGatewayOperationURL;
};

_5038.dataaccess.PaymentGatewayURL = function PaymentGatewayURL(results) {
    var dataContainer = {};
    dataContainer.paymentGatewayURLArray = [];
    
    if (results) {
        for (var i = 0; i < results.length; i++) {
            dataContainer.paymentGatewayURLArray.push({
                operationURL : results[i].getValue(_CCP.CUST_FIELD_PREFIX + 'gateway_operation_url'),
                operationURLPriority : results[i].getValue(_CCP.CUST_FIELD_PREFIX + 'operation_url_priority')
            });
        }
    }
    
    function getAsObject() {
        return dataContainer;
    } 
    
    this.GetAsObject = getAsObject;
};

_5038.dataaccess.PaymentGatewayTemplate = function PaymentGatewayTemplate(result) {
    var dataContainer = {};
    dataContainer.template = '';
    
    //only one result expected
    if (result) {
        dataContainer.template = result[0].getValue(_CCP.CUST_FIELD_PREFIX + 'operation_template');
    }
    
    function getAsObject() {
        return dataContainer;
    } 
    
    this.GetAsObject = getAsObject;
};

_5038.dataaccess.VariableContainerByType = function VariableContainerByType(results){
    var obj = {};
    obj.variables = {};
    
    for (var i = 0; i < results.length; i++){
        var record = results[i];
        obj.variables[record.getValue(_CCP.CUST_FIELD_PREFIX + "variable_value")] = record.getValue(_CCP.CUST_FIELD_PREFIX + "variable_label"); 
    }
    
    function getAsObject(){
        return obj;
    }
    
    this.GetAsObject = getAsObject;
};

_5038.dataaccess.VariableContainer = function VariableContainer(results){
    var obj = {};
    obj.variables = {};

    for (var i = 0; i < results.length; i++){
        var record = results[i];

        var type = record.getValue(_CCP.CUST_FIELD_PREFIX + "variable_type");
        var value = record.getValue(_CCP.CUST_FIELD_PREFIX + "variable_value");
        var label = record.getValue(_CCP.CUST_FIELD_PREFIX + "variable_label");

        if (obj.variables[type] == null) {
            obj.variables[type] = {};
        }

        obj.variables[type][value] = label; 
    }

    function getAsObject(){
        return obj;
    }

    this.GetAsObject = getAsObject;
};

_5038.dataaccess.AbstractTransactionDataAccessObject = function AbstractTransactionDataAccessObject(input) {
    
    this.input = input;
    
    this.RetrieveCustomerData = function retrieveCustomerData() {
         _5038.stacktrace.StackTrace
         .addLogEntry("_5038.dataaccess.AbstractTransactionDataAccessObject.RetrieveCustomerData");
     
         throw nlapiCreateError("PGP001", "Please use a subclass of AbstractTransactionDataAccessObject");
    };
    
    this.RetrieveTransactionData = function retrieveTransactionData() {
        _5038.stacktrace.StackTrace
       .addLogEntry("_5038.dataaccess.AbstractTransactionDataAccessObject.RetrieveTransactionData");
   
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractTransactionDataAccessObject");
    };
    
    this.RetrieveCreditCardData = function RetrieveCreditCardData() {
        _5038.stacktrace.StackTrace
        .addLogEntry("_5038.dataaccess.AbstractTransactionDataAccessObject.RetrieveCreditCardData");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractTransactionDataAccessObject");
    };
    
    this.RetrieveReferenceTransactionDetails = function retrieveReferenceTransactionDetails(createdFromInternalId) {
        _5038.stacktrace.StackTrace
        .addLogEntry("_5038.dataaccess.AbstractTransactionDataAccessObject.RetrieveReferenceTransactionDetails");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractTransactionDataAccessObject");
    };
    
    this.RetrieveAccountSettings = function RetrieveAccountSettings() {
        _5038.stacktrace.StackTrace
        .addLogEntry("_5038.dataaccess.AbstractTransactionDataAccessObject.RetrieveAccountSettings");
    
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractTransactionDataAccessObject");
    };

    this.RetrieveInput = function retrieveInput() {
        return this.input;
    };
    
    return this;
};

_5038.dataaccess.BaseTransactionDataAccessObject = function BaseTransactionDataAccessObject(input) {
    
    var obj = new _5038.dataaccess.AbstractTransactionDataAccessObject(input);
    
    obj.RetrieveCustomerData = function retrieveCustomerData() {
        var customerData = null;
        var transactionInput = obj.RetrieveInput();
        var transactionDetails = transactionInput ? transactionInput.getTransactionDetails() : null;
        
        if (transactionDetails && transactionDetails != null) {
            var customerDataObj = {};
            
            customerDataObj.customerId = transactionDetails.getEntityId();
            customerDataObj.customerName = transactionDetails.getCustomerName();
            customerDataObj.companyName = customerDataObj.customerName;
            customerDataObj.customerEmail = transactionDetails.getEmail() || "";
            customerDataObj.customerCode = transactionDetails.getCustomerCode() || "";
            customerDataObj.customerIPAddress = transactionDetails.getShopperIpAddress() || "";
            
            var billingAddress = transactionDetails.getBillingAddress();
            
            customerDataObj.customerBillingCountry = billingAddress ? billingAddress.getCountry() : "";
            customerDataObj.customerBillingStreet = billingAddress ? billingAddress.getAddr1() : "";
            customerDataObj.customerBillingStreet2 = billingAddress ? billingAddress.getAddr2() : "";
            
            customerDataObj.customerBillingZip = billingAddress ? billingAddress.getZip() : "";
            customerDataObj.customerBillingCity = billingAddress ? billingAddress.getCity() : "";
            customerDataObj.customerBillingState = billingAddress ? billingAddress.getState() : "";
            customerDataObj.customerBillingPhone = billingAddress ? billingAddress.getPhone() : "";
            
            var shippingAddress = transactionDetails.getShippingAddress();

            customerDataObj.customerShippingAddressee = shippingAddress ? shippingAddress.getAddressee() : "";
            customerDataObj.customerShippingFromZip = transactionDetails.getShipFromZip()|| "";
            customerDataObj.customerShippingToZip = shippingAddress ? shippingAddress.getZip() : "";
            customerDataObj.customerShippingStreet1 = shippingAddress ? shippingAddress.getAddr1() : "";
            customerDataObj.customerShippingStreet2 = shippingAddress ? shippingAddress.getAddr2() : "";
            customerDataObj.customerShippingCity = shippingAddress ? shippingAddress.getCity() : "";
            customerDataObj.customerShippingState = shippingAddress ? shippingAddress.getState() : "";
            customerDataObj.customerShippingCountry = shippingAddress ? shippingAddress.getCountry() : "";
            customerDataObj.customerShippingPhone = shippingAddress ? shippingAddress.getPhone() : "";
            
            var customer = transactionDetails.getCustomer(); 
            customerDataObj.customerFirstName = customer && customer.getFirstName() ? customer.getFirstName() : "N/A";
            customerDataObj.customerLastName = customer && customer.getLastName() ? customer.getLastName() : "N/A";
            
            customerData = new _5038.dataaccess.CustomerData(customerDataObj);
        }

        return customerData;
    };
    
    obj.RetrieveTransactionData = function retrieveTransactionData() {
        var transactionDataClass = null;
        var transactionInput = obj.RetrieveInput();
        var transactionDetails = transactionInput ? transactionInput.getTransactionDetails() : null;
        var paymentPreference = transactionInput ? transactionInput.getPaymentReference() : null;

        if (transactionDetails && transactionDetails != null) {
            var transactionDataObj = {};
            var delayCode;
            
            if(paymentPreference && paymentPreference != null)
            	delayCode = paymentPreference.getReferenceCode();
            
            transactionDataObj.transactionId = transactionDetails.getTransactionId();          
            transactionDataObj.transactionDelayCode = delayCode;
            transactionDataObj.transactionAmount = transactionDetails.getAmount() || 0;
            transactionDataObj.transactionReferenceNumber = transactionDetails.getReferenceNumber();
            transactionDataObj.transactionCurrencyISO = transactionDetails.getCurrencyISO();
            transactionDataObj.transactionNumber = transactionDetails.getDocumentNumber();
            transactionDataObj.transactionTaxTotal = transactionDetails.getTaxTotal();
            transactionDataObj.transactionPaymentMethod = transactionDetails.getPaymentMethodObject().getId();
            transactionDataObj.transactionDescription = transactionDetails.getSoftDescriptor() || "";
            transactionDataObj.transactionPhoneNumber = transactionDetails.getDescriptorPhone() || "";
            transactionDataObj.transactionSettlementCurrencyISO = transactionDetails.getSettlementCurrencyISO();
            transactionDataObj.transactionPurchaseOrderNumber = transactionDetails.getPurchaseOrderNumber() || "";
            transactionDataObj.transactionIsECommerce = transactionDetails.isECommerceTransaction();
            transactionDataObj.transactionIsRecurring = transactionDetails.isRecurringPayment();
            transactionDataObj.transactionExternalId = delayCode;
            transactionDataObj.transactionAuthorizationCode = transactionDetails.getValueOfField("authcode");
            transactionDataObj.transactionCreatedFrom = transactionDetails.getValueOfField("createdfrom");
            transactionDataObj.transactionInternalId = transactionDetails.getTransactionKey();
            transactionDataObj.transactionIsExternalCheckout = transactionDetails.getPaymentMethodObject().getType() == _CCP.EXTERNAL_CHECKOUT;
            transactionDataObj.transactionPaymentRequestId = transactionDetails.getPaymentRequestId();

            transactionDataClass = new _5038.dataaccess.TransactionData(transactionDataObj);
        }

        return transactionDataClass;
    };
    
    obj.RetrieveCreditCardData = function retrieveCreditCardData() {
        var creditCardDataClass = null;
        var cardDetailsObj = {};
        var transactionInput = obj.RetrieveInput();
        
        if (transactionInput && transactionInput != null) {
            var cardDetails = transactionInput.getPaymentInstrument();

            if ((cardDetails && cardDetails != null) && (cardDetails.getType() === _CCP.PAYMENT_CARD)) {
                cardDetailsObj.creditCardNumber = cardDetails.getNumber() || "";
                cardDetailsObj.creditCardName = cardDetails.getNameOnCard() || "";
                cardDetailsObj.creditCardExpirationDate = cardDetails.getExpirationDate() || "";
                cardDetailsObj.creditCardIssueNumber = cardDetails.getIssueNumber() || "";
                cardDetailsObj.creditCardIssueDate = cardDetails.getValidFromDate() || "";
                cardDetailsObj.creditCardStreet = cardDetails.getStreet() || "";
                cardDetailsObj.creditCardZip = cardDetails.getZipCode() || "";
                cardDetailsObj.creditCardSecurityCode = cardDetails.getSecurityCode()  || "";
            }
            else{
                cardDetailsObj.creditCardNumber = "";
                cardDetailsObj.creditCardName = "";
                cardDetailsObj.creditCardExpirationDate = "";
                cardDetailsObj.creditCardIssueNumber = "";
                cardDetailsObj.creditCardIssueDate = "";
                cardDetailsObj.creditCardStreet = "";
                cardDetailsObj.creditCardZip = "";
                cardDetailsObj.creditCardSecurityCode = "";
            }

            creditCardDataClass = new _5038.dataaccess.CreditCardData(cardDetailsObj);
        }
        
        return creditCardDataClass;
    };
    
    obj.RetrieveReferenceTransactionDetails = function retrieveReferenceTransactionDetails(createdFromInternalId) {
        return nlapiLookupField('transaction', createdFromInternalId, ['createdfrom','tranid', 'pnrefnum','type', 'authcode']);
    };
    
    obj.RetrieveAppliedToTransactionId = function retrieveAppliedToTransactionId(transactionDetails) {
        
        var appliedToTranId = "";
        
        if (transactionDetails.type == "CustPymt") {
            appliedToTranId = retrieveCustomerPaymentTransaction(transactionDetails);
        } else {
            appliedToTranId = transactionDetails.tranid;
        }
        
        return appliedToTranId;
    };
    
    function retrieveCustomerPaymentTransaction (transactionDetails) {
        var tranId = "";
        var paymentRecord = nlapiLoadRecord("customerpayment", transactionDetails.internalid);
        
        nlapiLogExecution("DEBUG", "Type and ID", "Type: " + "customerpayment" + "; ID: " + transactionDetails.internalid);
        
        var applyListCount = paymentRecord.getLineItemCount("apply");
        
        if (applyListCount > 0) {
            tranId = paymentRecord.getLineItemValue("apply", "refnum", 1);
        }
        
        return tranId;
    }

    obj.RetrieveAccountSettings = function retrieveAccountSettings() {
        var accountSettingsClass = null;
        var accountSettingsObj = {};

        var context = nlapiGetContext();
        accountSettingsObj.useCardSecurityCode = context.getPreference('CCSECURITYCODE') == 'T';
        accountSettingsObj.language = context.getPreference('LANGUAGE');
        
        accountSettingsClass = new _5038.dataaccess.AccountSettings(accountSettingsObj);
        
        return accountSettingsClass;
    };

    return obj;
};

_5038.dataaccess.PaymentGatewayDataAccessObject = function PaymentGatewayDataAccessObject(input) {
    this.input = input;
    
    function retrievePaymentGatewayConfiguration() {
        var profileSettings = this.input && this.input.getProfileSettings ? this.input.getProfileSettings() : null;
        var scriptId = nlapiGetContext().getScriptId();
        var gatewayConfig = null;
        var testMode = (profileSettings && profileSettings != null) && (nlapiGetContext().getEnvironment() == 'PRODUCTION') ? profileSettings.isTestMode() : true;
    	var gatewayRecordId = _CCP.CUST_RECORD_PREFIX + "gateway";
        
        //search for the gateway config
        var filters = [];
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'gateway_script_id'), null, 'is', scriptId));
        
        var results = nlapiSearchRecord(gatewayRecordId, null, filters);
        if (results === null) {
            throw nlapiCreateError("PGP002", "Sorry but the payment gateway profile for script " + scriptId
                          + " is not yet implemented. Please create the settings for this payment gateway using the Gateway Configuration custom record.");
         }
         
        var record = nlapiLoadRecord(gatewayRecordId, results[0].getId());
        gatewayConfig = new _5038.dataaccess.PaymentGatewayConfiguration(scriptId, testMode, record);
        
        return gatewayConfig;
    }
    
    function retrievePaymentGatewayVariablesByType(type, paymentGatewayConfigurationID) {
        
        var filters = [];
        filters.push(new nlobjSearchFilter(_CCP.CUST_FIELD_PREFIX + "variable_type", null, "is", type));
        if (paymentGatewayConfigurationID){
            filters.push(new nlobjSearchFilter(_CCP.CUST_FIELD_PREFIX + "variable_gateway", null, "anyof", paymentGatewayConfigurationID));
        }
        
        var columns = [];
        columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + "variable_value"));
        columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + "variable_label"));
        var results = nlapiSearchRecord(_CCP.CUST_RECORD_PREFIX + "custom_variable", null, filters, columns) || [];
        
        return new _5038.dataaccess.VariableContainerByType(results);
    }

    function retrievePaymentGatewayVariables(paymentGatewayConfigurationID) {

        var filters = [];
        filters.push(new nlobjSearchFilter(_CCP.CUST_FIELD_PREFIX + "variable_gateway", null, "anyof", paymentGatewayConfigurationID));

        var columns = [];
        columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + "variable_type"));
        columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + "variable_value"));
        columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + "variable_label"));
        var results = nlapiSearchRecord(_CCP.CUST_RECORD_PREFIX + "custom_variable", null, filters, columns) || [];

        return new _5038.dataaccess.VariableContainer(results);
    }

    function retrievePaymentGatewayOperationDetails(operationType, gatewayConfig, isRecurring) {
        var gatewayOp = null;
        
        if (gatewayConfig != null && (operationType != null && operationType != '')) {
            
            var gatewayConfigObj = gatewayConfig.GetAsObject();
            
            if (gatewayConfigObj.internalId && gatewayConfigObj.internalId != null && gatewayConfigObj.internalId != '') {
                _5038.stacktrace.StackTrace
                .addLogEntry("_5038.dataaccess.NetsuiteDataAccessObj.retrievePaymentGatewayOperationDetails: " +
                        "Gateway ID: " + gatewayConfigObj.internalId + '; Operation Type: ' + operationType + 
                        "; isRecurring: " + isRecurring);

                var filters = [];
                filters.push(new nlobjSearchFilter(_CCP.CUST_FIELD_PREFIX + 'operation_gateway', null, 'is', gatewayConfigObj.internalId));
                filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
                filters.push(new nlobjSearchFilter(_CCP.CUST_FIELD_PREFIX + 'operation_type', null, 'is', operationType));
                filters.push(new nlobjSearchFilter(_CCP.CUST_FIELD_PREFIX + 'operation_recurring', null, 'is', isRecurring ? "T" : "F"));
                
                var columns = [];
                columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + 'operation_header'));
                
                var results = nlapiSearchRecord(_CCP.CUST_RECORD_PREFIX + 'gateway_operation', null, filters, columns);
                
                gatewayOp = new _5038.dataaccess.PaymentGatewayOperation(operationType, results);
                
                if (gatewayOp && gatewayOp != null) {
                    var template = retrievePaymentGatewayTemplate(gatewayOp);
                    gatewayOp.SetGatewayOperationTemplate(template == null ? null : template);
                    
                    var urls = retrievePaymentGatewayURL(gatewayOp, gatewayConfigObj.isTestMode);
                    gatewayOp.SetGatewayOperationURL(urls);
                }
            }
        }
        
        return gatewayOp;
    }
    
    function retrievePaymentGatewayTemplate(gatewayOperation) {
        var gatewayTemplate = null;
        if (gatewayOperation && gatewayOperation != null) {
            var gatewayOpObj = gatewayOperation.GetAsObject();
            
            if (gatewayOpObj.gatewayOperationId && gatewayOpObj.gatewayOperationId != null && gatewayOpObj.gatewayOperationId != '') {
                _5038.stacktrace.StackTrace
                .addLogEntry("_5038.dataaccess.NetsuiteDataAccessObj.retrievePaymentGatewayTemplate: " + gatewayOpObj.gatewayOperationId);
                
                var filters = [];
                var columns = [];
                
                filters.push(new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'template_operation'), null, 'is', gatewayOpObj.gatewayOperationId));
                filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
                filters.push(new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_tpl_effect_date'), null, 'onOrBefore', 'today'));
                
                var expiryDateFilter = new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_tpl_expiry_date'), null, 'onOrAfter', 'today');
                expiryDateFilter.setLeftParens(1);
                expiryDateFilter.setOr(true);
                
                var noExpiryDateFilter = new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_tpl_expiry_date'), null, 'isempty', '@NONE@');
                noExpiryDateFilter.setRightParens(1);
                
                filters.push(expiryDateFilter);
                filters.push(noExpiryDateFilter);
                
                columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + 'operation_template'));
                
                var result = nlapiSearchRecord((_CCP.CUST_RECORD_PREFIX + 'operation_post_template'), null, filters, columns);
                
                gatewayTemplate = new _5038.dataaccess.PaymentGatewayTemplate(result);
            }
        }
        return gatewayTemplate;
    }
    
    function retrievePaymentGatewayURL(gatewayOperation, testMode) {
        var gatewayURL = null;
        
        if (gatewayOperation != null) {
            var gatewayOperationObj = gatewayOperation.GetAsObject();
            
            if (gatewayOperationObj.gatewayOperationId && gatewayOperationObj.gatewayOperationId != null && gatewayOperationObj.gatewayOperationId != '') {
            
                var filters = [];
                var columns = [];
                
                filters.push(new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_url_test_mode'), null, 'is', (testMode ? 'T' : 'F')));
                filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
                filters.push(new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'url_operation'), null, 'anyof', gatewayOperationObj.gatewayOperationId));
                filters.push(new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_url_effect_date'), null, 'onOrBefore', 'today'));
                
                var expiryDateFilter = new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_url_expiry_date'), null, 'onOrAfter', 'today');
                expiryDateFilter.setLeftParens(1);
                expiryDateFilter.setOr(true);
                
                var noExpiryDateFilter = new nlobjSearchFilter((_CCP.CUST_FIELD_PREFIX + 'operation_url_expiry_date'), null, 'isempty', '@NONE@');
                noExpiryDateFilter.setRightParens(1);
                
                filters.push(expiryDateFilter);
                filters.push(noExpiryDateFilter);
                
                columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + 'gateway_operation_url'));
                columns.push(new nlobjSearchColumn(_CCP.CUST_FIELD_PREFIX + 'operation_url_priority'));
                
                var results = nlapiSearchRecord((_CCP.CUST_RECORD_PREFIX + 'gateway_operation_url'), null, filters, columns);
                
                gatewayURL = new _5038.dataaccess.PaymentGatewayURL(results);
            }
        }
        
        return gatewayURL;
    }
    
    this.RetrievePaymentGatewayConfiguration = retrievePaymentGatewayConfiguration;
    this.RetrievePaymentGatewayVariablesByType = retrievePaymentGatewayVariablesByType;
    this.RetrievePaymentGatewayVariables = retrievePaymentGatewayVariables;
    this.RetrievePaymentGatewayOperationDetails = retrievePaymentGatewayOperationDetails;
    this.RetrievePaymentGatewayTemplate = retrievePaymentGatewayTemplate;
    this.RetrievePaymentGatewayURL = retrievePaymentGatewayURL;
};