/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord salesorder
 *
 * @param {String} type Operation types: create, edit, delete, xedi || type == 'edit't,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterApproveSO(type){
	if(type == 'approve' || type == 'edit'){
		if(type == 'edit'){
			var newRec = nlapiGetNewRecord();
			var oldRec = nlapiGetOldRecord();
			if(oldRec.getFieldValue('orderstatus') == 'A' && (newRec.getFieldValue('orderstatus') == 'B')){
			}
			else{
				return;
			}
		}
		var context =  nlapiGetContext();
		var recordID = nlapiGetRecordId();
		//10 Usage
		var newSORecord =  nlapiLoadRecord('salesorder', recordID);
		var vendorLeadDays,monday,tuesday,wednesday,thursday,friday,saturday,sunday;
		var fabricdefault = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_default'));
		monday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_monday'));
		tuesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_tuesday'));
		wednesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_wednesday'));
		thursday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_thursday'));
		friday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_friday'));
		saturday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_saturday'));
		sunday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_sunday'));
		//10 Usage
		var custfields = nlapiLookupField('customer',newSORecord.getFieldValue('entity'),['custentity_delivery_days','pricelevel','currency',
		'custentity_thomasmason_pricelevel', 'custentity_loropiana_pricelevel', 'custentity_huddersfield_pricelevel', 'custentity_filarte_pricelevel',
		'custentity_dugdale_pricelevel', 'custentity_drago_pricelevel', 'custentity_dormeuil_pricelevel', 'custentity_carnet_pricelevel',
		'custentity_artextile_pricelevel', 'custentity_ariston_pricelevel', 'custentity_acshirt_pricelevel']);
		var itemCount = newSORecord.getLineItemCount('item');

		for (var ii=1; ii<=itemCount; ii++){
			var fabdelivery = 0;
			//10 Usage x Item
			if(newSORecord.getLineItemValue('item','povendor',ii))
				fabdelivery = nlapiLookupField('vendor',newSORecord.getLineItemValue('item','povendor',ii),'custentity_fabric_delivery_days');
			else
				fabdelivery = fabricdefault;
			if(!fabdelivery) fabdelivery = fabricdefault;
			var receivedays = 0;
			var cmtdate = 0;
			var today = new Date();
			today.setDate(today.getDate()+1);
			today.setDate(today.getDate()+parseFloat(fabdelivery));
			switch(today.getDay().toString()){
				case '1': receivedays = monday; break;
				case '2': receivedays = tuesday; break;
				case '3': receivedays = wednesday; break;
				case '4': receivedays = thursday; break;
				case '5': receivedays = friday; break;
				case '6': receivedays = saturday; break;
				case '0': receivedays = sunday; break;
				default: 0;
			}

			today.setDate(today.getDate()+parseFloat(receivedays));
			var fabDelivered = nlapiDateToString(today);
			cmtdate = custfields.custentity_delivery_days;

			if(newSORecord.getFieldValue('entity') == '5' || newSORecord.getFieldValue('entity') == '75' || newSORecord.getFieldValue('entity') == '669' || newSORecord.getFieldValue('entity') == '835'){
				if(today.getDay() != 1 && today.getDay() != 4){
					if(today.getDay() > 1 && today.getDay() < 4){
						today.setDate(today.getDate() + (3-today.getDay())%7+1);
					}else{
						today.setDate(today.getDate() + (7-today.getDay())%7+1);
					}
				}
			}else{
				//This always sets to a Monday
				if(today.getDay() != 1)
					today.setDate(today.getDate() + (7-today.getDay())%7+1);
			}

			if(!cmtdate) cmtdate = 4;
			today.setDate(today.getDate()+parseFloat(cmtdate));

			if(today.getDay() == 6)
			today.setDate(today.getDate() + 2)
			if(today.getDay() == 0)
			today.setDate(today.getDate() + 1)

			if(newSORecord.getLineItemValue('item','povendor',ii) != '21' && newSORecord.getLineItemValue('item','povendor',ii) != '35'){
				newSORecord.selectLineItem('item', ii);
				newSORecord.setCurrentLineItemValue('item', 'custcol_fabric_delivery_days',  fabdelivery);
				newSORecord.setCurrentLineItemValue('item', 'custcol_cmt_production_time',  receivedays);
				newSORecord.setCurrentLineItemValue('item','custcol_expected_production_date', fabDelivered)
				newSORecord.setCurrentLineItemValue('item', 'custcol_expected_delivery_date',  nlapiDateToString(today));
				newSORecord.setCurrentLineItemValue('item', 'custcol_tailor_delivery_days',  cmtdate);
				newSORecord.commitLineItem('item');
			}

			if(newSORecord.getLineItemValue('item','povendor',ii) != '17' && newSORecord.getLineItemValue('item','povendor',ii) != '671'){
				newSORecord.selectLineItem('item', ii);
				newSORecord.setCurrentLineItemValue('item', 'custcol_avt_fabric_status', 2);
				newSORecord.setCurrentLineItemValue('item', 'custcol_avt_cmt_status', 7);
              	newSORecord.setCurrentLineItemValue('item', 'custcol_avt_cmt_status_text',newSORecord.getCurrentLineItemText('item', 'custcol_avt_cmt_status'));
				newSORecord.setCurrentLineItemValue('item', 'custcol_avt_fabric_text',newSORecord.getCurrentLineItemText('item', 'custcol_avt_fabric_status'));
				newSORecord.commitLineItem('item');
			}else{
				newSORecord.selectLineItem('item', ii);
				newSORecord.setCurrentLineItemValue('item', 'custcol_avt_fabric_status', 4);
				newSORecord.setCurrentLineItemValue('item', 'custcol_avt_cmt_status', 7);
              	newSORecord.setCurrentLineItemValue('item', 'custcol_avt_cmt_status_text',newSORecord.getCurrentLineItemText('item', 'custcol_avt_cmt_status'));
				newSORecord.setCurrentLineItemValue('item', 'custcol_avt_fabric_text',newSORecord.getCurrentLineItemText('item', 'custcol_avt_fabric_status'));
				newSORecord.commitLineItem('item');
			}
			// nlapiLogExecution('debug','Processed Approval');
		}
		//20 Usage
		var submit = nlapiSubmitRecord(newSORecord);

		//__________50 + 10xItem Usage
		//Transform SO to Invoice
		//40 + 20 x items
		//90 + 30xitems
		//900/30 = 30 items
		try{
			//10 Usage
			var invoice = nlapiTransformRecord('salesorder',nlapiGetRecordId(),'invoice',{recordmode: 'dynamic'});

			//20 Usage
			nlapiSubmitRecord(invoice,true,true);
			//10 Usage
			if(parseFloat(nlapiGetFieldValue('total')) == 0)
				nlapiSubmitField(nlapiGetRecordType(),nlapiGetRecordId(),'custbody_isinvoicepaid','T');
		}
		catch(e){
			nlapiLogExecution('error','Unable To Transform to Invoice', e.getDetails());
			try{
			var cs = nlapiTransformRecord('salesorder',nlapiGetRecordId(),'cashsale');
			nlapiSubmitRecord(cs,true,true);
			}catch(ex){
				nlapiLogExecution('error','Unable To Transform to Cashsale', e.getDetails());
			}
		}
	}
}

