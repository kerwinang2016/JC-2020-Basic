/**
* Module Description
* 
* Version    Date            Author           Remarks
* 1.00       01 Jan 2016     pdureza
*
*/

function afterSubmit(type){
	var objContext = nlapiGetContext();
  nlapiLogExecution('debug','Context',objContext.getExecutionContext() )
	if(type == 'create' && objContext.getExecutionContext() == 'webstore'){
		var newRecord = nlapiLoadRecord('salesorder', nlapiGetRecordId());
		try {
			var customerName =  getCustomerName(newRecord);
          nlapiLogExecution('debug','CLIENTNAME',customerName)
			newRecord.setFieldValue('custbody_customer_name', customerName);
			getCustomerNamePerItem(newRecord);

			nlapiSubmitRecord(newRecord);
		} catch (e){
			nlapiLogExecution('ERROR', "Could not update Customer Name for SO# " + newRecord.getId() , e);
		} 
	}
}

// returns customer name based on Line Items. If multiple names, then returns the text 'Multiple'
function getCustomerName(newRecord){
	var clientID = undefined;
	var customerName = "";
	var DEFAULT_MUITPLE = "Multiple";
	for (var count = 1; count <= newRecord.getLineItemCount('item'); count ++){
		if (clientID){
			if ((clientID != newRecord.getLineItemValue('item', 'custcol_tailor_client', count)) // if not equal to previous client ID, DEFAULT_MUITPLE
					&& (newRecord.getLineItemValue('item', 'custcol_tailor_client', count) != " ") // if not empty, DEFAULT_MUITPLE
					&& (newRecord.getLineItemValue('item', 'custcol_tailor_client', count))){ // if not valid value, DEFAULT_MUITPLE
				
				customerName = DEFAULT_MUITPLE;
				break;
			}
		} else{
			clientID = newRecord.getLineItemValue('item', 'custcol_tailor_client', count);
		}
	};
	
	if (customerName != DEFAULT_MUITPLE){
		customerName = getClientNameByID(newRecord, clientID);
	}
	
	return customerName;
	
}

// returns customer name based on Line Items. If multiple names, then returns the text 'Multiple'
function getCustomerNamePerItem(newRecord){
	var clientID;
	for (var count = 1; count <= newRecord.getLineItemCount('item'); count ++){
		clientID = newRecord.getLineItemValue('item', 'custcol_tailor_client', count);
		newRecord.setLineItemValue('item', 'custcol_tailor_client_name', count, getClientNameByID(newRecord, clientID));
	};
}

function getClientNameByID(newRecord, clientID){
	if(clientID){
	var tailor = nlapiLookupField('customer',newRecord.getFieldValue('entity'),'parent');
	var filters = [
			new nlobjSearchFilter('custrecord_tc_tailor', null, 'is', tailor?tailor:newRecord.getFieldValue('entity')),
			new nlobjSearchFilter('internalid',null,'anyof',clientID)
		]
	
	,	columns = [
			new nlobjSearchColumn('custrecord_tc_first_name')
		,	new nlobjSearchColumn('custrecord_tc_last_name')
		]
		
	,	profiles = nlapiSearchRecord('customrecord_sc_tailor_client', null, filters, columns);
	
	var clientName = null;
	for (index in profiles){
		if (profiles[index].id == clientID){
			clientName = profiles[index].getValue("custrecord_tc_first_name") + " " + profiles[index].getValue("custrecord_tc_last_name");
			break;
		}
	}
	}
	return clientName?clientName:null;
}