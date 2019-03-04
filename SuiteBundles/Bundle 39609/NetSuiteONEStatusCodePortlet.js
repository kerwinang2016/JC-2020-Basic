function statuscode(portlet)
{
var arrSearchResults = 
	nlapiSearchRecord('customrecord_ns_one_pm_summary', 'customsearch_ns_pm_summary_search');
if (arrSearchResults != null){
	portlet.setTitle('Status');

	var recCustom = nlapiLoadRecord('customrecord_ns_one_pm_summary', '1');

	var htmlContent = '';

	if( recCustom!=null && recCustom.getFieldValue("custrecord_ns_one_pm_status_code")!=null )
	{
		var recStatus = recCustom.getFieldValue("custrecord_ns_one_pm_status_code");

		if( recStatus=="3")
		{
			//3=red
			htmlContent += '<td bgcolor=red align=center><span><font color=white>'+ recCustom.getFieldText("custrecord_ns_one_pm_status_code") + '</font></span></td>';
		}
		else if( recStatus=="1")
		{
			//1=green
			htmlContent += '<td bgcolor=green align=center><span><font color=white>'+ recCustom.getFieldText("custrecord_ns_one_pm_status_code") + '</font></span></td>';
		}
		else if( recStatus=="2")
		{
			//2=yellow
			htmlContent += '<td bgcolor=yellow align=center><span><font color=black>'+ recCustom.getFieldText("custrecord_ns_one_pm_status_code") + '</font></span></td>';
		}
		else
		{
			htmlContent += '<td><span>'+ recCustom.getFieldValue("custrecord_ns_one_pm_status_code") + '</span></td>';
		}
	}
	else
	{
		htmlContent += '<td>no status code specified</td>';
	}

	portlet.setHtml( htmlContent );
}
else
{
portlet.setHtml( "No Project Summary has been Created" );
}
}

