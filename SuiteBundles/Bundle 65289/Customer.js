/*
 email: true,
 subsidiary: true, //Check only on same subsidiary
 giveaccess: true, //Check only between users with access
 isinactive: true
 */

Application.defineModel('Customer', {
    record: 'customer',
    columns: {
        internalid: {fieldName: 'internalid'},
        email : {fieldName: 'email'},
        isinactive: {fieldName: 'isinactive'},
        //language: {fieldName: 'language'},
        //currency: {fieldName: 'currency'},
        giveaccess: {fieldName: 'giveaccess'},
        subsidiary: {fieldName: 'subsidiary'}
    },
    fieldsets: {
        duplicated: ['internalid','email','isinactive','language','currency']
    },
    filters : {
        base: [{fieldName: 'isinactive', operator: 'is', value1: 'F'}]
    },
    mantainCustomer: function(data,type)
    {
        var customer,
            customerType = type || 'customer',
            isEdit = !!data.internalid,
            customerId;

        if(!isEdit)
        {
            customer = nlapiCreateRecord(customerType);
        } else
        {
            customer = nlapiLoadRecord(customerType,data.internalid);

        }
        _.each(data, function(value,key){
            customer.setFieldValue(key,value);
        });

        var id = nlapiSubmitRecord(customer);
        return id;
    }
});