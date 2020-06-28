define('Invoice', ['Invoice.Model', 'Invoice.Collection', 'Invoice.OpenList.View', 'Invoice.PaidList.View', 'Invoice.Details.View',  'Invoice.Router'], function (Model, InvoiceCollection, OpenListView, PaidListView, DetailsView, Router)
{
	'use strict';
	var menuitems = function(application){
		if(application.getUser().get('hidebillingandcogs') == 'F'){
			return {
			 parent: 'billing'
		 ,	id: 'invoices'
		 ,	name: _('Invoices').translate()
		 ,	url: 'invoices'
		 ,	index: 2
		 ,	permission: 'transactions.tranCustInvc.1'
		 }
	 }else{
		 return null;
	 }
	}
	return	{
		Model: Model
	,	InvoiceCollection: InvoiceCollection
	,	OpenListView: OpenListView
	,	PaidListView: PaidListView
	,	DetailsView: DetailsView
	,	Router: Router

	,	MenuItems:menuitems
	,	mountToApp: function (application)
		{
			application.getUser().set('invoices', new InvoiceCollection());
			return new Router(application);
		}
	};
});
