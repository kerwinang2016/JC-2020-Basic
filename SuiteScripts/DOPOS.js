//Developed by : Kerwin Ang
//Email : Kerwin_ang@yahoo.com
//Before Submit
function posurcharge(type){

	if(type == 'create' || type == 'specialorder'){

		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
		var cols = [];
		cols.push(new nlobjSearchColumn('custrecord_dospo_description'));
		cols.push(new nlobjSearchColumn('custrecord_dospo_code'));
		cols.push(new nlobjSearchColumn('custrecord_dospo_surcharge'));
		cols.push(new nlobjSearchColumn('custrecord_dospo_location'));
		cols.push(new nlobjSearchColumn('custrecord_dospo_producttype'));
		cols.push(new nlobjSearchColumn('custrecord_dospo_sleevelining'));
		var do_surchargessearch = nlapiCreateSearch('customrecord_design_options_surcharge_po',filters,cols).runSearch();
		var do_surcharges = [];
		var surcharges = [];
		var pssearchid = 0;
		do {
			do_surcharges = do_surchargessearch.getResults(pssearchid, pssearchid + 1000) || [];
			for(var k=0; k<do_surcharges.length;k++){
				//name:location,
				//values:{[]}
				var custom = _.find(surcharges,function(x){return x.name == do_surcharges[k].getValue('custrecord_dospo_location')
					&& x.type == do_surcharges[k].getText('custrecord_dospo_producttype')});
				if(custom){
					custom.codes.push(do_surcharges[k].getValue('custrecord_dospo_code'));
					custom.values.push({
					code:do_surcharges[k].getValue('custrecord_dospo_code'),
					description:do_surcharges[k].getValue('custrecord_dospo_description'),
					surcharge:do_surcharges[k].getValue('custrecord_dospo_surcharge'),
					sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_dospo_sleevelining')
					});
				}
				else{
				surcharges.push({
					name:do_surcharges[k].getValue('custrecord_dospo_location'),
					type:do_surcharges[k].getText('custrecord_dospo_producttype'),
					codes:[do_surcharges[k].getValue('custrecord_dospo_code')],
					values:[{code:do_surcharges[k].getValue('custrecord_dospo_code'),
					description:do_surcharges[k].getValue('custrecord_dospo_description'),
					surcharge:do_surcharges[k].getValue('custrecord_dospo_surcharge'),
					sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_dospo_sleevelining')}]
				});
				}
			}
			pssearchid += 1000;
		} while (do_surcharges.length >= 1000);



		var order = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
		var itemCount = order.getLineItemCount('item');
		for (var ii=1; ii<=itemCount; ii++){
			var isServiceItem = nlapiLookupField('noninventoryitem', order.getLineItemValue('item', 'item', ii), 'custitem_jerome_cmt_serviceitem');
			if(isServiceItem == 'T'){
				var surchargeamount = 0;
				var surchargedescription = "";
				if(order.getLineItemValue('item', 'custcol_designoptions_jacket', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Jacket";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_jacket', ii));

					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
					var LiningSurcharge;

					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
								if(dop_surcharge.code == 'T01022502' && itemsurcharges[kk].name == 'T010225'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										nlapiLogExecution('debug','Has Lining Surcharge',JSON.stringify(LiningSurcharge));
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
										surchargedescription += "Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
									}
								}else{
									var surcharge;
									if(itemsurcharges[kk].name == 'li-vnd' && dop_surcharge.code == 'Custom Lining'){
										//get the lining quantity
										var dop_liningqty = _.find(dop,function(x){return x.name == 'li-qty'});
										if(!dop_liningqty.value) continue;

										surcharge = (parseFloat(dop_surcharge.surcharge) * parseFloat(dop_liningqty.value)).toFixed(2);
									}else{
										surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									}

									//var surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
									surchargedescription += "Jacket " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_waistcoat', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Waistcoat";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_waistcoat', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge;
							if(itemsurcharges[kk].name == 'li-vnd' && dop_surcharge.code == 'Custom Lining'){
								//get the lining quantity
								var dop_liningqty = _.find(dop,function(x){return x.name == 'li-qty'});
								if(!dop_liningqty.value) continue;

								surcharge = (parseFloat(dop_surcharge.surcharge) * parseFloat(dop_liningqty.value)).toFixed(2);
							}else{
								surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
							}

							//var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);

							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Waistcoat " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_trouser', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Trouser";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_trouser', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Trouser " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_overcoat', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Overcoat";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_overcoat', ii));
					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-bl-o'});
					var LiningSurcharge;
					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-bl-o'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
							if(dop_surcharge){
								if(dop_surcharge.code == 'T01041202' && itemsurcharges[kk].name == 'T010412'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
										surchargedescription += "Overcoat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
									}
								}else{
									var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
									surchargedescription += "Overcoat " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_shirt', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_shirt', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Shirt " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_ladiesjacket', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Ladies-Jacket";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_ladiesjacket', ii));

					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-lj'});
					var LiningSurcharge;

					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-lj'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
								if(dop_surcharge.code == 'T02722801' && itemsurcharges[kk].name == 'T027228'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										nlapiLogExecution('debug','Has Lining Surcharge',JSON.stringify(LiningSurcharge));
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
										surchargedescription += "Ladies-Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
									}
								}else{
									var surcharge;
									if(itemsurcharges[kk].name == 'li-vnd' && dop_surcharge.code == 'Custom Lining'){
										//get the lining quantity
										var dop_liningqty = _.find(dop,function(x){return x.name == 'li-qty'});
										if(!dop_liningqty.value) continue;

										surcharge = (parseFloat(dop_surcharge.surcharge) * parseFloat(dop_liningqty.value)).toFixed(2);
									}else{
										surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									}

									//var surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
									surchargedescription += "Ladies-Jacket " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_ladiespants', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Ladies-Pants";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_ladiespants', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Ladies-Pants " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_ladiesskirt', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_ladiesskirt', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Ladies-Skirt " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_ssshirt', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Short-Sleeves-Shirt";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_ssshirt', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Short-Sleeves-Shirt " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_trenchcoat', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Trenchcoat";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_trenchcoat', ii));

					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-bl-tc'});
					var LiningSurcharge;

					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-bl-tc'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
								if(dop_surcharge.code == 'T01161402' && itemsurcharges[kk].name == 'T011614'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										nlapiLogExecution('debug','Has Lining Surcharge',JSON.stringify(LiningSurcharge));
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
										surchargedescription += "Trenchcoat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
									}
								}else{
									var surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
									surchargedescription += "Trenchcoat " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
								}
							}
						}
					}
				}

				if(order.getLineItemValue('item', 'custcol_designoptions_safari_jacket', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Safari-Jacket";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_safari_jacket', ii));

					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
					var LiningSurcharge;

					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
								if(dop_surcharge.code == 'T01692102' && itemsurcharges[kk].name == 'T016921'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										nlapiLogExecution('debug','Has Lining Surcharge',JSON.stringify(LiningSurcharge));
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
										surchargedescription += "Safari Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
									}
								}else{
									var surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
									surchargedescription += "Safari Jacket " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_camp_shirt', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Camp-Shirt";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_camp_shirt', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Camp-Shirt " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_morning_coat', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Morning-Coat";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_morning_coat', ii));

					var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
					var LiningSurcharge;

					var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
					if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
						LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
					}
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
								if(dop_surcharge.code == 'T01492503' && itemsurcharges[kk].name == 'T014925'){
									//Find the Sleeve Dependent
									if(LiningSurcharge){
										nlapiLogExecution('debug','Has Lining Surcharge',JSON.stringify(LiningSurcharge));
										var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)).toFixed(2);
										surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
										surchargedescription += "Morning Coat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"\n";
									}
								}else{
									var surcharge = (parseFloat(dop_surcharge.surcharge)).toFixed(2);
									surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
									surchargedescription += "Morning Coat " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2)+"\n";
								}
							}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_shorts', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Shorts";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_shorts', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Shorts " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				if(order.getLineItemValue('item', 'custcol_designoptions_shirt_jacket', ii)){
					var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt-Jacket";});
					var dop = JSON.parse(order.getLineItemValue('item', 'custcol_designoptions_shirt_jacket', ii));
					for(var kk=0;kk<itemsurcharges.length;kk++){
						var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
						if(dop_value){
							var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
							if(dop_surcharge){
							var surcharge = (parseFloat(dop_surcharge.surcharge?dop_surcharge.surcharge:0)).toFixed(2);
							surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge?surcharge:0)).toFixed(2);
							surchargedescription += "Shirt-Jacket " + dop_surcharge.description + " " + parseFloat(surcharge?surcharge:0).toFixed(2) +"\n";}
						}
					}
				}
				var description = order.getLineItemText('item','item',ii) + " " + order.getLineItemValue('item','rate',ii) + "\n";
				order.setLineItemValue('item','description',ii,description + surchargedescription);
				var rate = parseFloat(order.getLineItemValue('item','rate',ii)?order.getLineItemValue('item','rate',ii):0);
				var currentAmount = parseFloat(order.getLineItemValue('item','amount',ii));
				currentAmount += parseFloat(surchargeamount?surchargeamount:0);
				order.setLineItemValue('item','rate',ii,currentAmount/parseFloat(order.getLineItemValue('item','quantity',ii)));
				order.setLineItemValue('item','amount',ii,currentAmount);
				nlapiLogExecution('debug','current rate', rate);
				nlapiLogExecution('debug','current amount', currentAmount);
				nlapiLogExecution('debug','current qty', parseFloat(order.getLineItemValue('item','quantity',ii)));
			}
		}
		try{
			nlapiSubmitRecord(order);
		}catch(ex){
			nlapiLogExecution('error','Order Number ' + nlapiGetRecordId(), ex.getDetails())
			nlapiSendEmail(97,97,'Design PO Surcharge','Order Number ' + nlapiGetRecordId() + " " + ex.getDetails());
		}
	}
}
