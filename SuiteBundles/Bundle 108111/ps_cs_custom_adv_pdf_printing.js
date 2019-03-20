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
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
   
}


function printPdf(recordId,recordType,template) {
	var URL =  nlapiResolveURL('SUITELET', 'customscript_ps_sl_advpdf_printing', 'customdeploy_ps_sl_advpdf_printing') 
				+'&custparam_record_id='+recordId+'&custparam_record_type='+recordType+'&custparam_template='+template;
	window.open(URL);
}