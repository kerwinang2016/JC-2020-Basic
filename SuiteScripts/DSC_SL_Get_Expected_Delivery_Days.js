function onRequest(request, response) {
    try {


        var context = nlapiGetContext();
        var itemId = request.getParameter('itemid');
        var customerId = request.getParameter('customerid');
        nlapiLogExecution('debug', 'itemId : customerId', itemId + ' : ' + customerId);
        var vendorId = '';
        if (itemId) {
            vendorId = nlapiLookupField('item', itemId, 'vendor');
        }

        nlapiLogExecution('debug', 'vendorId', vendorId);
        var strJson, monday, tuesday, wednesday, thursday, friday, saturday, sunday;
        var fabricdefault = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_default'));
        monday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_monday'));
        tuesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_tuesday'));
        wednesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_wednesday'));
        thursday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_thursday'));
        friday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_friday'));
        saturday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_saturday'));
        sunday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_sunday'));


        var fabdelivery = 0;
        if (vendorId)
            fabdelivery = nlapiLookupField('vendor', vendorId, 'custentity_fabric_delivery_days');
        else
            fabdelivery = fabricdefault;
        if (!fabdelivery) fabdelivery = fabricdefault;
        var receivedays = 0;
        var cmtdate = 0;
        var today = new Date();
		nlapiLogExecution('debug','Start',nlapiDateToString(today));
		nlapiLogExecution('debug','Timezone offset',today.getTimezoneOffset());
        today.setDate(today.getDate() + 1);
		nlapiLogExecution('debug','Added a day',nlapiDateToString(today));
        today.setDate(today.getDate() + parseFloat(fabdelivery));
		nlapiLogExecution('debug','Added Fabric Delivery',nlapiDateToString(today));
        switch (today.getDay().toString()) {
            case '1':
                receivedays = monday;
                break;
            case '2':
                receivedays = tuesday;
                break;
            case '3':
                receivedays = wednesday;
                break;
            case '4':
                receivedays = thursday;
                break;
            case '5':
                receivedays = friday;
                break;
            case '6':
                receivedays = saturday;
                break;
            case '0':
                receivedays = sunday;
                break;
            default:
                0;
        }

        today.setDate(today.getDate() + parseFloat(receivedays));
		nlapiLogExecution('debug','Added Manufacturing',nlapiDateToString(today));
        if (customerId) {
            cmtdate = nlapiLookupField('customer', customerId, 'custentity_delivery_days');
        }

		if(customerId == '5' || customerId == '75' || customerId == '669'){
		nlapiLogExecution('debug','What day',today.getDay());
			if(today.getDay() != 1 && today.getDay() != 4){
				if(today.getDay() > 1 && today.getDay() < 4){
					today.setDate(today.getDate() + (3-today.getDay())%7+1);
				}else{
					today.setDate(today.getDate() + (7-today.getDay())%7+1);
				}
			}
		}else{
			//This always sets to a Monday
			if(today.getDay() != 1)
				today.setDate(today.getDate() + (7-today.getDay())%7+1);
		}
		nlapiLogExecution('debug','Moved to the day',nlapiDateToString(today));
        if (!cmtdate) cmtdate = 4;

        today.setDate(today.getDate() + parseFloat(cmtdate));
        if (today.getDay() == 6)
            today.setDate(today.getDate() + 2)
        if (today.getDay() == 0)
            today.setDate(today.getDate() + 1)

        if (vendorId != '21' && vendorId != '35') {
            nlapiLogExecution('debug', 'expected date 1: ', today);
            var expDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            strJson = JSON.stringify({
                "expecteddate": expDate
            });
        } else {
            strJson = JSON.stringify({
                "expecteddate": ''
            });
        }
		nlapiLogExecution('debug','Str json',nlapiDateToString(today));
        response.write(strJson);

    } catch (e) {
        nlapiLogExecution('error', 'Error: ', 'message= ' + e.message);
    }
}