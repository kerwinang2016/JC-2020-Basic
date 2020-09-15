(function()
{
	var SuiteScriptSingleton = {
			nlapiLoadFile: nlapiLoadFile
		,	nlapiCreateFile: nlapiCreateFile
		,	nlapiSubmitFile: nlapiSubmitFile
		,	nlapiDeleteFile: nlapiDeleteFile
		,	nlapiSubmitRecord: nlapiSubmitRecord
		,	nlapiCreateRecord: nlapiCreateRecord
	};

	define('SuiteScript', [
		]
	,	function (
		)
	{
		'use strict';
		return SuiteScriptSingleton;
	});

})();