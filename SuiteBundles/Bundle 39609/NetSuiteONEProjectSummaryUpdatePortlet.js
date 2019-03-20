function projectstatussummary(portlet)
{
	var arrSearchResults = 
	nlapiSearchRecord('customrecord_ns_one_pm_summary', 'customsearch_ns_pm_summary_search');
if (arrSearchResults != null){
for (var i = 0; i < arrSearchResults.length; i++) {
	var result = arrSearchResults[0];
	
	
	// get the id of the latest update
	var stid = result.getValue('internalid', null, 'max');
	nlapiLogExecution('DEBUG', 'Id', stid);
}
	
	portlet.setTitle('Project Manager Summary');

	var recCustom = nlapiLoadRecord('customrecord_ns_one_pm_summary', stid);

   	var htmlContent = '<td>';
	htmlContent += recCustom.getFieldValue("custrecord_ns_pm_update");
	htmlContent += '</td>';

	portlet.setHtml( htmlContent );
	}
	else {
		portlet.setTitle('Project Manager Summary');

	   	var htmlContent = '<td>';
	htmlContent += "No Project Summary has been Created"
	htmlContent += '</td>';

	portlet.setHtml( htmlContent );
	}
}
