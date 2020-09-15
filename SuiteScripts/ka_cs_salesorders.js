/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord','N/search','N/ui/dialog','N/email','N/runtime','N/format','N/log'], function(cr, ns,nsdialog,nsemail,nsruntime, nsformat,log) {

	function pageInit(context){
	}
	function postSourcing(context){
		var currentRecord = context.currentRecord;
		var sublistId = context.sublistId;
		var fieldId = context.fieldId

	}
	function fieldChanged(context){

		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var currentRecord = context.currentRecord;
		var line = context.line;
	}
	function validateLine(context){
		var sublistName = context.sublistId;
		var currentRecord = context.currentRecord;
		log.debug('validateline', sublistName);	
		currentRecord.setCurrentSublistValue(sublistName,'custcol_tailor_client_name','KER ANG');
		return true;
	}
	function lineInit(context){
		var currentRecord = context.currentRecord;
		var sublistId = context.sublistId;
	}
	function sublistChanged(context){
		var currentRecord = context.currentRecord;
		var sublistId = context.sublistId;
		
		log.debug('sublistChanged', sublistId);
	}
  return {
    pageInit : pageInit,
    fieldChanged : fieldChanged,
    validateLine : validateLine,
	postSourcing: postSourcing,
	lineInit: lineInit,
	sublistChanged: sublistChanged
  };
})
