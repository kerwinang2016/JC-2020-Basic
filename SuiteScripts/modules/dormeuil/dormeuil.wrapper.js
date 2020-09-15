/**
 * ustyylit.wrapper.js
 *
 * @NApiVersion 2.x
 * @NAmdConfig /SuiteScripts/amd-config.json
 */

var RECORDMOD, FORMATMOD, SEARCHMOD, RUNTIMEMOD, HTTPMOD, XMLMOD, LOGMOD;
define(['N/record', 'N/format', 'N/search', 'N/encode', 'N/runtime', 'N/http', 'N/xml', 'N/log'],
function(record, format, search, encode, runtime, httpmod, xmlmod, logmod) {
	RECORDMOD = record;
	FORMATMOD = format;
	SEARCHMOD = search;
	RUNTIMEMOD = runtime;
	HTTPMOD = httpmod;
	XMLMOD = xmlmod;
	LOGMOD = logmod;
	return {
		'getStock' : getStock
	}

});
function getStock(sku){
	try{
		var response = HTTPMOD.post({
			url:'http://bunch.dormeuil.com:10054/web/services/WEBR_STOCK/reference/'+sku,
			body: ""
			});
		LOGMOD.audit('getStock', 'getStock response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getStock', 'ERROR : ' + e.message);
	}
}

function isEmpty(fldValue) {
	return fldValue == '' || fldValue == null || fldValue == undefined;
}

function getFloatVal(v) {
	if (isEmpty(v))
		return 0;

	return parseFloat(v);
}