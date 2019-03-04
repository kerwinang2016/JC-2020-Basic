function projectstatussummary(portlet)
{
	portlet.setTitle('Project Overview');

	var recCustom = nlapiLoadRecord('customrecord_ns_one_pm_summary', '1');

   	var htmlContent = '<td>';
	htmlContent += recCustom.getFieldValue("custrecord_ns_pm_overview");
	htmlContent += '</td>';

	portlet.setHtml( htmlContent );
}
