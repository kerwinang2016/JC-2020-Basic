/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		['N/record', 'N/search', 'N/log', 'N/ui/serverWidget' ,'N/render', 'N/email'],
		function( record, search, log, ui, render, nlemail) {

			function onRequest(context) {
				try {

					log.audit('onRequest', 'Context Method : ' + context.request.method);

					if (context.request.method === 'GET') {
						context.response.writePage({
							pageObject : renderConsolidateInvoice(context)
						});
					}else if(context.request.method === 'POST'){
						// context.response.parameter
						sendEmail(context);
					}

				} catch (e) {
					log.error('onRequest', 'ERROR : ' + e.message);
				}
			}
			function sendEmail(context){
				log.debug('context parameters', context.request.parameters);
				var period = context.request.parameters.period;
				var tailor = context.request.parameters.tailor;
				var rs, filters = [];
				if(period == '4'){
					//monthly
					rs = search.load({
						id: 'customsearch_consolidatedinvoice_monthly',
						type: "invoice"
					});
				}else if(period == '2'){
					//weekly
					rs = search.load({
						id: 'customsearch_consolidatedinvoice_weekly',
						type: "invoice"
					});
				}
				filters.push(search.createFilter({
						name: 'name',
						operator: search.Operator.ANYOF,
						values: tailor
				}));
				var searchResultCount = rs.runPaged().count;
				var subtotal = 0, dataitems = [];
				if (searchResultCount != 0) {
					// dataitems = rs.run().getRange(0, 1000);
					rs.run().each(function(result) {
						subtotal += parseFloat(result.getValue('fxamount'));
						var resultdata = {
							"created": result.getText('createdfrom'),
							"tranid": result.getValue('tranid'),
							"duedate": result.getValue('duedate'),
							"trandate": result.getValue('trandate'),
							"ordertype": result.getValue('formulatext'),
							"amount": parseFloat(result.getValue("fxamountremaining")).toFixed(2),
							"client": result.getValue("custbody_customer_name")
						}
						dataitems.push(resultdata);
						return true;
					});
				}
				var PDF_INVOICE_TEMPLATE = '16';
				var templateRec = record.load({
					type: 'customrecord_pdf_template'
					, id: PDF_INVOICE_TEMPLATE
				});
				var d = new Date();
				var dateStr = (d.getMonth()+1).toString()+d.getDate()+d.getFullYear();
				var renderer = render.create();

				var tailorFields = search.lookupFields({
					type: 'customer',
					id: tailor,
					columns: ['billaddress', 'currency', 'companyname']
				});
				renderer.templateContent = templateRec.getValue('custrecord_template_contents');
				var data = {};
				data.dataitems = dataitems;
				data.date = d.toDateString();
				data.billaddress = tailorFields.billaddress;
				data.total = parseFloat(subtotal).toFixed(2);
				data.currency = tailorFields.currency[0].value;
				data.currencytext = tailorFields.currency[0].text;
				log.debug('dataitems',JSON.stringify(dataitems));
				if (dataitems.length>0) {
						renderer.addCustomDataSource({
								alias: 'record',
								format: render.DataSource.JSON,
								data: JSON.stringify(data)
						});
						renderedPdf = renderer.renderAsPdf();
						renderedPdf.name = "ConsolidatedInvoice_"+dateStr+".pdf";
						//Send Emails of consolidated invoices
						nlemail.send({
							author: 660,
							recipients: tailor,
							subject: 'Jerome Clothiers : Weekly Consolidated Invoices',
							body: "Hello "+tailorFields.companyname+", \n Attached is the pdf of the open invoices last week.\n",
							attachments: [renderedPdf]
						});
				}
			}
			function renderConsolidateInvoice(context){
				var form = ui.createForm({
					title : 'Consolidate Invoice'
				});
				form.clientScriptFileId = 360922;
				form.addButton({
					id : "custpage_email",
					label : "Email",
					functionName : "sendEmail"
				});
				// var currentPage = context.request.parameters.page?parseInt(context.request.parameters.page):0;
				// var tailor = context.request.parameters.tailor?context.request.parameters.tailor:"";
				// var startdate = unescape(context.request.parameters.startdate?context.request.parameters.startdate:"");
				// var enddate = unescape(context.request.parameters.enddate?context.request.parameters.enddate:"");
				// var pageSize = 100;
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

				var customerFld = form.addField({
					id: 'custpage_customer',
					type: ui.FieldType.SELECT,
					label: 'Tailor',
					source: 'customer',
					container : 'filtersgroup',
				});

				var periodFld = form.addField({
					id: 'custpage_invoiceperiod',
					type: ui.FieldType.SELECT,
					label: 'Period',
					container : 'filtersgroup',
				});
				// periodFld.addSelectOption({
				// 	value:'1',
				// 	text:'This Week'
				// });
				periodFld.addSelectOption({
					value:'2',
					text:'Last Week'
				});
				// periodFld.addSelectOption({
				// 	value:'3',
				// 	text:'This Month'
				// });
				periodFld.addSelectOption({
					value:'4',
					text:'Last Month'
				});
				return form;

			}
			return {
				onRequest : onRequest
			};
		});
