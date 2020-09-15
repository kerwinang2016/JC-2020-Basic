function validateLine(type){
	if(!nlapiGetCurrentLineItemValue('item','custcol_tailor_client_name') && nlapiGetCurrentLineItemValue('item','custcol_tailor_client')){				
		var clientName = nlapiRequestURL('https://3857857.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=213&deploy=1&compid=3857857&h=272f4e9a8e3a11190698',
		{action:'getclientname',tailorid:nlapiGetFieldValue('entity'),clientid:nlapiGetCurrentLineItemValue('item','custcol_tailor_client')});
	
		nlapiSetCurrentLineItemValue('item','custcol_tailor_client_name',clientName.getBody());
		nlapiLogExecution('debug','Validate Line clientName',clientName.getBody());
	}
	// if(!nlapiGetCurrentLineItemValue('item','custcol_tailor_client_name')){
		
	// }
	nlapiLogExecution('debug','Validate Line',type);
	return true;
}