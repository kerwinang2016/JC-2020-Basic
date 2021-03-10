/**
 * @version 1.0.01
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope public
 * @Author Kerwin Ang
 * @Description Sends consolidated Invoices on Schedule
 */
define(['N/search', 'N/record', 'N/runtime', 'N/log', 'N/format', 'N/email', 'N/runtime', 'N/email', 'N/render'],
    function(search, record, runtime, log, format, email, runtime, nlemail, render) {
        /**
         *  @function getInputData
         *  @returns {Object}
         *  @summary
         *  @fires reduce
         */
        function getInputData(){
          try{
            var currentScript = runtime.getCurrentScript();
            //Search For the Despatch Folder
            var rs ;
              log.debug('currentScript.deploymentId',currentScript.deploymentId);
              if(currentScript.deploymentId == 'customdeploy1'){
                //monthly
                rs = search.load({
                    id: "customsearch_checked_consolidated_invo_2"
                });
              }else if(currentScript.deploymentId == 'customdeploy2'){
                //weekly
                rs = search.load({
                    id: "customsearch_checked_consolidated_invoic"
                });
              }
              var searchResultCount = rs.runPaged().count;
              var tailors = [], transactions = [];
              if (searchResultCount != 0) {
                rs.run().each(function(result) {
                  tailors.push(result.id);
                  return true;
                });
              }
              return tailors;

          }catch(e){
            return [];
          }
        }

        function map(context) {
          try{
          //Tailor Internalid
          log.debug('contextData', context.value);
          var dataitems = [];
          var currentScript = runtime.getCurrentScript();
          if(context.value){
            var rs;
            var period;
            if(currentScript.deploymentId == 'customdeploy1' ){
              //monthly
              rs = search.load({
                id: 'customsearch_consolidatedinvoice_monthly',
                type: "invoice"
              });
            }else if(currentScript.deploymentId == 'customdeploy2' ){
              //weekly
              rs = search.load({
                id: 'customsearch_consolidatedinvoice_weekly',
                type: "invoice"
              });
            }

            var filters = rs.filters;
            filters.push(search.createFilter({
                name: 'name',
                operator: search.Operator.ANYOF,
                values: context.value
            }));
            var searchResultCount = rs.runPaged().count;
            var subtotal = 0;
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
              id: context.value,
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
                // renderer.addCustomDataSource({
                //     alias: 'result',
                //     format: render.DataSource.JSON,
                //     data: JSON.stringify(dataitems)
                // });
                // renderer.addSearchResults({
                //   templateName: 'items',
                //   searchResult: dataitems
                // });
                // renderedPdf = renderer.xmlToPdf({xmlString:templateRec.getValue('custrecord_template_contents')});
                renderedPdf = renderer.renderAsPdf();
                renderedPdf.name = "ConsolidatedInvoice_"+dateStr+".pdf";
                //Send Emails of consolidated invoices
                nlemail.send({
                  author: 660,
                  recipients: context.value,
                  subject: 'Jerome Clothiers : Weekly Consolidated Invoices',
                  body: "Hello "+tailorFields.companyname+", \n Attached is the pdf of the open invoices last week.\n",
                  attachments: [renderedPdf]
                });
            }
          }
        }catch(e){
          log.error('error',e)
        }
        }

        /**
         *  @function reduce
         *  @param {Object} context Context of the Suitelet, including any passed parameters.
         *  @summary
         *  @fires summarize
         */
        function reduce(context) {

            // var contextData = JSON.parse(context.value);
            log.debug('reduce contextData', context);
            return true;
        }

        /**
         *  @function summarize
         *  @param {Object} summary Summary Object generated from Map/Reduce Script.
         *  @summary Provides analytical details on the reduce function prior.
         */
        function summarize(summary) {
            log.debug('Summary Time', 'Total Seconds: ' + summary.seconds);
            log.debug('Summary Usage', 'Total Usage: ' + summary.usage);
            log.debug('Summary Yields', 'Total Yields: ' + summary.yields);

            log.debug('Input Summary: ', JSON.stringify(summary.inputSummary));
            log.debug('Map Summary: ', JSON.stringify(summary.mapSummary));
            log.debug('Reduce Summary: ', JSON.stringify(summary.reduceSummary));
            //Grab Map errors
            summary.mapSummary.errors.iterator().each(function(key, value) {
                log.error(key, 'ERROR String: ' + value);
                return true;
            });
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
