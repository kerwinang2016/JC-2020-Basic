/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 May 2016     gquiambao
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
	
function beforeLoad_Invoice(type, form, request){
	if (type == 'view') {
		
		//hide standard print button
		form.removeButton('print'); 
		form.removeButton('printinlocale');
	}
}