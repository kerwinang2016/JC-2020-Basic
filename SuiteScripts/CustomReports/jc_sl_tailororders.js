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
							pageObject : renderListSalesOrders(context)
						});
					}

				} catch (e) {
					log.error('onRequest', 'ERROR : ' + e.message);
				}
			}
			function renderListSalesOrders(context){
				log.debug('Render List Sales Oreders');
				var form = ui.createForm({
					title : 'Tailor Orders'
				});
				form.clientScriptFileId = 42648;
				// form.addButton({
					// id : "custpage_refresh",
					// label : "Refresh",
					// functionName : "refreshOrdersList"
				// });
				form.addButton({
					id : "custpage_export",
					label : "Export",
					functionName : "exportOrdersList"
				});
				var currentPage = context.request.parameters.page?parseInt(context.request.parameters.page):0;

				var pageSize = 100;
				// var pagenumber = form.addField({
					// id: 'custpage_page',
					// type: ui.FieldType.SELECT,
					// label: 'Page Number'
				// });
				var sublist = form.addSublist({
					id : 'custpage_clientsalesreport',
					type : ui.SublistType.STATICLIST,
					label : 'Client Sales Report'
				});

				var fldsoid = sublist.addField({
					id : 'custpage_so_id',
					type : ui.FieldType.TEXT,
					label : 'SO ID'
				});
				sublist.addField({
					id : 'custpage_trandate',
					type : ui.FieldType.DATE,
					label : 'Date'
				});
				sublist.addField({
					id : 'custpage_item',
					type : ui.FieldType.TEXT,
					label : 'Item'
				});
				sublist.addField({
					id : 'custpage_vendor',
					type : ui.FieldType.TEXT,
					label : 'Vendor'
				});

				sublist.addField({
					id : 'custpage_additional_fabric_surcharge',
					type : ui.FieldType.TEXT,
					label : 'Additional Fabric Surcharge'
				});
				sublist.addField({
					id : 'custpage_blockvalue',
					type : ui.FieldType.TEXT,
					label : 'Block Value'
				});
				sublist.addField({
					id : 'custpage_fabric_quantity',
					type : ui.FieldType.TEXT,
					label : 'Fabric Quantity'
				});
				var rs = search.load({
					id: "customsearch_tailor_orders",
					type : "transaction"
				});
				//Sorting tailor client date created
				rs.columns[0].sort = search.Sort.DESC;

				var searchResultCount = rs.runPaged().count;

				// for(var i=1; i<= Math.ceil(searchResultCount/pageSize); i++){
					// pagenumber.addSelectOption({
						// value: i,
						// text: "Page " + i + " of " + Math.ceil(searchResultCount/pageSize),
						// isSelected: i==currentPage?true:false
					// });
				// }
				log.debug('Result Count', searchResultCount);
				var OrdersList = [];
				var index = 0;
				// do{
					var searchResult = rs.run().getRange({
						start: 0,
						end: 5
					});
					var rscols = searchResult[0].columns;
					 for (var i = 0; i < searchResult.length; i++) {
					// rs.run().each(function(result) {

						var result = searchResult[i];
						var blockvalue = 0;

						OrdersList.push({
							'custpage_so_id': result.getValue(rscols[0]),
							'custpage_trandate': result.getValue(rscols[1]),
							'custpage_item': result.getText(rscols[2]),
							'custpage_vendor': result.getText(rscols[3])?result.getText(rscols[3]):'',
							'custpage_additional_fabric_surcharge': result.getValue(rscols[4])?result.getValue(rscols[4]):0,
							'custpage_blockvalue': result.getValue(rscols[5])?result.getValue(rscols[5]):'',
							'custpage_fabric_quantity': result.getValue(rscols[6])?result.getValue(rscols[6]):''
						});
						index++;
					// });
					 }
				// }while(searchResult.length == 1000)
				log.debug('OrdersList.length', OrdersList.length);
				for(var i=0; i<OrdersList.length; i++){
					sublist.setSublistValue({id: 'custpage_so_id', line: i, value: OrdersList[i].custpage_so_id});
					sublist.setSublistValue({id: 'custpage_trandate', line: i, value: OrdersList[i].custpage_trandate});
					sublist.setSublistValue({id: 'custpage_item', line: i, value: OrdersList[i].custpage_item});
					sublist.setSublistValue({id: 'custpage_vendor', line: i, value: OrdersList[i].custpage_vendor});
					sublist.setSublistValue({id: 'custpage_additional_fabric_surcharge', line: i, value: OrdersList[i].custpage_additional_fabric_surcharge});
					sublist.setSublistValue({id: 'custpage_blockvalue', line: i, value: OrdersList[i].custpage_blockvalue});
					sublist.setSublistValue({id: 'custpage_fabric_quantity', line: i, value: OrdersList[i].custpage_fabric_quantity});
				}
				return form;

			}
			return {
				onRequest : onRequest
			};
		});
