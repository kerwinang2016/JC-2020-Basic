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
	
	function exportOrdersList_(context){
		var data = {};	
		data.contents = "data:text/csv;charset=utf-8,SO ID,Date,Item,Vendor,Additional Fabric Surcharge,Block Value,Fabric Quantity\n";
		data.action = 'downloadccsv';
		data = generateOrdersExport(data);
		var encodedUri = encodeURI(data);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "TailorOrders.csv");
		document.body.appendChild(link); 
		link.click();
	}
	function generateOrdersExport(data){
		search.create({});
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
		// do{
			searchResult = rs.run().getRange({
				start: index,
				end: index+1000
			});
			var rscols = searchResult[0].columns;
			for (var i = 0; i < searchResult.length; i++) {
			// rs.run().each(function(result) {
				
				var result = searchResult[i];
				var rscols = result.columns;
				
				OrdersList.push({
					'custpage_so_id': result.getValue(rscols[0]),
					'custpage_trandate': result.getValue(rscols[1]),
					'custpage_item': result.getText(rscols[2]),
					'custpage_vendor': result.getText(rscols[3]),
					'custpage_additional_fabric_surcharge': result.getValue(rscols[4])?result.getValue(rscols[4]):0,
					'custpage_blockvalue': result.getValue(rscols[5]),
					'custpage_fabric_quantity': result.getValue(rscols[6])
				});
				
				// return true;
			// });
			}
			index = index + searchResult.length;
		// }while(searchResult.length == 1000)
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
		console.log(data);
		return data.contents;
	}
	function refreshOrdersList_(context) {

		var scriptID = 'customscript_sl_tailor_orders';
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
		refreshOrdersList: refreshOrdersList_,
		exportOrdersList: exportOrdersList_
	};
});
