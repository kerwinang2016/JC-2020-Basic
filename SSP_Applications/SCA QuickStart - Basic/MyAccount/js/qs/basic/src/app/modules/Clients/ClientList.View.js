	// Profile.Views.js
	// -----------------------
	// Views for profile's operations
	define('ClientList.View', ['Client.Model','Client.Collection','ClientForm.View'], function (ClientModel,ClientCollection,ClientForm) {
		'use strict';

		// Client Search page view
		return Backbone.View.extend({

			template: 'clientlist'
			, title: _('Tailor Clients').translate()
			, attributes: { 'class': 'ClientListView' }
			, events: {
				'click #order-client-search': 'searchClients',
				"click #client-add": "showNewClientForm",
				"click #client-profile-select": "showClientDetails"
			}
			, initialize: function (options) {
				var self = this;
				this.application = options.application;
	      this.collection = options.collection;
				this.parent = options.parent;
				//I dont think we need this here.. but just saving right now for checking
				this.page = options.page;
				this.parameters = options.options;
	      this.phone = self.parameters.phone;
				this.email = self.parameters.email;
				this.name = self.parameters.name;
				this.model = options.model? options.model: new ClientModel();
	      this.listenCollection();
				if(this.name || this.email || this.phone || self.parameters.id){
					this.collection.fetch({
		        data: {
		          parent: self.parent,
		          page: self.page?self.page:1,
		          searchdetails: JSON.stringify({
								clientname: self.name?self.name:"",
								clientemail: self.email?self.email:"",
								clientphone: self.phone?self.phone:""
							}),
							internalid: self.parameters.id?self.parameters.id:""
		        },
		        reset: true,
		        killerId: options.killerId
					})
				}
			}
			, showClientDetails: function(e){
				e.preventDefault();
				var clientid = e.target.getAttribute('client-id');
				// var currentModel = this.collection.find(function(data){
				// 	return data.get("internalid") == clientid;
				// });
				// this.model = currentModel;
				Backbone.history.navigate('clientdetails/'+clientid, {trigger: true});
			}
	  	,	listenCollection: function ()
	  		{
	  			this.setLoading(true);

	  			this.collection.on({
	  				request: jQuery.proxy(this, 'setLoading', true)
	  			,	reset: jQuery.proxy(this, 'setLoading', false)
	  			});
	  		}

	  	,	setLoading: function (is_loading)
	  		{
	  			this.isLoading = is_loading;
	  		}
	  	,	initializeFilterOptions: function()
	  		{
	  			var filter_options = [
	  				{
	  					value: 'all'
	  				,	name: _('Show All Statuses').translate()
	  				,	selected: true
	  				,	filter: function ()
	  					{
	  						return this.original.models;
	  					}
	  				}]
	  			,	statuses = this.fields ? this.fields.get('statuses') : [];

	  			_.each(statuses, function (status) {
	  				var filter_option = {
	  					value: status.id
	  				,	name: status.text
	  				,	filter: function ()
	  					{
	  						return this.original.filter(function (some_case)
	  						{
	  							return some_case.get('status').id === status.id;
	  						});
	  					}
	  				};

	  				filter_options.push(filter_option);
	  			});

	  			return filter_options;
	  		}
	  	,	sortOptions: [
	  			{
	  				value: 'caseNumber'
	  			,	name: _('by Issue number').translate()
	  			,	selected: true
	  			}
	  		,	{
	  				value: 'createdDate'
	  			,	name: _('by Creation date').translate()
	  			}
	  		,	{
	  				value: 'lastMessageDate'
	  			,	name: _('by Last Message date').translate()
	  			}
	  		]

			, showContent: function () {
				var self = this;

				this.application.getLayout().showContent(this, 'clientlist', [{
					text: this.title
				,	href: '/clientlist'
				}]);
			}

	  	,	render: function()
	  		{
	  			Backbone.View.prototype.render.apply(this, arguments);

	  			// if (!_.isUndefined(this.inform_new_case))
	  			// {
	  			// 	this.informNewCaseCreation();
	  			//
	  			// 	if (!this.isLoading)
	  			// 	{
	  			// 		delete this.inform_new_case;
	  			// 	}
	  			// }
	  		}
			, showNewClientForm: function(e){
				e.preventDefault();
				var clientModel = new ClientModel();
				var	formView = new ClientForm({
					application: this.application
				,	model: clientModel
				, parentView: this
				});
				// jQuery.when(clientModel.fetch()).then(jQuery.proxy(formView, 'showInModal'));
				formView.showInModal();
			}
			, searchClients: function(e){
				e.preventDefault();
				var self = this;
				this.name = jQuery('#order-client-name').val();
				this.email = jQuery('#order-client-email').val();
				this.phone = jQuery('#order-client-phone').val();
				if(jQuery('input[name=order-client-name]').val() || jQuery('input[name=order-client-email]').val() || jQuery('input[name=order-client-phone]').val()){

					this.collection.update({
					  page: this.page,
						searchdetails: JSON.stringify({
							clientname: jQuery('input[name=order-client-name]').val(),
							clientemail: jQuery('input[name=order-client-email]').val(),
							clientphone: jQuery('input[name=order-client-phone]').val()
						}),
						parent: self.parent
					});
				}
			}
		});
	});
