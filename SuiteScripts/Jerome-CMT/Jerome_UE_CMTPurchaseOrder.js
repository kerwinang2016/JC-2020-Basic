/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 Dec 2015     rdutt
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord purchaseorder
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */


function userEventAfterSubmitPO(type){
	try {
		if(type == 'delete') return;
		var objRecordPOID = nlapiGetNewRecord().getId();
		var objRecordPO = nlapiLoadRecord('purchaseorder', objRecordPOID);
		var createdfromfields,entity;
		if(objRecordPO.getFieldValue('createdfrom')){
			createdfromfields = nlapiLookupField('transaction',nlapiGetFieldValue('createdfrom'),['recordtype','entity']);
			entity = createdfromfields.entity;
		}

		// nlapiLogExecution('DEBUG', 'function', 'AfterSubmitPO');
		// nlapiLogExecution('DEBUG', 'type', type);
		var exchangeRate = nlapiExchangeRate('USD','AUD');
		var shippingCosts = getShippingCosts();
		var dutiesCosts = getDutiesCosts();
		if (type == 'specialorder' || type == 'create'){
			// Loop through all items in the PO
			var itemCount = objRecordPO.getLineItemCount('item');

			// nlapiLogExecution('DEBUG', 'itemCount (initial)', itemCount);
			var filters = [];
			filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
			var cols = [];
			cols.push(new nlobjSearchColumn('custrecord_dtc_product'));
			cols.push(new nlobjSearchColumn('custrecord_dtc_collection'));
			cols.push(new nlobjSearchColumn('custrecord_dtc_cost'));
			var results = nlapiSearchRecord('customrecord_dayang_trands_cost',null,filters,cols);
			var dayangCosts = [];
			var exchangeRate = nlapiExchangeRate('USD', 'AUD');
			for(var i=0; i<results.length; i++){
				dayangCosts.push({
					itemtype : results[i].getText('custrecord_dtc_product'),
					itemtypeid : results[i].getValue('custrecord_dtc_product'),
					collection : results[i].getText('custrecord_dtc_collection'),
					collectionid : results[i].getValue('custrecord_dtc_collection'),
					cost : parseFloat(results[i].getValue('custrecord_dtc_cost')?results[i].getValue('custrecord_dtc_cost'):0)
				});
			}
			for (var ii=1; ii<=itemCount; ii++){
				// nlapiLogExecution('DEBUG', 'item', ii);

				var itemID = objRecordPO.getLineItemValue('item', 'item', ii);

				// nlapiLogExecution('DEBUG', 'itemID', itemID);
				if( objRecordPO.getFieldValue('entity') != '17' && objRecordPO.getFieldValue('entity') != '671'){
					objRecordPO.selectLineItem('item', ii);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_fabric_status', 2);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_cmt_status', 7);
					objRecordPO.commitLineItem('item');
				}else{
					objRecordPO.selectLineItem('item', ii);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_fabric_status', 4);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_cmt_status', 7);
					objRecordPO.commitLineItem('item');
				}

				//Check the service item checkbox. If this is 'yes', then it is a service item.
				var isServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_serviceitem');
				// nlapiLogExecution('DEBUG', 'isServiceItem', isServiceItem);
				if (isServiceItem == 'T'){
					//for each item, go in to the item record and get the CMT price.
					var cmtVendorPrice = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_basic_ven_price');
					// nlapiLogExecution('DEBUG', 'cmtVendorPrice', cmtVendorPrice);
					if (!Function.isUndefinedNullOrEmpty(cmtVendorPrice)){
						//replace 'rate' column on PO with the vendor price from the service item record.
						objRecordPO.selectLineItem('item', ii);
						objRecordPO.setCurrentLineItemValue('item', 'rate', cmtVendorPrice);
						objRecordPO.setCurrentLineItemValue('item','custcol_cost_of_goods_sold',cmtVendorPrice);
						objRecordPO.commitLineItem('item');
					}
					var prodTypeId = "";
					var prodType = objRecordPO.getLineItemValue('item','custcol_producttype',ii);

					var foundobj;
					if(prodType){
						objRecordPO.selectLineItem('item', ii);
						foundobj = _.find(shippingCosts,function(x){return x.producttype == prodType; });
						if(foundobj.exempt.indexOf(entity) == -1){
							if(foundobj){
								objRecordPO.setCurrentLineItemValue('item','custcol_shippingprice', (parseFloat(foundobj.rate) * exchangeRate).toFixed(2));
							}
						}else{
							objRecordPO.setCurrentLineItemValue('item','custcol_shippingprice', 0);
						}
						foundobj = _.find(dutiesCosts,function(x){return x.producttype == prodType; });
						if(foundobj.exempt.indexOf(entity) == -1){
							if(foundobj){
								objRecordPO.setCurrentLineItemValue('item','custcol_duties', (parseFloat(foundobj.rate) * exchangeRate).toFixed(2));
							}
						}else{
							objRecordPO.setCurrentLineItemValue('item','custcol_duties', 0);
						}
						objRecordPO.commitLineItem('item');
						//break;
					}
				}else{
					if(objRecordPO.getFieldValue('entity') == '17' || objRecordPO.getFieldValue('entity') == '671'){
						// var prodTypeId = "";
						// var prodType = objRecordPO.getLineItemValue('item','custcol_producttype',ii);
						// switch(prodType){
							// case 'Jacket': prodTypeId = '3'; break;
							// case 'Trouser': prodTypeId = '4'; break;
							// case 'Waistcoat': prodTypeId = '6'; break;
							// case 'Overcoat': prodTypeId = '8'; break;
							// case 'Shirt': prodTypeId = '7'; break;
							// case '3-Piece-Suit': prodTypeId = '9'; break;
							// case '2-Piece-Suit': prodTypeId = '10'; break;
							// case 'Trenchcoat': prodTypeId = '13'; break;
							// case 'Short-Sleeves-Shirt': prodTypeId = '12'; break;
							// case 'Ladies-Jacket': prodTypeId = '14'; break;
							// case 'Ladies-Pants': prodTypeId = '15'; break;
							// case 'Ladies-Skirt': prodTypeId = '16'; break;
							// case 'L-2PC-Skirt': prodTypeId = '17'; break;
							// case 'L-3PC-Suit': prodTypeId = '18'; break;
							// case 'L-2PC-Trouser': prodTypeId = '19'; break;
						// }
						// if(prodTypeId){
							// var fabCollection = nlapiLookupField('item',objRecordPO.getLineItemValue('item','item',ii),'custitem_fabric_collection',true);
							// var found = _.find(dayangCosts,function(x){return x.collection == fabCollection && x.itemtypeid == prodTypeId; });
							// if(found){
								// objRecordPO.selectLineItem('item', ii);
								// //objRecordPO.setCurrentLineItemValue('item', 'rate', cmtVendorPrice);

								// objRecordPO.setCurrentLineItemValue('item','rate',found.cost.toFixed(2));
								// objRecordPO.setCurrentLineItemValue('item','amount',found.cost.toFixed(2));
								// objRecordPO.setCurrentLineItemValue('item','custcol_cost_of_goods_sold',found.cost.toFixed(2));
								// objRecordPO.commitLineItem('item');
							// }
						// }
						//Use the fabric price * the fabric quantity set that to amount and rate..
						var currentrate = objRecordPO.getLineItemValue('item','rate',ii)? parseFloat(objRecordPO.getLineItemValue('item','rate',ii)): 0;
						var fabQty = objRecordPO.getLineItemValue('item','custcol_fabric_quantity',ii)?parseFloat(objRecordPO.getLineItemValue('item','custcol_fabric_quantity',ii)):0
						objRecordPO.selectLineItem('item', ii);
						objRecordPO.setCurrentLineItemValue('item','rate',(currentrate * fabQty).toFixed(2));
						objRecordPO.setCurrentLineItemValue('item','amount',(currentrate * fabQty).toFixed(2));
						objRecordPO.setCurrentLineItemValue('item','custcol_cost_of_goods_sold',(currentrate * fabQty).toFixed(2));
						objRecordPO.commitLineItem('item');
						
					}else{
						var currentrate = objRecordPO.getLineItemValue('item','rate',ii)? parseFloat(objRecordPO.getLineItemValue('item','rate',ii)): 0;
						var currentQty = objRecordPO.getLineItemValue('item','quantity',ii)? parseFloat(objRecordPO.getLineItemValue('item','quantity',ii)): 0;
						var currentAmount = objRecordPO.getLineItemValue('item','amount',ii)? parseFloat(objRecordPO.getLineItemValue('item','amount',ii)): 0;
						var fabQty = objRecordPO.getLineItemValue('item','custcol_fabric_quantity',ii)?parseFloat(objRecordPO.getLineItemValue('item','custcol_fabric_quantity',ii)):0
						var additionalShippingAmount = 0;
						switch(objRecordPO.getFieldValue('entity')){
							case '92': //Thomas Mason
										additionalShippingAmount = 2*currentQty;
										break;
							case '88': //Ariston
										additionalShippingAmount = 7*currentQty;
										break;
							case '596': //Carnet
										additionalShippingAmount = 4*currentQty;
										break;
							case '15': //Dormeuil
										additionalShippingAmount = 2*currentQty;
										break;
							case '672': //Drago
										additionalShippingAmount = 4*currentQty;
										break;
							case '79': //Dugdale
										additionalShippingAmount = 2.58*currentQty;
										break;
							case '54': //Harrison
										additionalShippingAmount = 5*currentQty;
										break;
							case '59': //LoroPiana
										additionalShippingAmount = 4.8*currentQty;
										break;
						}
						objRecordPO.selectLineItem('item', ii);
						//objRecordPO.setCurrentLineItemValue('item', 'rate', cmtVendorPrice);
						var exchangeRate = nlapiExchangeRate(objRecordPO.getFieldValue('currency'), 'AUD');
						
						// objRecordPO.setCurrentLineItemValue('item','rate',(currentrate + additionalShippingAmount).toFixed(2));
						// objRecordPO.setCurrentLineItemValue('item','amount',(currentAmount).toFixed(2));
						objRecordPO.setCurrentLineItemValue('item','custcol_shippingprice', additionalShippingAmount);
						objRecordPO.setCurrentLineItemValue('item','custcol_cost_of_goods_sold',parseFloat(objRecordPO.getCurrentLineItemValue('item','amount')));
						objRecordPO.commitLineItem('item');
						//Add shipping cost which is fabric quantity * data
					}
				}
			}

			// nlapiLogExecution('DEBUG', 'submit', 'submit.. ');

			//Submit the record to commit the sublist changes to the database
			nlapiSubmitRecord(objRecordPO);
		}
		else if(type == 'edit'&& nlapiGetContext().getEnvironment() == 'webservices'){
			// nlapiLogExecution('debug','Updates the PURCHASE ORDER USING WEBSERVICES',nlapiGetRecordId())
			var itemCount = objRecordPO.getLineItemCount('item');
			var sorecord;
			if(objRecordPO.getFieldValue( 'createdfrom'))
				sorecord = nlapiLoadRecord( 'salesorder', so.getFieldValue( 'createdfrom'));
			else{
				return;
			}
			for (var ii=1; ii<=itemCount; ii++){
				for(var jj=1; jj<sorecord.getLineItemCount('item'); jj++){
					if(objRecord.getLineItemValue('item','custcol_avt_saleorder_line_key',ii) == sorecord.getLineItemValue('item','custcol_avt_saleorder_line_key',jj)){
						var text  =  objRecordPO.getLineItemText( 'item', 'custcol_avt_fabric_status', ii);
						if(objRecordPO.getLineItemText( 'item', 'custcol_avt_date_sent', ii))
						{
							text += '-' + objRecordPO.getLineItemText( 'item', 'custcol_avt_date_sent', ii);
						}
						if(objRecordPO.getLineItemText( 'item', 'custcol_avt_tracking', ii))
						{
							text += '-' + objRecordPO.getLineItemText( 'item', 'custcol_avt_tracking', ii);
						}
						sorecord.setLineItemValue( 'item', 'custcol_avt_tracking', jj, objRecordPO.getLineItemText( 'item', 'custcol_avt_tracking', ii));
						sorecord.setLineItemValue( 'item', 'custcol_avt_date_sent', jj, objRecordPO.getLineItemText( 'item', 'custcol_avt_date_sent', ii));
						sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_status', jj, objRecordPO.getLineItemText( 'item', 'custcol_avt_fabric_status', ii));
						sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_text', jj, text);
						break;
					}
				}
			}
			nlapiSubmitRecord(sorecord);
		}
	} catch(err){
		nlapiLogExecution('DEBUG', 'Error', err.getDetails());
	}
}
function getShippingCosts(){
	var shippingcosts = [], filter = [], cols = [];
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	//filter.push(new nlobjSearchFilter('custrecord_iscf_tailor',null,'is',tailorID));

	cols.push(new nlobjSearchColumn('custrecord_isc_producttype'));
	cols.push(new nlobjSearchColumn('custrecord_isc_cost'));
	cols.push(new nlobjSearchColumn('custrecord_isc_exempt_tailor'));
	//30
	//Get the surcharges for calculation of shipping
	var do_surcharges = nlapiSearchRecord('customrecord_item_shipping_cost',null,filter,cols);

	for(var k=0; k<do_surcharges.length;k++){
		//name:location,
		//values:{[]}
		shippingcosts.push({
			rate:do_surcharges[k].getValue('custrecord_isc_cost')
			,producttype:do_surcharges[k].getText('custrecord_isc_producttype')
			,exempt: do_surcharges[k].getValue('custrecord_isc_exempt_tailor').split(',')
		});
	}
	return shippingcosts;
}
function getDutiesCosts(){
	var dutiescosts = [], filter = [], cols = [];
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	//filter.push(new nlobjSearchFilter('custrecord_iscf_tailor',null,'is',tailorID));

	cols.push(new nlobjSearchColumn('custrecord_dc_producttype'));
	cols.push(new nlobjSearchColumn('custrecord_dc_cost'));
	cols.push(new nlobjSearchColumn('custrecord_dc_exempt_tailor'));
	//30
	//Get the surcharges for calculation of shipping
	var do_surcharges = nlapiSearchRecord('customrecord_dutiescost',null,filter,cols);

	for(var k=0; k<do_surcharges.length;k++){
		//name:location,
		//values:{[]}
		dutiescosts.push({
			rate:do_surcharges[k].getValue('custrecord_dc_cost')
			,producttype:do_surcharges[k].getText('custrecord_dc_producttype')
			,exempt: do_surcharges[k].getValue('custrecord_dc_exempt_tailor').split(',')
		});
	}
	return dutiescosts;
}
