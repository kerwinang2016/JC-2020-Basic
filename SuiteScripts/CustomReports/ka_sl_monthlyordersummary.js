/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		['N/record', 'N/search', 'N/log', 'N/ui/serverWidget','N/task','N/redirect'],
		function( nr, ns, log, ui, task, redirect) {

			function onRequest(context) {
				try {
					if (context.request.method === 'GET') {
						context.response.writePage({
							pageObject : renderForecasting(context)
						});
					}else{
					}
				} catch (e) {
					log.error('onRequest', 'ERROR : ' + e.message);
				}
			}
			function renderForecasting(context){
				var form = ui.createForm({
					title : 'Monthly Order Summary Report'
				});
				// form.clientScriptModulePath = "./ka_cs_orderforecasting.js";
				form.addSubmitButton({
					// id : 'custpage_sendstatements',
					label : 'Refresh'
					// functionName : "sendStatements()"
				});
				var filtersgroup = form.addFieldGroup({
					id : 'filtersgroup',
					label : 'Filters'
				});

				filtersgroup.isSingleColumn = false;
				filtersgroup.isCollapsible = true;

				var sublist = form.addSublist({
					id : 'custpage_suitorderslist',
					type : ui.SublistType.LIST,
					label : 'SUIT ORDERS'
				});
				// sublist.addMarkAllButtons();
				// var ischecked = sublist.addField({
				// 	id : 'custpage_ischecked',
				// 	type : ui.FieldType.CHECKBOX,
				// 	label : 'SELECT'
				// });
				// var internalIdFld = sublist.addField({
				// 	id : 'custpage_tailorinternalid',
				// 	type : ui.FieldType.TEXT,
				// 	label : 'Internalid'
				// });
				// internalIdFld.updateDisplayType({displayType:ui.FieldDisplayType.HIDDEN});
				var tailorFld = sublist.addField({
					id : 'custpage_tailor',
					type : ui.FieldType.SELECT,
					label : 'TAILOR',
					source : 'customer'
				});
				tailorFld.updateDisplayType({displayType:ui.FieldDisplayType.INLINE});

				sublist.addField({
					id : 'custpage_contact',
					type : ui.FieldType.TEXT,
					label : 'CONTACT'
				});
				var locationFld = sublist.addField({
					id : 'custpage_location',
					type : ui.FieldType.TEXT,
					label : 'LOCATION',
				});

				sublist.addField({
					id : 'custpage_expected',
					type : ui.FieldType.TEXT,
					label : 'EXPECTED'
				});
				sublist.addField({
					id : 'custpage_weekone',
					type : ui.FieldType.FLOAT,
					label : 'WEEK 1'
				});
				sublist.addField({
					id : 'custpage_weektwo',
					type : ui.FieldType.FLOAT,
					label : 'WEEK 2'
				});
				sublist.addField({
					id : 'custpage_weekthree',
					type : ui.FieldType.FLOAT,
					label : 'WEEK 3'
				});
				sublist.addField({
					id : 'custpage_weekfour',
					type : ui.FieldType.FLOAT,
					label : 'WEEK 4'
				});
				sublist.addField({
					id : 'custpage_weekfive',
					type : ui.FieldType.FLOAT,
					label : 'WEEK 5'
				});
				sublist.addField({
					id : 'custpage_monthtotal',
					type : ui.FieldType.TEXT,
					label : 'MONTH TOTAL'
				});
				var rs = ns.load({
					id: "customsearch_monthly_order_summary_repor",
					type : "transaction"
				});

				var searchResultCount = rs.runPaged().count;

				var index = 0;
				rs.run().each(function(result) {
					var rscols = result.columns;
					try{
						sublist.setSublistValue({id: 'custpage_tailor', line: index, value: result.getValue(rscols[0])});
						sublist.setSublistValue({id: 'custpage_contact', line: index, value: result.getValue(rscols[1])});
						sublist.setSublistValue({id: 'custpage_location', line: index, value: result.getValue(rscols[2])});
						sublist.setSublistValue({id: 'custpage_expected', line: index, value: result.getValue(rscols[3])});
						sublist.setSublistValue({id: 'custpage_weekone', line: index, value: result.getValue(rscols[4])});
						sublist.setSublistValue({id: 'custpage_weektwo', line: index, value: result.getValue(rscols[5])});
						sublist.setSublistValue({id: 'custpage_weekthree', line: index, value: result.getValue(rscols[6])});
						sublist.setSublistValue({id: 'custpage_weekfour', line: index, value: result.getValue(rscols[7])});
						sublist.setSublistValue({id: 'custpage_weekfive', line: index, value: result.getValue(rscols[8])});
						sublist.setSublistValue({id: 'custpage_monthtotal', line: index, value: result.getValue(rscols[9])});
					}catch(e){
						log.debug(index);
						//log.debug(result.getValue(rscols[0]) + " " + result.getValue(rscols[1]) + " " + result.getValue(rscols[2]) + " " + result.getValue(rscols[3]) + " " + result.getValue(rscols[4]) + " ")
					}
					index++;
					return true;
				});

				return form;

			}
			return {
				onRequest : onRequest
			};
		});
