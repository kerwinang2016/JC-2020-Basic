/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Mar 2015     rgonzales
 *
 */

// Special Processing variable
var PDF_INVOICE_TEMPLATE = '4'
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suiteletAdvPdfPrinting(request, response){

	var recordId = request.getParameter('custparam_record_id');
	var recordType = request.getParameter('custparam_record_type');
	var templateId = request.getParameter('custparam_template');

	var objTransaction = nlapiLoadRecord(recordType, recordId);
    if(recordType == 'salesorder'){
		var prefmeasurement = nlapiLookupField('customer',objTransaction.getFieldValue('entity'),'custentity_preferredmeasurement');
		if(prefmeasurement == '2')
			templateId = '12';
	}
		
	//nlapiLogExecution('DEBUG', 'ps_sl_custom_adv_pdf_printing.js>objTransaction', JSON.stringify(objTransaction));
  
	var renderer = nlapiCreateTemplateRenderer();

	var pdfHtmlTemplateDetails = getTemplateDetails(templateId);
	var searchesArr = pdfHtmlTemplateDetails.searches;
	if (!Function.isUndefinedNullOrEmpty(searchesArr)) {
		//nlapiLogExecution('debug','SEARCH',JSON.stringify(searchesArr));
		for (var inte = 0; inte < searchesArr.length; inte++) {
			var templateDetails = searchesArr[inte];
			var filterFieldValue = '';
			if (templateDetails.searchvaluefield == 'internalid') {
				filterFieldValue =  recordId;
			} else {
				filterFieldValue =  objTransaction.getFieldValue(templateDetails.searchvaluefield);
			}
			
			
			if (!Function.isUndefinedNullOrEmpty(templateDetails.search)) {
				
				var filters = [];
				
				if (!Function.isUndefinedNullOrEmpty(filterFieldValue)) {
					if (!Function.isUndefinedNullOrEmpty(templateDetails.searchfilter)) {
						if (!Function.isUndefinedNullOrEmpty(templateDetails.searchjoin)) {
							filters.push(new nlobjSearchFilter(templateDetails.searchfilter, templateDetails.searchjoin, 'anyof', filterFieldValue));
						} else {
							filters.push(new nlobjSearchFilter(templateDetails.searchfilter, null, 'anyof', filterFieldValue));
						}
					} else {
						filters.push(new nlobjSearchFilter('internalid', null, 'anyof', filterFieldValue));
					}
					
					var results = nlapiSearchRecord(null, templateDetails.search, filters, null);
					if (templateDetails.isgroupedsearch == 'T') {

						var dummyRecordForSearchResult =  nlapiCreateRecord('customrecord_dummy_record');
						var psObjectArray = [];
						psObjectArray = generateSaveSearchObject (results, psObjectArray);

						dummyRecordForSearchResult.setFieldValue('custrecord_json', JSON.stringify(psObjectArray));
						if (!Function.isUndefinedNullOrEmpty(templateDetails.searchobject)) {
							renderer.addRecord(templateDetails.searchobject, dummyRecordForSearchResult);
						} else {
							renderer.addRecord('results', dummyRecordForSearchResult);
						}

					} else {
						if (!Function.isUndefinedNullOrEmpty(templateDetails.searchobject)) {
							renderer.addSearchResults(templateDetails.searchobject, results);
						} else {
							renderer.addSearchResults('results', results);
						}

					}
				}
			}
		}
	}
	// special processing to retrieve payment method value of the payments associated to the record
	if (templateId == PDF_INVOICE_TEMPLATE) {
		var paymentMethodObj = getPaymentMethod(objTransaction);
		var dummyRecordPaymentMethod =  nlapiCreateRecord('customrecord_dummy_record');
		dummyRecordPaymentMethod.setFieldValue('custrecord_json', JSON.stringify(paymentMethodObj));
		renderer.addRecord('paymentmethod', dummyRecordPaymentMethod);
	}
	// end 
	
	renderer.setTemplate(pdfHtmlTemplateDetails.xml);
	renderer.addRecord('record', objTransaction);
	// add subdiary support
	var isOneWorld;
	var companyInfo = nlapiLoadConfiguration('userpreferences'); //gets user preferences
	var acctSubsidiary = companyInfo.getFieldValue('subsidiary'); //gets subsidiary from user preferences
  
  
  
	if(acctSubsidiary!=null){ //if subsidiary is not null
	   isOneWorld = true; //account is a OneWorld account
	}else{
	   isOneWorld = false; //account is NOT a OneWorld account
	}
	if (isOneWorld) {
		var subsidiary = objTransaction.getFieldValue('subsidiary');
		if (!Function.isUndefinedNullOrEmpty(subsidiary)) {
			var subsidiaryObj =  nlapiLoadRecord('subsidiary', subsidiary);
			renderer.addRecord('subsidiary', subsidiaryObj);
		}
	}

	var xml = renderer.renderToString();
    xml = xml.replace('system.netsuite.com','system.na2.netsuite.com');
	//nlapiLogExecution('DEBUG', 'ps_sl_custom_adv_pdf_printing.js>xml', xml);

	//nlapiLogExecution('DEBUG', 'USAGE REMAINING BEFORE', nlapiGetContext().getRemainingUsage());
	var file = nlapiXMLToPDF(xml);
	//nlapiLogExecution('DEBUG', 'USAGE REMAINING AFTER', nlapiGetContext().getRemainingUsage());

	response.setContentType('PDF', objTransaction.getFieldValue('tranid')+'.pdf', 'inline');
	response.write(file.getValue());
}

