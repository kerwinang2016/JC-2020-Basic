/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NAmdConfig /SuiteScripts/amd-config.json
 */
 define(['N/record', 'N/search', 'N/log', 'N/format', 'N/file', 'N/email', 'ustyylit/integration'], 
	function runScheduledScript(record, search, log, format, file, nlemail, ustyylit){
		
		function execute(){
			//Search all orders that are pending approval
			var orders = exportOrdersList_();
			
		}
		function exportOrdersList_(context){
			var data = {};	
			data.contents = "SO ID,Date,Item,Vendor,Additional Fabric Surcharge,Block Value,Fabric Quantity\n";
			data.action = 'downloadccsv';
			data = generateOrdersExport(data);
			var encodedUri = encodeURI(data);
			var f = file.create({
				name: 'TailorOrder.csv',
				fileType: file.Type.CSV,
				contents: data,
				encoding: file.Encoding.UTF8,
				folder: '2042'
			})
			var f_id = f.save();
			
			// var link = document.createElement("a");
			// link.setAttribute("href", encodedUri);
			// link.setAttribute("download", "TailorOrders.csv");
			// document.body.appendChild(link); 
			// link.click();
		}
		function getFitProfileValues(){
			var rs = search.load({id: 'customsearch_fit_profile_list', type: 'customrecord_sc_fit_profile'});
			var searchResultCount = rs.runPaged().count;
			var index = 0;
			var searchResult;
			var data = [];
			do{
				searchResult = rs.run().getRange({
					start: index,
					end: index+1000
				});
				index = index + searchResult.length;
				var rscols = searchResult[0].columns;
				for (var i = 0; i < searchResult.length; i++) {				
					var result = searchResult[i];
					var rscols = result.columns;
					
					data.push({
						'internalid': result.getValue('internalid'),
						'blockvalue': result.getValue('custrecord_fp_block_value')
					});

				}
			}while(searchResult.length == 1000)
			return data;
		}
		function generateOrdersExport(data){
			var fitprofiles = getFitProfileValues();
			log.debug('fitprofiles', fitprofiles.length);
			var rs = search.load({
				id: "customsearch_tailor_orders",
				type : "transaction"
			});
			//Sorting tailor client date created
			rs.columns[0].sort = search.Sort.DESC;
			
			var searchResultCount = rs.runPaged().count;
			
			var OrdersList = [];
			var index = 0;
			var searchResult;
			do{
				searchResult = rs.run().getRange({
					start: index,
					end: index+1000
				});
				var rscols = searchResult[0].columns;
				for (var i = 0; i < searchResult.length; i++) {
				// rs.run().each(function(result) {
					
					var result = searchResult[i];
					var rscols = result.columns;
					var bval = '0';
					if(result.getValue(rscols[5])){
						var summary = JSON.parse(result.getValue(rscols[5]));
						log.debug('has summary', result.getValue(rscols[5]));
						for(var j=0;j<summary.length;j++){
							if(summary[j].blockvalue){
								log.debug('has summary block value', summary[j].blockvalue);
								if(summary[j].blockvalue){
									var bval_1 = parseFloat(bval.replace('R',''));
									var summary_1 = parseFloat(summary[j].blockvalue.replace('R',''));
									log.debug('bval summary 1', bval_1 + " " + summary_1);
									if(bval_1 < summary_1){
										log.debug('bval replaced', summary[j].blockvalue);
										bval = summary[j].blockvalue;
									}
								}
							}else{
								if(summary[j].id){
									log.debug('hassummary id ', summary[j].id);
									var found = fitprofiles.reduce(function(o,p){
										if(p.internalid == summary[j].id) {
											o.push(p);
										}
										return o;
									},[]);
									if(found.length>0){
										log.debug('found summary', found.length);
										var bval_1 = parseFloat(bval.replace('R',''));
										var found_1 = parseFloat(found[0].blockvalue.replace('R',''));
										log.debug('bval found_1 1', bval_1 + " " + found_1);
										if(bval_1 < found_1){
											bval = found[0].blockvalue;
										}
									}
								}
							}
						}
					}
					OrdersList.push({
						'custpage_so_id': result.getValue(rscols[0]),
						'custpage_trandate': result.getValue(rscols[1]),
						'custpage_item': result.getText(rscols[2]),
						'custpage_vendor': result.getText(rscols[3]),
						'custpage_additional_fabric_surcharge': result.getValue(rscols[4])?result.getValue(rscols[4]):0,
						'custpage_blockvalue': bval,
						'custpage_fabric_quantity': result.getValue(rscols[6])
					});
					
					// return true;
				// });
				//break;
				}
				//break;
				index = index + searchResult.length;
			}while(searchResult.length == 1000)
			for(var i=0; i<OrdersList.length; i++){			
				data.contents += OrdersList[i].custpage_so_id +',';
				data.contents += OrdersList[i].custpage_trandate +',';
				data.contents += OrdersList[i].custpage_item +',';
				data.contents += OrdersList[i].custpage_vendor +',';
				data.contents += OrdersList[i].custpage_additional_fabric_surcharge +',';
				data.contents += OrdersList[i].custpage_blockvalue +',';
				data.contents += OrdersList[i].custpage_fabric_quantity;
				data.contents += '\n';
			}
			//console.log(data);
			return data.contents;
		}
	
		function getPendingApprovalOrders(){
			var rs = search.create({
				type : "salesorder",
				filters : [
				["internalid","anyof",["673702"]],"AND",
				["type", "anyof", "SalesOrd"]
				,"AND", ["mainline", "is", true]//, "AND", ["status", "anyof", "SalesOrd:A"]
				//"AND", ["custbodycustbody_api_sales_ord_st_json","isnot","Success"], "AND", ["custbodycustbody_api_sales_ord_st_json","isnot","Old Order"]
				],
				columns : [
					search.createColumn({
						name : "internalid",
						sort : search.Sort.ASC
				}),search.createColumn({
						name : "tranid",
						sort : search.Sort.ASC
				})]
			});
			var orders = [];
			var orderLists = [];
			var searchResultCount = rs.runPaged().count;
			rs.run().each(function(result) {
				//Create Orders
				var order = [];
				var orderObj = createOrder(result);
				order.push(orderObj);
				orderLists.push(orderObj);
				//Send it
				
				
				var receiveOrderData = {
					"Action": "CreateOrder",
					"orders": {"Order":order}
				}
				var f = file.create({
					name:result.getValue('tranid')+'_orderJSON.txt',
					fileType: file.Type.PLAINTEXT,
					contents: JSON.stringify(receiveOrderData),
					encoding: file.Encoding.UTF8,
					folder: '2042'
				})
				var f_id = f.save();
				
				var responseData = ustyylit.receiveOrder(receiveOrderData);
				orders.push({
					id:result.id,
					type: result.recordType
				});
				nlemail.send({
					author: 97,
					recipients: 119,
					subject: result.getValue('tranid') + ' pushed using NS Service',
					body: "Response Data returned from Ustyylit \n" + responseData + "\n **Attached the JSON text.",
					attachments: [f]//file.load({id: f_id})			
				});
				return true;
			});
				
			return orders;
		}
		function createOrder(order){
			
			var rec = record.load({
				type: order.recordType
				, id:order.id
				, isDynamic: true
			});
			log.debug('order.id', order.id);
			var brand = "TU";
			if(rec.getValue('entity') == '5' || rec.getValue('entity') == '5')
				brand = "TU";
			else if(rec.getValue('entity') == '669')
				brand = "GCTU";
			else
				brand = "JETU";
			
			var shopname = rec.getText('entity');
			if(!isNaN(shopname.split(" ")[0])){
				shopname = shopname.split(" ");
				shopname.shift();
				shopname = shopname.join(' ');
			}
			var addrSubrecord = rec.getSubrecord({fieldId: 'shippingaddress'}),
				country = addrSubrecord.getValue("country"),
				addressee = addrSubrecord.getValue("addressee"),
				state = addrSubrecord.getValue('state'),
				zip = addrSubrecord.getValue('zip'),
				addrphone = addrSubrecord.getValue('addrphone'),
				address1 = addrSubrecord.getValue("addr1");
				var orderDetailsObj = createOrderDetails(rec);
			var orderObj = {  
				"brand":brand,
				"mainorder":rec.getValue('tranid'),
				"shop":TESTMODE? "TUTEST": shopname,
				"cdate":format.parse({value:rec.getValue('createddate'),type:format.Type.DATE}).toISOString().slice(0,10),
				"deliver_date":"",
				"import_time":new Date().toISOString().slice(0,10),
				"remark":"",
				"customer":rec.getValue('custbody_customer_name'),
				"receiver":shopname,
				"country":country,
				"province":state,
				"address":address1,
				"postcode":zip,
				"contactnumber":addrphone,
				"front":"",
				"back":"",
				"sideLeft":"",
				"sideRight":"",
				"OrderDetails": orderDetailsObj.orderdetails,
				"Measurements": orderDetailsObj.measurements,
				"Options": orderDetailsObj.options,
				'Observations': orderDetailsObj.observations
			}
			
			return orderObj;
		}
		function getCombination(productType){
			var combinationcode = "";
			switch(productType){
				case "2-Piece-Suit" : combinationcode = "TU0101"; break;
				case "3-Piece-Suit" : combinationcode = "TU0105"; break;
				case "Trouser" : combinationcode = "TU0103"; break;
				case "Waistcoat" : combinationcode = "TU0104"; break;
				case "Shirt" : combinationcode = "TU0109"; break;
				case "Overcoat" : combinationcode = "TU0108"; break;
				default:
			}
			return combinationcode;
		}
		function getMeasurementMode(fpSummary){
			var mode = "";
			
			if(fpSummary && fpSummary.length >0){
				if(fpSummary[0].type == 'Block')
					mode = "01";
				if(fpSummary[0].type == 'Body')
					mode = "03";
			}
			return mode;
		}
		function getFabricSku(itemname, customfabricdetails, producttype){
			var code = "";
			if(itemname == 'CMT Item'){
				code = JSON.parse(customfabricdetails).code;
			}
			else{
				if(itemname.split('(')[1])
					code = itemname.split('(')[1].split(')')[0];
				else
					code = itemname;
			}
			// if(itemname.split(',').length == 1){
				// var a = itemname.split('-');
				// if(a[0] == 'CMT Item'){
					// if(!customfabricdetails){
						// var jsonb = JSON.parse(customfabricdetails);
						// code = jsonb.code;
					// }
				// }
				// // if(a.length == 1){
					// // item = a[0]
				// // }else{
					// // item = a[1];
				// // }
			// }
			// else{
				// code = a[1];
				// // if()
			// }
			
			return code;
		}
		function getOrderDetails(rec,line, designoptions,liningname,garmentname,fitprofile, garmentclass, fabriccode, fabricmode, clf, styleno){
			var measurementmode = getMeasurementMode(JSON.parse(rec.getSublistValue('item','custcol_fitprofile_summary',line)));					
			var liningcode = "", liningmode = "01", garmentmake = "", tryoncode = "", fitcode = "";
			//var designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',line));
			if(liningname){
				//log.debug('designoptions', designoptions[0]);
				//log.debug('liningname', liningname);
				var lining = designoptions.reduce(function(o,p){
					if(p.name == liningname) {
						o.push(p);
					}
						return o;
					},[]);
				liningcode = lining.length>0?lining[0].value:"";
				
				if(liningcode == 'CMT Lining')
					liningmode = '02';
			}
			var gm = designoptions.reduce(function(o,p){ 
				if(p.name == garmentname){
					o.push(p);
				}
				return o;
				},[]);			
			garmentmake = gm.length>0?gm[0].value:"";
			
			// var fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',line));
			if(measurementmode == '01'){
				var toc = fitprofile.reduce(function(o,p){ 
				if(p.name == 'block')
					o.push(p);
				return o;
				},[]);
				tryoncode = toc.length>0?toc[0].value:'';
			}
			var fc = fitprofile.reduce(function(o,p){ 
				if(p.name == 'fit')
					o.push(p)
					return o;
					},[]);
				fitcode = fc.length>0?fc[0].value:'';
			
			return {  
			  "orderdetailid":rec.getSublistValue('item','custcol_so_id',line),
			  "order":rec.getValue('tranid'),
			  "combination":getCombination(rec.getSublistValue('item','custcol_producttype',line)),
			  "mode": measurementmode,
			  "fabric":[  
				 {  
					"sku": fabriccode,
					"mode":fabricmode,
					"Vendor":"",
					"Description":"",
					"Composition":"",
					"Length":rec.getSublistValue('item','quantity',line).toString()
				 }
			  ],
			  "lining":[  
				 {  
					"sku": liningcode,
					"mode": liningcode?liningmode:'',
					"Vendor":"",
					"Description":"",
					"Composition":"",
					"Length":""
				 }
			  ],
			  "cl_flag": clf,
			  "styleno": styleno,
			  "ptype":"01",
			  "class":garmentclass,
			  "made": garmentmake,
			  "tryon": tryoncode,
			  "fit": fitcode,
			  "remark":""
		   };
		}
		function getOrderOptions(rec, line, designoptions, liningprefix, othersuffix, garmentname, styleno, garmentclass){
			var options = [];
			//log.debug('orderoptions ' + line, JSON.stringify(designoptions[0])); 
			for(var z=0;z<designoptions.length;z++){
				if(designoptions[z].name.indexOf(othersuffix) == -1 
				&& designoptions[z].name.indexOf(liningprefix) == -1
				&& designoptions[z].name.indexOf(garmentname) == -1 ){
					var value = designoptions[z].value;
					if(designoptions[z].value == 'other'){
						var other = designoptions.reduce(function(o,p){ 
							if(p.name == designoptions[z].name + othersuffix)
								o.push(p);
								return o;
						},[]);
						value = other.length>0?other[0].value:'';
					}
					options.push({
					  "orderdetailid": rec.getSublistValue('item','custcol_so_id',line),
					  "styleno":styleno,
					  "class":garmentclass,
					  "option_type": designoptions[z].name,
					  "option_code": value
				   });
				}
			}
			return options;
		}
		function getOrderMeasurements(rec, line, styleno, garmentclass, fitprofile){
			var measurementmode = getMeasurementMode(JSON.parse(rec.getSublistValue('item','custcol_fitprofile_summary',line)));
			var measurements = [], observations = [];
			if(measurementmode == '01'){
				var fitToolGarmentData;
				switch(garmentclass){
					case '02':	fitToolGarmentData = garmentData['FitTool_Jacket']; break;
					case '05':	fitToolGarmentData = garmentData['FitTool_Trousers']; break;
					case '04':	fitToolGarmentData = garmentData['FitTool_Overcoat']; break;
					case '06':	fitToolGarmentData = garmentData['FitTool_Shirt']; break;
					case '17':	fitToolGarmentData = garmentData['FitTool_Waistcoat']; break;
				}
				//BLOCK
				
				for(var i=0; i< fitprofile.length; i++){
					var fitItem = fitprofile[i];
					var name = fitItem.name;
					var value = fitItem.value;
					// for(var j=0; j< fitToolGarmentData.length; j++){
					var fitToolValue = fitToolGarmentData[name.toUpperCase()];
					if(fitToolValue){
						if(value && parseFloat(value) != 0){
							measurements.push({  
							  "orderdetailid": rec.getSublistValue('item','custcol_so_id',line),
							  "styleno":styleno,
							  "class":garmentclass,
							  "item_code": fitToolValue,
							  "tryon_adjustment": value,
							  "value": "NULL"
							});
						}
					}
					// }
				}
			}else{
				var bodyMeasurements = [];
				var fitToolGarmentData;
				switch(garmentclass){
					case '02':	fitToolGarmentData = garmentData['FitTool_Jacket_GM']; break;
					case '05':	fitToolGarmentData = garmentData['FitTool_Trousers_GM']; break;
					case '04':	fitToolGarmentData = garmentData['FitTool_Overcoat_GM']; break;
					case '06':	fitToolGarmentData = garmentData['FitTool_Shirt_GM']; break;
					case '17':	fitToolGarmentData = garmentData['FitTool_Waistcoat_GM']; break;
				}
				for(var i=0; i< fitprofile.length; i++){
					var fitItem = fitprofile[i];
					var name = fitItem.name;
					var value = fitItem.value;
					var keys = Object.keys(fitToolGarmentData);
					//var fitToolArray = Object.entries(fitToolGarmentData);
					// log.debug('keys',keys);
					for(var j=0; j<keys.length; j++){
						// log.debug('key',keys[j]);
						var garmentDataName = fitToolGarmentData[keys[j]];
						// log.debug('garment data', garmentDataName);
						// log.debug('name',name);
						if(name.toUpperCase() == keys[j] || name.toUpperCase() == 'ALLOWANCE-'+keys[j]){
							var refValue = "";
							if(typeof fitToolGarmentData[keys[j]] == 'object'){
								//log.debug('found object', JSON.stringify(fitToolGarmentData[keys[j]]));
								refValue = fitToolGarmentData[keys[j]];
								var refObservationObj = refValue[0][name.toUpperCase()];
								if(refObservationObj){
									observations.push({
										'orderdetailid': rec.getSublistValue('item','custcol_so_id',line),
										'styleno': styleno,
										'class': garmentclass,
										'item_code': refObservationObj.NAME,
										'value': refObservationObj.VALUE										
									});
								}
							}else{
								//log.debug('found string', fitToolGarmentData[keys[j]]);
								var bm = bodyMeasurements.reduce(function(o,p){
									if(p.name == fitToolGarmentData[keys[j]])
										o.push(p)
										return o;
										},[]);
								if(bm.length>0){
									refValue = fitToolGarmentData[keys[j]];
									bm[0].value = parseFloat(bm[0].value) + parseFloat(value);
								}else{
									fitToolName = refValue = fitToolGarmentData[keys[j]];
									fitToolValue = fitItem.value;
									measurements.push({
										'orderdetailid': rec.getSublistValue('item','custcol_so_id',line),
										'styleno': styleno,
										'class': garmentclass,
										'item_code': fitToolName,
										'value': fitToolValue,
										'tryon_adjustment': "NULL"
									});
									bodyMeasurements.push({name: fitToolName, value: fitToolValue});
								}
							}
						}
					}
				}
			}
			
			return {measurements:measurements, observations: observations};
		}
		function createOrderDetails(rec){
			var orderdetails = [], measurements = [], options = [], observations = [];
			for(var i=0; i<rec.getLineCount('item'); i++){
				var itemNumber = i+1;
				if(itemNumber % 2 != 0){
					if(rec.getSublistValue('item','itemtype',i) == 'NonInvtPart'){
						var producttype = rec.getSublistValue('item','custcol_producttype',i);
						var clf = '0', fabricmode = '02';
						if(rec.getSublistValue('item','povendor',i) == '675' || rec.getSublistValue('item','povendor',i) == '689' || rec.getSublistValue('item','povendor',i) == '671')
							clf = '1';
						if(rec.getSublistValue('item','povendor',i) == '675' || rec.getSublistValue('item','povendor',i) == '689' || rec.getSublistValue('item','povendor',i) == '671'
						|| rec.getSublistValue('item','povendor',i) == '17')
							fabricmode = '01';
						var fabriccode = getFabricSku(rec.getSublistText('item','item',i),rec.getSublistValue('item','custcol_custom_fabric_details',i),rec.getSublistValue('item','custcol_producttype',i));
						if (rec.getSublistValue('item','povendor',i) == "689") {
							fabriccode = "Q" + fabriccode;
						}
						else if (rec.getSublistValue('item','povendor',i) == "675") {
							fabriccode = "FI" + fabriccode;
						}
						if(producttype == '2-Piece-Suit' || producttype == '3-Piece-Suit'){
							if(producttype == '2-Piece-Suit'){
								var garmentclass = '02', 
									liningname = 'li-b-j', 
									garmentname = 'jm-ms-j',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',i)),
									styleno = "01";
								
								var details = getOrderDetails(
									rec,
									i,										
									designoptions,
									liningname,
									garmentname,
									fitprofile,
									garmentclass,
									fabriccode,
									fabricmode,
									clf,
									styleno
								)
								orderdetails.push(details);
								var liningprefix = 'li-', othersuffix = '_other';
								var op = getOrderOptions(
									rec,
									i,
									designoptions,
									liningprefix,
									othersuffix,
									garmentname,
									styleno,
									garmentclass);
								options = options.concat(op);
								var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
								measurements = measurements.concat(measurementObservationObj.measurements);
								if(measurementObservationObj.observations.length != 0 )
								observations = observations.concat(measurementObservationObj.observations);
								//Trouser
								var garmentclass = '05', 
									liningname = '', 
									garmentname = 'tm-m-t',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_trouser',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_trouser',i)),
									styleno = "02";
								
								var details = getOrderDetails(
									rec,
									i,										
									designoptions,
									liningname,
									garmentname,
									fitprofile,
									garmentclass,
									fabriccode,
									fabricmode,
									clf,
									styleno
								)
								orderdetails.push(details);
								var liningprefix = 'li-', othersuffix = '_other';
								var op = getOrderOptions(
									rec,
									i,
									designoptions,
									liningprefix,
									othersuffix,
									garmentname,
									styleno,
									garmentclass);
								options = options.concat(op);
								var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
								measurements = measurements.concat(measurementObservationObj.measurements);
								if(measurementObservationObj.observations.length != 0 )
								observations = observations.concat(measurementObservationObj.observations);
							}else {
								var garmentclass = '02', 
									liningname = 'li-b-j', 
									garmentname = 'jm-ms-j',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',i)),
									styleno = "01";
								
								var details = getOrderDetails(
									rec,
									i,										
									designoptions,
									liningname,
									garmentname,
									fitprofile,
									garmentclass,
									fabriccode,
									fabricmode,
									clf,
									styleno
								)
								orderdetails.push(details);
								var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
								var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
								measurements = measurements.concat(measurementObservationObj.measurements);
								if(measurementObservationObj.observations.length != 0 )
								observations = observations.concat(measurementObservationObj.observations);
								//Trouser
								var garmentclass = '05', 
									liningname = '', 
									garmentname = 'tm-m-t',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_trouser',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_trouser',i)),
									styleno = "02";
								
								var details = getOrderDetails(
									rec,
									i,										
									designoptions,
									liningname,
									garmentname,
									fitprofile,
									garmentclass,
									fabriccode,
									fabricmode,
									clf,
									styleno
								)
								orderdetails.push(details);
								var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
								var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
								measurements = measurements.concat(measurementObservationObj.measurements);
								if(measurementObservationObj.observations.length != 0 )
								observations = observations.concat(measurementObservationObj.observations);
								var garmentclass = '17', 
								liningname = 'li-bl-w', 
								garmentname = 'm-ms-w',
								designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_waistcoat',i)),
								fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_waistcoat',i)),
								styleno = "03";
							
								var details = getOrderDetails(
									rec,
									i,										
									designoptions,
									liningname,
									garmentname,
									fitprofile,
									garmentclass,
									fabriccode,
									fabricmode,
									clf,
									styleno
								)
								orderdetails.push(details);
								var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
								var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
								measurements = measurements.concat(measurementObservationObj.measurements);
								if(measurementObservationObj.observations.length != 0 )
								observations = observations.concat(measurementObservationObj.observations);	
							}
						}
						else{
							switch(producttype){
								case 'Jacket' : 
									var garmentclass = '02', 
										liningname = 'li-b-j', 
										garmentname = 'jm-ms-j',
										designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_jacket',i)),
										fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_jacket',i)),
										styleno = "01";
									
									var details = getOrderDetails(
										rec,
										i,										
										designoptions,
										liningname,
										garmentname,
										fitprofile,
										garmentclass,
										fabriccode,
										fabricmode,
										clf,
										styleno
									)
									orderdetails.push(details);
									var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
									//var op = designoptions.filter(function(o){return o.name != 'jm-ms-j' && o.name != 'li-b-j' && o.name.indexOf('_other') == -1;});
									var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
									measurements = measurements.concat(measurementObservationObj.measurements);
									if(measurementObservationObj.observations.length != 0 )
									observations = observations.concat(measurementObservationObj.observations);
									break;
									
								case 'Trouser': 
									var garmentclass = '05', 
									liningname = '', 
									garmentname = 'tm-m-t',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_trouser',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_trouser',i)),
									styleno = "01";
								
									var details = getOrderDetails(
										rec,
										i,										
										designoptions,
										liningname,
										garmentname,
										fitprofile,
										garmentclass,
										fabriccode,
										fabricmode,
										clf,
										styleno
									)
									orderdetails.push(details);
									var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
									var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
									measurements = measurements.concat(measurementObservationObj.measurements);
									if(measurementObservationObj.observations.length != 0 )
									observations = observations.concat(measurementObservationObj.observations);
									break;
									
								case 'Waistcoat': 
								
									var garmentclass = '17', 
									liningname = 'li-bl-w', 
									garmentname = 'm-ms-w',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_waistcoat',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_waistcoat',i)),
									styleno = "01";
								
									var details = getOrderDetails(
										rec,
										i,										
										designoptions,
										liningname,
										garmentname,
										fitprofile,
										garmentclass,
										fabriccode,
										fabricmode,
										clf,
										styleno
									)
									orderdetails.push(details);
									var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
									var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
									measurements = measurements.concat(measurementObservationObj.measurements);
									if(measurementObservationObj.observations.length != 0 )
									observations = observations.concat(measurementObservationObj.observations);

									break;
								case 'Overcoat': 
									var garmentclass = '04', 
									liningname = 'li-bl-o', 
									garmentname = 'm-msl-o',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_overcoat',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_overcoat',i)),
									styleno = "01";
								
									var details = getOrderDetails(
										rec,
										i,										
										designoptions,
										liningname,
										garmentname,
										fitprofile,
										garmentclass,
										fabriccode,
										fabricmode,
										clf,
										styleno
									)
									orderdetails.push(details);

									var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
									var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
									measurements = measurements.concat(measurementObservationObj.measurements);
									if(measurementObservationObj.observations.length != 0 )
									observations = observations.concat(measurementObservationObj.observations);

									break;
								case 'Shirt': 
									var garmentclass = '06', 
									liningname = '', 
									garmentname = 'sm-ms-s',
									designoptions = JSON.parse(rec.getSublistValue('item','custcol_designoptions_shirt',i)),
									fitprofile = JSON.parse(rec.getSublistValue('item','custcol_fitprofile_shirt',i)),
									styleno = "01";
								
									var details = getOrderDetails(
										rec,
										i,										
										designoptions,
										liningname,
										garmentname,
										fitprofile,
										garmentclass,
										fabriccode,
										fabricmode,
										clf,
										styleno
									)
									orderdetails.push(details);
									var liningprefix = 'li-', othersuffix = '_other';
									var op = getOrderOptions(
										rec,
										i,
										designoptions,
										liningprefix,
										othersuffix,
										garmentname,
										styleno,
										garmentclass);
									options = options.concat(op);
									var measurementObservationObj = getOrderMeasurements(rec, i, styleno, garmentclass, fitprofile);
									measurements = measurements.concat(measurementObservationObj.measurements);
									if(measurementObservationObj.observations.length != 0 )
									observations = observations.concat(measurementObservationObj.observations);

									break;
							}
							
						}
					}else{
							//Not Non Inventory.. hmm
					}
				}
			}
			return {orderdetails:orderdetails, measurements:measurements, options:options, observations:observations};
			
		}
		return {
		   execute:execute
		}
	}
 );

 