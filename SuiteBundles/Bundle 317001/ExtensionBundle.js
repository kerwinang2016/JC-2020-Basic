/*jshint funcscope:true*/
/*exported beforeInstall*/
/*exported afterInstall*/
/*exported afterUpdate*/
/*exported beforeUninstall*/
/* jshint evil:true */

function beforeInstall()
{
	try
	{
		var config = nlapiLoadConfiguration('companypreferences');
		var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
		var file = path && nlapiLoadFile(path);
	}
	catch(error){}
	
	if (!config || !path || !file)
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Management Bundle it\'s not installed or not configured correctly');
	}
}

function afterInstall()
{
	var config = nlapiLoadConfiguration('companypreferences');
	var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
	
	if (path)
	{
		var file = nlapiLoadFile(path);
		eval(file.getValue());

		SCExtension.afterInstall();
	}
	else
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Management Bundle it\'s not installed or not configured correctly');
	}
}

function afterUpdate()
{
	var config = nlapiLoadConfiguration('companypreferences');
	var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
	
	if (path)
	{
		var file = nlapiLoadFile(path);
		eval(file.getValue());

		SCExtension.afterUpdate();
	}
	else
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Management Bundle it\'s not installed or not configured correctly');
	}
}

function beforeUninstall()
{
	var config = nlapiLoadConfiguration('companypreferences');
	var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
	
	if (path)
	{
		var file = nlapiLoadFile(path);
		eval(file.getValue());

		SCExtension.beforeUninstall();
	}
	else
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Mechanism Bundle it\'s not installed or not configured correctly');
	}
}
