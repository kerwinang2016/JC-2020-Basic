/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/ui/message', 'N/url', 'N/https', 'N/format', 'N/search'], function(rec, msg, url, http, format, search) {

	function showErrorMessage(msgText) {
		var myMsg = msg.create({
			title : "Cannot Import CSV",
			message : msgText,
			type : msg.Type.ERROR
		});

		myMsg.show();
	}

	function getQS(a) {
		a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		a = RegExp("[\\?&]" + a + "=([^&#]*)").exec(window.location.href);
		return null == a ? "" : decodeURIComponent(a[1].replace(/\+/g, " "))
	};
	function exportList_(context){
		var data = {};
		data.contents = "data:text/csv;charset=utf-8,Date,SO-ID,Item,Customer,FabricPrice,FabricCost,FabricShipping,FabricMargin,CMTCost,CMTPrice,CMTMargin,ShippingPrice,ShippingCost,DutiesCost,TotalMargin,ProductType,FQty\n";
		data.action = 'downloadccsv';
		data = generateExport(data);
		var encodedUri = encodeURI(data);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "SalesMargin.csv");
		document.body.appendChild(link);
		link.click();
	}

	function generateExport(data){
		var rs = search.load({
			id: "customsearch_salesmargin",
			type : "transaction"
		});

		rs.columns[0].sort = search.Sort.DESC;
		var tailor = nlapiGetFieldValue('custpage_customer'), startdate = nlapiGetFieldValue('custpage_startdate'), enddate = nlapiGetFieldValue('custpage_enddate');
		if(tailor){
			var tailorFilter = search.createFilter({
				name: 'name',
				operator: 'anyof',
				values: [tailor]
			});
			rs.filters.push(tailorFilter);
		}
		if((startdate != "") && (enddate == "")){
			var startdateFilter = search.createFilter({
				name: 'trandate',
				join: 'createdfrom',
				operator: search.Operator.ONORAFTER,
				values: [startdate]
			});
			rs.filters.push(startdateFilter);
		}else if((startdate == "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'createdfrom',
				operator: search.Operator.ONORBEFORE,
				values: [enddate]
			});
			rs.filters.push(enddateFilter);
		}else if((startdate != "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'createdfrom',
				operator: search.Operator.WITHIN,
				values: [startdate,enddate]
			});
			rs.filters.push(enddateFilter);
		}

		var searchResultCount = rs.runPaged().count;
		rs.run().each(function(result) {
			var rscols = result.columns;
			data.contents += result.getValue(rscols[0]) +',';
			data.contents += result.getValue(rscols[1]) +',';
			data.contents += result.getValue(rscols[2]) +',';
			data.contents += result.getText(rscols[3]) +',';
			data.contents += result.getValue(rscols[4]) +',';
			data.contents += result.getValue(rscols[5]) +',';
			data.contents += result.getValue(rscols[15]) +',';
			data.contents += result.getValue(rscols[6]) +',';
			data.contents += result.getValue(rscols[7]) +',';
			data.contents += result.getValue(rscols[8]) +',';
			data.contents += result.getValue(rscols[9]) +',';
			data.contents += result.getValue(rscols[10]) +',';
			data.contents += result.getValue(rscols[11]) +',';
			data.contents += result.getValue(rscols[12]) +',';
			data.contents += result.getValue(rscols[13]) +',';
			data.contents += result.getValue(rscols[14]) +',';
			data.contents += result.getValue(rscols[16]) +',';
			data.contents += '\n';
			return true;
		});
		return data.contents;
	}
	function exportClientOrdersList_(context){
		var data = {};
		data.contents = "data:text/csv;charset=utf-8,Tailor,Customer,Email,Phone,First Purchase,Last Purchase,Piece Sold,Total Amount\n";
		data.action = 'downloadccsv';
		data = generateClientOrdersExport(data);
		var encodedUri = encodeURI(data);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "ClientOrders.csv");
		document.body.appendChild(link);
		link.click();
	}
	function generateClientOrdersExport(data){
		var tailor = nlapiGetFieldValue('custpage_customer')?nlapiGetFieldValue('custpage_customer'):587
			, startdate = nlapiGetFieldValue('custpage_startdate')?nlapiGetFieldValue('custpage_startdate'):""
			, enddate = nlapiGetFieldValue('custpage_enddate')?nlapiGetFieldValue('custpage_enddate'):"";
			if(startdate == "" && enddate == ""){
					startdate = "1/5/2019";
					enddate = "31/5/2019";
				}
		var rs = search.load({
			id: "customsearch_shoporders",
			type : "customer"
		});
		//Sorting tailor client date created
		rs.columns[0].sort = search.Sort.DESC;

		// var filters = rs.filters;
		// log.debug('FILTERS',JSON.stringify(rs.filters));
		// log.debug('TAILOR',tailor);
		if(tailor){
			var tailorFilter = search.createFilter({
				name: 'internalid',
				operator: 'anyof',
				values: [tailor]
			});
			rs.filters.push(tailorFilter);
		}
		if((startdate != "") && (enddate == "")){
			var startdateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.ONORAFTER,
				values: [startdate]
			});
			rs.filters.push(startdateFilter);
		}else if((startdate == "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.ONORBEFORE,
				values: [enddate]
			});
			rs.filters.push(enddateFilter);
		}else if((startdate != "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.WITHIN,
				values: [startdate,enddate]
			});
			rs.filters.push(enddateFilter);
		}

		var searchResultCount = rs.runPaged().count;

		// for(var i=1; i<= Math.ceil(searchResultCount/pageSize); i++){
			// pagenumber.addSelectOption({
				// value: i,
				// text: "Page " + i + " of " + Math.ceil(searchResultCount/pageSize),
				// isSelected: i==currentPage?true:false
			// });
		// }
		// log.debug('Result Count', searchResultCount);
		var clientOrdersList = [];
		var index = 0;
		rs.run().each(function(result) {

			var rscols = result.columns;
			clientOrdersList.push({
				'custpage_tailor': result.getValue(rscols[1]),
				'custpage_customername': result.getValue(rscols[2]) + " " + result.getValue(rscols[3]),
				'custpage_email': result.getValue(rscols[4]),
				'custpage_phone': result.getValue(rscols[5]),
				'custpage_firstpurchase': result.getValue(rscols[6]),
				'custpage_lastpurchase': result.getValue(rscols[7]),
				'custpage_piecesold': 0,
				'custpage_purchasedvalue': 0,
				'tailorid': result.getValue(rscols[8])
			});
			index++;
			return true;
		});

		//Adding the pieces sold
		var rs1 = search.load({
			id: "customsearch_shoporders_itemsummary",
			type : "customer"
		});
		//Sorting tailor client date created
		rs1.columns[0].sort = search.Sort.DESC;
		if(tailor){
			var tailorFilter = search.createFilter({
				name: 'internalid',
				operator: 'anyof',
				values: [tailor]
			});
			rs1.filters.push(tailorFilter);
		}
		if((startdate != "") && (enddate == "")){
			var startdateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.ONORAFTER,
				values: [startdate]
			});
			rs1.filters.push(startdateFilter);
		}else if((startdate == "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.ONORBEFORE,
				values: [enddate]
			});
			rs1.filters.push(enddateFilter);
		}else if((startdate != "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.WITHIN,
				values: [startdate,enddate]
			});
			rs1.filters.push(enddateFilter);
		}
		var index = 0;
		rs1.run().each(function(result) {
			var tailorid = result
			var rscols = result.columns;
			var found = clientOrdersList.filter(function(b){return b.tailorid == result.getValue(rscols[0]);});
			if(found && found.length >0){
				// log.debug('RS1',result.getValue(rscols[0]))
				found[0].custpage_piecesold = parseFloat(found[0].custpage_piecesold) + parseFloat(result.getValue(rscols[1]));
			}
			return true;
		});
		//end pieces sold
		//start purchase amount
		var rs2 = search.load({
			id: "customsearch_shoporders_amountsummary",
			type : "customer"
		});
		//Sorting tailor client date created
		rs2.columns[0].sort = search.Sort.DESC;
		if(tailor){
			var tailorFilter = search.createFilter({
				name: 'internalid',
				operator: 'anyof',
				values: [tailor]
			});
			rs2.filters.push(tailorFilter);
		}
		if((startdate != "") && (enddate == "")){
			var startdateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.ONORAFTER,
				values: [startdate]
			});
			rs2.filters.push(startdateFilter);
		}else if((startdate == "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.ONORBEFORE,
				values: [enddate]
			});
			rs2.filters.push(enddateFilter);
		}else if((startdate != "") && (enddate != "")){
			var enddateFilter = search.createFilter({
				name: 'trandate',
				join: 'transaction',
				operator: search.Operator.WITHIN,
				values: [startdate,enddate]
			});
			rs2.filters.push(enddateFilter);
		}
		rs2.run().each(function(result) {
			var tailorid = result
			var rscols = result.columns;
			// log.debug('RS COLS',result.getValue(rscols[0]))
			var found = clientOrdersList.filter(function(b){return b.tailorid == result.getValue(rscols[0]);});
			if(found && found.length>0){
				// log.debug('RS2',result.getValue(rscols[0]))
				found[0].custpage_purchasedvalue = parseFloat(found[0].custpage_purchasedvalue) + parseFloat(result.getValue(rscols[1]));
			}
			return true;
		});

		for(var i=0; i<clientOrdersList.length; i++){
			data.contents += clientOrdersList[i].custpage_tailor +',';
			data.contents += clientOrdersList[i].custpage_customername +',';
			data.contents += clientOrdersList[i].custpage_email +',';
			data.contents += clientOrdersList[i].custpage_phone +',';
			data.contents += clientOrdersList[i].custpage_firstpurchase +',';
			data.contents += clientOrdersList[i].custpage_lastpurchase +',';
			data.contents += clientOrdersList[i].custpage_piecesold +',';
			data.contents += clientOrdersList[i].custpage_purchasedvalue;
			data.contents += '\n';
		}
		console.log(data);
		return data.contents;
	}
	function refreshList_(context) {

		var scriptID = 'customscript_sl_salesmargin';
		var deployID = 'customdeploy1';

		var slURL = url.resolveScript({
			scriptId : scriptID,
			deploymentId : deployID,
			params : {
				startdate : escape(nlapiGetFieldValue('custpage_startdate')),
				enddate : escape(nlapiGetFieldValue('custpage_enddate')),
				tailor : nlapiGetFieldValue('custpage_customer')
			}
		});

		window.ischanged = false;
		window.location = slURL;
	}
	function refreshClientOrdersList_(context) {

		var scriptID = 'customscript_clientorders';
		var deployID = 'customdeploy1';

		var slURL = url.resolveScript({
			scriptId : scriptID,
			deploymentId : deployID,
			params : {
				startdate : escape(nlapiGetFieldValue('custpage_startdate')),
				enddate : escape(nlapiGetFieldValue('custpage_enddate')),
				tailor : nlapiGetFieldValue('custpage_customer')
			}
		});

		window.ischanged = false;
		window.location = slURL;
	}

	function getFloatValue(fldValue) {
		if (isEmpty(fldValue))
			return 0.0;

		return parseFloat(fldValue);
	}

	function isEmpty(fldValue) {
		return fldValue == '' || fldValue == null || fldValue == undefined;
	}
	function pageInit() {
    }
	return {
		pageInit : pageInit,
		refreshList : refreshList_,
		exportList : exportList_,
		refreshClientOrdersList: refreshClientOrdersList_,
		exportClientOrdersList: exportClientOrdersList_
	};
});
