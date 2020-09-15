


/* File: src/ns_sc_config_select_client.js*/
function nsScConfigOnFieldChange(type, name)
{

	var match = name.match(/custpage_([^_]*_?)website/) || '';
	if (match && match.length > 1)
	{
		var website_type = match[1] || ''
		,	selectedValue = nlapiGetFieldValue('custpage_' + website_type + 'website')
		,	websiteData = JSON.parse(nlapiGetFieldValue('custpage_sc_config_ws_data'));
		//remove the options from the domain select
		nlapiRemoveSelectOption('custpage_' + website_type + 'domain', null);
		//add the default value
		nlapiInsertSelectOption('custpage_' + website_type + 'domain', '-', 'Pick one', true)

		if(websiteData[selectedValue])
		{
			var domainData = websiteData[selectedValue].domainData;
			for (var i = 0; i < domainData.length; i++)
			{
				nlapiInsertSelectOption('custpage_' + website_type + 'domain', selectedValue+'|'+domainData[i].name, (domainData[i].primary) ? domainData[i].name+'  (Primary)': domainData[i].name, false);
			}
			if(websiteData[selectedValue].warning)
			{
				nlapiSetFieldValue('custpage_' + website_type + 'website_info', '<p><b>Warning: </b>' + websiteData[selectedValue].warning + '</p>');
			}
			else
			{
				nlapiSetFieldValue('custpage_' + website_type + 'website_info', '');
			}
			//infoMessageField.getDefaultValue("<p><b>Warning: </b>sfdg</p>");
		}
	}
}
function nsScConfigOnSaveRecord()
{
	if (nlapiGetFieldValue('custpage_website') === '-' || nlapiGetFieldValue('custpage_origin_website') === '-' || nlapiGetFieldValue('custpage_destination_website') === '-')
	{
		alert("Please pick one website");
		return false;
	}
	else if(nlapiGetFieldValue('custpage_domain') === '-' || nlapiGetFieldValue('custpage_origin_domain') === '-' || nlapiGetFieldValue('custpage_destination_domain') === '-')
	{
		alert("Please pick one domain");
		return false;
	}
	return true;
}