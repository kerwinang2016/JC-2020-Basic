/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NAmdConfig /SuiteScripts/amd-config.json
 */
 define(['N/record', 'N/search', 'N/log', 'N/format', 'N/file', 'N/email', 'ustyylit/integration'],
	function runScheduledScript(record, search, log, format, file, nlemail, ustyylit){

		function execute(){
			//Search all orders that are pending approval
			var orders = getPendingApprovalOrders();
		}
		var ordernolist = ['26049-1','26990-1','26707-1','21099-4'];
		function getPendingApprovalOrders(){
			var rs = search.create({
				type : "salesorder",
				filters : [
				['internalid','anyof',[848125,869975,775391,874172]], 'AND',
				["type", "anyof", "SalesOrd"],"AND",
				["mainline", "is", true], "AND", ["status", "anyof", "SalesOrd:A"],
        //"AND", ["trandate","after","22/9/2020"],
				//"AND", ["custbodycustbody_api_sales_ord_st_json","isnot","Success"], "AND", ["custbodycustbody_api_sales_ord_st_json","isnot","Processed"]
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
        var rec = record.load({
  				type: order.recordType
  				, id:order.id
  				, isDynamic: true
  			});
  			//log.debug('order.id', order.id);
				var orderObj = createOrder(rec);
        if(orderObj){
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

  				var responseData = "";
  				  responseData = ustyylit.receiveOrder(receiveOrderData);
				  orders.push({
					  id:result.id,
					  type: result.recordType
				  });
          //[{"orderno":"TU26373-1","error_code":"9001"},{"orderno":"TU26373-1","error_code":"1039"},{"orderno":"TU26373-1","error_code":"1040"},{"orderno":"TU26373-1","error_code":"1041"},{"orderno":"TU26373-1","error_code":"1042"},{"orderno":"TU26373-1","error_code":"1043"},{"orderno":"TU26373-1","error_code":"1044"},{"orderno":"TU26373-1","error_code":"1045"},{"orderno":"TU26373-1","error_code":"1046"},{"orderno":"TU26373-1","error_code":"1047"},{"orderno":"TU26373-1","error_code":"1048"},{"orderno":"TU26373-1","error_code":"1392"},{"orderno":"TU26373-1","error_code":"1049"}]
          //{ 'Result': '100', 'msgid': '200106qN747PLjFw' }
          //Create a log on which the order is processed
          updateOrderStatus(orderObj, responseData, rec);
          createIntegrationLog(orderObj, responseData, rec);
  				nlemail.send({
  					author: 97,
  					recipients: 97,
  					subject: 'JSON DATA for Order: '+ result.getValue('tranid'),//+' pushed using NS Service',
  					body: "Response Data returned from Ustyylit \n" + responseData + "\n **Attached the JSON text.",
  					attachments: [f]//file.load({id: f_id})
  				});
        }
				return true;
			});
			return orders;
		}
    function updateOrderStatus(orderObj, responseData, rec){
      orderObj.OrderDetails[x].orderdetailid //soid
      if(rec.getValue('entity') == '5' || rec.getValue('entity') == '5')
				brand = "TU";
			else if(rec.getValue('entity') == '669')
				brand = "GCTU";
			else
				brand = "JETU";
    }
    function createIntegrationLog(orderObj, responseData, rec){

    }
		function createOrder(rec){

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
        if(orderDetailsObj.orderdetails.length>0){
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
    				"Options": orderDetailsObj.options
    				// 'Observations': orderDetailsObj.observations
    			}
    			if(orderDetailsObj.observations.length>0){
    				orderObj.Observations = orderDetailsObj.observations;
    			}
          return orderObj;
        }else{
          return null;
        }
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
				case "Jacket": combinationcode = "TU0102"; break;
				case "Trenchcoat": combinationcode ="TU0116"; break;
				case "Ladies-Jacket": combinationcode ="TU0201"; break;
				case "Ladies-Pants": combinationcode ="TU0202"; break;
				case "Ladies-Skirt": combinationcode ="TU0203"; break;
				case "L-3PC-Suit": combinationcode ="TU0211"; break;
				case "L-2PC-Pants": combinationcode ="TU0205"; break;
				case "L-2PC-Skirt": combinationcode ="TU0206"; break;
				case "Short-Sleeves-Shirt": combinationcode = "TU0112"; break;
        case "Shorts": combinationcode = "TU0115"; break;
        case "Camp-Shirt": combinationcode = "TU0115"; break;
        case "Morning-Coat": combinationcode = "TU0118"; break;
        case "Safari-Jacket": combinationcode = "TU0121"; break;
        case "Shirt-Jacket": combinationcode = "TU0120"; break;
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

			return code;
		}
		function getOrderDetails(rec,line, designoptions,liningname,garmentname,fitprofile, garmentclass, fabriccode, fabricmode, clf, styleno){
			var measurementmode = getMeasurementMode(JSON.parse(rec.getSublistValue('item','custcol_fitprofile_summary',line)));
			var liningcode = "", liningmode = "01", garmentmake = "", tryoncode = "", fitcode = "";
			var liningqty = "";
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
				var liningvendor = designoptions.reduce(function(o,p){
					if(p.name == 'li-vnd') {
						o.push(p);
					}
						return o;
					},[]);
				if(liningvendor && liningvendor.length > 0 && liningvendor[0].value == "Custom Lining"){
					var licode = designoptions.reduce(function(o,p){
					if(p.name == 'li-code') {
						o.push(p);
					}
						return o;
					},[]);
					liningcode = licode.length>0?licode[0].value:"";
					var liqty = designoptions.reduce(function(o,p){
					if(p.name == 'li-qty') {
						o.push(p);
					}
						return o;
					},[]);
					liningqty = liqty.length>0?liqty[0].value:"";
				}
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
					"Length":liningqty
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
					var optionvalue = value;
					if(designoptions[z].name == 'T010239' || designoptions[z].name == 'T010238' || designoptions[z].name == 'T010240' || designoptions[z].name == 'T010250' ||
						designoptions[z].name == 'T010525' || designoptions[z].name == 'T010422' || designoptions[z].name == 'T010427' || designoptions[z].name == 'T010428' ||
						designoptions[z].name == 'T010634' || designoptions[z].name == 'T011623' || designoptions[z].name == 'T011628' || designoptions[z].name == 'T027242' ||
            designoptions[z].name == 'T014938' || designoptions[z].name == 'T014942' || designoptions[z].name == 'T014943' || designoptions[z].name == 'T010745' ||
            designoptions[z].name == 'T010745' || designoptions[z].name == 'T016938' || designoptions[z].name == 'T016942' || designoptions[z].name == 'T016943' ||
            designoptions[z].name == 'T016945' || designoptions[z].name == 'T016944'){
							optionvalue = encodeURI(value);
						}
					options.push({
					  "orderdetailid": rec.getSublistValue('item','custcol_so_id',line),
					  "styleno":styleno,
					  "class":garmentclass,
					  "option_type": designoptions[z].name,
					  "option_code": optionvalue
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
					case '16':	fitToolGarmentData = garmentData['FitTool_Trenchcoat']; break;
					case '72':	fitToolGarmentData = garmentData['FitTool_Ladies-Jacket']; break;
					case '74':	fitToolGarmentData = garmentData['FitTool_Ladies-Pants']; break;
					case '73':	fitToolGarmentData = garmentData['FitTool_Ladies-Skirt']; break;
					case '39':	fitToolGarmentData = garmentData['FitTool_Short-Sleeeves-Shirt']; break;
          case '31':	fitToolGarmentData = garmentData['FitTool_Shorts']; break;
          case '49':	fitToolGarmentData = garmentData['FitTool_Morning-Coat']; break;
          case '69':	fitToolGarmentData = garmentData['FitTool_Safari-Jacket']; break;
          case '07':	fitToolGarmentData = garmentData['FitTool_Shirt-Jacket']; break;
          case '43':	fitToolGarmentData = garmentData['FitTool_Camp-Shirt']; break;
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
					case '39':	fitToolGarmentData = garmentData['FitTool_Short-Sleeves-Shirt_GM']; break;
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
						if(name.toUpperCase() == keys[j] || name.toUpperCase() == 'ALLOWANCE-'+keys[j]){

							var refValue = "";
							if(typeof fitToolGarmentData[keys[j]] == 'object'){
								//log.debug('found object', JSON.stringify(fitToolGarmentData[keys[j]]));
								refValue = fitToolGarmentData[keys[j]];
								var refObservationObj = refValue[0][value.toUpperCase()];
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
									if(p.name == fitToolGarmentData[keys[j]] )
										o.push(p)
										return o;
										},[]);
								//log.debug('name',name);
								//log.debug('keys',keys[j]);
								//log.debug('bm',bm);
								if(bm.length>0){
									refValue = fitToolGarmentData[keys[j]];
									bm[0].value = parseFloat(bm[0].value) + parseFloat(value);
								}else{
									fitToolName = refValue = fitToolGarmentData[keys[j]];
									fitToolValue = fitItem.value;
									// measurements.push({
										// 'orderdetailid': rec.getSublistValue('item','custcol_so_id',line),
										// 'styleno': styleno,
										// 'class': garmentclass,
										// 'item_code': fitToolName,
										// 'value': fitToolValue,
										// 'tryon_adjustment': "NULL"
									// });
									bodyMeasurements.push({name: fitToolName, value: fitToolValue});

								}

							}

						}
					}
				}
				//log.debug('bodymeasurements',JSON.stringify(bodyMeasurements));
				for (var z =0; z< bodyMeasurements.length; z++)
				{
					var fitData = bodyMeasurements[z];
					//log.debug('fitData',JSON.stringify(fitData));
					if (fitData.name)// && fitData.value != "0" && fitData.value != "0.0")
					{
						var fitDataNameText = fitData.name.split('_');
						var fitDataNameTextCount = fitDataNameText.length;
						if (fitDataNameTextCount > 1)
						{
							var lastObservationText = fitDataNameText[fitDataNameTextCount - 1];
							if (lastObservationText == "half")
							{
								fitData.value = (parseFloat(fitData.value) / 2).toString();
							}
						}
						measurements.push(
						{
							'orderdetailid': rec.getSublistValue('item','custcol_so_id',line),
							'styleno': styleno,
							'class': garmentclass,
							'item_code': fitData.name,
							'tryon_adjustment': "NULL",
							'value': fitData.value
						});
					}
				}
				//log.debug('measurements',JSON.stringify(measurements));
			}

			return {measurements:measurements, observations: observations};
		}
		function createOrderDetails(rec){
			var orderdetails = [], measurements = [], options = [], observations = [];
			var garmentClass = {
				"Jacket": "02",
				"Overcoat": "04",
				"Trousers": "05",
				"Shirt": "06",
				"Waistcoat": "17",
				"Trenchcoat": "16",
				"Ladies-Jacket": "72",
				"Ladies-Pants": "74",
				"Ladies-Skirt": "73",
				"Short-Sleeves-Shirt": "39",
				"Shirt-Jacket": "07",
				"Safari-Jacket": "69",
				"Morning-Coat": "49",
				"Shorts": "31",
				"Camp-Shirt": "43"
			};
			var liningName = {
				"Jacket": 'li-b-j',
				"Overcoat": "li-bl-o",
				"Trousers": "",
				"Shirt": "",
				"Waistcoat": "li-bl-w",
				"Trenchcoat": "li-bl-tc",
				"Ladies-Jacket": "li-b-lj",
				"Ladies-Pants": "",
				"Ladies-Skirt": "li-fo-ls",
				"Short-Sleeves-Shirt": "",
				"Shirt-Jacket": "07",
				"Safari-Jacket": "69",
				"Morning-Coat": "49",
				"Shorts": "31",
				"Camp-Shirt": "43"
			};
			var garmentName = {
				"Jacket": 'jm-ms-j',
				"Overcoat": "m-msl-o",
				"Trousers": "tm-m-t",
				"Shirt": "sm-ms-s",
				"Waistcoat": "m-ms-w",
				"Trenchcoat": "m-msl-tc",
				"Ladies-Jacket": "jm-ms-lj",
				"Ladies-Pants": "tm-m-lt",
				"Ladies-Skirt": "sma-sw-ls",
				"Short-Sleeves-Shirt": "sm-ms-ss",
				"Shirt-Jacket": "07",
				"Safari-Jacket": "69",
				"Morning-Coat": "49",
				"Shorts": "31",
				"Camp-Shirt": "43"
			};
			var designOptions = {
				"Jacket": 'custcol_designoptions_jacket',
				"Overcoat": "custcol_designoptions_overcoat",
				"Trousers": "custcol_designoptions_trouser",
				"Shirt": "custcol_designoptions_shirt",
				"Waistcoat": "custcol_designoptions_waistcoat",
				"Trenchcoat": "custcol_designoptions_trenchcoat",
				"Ladies-Jacket": "custcol_designoptions_ladiesjacket",
				"Ladies-Pants": "custcol_designoptions_ladiespants",
				"Ladies-Skirt": "custcol_designoptions_ladiesskirt",
				"Short-Sleeves-Shirt": "custcol_designoptions_ssshirt",
				"Shirt-Jacket": "custcol_designoptions_shirt_jacket",
				"Safari-Jacket": "custcol_designoptions_safari_jacket",
				"Morning-Coat": "custcol_designoptions_morning_coat",
				"Shorts": "custcol_designoptions_shorts",
				"Camp-Shirt": "custcol_designoptions_camp_shirt"
			};
			var fitProfiles = {
				"Jacket": 'custcol_fitprofile_jacket',
				"Overcoat": "custcol_fitprofile_overcoat",
				"Trousers": "custcol_fitprofile_trouser",
				"Shirt": "custcol_fitprofile_shirt",
				"Waistcoat": "custcol_fitprofile_waistcoat",
				"Trenchcoat": "custcol_fitprofile_trenchcoat",
				"Ladies-Jacket": "custcol_fitprofile_ladiesjacket",
				"Ladies-Pants": "custcol_fitprofile_ladiespants",
				"Ladies-Skirt": "custcol_fitprofile_ladiesskirt",
				"Short-Sleeves-Shirt": "custcol_fitprofile_ssshirt",
				"Shirt-Jacket": "custcol_fitprofile_shirt_jacket",
				"Safari-Jacket": "custcol_fitprofile_safari_jacket",
				"Morning-Coat": "custcol_fitprofile_morning_coat",
				"Shorts": "custcol_fitprofile_shorts",
				"Camp-Shirt": "custcol_fitprofile_camp_shirt"
			};
			for(var i=0; i<rec.getLineCount('item'); i++){
				var itemNumber = i+1;
				if(itemNumber % 2 != 0 ){//&& ordernolist.indexOf(rec.getSublistValue('item','custcol_so_id',i))!=-1){
					if(rec.getSublistValue('item','itemtype',i) == 'NonInvtPart'){
            if(rec.getSublistValue('item','item',i) == '253776' || rec.getSublistValue('item','custcolcustcol_api_status_fld',i) == "Hold" || rec.getSublistValue('item','custcolcustcol_api_status_fld',i) == "Processed" || rec.getSublistValue('item','custcolcustcol_api_status_fld',i) == "Success"){
              continue;
            }

						var producttype = rec.getSublistValue('item','custcol_producttype',i);
						var clf = '0', fabricmode = '02';
						if(
						  //rec.getSublistValue('item','povendor',i) == '675' ||
						  rec.getSublistValue('item','povendor',i) == '689' || rec.getSublistValue('item','povendor',i) == '671')
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
								var garmentclass = garmentClass['Jacket'],
									liningname = liningName['Jacket'],
									garmentname = garmentName['Jacket'],
									designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Jacket'],i)),
									fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Jacket'],i)),
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
								var var garmentclass = garmentClass['Trouser'],
                  liningname = liningName['Trouser'],
                  garmentname = garmentName['Trouser'],
                  designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Trouser'],i)),
                  fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Trouser'],i)),
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
								var garmentclass = garmentClass['Jacket'],
                liningname = liningName['Jacket'],
                garmentname = garmentName['Jacket'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Jacket'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Jacket'],i)),
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
                var garmentclass = garmentClass['Trouser'],
                  liningname = liningName['Trouser'],
                  garmentname = garmentName['Trouser'],
                  designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Trouser'],i)),
                  fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Trouser'],i)),
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
                var garmentclass = garmentClass['Waistcoat'],
                liningname = liningName['Waistcoat'],
                garmentname = garmentName['Waistcoat'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Waistcoat'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Waistcoat'],i)),
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
						else if(producttype == 'L-3PC-Suit'){
              var garmentclass = garmentClass['Ladies-Jacket'],
                liningname = liningName['Ladies-Jacket'],
                garmentname = garmentName['Ladies-Jacket'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Jacket'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Jacket'],i)),
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
							);
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
              var garmentclass = garmentClass['Ladies-Pants'],
                liningname = liningName['Ladies-Pants'],
                garmentname = garmentName['Ladies-Pants'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Pants'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Pants'],i)),
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
							);
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
              var garmentclass = garmentClass['Ladies-Skirt'],
                  liningname = liningName['Ladies-Skirt'],
                  garmentname = garmentName['Ladies-Skirt'],
                  designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Skirt'],i)),
                  fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Skirt'],i)),
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
						else if(producttype == 'L-2PC-Skirt'){
              var garmentclass = garmentClass['Ladies-Jacket'],
                liningname = liningName['Ladies-Jacket'],
                garmentname = garmentName['Ladies-Jacket'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Jacket'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Jacket'],i)),
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
              var garmentclass = garmentClass['Ladies-Skirt'],
                liningname = liningName['Ladies-Skirt'],
                garmentname = garmentName['Ladies-Skirt'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Skirt'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Skirt'],i)),
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

						}
						else if(producttype == 'L-2PC-Pants'){
              var garmentclass = garmentClass['Ladies-Jacket'],
                liningname = liningName['Ladies-Jacket'],
                garmentname = garmentName['Ladies-Jacket'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Jacket'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Jacket'],i)),
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
              var garmentclass = garmentClass['Ladies-Pants'],
                liningname = liningName['Ladies-Pants'],
                garmentname = garmentName['Ladies-Pants'],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions['Ladies-Pants'],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles['Ladies-Pants'],i)),
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
						}
						else{
							//switch(producttype){
								//case 'Jacket' :
                var garmentclass = garmentClass[producttype],
                liningname = liningName[producttype],
                garmentname = garmentName[producttype],
                designoptions = JSON.parse(rec.getSublistValue('item',designOptions[producttype],i)),
                fitprofile = JSON.parse(rec.getSublistValue('item',fitProfiles[producttype],i)),
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
								//	break;
							//}

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
