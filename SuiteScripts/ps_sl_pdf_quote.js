/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Apr 2016     kduran
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function suiteletPdfQuote(request, response){	
	var requestData = request.getParameter('data');
	
	try{	
		requestData = JSON.parse(requestData);
		nlapiLogExecution('debug','RequestData',JSON.stringify(requestData));
		//Check if estimate record exists for the requesting tailor
		var responseId;
		
		if(hasTailorEstimateId(requestData.id)) {
			var estId = getEstimateId(requestData.id);
			var estimateRecord = nlapiLoadRecord('estimate', estId);
			responseId = updateEstimateRecord(estimateRecord, requestData);
		} else {
			var estimateRecord = nlapiCreateRecord('estimate');
			estimateRecord.setFieldValue('entity', requestData.id);
			responseId = createEstimateRecord(estimateRecord, requestData);
		}
			
		response.setContentType("JAVASCRIPT");
		response.write(responseId);
	} catch(e){
		nlapiLogExecution('ERROR', "Could not process your quotation request for : " + requestData.id , e);
	}
}

function hasTailorEstimateId(custID){
	//get tailor record with this id
	var isExist = false;
	var estId = getEstimateId(custID);

	if(estId > 0){
		var isExist = checkRecordExist(estId);
	}
	nlapiLogExecution('debug', 'isExist: ', isExist);
	return isExist;
}

function getEstimateId(custID) {
	return nlapiLookupField("customer", custID, "custentity_tailor_est_id");
}

function checkRecordExist(estRecId){
	r = nlapiSearchRecord('estimate', null, new nlobjSearchFilter('internalid', null, 'is', estRecId));
	if(r == null || r.length == 0) {
		return false;
	} else {
		return true;
	}
}

function setEstimateId(custID, estId) {
	var tailorRecord = nlapiLoadRecord('customer', custID);
	tailorRecord.setFieldValue('custentity_tailor_est_id', estId);
	nlapiSubmitRecord(tailorRecord);
}

function createEstimateRecord(estRecord, requestData) {
	var id = setNewValues(estRecord, requestData, "create");
	setEstimateId(requestData.id, id);
	
	return id;
}

function updateEstimateRecord(estRecord, requestData) {
	var count = estRecord.getLineItemCount('item');
	nlapiLogExecution('debug','Old Estimate items length',count);
	var id = setNewValues(estRecord, requestData, "update");
	//var estimateRecord = nlapiLoadRecord('estimate', id);
	//removeOldEstimateRecord(estimateRecord, count);
	
	return id;
}

function removeOldEstimateRecord(estRecord, count) {
	var toRetain = estRecord.getLineItemCount('item') - count;

	for (var ctr = estRecord.getLineItemCount('item') ; ctr > toRetain; ctr--)
	{
		estRecord.removeLineItem('item', ctr);
	}
	nlapiSubmitRecord(estRecord, true);
}

function setNewValues(estimateRecord, requestData, method) {
	nlapiLogExecution('debug','ReQUEST items length',requestData.items.length);
	if(estimateRecord.getLineItemCount('item') >0){
		var lineNum = estimateRecord.getLineItemCount('item');
		for(i=lineNum; i>= 1; i--){
			estimateRecord.removeLineItem('item',i);
		}
	}
	for (index in requestData.items) {
		estimateRecord.insertLineItem('item', 1);
		
		//Item
		estimateRecord.setLineItemValue('item', 'item', 1, requestData.items[index].internalid);
		
		//Price
		estimateRecord.setLineItemValue('item', 'custcol_tailor_cust_pricing', 1, requestData.items[index].price);
		
		//Client Name
		estimateRecord.setLineItemValue('item', 'custcol_tailor_client_name', 1, requestData.items[index].clientName);
		
		//Display Options
		estimateRecord.setLineItemValue('item', 'custcol_designoptions_jacket', 1, requestData.items[index].displayOptionsJacket);
		estimateRecord.setLineItemValue('item', 'custcol_designoptions_trouser', 1, requestData.items[index].displayOptionsTrouser);
		estimateRecord.setLineItemValue('item', 'custcol_designoptions_waistcoat', 1, requestData.items[index].displayOptionsWaistcoat);
		estimateRecord.setLineItemValue('item', 'custcol_designoptions_overcoat', 1, requestData.items[index].displayOptionsOvercoat);
		estimateRecord.setLineItemValue('item', 'custcol_designoptions_shirt', 1, requestData.items[index].displayOptionsShirt);
		estimateRecord.setLineItemValue('item', 'custcol_designoption_message', 1, requestData.items[index].displayOpNotes);
		
		//Fit Profile
		estimateRecord.setLineItemValue('item', 'custcol_fitprofile_jacket', 1, requestData.items[index].fitProfileJacket);
		estimateRecord.setLineItemValue('item', 'custcol_fitprofile_trouser', 1, requestData.items[index].fitProfileTrouser);
		estimateRecord.setLineItemValue('item', 'custcol_fitprofile_waistcoat', 1, requestData.items[index].fitProfileWaistcoat);
		estimateRecord.setLineItemValue('item', 'custcol_fitprofile_overcoat', 1, requestData.items[index].fitProfileOvercoat);
		estimateRecord.setLineItemValue('item', 'custcol_fitprofile_shirt', 1, requestData.items[index].fitProfileShirt);
		estimateRecord.setLineItemValue('item', 'custcol_fitprofile_message', 1, requestData.items[index].fitProfileNotes);
		estimateRecord.setLineItemValue('item', 'custcol_custom_fabric_details', 1, requestData.items[index].customFabricDetails);
		//Quantity
		estimateRecord.setLineItemValue('item', 'custcol_fabric_quantity', 1, requestData.items[index].fabricQuantity);
		var lineItemTotal = requestData.items[index].lineItemTotal ? requestData.items[index].lineItemTotal : 0.00;
		estimateRecord.setLineItemValue('item', 'custcol_order_list_line_item_total', 1, lineItemTotal); //JHD-35
	}
	
	//Subtotal
	estimateRecord.setFieldValue('custbody_total_tailor_price', String.fromCharCode(requestData.currency_symbol) + (requestData.subtotal_formatted).substring(1));
	
	//Date
	estimateRecord.setFieldValue('trandate', requestData.dateString);
	
	return nlapiSubmitRecord(estimateRecord, true, true);
}

function getColumnName(options, contentType){
	var header = contentType === "options" ? options.header : options.name;
	return contentType === "options" ? "custcol_designoptions_" + header.toString() : "custcol_fitprofile_" + header.toString();
}
function getContent(cont, src){
	var data = "";
	
	if (src === "fitprofile") {
		data = JSON.stringify(cont);
	} else {
		data = JSON.stringify(cont.selections);
	}
	
	return data;
}