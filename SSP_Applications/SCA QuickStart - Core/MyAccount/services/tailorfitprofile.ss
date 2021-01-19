/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Nov 2020     Kerwin Ang
 *
 */

function service(request, response){
	try{
    var method = request.getMethod();
    var id = request.getParameter('internalid');
    var page = request.getParameter('page');
    var parent = request.getParameter('parent');
    var data = JSON.parse(request.getBody() || '{}');
    var clientid = request.getParameter('clientid');
    switch (method)
		{
			case 'GET':
				if(!id){
					var clientsList = recordFunctions.getFitProfileList(page,clientid,parent);
					Application.sendContent(clientsList);
				}else{
					var clientsDetails = recordFunctions.getFitProfile(id)
					Application.sendContent(clientsDetails);
				}

			break;
			case 'PUT':
        var new_client_id = recordFunctions.updateFitProfile(data);
        Application.sendContent(recordFunctions.getFitProfile(new_client_id));
				break;
      case 'POST':
        var new_client_id = recordFunctions.createFitProfile(data);
        Application.sendContent(recordFunctions.getFitProfile(new_client_id));
				break;
      case 'DELETE':
        nlapiSubmitField('customrecord_sc_fit_profile',id,'isinactive','T');
        Application.sendContent({'status': 'ok'});
				break;
			default:
				Application.sendError(methodNotAllowedError);
		}

	} catch(ex) {
    nlapiLogExecution('error',ex.message)
	}
}


var recordFunctions = {
  sanitize: function (text) {
    'use strict';
    return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
  }
  , updateFitProfile: function(data){
    try{
      var clientRecord = nlapiLoadRecord('customrecord_sc_fit_profile', data.internalid);
      var keys = Object.keys(data);
      for(var i=0;i<keys.length;i++){
        if( keys[i] != 'custrecord_fp_measure_type_text' &&
            keys[i] != 'custrecord_fp_product_type_text' &&
            keys[i] != 'internalid' &&
            keys[i] != 'id' &&
            keys[i] != 'datecreated')
          clientRecord.setFieldValue(keys[i], this.sanitize(data[keys[i]].toString()));
      }
      var id = nlapiSubmitRecord(clientRecord);
      return id;
    }catch(e){
        nlapiLogExecution("error","update fitprofile", e);
    }
  }
  , createFitProfile: function(data){
    try{
      var newClientRecord = nlapiCreateRecord('customrecord_sc_fit_profile');
      var keys = Object.keys(data);
      for(var i=0;i<keys.length;i++){
          newClientRecord.setFieldValue(keys[i], this.sanitize(data[keys[i]].toString()));
      }
      var caseid = nlapiSubmitRecord(newClientRecord);
      return caseid;
    }catch(e){
        nlapiLogExecution("error","create fitprofile", e);
    }
  }
  , getFitProfile: function(id){
    var clientRec = nlapiLoadRecord('customrecord_sc_fit_profile', id);
    var returnObj = {
      id: clientRec.id,
      internalid: clientRec.id,
      name: clientRec.getFieldValue('name')||"",
      custrecord_fp_client: clientRec.getFieldValue('custrecord_fp_client')||"",
      custrecord_fp_product_type: clientRec.getFieldValue('custrecord_fp_product_type')||"",
      custrecord_fp_measure_type: clientRec.getFieldValue('custrecord_fp_measure_type')||"",
      custrecord_fp_product_type_text: clientRec.getFieldText('custrecord_fp_product_type')||"",
      custrecord_fp_measure_type_text: clientRec.getFieldText('custrecord_fp_measure_type')||"",
      custrecord_fp_measure_value: clientRec.getFieldValue('custrecord_fp_measure_value')||"",
      custrecord_fp_block_value: clientRec.getFieldValue('custrecord_fp_block_value')||"",
      lastmodified: clientRec.getFieldValue('lastmodified'),
      datecreated: clientRec.getFieldValue('created')
    };
    return returnObj;

  }
  , getFitProfileList: function(page,clientid,parent){
    var columns = [], filters=[];
    columns.push(new nlobjSearchColumn('internalid'));
    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('custrecord_fp_client'));
    columns.push(new nlobjSearchColumn('custrecord_fp_product_type').setSort(false));
    columns.push(new nlobjSearchColumn('custrecord_fp_measure_type'));
    columns.push(new nlobjSearchColumn('custrecord_fp_measure_value'));
    columns.push(new nlobjSearchColumn('custrecord_fp_block_value'));
    columns.push(new nlobjSearchColumn('lastmodified').setSort(true));
    filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

    if(parent)
      filters.push(new nlobjSearchFilter('custrecord_tc_tailor','custrecord_fp_client','anyof',parent));
    if(clientid)
      filters.push(new nlobjSearchFilter('custrecord_fp_client',null,'anyof',clientid));
    var search = nlapiCreateSearch('customrecord_sc_fit_profile',filters,columns);
    var resultSet = search.runSearch();
    var searchid = 0, resultsperpage = 100;
    var res,cols, results = [];

    do{
      res = resultSet.getResults(searchid,searchid+1000);
      if(res && res.length > 0){
        if(!cols)
        cols = res[0].getAllColumns();
        for(var i=0; i<res.length; i++){
          var resultsdata = {};
          for(var j=0; j<cols.length; j++){
            var jointext= cols[j].join?cols[j].join+"_":'';
            resultsdata[jointext+cols[j].name] = res[i].getValue(cols[j]);
            if(res[i].getText(cols[j]))
            resultsdata[jointext+cols[j].name+"text"] = res[i].getText(cols[j]);
          }
          results.push(resultsdata);
        }
        searchid += res.length;
      }
    }while(res && res.length == 1000);

      var page = page ? page:1;
      var range_start = ((page-1) * resultsperpage)
      ,	range_end = (page * resultsperpage);
      results = results.slice(range_start, range_end);
      returnObj = {
        records: results,
        page: page,
        recordsPerPage: resultsperpage,
        totalRecordsFound: searchid
      }
      return returnObj;
  }
};
