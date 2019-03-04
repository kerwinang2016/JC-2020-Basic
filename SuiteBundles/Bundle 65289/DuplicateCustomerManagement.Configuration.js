_.extend(SC.Configuration.Efficiencies, {
    DuplicateCustomerManagement: {
        enabled:true,
        onlyRunOnWebstore:true,
        errorMessage: 'There is already an account with this email address. If you are sure that it is your email address, <a data-hashtag="#forgot-password" data-touchpoint="login" href="">click here</a> to retrieve your password.',
        criteria: {
            email: true, //Users with same email
            //subsidiary: true, //Check only on same subsidiary
            giveaccess: true, //Check only between users with access
            isinactive: true //check only between active users
        }
    }
});