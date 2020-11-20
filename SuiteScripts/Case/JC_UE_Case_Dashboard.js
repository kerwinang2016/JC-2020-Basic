/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
	function(record) {
		function beforeSubmit(context) {
			try {
				log.debug('context type', context.type);
				var currentRecord 	= context.newRecord;
				var company			= currentRecord.getValue({'fieldId': 'company'});	//Get the company name from the case record

				log.debug('company', company);

				//Load the Tailor record and check if it has a parent company
				var tailorRec 		= record.load({
					type: record.Type.CUSTOMER,
					id: company,
					isDynamic: true,
				});

				var parentTailor 	= tailorRec.getValue({'fieldId': 'parent'});	//Get the Parent Company of the Tailor
				log.debug('parentTailor', parentTailor);

				//If the tailor has a parent record, change the company name of the case to the parent tailor
				if (parentTailor != null && parentTailor != ''){
					currentRecord.setValue({
						fieldId: 'company',
						value: parentTailor
					});
				}


			} catch (e){
				log.debug('An error occurred on beforeSubmit', e);
			}
		}

		return {
			beforeSubmit: beforeSubmit
		};
	});
