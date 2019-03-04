/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Dec 2015     rdutt
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmitSO(type){
	try{
		
		var context =  nlapiGetContext();
		var executionContext =  context.getExecutionContext();
		
		if (!(executionContext == 'userinterface' || executionContext == 'webstore')) {
			return;
		}
		
		var objRecordSO = nlapiGetNewRecord();
		
		var status = objRecordSO.getFieldText('orderstatus');
		if (type == 'create'){//|| (type == 'edit' && status == "Pending Approval")){
			
			// Get tailor (Customer) ID and check the tailor's CMT preference
			var tailorID = objRecordSO.getFieldValue('entity');
			var parent = nlapiLookupField('customer',objRecordSO.getFieldValue('entity'),'parent');
				if(parent)
			objRecordSO.setFieldValue('entity',parent);
			
			// From the tailor record, get the CMT service preference and discount rate
			var customerfields = nlapiLookupField('customer', tailorID, ['custentity_surcharge_discount','custentity_cmt_discount_jacket','custentity_cmt_discount_waistcoat','custentity_cmt_discount_trouser','custentity_cmt_discount_shirt','custentity_cmt_discount_overcoat','custentity_cmt_discount_2pc','custentity_cmt_discount_3pc','terms']);
			var tailorCMTPrefMaster = nlapiLookupField('customer', tailorID, 'custentity_jerome_cmt_service_preference',true);
			var tailorSurchargeDisc = customerfields.custentity_surcharge_discount;
			// CHange this discount to per item of the customer.. check the item			
			if(!tailorSurchargeDisc) tailorSurchargeDisc = 0;
			if(customerfields.terms == '12'){
				var d = new Date();
				d.setDate(d.getDate() + (7-d.getDay())%7+1);
				objRecordSO.setFieldValue('enddate',nlapiDateToString(d));
			}
			// Loop through all items in the SO 
			var itemCount = objRecordSO.getLineItemCount('item');
			
			
			//Check the Design Options and have a lookup from the custom record design options surcharge
			var filters = [];
			filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
			var cols = [];
			cols.push(new nlobjSearchColumn('custrecord_do_description'));
			cols.push(new nlobjSearchColumn('custrecord_do_code'));
			cols.push(new nlobjSearchColumn('custrecord_do_surcharge'));
			cols.push(new nlobjSearchColumn('custrecord_do_location'));
			cols.push(new nlobjSearchColumn('custrecord_do_itemtype'));
			cols.push(new nlobjSearchColumn('custrecord_sleeveliningsurcharge'));
			var do_surcharges = nlapiSearchRecord('customrecord_design_options_surcharge',null,filters,cols);
			var surcharges = [];
			for(var k=0; k<do_surcharges.length;k++){
				//name:location,
				//values:{[]}
				var custom = _.find(surcharges,function(x){return x.name == do_surcharges[k].getValue('custrecord_do_location')});
				if(custom){
					custom.codes.push(do_surcharges[k].getValue('custrecord_do_code'));
					custom.values.push({
					code:do_surcharges[k].getValue('custrecord_do_code'),
					description:do_surcharges[k].getValue('custrecord_do_description'),
					surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
					sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge')
					});
				}
				else{
				surcharges.push({
					name:do_surcharges[k].getValue('custrecord_do_location'),
					type:do_surcharges[k].getText('custrecord_do_itemtype'),
					codes:[do_surcharges[k].getValue('custrecord_do_code')],
					values:[{code:do_surcharges[k].getValue('custrecord_do_code'),
					description:do_surcharges[k].getValue('custrecord_do_description'),
					surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
					sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge')}]
				});
				}
			}
			var count = 1;
			
			for (var ii=1; ii<=itemCount; ii++){
				UpdateFitProfile(ii, objRecordSO);
				var tailorCMTDisc = 0;
				if(objRecordSO.getLineItemValue('item','povendor',ii) == '17' || objRecordSO.getLineItemValue('item','povendor',ii) == '671'){
					var fabCollection = nlapiLookupField('item',objRecordSO.getLineItemValue('item','item',ii),'custitem_fabric_collection',true);
					var prodType = objRecordSO.getLineItemValue('item','custcol_producttype',ii);
					var currentPricelevel = objRecordSO.getLineItemValue('item','price',ii);
				
					if(fabCollection && prodType && currentPricelevel != ""){
						var prodTypeId = "";
						switch(prodType){
							case 'Jacket': prodTypeId = '3'; break;
							case 'Trouser': prodTypeId = '4'; break;
							case 'Waistcoat': prodTypeId = '6'; break;
							case 'Overcoat': prodTypeId = '8'; break;
							case 'Shirt': prodTypeId = '7'; break;
							case '3-Piece-Suit': prodTypeId = '9'; break;
							case '2-Piece-Suit': prodTypeId = '10'; break;
						}
						if(prodTypeId != ""){
							var filters = [];
							filters.push(new nlobjSearchFilter('custrecord_dtp_fab_collection',null,'is',fabCollection));
							filters.push(new nlobjSearchFilter('custrecord_dtp_pricelevel',null,'anyof',currentPricelevel));
							filters.push(new nlobjSearchFilter('custrecord_dtp_producttype',null,'anyof',prodTypeId));
							var dpl_results = nlapiSearchRecord('customrecord_dayang_pricing',null,filters,new nlobjSearchColumn('custrecord_dtp_price'));
							if(dpl_results && dpl_results.length >0){
								// if(dpl_results[0].getValue('custrecord_dtp_price')){
									objRecordSO.selectLineItem('item',ii);									
									objRecordSO.setCurrentLineItemValue('item','price',-1);
									objRecordSO.setCurrentLineItemValue('item','rate',dpl_results[0].getValue('custrecord_dtp_price') && parseFloat(dpl_results[0].getValue('custrecord_dtp_price'))!=0?dpl_results[0].getValue('custrecord_dtp_price'):0);
									objRecordSO.setCurrentLineItemValue('item','amount',dpl_results[0].getValue('custrecord_dtp_price')?dpl_results[0].getValue('custrecord_dtp_price'):0);
									objRecordSO.commitLineItem('item');
								// }
							}else{
								var currentRate = objRecordSO.getLineItemValue('item','rate',ii);
								objRecordSO.selectLineItem('item',ii);
								objRecordSO.setCurrentLineItemValue('item','price',-1);
								objRecordSO.setCurrentLineItemValue('item','rate',currentRate);
								objRecordSO.setCurrentLineItemValue('item','amount',currentRate);
								objRecordSO.commitLineItem('item');
							
							}							
						}else{
							var currentRate = objRecordSO.getLineItemValue('item','rate',ii);
							objRecordSO.selectLineItem('item',ii);
							objRecordSO.setCurrentLineItemValue('item','price',-1);
							objRecordSO.setCurrentLineItemValue('item','rate',currentRate);
							objRecordSO.setCurrentLineItemValue('item','amount',currentRate);
							objRecordSO.commitLineItem('item');
						
						}
					}else{
						var currentRate = objRecordSO.getLineItemValue('item','rate',ii);
						objRecordSO.selectLineItem('item',ii);
						objRecordSO.setCurrentLineItemValue('item','price',-1);
						objRecordSO.setCurrentLineItemValue('item','rate',currentRate);
						objRecordSO.setCurrentLineItemValue('item','amount',currentRate);
						objRecordSO.commitLineItem('item');
				
					}
				}
				
				var itemID = objRecordSO.getLineItemValue('item', 'item', ii);
				//var quantity = objRecordSO.getLineItemValue('item', 'quantity', ii);
				
				
				//Check the Clothing type of the item. If it is ONLY a shirt, then it must be basic CMT.
				//Replacing this arItemType since we added a new line item field
				//var arItemType = nlapiLookupField('noninventoryitem', itemID, 'custitem_clothing_type',true);
				var arItemType = objRecordSO.getLineItemValue('item','custcol_producttype',ii);
				if(arItemType){
					//var itemTypeArray = arItemType.split(',');					
					//if(itemTypeArray.length == 2){
					if(arItemType == '2-Piece-Suit'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_2pc;
					}
					else if(arItemType == '3-Piece-Suit'){//if(itemTypeArray.length == 3){
						tailorCMTDisc = customerfields.custentity_cmt_discount_3pc;
					}
					else if(arItemType == 'Shirt'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_shirt;
					}
					else if(arItemType == 'Jacket'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_jacket;
					}
					else if(arItemType == 'Trouser'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_trouser;
					}
					else if(arItemType == 'Waistcoat'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_waistcoat;
					}
					else if(arItemType == 'Overcoat'){
						tailorCMTDisc = customerfields.custentity_cmt_discount_overcoat;
					}
				}
				if (Function.isUndefinedNullOrEmpty(tailorCMTDisc)){
					tailorCMTDisc = 0;
				}
				//Find out what item type it is - arItemType
				//Look for all the surcharges for that item type, hmm not good how about 3 piece suits
				var surchargeamount = 0;
				var surchargedescription = "";
				if(objRecordSO.getLineItemValue('item', 'custcol_designoptions_jacket', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Jacket";});
					var dop = JSON.parse(objRecordSO.getLineItemValue('item', 'custcol_designoptions_jacket', ii));
					//Lets get the lining surcharge and find out what type of surcharge it is
					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
					var LiningSurcharge;
					
					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
							//We have a match on design options and the value in the table.
							if(dop_surcharge){
								//Check for Sleeve Linings
								if(dop_surcharge.code == 'T01022502' && itemsurcharges[kk].name == 'T010225'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
										surchargedescription += "Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";						
									}
								}else{
									var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
									surchargedescription += "Jacket " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(objRecordSO.getLineItemValue('item', 'custcol_designoptions_waistcoat', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Waistcoat";});
					var dop = JSON.parse(objRecordSO.getLineItemValue('item', 'custcol_designoptions_waistcoat', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){ 
							var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
							surchargedescription += "Waistcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";}
						}
					}
				}
				if(objRecordSO.getLineItemValue('item', 'custcol_designoptions_trouser', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Trouser";});
					var dop = JSON.parse(objRecordSO.getLineItemValue('item', 'custcol_designoptions_trouser', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){ 
							var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
							surchargedescription += "Trouser " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"\n";}
						}
					}
				}
				if(objRecordSO.getLineItemValue('item', 'custcol_designoptions_overcoat', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Overcoat";});
					var dop = JSON.parse(objRecordSO.getLineItemValue('item', 'custcol_designoptions_overcoat', ii));
					//Lets get the lining surcharge and find out what type of surcharge it is
					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-bl-o'});
					var LiningSurcharge;
					
					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-bl-o'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){ 
								//Check for Sleeve Linings
								if(dop_surcharge.code == 'T01041202' && itemsurcharges[kk].name == 'T010412'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
										surchargedescription += "Overcoat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";						
									}
								}else{
									var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
									surchargedescription += "Overcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(objRecordSO.getLineItemValue('item', 'custcol_designoptions_shirt', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt";});
					var dop = JSON.parse(objRecordSO.getLineItemValue('item', 'custcol_designoptions_shirt', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){ 
							var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
							surchargedescription += "Shirt " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"\n";}
						}
					}
				}
				var tailorCMTPref;
				if (typeof arItemType === 'string' && arItemType == 'Shirt'){
					tailorCMTPref = 'Basic CMT';
				} else {
					tailorCMTPref = tailorCMTPrefMaster;
				}
				//if (!Function.isUndefinedNullOrEmpty(arItemType) && !Function.isUndefinedNullOrEmpty(arItemType)){
					//for each item, go in to the item record and get the CMT service item.
				try{
					var cmtServiceItem;
					var cmtServicePrice;
					switch (tailorCMTPref){
						case 'Premium CMT':
							if(arItemType){
								//var itemTypeArray = arItemType.split(',');					
								//if(itemTypeArray.length == 2){
								if(arItemType == '2-Piece-Suit'){
									cmtServiceItem = '9910';
								}
								else if(arItemType == '3-Piece-Suit'){//if(itemTypeArray.length == 3){
									cmtServiceItem = '9911';
								}
								else if(arItemType == 'Shirt'){
									cmtServiceItem = '9909';
								}
								else if(arItemType == 'Jacket'){
									cmtServiceItem = '9905';
								}
								else if(arItemType == 'Trouser'){
									cmtServiceItem = '9906';
								}
								else if(arItemType == 'Waistcoat'){
									cmtServiceItem = '9907';
								}
								else if(arItemType == 'Overcoat'){
									cmtServiceItem = '9908';
								}
							}
							//cmtServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_premium');
							cmtServicePrice = nlapiLookupField('noninventoryitem', cmtServiceItem, 'custitem_jerome_cmt_basic_price',false);
							break;
						case 'Basic CMT':						
						default:
							if(arItemType){
								//var itemTypeArray = arItemType.split(',');					
								//if(itemTypeArray.length == 2){
								if(arItemType == '2-Piece-Suit'){
									cmtServiceItem = '9903';
								}
								else if(arItemType == '3-Piece-Suit'){//if(itemTypeArray.length == 3){
									cmtServiceItem = '9904';
								}
								else if(arItemType == 'Shirt'){
									cmtServiceItem = '9902';
								}
								else if(arItemType == 'Jacket'){
									cmtServiceItem = '9898';
								}
								else if(arItemType == 'Trouser'){
									cmtServiceItem = '9899';
								}
								else if(arItemType == 'Waistcoat'){
									cmtServiceItem = '9900';
								}
								else if(arItemType == 'Overcoat'){
									cmtServiceItem = '9901';
								}
							}
							//cmtServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_basic',false);
							cmtServicePrice = nlapiLookupField('noninventoryitem', cmtServiceItem, 'custitem_jerome_cmt_basic_price',false);
							break;
					}
					
				
					// go in to the service item, and look up the price based on premium or basic preference.
					
		
					if (!Function.isUndefinedNullOrEmpty(cmtServiceItem) && !Function.isUndefinedNullOrEmpty(cmtServicePrice)){
						var price = (parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
						var description = tailorCMTPref + " " + price +"\n";
						
						//Update the price here to include the surcharges
						//calculate the service item price
						var serviceItemPrice = (parseFloat(surchargeamount) +parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
						
						description+= surchargedescription;
						
						//increment line number, as we want to add the service items underneath the corresponding line items.
						ii++;
						//Insert line after the current line item
						objRecordSO.insertLineItem('item', ii);
						
						//Set the service item as the line item value
						objRecordSO.setLineItemValue('item', 'item', ii, cmtServiceItem);
						 
						//Set the quantity to the quantity of the item above
						objRecordSO.setLineItemValue('item', 'quantity', ii, 1);
						objRecordSO.setLineItemValue('item', 'description', ii, description);
						//Set the price to the calculated service item price above
						objRecordSO.setLineItemValue('item', 'price', ii, -1);
						objRecordSO.setLineItemValue('item', 'rate', ii, serviceItemPrice);
						
						var soNumber =  objRecordSO.getFieldValue( 'tranid');
						//SO Line ID
						objRecordSO.setLineItemValue('item', 'custcol_so_id', ii, soNumber + '-' + count);
						
						count++;
						
						//get new line item count	
						itemCount = objRecordSO.getLineItemCount('item');
						
						
					} else {
						if (Function.isUndefinedNullOrEmpty(cmtServiceItem)){
							nlapiLogExecution('ERROR', 'Error:', "Service item for item " + itemID + " is blank in the item record.");
						} else {
							nlapiLogExecution('ERROR', 'Error:', "Service item price for item " + itemID + " is blank in the item record.");
						}
					}
					
				} catch(e){
					nlapiLogExecution('DEBUG', 'Error', e.message);
				}
				//}	
			}
			custName = objRecordSO.getFieldValue('custbody_customer_name');
			
			//nlapiLogExecution('DEBUG', 'custName after loop', custName);
		}
	} catch(err){
		nlapiLogExecution('DEBUG', 'Error', err.message);
	}
}

function UpdateFitProfile(i, objRecordSO){
	if(objRecordSO.getLineItemValue("item","custcol_fitprofile_summary",i)){
		var fitprofileJSON = JSON.parse(objRecordSO.getLineItemValue("item","custcol_fitprofile_summary",i));
		for(var j=0; j< fitprofileJSON.length; j++){
			switch(fitprofileJSON[j].name){
				case "Jacket": 
					var val = fitprofileJSON[j].id;
					if(val){
						var mval = nlapiLookupField('customrecord_sc_fit_profile',val,['custrecord_fp_measure_value','custrecord_fp_measure_type']);
						if(mval.custrecord_fp_measure_type != '1'){
							var fpvIN = JSON.parse(mval.custrecord_fp_measure_value);
							if (fpvIN[0].value == 'CM') {
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'Inches';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value/2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_jacket',i,mval.custrecord_fp_measure_value);
								objRecordSO.setLineItemValue('item','custcol_fitprofile_jacket_in',i,JSON.stringify(fpvIN));
							}
							else{
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'CM';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value*2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_jacket',i,JSON.stringify(fpvIN));
								objRecordSO.setLineItemValue('item','custcol_fitprofile_jacket_in',i,mval.custrecord_fp_measure_value);
							}
						}
					}
				break;
				case "Waistcoat": 
					var val = fitprofileJSON[j].id;
					if(val){
						var mval = nlapiLookupField('customrecord_sc_fit_profile',val,['custrecord_fp_measure_value','custrecord_fp_measure_type']);
						if(mval.custrecord_fp_measure_type != '1'){
							var fpvIN = JSON.parse(mval.custrecord_fp_measure_value);
							if (fpvIN[0].value == 'CM') {
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'Inches';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value/2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_waistcoat',i,mval.custrecord_fp_measure_value);
								objRecordSO.setLineItemValue('item','custcol_fitprofile_waistcoat_in',i,JSON.stringify(fpvIN));
							}
							else{
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'CM';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value*2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_waistcoat',i,JSON.stringify(fpvIN));
								objRecordSO.setLineItemValue('item','custcol_fitprofile_waistcoat_in',i,mval.custrecord_fp_measure_value);
							}
						}
					}
				break;
				case "Trouser" : 
					var val = fitprofileJSON[j].id;
					if(val){
						var mval = nlapiLookupField('customrecord_sc_fit_profile',val,['custrecord_fp_measure_value','custrecord_fp_measure_type']);
						if(mval.custrecord_fp_measure_type != '1'){
							var fpvIN = JSON.parse(mval.custrecord_fp_measure_value);
							if (fpvIN[0].value == 'CM') {
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'Inches';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value/2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_trouser',i,mval.custrecord_fp_measure_value);
								objRecordSO.setLineItemValue('item','custcol_fitprofile_trouser_in',i,JSON.stringify(fpvIN));
							}
							else{
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'CM';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value*2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_trouser',i,JSON.stringify(fpvIN));
								objRecordSO.setLineItemValue('item','custcol_fitprofile_trouser_in',i,mval.custrecord_fp_measure_value);
							}
						}
					}
				break;
				case "Shirt": 
					var val = fitprofileJSON[j].id;
					if(val){
						var mval = nlapiLookupField('customrecord_sc_fit_profile',val,['custrecord_fp_measure_value','custrecord_fp_measure_type']);
						if(mval.custrecord_fp_measure_type != '1'){
							var fpvIN = JSON.parse(mval.custrecord_fp_measure_value);
							if (fpvIN[0].value == 'CM') {
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'Inches';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value/2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_shirt',i,mval.custrecord_fp_measure_value);
								objRecordSO.setLineItemValue('item','custcol_fitprofile_shirt_in',i,JSON.stringify(fpvIN));
							}
							else{
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'CM';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value*2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_shirt',i,JSON.stringify(fpvIN));
								objRecordSO.setLineItemValue('item','custcol_fitprofile_shirt_in',i,mval.custrecord_fp_measure_value);
							}
						}
					}
				break;
				case "Overcoat": 
					var val = fitprofileJSON[j].id;
					if(val){
						var mval = nlapiLookupField('customrecord_sc_fit_profile',val,['custrecord_fp_measure_value','custrecord_fp_measure_type']);
						if(mval.custrecord_fp_measure_type != '1'){
							var fpvIN = JSON.parse(mval.custrecord_fp_measure_value);
							if (fpvIN[0].value == 'CM') {
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'Inches';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value/2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_overcoat',i,mval.custrecord_fp_measure_value);
								objRecordSO.setLineItemValue('item','custcol_fitprofile_overcoat_in',i,JSON.stringify(fpvIN));
							}
							else{
								_.each(fpvIN, function (value, key, obj) {
									if (obj[key].name === 'units') {
										obj[key].value = 'CM';
									}
									//Try parse if value is number
									if (!isNaN(obj[key].value)) {
										obj[key].value = (obj[key].value*2.54).toFixed(2);
									}
								});							
								objRecordSO.setLineItemValue('item','custcol_fitprofile_overcoat',i,JSON.stringify(fpvIN));
								objRecordSO.setLineItemValue('item','custcol_fitprofile_overcoat_in',i,mval.custrecord_fp_measure_value);
							}
						}
					}
				break;
				default:
			}
		}
	}
}

