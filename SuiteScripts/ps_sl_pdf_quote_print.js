/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Apr 2016     kduran
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
var context = nlapiGetContext();
var site = "https://system.na2.netsuite.com";
if (context.getEnvironment() == 'SANDBOX') {
  site = "https://system.netsuite.com"
}
function printQuotePdf(request, response){
	var templateDetails = {};
	var template = 10;
	var logoUrl = '';
	var currencySymbol = '';
	var recordId = request.getParameter('custparam_record_id');
	
	var objEstimate = nlapiLoadRecord('estimate', recordId);
	var tailorId = objEstimate.getFieldValue('entity');
	if(tailorId){
		var tailorRecField = nlapiLookupField('customer', tailorId, ['custentity_avt_tailor_logo_url', 'currency']);
		if(tailorRecField.currency){
			var currencyRec = nlapiLoadRecord('currency', tailorRecField.currency);
			currencySymbol = currencyRec.getFieldValue('displaysymbol');
		}
		logoUrl  = tailorRecField.custentity_avt_tailor_logo_url;
		logoUrl = logoUrl.replace(/&/g, '&amp;');	
	}
	var objTemplate =  nlapiLoadRecord('customrecord_pdf_template', template);
	
	var templateXml = objTemplate.getFieldValue('custrecord_template_contents');
	logoUrl = site + logoUrl;
	nlapiLogExecution('debug', 'logoUrl: ', logoUrl);
	templateXml = templateXml.replace("{replacelogoUrl}", logoUrl);
	templateXml = templateXml.replace(/{replacecurrencysymbol}/gi, currencySymbol);
	templateDetails.xml = templateXml;
	
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(templateXml);
	renderer.addRecord('record', objEstimate);
	
	var xml = renderer.renderToString();
	var file = nlapiXMLToPDF(xml);
	
	response.setContentType('PDF', 'Quotation_'+recordId+'.pdf', 'inline');
	response.write(file.getValue());
}