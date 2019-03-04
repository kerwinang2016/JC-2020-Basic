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
function printQuotePdf(request, response){
	var templateDetails = {};
	var template = 10;
	var recordId = request.getParameter('custparam_record_id');
	
	var objEstimate = nlapiLoadRecord('estimate', recordId);
	var objTemplate =  nlapiLoadRecord('customrecord_pdf_template', template);
	
	var templateXml = objTemplate.getFieldValue('custrecord_template_contents');
	templateDetails.xml = templateXml;
	
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(templateXml);
	renderer.addRecord('record', objEstimate);
	
	var xml = renderer.renderToString();
	var file = nlapiXMLToPDF(xml);
	
	response.setContentType('PDF', 'Quotation_'+recordId+'.pdf', 'inline');
	response.write(file.getValue());
}