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
    var action = request.getParameter('action');
    var searchdetails = request.getParameter('searchdetails'), searchJSON = {};
    if(searchdetails && searchdetails.length>0){
      searchJSON = JSON.parse(searchdetails);
    }
    switch (method)
		{
			case 'GET':
        if(action == 'getclient'){
          Application.sendContent(recordFunctions.getClient(id));
        }else{
				if(!id){
					var clientsList = recordFunctions.getClientsList(null, page, parent, searchJSON);
					Application.sendContent(clientsList);
				}else{
					var clientsDetails = recordFunctions.getClientsList(id, null, parent);
					Application.sendContent(clientsDetails);
				}
        }
			break;
			case 'PUT':
        var new_client_id = recordFunctions.updateClient(data);
        Application.sendContent(recordFunctions.getClient(new_client_id));
				break;
      case 'POST':
        var new_client_id = recordFunctions.createClient(data);
        Application.sendContent(recordFunctions.getClient(new_client_id));
				break;
      case 'DELETE':
        nlapiSubmitField('customrecord_sc_tailor_client',id,'isinactive','T');
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
  , updateClient: function(data){
    try{
      var clientRecord = nlapiLoadRecord('customrecord_sc_tailor_client', data.internalid);
      var keys = Object.keys(data);
      for(var i=0;i<keys.length;i++){
        if(keys[i] != 'internalid' && keys[i] != 'id' && keys[i] != 'datecreated'){
          if(keys[i] == 'custrecord_tc_tailor')
            clientRecord.setFieldValue(keys[i], nlapiGetUser());
          else
            clientRecord.setFieldValue(keys[i], this.sanitize(data[keys[i]].toString()));
        }
      }
      var id = nlapiSubmitRecord(clientRecord);
      return id;
    }catch(e){
        nlapiLogExecution("error","create case", e);
    }
  }
  , createClient: function(data){
    try{
      var newClientRecord = nlapiCreateRecord('customrecord_sc_tailor_client');
      var keys = Object.keys(data);
      for(var i=0;i<keys.length;i++){
        if(keys[i] == 'custrecord_tc_tailor')
          newClientRecord.setFieldValue(keys[i], nlapiGetUser());
        else
          newClientRecord.setFieldValue(keys[i], this.sanitize(data[keys[i]].toString()));
      }
      var caseid = nlapiSubmitRecord(newClientRecord);
      return caseid;
    }catch(e){
        nlapiLogExecution("error","create case", e);
    }
  }
  , getClient: function(id){
    var clientRec = nlapiLoadRecord('customrecord_sc_tailor_client', id);
    var returnObj = {
      id: clientRec.id,
      internalid: clientRec.id,
      custrecord_tc_first_name: clientRec.getFieldValue('custrecord_tc_first_name')||"",
      custrecord_tc_last_name: clientRec.getFieldValue('custrecord_tc_last_name')||"",
      custrecord_tc_dob: clientRec.getFieldValue('custrecord_tc_dob')||"",
      custrecord_tc_company: clientRec.getFieldValue('custrecord_tc_company')||"",
      custrecord_tc_email: clientRec.getFieldValue('custrecord_tc_email')||"",
      custrecord_tc_addr1: clientRec.getFieldValue('custrecord_tc_addr1')||"",
      custrecord_tc_addr2: clientRec.getFieldValue('custrecord_tc_addr2')||"",
      custrecord_tc_city: clientRec.getFieldValue('custrecord_tc_city')||"",
      custrecord_tc_state: clientRec.getFieldValue('custrecord_tc_state')||"",
      custrecord_tc_country: clientRec.getFieldValue('custrecord_tc_country')||"",
      custrecord_tc_zip: clientRec.getFieldValue('custrecord_tc_zip')||"",
      custrecord_tc_phone: clientRec.getFieldValue('custrecord_tc_phone')||"",
      custrecord_tc_tailor: clientRec.getFieldValue('custrecord_tc_tailor')||"",
      custrecord_tc_notes: clientRec.getFieldValue('custrecord_tc_notes')||"",
      datecreated: clientRec.getFieldValue('created')
    };
    return returnObj;

  }
  , getClientsList: function(id, page, parent, searchdetails){
    var columns = [], filters=[];
    columns.push(new nlobjSearchColumn('internalid'));
    columns.push(new nlobjSearchColumn('custrecord_tc_first_name'));
    columns.push(new nlobjSearchColumn('custrecord_tc_last_name'));
    columns.push(new nlobjSearchColumn('custrecord_tc_dob'));
    columns.push(new nlobjSearchColumn('custrecord_tc_company'));
    columns.push(new nlobjSearchColumn('custrecord_tc_email'));
    columns.push(new nlobjSearchColumn('custrecord_tc_addr1'));
    columns.push(new nlobjSearchColumn('custrecord_tc_addr2'));
    columns.push(new nlobjSearchColumn('custrecord_tc_city'));
    columns.push(new nlobjSearchColumn('custrecord_tc_state'));
    columns.push(new nlobjSearchColumn('custrecord_tc_country'));
    columns.push(new nlobjSearchColumn('custrecord_tc_zip'));
    columns.push(new nlobjSearchColumn('custrecord_tc_phone'));
    columns.push(new nlobjSearchColumn('custrecord_tc_tailor'));
    columns.push(new nlobjSearchColumn('custrecord_tc_notes'));
    if(id){
      filters.push(new nlobjSearchFilter('internalid',null,'anyof',id));
    }
    if(parent)
      filters.push(new nlobjSearchFilter('custrecord_tc_tailor',null,'anyof',parent));
    var jsonSearchInput = searchdetails;
    if(jsonSearchInput){
      if(jsonSearchInput.clientname || jsonSearchInput.clientemail || jsonSearchInput.clientphone){

        if(jsonSearchInput.clientname && jsonSearchInput.clientname != ""){
          var splitName = jsonSearchInput.clientname.split(' ');

          if(splitName.length > 1){
            var f = new nlobjSearchFilter("formulatext","null","contains",jsonSearchInput.clientname.toLowerCase()).setFormula("CONCAT(CONCAT(LOWER({custrecord_tc_first_name}), ' '),LOWER({custrecord_tc_last_name}))");
            filters.push(f);
          }else{
            var f = new nlobjSearchFilter("formulatext","null","contains",jsonSearchInput.clientname.toLowerCase()).setFormula("CONCAT(CONCAT(LOWER({custrecord_tc_first_name}), ' '),LOWER({custrecord_tc_last_name}))");
            filters.push(f);
          }
        }
        if(jsonSearchInput.clientemail && jsonSearchInput.clientemail != ""){
          var f = new nlobjSearchFilter("custrecord_tc_email","null","startswith",jsonSearchInput.clientemail);
          filters.push(f);
        }
        if(jsonSearchInput.clientphone && jsonSearchInput.clientphone != ""){
          var f = new nlobjSearchFilter("custrecord_tc_phone","null","startswith",jsonSearchInput.clientphone);
          filters.push(f);
        }
      }
    }

    filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

    var search = nlapiCreateSearch('customrecord_sc_tailor_client',filters,columns);
    var resultSet = search.runSearch();
    var searchid = 0, resultsperpage = 20;
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

    //if(!id){
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
    //}else{
    //  nlapiLogExecution('debug','REsults',results)
    //  return results[0];
    //}
  }
};