function pushliningarray(lining_arr,newSORecord,designoptionsname,liningname,name){
	var a = JSON.parse(newSORecord.getCurrentLineItemValue('item',designoptionsname));
	var iscmtlining = _.find(a,function(x){return x.name == liningname});
	if(iscmtlining.value == 'CMT Lining'){
		var lc = _.find(a,function(x){return x.name == "li-code"});
		var lining_code = lc?lc.value:'';
		var lq = _.find(a,function(x){return x.name == "li-qty"});
		var lining_quantity = lq?lq.value:'';
		var lv = _.find(a,function(x){return x.name == "li-vnd"});
		var lining_vendor = lv?lv.value:'';
		lining_arr.push({
			name:name,
			quantity: lining_quantity,
			code: lining_code,
			datesent:'',
			tracking:'',
			status:'2',
			status_text:'Preparing\n',
			bill:'false',
			vendor:lining_vendor
		});
	}
}
function userEventAfterSubmitSO(type) {
	var context =  nlapiGetContext();
	var executionContext =  context.getExecutionContext();
	//Start Userinterface or webstore
	if ((type == 'create') && (executionContext == 'userinterface' || executionContext == 'webstore' || executionContext == 'restlet')) {
		try {
			var recordID = nlapiGetRecordId();
			//10
			var newSORecord =  nlapiLoadRecord('salesorder', recordID);
			var tailor = newSORecord.getFieldValue('entity')
			//20
			var custfields = nlapiLookupField('customer',newSORecord.getFieldValue('entity'),['custentity_delivery_days','pricelevel','currency',
			'custentity_thomasmason_pricelevel', 'custentity_loropiana_pricelevel', 'custentity_huddersfield_pricelevel', 'custentity_filarte_pricelevel',
			'custentity_dugdale_pricelevel', 'custentity_drago_pricelevel', 'custentity_dormeuil_pricelevel', 'custentity_carnet_pricelevel',
			'custentity_artextile_pricelevel', 'custentity_ariston_pricelevel', 'custentity_acshirt_pricelevel', 'custentity_donotsendorderemails']);
			var soNumber =  newSORecord.getFieldValue('tranid'),
			itemCount = newSORecord.getLineItemCount('item'),
			currency = newSORecord.getFieldValue('currency'),
			status = newSORecord.getFieldText('orderstatus');

			var count = 0;

			var shippingamount = newSORecord.getFieldValue('shippingcost')?newSORecord.getFieldValue('shippingcost'):0;
			var shippingcharges = [], filter = [], cols = [],fabric_surcharges = [];
			filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
			//filter.push(new nlobjSearchFilter('custrecord_iscf_tailor',null,'is',tailorID));

			cols.push(new nlobjSearchColumn('custrecord_iscf_product_type'));
			cols.push(new nlobjSearchColumn('custrecord_iscf_tailor'));
			cols.push(new nlobjSearchColumn('custrecord_iscf_rate'));
			//30
			//Get the surcharges for calculation of shipping
			var do_surcharges = nlapiSearchRecord('customrecord_item_shipping_charges',null,filter,cols);

			for(var k=0; k<do_surcharges.length;k++){
				//name:location,
				//values:{[]}
				shippingcharges.push({
					tailor:do_surcharges[k].getValue('custrecord_iscf_tailor')
					,rate:do_surcharges[k].getValue('custrecord_iscf_rate')
					,producttype:do_surcharges[k].getValue('custrecord_iscf_product_type')
				});
			}
			cols = [];
			cols.push(new nlobjSearchColumn('custrecord_fis_producttype'));
			cols.push(new nlobjSearchColumn('custrecord_fis_code'));
			cols.push(new nlobjSearchColumn('custrecord_fis_name'));
			cols.push(new nlobjSearchColumn('custrecord_fis_minimum'));
			cols.push(new nlobjSearchColumn('custrecord_fis_maximum'));
			cols.push(new nlobjSearchColumn('custrecord_fis_surchargerate'));
			var fab_surcharges = nlapiSearchRecord('customrecord_fabric_invoice_surcharge',null,filter,cols);
			for(var k=0; k<fab_surcharges.length;k++){
				fabric_surcharges.push({
					internalid: fab_surcharges[k].getId()
					,surchargerate:fab_surcharges[k].getValue("custrecord_fis_surchargerate")
					,code:fab_surcharges[k].getValue("custrecord_fis_code")
					,name:fab_surcharges[k].getValue("custrecord_fis_name")
					,min:fab_surcharges[k].getValue('custrecord_fis_minimum')
					,max:fab_surcharges[k].getValue("custrecord_fis_maximum")
					,producttype:fab_surcharges[k].getValue('custrecord_fis_producttype')
				});
			}
			cols = [];
			cols.push(new nlobjSearchColumn('custrecord_fi_record'));
			cols.push(new nlobjSearchColumn('custrecord_fi_tailor'));
			cols.push(new nlobjSearchColumn('custrecord_fi_surcharge_rate'));
			var fabric_customsurcharges = [];
			var fab_customsurcharges = nlapiSearchRecord('customrecord_fabric_invoice_custom_tailo',null,filter,cols);
			if(fab_customsurcharges){
			for(var k=0; k<fab_customsurcharges.length;k++){
				fabric_customsurcharges.push({
					fabricinvoicerecord:fab_customsurcharges[k].getValue("custrecord_fi_record")
					,tailor:fab_customsurcharges[k].getValue("custrecord_fi_tailor")
					,customsurcharge:fab_customsurcharges[k].getValue("custrecord_fi_surcharge_rate")
				});
			}
			}
			for (var ii=1; ii<=itemCount; ii++){
				//get soID value
				var itemID = newSORecord.getLineItemValue('item', 'item', ii);
				var qty = parseFloat(newSORecord.getLineItemValue('item','quantity',ii));

				//30 + 5x
				var itemfields = nlapiLookupField('item',itemID,['custitem_clothing_type','custitem_jerome_cmt_serviceitem']);
				var clothingtype = itemfields.custitem_clothing_type;
				
				if ((type == 'create') && (executionContext == 'userinterface' || executionContext == 'webstore' || executionContext == 'restlet'))
				{
					var dateNeededValue = newSORecord.getLineItemValue('item', 'custcol_avt_date_needed', ii);

					newSORecord.selectLineItem('item', ii);
					//Set the custcol_cmt_lining_text to a JSON array of clothing types
					try{
						var clothtypes = newSORecord.getLineItemValue('item','custcol_producttype',ii);
						var lining_arr = [];
						switch(clothtypes){
							case 'Jacket':
							case '2-Piece-Suit':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_jacket',"li-b-j","Jacket");
							break;
							case 'Waistcoat':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_waistcoat',"li-bl-w","Waistcoat");
							break;
							case '3-Piece-Suit':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_jacket',"li-b-j","Jacket");
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_waistcoat',"li-bl-w","Waistcoat");
								break;
							case 'Overcoat':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_overcoat',"li-bl-o","Overcoat");
								break;
							case 'Trenchcoat':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_trenchcoat',"li-bl-tc","Trenchcoat");
								break;
							case 'Ladies-Jacket':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesjacket',"li-b-lj","Ladies-Jacket");
								break;
							case 'L-2PC-Skirt':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesjacket',"li-b-lj","Ladies-Jacket");
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesskirt',"li-fo-ls","Ladies-Skirt");
								break;
							case 'L-3PC-Suit':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesjacket',"li-b-lj","Ladies-Jacket");
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesskirt',"li-fo-ls","Ladies-Skirt");
								break;
							case 'L-2PC-Pants':
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesjacket',"li-b-lj","Ladies-Jacket");
								break;								
							case "Ladies-Skirt":
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_ladiesskirt',"li-fo-ls","Ladies-Skirt");
								break;
							case "Morning-Coat":
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_morning_coat',"li-b-j","Morning-Coat");
								break;
							case "Safari-Jacket":
								pushliningarray(lining_arr,newSORecord,'custcol_designoptions_safari_jacket',"li-b-j","Safari-Jacket");
								break;
						}
						newSORecord.setCurrentLineItemValue('item', 'custcol_cmt_lining_text',  JSON.stringify(lining_arr));
					}
					catch(e){
						nlapiLogExecution('error','Error processing Lining Array for an item', soNumber + ' ' + itemID);
					}
					//Set the correct vendor when test vendor is selected
					if(newSORecord.getCurrentLineItemValue('item','povendor') == '78'){
						var pickedVendor = newSORecord.getCurrentLineItemValue('item','custcol_vendorpicked');

						//This is for CMT ITEM, other item ids are from old cmt items
						if( itemID == '253776' || itemID == '28034' ||
							itemID == '28035' ||
							itemID == '28030' ||
							itemID == '28033' ||
							itemID == '28036' ||
							itemID == '28031' ||
							itemID == '28032'){
							if(pickedVendor && pickedVendor != ''){
								switch(pickedVendor){
									case '31': //Ariston
											newSORecord.setCurrentLineItemValue('item','povendor','689');
											break;
									case '13': //Ariston
												newSORecord.setCurrentLineItemValue('item','povendor','88');
												break;
									case '27': //Bateman Ogden
												newSORecord.setCurrentLineItemValue('item','povendor','599');
												break;
									case '25': //Carnet
												newSORecord.setCurrentLineItemValue('item','povendor','596');
												break;
									case '17': //Cerruti
												newSORecord.setCurrentLineItemValue('item','povendor','113');
												break;
									case '2': //Dormeuil
												newSORecord.setCurrentLineItemValue('item','povendor','15');
												break;
									case '18': //Dormeuil USA
												newSORecord.setCurrentLineItemValue('item','povendor','123');
												break;
									case '29': //Drago
												newSORecord.setCurrentLineItemValue('item','povendor','672');
												break;
									case '12': //Dugdale Bros
												newSORecord.setCurrentLineItemValue('item','povendor','79');
												break;
									case '30': //Filarte
												newSORecord.setCurrentLineItemValue('item','povendor','675');
												break;
									case '14': //Gladson
												newSORecord.setCurrentLineItemValue('item','povendor','87');
												break;
									case '4': //Harrisons
												newSORecord.setCurrentLineItemValue('item','povendor','54');
												break;
									case '20': //Holland and Sherry
												newSORecord.setCurrentLineItemValue('item','povendor','121');
												break;
									case '3': //Huddersfield Cloth
												newSORecord.setCurrentLineItemValue('item','povendor','10');
												break;
									case '11': //Jerome Clothiers, I Think this is not set anymore, have website validation
												newSORecord.setCurrentLineItemValue('item','povendor','17');
												break;
									case '5': //Loro and Piana
												newSORecord.setCurrentLineItemValue('item','povendor','59');
												break;
									case '6': //Molly and sons
												newSORecord.setCurrentLineItemValue('item','povendor','63');
												break;
									case '19': //Scabal
												newSORecord.setCurrentLineItemValue('item','povendor','122');
												break;
									case '26': //Terio Fabrics
												newSORecord.setCurrentLineItemValue('item','povendor','568');
												break;
									case '7': //Tessitura Monti
												newSORecord.setCurrentLineItemValue('item','povendor','61');
												break;
									case '16': //Thomas Mason
												newSORecord.setCurrentLineItemValue('item','povendor','92');
												break;
									case '21': //Zegna
												newSORecord.setCurrentLineItemValue('item','povendor','120');
												break;
									case '34': //Zegna
												newSORecord.setCurrentLineItemValue('item','povendor','672');
												break;
									case '35': //Caccioppoli
												newSORecord.setCurrentLineItemValue('item','povendor','790');
												break;
									case '37': //Huddersfield Fine Worsteds
												newSORecord.setCurrentLineItemValue('item','povendor','784');
												break;
									case '36': //Artextile
												newSORecord.setCurrentLineItemValue('item','povendor','785');
												break;
									case '38': //Long Wear
												newSORecord.setCurrentLineItemValue('item','povendor','812');
												break;
									case '39': //Tessitura Monti
												newSORecord.setCurrentLineItemValue('item','povendor','850');
												break;
									case '40': //Francis Velvets
												newSORecord.setCurrentLineItemValue('item','povendor','868');
												break;
									case '41': //Fox Brothers
												newSORecord.setCurrentLineItemValue('item','povendor','906');
												break;
									case '42': //Bernstein & Benleys
												newSORecord.setCurrentLineItemValue('item','povendor','939');
												break;
								}
							}
						}
					}else{
						switch(newSORecord.getCurrentLineItemValue('item','povendor')){
							case '939': //Ariston
									newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','42');
									break;
							case '689': //Ariston
									newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','31');
									break;
							case '88': //Ariston
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','13');
										break;
							case '599': //Bateman Ogden
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','27');
										break;
							case '596': //Carnet
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','25');
										break;
							case '113': //Cerruti
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','17');
										break;
							case '15': //Dormeuil
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','2');
										break;
							case '123': //Dormeuil USA
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','18');
										break;
							case '672': //Drago
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','29');
										break;
							case '79': //Dugdale Bros
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','12');
										break;
							case '675': //Filarte
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','30');
										break;
							case '87': //Gladson
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','14');
										break;
							case '54': //Harrisons
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','4');
										break;
							case '121': //Holland and Sherry
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','20');
										break;
							case '10': //Huddersfield Cloth
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','3');
										break;
							case '17': //Jerome Clothiers, I Think this is not set anymore, have website validation
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','11');
										break;
							case '59': //Loro and Piana
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','5');
										break;
							case '63': //Molly and sons
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','6');
										break;
							case '122': //Scabal
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','19');
										break;
							case '568': //Terio Fabrics
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','26');
										break;
							case '61': //Tessitura Monti
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','7');
										break;
							case '92': //Thomas Mason
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','16');
										break;
							case '120': //Zegna
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','21');
										break;
							case '672': //Zegna
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','34');
										break;
							case '790': //Caccioppoli
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','35');
										break;
							case '784': //Huddersfield Fine Worsteds
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','37');
										break;
							case '785': //Artextile
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','36');
										break;
							case '812': //Long Wear
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','38');
										break;
							case '850': //Tessitura Monti
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','39');
										break;
							case '868': //Francis Velvets
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','40');
										break;
							case '906': //Fox Brothers
										newSORecord.setCurrentLineItemValue('item','custcol_vendorpicked','41');
										break;
						}
					}
					newSORecord.setCurrentLineItemValue('item', 'custcol_avt_saleorder_line_key',  recordID.toString() + '_' + new Date().getTime());

					if (dateNeededValue == '1/1/1900')
					{
						newSORecord.setCurrentLineItemValue('item', 'custcol_avt_date_needed', '');
					}

					//Check the service item checkbox. If this is 'yes', then it is a service item.
					var isServiceItem = itemfields.custitem_jerome_cmt_serviceitem;
					var arCustomColumnValues = [];
					var arCustomColumnNames = [	 'custcol_ps_cart_item_id'
											   , 'custcol_custom_price'
											   , 'custcol_customer_amount'
											   , 'custcol_customer_rate'
											   , 'custcol_designoptions_jacket'
											   , 'custcol_designoption_message'
											   , 'custcol_designoptions_overcoat'
											   ,  'custcol_designoptions_shirt'
											   , 'custcol_designoptions_trouser'
											   , 'custcol_designoptions_waistcoat'
											   , 'custcol_fabric_quantity'
											   , 'custcol_fitprofile_jacket'
											   , 'custcol_fitprofile_message'
											   , 'custcol_fitprofile_overcoat'
											   , 'custcol_fitprofile_shirt'
											   , 'custcol_fitprofile_trouser'
											   , 'custcol_fitprofile_waistcoat'
											   , 'custcol_fitprofile_summary'
											   , 'custcol_tailor_client_name'
											   , 'custcol_avt_date_needed'
											   , 'custcol_cmt_lining_text'
											   , 'custcol_producttype'
											   , 'custcol_vendorpicked'
											   , 'custcol_fitprofile_shirt_in'
											   , 'custcol_fitprofile_overcoat_in'
											   , 'custcol_fitprofile_waistcoat_in'
											   , 'custcol_fitprofile_trouser_in'
											   , 'custcol_fitprofile_jacket_in'
											   , 'custcol_fabric_extra'
											   , 'custcol_custom_fabric_details'
											   , 'custcol_designoptions_ladies-jacket'
											   , 'custcol_designoptions_ladies-pants'
											   , 'custcol_designoptions_ladies-skirt'
											   , 'custcol_designoptions_ssshirt'
											   , 'custcol_designoptions_trenchcoat'
											   , 'custcol_fitprofile_ladies-jacket'
											   , 'custcol_fitprofile_ladies-pants'
											   , 'custcol_fitprofile_ladies-skirt'
											   , 'custcol_fitprofile_ssshirt'
											   , 'custcol_fitprofile_trenchcoat'
											   , 'custcol_fitprofile_trenchcoat_in'
											   , 'custcol_fitprofile_ssshirt_in'
											   , 'custcol_fitprofile_ladies-skirt_in'
											   , 'custcol_fitprofile_ladies-pants_in'
											   , 'custcol_fitprofile_ladies-jacket_in'
											   , 'custcol_designoptions_morning_coat'
											   , 'custcol_designoptions_shirt_jacket'
											   , 'custcol_designoptions_camp_shirt'
											   , 'custcol_designoptions_safari_jacket'
											   , 'custcol_designoptions_shorts'
											   , 'custcol_fitprofile_shorts_in'
											   , 'custcol_fitprofile_morning_coat_in'
											   , 'custcol_fitprofile_shirt_jacket_in'
											   , 'custcol_fitprofile_camp_shirt_in'
											   , 'custcol_fitprofile_safari_jacket_in'
											   , 'custcol_fitprofile_safari_jacket'
											   , 'custcol_fitprofile_camp_shirt'
											   , 'custcol_fitprofile_shirt_jacket'
											   , 'custcol_fitprofile_morning_coat'
											   , 'custcol_fitprofile_shorts'
											  ];

					if (isServiceItem != 'T'){
						var description = newSORecord.getLineItemValue('item','description',ii);
				
						var priceLevel = newSORecord.getLineItemValue('item', 'price', ii);
						// set quantity to fabric quantity
						//30 + 15x
						var fabric_quantity = newSORecord.getCurrentLineItemValue('item','quantity') ;
						var currentRate = newSORecord.getCurrentLineItemValue('item','rate');
						var currentAmount = newSORecord.getCurrentLineItemValue('item','amount');
						if(priceLevel && priceLevel > 0) {
							fabric_quantity = newSORecord.getLineItemValue('item', 'custcol_fabric_quantity', ii);
							newSORecord.setCurrentLineItemValue('item', 'quantity', fabric_quantity);
						}
						//START SETTING PRICE BASED ON FABRIC PRICE AND QTY
						var soid = newSORecord.getLineItemValue('item','custcol_so_id',ii);
						var povendor = newSORecord.getLineItemValue('item','povendor',ii);
						var itemtype = newSORecord.getLineItemValue('item','custcol_producttype',ii);

						if( povendor != '671' && povendor != '17'){
							//The vendor is not Jerome... get the prices and the quantity computation
							var quantity = {
								'2-Piece-Suit' : '3.3',
								'3-Piece-Suit': '3.7',
								'Jacket': '1.9',
								'Trouser': '1.75',
								'Waistcoat': '1',
								'Overcoat': '2.5',
								'Shirt': '2',
								'Trenchcoat': '2.5',
								'Short-Sleeves-Shirt': '2',
								'Ladies-Jacket': '1.8',
								'Ladies-Pants': '1.75',
								'Ladies-Skirt': '1',
								'L-2PC-Skirt': '2.5',
								'L-3PC-Suit': '3.9',
								'L-2PC-Pants': '3.1',
								'Safari-Jacket': '2',
								'Morning-Coat': '2.2',
								'Shirt-Jacket': '2.2',
								'Shorts': '1.1',
								'Camp-Shirt': '2'
							};
							var useCustomerPriceLevel = custfields.pricelevel;
							//Add some logic here that will check the item's price level. must be depending on the vendor..
							// nlapiLogExecution('debug','oldpricelevel',useCustomerPriceLevel);
							// nlapiLogExecution('debug','povendor',povendor);
							if(povendor == '689' || povendor == '88' || povendor == '785' || povendor == '596' || povendor == '15' ||
							povendor == '672' || povendor == '79' || povendor == '675' || povendor == '784' || povendor == '59' || povendor == '92'){
								switch(povendor){
									case '689' :
										if(custfields.custentity_acshirt_pricelevel)
											useCustomerPriceLevel = custfields.custentity_acshirt_pricelevel;
										break;
									case '88' :
										if(custfields.custentity_ariston_pricelevel)
											useCustomerPriceLevel = custfields.custentity_ariston_pricelevel;
										break;
									case '785' :
										if(custfields.custentity_artextile_pricelevel)
											useCustomerPriceLevel = custfields.custentity_artextile_pricelevel;
										break;
									case '596' :
										if(custfields.custentity_carnet_pricelevel)
											useCustomerPriceLevel = custfields.custentity_carnet_pricelevel;
										break;
									case '15' :
										if(custfields.custentity_dormeuil_pricelevel)
											useCustomerPriceLevel = custfields.custentity_dormeuil_pricelevel;
										break;
									case '672' :
										if(custfields.custentity_drago_pricelevel)
											useCustomerPriceLevel = custfields.custentity_drago_pricelevel;
										break;
									case '79' :
										if(custfields.custentity_dugdale_pricelevel)
											useCustomerPriceLevel = custfields.custentity_dugdale_pricelevel;
										break;
									case '675' :
										if(custfields.custentity_filarte_pricelevel)
											useCustomerPriceLevel = custfields.custentity_filarte_pricelevel;
										break;
									case '784' :
										if(custfields.custentity_huddersfield_pricelevel)
											useCustomerPriceLevel = custfields.custentity_huddersfield_pricelevel;
										break;
									case '59' :
										if(custfields.custentity_loropiana_pricelevel)
											useCustomerPriceLevel = custfields.custentity_loropiana_pricelevel;
										break;
									case '92' :
										if(custfields.custentity_thomasmason_pricelevel)
											useCustomerPriceLevel = custfields.custentity_thomasmason_pricelevel;
										break;
									default:
								}
							}
							// nlapiLogExecution('debug','newpricelevel',useCustomerPriceLevel);
							var filters = [
							new nlobjSearchFilter('currency','pricing','anyof',[currency]),
							new nlobjSearchFilter('pricelevel','pricing','anyof',[useCustomerPriceLevel]),
							new nlobjSearchFilter('internalid',null,'anyof',[itemID])];
							var columns = [new nlobjSearchColumn('unitprice','pricing')];
							var result = nlapiSearchRecord('item',null,filters,columns);
							if(result && result.length>0){
								//nlapiLogExecution('debug','has results');
								var price = parseFloat(result[0].getValue('unitprice','pricing'));

								switch(itemtype){
									case '2-Piece-Suit' : 
									case '3-Piece-Suit': 
									case 'Jacket': 
									case 'Trouser': 
									case 'Waistcoat': 
									case 'Overcoat': 
									case 'Shirt': 
									case 'Trenchcoat' : 
									case 'Short-Sleeves-Shirt': 
									case 'Ladies-Jacket': 
									case 'Ladies-Pants': 
									case 'Ladies-Skirt': 
									case 'L-2PC-Skirt': 
									case 'L-3PC-Suit': 
									case 'L-2PC-Pants': 
									case 'Shorts':
									case 'Camp-Shirt':
									case 'Shirt-Jacket':
									case 'Safari-Jacket':
									case 'Morning-Coat': currentAmount = price * parseFloat(quantity[itemtype]); break;
									default:
								}
								currentRate = currentAmount/parseFloat(fabric_quantity);
								newSORecord.setCurrentLineItemValue('item','price', -1);
								newSORecord.setCurrentLineItemValue('item','rate',currentRate);
								newSORecord.setCurrentLineItemValue('item','amount',currentAmount);
								description = newSORecord.getCurrentLineItemText('item','item') + " " + newSORecord.getCurrentLineItemValue('item','amount');
								//newSORecord.setCurrentLineItemValue('item','description', description);
								
							}
						}
						//nlapiLogExecution('debug','currentRate',currentRate);
						//nlapiLogExecution('debug','currentAmount',currentAmount);
						//END SETTING PRICE BASED ON FABRIC PRICE AND QTY
						var totaladditionalsurcharge = 0;
						if(newSORecord.getLineItemValue('item','custcol_producttype',ii)){

							//Check Fabric Prices based on block types 2/8/2019
							var fpsummary = newSORecord.getLineItemValue('item','custcol_fitprofile_summary',ii);
							var fabricextra = newSORecord.getLineItemValue('item','custcol_fabric_extra',ii);
							var ptype = newSORecord.getLineItemValue('item','custcol_producttype',ii);

							// nlapiLogExecution('debug','FPSJSON');
							var fpsJSON = JSON.parse(fpsummary);
							if(fpsJSON && fpsJSON.length>0){
								//Check for Block,

								//fabric_surcharges
								var maxblockvalue = 0;
								for(var h =0;h<fpsJSON.length;h++){
									//get the max block value;
									if(fpsJSON[h].blockvalue && parseFloat(fpsJSON[h].blockvalue.substr(0,2)) > maxblockvalue)
										maxblockvalue = parseFloat(fpsJSON[h].blockvalue.substr(0,2));
								}
								if(maxblockvalue > 0){
									var blockSurcharges = _.filter(fabric_surcharges,function(z){
										//surchargerate,code,name,min,max,producttype
										return z.name == 'Block' && z.producttype == ptype &&
										( parseFloat(z.min) <= maxblockvalue && parseFloat(z.max) >= maxblockvalue);
									});
									// nlapiLogExecution('debug','Block Surcharges', JSON.stringify(blockSurcharges));
									// nlapiLogExecution('debug','fabric_customsurcharges', JSON.stringify(fabric_customsurcharges));
									if(blockSurcharges.length>0){
										var customSurcharge = _.find(fabric_customsurcharges,function(z){
											return z.fabricinvoicerecord == blockSurcharges[0].internalid && tailor == z.tailor;
										});
										if(customSurcharge){
											description += "\nLarge Size Surcharge " + customSurcharge.customsurcharge;
											totaladditionalsurcharge += (parseFloat(currentAmount) * parseFloat(customSurcharge.customsurcharge));
										}else{
											description += "\nLarge Size Surcharge " + (parseFloat(currentAmount) * parseFloat(blockSurcharges[0].surchargerate)).toFixed(2);
											totaladditionalsurcharge += parseFloat(blockSurcharges[0].surchargerate);
										}
									}
								}
								// nlapiLogExecution('debug','Max Block Value',maxblockvalue);
								// nlapiLogExecution('debug','totaladditionalsurcharge',totaladditionalsurcharge);
								var itemtypes = [];
								//Design Options //Unlined Turnup, Backwith Fabric
								if(ptype == '3-Piece-Suit'){
									var j_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_jacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									var t_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_trouser'),fabric_surcharges, fabric_customsurcharges, tailor);
									var w_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_waistcoat'),fabric_surcharges, fabric_customsurcharges, tailor);
									if(j_surcharge.rate != 0)
									description += "\n"+j_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(j_surcharge.rate)).toFixed(2);
									if(t_surcharge.rate != 0)
									description += "\n"+t_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(t_surcharge.rate)).toFixed(2);
									if(w_surcharge.rate != 0)
									description += "\n"+w_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(w_surcharge.rate)).toFixed(2);
									totaladditionalsurcharge += parseFloat(j_surcharge.rate) + parseFloat(t_surcharge.rate) + parseFloat(w_surcharge.rate);
								}else if(ptype == '2-Piece-Suit'){
									var j_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_jacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									var t_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_trouser'),fabric_surcharges, fabric_customsurcharges, tailor);
									if(j_surcharge.rate != 0)
									description += "\n"+j_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(j_surcharge.rate)).toFixed(2);
									if(t_surcharge.rate != 0)
									description += "\n"+t_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(t_surcharge.rate)).toFixed(2);
									totaladditionalsurcharge += parseFloat(j_surcharge.rate) + parseFloat(t_surcharge.rate);
								}
								else if(ptype == 'L-2PC-Pants'){
									var j_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesjacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									var t_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiespants'),fabric_surcharges, fabric_customsurcharges, tailor);
									if(j_surcharge.rate != 0)
									description += "\n"+j_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(j_surcharge.rate)).toFixed(2);
									if(t_surcharge.rate != 0)
									description += "\n"+t_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(t_surcharge.rate)).toFixed(2);
									totaladditionalsurcharge += parseFloat(j_surcharge.rate) + parseFloat(t_surcharge.rate);
								}
								else if(ptype == 'L-3PC-Suit'){
									var j_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesjacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									var t_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiespants'),fabric_surcharges, fabric_customsurcharges, tailor);
									var sk_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesskirt'),fabric_surcharges, fabric_customsurcharges, tailor);
									if(j_surcharge.rate != 0)
									description += "\n"+j_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(j_surcharge.rate)).toFixed(2);
									if(t_surcharge.rate != 0)
									description += "\n"+t_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(t_surcharge.rate)).toFixed(2);
									if(sk_surcharge.rate != 0)
									description += "\n"+sk_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(sk_surcharge.rate)).toFixed(2);
									totaladditionalsurcharge += parseFloat(j_surcharge.rate) + parseFloat(t_surcharge.rate) + parseFloat(sk_surcharge.rate);
								}
								else if(ptype == 'L-2PC-Skirt'){
									var j_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesjacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									var t_surcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesskirt'),fabric_surcharges, fabric_customsurcharges, tailor);
									if(j_surcharge.rate != 0)
									description += "\n"+j_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(j_surcharge.rate)).toFixed(2);
									if(t_surcharge.rate != 0)
									description += "\n"+t_surcharge.description + " " + (parseFloat(currentAmount) * parseFloat(t_surcharge.rate)).toFixed(2);
									totaladditionalsurcharge += parseFloat(j_surcharge.rate) + parseFloat(t_surcharge.rate);
								}
								
								else{
									var singlesurcharge;
									if(fpsJSON[0].name == 'Jacket'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_jacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Trouser'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_trouser'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Waistcoat'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_waistcoat'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Overcoat'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_overcoat'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Ladies-Jacket'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesjacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Ladies-Pants'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiespants'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Ladies-Skirt'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ladiesskirt'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Trenchcoat'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_trenchcoat'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Short-Sleeves-Shirt'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_ssshirt'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Shirt'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_shirt'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Shorts'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_shorts'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Morning-Coat'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_morning_coat'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Camp-Shirt'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_camp_shirt'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Shirt-Jacket'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_shirt_jacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									}else if(fpsJSON[0].name == 'Safari-Jacket'){
										singlesurcharge = getSurcharge(ptype,newSORecord.getCurrentLineItemValue('item','custcol_designoptions_safari_jacket'),fabric_surcharges, fabric_customsurcharges, tailor);
									}
									if(singlesurcharge.rate != 0)
									description += "\n"+singlesurcharge.description + " " + (parseFloat(currentAmount) * parseFloat(singlesurcharge.rate)).toFixed(2);
									totaladditionalsurcharge += parseFloat(singlesurcharge.rate);
									// nlapiLogExecution('debug','fpsJSON[0].name',fpsJSON[0].name);
									// nlapiLogExecution('debug','singlesurcharge',singlesurcharge);
									// nlapiLogExecution('debug','totaladditionalsurcharge',totaladditionalsurcharge);

								}
							}
							//Check for fabric extra
							var fextra = newSORecord.getCurrentLineItemValue('item','custcol_fabric_extra');
							if(fextra){
								var fextraSurcharges = _.filter(fabric_surcharges,function(z){
									//surchargerate,code,name,min,max,producttype
									return z.code == 'Fabric Design' && z.producttype == ptype &&
									z.name == fextra;
								});
								if(fextraSurcharges.length>0){
									var customSurcharge = _.find(fabric_customsurcharges,function(z){
										return z.fabricinvoicerecord == fextraSurcharges[0].internalid && tailor == z.tailor;
									});
									if(customSurcharge){
										description += "\n"+fextraSurcharges[0].name + " " + (parseFloat(currentAmount) * parseFloat(customSurcharge.customsurcharge)).toFixed(2);
										totaladditionalsurcharge += parseFloat(customSurcharge.customsurcharge);
									}else{
										// nlapiLogExecution('debug','Fabric Extra Surcharge',fextraSurcharges[0].surchargerate);
										description += "\n"+fextraSurcharges[0].name + " " + (parseFloat(currentAmount) * parseFloat(fextraSurcharges[0].surchargerate)).toFixed(2);
										totaladditionalsurcharge += parseFloat(fextraSurcharges[0].surchargerate);
									}
								}
							}
						}
						//custcol_additionalfabricsurcharge
						newSORecord.setCurrentLineItemValue('item','custcol_additionalfabricsurcharge',totaladditionalsurcharge.toFixed(2));
						newSORecord.setCurrentLineItemValue('item','description',description);
						newSORecord.setCurrentLineItemValue('item','price', -1);
						newSORecord.setCurrentLineItemValue('item','rate',currentRate * (1+totaladditionalsurcharge));
						var newAmount = currentAmount * (1+totaladditionalsurcharge);
						newAmount = Math.round(newAmount);
						newSORecord.setCurrentLineItemValue('item','amount',newAmount.toFixed(2));
						count++;
						arCustomColumnValues = [];
					} else {
						//it is a service item, so copy the details of custom columns from the fabric item line above it and insert it to the service line item.
						if (ii > 1){
							for (var columnNumber = 0; columnNumber < arCustomColumnNames.length; columnNumber++){
								arCustomColumnValues.push(newSORecord.getLineItemValue('item', arCustomColumnNames[columnNumber], ii-1));
							}
							for (var columnNumber = 0; columnNumber < arCustomColumnNames.length; columnNumber++){
								//newSORecord.setCurrentLineItemValue('item', arCustomColumnNames[columnNumber], arCustomColumnValues[columnNumber]);

								// AVT
								if (arCustomColumnNames[columnNumber] == 'custcol_avt_date_needed')
								{
									var dateNeededInsertedValue = arCustomColumnValues[columnNumber];

									if (dateNeededInsertedValue == '1/1/1900')
									{
										arCustomColumnValues[columnNumber] = '';
									}
								}
								newSORecord.setCurrentLineItemValue('item', arCustomColumnNames[columnNumber], arCustomColumnValues[columnNumber]);
							}

							if (type == 'create' && (executionContext == 'webstore' || executionContext == 'restlet'))
							{
								newSORecord.setCurrentLineItemValue('item', 'custcol_avt_saleorder_line_key', recordID.toString() + '_' + new Date().getTime());
							}
							//Calculating the shipping based on tailor and product type
							var ptype = newSORecord.getCurrentLineItemValue('item','custcol_producttype');
							if(ptype){
								switch(ptype){
									case "2-Piece-Suit": clothingtype = "10"; break;
									case "3-Piece-Suit": clothingtype = "9"; break;
									case "Shirt": clothingtype = "7"; break;
									case "Jacket": clothingtype = "3"; break;
									case "Trouser": clothingtype = "4"; break;
									case "Waistcoat": clothingtype = "6"; break;
									case "Overcoat": clothingtype = "8"; break;
									case 'Trenchcoat' : clothingtype = "13"; break;
									case 'Short-Sleeves-Shirt': clothingtype = "12"; break;
									case 'Ladies-Jacket': clothingtype = "14"; break;
									case 'Ladies-Pants': clothingtype = "15"; break;
									case 'Ladies-Skirt': clothingtype = "16"; break;
									case 'L-2PC-Skirt': clothingtype = "17"; break;
									case 'L-3PC-Suit': clothingtype = "18"; break;
									case 'L-2PC-Pants': clothingtype = "19"; break;
									case 'Morning-Coat': clothingtype = "27"; break;
									case 'Shorts': clothingtype = "28"; break;
									case 'Camp-Shirt': clothingtype = "29"; break;
									case 'Safari-Jacket': clothingtype = "31"; break;
									case 'Shirt-Jacket': clothingtype = "30"; break;
								}
								var custom = _.find(shippingcharges,function(x){return x.producttype == clothingtype && x.tailor == newSORecord.getFieldValue('entity')});
								if(custom){
									shippingamount = parseFloat(shippingamount) + parseFloat(custom.rate);
									newSORecord.setCurrentLineItemValue('item', 'custcol_shippingprice', parseFloat(custom.rate));
								}
								else{
									custom = _.find(shippingcharges,function(x){return x.producttype == clothingtype && x.tailor == ''});
									if(custom){
										shippingamount = parseFloat(shippingamount) + parseFloat(custom.rate);
										newSORecord.setCurrentLineItemValue('item', 'custcol_shippingprice', parseFloat(custom.rate));
									}
								}
							}else{
								//Not sure why it went here.. must have been a non fabric item
							}
						}

					}


					//Set the SO ID column to the unique identifier - SalesOrder_fabric item line number.
					//both the fabric item and service item will have the same identifier for association purposes.

					newSORecord.setCurrentLineItemValue('item', 'custcol_so_id', soNumber + '-' + count);
					newSORecord.commitLineItem('item');
				}
			}
			newSORecord.setFieldValue('shippingcost',shippingamount);
			//50 + 30x
			var submit = nlapiSubmitRecord(newSORecord);
			//Send Email, disable for rooks and rocks
			if(type == 'create' && custfields.custentity_donotsendorderemails == 'F') {
				sendConfirmationEmail();
			}
		} catch (ex) {
			var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
			nlapiLogExecution('ERROR', 'userEventAfterSubmitSO error', strError);
		}
	}
}

