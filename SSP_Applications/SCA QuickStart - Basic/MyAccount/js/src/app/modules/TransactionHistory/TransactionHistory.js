// TransactionHistory.js
// -----------------
// Defines the Transaction module (Model, Collection, Views, Router)
define('TransactionHistory', ['TransactionHistory.Model','TransactionHistory.Collection','TransactionHistory.Views','TransactionHistory.Router'], function (Model, Collection, Views, Router)
{
	'use strict';
	var menuitems = function(application){
		if(application.getUser().get('hidebillingandcogs') == 'F'){
			return {
					parent: 'billing'
				,	id: 'transactionhistory'
				,	name: _('Transaction History').translate()
				,	url: 'transactionhistory'
				,	permissionOperator: 'OR'
				,	permission: 'transactions.tranCustInvc.1, transactions.tranCustCred.1, transactions.tranCustPymt.1, transactions.tranCustDep.1, transactions.tranDepAppl.1'
				,	index: 3
				}
	 }else{
		 return null;
	 }
	}
	return	{
		Model: Model
	,	Collection: Collection
	,	Views: Views
	,	Router: Router

	,	MenuItems: menuitems

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
