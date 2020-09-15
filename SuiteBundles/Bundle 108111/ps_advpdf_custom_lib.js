/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2016     rgonzales
 *
 */

/**
 * Searches payment records by id to get payment method from mainline
 * 
 * @param {nlobjRecord} objTransaction
 */
function getPaymentMethod(objTransaction) {
	var objPaymentMethods = {}
	try {
		var arrPayments = [];
		var linksCount = objTransaction.getLineItemCount('links');
		for (var inte = 1; inte <= linksCount; inte++) {
			var type = objTransaction.getLineItemValue('links', 'type', inte)
			if (type == 'Payment') {
				arrPayments.push(objTransaction.getLineItemValue('links', 'id', inte));
			}
		}
		if (arrPayments.length > 0) {
			// search Payment records
			var filters = [];
			var columns = [];
			
			filters.push(new nlobjSearchFilter('type', null, 'anyof', 'CustPymt'))
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', arrPayments))
			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'))
			
			columns.push(new nlobjSearchColumn('internalid'));
			columns.push(new nlobjSearchColumn('paymentmethod'));
			
			var searchResult =  nlapiSearchRecord('transaction', null, filters, columns);
			nlapiLogExecution('debug','searchResult',JSON.stringify(searchResult));
			if (!Function.isUndefinedNullOrEmpty(searchResult)) {
				if (searchResult.length > 0) {
					for (var i in searchResult) {
						var row = searchResult[i]
						
						objPaymentMethods[row.getValue('internalid')] = row.getText('paymentmethod')
						
					}
				}
				
			}
		}
		
		
	} catch (ex)	{
		var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		nlapiLogExecution('ERROR', 'getPaymentMethod', strError);
	}
	return objPaymentMethods;
}