function sendConfirmationEmail(){
	var templateID = 3;
	var emailTemp = nlapiLoadRecord('emailtemplate', templateID); //Order Confirmation Template
	var emailBody = emailTemp.getFieldValue('content');
	var records = new Object();
	records['transaction'] = nlapiGetRecordId(); //internal id of Transaction
	var renderer = nlapiCreateTemplateRenderer();
	var record = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
	renderer.addRecord('transaction', record);
	renderer.setTemplate(emailBody);
	renderBody = renderer.renderToString();
	var stSubject = emailTemp.getFieldValue('subject');

	nlapiSendEmail(98, record.getFieldValue('entity'), "Your order no. "+ record.getFieldValue('tranid') +" has been received",renderBody,null,null,records, null, true, null);

}
function getSurcharge(ptype,dop,fabric_surcharges, fabric_customsurcharges, tailor){
	// var additionalsurcharge = 0;
	var additionalsurcharge = 0, description = "";
	if(dop){
		
		var surcharges = _.filter(fabric_surcharges,function(z){
			//surchargerate,code,name,min,max,producttype
			return z.producttype == ptype;
		});
		if(surcharges){
			for(var i=0;i<surcharges.length;i++){
				if(dop.indexOf(surcharges[i].name) != -1){
					// nlapiLogExecution('debug','surcharges[i].name',surcharges[i].name);
					var customSurcharge = _.find(fabric_customsurcharges,function(z){
						return z.fabricinvoicerecord == surcharges[i].internalid && tailor == z.tailor;
					});
					if(customSurcharge){
						description = description?", " + surcharges[i].code: surcharges[i].code;
						additionalsurcharge += parseFloat(customSurcharge.customsurcharge);
					}else{
						description = description?", " + surcharges[i].code: surcharges[i].code;
						additionalsurcharge += parseFloat(surcharges[i].surchargerate?surcharges[i].surchargerate:0);
					}
				}
			}
		}
		return {description: description, rate: additionalsurcharge};
	
	}
	return {description: "No Surcharge", rate:0};
	// return additionalsurcharge;
}
