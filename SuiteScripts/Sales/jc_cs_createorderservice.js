/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NAmdConfig /SuiteScripts/amd-config.json
 */

 define(['N/record', 'N/search', 'N/log', 'N/format', 'ustyylit/integration', 'N/url', 'N/https'],
	function (record, search, log, format, ustyylit, url, https){
		function updateOrderStatus(orderObj){
			// try{
				//console.log('updateOrderStatus');
        //var orderObj = JSON.parse(order);
				var rec = record.load({
					type: orderObj.recordType
					, id:orderObj.id
					, isDynamic: true
				});
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
					//console.log(itemNumber);
					if(itemNumber % 2 != 0){
						//console.log(rec.getSublistValue('item','itemtype',i));
						//console.log(rec.getSublistValue('item','custcol_so_id',i));
						if(rec.getSublistValue('item','itemtype',i) == 'NonInvtPart'){
							if(rec.getSublistValue('item','custcol_so_id',i)){
								orders.push({
									orderno: brand+rec.getSublistValue('item','custcol_so_id',i)
								});
							}
						}
					}
				}

				var receiveOrderData = orders;
				//console.log(receiveOrderData);
				//log.debug('cs updateOrderStatus responseData', JSON.stringify(orders));
				var responseData = ustyylit.getOrderInfo(JSON.stringify(receiveOrderData));
				//log.debug('cs updateOrderStatus responseData', JSON.stringify(responseData));
				//console.log(responseData);
				var responseJSON = JSON.parse(responseData);
				//console.log(responseJSON);
				/*
					[{"orderno":"JETU14749-1",
					"order_status":"1004",
					"shipping_status":"",
					"fabric_status":"1202",
					"delivery_no":"",
					"deliver_date":"",
					"expect_shipdate":"2019-09-23"}]

					status:nlapiGetLineItemValue('item','custcol_avt_cmt_status',u),
					tracking:nlapiGetLineItemValue('item','custcol_avt_cmt_tracking',u),
					datesent:nlapiGetLineItemValue('item','custcol_avt_cmt_date_sent',u)
				*/
				var poids = [];
				for(var j=0;j<responseJSON.length; j++){
					//console.log('j ' + j);
					for(var i=0;i<rec.getLineCount('item');i++){
						//console.log('i ' + i);
						if(responseJSON[j].orderno.indexOf(rec.getSublistValue('item','custcol_so_id',i)) != -1){
							//console.log('found line');
							//console.log(StatusData.OrderStatusMap[responseJSON[j].order_status]);
							if(rec.getSublistValue('item','poid',i) && poids.indexOf(rec.getSublistValue('item','poid',i)) == -1)
								poids.push(rec.getSublistValue('item','poid',i))
							rec.selectLine({sublistId:'item', line: i});
							if(responseJSON[j].order_status && StatusData.OrderStatusMap[responseJSON[j].order_status])
							rec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_status',value:StatusData.OrderStatusMap[responseJSON[j].order_status]});

							rec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_tracking',value:responseJSON[j].delivery_no});
							if(responseJSON[j].deliver_date){
								//var formDate = format.parse({value:responseJSON[j].deliver_date,type:format.Type.DATE});
								//console.log(formDate)
								var d = new Date(responseJSON[j].deliver_date);
								//console.log(dateStr);
								rec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_date_sent',value:d});
							}
							var txt="";
							if(rec.getSublistText('item','custcol_avt_cmt_status',i))
							txt += rec.getSublistText('item','custcol_avt_cmt_status',i);
							if(rec.getSublistValue('item','custcol_avt_cmt_date_sent',i))
							txt = txt+'-'+formatDDMMYYYY(rec.getCurrentSublistValue('item','custcol_avt_cmt_date_sent'));
							if(rec.getSublistValue('item','custcol_avt_cmt_tracking',i))
							txt = txt+'-'+rec.getSublistValue('item','custcol_avt_cmt_tracking',i);
							rec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_status_text',value:txt});
							rec.commitLine({sublistId:'item'});
							//console.log('txt ' + txt);
						}
					}
				}


				rec.save({
					enableSourcing : true,
					ignoreMandatoryFields : true
				});
				// for(var k=0;k<poids.length; k++){
					// var porec = record.load({
						// type: 'purchaseorder'
						// , id: poids[k]
						// , isDynamic: true
					// });
					// for(var j=0;j<responseJSON.length; j++){
						// //console.log('j ' + j);
						// for(var i=0;i<porec.getLineCount('item');i++){
							// //console.log('i ' + i);
							// if(responseJSON[j].orderno.indexOf(porec.getSublistValue('item','custcol_so_id',i)) != -1){

								// porec.selectLine({sublistId:'item', line: i});
								// if(responseJSON[j].order_status && StatusData.OrderStatusMap[responseJSON[j].order_status])
								// porec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_status',value:StatusData.OrderStatusMap[responseJSON[j].order_status]});

								// porec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_tracking',value:responseJSON[j].delivery_no});
								// if(responseJSON[j].deliver_date){
									// //var formDate = format.parse({value:responseJSON[j].deliver_date,type:format.Type.DATE});
									// //console.log(formDate)
									// var d = new Date(responseJSON[j].deliver_date);
									// //console.log(dateStr);
									// porec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_date_sent',value:d});
								// }
								// var txt="";
								// if(porec.getSublistText('item','custcol_avt_cmt_status',i))
								// txt += porec.getSublistText('item','custcol_avt_cmt_status',i);
								// if(porec.getSublistValue('item','custcol_avt_cmt_date_sent',i))
								// txt = txt+'-'+formatDDMMYYYY(porec.getCurrentSublistValue('item','custcol_avt_cmt_date_sent'));
								// if(porec.getSublistValue('item','custcol_avt_cmt_tracking',i))
								// txt = txt+'-'+porec.getSublistValue('item','custcol_avt_cmt_tracking',i);
								// porec.setCurrentSublistValue({sublistId:'item',fieldId:'custcol_avt_cmt_status_text',value:txt});
								// porec.commitLine({sublistId:'item'});
								// //console.log('txt ' + txt);
							// }
						// }
					// }

					// porec.save({
						// enableSourcing : true,
						// ignoreMandatoryFields : true
					// });
				// }
				window.location.reload();
			// }catch(e){
				// //console.log(e);
			// }
		}
		function createOrder(orderObj){
      //console.log(order);
      //var orderObj = JSON.parse(order);
      //console.log(orderObj)
			var rec = record.load({
				type: orderObj.recordType
				, id:orderObj.id
				, isDynamic: true
			});
			log.debug('order.id', orderObj.id);
      SendToUstyylit([orderObj.id])
		}
    function SendToUstyylit(custscript_order_ids){
      var params = {
        action: "sendordertoustyylit",
        custscript_allow_cmt: "T",
        custscript_order_ids: custscript_order_ids.toString()
      };
      var scripturl = url.resolveScript({
        deploymentId:'1',
        scriptId: '179'
      })
      https.post({
        url: scripturl,
        body: JSON.stringify(params)
      });
      alert('Scheduled to execute and send to Ustyylit');
    }
		// function getCombination(productType){
		// 	var combinationcode = "";
		// 	switch(productType){
		// 		case "2-Piece-Suit" : combinationcode = "TU0101"; break;
		// 		case "3-Piece-Suit" : combinationcode = "TU0105"; break;
		// 		case "Trouser" : combinationcode = "TU0103"; break;
		// 		case "Waistcoat" : combinationcode = "TU0104"; break;
		// 		case "Shirt" : combinationcode = "TU0109"; break;
		// 		case "Overcoat" : combinationcode = "TU0108"; break;
		// 		default:
		// 	}
		// 	return combinationcode;
		// }
		// function getMeasurementMode(fpSummary){
		// 	var mode = "";
    //
		// 	if(fpSummary && fpSummary.length >0){
		// 		if(fpSummary[0].type == 'Block')
		// 			mode = "01";
		// 		if(fpSummary[0].type == 'Body')
		// 			mode = "03";
		// 	}
		// 	return mode;
		// }
		// function getFabricSku(itemname, customfabricdetails, producttype){
		// 	var code = "";
		// 	if(itemname == 'CMT Item'){
		// 		code = JSON.parse(customfabricdetails).code;
		// 	}
		// 	else{
		// 		code = itemname.split('(')[1].split(')')[0];
		// 	}
		// 	return code;
		// }
		// function getOrderDetails(rec,line, designoptions,liningname,garmentname,fitprofile, garmentclass, fabriccode, fabricmode, clf, styleno){
		// 	var measurementmode = getMeasurementMode(JSON.parse(rec.getSublistValue('item','custcol_fitprofile_summary',line)));
		// 	var liningcode = "", liningmode = "01", garmentmake = "", tryoncode = "", fitcode = "";
		// 	//var designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',line));
		// 	if(liningname){
		// 		//log.debug('designoptions', designoptions[0]);
		// 		//log.debug('liningname', liningname);
		// 		var lining = designoptions.reduce(function(o,p){
		// 			if(p.name == liningname) {
		// 				o.push(p);
		// 			}
		// 				return o;
		// 			},[]);
		// 		liningcode = lining.length>0?lining[0].value:"";
    //
		// 		if(liningcode == 'CMT Lining')
		// 			liningmode = '02';
		// 	}
		// 	var gm = designoptions.reduce(function(o,p){
		// 		if(p.name == garmentname){
		// 			o.push(p);
		// 		}
		// 		return o;
		// 		},[]);
		// 	garmentmake = gm.length>0?gm[0].value:"";
    //
		// 	// var fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',line));
		// 	if(measurementmode == '01'){
		// 		var toc = fitprofile.reduce(function(o,p){
		// 		if(p.name == 'block')
		// 			o.push(p);
		// 		return o;
		// 		},[]);
		// 		tryoncode = toc.length>0?toc[0].value:'';
		// 	}
		// 	var fc = fitprofile.reduce(function(o,p){
		// 		if(p.name == 'fit')
		// 			o.push(p)
		// 			return o;
		// 			},[]);
		// 		fitcode = fc.length>0?fc[0].value:'';
    //
		// 	return {
		// 	  "orderdetailid":rec.getSublistValue('item','custcol_so_id',line),
		// 	  "order":rec.getValue('tranid'),
		// 	  "combination":getCombination(rec.getSublistValue('item','custcol_producttype',line)),
		// 	  "mode": measurementmode,
		// 	  "fabric":[
		// 		 {
		// 			"sku": fabriccode,
		// 			"mode":fabricmode,
		// 			"Vendor":"",
		// 			"Description":"",
		// 			"Composition":"",
		// 			"Length":rec.getSublistValue('item','quantity',line).toString()
		// 		 }
		// 	  ],
		// 	  "lining":[
		// 		 {
		// 			"sku": liningcode,
		// 			"mode": liningcode?liningmode:'',
		// 			"Vendor":"",
		// 			"Description":"",
		// 			"Composition":"",
		// 			"Length":""
		// 		 }
		// 	  ],
		// 	  "cl_flag": clf,
		// 	  "styleno": styleno,
		// 	  "ptype":"01",
		// 	  "class":garmentclass,
		// 	  "made": garmentmake,
		// 	  "tryon": tryoncode,
		// 	  "fit": fitcode,
		// 	  "remark":""
		//    };
		// }
		// function getOrderOptions(rec, line, designoptions, liningprefix, othersuffix, garmentname, styleno, garmentclass){
		// 	var options = [];
		// 	//log.debug('orderoptions ' + line, JSON.stringify(designoptions[0]));
		// 	for(var z=0;z<designoptions.length;z++){
		// 		if(designoptions[z].name.indexOf(othersuffix) == -1
		// 		&& designoptions[z].name.indexOf(liningprefix) == -1
		// 		&& designoptions[z].name.indexOf(garmentname) == -1 ){
		// 			var value = designoptions[z].value;
		// 			if(designoptions[z].value == 'other'){
		// 				var other = designoptions.reduce(function(o,p){
		// 					if(p.name == designoptions[z].name + othersuffix)
		// 						o.push(p);
		// 						return o;
		// 				},[]);
		// 				value = other.length>0?other[0].value:'';
		// 			}
		// 			options.push({
		// 			  "orderdetailid": rec.getSublistValue('item','custcol_so_id',line),
		// 			  "styleno":styleno,
		// 			  "class":garmentclass,
		// 			  "option_type": designoptions[z].name,
		// 			  "option_code": value
		// 		   });
		// 		}
		// 	}
		// 	return options;
		// }
		// function getOrderMeasurements(rec, line, styleno, garmentclass, fitprofile){
		// 	var measurementmode = getMeasurementMode(JSON.parse(rec.getSublistValue('item','custcol_fitprofile_summary',line)));
		// 	var measurements = [], observations = [];
		// 	if(measurementmode == '01'){
		// 		var fitToolGarmentData;
		// 		switch(garmentclass){
		// 			case '02':	fitToolGarmentData = garmentData['FitTool_Jacket']; break;
		// 			case '05':	fitToolGarmentData = garmentData['FitTool_Trousers']; break;
		// 			case '04':	fitToolGarmentData = garmentData['FitTool_Overcoat']; break;
		// 			case '06':	fitToolGarmentData = garmentData['FitTool_Shirt']; break;
		// 			case '17':	fitToolGarmentData = garmentData['FitTool_Waistcoat']; break;
		// 		}
		// 		//BLOCK
    //
		// 		for(var i=0; i< fitprofile.length; i++){
		// 			var fitItem = fitprofile[i];
		// 			var name = fitItem.name;
		// 			var value = fitItem.value;
		// 			// for(var j=0; j< fitToolGarmentData.length; j++){
		// 			var fitToolValue = fitToolGarmentData[name.toUpperCase()];
		// 			if(fitToolValue){
		// 				if(value && parseFloat(value) != 0){
		// 					measurements.push({
		// 					  "orderdetailid": rec.getSublistValue('item','custcol_so_id',line),
		// 					  "styleno":styleno,
		// 					  "class":garmentclass,
		// 					  "item_code": fitToolValue,
		// 					  "tryon_adjustment": value,
		// 					  "value": "NULL"
		// 					});
		// 				}
		// 			}
		// 			// }
		// 		}
		// 	}else{
		// 		var bodyMeasurements = [];
		// 		var fitToolGarmentData;
		// 		switch(garmentclass){
		// 			case '02':	fitToolGarmentData = garmentData['FitTool_Jacket_GM']; break;
		// 			case '05':	fitToolGarmentData = garmentData['FitTool_Trousers_GM']; break;
		// 			case '04':	fitToolGarmentData = garmentData['FitTool_Overcoat_GM']; break;
		// 			case '06':	fitToolGarmentData = garmentData['FitTool_Shirt_GM']; break;
		// 			case '17':	fitToolGarmentData = garmentData['FitTool_Waistcoat_GM']; break;
		// 		}
		// 		for(var i=0; i< fitprofile.length; i++){
		// 			var fitItem = fitprofile[i];
		// 			var name = fitItem.name;
		// 			var value = fitItem.value;
		// 			var keys = Object.keys(fitToolGarmentData);
		// 			//var fitToolArray = Object.entries(fitToolGarmentData);
		// 			// log.debug('keys',keys);
		// 			for(var j=0; j<keys.length; j++){
		// 				// log.debug('key',keys[j]);
		// 				var garmentDataName = fitToolGarmentData[keys[j]];
		// 				// log.debug('garment data', garmentDataName);
		// 				// log.debug('name',name);
		// 				if(name.toUpperCase() == keys[j] || name.toUpperCase() == 'ALLOWANCE-'+keys[j]){
		// 					var refValue = "";
		// 					if(typeof fitToolGarmentData[keys[j]] == 'object'){
		// 						log.debug('found object', JSON.stringify(fitToolGarmentData[keys[j]]));
		// 						refValue = fitToolGarmentData[keys[j]];
		// 						var refObservationObj = refValue[0][name.toUpperCase()];
		// 						if(refObservationObj){
		// 							observations.push({
		// 								'orderdetailid': rec.getSublistValue('item','custcol_so_id',line),
		// 								'styleno': styleno,
		// 								'class': garmentclass,
		// 								'item_code': refObservationObj.NAME,
		// 								'value': refObservationObj.VALUE
		// 							});
		// 						}
		// 					}else{
		// 						log.debug('found string', fitToolGarmentData[keys[j]]);
		// 						var bm = bodyMeasurements.reduce(function(o,p){
		// 							if(p.name == fitToolGarmentData[keys[j]])
		// 								o.push(p)
		// 								return o;
		// 								},[]);
		// 						if(bm.length>0){
		// 							refValue = fitToolGarmentData[keys[j]];
		// 							bm[0].value = parseFloat(bm[0].value) + parseFloat(value);
		// 						}else{
		// 							fitToolName = refValue = fitToolGarmentData[keys[j]];
		// 							fitToolValue = fitItem.value;
		// 							measurements.push({
		// 								'orderdetailid': rec.getSublistValue('item','custcol_so_id',line),
		// 								'styleno': styleno,
		// 								'class': garmentclass,
		// 								'item_code': fitToolName,
		// 								'value': fitToolValue,
		// 								'tryon_adjustment': "NULL"
		// 							});
		// 							bodyMeasurements.push({name: fitToolName, value: fitToolValue});
		// 						}
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}
    //
		// 	return {measurements:measurements, observations: observations};
		// }
		// function createOrderDetails(rec){
		// 	var orderdetails = [], measurements = [], options = [], observations = [];
		// 	for(var i=0; i<rec.getLineCount('item'); i++){
		// 		var itemNumber = i+1;
		// 		if(itemNumber % 2 != 0){
		// 			if(rec.getSublistValue('item','itemtype',i) == 'NonInvtPart'){
		// 				var producttype = rec.getSublistValue('item','custcol_producttype',i);
		// 				var clf = '0', fabricmode = '02';
		// 				if(rec.getSublistValue('item','povendor',i) == '675' || rec.getSublistValue('item','povendor',i) == '689' || rec.getSublistValue('item','povendor',i) == '671')
		// 					clf = '1';
		// 				if(rec.getSublistValue('item','povendor',i) == '675' || rec.getSublistValue('item','povendor',i) == '689' || rec.getSublistValue('item','povendor',i) == '671'
		// 				|| rec.getSublistValue('item','povendor',i) == '17')
		// 					fabricmode = '01';
		// 				var fabriccode = getFabricSku(rec.getSublistText('item','item',i),rec.getSublistValue('item','custcol_custom_fabric_details',i),rec.getSublistValue('item','custcol_producttype',i));
		// 				if (rec.getSublistValue('item','povendor',i) == "689") {
		// 					fabriccode = "Q" + fabriccode;
		// 				}
		// 				else if (rec.getSublistValue('item','povendor',i) == "675") {
		// 					fabriccode = "FI" + fabriccode;
		// 				}
		// 				if(producttype == '2-Piece-Suit' || producttype == '3-Piece-Suit'){
		// 					if(producttype == '2-Piece-Suit'){
		// 						var garmentclass = '02',
		// 							liningname = 'li-b-j',
		// 							garmentname = 'jm-ms-j',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',i)),
		// 							styleno = "01";
    //
		// 						var details = getOrderDetails(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningname,
		// 							garmentname,
		// 							fitprofile,
		// 							garmentclass,
		// 							fabriccode,
		// 							fabricmode,
		// 							clf,
		// 							styleno
		// 						)
		// 						orderdetails.push(details);
		// 						var liningprefix = 'li-', othersuffix = '_other';
		// 						var op = getOrderOptions(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningprefix,
		// 							othersuffix,
		// 							garmentname,
		// 							styleno,
		// 							garmentclass);
		// 						options = options.concat(op);
		// 						var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 						measurements = measurements.concat(measurementObservationObj.measurements);
		// 						if(measurementObservationObj.observations.length != 0 )
		// 						observations = observations.concat(measurementObservationObj.observations);
		// 						//Trouser
		// 						var garmentclass = '05',
		// 							liningname = '',
		// 							garmentname = 'tm-m-t',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_trouser',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_trouser',i)),
		// 							styleno = "02";
    //
		// 						var details = getOrderDetails(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningname,
		// 							garmentname,
		// 							fitprofile,
		// 							garmentclass,
		// 							fabriccode,
		// 							fabricmode,
		// 							clf,
		// 							styleno
		// 						)
		// 						orderdetails.push(details);
		// 						var liningprefix = 'li-', othersuffix = '_other';
		// 						var op = getOrderOptions(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningprefix,
		// 							othersuffix,
		// 							garmentname,
		// 							styleno,
		// 							garmentclass);
		// 						options = options.concat(op);
		// 						var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 						measurements = measurements.concat(measurementObservationObj.measurements);
		// 						if(measurementObservationObj.observations.length != 0 )
		// 						observations = observations.concat(measurementObservationObj.observations);
		// 					}else {
		// 						var garmentclass = '02',
		// 							liningname = 'li-b-j',
		// 							garmentname = 'jm-ms-j',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',i)),
		// 							styleno = "01";
    //
		// 						var details = getOrderDetails(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningname,
		// 							garmentname,
		// 							fitprofile,
		// 							garmentclass,
		// 							fabriccode,
		// 							fabricmode,
		// 							clf,
		// 							styleno
		// 						)
		// 						orderdetails.push(details);
		// 						var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 						var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 						measurements = measurements.concat(measurementObservationObj.measurements);
		// 						if(measurementObservationObj.observations.length != 0 )
		// 						observations = observations.concat(measurementObservationObj.observations);
		// 						//Trouser
		// 						var garmentclass = '05',
		// 							liningname = '',
		// 							garmentname = 'tm-m-t',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_trouser',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_trouser',i)),
		// 							styleno = "02";
    //
		// 						var details = getOrderDetails(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningname,
		// 							garmentname,
		// 							fitprofile,
		// 							garmentclass,
		// 							fabriccode,
		// 							fabricmode,
		// 							clf,
		// 							styleno
		// 						)
		// 						orderdetails.push(details);
		// 						var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 						var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 						measurements = measurements.concat(measurementObservationObj.measurements);
		// 						if(measurementObservationObj.observations.length != 0 )
		// 						observations = observations.concat(measurementObservationObj.observations);
		// 						var garmentclass = '17',
		// 						liningname = 'li-bl-w',
		// 						garmentname = 'm-ms-w',
		// 						designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_waistcoat',i)),
		// 						fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_waistcoat',i)),
		// 						styleno = "03";
    //
		// 						var details = getOrderDetails(
		// 							rec,
		// 							i,
		// 							designoptions,
		// 							liningname,
		// 							garmentname,
		// 							fitprofile,
		// 							garmentclass,
		// 							fabriccode,
		// 							fabricmode,
		// 							clf,
		// 							styleno
		// 						)
		// 						orderdetails.push(details);
		// 						var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 						var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 						measurements = measurements.concat(measurementObservationObj.measurements);
		// 						if(measurementObservationObj.observations.length != 0 )
		// 						observations = observations.concat(measurementObservationObj.observations);
		// 					}
		// 				}
		// 				else{
		// 					switch(producttype){
		// 						case 'Jacket' :
		// 							var garmentclass = '02',
		// 								liningname = 'li-b-j',
		// 								garmentname = 'jm-ms-j',
		// 								designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',i)),
		// 								fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',i)),
		// 								styleno = "01";
    //
		// 							var details = getOrderDetails(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningname,
		// 								garmentname,
		// 								fitprofile,
		// 								garmentclass,
		// 								fabriccode,
		// 								fabricmode,
		// 								clf,
		// 								styleno
		// 							)
		// 							orderdetails.push(details);
		// 							var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 							//var op = designoptions.filter(function(o){return o.name != 'jm-ms-j' && o.name != 'li-b-j' && o.name.indexOf('_other') == -1;});
		// 							var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 							measurements = measurements.concat(measurementObservationObj.measurements);
		// 							if(measurementObservationObj.observations.length != 0 )
		// 							observations = observations.concat(measurementObservationObj.observations);
		// 							break;
    //
		// 						case 'Trouser':
		// 							var garmentclass = '05',
		// 							liningname = '',
		// 							garmentname = 'tm-m-t',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_trouser',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_trouser',i)),
		// 							styleno = "01";
    //
		// 							var details = getOrderDetails(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningname,
		// 								garmentname,
		// 								fitprofile,
		// 								garmentclass,
		// 								fabriccode,
		// 								fabricmode,
		// 								clf,
		// 								styleno
		// 							)
		// 							orderdetails.push(details);
		// 							var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 							var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 							measurements = measurements.concat(measurementObservationObj.measurements);
		// 							if(measurementObservationObj.observations.length != 0 )
		// 							observations = observations.concat(measurementObservationObj.observations);
		// 							break;
    //
		// 						case 'Waistcoat':
    //
		// 							var garmentclass = '17',
		// 							liningname = 'li-bl-w',
		// 							garmentname = 'm-ms-w',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_waistcoat',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_waistcoat',i)),
		// 							styleno = "01";
    //
		// 							var details = getOrderDetails(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningname,
		// 								garmentname,
		// 								fitprofile,
		// 								garmentclass,
		// 								fabriccode,
		// 								fabricmode,
		// 								clf,
		// 								styleno
		// 							)
		// 							orderdetails.push(details);
		// 							var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 							var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 							measurements = measurements.concat(measurementObservationObj.measurements);
		// 							if(measurementObservationObj.observations.length != 0 )
		// 							observations = observations.concat(measurementObservationObj.observations);
    //
		// 							break;
		// 						case 'Overcoat':
		// 							var garmentclass = '04',
		// 							liningname = 'li-bl-o',
		// 							garmentname = 'm-msl-o',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_overcoat',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_overcoat',i)),
		// 							styleno = "01";
    //
		// 							var details = getOrderDetails(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningname,
		// 								garmentname,
		// 								fitprofile,
		// 								garmentclass,
		// 								fabriccode,
		// 								fabricmode,
		// 								clf,
		// 								styleno
		// 							)
		// 							orderdetails.push(details);
    //
		// 							var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 							var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 							measurements = measurements.concat(measurementObservationObj.measurements);
		// 							if(measurementObservationObj.observations.length != 0 )
		// 							observations = observations.concat(measurementObservationObj.observations);
    //
		// 							break;
		// 						case 'Shirt':
		// 							var garmentclass = '06',
		// 							liningname = '',
		// 							garmentname = 'sm-ms-s',
		// 							designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_shirt',i)),
		// 							fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_shirt',i)),
		// 							styleno = "01";
    //
		// 							var details = getOrderDetails(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningname,
		// 								garmentname,
		// 								fitprofile,
		// 								garmentclass,
		// 								fabriccode,
		// 								fabricmode,
		// 								clf,
		// 								styleno
		// 							)
		// 							orderdetails.push(details);
		// 							var liningprefix = 'li-', othersuffix = '_other';
		// 							var op = getOrderOptions(
		// 								rec,
		// 								i,
		// 								designoptions,
		// 								liningprefix,
		// 								othersuffix,
		// 								garmentname,
		// 								styleno,
		// 								garmentclass);
		// 							options = options.concat(op);
		// 							var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
		// 							measurements = measurements.concat(measurementObservationObj.measurements);
		// 							if(measurementObservationObj.observations.length != 0 )
		// 							observations = observations.concat(measurementObservationObj.observations);
    //
		// 							break;
		// 					}
    //
		// 				}
		// 			}else{
		// 					//Not Non Inventory.. hmm
		// 			}
		// 		}
		// 	}
		// 	return {orderdetails:orderdetails, measurements:measurements, options:options, observations:observations};
    //
		// }
		function pageInit(){

		}
		return {
		   createOrder:createOrder,
		   updateOrderStatus: updateOrderStatus,
		   pageInit:pageInit
		}
	}
 );
