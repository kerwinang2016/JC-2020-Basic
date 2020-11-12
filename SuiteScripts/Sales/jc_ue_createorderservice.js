/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NAmdConfig /SuiteScripts/amd-config.json
 */

 define(['N/record', 'N/log'],
	function (record, log){

		function beforeLoad(context){
			if(context.type == context.UserEventType.VIEW){
				//Show the create order service button
				var status = context.newRecord.getValue('status');
				if(status == 'Billed'){
					var orderdata = "{recordType:'salesorder', id:"+context.newRecord.id+"}";
					//context.form.clientScriptModulePath  = "SuiteScripts/Sales/jc_cs_createorderservice.js";
					context.form.clientScriptFileId = 22682;
					context.form.addButton({
						id : "custpage_create_order_button",
						label : "Create Ustyylit Order",						
						functionName : 'createOrder(' + orderdata + ')'
					});
					context.form.addButton({
						id : "custpage_update_orderstatus_button",
						label : "Update Order Status",
						functionName : 'updateOrderStatus(' + orderdata + ')'
					});
				}
			}
		}
		return {
		   beforeLoad:beforeLoad
		}
	}
 );
