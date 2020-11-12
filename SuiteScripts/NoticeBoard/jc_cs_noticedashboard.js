/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @version 1.0.0
 */

 define(['N/record', 'N/search', 'N/log', 'N/format'],
	function (record, search, log, format){

		function pageInit(){

		}
    function fieldChanged(context){

  		var sublistName = context.sublistId;
  		var fieldName = context.fieldId;
  		var currentRecord = context.currentRecord;
  		var line = context.line;
      var tailors = [];
      if(fieldName == 'custrecord_nb_tailorregion' && currentRecord.getValue('custrecord_nb_tailorregion')){
        //console.log('Tailor Origin ' +currentRecord.getValue('custrecord_nb_tailorregion'))
        var rs = search.create({
    				type: search.Type.CUSTOMER,
    				filters: [
    					['isinactive','is',false],"AND",["custentity_cmt_tailor_region","anyof",currentRecord.getValue('custrecord_nb_tailorregion')]
    				],
    				columns: [search.createColumn({	name: "internalid",	sort: search.Sort.ASC})]
    		});
    		var searchResultCount = rs.runPaged().count;
        //console.log('result count ' + searchResultCount)
    		if(searchResultCount != 0){
          rs.run().each(function(result) {
            tailors.push(result.id);
            return true;
          });
          //console.log('tailors ' +tailors)
          currentRecord.setValue({
            fieldId: 'custrecord_nb_tailors',
            value: tailors
          })
    		}
      }
      //console.log(tailors);
  	}
		return {
		   pageInit:pageInit,
       fieldChanged: fieldChanged
		}
	}
 );
