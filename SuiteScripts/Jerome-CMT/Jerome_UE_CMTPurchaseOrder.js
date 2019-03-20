/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Dec 2015     rdutt
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord purchaseorder
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */


function userEventAfterSubmitPO(type){
	try {
		var objRecordPOID = nlapiGetNewRecord().getId();
		var objRecordPO = nlapiLoadRecord('purchaseorder', objRecordPOID);
	
		nlapiLogExecution('DEBUG', 'function', 'AfterSubmitPO');
		nlapiLogExecution('DEBUG', 'type', type);
		
		if (type == 'specialorder' || type == 'create'){
			// Loop through all items in the PO 
			var itemCount = objRecordPO.getLineItemCount('item');
			
			nlapiLogExecution('DEBUG', 'itemCount (initial)', itemCount);
			
			for (var ii=1; ii<=itemCount; ii++){
				nlapiLogExecution('DEBUG', 'item', ii);
				
				var itemID = objRecordPO.getLineItemValue('item', 'item', ii);
								
				nlapiLogExecution('DEBUG', 'itemID', itemID);
				if( objRecordPO.getFieldValue('entity') != '17' && objRecordPO.getFieldValue('entity') != '671'){
					objRecordPO.selectLineItem('item', ii);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_fabric_status', 2);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_cmt_status', 7);
					objRecordPO.commitLineItem('item');					
				}else{
					objRecordPO.selectLineItem('item', ii);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_fabric_status', 4);
					objRecordPO.setCurrentLineItemValue('item', 'custcol_avt_cmt_status', 7);
					objRecordPO.commitLineItem('item');
				}				
				
				//Check the service item checkbox. If this is 'yes', then it is a service item. 
				var isServiceItem = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_serviceitem');
				nlapiLogExecution('DEBUG', 'isServiceItem', isServiceItem);
				if (isServiceItem == 'T'){
					//for each item, go in to the item record and get the CMT price.
					var cmtVendorPrice = nlapiLookupField('noninventoryitem', itemID, 'custitem_jerome_cmt_basic_ven_price');
					nlapiLogExecution('DEBUG', 'cmtVendorPrice', cmtVendorPrice);
					if (!Function.isUndefinedNullOrEmpty(cmtVendorPrice)){
						//replace 'rate' column on PO with the vendor price from the service item record.
						objRecordPO.selectLineItem('item', ii);
						objRecordPO.setCurrentLineItemValue('item', 'rate', cmtVendorPrice);
						objRecordPO.commitLineItem('item');
					}
				}
			}
			
			nlapiLogExecution('DEBUG', 'submit', 'submit.. ');
			
			//Submit the record to commit the sublist changes to the database
			nlapiSubmitRecord(objRecordPO);
		}
		else if(type == 'edit'&& nlapiGetContext().getEnvironment() == 'webservices'){
			nlapiLogExecution('debug','Updates the PURCHASE ORDER USING WEBSERVICES',nlapiGetRecordId())
			var itemCount = objRecordPO.getLineItemCount('item');			
			var sorecord;
			if(objRecordPO.getFieldValue( 'createdfrom'))
				sorecord = nlapiLoadRecord( 'salesorder', so.getFieldValue( 'createdfrom'));
			else{
				return;
			}
			for (var ii=1; ii<=itemCount; ii++){
				for(var jj=1; jj<sorecord.getLineItemCount('item'); jj++){
					if(objRecord.getLineItemValue('item','custcol_avt_saleorder_line_key',ii) == sorecord.getLineItemValue('item','custcol_avt_saleorder_line_key',jj)){
						var text  =  objRecordPO.getLineItemText( 'item', 'custcol_avt_fabric_status', ii);
						if(objRecordPO.getLineItemText( 'item', 'custcol_avt_date_sent', ii))
						{
							text += '-' + objRecordPO.getLineItemText( 'item', 'custcol_avt_date_sent', ii);
						}
						if(objRecordPO.getLineItemText( 'item', 'custcol_avt_tracking', ii))
						{
							text += '-' + objRecordPO.getLineItemText( 'item', 'custcol_avt_tracking', ii);
						}
						sorecord.setLineItemValue( 'item', 'custcol_avt_tracking', jj, objRecordPO.getLineItemText( 'item', 'custcol_avt_tracking', ii));
						sorecord.setLineItemValue( 'item', 'custcol_avt_date_sent', jj, objRecordPO.getLineItemText( 'item', 'custcol_avt_date_sent', ii));
						sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_status', jj, objRecordPO.getLineItemText( 'item', 'custcol_avt_fabric_status', ii));
						sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_text', jj, text);
						break;
					}
				}
			}
			nlapiSubmitRecord(sorecord);
		}
	} catch(err){
		nlapiLogExecution('DEBUG', 'Error', err.message);
	}
}
