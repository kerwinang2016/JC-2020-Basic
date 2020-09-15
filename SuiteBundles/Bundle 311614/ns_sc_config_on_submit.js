


/* File: src/accessControl.js*/
function accessControl()
{
	var requiredPermissions = [
		{rol: 'LIST_FILECABINET', level: 1}
	,	{rol: 'LIST_WEBSITE', level: 1}
	,	{rol: 'ADMI_DOMAINS', level: 4}
	,	{rol: 'ADMI_STORESETUP', level: 4}
	,	{rol: 'ADMI_CUSTOMSCRIPT', level: 1}
	,	{rol: 'ADMI_CUSTRECORD', level: 1}
	];
	for (var i = 0; i < requiredPermissions.length; i++)
	{
		var permission = requiredPermissions[i];
		var storeSetUpPermissionLevel = nlapiGetContext().getPermission(permission.rol);
		if(storeSetUpPermissionLevel < permission.level)
		{
			throw new Error('Only the users with the following permissions: "Documents and Files", "Website (External) publisher", "Set Up Domains", "Set Up Web Site", "SuiteScript", "Custom Record Types" can modify the configuration record');
		}
	}
}


/* File: src/ns_sc_config_on_submit.js*/
function beforeSubmit()
{
	accessControl();
}