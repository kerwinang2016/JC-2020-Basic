Application.defineModel('DuplicateCustomerManagement', {
    fieldsets: {
        duplicated: ['internalid','email','isinactive','language','currency']
    },
    /*
     data: user to register data
     ignoreKeys: (optional) to avoid in specific case

     SC.Configuration.Efficiencies.DuplicateCustomerManagement.duplicate_criteria
     */
    getDuplicated: function (data, ignoreKeys) {

        var CustomerModel = Application.getModel('Customer');
        var Search = new SearchHelper(CustomerModel.record, null, CustomerModel.columns, this.fieldsets.duplicated),
            self = this;

        console.log('data em', data.email);
        _.each(SC.Configuration.Efficiencies.DuplicateCustomerManagement.criteria, function (value, key) {
            if (!_.contains(ignoreKeys, key)) {
                Search.addFilter({fieldName: CustomerModel.columns[key].fieldName, operator: 'is', value1: data[key]});
            }
        });
        Search.setSort('createdat').setSortOrder('asc');

        return Search.search().getResults();

    }
});