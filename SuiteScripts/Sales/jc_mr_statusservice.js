/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/amd-config.json
 */
define(['N/search', 'N/record', 'N/runtime', 'N/log', 'N/format', 'ustyylit/integration'],

function (search, record, runtime, log, format, ustyylit) {
    function getInputData() {

      // var searchId = runtime.getCurrentScript().getParameter({name:'custscript_savedsearchid'});
        // var searchObj = search.load({
            // id: searchId
          // });
        // var soIds = runtime.getCurrentScript().getParameter({name:'custscript_sonumbers'});
        // try{
        // if(soIds){
          // soIds = soIds.split(',');
          // var soFilter = search.createFilter({name:'internalid',operator:search.Operator.ANYOF,values:soIds});
          // searchObj.filters.push(soFilter);
        // }
        // //log.debug('filters',searchObj.filters);
      // }catch(err){
        // log.error('Input Data Error Details',err);
      // }
		//Search all orders that needs to update status
		var rs = search.create({
			type : "salesorder",
			filters : [//['internalid','is','925674'], "AND",
			["trandate","after","1/9/2019"],"AND",["status", "anyof", ["SalesOrd:G","SalesOrd:H"]]
			 , "AND", ["mainline", "is", 'true']
			 , "AND", [["custbody_isinvoicepaid","is",'false'], "OR", ["custbody_isleftfactorydelivered","is",'false']]],
			columns : [
				search.createColumn({
					name : "internalid",
					sort : search.Sort.ASC
			}),search.createColumn({
					name : "tranid",
					sort : search.Sort.ASC
			})]
		});
		var searchResultCount = rs.runPaged().count;
		log.debug('searchResultCount',searchResultCount);
        return rs;
    }

    function map(context) {
        //get incremental update flag
        log.debug('debug', 'context',JSON.stringify(context));
		var result = JSON.parse(context.value);
		//log.debug('result', result.recordType + " " + result.id);
		var mappingData = {
		  "OrderStatus": {
			"1001": '6',//"On hold",
			"1002": '7',//"Processed",
			"1003": '8',//"Confirmed",
			"1004": '2',//"In production",
			"1005": '9',//"Left factory",
			"1006": '10',//"Delivered",
			"1007": '11',//"Cancelled",
			"1009": '14'//"Production Complete"
		  },
		  "FabricStatus": {
			"1202": "Fabric Ready"
		  },
		  "ShippingStatus": {
			"1301": "Internal Transition",
			"1302": "Direct shipment",
			"1303": "Domestic delivery"
		  },
		  "OrderStatusInternalId": {
			"ON HOLD": "6",
			"PROCESSED": "7",
			"CONFIRMED": "8",
			"IN PRODUCTION": "2",
			"LEFT FACTORY": "9",
			"DELIVERED": "10",
			"CANCELLED": "11",
			"PRODUCTION COMPLETE": "14"
		  }
		};
		var rec = record.load({
			type: result.recordType
			, id:result.id
			, isDynamic: true
		});
		log.debug('order.id', result.id);
		var order = getOrderSOID(rec);
						
		var orderData = order;
		log.debug('ss status service orderData', orderData);
		var responseData = ustyylit.getOrderInfo(JSON.stringify(orderData));
		log.debug('ss status service responseData', responseData);
		//[{"orderno":"JETU14513-1","order_status":"1005","shipping_status":"1302","fabric_status":"1202","delivery_no":"4247863955",
		//"express_company":"0016","deliver_date":"2019-11-18","expect_shipdate":"2019-11-18","Process":[],
		//"Consume":[{"ft_type":"01","ftcode":"FI10013.132.2","consume":"3.36"},{"ft_type":"02","ftcode":"TR435","consume":"1.22"}]}]
		
		//[{"orderno":"JETU17434-1","order_status":"1002","shipping_status":"","fabric_status":"","delivery_no":"","express_company":"",
		//"deliver_date":"","expect_shipdate":"","Process":[],"Consume":[]},
		//{"orderno":"JETU17434-2","order_status":"1002","shipping_status":"","fabric_status":"","delivery_no":"","express_company":"",
		//"deliver_date":"","expect_shipdate":"","Process":[],"Consume":[{"ft_type":"01","ftcode":"TSHT004","consume":"0.00"}]}]	
		if(responseData){
		var jsonData = JSON.parse(responseData);
		for(var i =0; i<jsonData.length; i++){
			for(var k=0; k<rec.getLineCount('item'); k++){
				var soid = getSOID(jsonData[i].orderno);
				rec.selectLine('item',k)
				if(rec.getSublistValue('item','custcol_so_id',k) == soid){
					var txt = '',
					deliveryDateMessage = jsonData[i].delivery_no?jsonData[i].delivery_no:"waiting for factory confirm";
					deliveryDateMessage = jsonData[i].mother_delivery_no? deliveryDateMessage+"/"+jsonData[i].mother_delivery_no:deliveryDateMessage;
					if(jsonData[i].order_status){
						rec.setCurrentSublistValue('item','custcol_avt_cmt_status',mappingData.OrderStatus[jsonData[i].order_status]);	
						txt = mappingData.OrderStatus[jsonData[i].order_status];
					}
					
					if(jsonData[i].expect_shipdate){
						var dateObj = jsonData[i].expect_shipdate.split('-');
						var d = dateObj[2], m = dateObj[1], y = dateObj[0];
						var dateStr = d + '/' + m + '/' + y;
						var dateNS = format.parse({value:dateStr,type:format.Type.DATE});
						//log.debug('custcol_avt_cmt_date_sent', dateStr);
						rec.setCurrentSublistValue('item','custcol_avt_cmt_date_sent',dateNS);
						txt += '-'+dateStr;
					}
					
					if(jsonData[i].delivery_no){
						rec.setCurrentSublistValue('item','custcol_avt_cmt_tracking',deliveryDateMessage);	
						txt += '-'+deliveryDateMessage;
					}
					if(txt != ''){
						rec.setCurrentSublistValue('item','custcol_avt_cmt_status_text',txt);
					}
				}
				rec.commitLine('item');
			}					
		}
		rec.save({
			enableSourcing : true,
			ignoreMandatoryFields : true
		});
		}
      }

	function getSOID(orderno){
		var newsoid = orderno;
		if(orderno.indexOf('GCTU') != -1){
			newsoid = orderno.replace('GCTU','');
		}else if(orderno.indexOf('JETU') != -1){
			newsoid = orderno.replace('JETU','');
		}else if(orderno.indexOf('TU') != -1){
			newsoid = orderno.replace('TU','');
		}
		return newsoid
	}
	function getOrderSOID(rec){
		
		var brand = "TU";
		if(rec.getValue('entity') == '5' || rec.getValue('entity') == '75')
			brand = "TU";
		else if(rec.getValue('entity') == '669')
			brand = "GCTU";
		else
			brand = "JETU";
		var tranid = rec.getValue('tranid');
		var orders =[];
		for(var i=0; i<rec.getLineCount('item'); i++){
			var itemNumber = i+1;
			if(itemNumber % 2 != 0){
				if(rec.getSublistValue('item','itemtype',i) == 'NonInvtPart'){
					if(rec.getSublistValue('item','custcol_so_id',i)){
						orders.push({
							orderno: brand+rec.getSublistValue('item','custcol_so_id',i)
						});
						if(brand == "TU"){
							orders.push({
								orderno: "JETU"+rec.getSublistValue('item','custcol_so_id',i)
							});
						}
						if(brand == "JETU"){
							orders.push({
								orderno: "TU"+rec.getSublistValue('item','custcol_so_id',i)
							});
						}
					}
				}
			}
		}
		return orders;
	}
    function reduce(context) {
		return true;
    }
    
    /**
    * [summarize description]
    * @param  {[type]} summary [description]
    * @return {[type]}         [description]
    */
    function summarize(summary) {
      log.debug('Summary Time','Total Seconds: '+summary.seconds);
      log.debug('Summary Usage', 'Total Usage: '+summary.usage);
      log.debug('Summary Yields', 'Total Yields: '+summary.yields);
      
      log.debug('Input Summary: ', JSON.stringify(summary.inputSummary));
      log.debug('Map Summary: ', JSON.stringify(summary.mapSummary));
      log.debug('Reduce Summary: ', JSON.stringify(summary.reduceSummary));
      
      //Grab Map errors
      summary.mapSummary.errors.iterator().each(function(key, value) {
        log.error(key, 'ERROR String: '+value);
        
        
        return true;
      });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});
