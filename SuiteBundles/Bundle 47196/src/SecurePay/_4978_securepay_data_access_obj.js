/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

var _4978;

if (!_4978) {
    _4978 = {};
}

_4978.dataaccess = {};

_5038.dataaccess.SecurePayTransactionDataAccessObject = function SecurePayTransactionDataAccessObject(input) {
    
    var obj = new _5038.dataaccess.BaseTransactionDataAccessObject(input);
    
    function transformRelatedTransactionDetails(searchResults) {
        
        var transactionDetailsArray = [];
        
        if (searchResults != null) {
            for (var i = 0; i < searchResults.length; i++) {
                
                var transactionObj = {};
                var transactionColumns = searchResults[i].getAllColumns();
                
                for (var j = 0; j < transactionColumns.length; j++) {
                    
                    transactionObj[transactionColumns[j].getName()] = searchResults[i].getValue(transactionColumns[j]);
                }
                
                transactionDetailsArray.push(transactionObj);
            }
        }
        
        return transactionDetailsArray;
    }
    
    obj.RetrieveRelatedTransactionDetails = function retrieveRelatedTransactionDetails(pnRefNum, customerId) {
        
        var columns = [];
        var filters = [];
        var results = [];
        
        if (!pnRefNum || !customerId) {
            return results;
        }
        
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('tranid'));
        columns.push(new nlobjSearchColumn('pnrefnum'));
        columns.push(new nlobjSearchColumn('createdfrom'));
        columns.push(new nlobjSearchColumn('authcode'));
        columns.push(new nlobjSearchColumn('type'));
        
        filters.push(new nlobjSearchFilter('pnrefnum', null, 'contains', pnRefNum));
        filters.push(new nlobjSearchFilter('entity', null, 'is', customerId));
        filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('isreversal', null, 'is', 'F'));
        
        results = nlapiSearchRecord('transaction', null, filters, columns);
        
        return transformRelatedTransactionDetails(results);
    };
    
    obj.RetrieveAppliedToTransactionId = function retrieveAppliedToTransactionId(transactionDetails) {
        
        var appliedToTranId = "";
        
        if (!transactionDetails) {
            return appliedToTranId;
        }
        
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
        
        var applyListCount = paymentRecord.getLineItemCount("apply");
        
        if (applyListCount > 0) {
            tranId = paymentRecord.getLineItemValue("apply", "refnum", 1);
        }
        
        return tranId;
    }

    return obj;
};
