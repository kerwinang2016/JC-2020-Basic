function beforeSubmit(type){
	if(type == 'create' || type == 'edit'){
		var newRec = nlapiGetNewRecord();
		if(newRec.getFieldValue('custrecord_tc_tailor')){
			var tailorRec = nlapiLoadRecord('customer',newRec.getFieldValue('custrecord_tc_tailor'));
			if(tailorRec.getFieldValue('parent')){
				newRec.setFieldValue('custrecord_tc_tailor',tailorRec.getFieldValue('parent'));
			}
		}
	}
}