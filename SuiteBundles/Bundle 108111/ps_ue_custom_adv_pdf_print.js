/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Mar 2015     rgonzales
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */

var PDF_INVOICE_TEMPLATE = '4'
	
function ueBeforeLoad_AdvPdfPrinting(type, form, request){
	if (type == 'view') {
		var templateId = nlapiGetContext().getSetting('SCRIPT', 'custscript_template_3');
		if(nlapiGetRecordType() == 'salesorder'){
			var sorec = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
			var prefmeasurement = nlapiLookupField('customer',sorec.getFieldValue('entity'),'custentity_preferredmeasurement');
			if(prefmeasurement == '2')
				templateId = '12';
		}
		var buttonLabel = nlapiGetContext().getSetting('SCRIPT', 'custscript_button_label');
		if (!Function.isUndefinedNullOrEmpty(buttonLabel)) {
			form.addButton('custpage_advpdf_printing', buttonLabel, "printPdf('"+nlapiGetRecordId()+"','"+nlapiGetRecordType()+"','"+templateId+"')");
		} else {
			form.addButton('custpage_advpdf_printing', 'Print', "printPdf('"+nlapiGetRecordId()+"','"+nlapiGetRecordType()+"','"+templateId+"')");
		}
		
		form.setScript('customscript_ps_cs_advpdf_printing');
	}
}

function ueBeforeSubmit_AdvPdfPrinting(type){
	// remove to be emailed checkbox value
  nlapiLogExecution('debug','User', nlapiGetContext().getUser())
	if(nlapiGetContext().getUser() == '546') return;
	if (type == 'create' || type == 'edit') {
		var newRec = nlapiGetNewRecord();
		var email = newRec.getFieldValue('email');
		var toBeEmailed = newRec.getFieldValue('tobeemailed');
		newRec.setFieldValue('tobeemailed', 'F');
		newRec.setFieldValue('custbody_ps_custom_pdf_email', toBeEmailed);
		newRec.setFieldValue('custbody_ps_custom_pdf_email_addr', email);
	}	
}
function ueAfterSubmit_AdvPdfPrinting(type){
  if(nlapiGetContext().getUser() == '546') return;
	if(type == 'delete' ) return;
	if(nlapiGetFieldValue('custbody_ps_custom_pdf_email') != 'T'){
		return;
	}
	var recordId = nlapiGetRecordId();
	var recordType = nlapiGetRecordType();
	var templateId = nlapiGetContext().getSetting('SCRIPT', 'custscript_template_3');
	var objTransaction = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId(),{recordmode : 'dynamic'});
	if(nlapiGetRecordType() == 'salesorder'){
		var prefmeasurement = nlapiLookupField('customer',objTransaction.getFieldValue('entity'),'custentity_preferredmeasurement');
		if(prefmeasurement == '2')
			templateId = '12';
	}

	var renderer = nlapiCreateTemplateRenderer();

	var pdfHtmlTemplateDetails = getTemplateDetails(templateId);

	var searchesArr = pdfHtmlTemplateDetails.searches;
	if (!Function.isUndefinedNullOrEmpty(searchesArr)) {
		
		for (var int = 0; int < searchesArr.length; int++) {
			var templateDetails = searchesArr[int];
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
	var file = nlapiXMLToPDF(xml);

	//send email
	var records = new Object();
	records['transaction'] = nlapiGetRecordId();
	var emailAddress = nlapiGetFieldValue('custbody_ps_custom_pdf_email_addr');
	// validate if empty email address as blank value would cause error
	if (!Function.isUndefinedNullOrEmpty(emailAddress)) {
		var objRecord = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId())
		try{
		nlapiSendEmail(nlapiGetContext().getUser(),emailAddress , objRecord.getFieldText('subsidiary')+': Sales Invoice #' + objRecord.getFieldValue('tranid'), 'Please open the attached file to view your Sales Invoice.', null, null, records,file,false,false,'naldgon@yahoo.com' );
		}
		catch(e){
			nlapiLogExecution('error','Caught Exception','Author not employee on PS Send Email');
			nlapiSendEmail(98,emailAddress , objRecord.getFieldText('subsidiary')+': Sales Invoice #' + objRecord.getFieldValue('tranid'), 'Please open the attached file to view your Sales Invoice.', null, null, records,file,false,false,'naldgon@yahoo.com' );
		}
	}
	
	nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custbody_ps_custom_pdf_email', 'F');
}