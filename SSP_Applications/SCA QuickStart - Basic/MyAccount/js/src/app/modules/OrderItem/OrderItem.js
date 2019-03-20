// OrderItem.js
// -----------------
/*
Change History   
-------------- 
Date: 05-03-2019
Changed by: Salman Khan
Change /Jira Ticket #: JHD-32
Change Description: Same Drop down of "My account" and "Your account"
*/
// Defines the OrderItem  module (Model, Collection, Views, Router)
define('OrderItem', ['OrderItem.Views', 'OrderItem.Model', 'OrderItem.Router', 'OrderItem.Collection'], function (Views, Model, Router, Collection)
{
	'use strict';
	
	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection

	,	MenuItems: { //JHD-32
		parent: 'orders'
	,	id: 'reorderitems'
	,	name: _('Reorder Items').translate()
	,	url: 'reorderItems'
	,	index: 4
	,	permission: 'transactions.tranFind.1,transactions.tranSalesOrd.1'
	}

	,	mountToApp: function (application)
		{
			this.application = application;
			return new Router(application);
		}
	};
});