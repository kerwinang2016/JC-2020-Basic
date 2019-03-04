/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2016     rgonzales
 *
 */





function getTemplateDetails(templateId) {
	var templateDetails = {};

	var objTemplate =  nlapiLoadRecord('customrecord_pdf_template', templateId);

	var search = objTemplate.getFieldValue('custrecord_search_input');
	var templateXml = objTemplate.getFieldValue('custrecord_template_contents');
	var searchJoin = objTemplate.getFieldValue('custrecord_template_join_field');
	var searchFilter = objTemplate.getFieldValue('custrecord_template_filter_field');
	var searchObjName = objTemplate.getFieldValue('custrecord_template_search_obj_name');

	templateDetails.xml = templateXml;
	templateDetails.search = search;
	templateDetails.searchjoin = searchJoin;
	templateDetails.searchfilter = searchFilter;
	templateDetails.searchobject = searchObjName;


	var searchDetailsArr=[];
	for (var int = 1; int <= objTemplate.getLineItemCount('recmachcustrecord_pdf_template'); int++) {
		var searchDetailsObj = {};

		searchDetailsObj.isgroupedsearch = objTemplate.getLineItemValue('recmachcustrecord_pdf_template', 'custrecord_list_is_grouped_search', int);
		searchDetailsObj.search = objTemplate.getLineItemValue('recmachcustrecord_pdf_template', 'custrecord_list_search_input', int);
		searchDetailsObj.searchjoin = objTemplate.getLineItemValue('recmachcustrecord_pdf_template', 'custrecord_list_search_join_field', int);
		searchDetailsObj.searchfilter = objTemplate.getLineItemValue('recmachcustrecord_pdf_template', 'custrecord_list_search_filter_field', int);
		searchDetailsObj.searchobject = objTemplate.getLineItemValue('recmachcustrecord_pdf_template', 'custrecord_list_search_object_name', int);
		searchDetailsObj.searchvaluefield = objTemplate.getLineItemValue('recmachcustrecord_pdf_template', 'custrecord_list_search_value_field', int);

		searchDetailsArr.push(searchDetailsObj);
	}

	templateDetails.searches = searchDetailsArr;

	return templateDetails;
}

function generateSaveSearchObject (exampleSaveSearch, psObjectArray) {
	try {

		for (var int = 0; int < exampleSaveSearch.length; int++) {
			var searchResult = exampleSaveSearch[int]

			try	{

				var arColumns = searchResult.getAllColumns();
				var arResource = {};

				for ( var r = 0; r < arColumns.length; r++)	{
					strProcessMessage = 'Loop';
					var strFieldLabel = arColumns[r].getLabel();

					strFieldLabel = (!isNullOrEmpty(strFieldLabel)) ? strFieldLabel : arColumns[r].getName();

					var strFieldValue = searchResult.getValue(arColumns[r]);
					var strFieldText = searchResult.getText(arColumns[r].getName(), arColumns[r].getJoin(), arColumns[r].getSummary());

					if (strFieldLabel.indexOf('text_') == 0) {
						if (strFieldLabel.indexOf('text_line.') == 0) {
							strFieldLabel = strFieldLabel.substring(10, strFieldLabel.length);
							arResource['line_' + strFieldLabel] = strFieldText;
						} else	{
							if (strFieldLabel.indexOf('text_line|') == 0) {
								var lineType = '';
								lineType = strFieldLabel.substring(10, strFieldLabel.indexOf('.'));

								strFieldLabel = strFieldLabel.substring(strFieldLabel.indexOf('.') + 1, strFieldLabel.length);
								strFieldLabel = 'line___' + lineType + '___' + strFieldLabel;

								if (strFieldValue.indexOf('\'') != -1){
									strFieldValue = strFieldValue.replace(/'/g, '');
								}
								arResource[strFieldLabel] = strFieldText;
							} else {
								if (strFieldLabel.indexOf('text_') == 0) {
									arResource[strFieldLabel] = strFieldText;
								} else {
									if (strFieldValue.indexOf('\'') != -1) {
										strFieldValue = strFieldValue.replace(/'/g, '');
									}
									arResource[strFieldLabel] = strFieldValue;
								}
							}
						}

					} else	{
						strProcessMessage = 'Check line a XXX ' + strFieldLabel;

						if (strFieldLabel.indexOf('line|') == 0){
							var lineType = '';
							lineType = strFieldLabel.substring(5, strFieldLabel.indexOf('.'));

							strFieldLabel = strFieldLabel.substring(strFieldLabel.indexOf('.') + 1, strFieldLabel.length);
							strFieldLabel = 'line___' + lineType + '___' + strFieldLabel;

							if (strFieldValue.indexOf('\'') != -1)	{
								strFieldValue = strFieldValue.replace(/'/g, '');
							}
							arResource[strFieldLabel] = strFieldValue;

						} else	{
							if (strFieldLabel.indexOf('line.') == 0) {
								strFieldLabel = strFieldLabel.substring(5, strFieldLabel.length);
								strFieldLabel = 'line_' + strFieldLabel;
							}

							if (strFieldLabel.indexOf('text_') == 0){
								arResource[strFieldLabel] = strFieldText;
							} else	{
								if (strFieldValue.indexOf('\'') != -1) {
									strFieldValue = strFieldValue.replace(/'/g, '');
								}
								arResource[strFieldLabel] = strFieldValue;
							}
						}
					}
				}
				psObjectArray.push(arResource);


			} catch (ex){
				var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
				nlapiLogExecution('ERROR', 'generateSaveSearchObject', strError);
			}
		}

		return psObjectArray;
	} catch (ex)
	{
		var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		nlapiLogExecution('ERROR', 'generateSaveSearchObject', strError);
	}

}

function isNullOrEmpty(valueStr)
{
	return (valueStr == null || valueStr == "" || valueStr == undefined);
}

Function.isUndefinedNullOrEmpty = function(obj){
	return (obj == null || !obj || obj == '' || obj == undefined);
}