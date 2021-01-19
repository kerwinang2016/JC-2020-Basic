// FormRenderer.Views.js
// -----------------------
// Views for profile's operations
define('ClientForm.View',  ['Client.Model'], function (ClientModel)
{
	'use strict';

	return Backbone.View.extend({
		template: 'clientform'

	,	title: _('Client Form').translate()

	,	page_header: _('Client Form').translate()

	,	attributes: {
			'class': 'client-form'
		}
	,	events: {
			'click .save-action' : 'saveForm'
		,	'change select[data-type="country"]': 'updateStates'
		,	'change select[data-type="state"]': 'eraseZip'
		,	'change input[data-type="state"]': 'eraseZip'
		,	'blur input[data-type="phone"]': 'formatPhone'
		}
	,	initialize: function(options){
			this.model = options.model;
			this.application = options.application;
			this.parentView = options.parentView;
			this.parent = this.parentView.parent;
		}

	// ,	render: function(){
	// 		this._render();
	// 	}
	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
			$target.val(_($target.val()).formatPhone());
		}

	,	eraseZip: function (e)
		{
			var elem;
			if (e && e.target)
			{
				// For OPC, there are many data-type=zip so grab the first in the current fieldset
				var zip = jQuery(e.target).closest('fieldset').find('input[data-type="zip"]');
				if (zip.length > 0)
				{
					elem = jQuery(zip[0]);
				}
			}
			if (!elem)
			{
				elem = jQuery('input[data-type="zip"]');
			}
			elem.val('');
		}

		// initialize states dropdown
	,	updateStates: function (e)
		{
			this.$('[data-type="state"]').closest('.control-group').empty().append(
				SC.macros.statesDropdown({
					countries: this.options.application.getConfig('siteSettings.countries')
				,	selectedCountry: this.$(e.target).val()
				,	manage: this.options.manage ? this.options.manage + '-' : ''
				})
			);
			this.eraseZip(e);
		}
	,	saveForm : function(e){
			var formValues = jQuery("#in-modal-client_form").serialize().split("&");
			var self = this;
			var dataToSend = new Array();
			var firstname = jQuery('input[name=custrecord_tc_first_name]').val();
			var lastname = jQuery('input[name=custrecord_tc_last_name]').val();
			var email = jQuery('input[name=custrecord_tc_email]').val();
			var phone = jQuery('input[name=custrecord_tc_phone]').val();
			_.each(formValues, function(formValue){
				var field = formValue.split("=")[0],
					value = formValue.split("=")[1];
					switch(field){
						case 'country': field = "custrecord_tc_country";
						break;
						case 'state': field = 'custrecord_tc_state';
					}
					self.model.set(field, decodeURIComponent(value.replace(/\+/g, " ")));
			});
			if(!this.model.validate()){
				if(this.model.get('internalid')){
					this.model.save();

					jQuery(".modal.in").modal("hide");
				}
				else{
					this.model.save().done(function(o){
						var newModel = new ClientModel(o);
						self.options.parentView.model = newModel;
						self.options.parentView.name = newModel.get('custrecord_tc_first_name') + " " + newModel.get('custrecord_tc_last_name');
						self.options.parentView.email = newModel.get('custrecord_tc_email');
						self.options.parentView.phone = newModel.get('custrecord_tc_phone');
						self.options.parentView.collection.reset();
						self.options.parentView.collection.update({
							internalid: newModel.get('internalid'),
							parent: self.options.parentView.parent
						});
						jQuery(".modal.in").modal("hide");
					});
				}
			}
		}
	});
});
