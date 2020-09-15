//Developer: Kerwin Ang
//Email: kerwin_ang@yahoo.com
//Mass update Fields
//custcol_shippingprice

//custcol_shippingprice,custcol_cost_of_goods_sold
function massUpdateItems(recType,recId){
	// var recType = nlapiGetRecordType(), recId = nlapiGetRecordId();
	var rec = nlapiLoadRecord(recType,recId, {recordmode: 'dynamic'});
	
	var vendorname = rec.getFieldValue('vendorname');
	var vendorid = "";
	if(vendorname == 'Drago')
		vendorid = "672";
	if(vendorname == 'Carnet')
		vendorid = '596';
	var purchaseprice = rec.getFieldValue('cost');
	
	if(vendorid){
		var count = rec.getLineItemCount('itemvendor');
		var currency = "4";
		rec.selectLineItem('itemvendor',1);
		var itemVPrice = rec.editCurrentLineItemSubrecord('itemvendor','itemvendorprice');

		var itmPrceLines = itemVPrice.getLineItemCount('itemvendorpricelines');
		var hasSameCurr = false;

		for (var ix = itmPrceLines; ix >= 1; ix--) {
			nlapiLogExecution('debug','Update Line')
			itemVPrice.selectLineItem('itemvendorpricelines',ix);
			nlapiLogExecution('debug','Currency', currency);
			var pCurr = itemVPrice.getCurrentLineItemValue('itemvendorpricelines','vendorcurrency');
			nlapiLogExecution('debug','pCurr', pCurr);
			if (pCurr == currency) {
				//itemVPrice.setCurrentLineItemValue('itemvendorpricelines','vendorcurrency',currency);
				itemVPrice.setCurrentLineItemValue('itemvendorpricelines','vendorprice',purchaseprice);

				itemVPrice.commitLineItem('itemvendorpricelines');
				hasSameCurr = true;
				
			}else{
				itemVPrice.removeLineItem('itemvendorpricelines',ix);
			}
		}
		if(!hasSameCurr){
			
			itemVPrice.selectNewLineItem('itemvendorpricelines');

			itemVPrice.setCurrentLineItemValue('itemvendorpricelines','vendorcurrency',currency);

			itemVPrice.setCurrentLineItemValue('itemvendorpricelines','vendorprice',purchaseprice);

			itemVPrice.commitLineItem('itemvendorpricelines');
		}
		itemVPrice.commit();
		rec.commitLineItem('itemvendor');
		
		nlapiSubmitRecord(rec,true,true);
	}
}