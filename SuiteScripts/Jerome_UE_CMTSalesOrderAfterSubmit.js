
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmitSO(type) {
	nlapiLogExecution('DEBUG', '**********************', 'new function = userEventAfterSubmitSO');
	nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'type='+type);
	
	if (type == 'create' || type == 'edit'){
		var context =  nlapiGetContext();
		var executionContext =  context.getExecutionContext();
		nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'executionContext='+executionContext);
		if (executionContext == 'userinterface' || executionContext == 'webstore') {
			try {
				var recordID = nlapiGetRecordId();
				nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'recordID='+recordID);
				var newSORecord =  nlapiLoadRecord('salesorder', recordID);
				var soNumber =  newSORecord.getFieldValue('tranid');
				var customerName =  newSORecord.getFieldValue('custbody_customer_name');
				
				nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'soNumber='+soNumber);
				nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'customerName='+customerName);
				var itemCount = newSORecord.getLineItemCount('item');
				nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'itemCount='+itemCount);
				nlapiLogExecution('DEBUG', 'itemCount', itemCount);
				
				var status = newSORecord.getFieldText('orderstatus');
				
				if (type == 'create' || (type == 'edit' && status == "Pending Approval")){
								
					var count = 0;
					for (var ii=1; ii<=itemCount; ii++){
						nlapiLogExecution('DEBUG', 'item', ii);
						//get soID value
						var itemID = newSORecord.getLineItemValue('item', 'item', ii);

						// AVT
						
						if (type == 'create' && executionContext == 'webstore')
						{
							var dateNeededValue = newSORecord.getLineItemValue('item', 'custcol_avt_date_needed', ii);
							
							newSORecord.selectLineItem('item', ii);
							newSORecord.setCurrentLineItemValue('item', 'custcol_avt_saleorder_line_key',  recordID.toString() + '_' + new Date().getTime());
							
							if (dateNeededValue == '1/1/1900')
							{
								newSORecord.setCurrentLineItemValue('item', 'custcol_avt_date_needed', '');
							}
							newSORecord.commitLineItem('item');
						}
						
						nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', 'itemID='+itemID);
						var customerName =  newSORecord.getFieldValue('custbody_customer_name');
						nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO inside loop', 'customerName = '+customerName);
						//Check the service item checkbox. If this is 'yes', then it is a service item.
						var isServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_serviceitem');
						var arCustomColumnValues = [];
						var arCustomColumnNames = [	 'custcol_ps_cart_item_id'
												   , 'custcol_custom_price'
												   , 'custcol_customer_amount'
												   , 'custcol_customer_rate'
												   , 'custcol_designoptions_jacket'
												   , 'custcol_designoption_message'
												   , 'custcol_designoptions_overcoat'
												   ,  'custcol_designoptions_shirt'
												   , 'custcol_designoptions_trouser'
												   , 'custcol_designoptions_waistcoat'
												   , 'custcol_fabric_quantity'
												   , 'custcol_fitprofile_jacket'
												   , 'custcol_fitprofile_message'
												   , 'custcol_fitprofile_overcoat'
												   , 'custcol_fitprofile_shirt'
												   , 'custcol_fitprofile_trouser'
												   , 'custcol_fitprofile_waistcoat'
												   , 'custcol_fitprofile_summary'
												   , 'custcol_tailor_client_name'
												   , 'custcol_avt_date_needed'
												   , 'custcol_avt_hold_fabric'
												   , 'custcol_avt_hold_production'
												   //, 'custcol_avt_saleorder_line_key'
												  ];
						
						if (isServiceItem != 'T'){
							count++;
							arCustomColumnValues = [];
						} else {		
							//it is a service item, so copy the details of custom columns from the fabric item line above it and insert it to the service line item.
							if (ii > 1){
								for (var columnNumber = 0; columnNumber < arCustomColumnNames.length; columnNumber++){
									arCustomColumnValues.push(newSORecord.getLineItemValue('item', arCustomColumnNames[columnNumber], ii-1));
                                                                  nlapiLogExecution('DEBUG', 'new column and value',  arCustomColumnNames[columnNumber] + " = " + arCustomColumnValues[arCustomColumnValues.length-1]);
								}
							}
						}
						
						//Set the SO ID column to the unique identifier - SalesOrder_fabric item line number.
						//both the fabric item and service item will have the same identifier for association purposes.
						nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO', soNumber + '-' + count);
						newSORecord.selectLineItem('item', ii);
						newSORecord.setCurrentLineItemValue('item', 'custcol_so_id', soNumber + '-' + count);
						nlapiLogExecution('DEBUG', 'arCustomColumnValues length', arCustomColumnValues.length);
						//if the fabric item values were retrieved and this is a service item, enter all custom column values into this line from the corresponding fabric line item.
						if (arCustomColumnValues.length > 0){	
							for (var columnNumber = 0; columnNumber < arCustomColumnNames.length; columnNumber++){
								nlapiLogExecution('DEBUG', 'columnNumber', columnNumber);
								//newSORecord.setCurrentLineItemValue('item', arCustomColumnNames[columnNumber], arCustomColumnValues[columnNumber]);
								
								// AVT
								if (arCustomColumnNames[columnNumber] == 'custcol_avt_date_needed')
								{
									var dateNeededInsertedValue = arCustomColumnValues[columnNumber];
									
									if (dateNeededInsertedValue == '1/1/1900')
									{
										arCustomColumnValues[columnNumber] = '';
									}
								}
								
								newSORecord.setCurrentLineItemValue('item', arCustomColumnNames[columnNumber], arCustomColumnValues[columnNumber]);
							}
							
							if (type == 'create' && executionContext == 'webstore')
							{
								newSORecord.setCurrentLineItemValue('item', 'custcol_avt_saleorder_line_key', recordID.toString() + '_' + new Date().getTime());
							}
							
							
						}

						newSORecord.commitLineItem('item');
													
					}
					customerName =  newSORecord.getFieldValue('custbody_customer_name');
					nlapiLogExecution('DEBUG', 'userEventAfterSubmitSO after loop', 'customerName = '+customerName);
					var submit = nlapiSubmitRecord(newSORecord);
					
				}
			} catch (ex) {
				var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
				nlapiLogExecution('ERROR', 'userEventAfterSubmitSO error', strError);
			}
		}
	}	
}