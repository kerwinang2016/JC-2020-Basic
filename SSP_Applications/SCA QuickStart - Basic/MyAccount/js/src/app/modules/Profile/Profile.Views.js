// Profile.Views.js
// -----------------------
/*
Change History   
-------------- 
Date: 28-02-2019
Changed by:Salman Khan
Change /Jira Ticket #: JHD-11
Change Description: Default fit tools can be inputted into the my account section
*/

/*
Change History   
-------------- 
Date: 04-03-2019
Changed by:Shoaib Iqbal
Change /Jira Ticket #: JHD-27
Change Description: Remove Email Preferences section
*/
// Views for profile's operations
define('Profile.Views', function ()
{
	'use strict';

	var Views = {};
	Views.StockList = Backbone.View.extend({
			template: 'stocklist'
		,	title: _('Stock List').translate()
		,	attributes: {'class': 'StockListView'}
		, events: {

		}
		, initialize: function(options){
			this.application = options.application;
			this.model = options.model;
		}
	});
	Views.FavouriteFitTools = Backbone.View.extend({
		 //JHD-11 Start
		template: 'favouritefittools'
	,	title: _('Favourite Fit Tools').translate()
	,	page_header: _('Favourite Fit Tools').translate()
	,	attributes: {'class': 'FavouriteFitTools'}
	, events: {
		'submit #favourite_fit_tools': 'submitFormData'
		, 'change .block-measurement-fld': 'disableCounterBlockField'
	}
	,	showContent: function (isShow)
	{		
		var self = this
			,param = new Object();
		
		self.options.application.getLayout().showContent(self, 'favouritefittools', [{
			text: self.title
		,	href: 'favouritefittools'
		}]);
		if(isShow == true){
			self.showConfirmationMessage(_('Your Favourite Fit Tools was successfully saved').translate());
		}		

	}
	,	submitFormData: function (e)
	{
		e.preventDefault();
		jQuery('input:disabled').removeAttr('disabled'); 
		jQuery('select:disabled').removeAttr('disabled'); 
		var itemType;
		var regex = new RegExp("\\+","g");
		var formValues = jQuery(e.target).serialize().split("&")
			, self = this
			, dataToSend = new Array()
			, tempMeasurementValues = new Array();
			for(var i =0; i< formValues.length; i++){
				var formValue = formValues[i];
				var field = formValue.split("=")[0]
					, value = formValue.split("=")[1];
				if(field == 'fav-fit-tools-itemtype'){ 
					var obj = {};
					obj.itemType = value;
					obj.measurementValues = tempMeasurementValues;
					dataToSend.push(obj);
					tempMeasurementValues = [];
				} else {
					var measureData = new Object();
					measureData.name = field;
					measureData.value = value;
					tempMeasurementValues.push(measureData);
				}
			};
			var param = new Object();
			param.data = JSON.stringify(dataToSend);
			param.type = "save_favourite_fit_tools";
			param.id = this.options.application.getUser().get("internalid");
			_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function(data){
				if(data.replace(/\"/g, "") == self.options.application.getUser().get("internalid").toString()){
					self.options.application.getLayout().currentView.showContent(true)
				} else {
					self.showError(_('Your Favourite Fit Tools not saved').translate())
				}

			});
	}
	, disableCounterBlockField: function (e) {
		var currentField = jQuery(e.target)
			, counterField = currentField.prop("id").indexOf('-max') > -1 ? currentField.prop("id").replace('-max', '-min') : currentField.prop("id").replace('-min', '-max');

		if (counterField && currentField.val() != "0") {
			jQuery("[id='"+counterField+"']").prop("disabled", true);
		} else {
			jQuery("[id='"+counterField+"']").removeProp("disabled");
		}

		// if(jQuery('[id*="body-block"]').val() != 'Select' && jQuery('[id*="body-fit"]').val() != 'Select'){
		// 	this.updateBlockAndFinished(jQuery('[id*="body-fit"]').val(),jQuery('[id*="body-block"]').val())
		// }else{
		// 	//this.clearBlockAndFinished();
		// }
	}
	 //JHD-11 End
	});
	Views.TermsAndConditions = Backbone.View.extend({
			template: 'termsandconditions'
		,	title: _('Terms and Conditions').translate()
		,	attributes: {'class': 'TermsandConditions'}
		, events: {

		}
		, initialize: function(options){
			this.application = options.application;
		}
	});
	Views.ContactUs = Backbone.View.extend({
			template: 'contact'
		,	title: _('Contact Us').translate()
		,	attributes: {'class': 'ContactUs'}
		, events: {

		}
		, initialize: function(options){
			this.application = options.application;
		}
	});
	// home page view
	Views.Home = Backbone.View.extend({

		template: 'home'
	,	title: _('Welcome!').translate()
	,	attributes: {'class': 'ProfileHomeView'}
	,	events: {}

	,	initialize: function (options)
		{
			this.model = options.model;
			this.application = options.application;

			this.customerSupportURL = this.application.getConfig('customerSupportURL');

			this.model.on('change', this.showContent, this);

			this.addresses = this.model.get('addresses');

			this.creditcards = this.model.get('creditcards');

			this.addresses.on('reset destroy change add', this.showContent, this);

			this.creditcards.on('reset destroy change add', this.showContent, this);
		}

	,	destroy: function ()
		{
			this.addresses.off(null, null, this);
			this.creditcards.off(null, null, this);

			this.offEventsOfDefaults();

			this._destroy();
		}

	,	offEventsOfDefaults: function ()
		{
			this.defaultCreditCard && this.defaultCreditCard.off(null, null, this);
			this.defaultShippingAddress && this.defaultShippingAddress.off(null, null, this);
		}

	,	showContent: function ()
		{
			// off events of defaults
			this.offEventsOfDefaults();

			// set the defaults
			this.defaultShippingAddress = this.addresses.findWhere({defaultshipping: 'T'});
			this.defaultCreditCard = this.creditcards.findWhere({ccdefault: 'T'});

			// on events of defaults
			this.defaultShippingAddress && this.defaultShippingAddress.on('change', this.showContent, this);
			this.defaultCreditCard && this.defaultCreditCard.on('change', this.showContent, this);

			this.title = this.model.get('firstname') ? _('Welcome $(0)!').translate(this.model.get('firstname')) : this.title;
			this.application.getLayout().showContent(this, 'home', []);
		}
	});

	// view/edit profile information
	Views.Information = Backbone.View.extend({
		template: 'profile_information'
	,	page_header: _('Profile Information').translate()
	,	title: _('Profile Information').translate()
	,	attributes: {'class': 'ProfileInformationView'}
	,	events: {
			'submit form': 'saveForm'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'blur input[data-type="phone"]': 'formatPhone'
		}

	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
			$target.val(_($target.val()).formatPhone());
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				var message =  _('Profile successfully updated!').translate();
				this.showContent();
				this.$('[data-type="alert-placeholder"]').append(SC.macros.message(message, 'success', true));
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'profileinformation', [{
				text: this.title
			,	href: '/profileinformation'
			}]);

			// prevent copying from the email input to avoid pasting it in the confirmation email field
			this.$('input.no-copy-paste').on('cut copy',function (e)
			{
				e.preventDefault();
			});
		}
	});

	// update user's password view
	Views.UpdateYourPassword = Backbone.View.extend({

		template: 'profile_update_your_password'
	,	page_header: _('Update Your Password').translate()
	,	title: _('Update Your Password').translate()
	,	attributes: {'class': 'ProfileUpdateYourPasswordView'}
	,	events: {
			'submit form': 'updatePassword'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

	,	updatePassword: function (e)
		{
			this.saveForm(e);
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				var message = _('Password successfully updated!').translate();
				this.showContent();
				this.$('[data-type="alert-placeholder"]').html(SC.macros.message(message, 'success', true));
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'updateyourpassword', [{
				text: this.title
			,	href: '/updateyourpassword'
			}]);
		}
	});


	// view for updating emai prefeneces
	/*Views.EmailPreferences = Backbone.View.extend({ JHD-27

		template: 'email_preferences'
	,	title: _('Email Preferences').translate()
	,	page_header: _('Email Preferences').translate()
	,	attributes: {'class': 'ProfileEmailPreferencesView'}
	,	events: {
			'submit form': 'save'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'keyup form:has([data-action="reset"])': 'toggleReset'
		,	'change #emailsubscribe': 'emailSubscribeChange'
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'emailpreferences', [{
				text: this.title
			,	href: 'emailpreferences'
			}]);
		}

	,	showSuccess: function ()
		{
			if (this.$savingForm)
			{
				this.showContent();
				this.$('[data-type="alert-placeholder"]').append(SC.macros.message(_('Email Preferences successfully saved!').translate(), 'success', true));
			}
		}

	,	save: function (e)
		{
			e.preventDefault();

			var	$target = jQuery(e.target)
			,	props = $target.serializeObject()
			,	subscriptions_by_id = {}
			,	campaignsubscriptions = this.model.get('campaignsubscriptions');

			// generate an object with the subscriptions and it's corresponding value
			_.each(props, function (val, key)
			{
				if (~key.indexOf('subscription-'))
				{
					subscriptions_by_id[key.replace('subscription-', '')] = (val === 'T');
				}
			});

			_.each(campaignsubscriptions, function (subscription)
			{
				subscription.subscribed = subscriptions_by_id[subscription.internalid];
			});

			var fixed_props = {
				campaignsubscriptions: campaignsubscriptions
			,	emailsubscribe: props.emailsubscribe === 'T'
			};

			this.saveForm(e, this.model, fixed_props);
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent();
		}

		// if the user doesn't want email notifications we disable all the campaign's checkboxes
	,	emailSubscribeChange: function ()
		{
			var self = this
			,	disabled = !self.$('#emailsubscribe').prop('checked');

			self.$('input[type=checkbox].subscription').prop('disabled', disabled);
		}
	});*/

	Views.DesignOptionsRestriction = Backbone.View.extend({

		template: 'design_options'
	,	title: _('Design Options Restriction').translate()
	,	page_header: _('Design Options Restriction').translate()
	,	attributes: {'class': 'DesignOptionsRestrictionView'}
	,	events: {
		'submit #design_option': 'submitForm'
	}

	,	showContent: function (isShow)
		{
			var self = this
			,	param = new Object();

			param.type = "get_designoption_restriction";
			param.id = self.options.application.getUser().get("internalid");
			_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "GET", param).always(function(data){
				if(data){
					self.values = JSON.parse(JSON.parse(data));
				}

				self.options.application.getLayout().showContent(self, 'designoptionsrestriction', [{
					text: self.title
				,	href: 'designoptionsrestriction'
				}]);
				if(isShow == true){
					self.showConfirmationMessage(_('Your design option restriction was successfully saved').translate());
				}
			});

		}

	,	submitForm: function(e){
			e.preventDefault();
			var formValues = jQuery(e.target).serialize().split("&")
			,	formatValues = []
			,	param = new Object()
			,	self = this;
			_.each(formValues, function(formValue){
				var field = formValue.split("=")[0]
				,	value = formValue.split("=")[1]
				,	formatValue = _.where(formatValues, {name: field});
				value = value.replace(/([+])/g,' ')
				if(formatValue && formatValue.length){
					formatValue[0].value = formatValue[0].value + "," + value;
				} else {
					formatValue = new Object();
					formatValue.name = field;
					formatValue.value = value;

					formatValues.push(formatValue);
				}
			});

			param.data = JSON.stringify(formatValues);
			param.type = "save_designoption_restriction";
			param.id = this.options.application.getUser().get("internalid");

			_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function(data){
				if(data.replace(/\"/g, "") == self.options.application.getUser().get("internalid").toString()){
					self.options.application.getLayout().currentView.showContent(true)
				} else {
					self.showError(_('Your design option restriction was not saved').translate())
				}

			});
		}
	});

	Views.FavouriteOptions = Backbone.View.extend({

		template: 'design_options'
	,	title: _('Favourite Options').translate()
	,	page_header: _('Favourite Options').translate()
	,	attributes: {'class': 'DesignOptionsRestrictionView'}
	,	events: {
			'submit #design_option': 'submitForm'
		,	'change select[data-type="fav-option-customization"]' : 'clearMessage'
		}
	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'favouriteoptions', [{
				text: this.title
			,	href: 'favouriteoptions'
			}]);
		}
	,	parseDataParams : function(){
			var rawArray = jQuery("#design_option").serializeArray();

			var favouriteOptionsMap = {};
			for (var i = 0; i < rawArray.length; i++){
				var option = rawArray[i];
				favouriteOptionsMap[option.name] = option.value;
			};

			return JSON.stringify(favouriteOptionsMap);
		}
	,	clearMessage: function(){
			jQuery("div.alert").remove();
		}
	,	submitForm: function(e){

			e.preventDefault();

			var	param = new Object()
			,	self = this;

			param.data = this.parseDataParams();
			param.type = "save_fav_designoption";
			param.id = this.options.application.getUser().get("internalid");

			_.requestUrl("customscript_ps_sl_set_scafieldset", "customdeploy_ps_sl_set_scafieldset", "POST", param).always(function(data){

				// update model
				self.options.application.getUser().set('favouriteOptions', param.data);
				self.options.application.getLayout().currentView.showContent();
				// show success/error message
				if (data == "\""+param.id+ "\""){
					jQuery("#design_option").prepend(SC.macros.message("Updated Favourite Options", 'success', true));
				} else {
					jQuery("#design_option").prepend(SC.macros.message("There was a problem in updating your Favourite Options", 'error', true));
				}
			});
		}

	});

	return Views;
});
