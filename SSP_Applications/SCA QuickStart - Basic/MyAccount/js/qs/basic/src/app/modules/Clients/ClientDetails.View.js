// ClientDetails.View.js
// -----------------------
// Views for profile's operations
define('ClientDetails.View', ['Client.Model','ClientForm.View','ProductListDeletion.View','ItemDetails.Model','ProductListItem.Model','NewFitProfile.Model','Alterations.Model','NewFitProfileForm.View','AlterationForm.View'],
	function (ClientModel,ClientForm,ProductListDeletionView,ItemDetailsModel,ProductListItemModel, NewFitProfileModel,AlterationModel,NewFitProfileFormView,AlterationFormView) {
	'use strict';

	// home page view
	return Backbone.View.extend({

		template: 'client_details'
		, title: _('Client Details').translate()
		, attributes: { 'class': 'clientdetails' }

		, events:{
			'click [data-action="update-client"]': "updateClient"
			,'click [data-action="deactivate-client"]': "deactivateClient"
			//Order History Event.. might need to move to a different view next timeout
			,	'change [data-name="flag"]': 'updateFlag'
			, 'click #modalContainerSave' : 'updateFlagDetails'
			, 'blur [name="oh_dateneeded"]': 'updateDateNeeded'
			//END Order History events
			//START SAVED ITEMS Events
			, 'click [data-action="add-to-cart"]' : 'addItemToCartHandler'
			, 'click [data-action="delete-item"]' : 'askDeleteListItem'
			//END SAVED ITEMS EVENTS
			//START FIT PROFILE EVENTS
			, 'click [id=fitprofile-butt-add]': 'fitProfileAdd'
			, 'click [id=fitprofile-viewedit]': 'FitProfileViewEdit'
			//END FIT PROFILE EVENTS
			//START ALTERATION VIEWS
			, 'click [id=alteration-viewedit]': 'alterationsViewEdit'
			, 'click [id=alterations-add]': 'alterationsAdd'
			//END ALTERATION VIEWS
		}
		, initialize: function (options) {
			var self = this;
			this.parent = options.parent;
			this.model = options.model;
			this.application = options.application;
			this.orderHistory = options.orderHistory;
      this.fitProfiles = options.fitProfiles;
      this.savedItems = options.savedItems;
      this.alterations = options.alterations;

			this.cart = this.application.getCart();
			jQuery.get(_.getAbsoluteUrl('js/presetsConfig.json')).done(function (data) {
				self.presetsConfig = data;
			});
			jQuery.get(_.getAbsoluteUrl('js/itemRangeConfig.json')).done(function (data) {
				self.cmConfig = data;
			});
			jQuery.get(_.getAbsoluteUrl('js/itemRangeConfigInches.json')).done(function (data) {
				self.inchConfig = data;
			});
			jQuery.ajax({
				url:_.getAbsoluteUrl('services/measurementdefaults.ss'),
				success: function (result) {
						self.measurementdefaults = result;
				}
			});
			jQuery.get(_.getAbsoluteUrl('services/influences.ss')).done(function (data) {
				self.influences = data;
			});
			jQuery.get(_.getAbsoluteUrl('services/bodyBlockMeasurements.ss')).done(function (data) {
				self.bodyBlockMeasurements = data;
			});
			_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", {type:"get_favourite_fit_tools",id:this.options.application.getUser().get("internalid")}).always(function(data){
				if(data){
					// self.defaultfavfittools = data;
					self.defaultfavfittools = [];
					if(data){
						if(JSON.parse(data)[0] != ""){
							self.defaultfavfittools = JSON.parse(JSON.parse(data)[0]);
						}
					}
				}
			});
			jQuery.ajax({
				url:_.getAbsoluteUrl('js/FitProfile_Config.json'),
				async:false,
				success: function (result) {
						self.measurement_config = result;
				}
			});
		}
		, fitProfileAdd: function (e) {
			e.preventDefault();
			var self = this;
			var fitprofileModel = new NewFitProfileModel();
			var	formView = new NewFitProfileFormView({
				application: this.application
			,	model: fitprofileModel
			, parentView: this
			, measurement_config: this.measurement_config
			, defaultfavfittools: this.defaultfavfittools
			, bodyBlockMeasurements: this.bodyBlockMeasurements
			, influences: this.influences
			, measurementdefaults: this.measurementdefaults
			, inchConfig: this.inchConfig
			, cmConfig: this.cmConfig
			, presetsConfig: this.presetsConfig
			});
			// jQuery.when().then(jQuery.proxy(formView, 'showInModal'));
			formView.showInModal();
		}
		, FitProfileViewEdit: function (e) {
			e.preventDefault();
			var fpId = jQuery(e.target).data().id;
			var fitprofileModel = new NewFitProfileModel({ internalid: fpId });
			var	formView = new NewFitProfileFormView({
				application: this.application
			,	model: fitprofileModel
			, parentView: this
			, measurement_config: this.measurement_config
			, defaultfavfittools: this.defaultfavfittools
			, bodyBlockMeasurements: this.bodyBlockMeasurements
			, influences: this.influences
			, measurementdefaults: this.measurementdefaults
			, inchConfig: this.inchConfig
			, cmConfig: this.cmConfig
			, presetsConfig: this.presetsConfig
			});
			jQuery.when(fitprofileModel.fetch({data:jQuery.param({action:'get_profile'})})).then(jQuery.proxy(formView, 'showInModal'));
		}
		, alterationsViewEdit: function (e) {
			e.preventDefault();
			var alterationid = jQuery(e.target).data().id;
			// var afm = _.filter(this.alterations.models,function(o){
			// 	return o.get('internalid') == alterationid;
			// });
			var afm = new AlterationModel({ internalid: alterationid });
			var afv = new AlterationFormView({
				model:afm,
				parentView:this,
				application:this.application,
				client:this.model
			});
			jQuery.when(afm.fetch()).then(jQuery.proxy(afv, 'showInModal'));
			// afv.showInModal();
		}
		, alterationsAdd: function (e) {
			e.preventDefault();
			var afm = new AlterationModel();
			var afv = new AlterationFormView({
				model:afm,
				parentView:this,
				application:this.application,
				client:this.model
			});
			jQuery.when().then(jQuery.proxy(afv, 'showInModal'));
			// afv.showInModal();
		}
		//Start Saved Items events
		// Add a particular item into the cart
		// Shows the delete confirmation modal view
	,	askDeleteListItem : function (e)
		{
			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete item').translate()
			,	body: _('Are you sure you want to remove this item?').translate()
			,	confirm_delete_method: 'deleteListItemHandler'
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}
		// Product list item deletion handler
		,	deleteListItemHandler: function (target)
		{
			var self = this
			,	itemid = jQuery(target).closest('article').data('id')
			,	product_list_item = _.find(self.savedItems.models,function(o){
			 		return o.get('internalid') == itemid;
			 	});
				var success = function ()
				{
					if (self.application.getLayout().updateMenuItemsUI)
					{
						self.application.getLayout().updateMenuItemsUI();
					}

					self.deleteConfirmationView.$containerModal.modal('hide');
					// self.render();
					jQuery("#saveForLaterItems").html(SC.macros.saveForLaterMacro(self,self.savedItems));
					self.showConfirmationMessage(_('The item was removed from your product list').translate());

				};
			self.deleteListItem(product_list_item, success);
		}

		// Remove an product list item from the current list
		,	deleteListItem: function (product_list_item, successFunc)
		{
			var self = this;
			this.savedItems.remove(product_list_item);
			product_list_item.url = ProductListItemModel.prototype.url;

			return product_list_item.destroy(successFunc ? {success: successFunc} : null);
		}

	,	addItemToCartHandler : function (e)
		{
			e.preventDefault();
			var self = this;
			var selected_product_list_item_id = jQuery(e.target).data().id
			,	selected_product_list_item = _.find(self.savedItems.models,function(o){
					return o.get('internalid') == selected_product_list_item_id;
				});
			var	selected_item = selected_product_list_item.get('item')
			,	selected_item_internalid = selected_item.internalid
			,	item_detail = self.getItemForCart(selected_item_internalid, selected_product_list_item.get('quantity'));

			item_detail.set('_optionsDetails', selected_item.itemoptions_detail);
			item_detail.setOptionsArray(selected_product_list_item.getOptionsArray(), true);

			item_detail.setOption('custcol_avt_date_needed', '1/1/1900');
			item_detail.setOption('custcol_ps_cart_item_id',"ITEM_" + (Date.now() / 1000 | 0));
			var add_to_cart_promise = this.addItemToCart(item_detail)
			,	whole_promise = null;

			whole_promise = jQuery.when(add_to_cart_promise).then(jQuery.proxy(this, 'showConfirmationHelper', selected_product_list_item));
			if (whole_promise)
			{
				this.disableElementsOnPromise(whole_promise, 'article[data-item-id="' + selected_item_internalid + '"] a, article[data-item-id="' + selected_item_internalid + '"] button');
			}
		}

		// Renders a confirmation message
	,	showConfirmationMessage: function (message)
		{
			this.confirm_message = message;
			var $confirmation_message = this.$('[data-confirm-message]')
			,	$msg_el = jQuery(SC.macros.message(message, 'success', true));

			this.confirm_message = message;
			$confirmation_message.show().empty().append($msg_el);

			setTimeout(function()
			{
				jQuery('[data-confirm-message]').fadeOut(3000);
			}, 10000);
		}
	,	showConfirmationHelper: function(selected_item)
		{
			this.showConfirmationMessage(_('Good! The item was successfully added to your cart. You can continue to <a href="#" data-touchpoint="viewcart">view cart and checkout</a>').translate());
		}
	,	executeAddToCartCallback: function()
		{
			if (!this.addToCartCallback)
			{
				return;
			}

			this.addToCartCallback();
		}
		// Adds the item to the cart
	,	addItemToCart: function (item)
		{
			return this.cart.addItem(item);
		}

		,	getItemForCart: function (id, qty, opts)
			{
				return new ItemDetailsModel({
					internalid: id
				,	quantity: qty
				,	options: opts
				});
			}
		//END Saved Items Events
		//Start Order History Events
		, updateDateNeeded: function (e) {
			e.preventDefault();
			var valueofdate = e.target.value;
			if (valueofdate) {
				var today = new Date(valueofdate);
				var model = _.find(this.orderHistory.models,function(o){
					return o.get('solinekey') == e.target.id;
				})
				if(model){
					model.set('custcol_avt_date_needed', today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear());
					model.save();
				}
			}
		}
		, updateFlag: function(e){
				var id = jQuery(e.target).data().id;
				if(e.target.checked){
					var texthtml = "<input type='text' data-name='flagdetails' data-id='"+id+"' style='width:100%;'>";
					jQuery('.modal-body').html(texthtml)
					jQuery('#modalContainer').modal('show')
				}
				else{
					var model = _.find(this.orderHistory.models,function(o){
						return o.get('solinekey') == id;
					})
					if(model){
						model.set('custcol_flag_comment', '');
						model.set('custcol_flag','F')
						model.save();
					}
				}
		}
		, updateFlagDetails: function(e){
			var id = jQuery('[data-name="flagdetails"]').data().id;
			var model = _.find(this.orderHistory.models,function(o){
				return o.get('solinekey') == id;
			})
			if(model){
				model.set('custcol_flag_comment',  jQuery('[data-name="flagdetails"]').val());
				model.set('custcol_flag','T')
				model.save();
			}

			jQuery(".modal.in").modal("hide");
		}
		//End OrderHistory Events
		, updateClient: function(e){
			e.preventDefault();
			var clientModel = this.model;
			var	formView = new ClientForm({
				application: this.application
			,	model: clientModel
			, parentView: this
			});
			// jQuery.when(clientModel.fetch()).then(jQuery.proxy(formView, 'showInModal'));
			formView.showInModal();
		}
		, deactivateClient: function(e){
			e.preventDefault();
			this.model.destroy().done(function ()
				{
					Backbone.history.navigate('clientlist', {trigger: true});
				}
			);
		}
		, showContent: function () {
			this.options.application.getLayout().showContent(this, 'clientdetails', [{
				text: this.title
			,	href: '/clientdetails/' + this.model.get('internalid')
			}]);
		}

	});
});
