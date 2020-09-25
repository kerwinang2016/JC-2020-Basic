function webService_beforeSubmit(type){
	if(type == 'edit' && (nlapiGetContext().getExecutionContext() == 'webservices' || nlapiGetContext().getExecutionContext() == 'scheduled')){

		var approve = true;
		for(var x=1; x<= nlapiGetLineItemCount('item');x++){
			if(nlapiLookupField('item',nlapiGetLineItemValue('item','item',x),'custitem_ps_item_available') == 'T' &&
				((nlapiGetLineItemValue('item','custcolcustcol_api_status_fld',x) != 'Processed' && nlapiGetLineItemValue('item','custcolcustcol_api_status_fld',x) != 'Success') || !nlapiGetLineItemValue('item','custcolcustcol_api_status_fld',x))){
				approve = false;
				break;
			}
		}
		if(approve){
			nlapiSetFieldValue('orderstatus','B');
			if(nlapiGetContext().getExecutionContext() == 'scheduled')
				nlapiSetFieldValue('custbodycustbody_api_sales_ord_st_json','Processed');
		}
	}
}
