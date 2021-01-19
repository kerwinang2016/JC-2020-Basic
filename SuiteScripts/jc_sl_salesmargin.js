/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		['N/record', 'N/search', 'N/log', 'N/ui/serverWidget'],
		function( nr, search, log, ui) {

			function onRequest(context) {
				try {

					log.audit('onRequest', 'Context Method : ' + context.request.method);

					if (context.request.method === 'GET') {
						context.response.writePage({
							pageObject : renderListSalesMargin(context)
						});
					}

				} catch (e) {
					log.error('onRequest', 'ERROR : ' + e.message);
				}
			}
			function renderListSalesMargin(context){
				log.debug('Render List Sales Margin');
				var form = ui.createForm({
					title : 'Sales Order Margin'
				});
				form.clientScriptFileId = 22301;
				form.addButton({
					id : "custpage_refresh",
					label : "Refresh",
					functionName : "refreshList"
				});
				form.addButton({
					id : "custpage_export",
					label : "Export",
					functionName : "exportList"
				});
				var currentPage = context.request.parameters.page?parseInt(context.request.parameters.page):0;
				var tailor = context.request.parameters.tailor?context.request.parameters.tailor:"";
				var startdate = unescape(context.request.parameters.startdate?context.request.parameters.startdate:"");
				var enddate = unescape(context.request.parameters.enddate?context.request.parameters.enddate:"");
				var pageSize = 100;
				// var pagenumber = form.addField({
					// id: 'custpage_page',
					// type: ui.FieldType.SELECT,
					// label: 'Page Number'
				// });
				var filtersgroup = form.addFieldGroup({
					id : 'filtersgroup',
					label : 'Filters'
				});
				filtersgroup.isSingleColumn = true;
				filtersgroup.isCollapsible = false;

				var startdateFld = form.addField({
					id : 'custpage_startdate',
					type : ui.FieldType.DATE,
					label : 'Start Date',
					container : 'filtersgroup'
				});
				if(startdate != "")
					startdateFld.defaultValue = startdate;
				// startdateFld.updateDisplaySize({
					// height : 60,
					// width : 200
				// });
				var enddateFld = form.addField({
					id : 'custpage_enddate',
					type : ui.FieldType.DATE,
					label : 'End Date',
					container : 'filtersgroup'
				});
				if(enddate != "")
					enddateFld.defaultValue = enddate;
				// enddateFld.updateDisplaySize({
					// height : 60,
					// width : 200
				// });
				var customerFld = form.addField({
					id: 'custpage_customer',
					type: ui.FieldType.SELECT,
					label: 'Tailor',
					source: 'customer',
					container : 'filtersgroup',
				});
				if(tailor != "")
					customerFld.defaultValue = tailor;
				// customerFld.updateDisplaySize({
					// height : 60,
					// width : 200
				// });

				var sublist = form.addSublist({
					id : 'custpage_salesmargin',
					type : ui.SublistType.STATICLIST,
					label : ' Sales Order Margin'
				});
				sublist.addField({
					id : 'custpage_date',
					type : ui.FieldType.DATE,
					label : 'Date'
				});
				sublist.addField({
					id : 'custpage_soid',
					type : ui.FieldType.TEXT,
					label : 'SO ID'
				});
				sublist.addField({
					id : 'custpage_item',
					type : ui.FieldType.TEXT,
					label : 'Item'
				});
				sublist.addField({
					id : 'custpage_customer',
					type : ui.FieldType.TEXT,
					label : 'Customer'
				});

				sublist.addField({
					id : 'custpage_fabricprice',
					type : ui.FieldType.CURRENCY,
					label : 'Fabric Price'
				});
				sublist.addField({
					id : 'custpage_fabriccost',
					type : ui.FieldType.CURRENCY,
					label : 'Fabric Cost'
				});
				sublist.addField({
					id : 'custpage_fabricshippingcost',
					type : ui.FieldType.CURRENCY,
					label : 'Fabric Shipping'
				});
				sublist.addField({
					id : 'custpage_fabricmargin',
					type : ui.FieldType.CURRENCY,
					label : 'Fabric Margin'
				});
				sublist.addField({
					id : 'custpage_cmtprice',
					type : ui.FieldType.CURRENCY,
					label : 'CMT Price'
				});
				sublist.addField({
					id : 'custpage_cmtcost',
					type : ui.FieldType.CURRENCY,
					label : 'CMT Cost'
				});
				sublist.addField({
					id : 'custpage_cmtmargin',
					type : ui.FieldType.CURRENCY,
					label : 'CMT Margin'
				});
				sublist.addField({
					id : 'custpage_shippingprice',
					type : ui.FieldType.CURRENCY,
					label : 'Shipping Price'
				});
				sublist.addField({
					id : 'custpage_shippingcost',
					type : ui.FieldType.CURRENCY,
					label : 'Shipping Cost'
				});
				sublist.addField({
					id : 'custpage_dutiescost',
					type : ui.FieldType.CURRENCY,
					label : 'Duties Cost'
				});
				sublist.addField({
					id : 'custpage_totalmargin',
					type : ui.FieldType.CURRENCY,
					label : 'Total Margin'
				});
				sublist.addField({
					id : 'custpage_producttype',
					type : ui.FieldType.TEXT,
					label : 'Product Type'
				});
				sublist.addField({
					id : 'custcol_fabric_quantity',
					type : ui.FieldType.TEXT,
					label : 'F-QTY'
				});
				var rs = search.load({
					id: "customsearch_salesmargin",
					type : "transaction"
				});
				rs.columns[0].sort = search.Sort.DESC;
				// var filters = rs.filters;
				//log.debug('FILTERS',JSON.stringify(rs.filters));
				//log.debug('TAILOR',tailor);
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
				}else{
					var d = new Date().toLocaleString("en-US", {timeZone: "Australia/Brisbane"});
					d = new Date(d);
					enddate = d.getDate() +"/"+parseFloat(d.getMonth()+1).toString()+"/"+d.getFullYear();
					var d1 = new Date().toLocaleString("en-US", {timeZone: "Australia/Brisbane"});
					d1 = new Date(d1);
					d1.setDate(d1.getDate() -6);
					startdate = d1.getDate() +"/"+parseFloat(d1.getMonth()+1).toString()+"/"+d1.getFullYear();
					startdateFld.defaultValue = startdate;
					enddateFld.defaultValue = enddate;
					var startdateFilter = search.createFilter({
						name: 'trandate',
						//join: 'createdfrom',
						operator: search.Operator.WITHIN,
						values: [startdate,enddate]
					});
					rs.filters.push(startdateFilter);
				}

				var searchResultCount = rs.runPaged().count;

				// for(var i=1; i<= Math.ceil(searchResultCount/pageSize); i++){
					// pagenumber.addSelectOption({
						// value: i,
						// text: "Page " + i + " of " + Math.ceil(searchResultCount/pageSize),
						// isSelected: i==currentPage?true:false
					// });
				// }
				log.debug('Result Count', searchResultCount);
				var salesMarginList = [];
				var index = 0;
				rs.run().each(function(result) {

					var rscols = result.columns;
					try{
					sublist.setSublistValue({id: 'custpage_date', line: index, value: result.getValue(rscols[0])});
					sublist.setSublistValue({id: 'custpage_soid', line: index, value: result.getValue(rscols[1])});
					sublist.setSublistValue({id: 'custpage_item', line: index, value: result.getValue(rscols[2])});
					sublist.setSublistValue({id: 'custpage_customer', line: index, value: result.getText(rscols[3])});
					sublist.setSublistValue({id: 'custpage_fabricprice', line: index, value: result.getValue(rscols[4])});
					sublist.setSublistValue({id: 'custpage_fabriccost', line: index, value: result.getValue(rscols[5])});
					sublist.setSublistValue({id: 'custpage_fabricshippingcost', line: index, value: result.getValue(rscols[15])});
					sublist.setSublistValue({id: 'custpage_fabricmargin', line: index, value: result.getValue(rscols[6])});
					sublist.setSublistValue({id: 'custpage_cmtprice', line: index, value: result.getValue(rscols[7])});
					sublist.setSublistValue({id: 'custpage_cmtcost', line: index, value: result.getValue(rscols[8])});
					sublist.setSublistValue({id: 'custpage_cmtmargin', line: index, value: result.getValue(rscols[9])});
					sublist.setSublistValue({id: 'custpage_shippingprice', line: index, value: result.getValue(rscols[10])});
					sublist.setSublistValue({id: 'custpage_shippingcost', line: index, value: result.getValue(rscols[11])});
					sublist.setSublistValue({id: 'custpage_dutiescost', line: index, value: result.getValue(rscols[12])});
					sublist.setSublistValue({id: 'custpage_totalmargin', line: index, value: result.getValue(rscols[13])});
					sublist.setSublistValue({id: 'custpage_producttype', line: index, value: result.getValue(rscols[14])});
					sublist.setSublistValue({id: 'custcol_fabric_quantity', line: index, value: result.getValue(rscols[16])});

					}catch(e){
						log.debug('index', index);
					}
					index++;
					// salesMarginList.push({
						// 'custpage_date': result.getValue(rscols[0]),
						// 'custpage_soid': result.getValue(rscols[1]),
						// 'custpage_item': result.getValue(rscols[2]),
						// 'custpage_customer': result.getValue(rscols[3]),
						// 'custpage_fabricprice': result.getValue(rscols[4]),
						// 'custpage_fabriccost': result.getValue(rscols[5]),
						// 'custpage_fabricmargin': result.getValue(rscols[6]),
						// 'custpage_cmtcost': result.getValue(rscols[7]),
						// 'custpage_cmtprice': result.getValue(rscols[8]),
						// 'custpage_cmtmargin': result.getValue(rscols[9]),
						// 'custpage_shippingprice': result.getValue(rscols[10]),
						// 'custpage_shippingcost': result.getValue(rscols[11]),
						// 'custpage_dutiescost': result.getValue(rscols[12]),
						// 'custpage_totalmargin': result.getValue(rscols[13]),
						// 'customsearch_producttype': result.getText(rscols[14])
					// });
					return true;
				});

				return form;

			}
			return {
				onRequest : onRequest
			};
		});
