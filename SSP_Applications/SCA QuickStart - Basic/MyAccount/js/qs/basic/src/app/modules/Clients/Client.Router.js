// Profile.Router.js
// -----------------------
// Router for handling profile view/update
define('Client.Router',  ['ClientForm.View','ClientDetails.View','Client.Collection','ClientList.View', 'Client.Model'
													,'NewFitProfile.Collection','Alterations.Collection',
													'ClientOrderHistory.Collection',
												 	'ProductListItem.Collection'
												],
								function (ClientForm,ClientDetailsView, ClientCollection, ClientListView, ClientModel,
													FitProfileCollection, AlterationsCollection,PlacedOrderCollection,
													SavedItems)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'clientlist': 'clientList',
			'clientlist?:options': 'clientList',
			'clientdetails/:id': 'clientDetails',
			'clientform/:id': 'clientForm'
		}

	,	initialize: function (application, clients)
		{
			this.application = application;
			this.clients = clients;
		}
	, clientForm: function(options){
		var clientModel = new ClientModel({ internalid: options });
		var	formView = new ClientForm({
			application: this.application
		,	model: clientModel
		, parentView: this
		});
		jQuery.when(clientModel.fetch({data:jQuery.param({action:'getclient'})})).then(jQuery.proxy(view, 'showContent'));
		// jQuery.when(model.fetch()).then(jQuery.proxy(view, 'showContent'));
		//formView.showInModal();
	}
	, clientDetails: function(options){
		var self = this;
		if(options){
			var model = new ClientModel({ internalid: options });

			var orderHistory = null, fitProfiles = null, savedItems = null, alterations = null;
			var orderHistory = new PlacedOrderCollection({
				search: options
			});
			var savedItems = new SavedItems();
			var fitProfiles = new FitProfileCollection();
			var alterations = new AlterationsCollection();
			var detailsView = new ClientDetailsView({
					application: self.application
				, parent: self.application.user_instance.get('parent')
				, model: model
				, orderHistory: orderHistory
				, fitProfiles: fitProfiles
				, savedItems: savedItems
				, alterations: alterations
			});
			jQuery.when(
				model.fetch({data:jQuery.param({action:'getclient'})}),
				orderHistory.fetch(),
				savedItems.fetch({data:{
					clientid: options,
					customerid: self.application.user_instance.get('parent')
				}}),
				fitProfiles.fetch({data:{
					clientid: options
				}}),
				alterations.fetch({data:{
					clientid: options
				}})
			).then(jQuery.proxy(detailsView, 'showContent'));
		}else{
			Backbone.history.navigate('clientlist', {trigger: true});
		}
	}
	, clientList: function(options){
		var params_options = _.parseUrlOptions(options);
		this.showClientListHelper(params_options)
	}
	,	showClientListHelper: function(params_options)
		{
			var self = this;
			var	collection = new ClientCollection();
			view = new ClientListView({
					application: self.application
				, parent: self.application.user_instance.get('parent')
				,	collection: collection
				,	options: params_options
				,	page: (params_options && params_options.page)?params_options.page:1
				});
			view.collection.on('reset add', view.render, view);
			view.showContent();

		}

	});
});
