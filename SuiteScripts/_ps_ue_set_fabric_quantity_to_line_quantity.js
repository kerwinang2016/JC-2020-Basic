/**
* Module Description
* 
* Version    Date            Author           Remarks
* 1.00       07 Jan 2016     pdureza
*
*/

function afterSubmit(type){
	if(type == 'delete') return;
	var record = nlapiGetNewRecord();
	try {
		var newRecord = nlapiLoadRecord('salesorder', record.getId());
//		var newRecord = nlapiLoadRecord('salesorder', nlapiGetRecordId());
		
		for (var count = 1; count <= newRecord.getLineItemCount('item'); count ++){
			var priceLevel = newRecord.getLineItemValue('item', 'price', count);
			
			//nlapiLogExecution("DEBUG", "Price", custPrice);
			//nlapiLogExecution("DEBUG", "Pricelevel", priceLevel);
			
			// set quantity to fabric quantity
          if(nlapiLookupField('item',newRecord.getLineItemValue('item','item',count),'custitem_jerome_cmt_serviceitem') == 'F'){
			if(priceLevel && priceLevel > 0) {
				var fabric_quantity = newRecord.getLineItemValue('item', 'custcol_fabric_quantity', count);
				newRecord.setLineItemValue('item', 'quantity', count, fabric_quantity);  
			}
			}
		};
		nlapiSubmitRecord(newRecord);
	} catch (e){
		nlapiLogExecution('ERROR', "Could not update line quantity Name for SO# " + record.getId() , e);
	} 
}