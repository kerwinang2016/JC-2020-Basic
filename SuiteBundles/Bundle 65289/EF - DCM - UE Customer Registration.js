var Handler = (function(){


    /* Private */
    var onCreate = function(newRecord)
    {

        if(SC.Configuration.Efficiencies.DuplicateCustomerManagement.enabled){

            var executionContext = nlapiGetContext().getExecutionContext();


            if( executionContext == 'webstore' || !SC.Configuration.Efficiencies.DuplicateCustomerManagement.onlyRunOnWebstore) {
                var DuplicateCustomerManagement = Application.getModel('DuplicateCustomerManagement');

                var registrationData = {};
                _.each(JSON.parse(JSON.stringify(newRecord)), function (value, key) {
                    var tempValue = value.internalid || value;
                    if (_.isBoolean(tempValue)) {
                        tempValue = (tempValue === true ? 'T' : 'F'); //For some reason, here we had true booleans. And we need netsuite bools.
                    }
                    registrationData[key] = tempValue;

                });
                
                if(!registrationData.email) return; //Guest Shoppers

                var dups = DuplicateCustomerManagement.getDuplicated(registrationData);

                if (dups && dups.length) {
                    throw nlapiCreateError('-100', SC.Configuration.Efficiencies.DuplicateCustomerManagement.errorMessage, true);
                }
            }
        }

    };

    /* Public */
    var beforeSubmit  = function(type){

        var record = nlapiGetNewRecord();

        switch(type.toString()){
            case 'create':
                onCreate(record);
                break;
        }
    };

    return {
        beforeSubmit: beforeSubmit
    };

}());