/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Dec 2015     rdutt
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmitSO(type){
	try{
		var objRecordSO = nlapiGetNewRecord();
		
		nlapiLogExecution('DEBUG', 'type', type);
		var status = objRecordSO.getFieldText('orderstatus');
		//for edit processes, delete all existing serviceItems from the item list, and add the correct serviceItems again.
		if (type == 'edit' && status == "Pending Approval"){
			//get item count
			var itemCount = objRecordSO.getLineItemCount('item');
			// Loop through all items in the SO	
			for (var ii=1; ii<=itemCount; ii++){
				//get item ID
				var itemID = objRecordSO.getLineItemValue('item', 'item', ii);
				//get fullfilled column value
				//var quantityFulfilled = objRecordSO.getLineItemValue('item', 'quantityfulfilled', ii);
				//Check the service item checkbox. If this is 'yes', then it is a service item.
				var isServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_serviceitem');
				if (isServiceItem == 'T'){
					//remove them from the item list.
					objRecordSO.removeLineItem('item', ii);
					ii--;
				}
				itemCount = objRecordSO.getLineItemCount('item');
			}
		}
		if (type == 'create' || (type == 'edit' && status == "Pending Approval")){
			
			// Get tailor (Customer) ID and check the tailor's CMT preference
			var tailorID = objRecordSO.getFieldValue('entity');
			
			nlapiLogExecution('DEBUG', 'tailorID', tailorID);
			
			var custName = objRecordSO.getFieldValue('custbody_customer_name');
			
			nlapiLogExecution('DEBUG', 'custName', custName);
			
			// From the tailor record, get the CMT service preference and discount rate
			var tailorCMTPrefMaster = nlapiLookupField('customer', tailorID, 'custentity_jerome_cmt_service_preference',true);
			
			var tailorCMTDisc = nlapiLookupField('customer', tailorID, 'custentity_jerome_cmt_discount_rate');
			
			if (Function.isUndefinedNullOrEmpty(tailorCMTDisc)){
				tailorCMTDisc = 0;
			}
			
			nlapiLogExecution('DEBUG', 'preference', tailorCMTPref);
			nlapiLogExecution('DEBUG', 'discount', tailorCMTDisc);
			
			// Loop through all items in the SO 
			var itemCount = objRecordSO.getLineItemCount('item');
			
			nlapiLogExecution('DEBUG', 'itemCount (initial)', itemCount);
			var count = 1;
			for (var ii=1; ii<=itemCount; ii++){
				nlapiLogExecution('DEBUG', 'item', ii);
				var itemID = objRecordSO.getLineItemValue('item', 'item', ii);
				
				//var quantity = objRecordSO.getLineItemValue('item', 'quantity', ii);
				
				nlapiLogExecution('DEBUG', 'itemID', itemID);
				//nlapiLogExecution('DEBUG', 'quantity', quantity);
				
				//Check the Clothing type of the item. If it is ONLY a shirt, then it must be basic CMT.
				var arItemType = nlapiLookupField('noninventoryitem', itemID, 'custitem_clothing_type',true);
				var tailorCMTPref;
				nlapiLogExecution('DEBUG', 'arItemType---', arItemType);
				if (typeof arItemType === 'string' && arItemType == 'Shirt'){
					tailorCMTPref = 'Basic CMT';
				} else {
					tailorCMTPref = tailorCMTPrefMaster;
				}
				nlapiLogExecution('DEBUG', 'arItemType', arItemType);
				nlapiLogExecution('DEBUG', 'preference after shirt', tailorCMTPref);
				nlapiLogExecution('DEBUG', 'discount', tailorCMTDisc);
				
				//if (!Function.isUndefinedNullOrEmpty(arItemType) && !Function.isUndefinedNullOrEmpty(arItemType)){
					//for each item, go in to the item record and get the CMT service item.
				try{
					var cmtServiceItem;
					var cmtServicePrice;
					switch (tailorCMTPref){
						case 'Premium CMT':
							cmtServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_premium');
							cmtServicePrice = nlapiLookupField('noninventoryitem', cmtServiceItem, 'custitem_jerome_cmt_basic_price',false);
							break;
						case 'Basic CMT':
						default:
							cmtServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_basic',false);
							cmtServicePrice = nlapiLookupField('noninventoryitem', cmtServiceItem, 'custitem_jerome_cmt_basic_price',false);
							break;	
					}
						
					nlapiLogExecution('DEBUG', 'item', '--just after assigning--');
					// go in to the service item, and look up the price based on premium or basic preference.
								
					nlapiLogExecution('DEBUG', 'item', cmtServiceItem);
					nlapiLogExecution('DEBUG', 'price', cmtServicePrice);
					
					if (!Function.isUndefinedNullOrEmpty(cmtServiceItem) && !Function.isUndefinedNullOrEmpty(cmtServicePrice)){
						nlapiLogExecution('DEBUG', 'arItemRecord', cmtServiceItem);
						
						//calculate the service item price
						var serviceItemPrice = (parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
						
						nlapiLogExecution('DEBUG', 'serviceItemPrice', serviceItemPrice);
						nlapiLogExecution('DEBUG', 'arItemRecord.custitem_jerome_cmt_premium', cmtServiceItem);
						
						/*var soNumber = '';
						//if it's edit mode, and not approved yet, we need to re-number the items (SO_ID column)
						if (type == 'edit' && status == "Pending Approval"){
							soNumber =  objRecordSO.getFieldValue('tranid');
							objRecordSO.selectLineItem('item', ii);
							objRecordSO.setCurrentLineItemValue('item', 'custcol_so_id', soNumber + '-' + count);
							objRecordSO.commitLineItem('item');
						}*/
						
						//increment line number, as we want to add the service items underneath the corresponding line items.
						ii++;
						//Insert line after the current line item
						objRecordSO.insertLineItem('item', ii);
						nlapiLogExecution('DEBUG', 'insertLineItem', 'insert line item at ' + ii);
					
						//Set the service item as the line item value
						objRecordSO.setLineItemValue('item', 'item', ii, cmtServiceItem);
						 
						//Set the quantity to the quantity of the item above
						objRecordSO.setLineItemValue('item', 'quantity', ii, 1);
						
						//Set the price to the calculated service item price above
						objRecordSO.setLineItemValue('item', 'rate', ii, serviceItemPrice);
						
						/*if (type == 'edit' && status == "Pending Approval"){
							//Set the SO ID to the same SOID as above line
							objRecordSO.setLineItemValue('item', 'custcol_so_id', ii, soNumber + '-' + count);
							count++;
						}	*/			
						
						//get new line item count	
						itemCount = objRecordSO.getLineItemCount('item');
						custName = objRecordSO.getFieldValue('custbody_customer_name');
						
						nlapiLogExecution('DEBUG', 'custName inside loop', custName);
					} else {
						if (Function.isUndefinedNullOrEmpty(cmtServiceItem)){
							nlapiLogExecution('ERROR', 'Error:', "Service item for item " + itemID + " is blank in the item record.");
						} else {
							nlapiLogExecution('ERROR', 'Error:', "Service item price for item " + itemID + " is blank in the item record.");
						}
					}
					
				} catch(e){
					nlapiLogExecution('DEBUG', 'Error', e.message);
				}	
				//}	
			}
			custName = objRecordSO.getFieldValue('custbody_customer_name');
			
			nlapiLogExecution('DEBUG', 'custName after loop', custName);
		}
	} catch(err){
		nlapiLogExecution('DEBUG', 'Error', err.message);
	}
}

