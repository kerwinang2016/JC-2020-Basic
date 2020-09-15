/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Mar 2015     rvindal
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function service(request, response) {
	try {
		var type = request.getParameter('type');
		nlapiLogExecution('debug', 'type', type);
		var responseData = "sample";
		nlapiLogExecution('debug', 'responseData', responseData);
		switch (type) {
			case "get_client":
				var data = request.getParameter('data');

				if (data) {
					data = JSON.parse(data);
					nlapiLogExecution("Debug", "Test1", JSON.stringify(recordFunctions.processColumnData(data.columns)));
					responseData = recordFunctions.fetchRecord("customrecord_sc_tailor_client", recordFunctions.processFilterData(data.filters), recordFunctions.processColumnData(data.columns));
				}
				break;
			case "create_client":
				var data = request.getParameter('data');
				if (data) {
					data = JSON.parse(data);
					nlapiLogExecution('debug', 'create_client data', JSON.stringify(data));
					responseData = recordFunctions.createRecord("customrecord_sc_tailor_client", data);
					responseData = fixUndefinedClientResponse(responseData);
					//nlapiLogExecution('debug', 'create_client >> responseData', JSON.stringify(responseData))
				}
				break;
			case "update_client":
				var data = request.getParameter('data');
				var id = request.getParameter('id');
				if (data) {
					data = JSON.parse(data);
					responseData = recordFunctions.updateRecord("customrecord_sc_tailor_client", id, data);
				}
				break;
			case "update_alteration":
				var data = request.getParameter('data');
				var id = request.getParameter('id');
				if (data) {
					data = data.replace(/\r?\n?/g, '');
					data = data.trim();
					data = JSON.parse(data);
					responseData = recordFunctions.updateRecord("customrecord_sc_alteration", id, data);
				}
				break;
			case "remove_client":
				var id = request.getParameter('id');
				if (id) {
					responseData = recordFunctions.deleteRecord("customrecord_sc_tailor_client", id);
				}
				break;
			case "remove_alteration":
				var id = request.getParameter('id');
				if (id) {
					responseData = recordFunctions.deleteRecord("customrecord_sc_alteration", id);
				}
				break;
			case "get_profile":
				var data = request.getParameter('data');
				if (data) {
					data = JSON.parse(data);
					responseData = recordFunctions.fetchRecord("customrecord_sc_fit_profile", recordFunctions.processFilterData(data.filters), recordFunctions.processColumnData(data.columns));
				}
				break;
			case "get_alterations":
				var data = request.getParameter('data');
				if (data) {
					data = data.replace(/\r?\n?/g, '');
					data = data.trim();
					data = JSON.parse(data);
					responseData = recordFunctions.fetchRecord("customrecord_sc_alteration", recordFunctions.processFilterData(data.filters), recordFunctions.processColumnData(data.columns));
				}
				break;
			case "create_profile":
				var data = request.getParameter('data');
				if (data) {
					data = JSON.parse(data);
					responseData = recordFunctions.createRecord("customrecord_sc_fit_profile", data);
				}
				break;
			case "create_alteration_form":
				var data = request.getParameter('data');
				if (data) {
					data = data.replace(/\r?\n?/g, '');
					data = data.trim();
					data = JSON.parse(data);
					responseData = recordFunctions.createRecord("customrecord_sc_alteration", data);
					nlapiLogExecution('debug', 'responseData:', JSON.stringify(responseData))
				}
				break;
			case "update_profile":
				var data = request.getParameter('data');
				var id = request.getParameter('id');
				if (data) {
					data = JSON.parse(data);
					responseData = recordFunctions.updateRecord("customrecord_sc_fit_profile", id, data);
					var a = nlapiLoadRecord("customrecord_sc_fit_profile", id)
					nlapiSubmitRecord(a)
				}
				break;
			case "remove_profile":
				var id = request.getParameter('id');
				if (id) {
					responseData = recordFunctions.deleteRecord("customrecord_sc_fit_profile", id);
				}
				break;
			case "get_designoption_restriction":
				var id = request.getParameter('id');
				if (id) {
					responseData = nlapiLookupField("customer", id, "custentity_design_options_restriction");
					nlapiLogExecution("debug", "responseData:", responseData);
					if (responseData == "") {
						responseData = "[]";
					}
				}
				break;
			case "get_fav_designoption":
				var id = request.getParameter('id');
				if (id) {
					responseData = nlapiLookupField("customer", id, "custentity_fav_design_options");
				}
				break;
			case "get_favourite_fit_tools":
				var id = request.getParameter('id');
				nlapiLogExecution('debug', 'id test', id)
				if (id) {
					var tempResponseData = nlapiLookupField("customer", id, ["custentity_favourite_fit_tools", "custentity_enable_edit_favou_fit_tools"]);
					if (tempResponseData == "") {
						responseData = "[]";
					} else {
						responseData = [];
						responseData.push(tempResponseData.custentity_favourite_fit_tools);
						responseData.push(tempResponseData.custentity_enable_edit_favou_fit_tools);
					}
				}
				break;
			case "save_designoption_restriction":
				var id = request.getParameter('id'),
					data = request.getParameter('data');
				if (id && data) {
					responseData = nlapiSubmitField("customer", id, "custentity_design_options_restriction", data);
				}
				break;
			case "save_fav_designoption":
				var id = request.getParameter('id'),
					data = request.getParameter('data');
				if (id) {
					responseData = nlapiSubmitField("customer", id, "custentity_fav_design_options", data);
				}
				break;
			case "save_favourite_fit_tools":
				var id = request.getParameter('id'),
					data = request.getParameter('data');
				if (id && data) {
					responseData = nlapiSubmitField("customer", id, "custentity_favourite_fit_tools", data);
				}
				break;

			case "get_client_name_details":
				var id = request.getParameter('id');
				nlapiLogExecution('debug', 'id test', id)
				if (id) {
					var tempResponseData = nlapiLookupField("customrecord_sc_tailor_client", id, ["custrecord_tc_first_name", "custrecord_tc_last_name"]);
					if (tempResponseData == "") {
						responseData = "[]";
					} else {
						responseData = [];
						responseData.push(tempResponseData.custrecord_tc_first_name);
						responseData.push(tempResponseData.custrecord_tc_last_name);
					}
				}
				break;
			case "get_block_quantity_measurement":
				var id = request.getParameter('id');
				nlapiLogExecution('debug', 'id test', id)
				if (id) {
					var blockQuantity = 0;
					var resultObj = [];
					var fitProfileData = nlapiLookupField("customrecord_sc_fit_profile", id, ["custrecord_fp_block_value"]);
					var blockValue = fitProfileData.custrecord_fp_block_value;
					if (blockValue) {
						var filters = [];
						filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						filters.push(new nlobjSearchFilter('custrecord_bqm_block', null, 'is', blockValue));
						var cols = [];
						cols.push(new nlobjSearchColumn('custrecord_bqm_quantity'));
						cols.push(new nlobjSearchColumn('custrecord_bqm_product'));
						var results = nlapiSearchRecord('customrecord_block_quantity_measurement', null, filters, cols);
						if (results) {
							for (var i = 0; i < results.length; i++) {
								var obj = {};
								obj.bqmQuantity = results[i].getValue('custrecord_bqm_quantity');
								obj.bqProductType = results[i].getText('custrecord_bqm_product');

								resultObj.push(obj);
							}
							nlapiLogExecution('debug', 'resultObj:', JSON.stringify(resultObj));

						}
					}
					if (resultObj.length > 0) {
						responseData = resultObj;
					} else {
						responseData = "[]";
					}
				}
				break;
				case "get_block_quantity_measurement_mapping":
					var resultObj = {};
					var filters = [];
					filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
					var cols = [];
					cols.push(new nlobjSearchColumn('custrecord_bqm_quantity'));
					cols.push(new nlobjSearchColumn('custrecord_bqm_product'));
					cols.push(new nlobjSearchColumn('custrecord_bqm_block'));
					var results = nlapiSearchRecord('customrecord_block_quantity_measurement', null, filters, cols);
					if (results) {
						for (var i = 0; i < results.length; i++) {
							if(results[i].getText('custrecord_bqm_product') && results[i].getValue('custrecord_bqm_block')){
								var bqmQuantity = results[i].getValue('custrecord_bqm_quantity');
								var productType = results[i].getText('custrecord_bqm_product').toLowerCase();
								var bqmBlockValue = results[i].getValue('custrecord_bqm_block').toLowerCase();
								resultObj[productType+"-"+bqmBlockValue] = bqmQuantity;
							}
						}
					}
					
					if (resultObj) {
						responseData = [resultObj];
					} else {
						responseData = [];
					}
					break;
		}
		response.setContentType("JAVASCRIPT");
		response.write(JSON.stringify(responseData));

	} catch (ex) {
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
		nlapiLogExecution('Debug', 'Error encountered', 'Error: ' + errorStr);
		var errData = new Object();
		errData.status = false;
		if (errorStr.indexOf("THIS_RECORD_CANNOT_BE_DELETED_BECAUSE_IT_HAS_DEPENDENT_RECORDS") > -1) {
			errData.message = "This record cannot be deleted because it has dependent records.";
		} else {
			errData.message = errorStr;
		}

		response.setContentType("JAVASCRIPT");
		response.write(JSON.stringify(errData));
	}
}