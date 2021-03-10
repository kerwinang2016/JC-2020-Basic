//Models.Init.js
// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js

function isNullOrEmpty(valueStr) {
	return (valueStr == null || valueStr == "" || valueStr == undefined);
}

function isNullOrEmptyObject(obj) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	if (obj.length && obj.length > 0) { return false; }
	for (var key in obj) { if (hasOwnProperty.call(obj, key)) return false; }
	return true;
}

function isObjectExist(objFld) {
	var isObjExist = (typeof objFld != "undefined") ? true : false;
	return isObjExist;
}


/* exported container, session, settings, customer, context, order */
var container = nlapiGetWebContainer()
	, session = container.getShoppingSession()
	//,	settings = session.getSiteSettings()
	, customer = session.getCustomer()
	, context = nlapiGetContext()
	, order = session.getOrder()
	, currentUser = nlapiGetUser()
	, myaccountsuiteleturl = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);

//Model.js
// SiteSettings.js
// ---------------
// Pre-processes the SiteSettings to be used on the site
Application.defineModel('SiteSettings', {

	cache: nlapiGetCache('Application')

	// cache duration time in seconds - by default 2 hours - this value can be between 5 mins and 2 hours
	, cacheTtl: SC.Configuration.cache.siteSettings

	, get: function () {
		'use strict';

		var basic_settings = session.getSiteSettings(['siteid', 'touchpoints']);

		// cache name contains the siteid so each site has its own cache.
		var settings = this.cache.get('siteSettings-' + basic_settings.siteid);

		if (!settings || !this.cacheTtl) {

			var i
				, countries
				, shipToCountries;

			settings = session.getSiteSettings();

			// 'settings' is a global variable and contains session.getSiteSettings()
			if (settings.shipallcountries === 'F') {
				if (settings.shiptocountries) {
					shipToCountries = {};

					for (i = 0; i < settings.shiptocountries.length; i++) {
						shipToCountries[settings.shiptocountries[i]] = true;
					}
				}
			}

			// Get all available countries.
			var allCountries = session.getCountries();

			if (shipToCountries) {
				// Remove countries that are not in the shipping contuntires
				countries = {};

				for (i = 0; i < allCountries.length; i++) {
					if (shipToCountries[allCountries[i].code]) {
						countries[allCountries[i].code] = allCountries[i];
					}
				}
			}
			else {
				countries = {};

				for (i = 0; i < allCountries.length; i++) {
					countries[allCountries[i].code] = allCountries[i];
				}
			}

			// Get all the states for countries.
			var allStates = session.getStates();

			if (allStates) {
				for (i = 0; i < allStates.length; i++) {
					if (countries[allStates[i].countrycode]) {
						countries[allStates[i].countrycode].states = allStates[i].states;
					}
				}
			}

			// Adds extra information to the site settings
			settings.countries = countries;
			settings.phoneformat = context.getPreference('phoneformat');
			settings.minpasswordlength = context.getPreference('minpasswordlength');
			settings.campaignsubscriptions = context.getFeature('CAMPAIGNSUBSCRIPTIONS');
			settings.analytics.confpagetrackinghtml = _.escape(settings.analytics.confpagetrackinghtml);

			// Other settings that come in window object
			settings.groupseparator = window.groupseparator;
			settings.decimalseparator = window.decimalseparator;
			settings.negativeprefix = window.negativeprefix;
			settings.negativesuffix = window.negativesuffix;
			settings.dateformat = window.dateformat;
			settings.longdateformat = window.longdateformat;
			settings.isMultiShippingRoutesEnabled = context.getSetting('FEATURE', 'MULTISHIPTO') === 'T' && SC.Configuration.isMultiShippingEnabled;

			this.cache.put('siteSettings-' + settings.siteid, JSON.stringify(settings), this.cacheTtl);
		}
		else {
			settings = JSON.parse(settings);
		}

		// never cache the following:
		settings.is_logged_in = session.isLoggedIn();
		settings.touchpoints = basic_settings.touchpoints;
		settings.shopperCurrency = session.getShopperCurrency();

		// delete unused fields
		delete settings.entrypoints;

		return settings;
	}
});

//Model.js
// Address.js
// ----------
// Handles fetching, creating and updating addresses
Application.defineModel('Address', {

	// model validation
	validation: {
		addressee: { required: true, msg: 'Full Name is required' }
		, addr1: { required: true, msg: 'Address is required' }
		, country: { required: true, msg: 'Country is required' }
		, state: function (value, attr, computedState) {
			'use strict';

			var country = computedState.country;

			if (country && session.getStates([country]) && value === '') {
				return 'State is required';
			}
		}
		, city: { required: true, msg: 'City is required' }
		, zip: { required: true, msg: 'Zip Code is required' }
		, phone: { required: true, msg: 'Phone Number is required' }
	}

	// our model has "fullname" and "company" insted of  the fields "addresse" and "attention" used on netsuite.
	// this function prepare the address object for sending it to the frontend
	, wrapAddressee: function (address) {
		'use strict';

		if (address.attention && address.addressee) {
			address.fullname = address.attention;
			address.company = address.addressee;
		}
		else {
			address.fullname = address.addressee;
			address.company = null;
		}

		delete address.attention;
		delete address.addressee;

		return address;
	}

	// this function prepare the address object for sending it to the frontend
	, unwrapAddressee: function (address) {
		'use strict';

		if (address.company) {
			address.attention = address.fullname;
			address.addressee = address.company;
		}
		else {
			address.addressee = address.fullname;
			address.attention = null;
		}

		delete address.fullname;
		delete address.company;
		delete address.check;

		return address;
	}

	// return an address by id
	, get: function (id) {
		'use strict';

		return this.wrapAddressee(customer.getAddress(id));
	}

	// return default billing address
	, getDefaultBilling: function () {
		'use strict';

		return _.find(customer.getAddressBook(), function (address) {
			return (address.defaultbilling === 'T');
		});
	}

	// return default shipping address
	, getDefaultShipping: function () {
		'use strict';

		return _.find(customer.getAddressBook(), function (address) {
			return address.defaultshipping === 'T';
		});
	}

	// returns all user's addresses
	, list: function () {
		'use strict';

		var self = this;

		return _.map(customer.getAddressBook(), function (address) {
			return self.wrapAddressee(address);
		});
	}

	// update an address
	, update: function (id, data) {
		'use strict';

		data = this.unwrapAddressee(data);

		// validate the model
		this.validate(data);
		data.internalid = id;

		return customer.updateAddress(data);
	}

	// add a new address to a customer
	, create: function (data) {
		'use strict';

		data = this.unwrapAddressee(data);
		// validate the model
		this.validate(data);

		return customer.addAddress(data);
	}

	// remove an address
	, remove: function (id) {
		'use strict';

		return customer.removeAddress(id);
	}
});

//Model.js
// Profile.js
// ----------------
// This file define the functions to be used on profile service
Application.defineModel('Profile', {

	validation: {
		firstname: { required: true, msg: 'First Name is required' }

		// This code is commented temporally, because of the inconsistences between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
		, lastname: { required: true, msg: 'Last Name is required' }

		, email: { required: true, pattern: 'email', msg: 'Email is required' }
		, confirm_email: { equalTo: 'email', msg: 'Emails must match' }
	}

	, get: function () {
		'use strict';

		var profile = {};

		//Only can you get the profile information if you are logged in.
		if (session.isLoggedIn2()) {

			//Define the fields to be returned
			this.fields = this.fields || ['isperson', 'email', 'internalid', 'name', 'overduebalance', 'phoneinfo', 'companyname', 'firstname', 'lastname', 'middlename', 'emailsubscribe', 'campaignsubscriptions', 'paymentterms', 'creditlimit', 'balance', 'creditholdoverride'];

			profile = customer.getFieldValues(this.fields);

			//Make some attributes more friendly to the response
			profile.phone = profile.phoneinfo.phone;
			profile.altphone = profile.phoneinfo.altphone;
			profile.fax = profile.phoneinfo.fax;
			profile.priceLevel = (session.getShopperPriceLevel().internalid) ? session.getShopperPriceLevel().internalid : session.getSiteSettings(['defaultpricelevel']).defaultpricelevel;
			profile.type = profile.isperson ? 'INDIVIDUAL' : 'COMPANY';
			profile.isGuest = session.getCustomer().isGuest() ? 'T' : 'F';
			profile.currency = session.getShopperCurrency();
			profile.creditlimit = parseFloat(profile.creditlimit || 0);
			profile.creditlimit_formatted = formatCurrency(profile.creditlimit);

			profile.balance = parseFloat(profile.balance || 0);
			profile.balance_formatted = formatCurrency(profile.balance);

			profile.balance_available = profile.creditlimit - profile.balance;
			profile.balance_available_formatted = formatCurrency(profile.balance_available);

			var customerFieldValues = customer.getCustomFieldValues();
			profile.custentity_design_options_restriction = _.find(customerFieldValues, function(field){
				return field.name === "custentity_design_options_restriction";
			}).value;
			profile.enablecustomtailorpricing = _.find(customerFieldValues, function(field){
				return field.name === 'custentity_enable_custom_tailor_pricing';
			}).value;
			profile.taxtype = _.find(customerFieldValues, function(field){
				return field.name === 'custentity_tax_type';
			}).value;
			profile.taxexclusive = _.find(customerFieldValues, function(field){
				return field.name === 'custentity_tax_exclusive';
			}).value;

			profile.hidebillingandcogs = _.find(customerFieldValues, function(field){
				return field.name === 'custentity_hide_billingandcogs';
			}).value;
			profile.surchargediscount = _.find(customerFieldValues, function(field){
				return field.name === 'custentity_surcharge_discount';
			}).value;
			profile.surcharges_make_trim_options = _.find(customerFieldValues, function(field){
	      return field.name === 'custentity_surcharges_make_trims_do';
	    }).value;
			profile.customerFieldValues = customerFieldValues;
			profile.LogoUrl = _.find(customerFieldValues, function (field) {
				return field.name === 'custentity_avt_tailor_logo_url';
			}).value || '/c.3857857/assets/images/avt/default-logo.jpg';
			profile.fit_restriction = _.find(customerFieldValues, function(field){
				return field.name === 'custentity_fit_restriction';
			}).value;
			profile.internalid = nlapiGetUser() + '';

			var url = myaccountsuiteleturl;
			var response = {};
			var res = nlapiRequestURL(url+"&action=getparent&user="+nlapiGetUser());
			var body = JSON.parse(res.getBody());
			profile.parent = body[0];
			profile.parentname = body[1];
			var res = nlapiRequestURL(url+"&action=getstocklist");
			profile.stocklist = JSON.parse(res.getBody());
			res = nlapiRequestURL(url+"&action=getsubtailors&user="+nlapiGetUser());
			body = JSON.parse(res.getBody());
			profile.subtailors = body;
		}

		return profile;
	}

	, update: function (data) {
		'use strict';

		var login = nlapiGetLogin();

		if (data.current_password && data.password && data.password === data.confirm_password) {
			//Updating password
			return login.changePassword(data.current_password, data.password);
		}

		this.currentSettings = customer.getFieldValues();

		//Define the customer to be updated

		var customerUpdate = {
			internalid: parseInt(nlapiGetUser(), 10)
		};

		//Assign the values to the customer to be updated

		customerUpdate.firstname = data.firstname;

		if (data.lastname !== '') {
			customerUpdate.lastname = data.lastname;
		}

		if (this.currentSettings.lastname === data.lastname) {
			delete this.validation.lastname;
		}

		customerUpdate.companyname = data.companyname;


		customerUpdate.phoneinfo = {
			altphone: data.altphone
			, phone: data.phone
			, fax: data.fax
		};

		if (data.phone !== '') {
			customerUpdate.phone = data.phone;
		}

		if (this.currentSettings.phone === data.phone) {
			delete this.validation.phone;
		}

		customerUpdate.emailsubscribe = (data.emailsubscribe && data.emailsubscribe !== 'F') ? 'T' : 'F';

		if (!(this.currentSettings.companyname === '' || this.currentSettings.isperson || session.getSiteSettings(['registration']).registration.companyfieldmandatory !== 'T')) {
			this.validation.companyname = { required: true, msg: 'Company Name is required' };
		}

		if (!this.currentSettings.isperson) {
			delete this.validation.firstname;
			delete this.validation.lastname;
		}

		//Updating customer data
		if (data.email && data.email !== this.currentSettings.email && data.email === data.confirm_email) {
			if (data.isGuest === 'T') {
				customerUpdate.email = data.email;
			}
			else {
				login.changeEmail(data.current_password, data.email, true);
			}
		}

		// Patch to make the updateProfile call work when the user is not updating the email
		data.confirm_email = data.email;

		this.validate(data);
		// check if this throws error
		customer.updateProfile(customerUpdate);

		if (data.campaignsubscriptions) {
			customer.updateCampaignSubscriptions(data.campaignsubscriptions);
		}

		return this.get();

	}
});

//Model.js
// PlacedOrder.js
// ----------
// Handles fetching orders
Application.defineModel('PlacedOrder', {
	saveLine: function(options){
		var recid = options.solinekey.split('_')[0];
		var url = nlapiResolveURL('SUITELET','customscript_update_date_needed',1,true);
		//'https://forms.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=181&deploy=1&compid=3857857&h=bf9b68501c2e0a0da79f&recid=';
		nlapiRequestURL(url + "&recid="+ recid + '&so_id=' + options.so_id + '&custcol_avt_date_needed=' + options.custcol_avt_date_needed + '&custcol_flag='+options.custcol_flag +'&custcol_flag_comment='+options.custcol_flag_comment);

		'use strict';
	}

	, getDesignOptionSurcharges: function(){
	  var filters = [];
		filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
		var cols = [];
		cols.push(new nlobjSearchColumn('custrecord_do_description'));
		cols.push(new nlobjSearchColumn('custrecord_do_code'));
		cols.push(new nlobjSearchColumn('custrecord_do_surcharge'));
		cols.push(new nlobjSearchColumn('custrecord_do_location'));
		cols.push(new nlobjSearchColumn('custrecord_do_itemtype'));
		cols.push(new nlobjSearchColumn('custrecord_sleeveliningsurcharge'));
	  cols.push(new nlobjSearchColumn('custrecord_exempt_from_surcharge'));
	  cols.push(new nlobjSearchColumn('custrecord_dos_exempt_selected_options'));
	  var search = nlapiCreateSearch('customrecord_design_options_surcharge',filters,cols);
	  var resultSet = search.runSearch();
	  var searchid = 0;
	  var do_surcharges, surcharges = [];
	  do{
	    do_surcharges = resultSet.getResults(searchid,searchid+1000);
	    if(do_surcharges && do_surcharges.length > 0){
	      for(var k=0; k<do_surcharges.length; k++){
	        var custom = _.find(surcharges,function(x){return x.name == do_surcharges[k].getValue('custrecord_do_location')});
	    		if(custom){
	    			custom.codes.push(do_surcharges[k].getValue('custrecord_do_code'));
	    			custom.values.push({
	    			code:do_surcharges[k].getValue('custrecord_do_code'),
	    			description:do_surcharges[k].getValue('custrecord_do_description'),
	    			surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
	    			sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge'),
	          exemptfromsurcharge: do_surcharges[k].getValue('custrecord_exempt_from_surcharge').split(','),
	          exemptselectedoptions: do_surcharges[k].getValue('custrecord_dos_exempt_selected_options')
	          });
	    		}
	    		else{
	    		surcharges.push({
	    			name:do_surcharges[k].getValue('custrecord_do_location'),
	    			type:do_surcharges[k].getText('custrecord_do_itemtype'),
	    			codes:[do_surcharges[k].getValue('custrecord_do_code')],
	    			values:[{code:do_surcharges[k].getValue('custrecord_do_code'),
	    			description:do_surcharges[k].getValue('custrecord_do_description'),
	    			surcharge:do_surcharges[k].getValue('custrecord_do_surcharge'),
	    			sleeveliningsurcharge:do_surcharges[k].getValue('custrecord_sleeveliningsurcharge'),
	          exemptfromsurcharge: do_surcharges[k].getValue('custrecord_exempt_from_surcharge').split(','),
	          exemptselectedoptions: do_surcharges[k].getValue('custrecord_dos_exempt_selected_options')
	          }]
	    		});
	    		}
	      }
	      searchid+=1000;
	    }
	  }while(do_surcharges && do_surcharges.length == 1000);
	  return surcharges;
	}
	, getShippingSurcharges: function(){
	  var filters = [], columns = [], shippingcharges = [];
	  filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	  columns.push(new nlobjSearchColumn('custrecord_iscf_product_type'));
	  columns.push(new nlobjSearchColumn('custrecord_iscf_tailor'));
	  columns.push(new nlobjSearchColumn('custrecord_iscf_rate'));

	  //Get the surcharges for calculation of shipping
	  var do_surcharges = nlapiSearchRecord('customrecord_item_shipping_charges',null,filters,columns);

	  for(var k=0; k<do_surcharges.length;k++){
	    //name:location,
	    //values:{[]}
	    shippingcharges.push({
	      tailor:do_surcharges[k].getValue('custrecord_iscf_tailor')
	      ,rate:do_surcharges[k].getValue('custrecord_iscf_rate')
	      ,producttype:do_surcharges[k].getValue('custrecord_iscf_product_type')
	    });
	  }
	  return shippingcharges;
	}
	, getFabricCustomSurcharges: function(){
	  var fabric_surcharges = [], filter = [];
	  filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	  cols = [];
	 			cols.push(new nlobjSearchColumn('custrecord_fi_record'));
	 			cols.push(new nlobjSearchColumn('custrecord_fi_tailor'));
	 			cols.push(new nlobjSearchColumn('custrecord_fi_surcharge_rate'));
	 			var fabric_customsurcharges = [];
	 			var fab_customsurcharges = nlapiSearchRecord('customrecord_fabric_invoice_custom_tailo',null,filter,cols);
	 			if(fab_customsurcharges){
	 			for(var k=0; k<fab_customsurcharges.length;k++){
	 				fabric_customsurcharges.push({
	 					fabricinvoicerecord:fab_customsurcharges[k].getValue("custrecord_fi_record")
	 					,tailor:fab_customsurcharges[k].getValue("custrecord_fi_tailor")
	 					,customsurcharge:fab_customsurcharges[k].getValue("custrecord_fi_surcharge_rate")
	 				});
	 			}
			}
	    return fabric_customsurcharges;
	}
	, getFabricSurcharges: function(){
	  var fabric_surcharges = [], filters = [], columns = [];
	  columns.push(new nlobjSearchColumn('custrecord_fis_producttype'));
	  columns.push(new nlobjSearchColumn('custrecord_fis_code'));
	  columns.push(new nlobjSearchColumn('custrecord_fis_name'));
	  columns.push(new nlobjSearchColumn('custrecord_fis_minimum'));
	  columns.push(new nlobjSearchColumn('custrecord_fis_maximum'));
	  columns.push(new nlobjSearchColumn('custrecord_fis_surchargerate'));
	  var fab_surcharges = nlapiSearchRecord('customrecord_fabric_invoice_surcharge',null,filters,columns);
	  for(var k=0; k<fab_surcharges.length;k++){
	    fabric_surcharges.push({
	      surchargerate:fab_surcharges[k].getValue("custrecord_fis_surchargerate")
	      ,code:fab_surcharges[k].getValue("custrecord_fis_code")
	      ,name:fab_surcharges[k].getValue("custrecord_fis_name")
	      ,min:fab_surcharges[k].getValue('custrecord_fis_minimum')
	      ,max:fab_surcharges[k].getValue("custrecord_fis_maximum")
	      ,producttype:fab_surcharges[k].getValue('custrecord_fis_producttype')
	    });
	  }
	  return fabric_surcharges;
	}

	, getSurcharge:function (ptype,dop,fabric_surcharges,fabric_customsurcharges){
	    var additionalsurcharge = 0, description = "";
	  	if(dop){
	  		var surcharges = _.filter(fabric_surcharges,function(z){
	  			//surchargerate,code,name,min,max,producttype
	  			return z.producttype == ptype;
	  		});
	  		if(surcharges){
	  			for(var i=0;i<surcharges.length;i++){
	  				if(dop.indexOf(surcharges[i].name) != -1){

	  					var customSurcharge = _.find(fabric_customsurcharges,function(z){
	  						return z.fabricinvoicerecord == surcharges[i].internalid && tailor == nlapiGetUser();
	  					});
	  					if(customSurcharge){
	              description = description?", " + surcharges[i].code: surcharges[i].code;
	  						additionalsurcharge += parseFloat(customSurcharge.customsurcharge);
	  					}else{
	              description = description?", " + surcharges[i].code: surcharges[i].code;
	  						additionalsurcharge += parseFloat(surcharges[i].surchargerate?surcharges[i].surchargerate:0);
	  					}
	  				}
	  			}
	  		}
	      return {description: description, rate: additionalsurcharge};
	  	}
		return {description: "No Surcharge", rate:0};
	}
	, getShippingCogs: function(tailorID, line_data, shippingcharges){
	  var clothingtype;
	  var returnObj = {};
	  var totaladditionalsurcharge = 0;
	  returnObj.fabrictext = '<div><b>Shipping</b><div style="padding-left:10px;"><ul>';
	  var ptype = line_data.options.custcol_producttype;
		if(ptype){
			switch(ptype){
				case "2-Piece-Suit": clothingtype = "10"; break;
				case "3-Piece-Suit": clothingtype = "9"; break;
				case "Shirt": clothingtype = "7"; break;
				case "Jacket": clothingtype = "3"; break;
				case "Trouser": clothingtype = "4"; break;
				case "Waistcoat": clothingtype = "6"; break;
				case "Overcoat": clothingtype = "8"; break;
	      case "Short-Sleeves-Shirt": clothingtype = "12"; break;
	      case "Trenchcoat": clothingtype = "13"; break;
	      case "Ladies-Jacket": clothingtype = "14"; break;
	      case "Ladies-Pants": clothingtype = "15"; break;
	      case "Ladies-Skirt": clothingtype = "16"; break;
	      case "L-2PC-Skirt": clothingtype = "17"; break;
	      case "L-3PC-Suit": clothingtype = "18"; break;
	      case "L-2PC-Pants": clothingtype = "19"; break;
	      case "Shorts": clothingtype = '28'; break;
	      case "Morning-Coat": clothingtype = '27'; break;
	      case "Shirt-Jacket": clothingtype = '30'; break;
	      case "Safari-Jacket": clothingtype = '31'; break;
	      case "Camp-Shirt": clothingtype = '29'; break;
			}
			var custom = _.find(shippingcharges,function(x){return x.producttype == clothingtype && x.tailor == tailorID});
			if(custom){
	      //nlapiLogExecution('debug','Has Shipping Charge',custom.rate);
				// shippingamount = parseFloat(shippingamount) + parseFloat(custom.rate);
	      returnObj.fabrictext += "<li>Shipping Charge  " + ptype + " ";
	      returnObj.fabrictext += custom.rate + "</li>";
	      totaladditionalsurcharge += parseFloat(custom.rate);
			}
			else{
				custom = _.find(shippingcharges,function(x){return x.producttype == clothingtype && x.tailor == ''});
				if(custom){
	        //nlapiLogExecution('debug','Has Default Shipping Charge',custom.rate);
					// shippingamount = parseFloat(shippingamount) + parseFloat(custom.rate);
	        returnObj.fabrictext += "<li>Shipping Charge  " + ptype + " ";
	        returnObj.fabrictext += custom.rate + "</li>";
	        totaladditionalsurcharge += parseFloat(custom.rate);
	      }
			}
		}
	  returnObj.fabrictext += "</ul></div></div>";
	  return {text: returnObj.fabrictext, amount: totaladditionalsurcharge};
	}
	, getFabricCogs: function(tailorID,line_data,requestfields, fabric_surcharges,fabric_customsurcharges){
	  //nlapiLogExecution('debug','GetFabric COGS');
	  var self = this;
	  var totaladditionalsurcharge = 0;
	  var customerfields = requestfields.customerfields;
		var itemfields = requestfields.itemfields;
	  var currentRate = itemfields.price;
	  var currentAmount = itemfields.price;

	  var returnObj = {};
		returnObj.fabrictext = '<div><b>Fabric</b><div style="padding-left:10px;"><ul>';
	  var ptype = line_data.options.custcol_producttype;
	  // nlapiLogExecution('debug','itemfields.vendor',itemfields.vendor);
		if(itemfields.vendor == '17' || itemfields.vendor == '671'){
	    var fabCollection = itemfields.custitem_fabric_collection;
			var prodType = line_data.options.custcol_producttype;
			var currentPricelevel = customerfields.pricelevel;
			if(fabCollection && prodType && currentPricelevel != ""){
	      var prodTypeId = "";
				switch(prodType){
					case 'Jacket': prodTypeId = '3'; break;
					case 'Trouser': prodTypeId = '4'; break;
					case 'Waistcoat': prodTypeId = '6'; break;
					case 'Overcoat': prodTypeId = '8'; break;
					case 'Shirt': prodTypeId = '7'; break;
					case '3-Piece-Suit': prodTypeId = '9'; break;
					case '2-Piece-Suit': prodTypeId = '10'; break;
	        case "Short-Sleeves-Shirt": prodTypeId = "12"; break;
	        case "Trenchcoat": prodTypeId = "13"; break;
	        case "Ladies-Jacket": prodTypeId = "14"; break;
	        case "Ladies-Pants": prodTypeId = "15"; break;
	        case "Ladies-Skirt": prodTypeId = "16"; break;
	        case "L-2PC-Skirt": prodTypeId = "17"; break;
	        case "L-3PC-Suit": prodTypeId = "18"; break;
	        case "L-2PC-Pants": prodTypeId = "19"; break;
	        case "Shorts": prodTypeId = '28'; break;
	        case "Morning-Coat": prodTypeId = '27'; break;
	        case "Shirt-Jacket": prodTypeId = '30'; break;
	        case "Safari-Jacket": prodTypeId = '31'; break;
	        case "Camp-Shirt": prodTypeId = '29'; break;
				}

	      //nlapiLogExecution('debug','custrecord_dtp_producttype',prodTypeId);
				if(prodTypeId != ""){

					var filters = [];
					filters.push(new nlobjSearchFilter('custrecord_dtp_fab_collection',null,'is',fabCollection));
					filters.push(new nlobjSearchFilter('custrecord_dtp_pricelevel',null,'anyof',currentPricelevel));
					filters.push(new nlobjSearchFilter('custrecord_dtp_producttype',null,'anyof',prodTypeId));
					var dpl_results = nlapiSearchRecord('customrecord_dayang_pricing',null,filters,new nlobjSearchColumn('custrecord_dtp_price'));

	        if(dpl_results && dpl_results.length >0){
						returnObj.fabrictext += "<li>"+itemfields.item + " ";
						returnObj.fabrictext += dpl_results[0].getValue('custrecord_dtp_price')?dpl_results[0].getValue('custrecord_dtp_price'):0;
	          returnObj.fabrictext += "</li>";
	          totaladditionalsurcharge += parseFloat(dpl_results[0].getValue('custrecord_dtp_price')?dpl_results[0].getValue('custrecord_dtp_price'):0);
					}else{
						returnObj.fabrictext += "<li>"+itemfields.item + " ";
						returnObj.fabrictext += parseFloat(itemfields.price) + "</li>";
	          totaladditionalsurcharge += parseFloat(itemfields.price);
					}
				}else{
					returnObj.fabrictext += "<li>"+itemfields.item + " ";
					returnObj.fabrictext += parseFloat(itemfields.price) + "</li>";
	        totaladditionalsurcharge += parseFloat(itemfields.price);
				}
	    }else{
				returnObj.fabrictext += "<li>"+itemfields.item + " ";
				returnObj.fabrictext += parseFloat(itemfields.price).toFixed(2) + "</li>";
	      totaladditionalsurcharge += parseFloat(itemfields.price);
			}
	    currentAmount = totaladditionalsurcharge;
	  }
	  else{
			//The vendor is not Jerome... get the prices and the quantity computation
			var quantity = {
				'2-Piece-Suit' : '3.3',
				'3-Piece-Suit': '3.7',
				'Jacket': '1.9',
				'Trouser': '1.75',
				'Waistcoat': '1',
				'Overcoat': '2.5',
				'Shirt': '2',
				'Trenchcoat': '2.5',
				'Short-Sleeves-Shirt': '2',
				'Ladies-Jacket': '1.8',
				'Ladies-Pants': '1.75',
				'Ladies-Skirt': '1',
				'L-2PC-Skirt': '2.5',
				'L-3PC-Suit': '3.9',
				'L-2PC-Pants': '3.1',
	      'Shorts': '1.1',
	      'Morning-Coat': '2.2',
	      'Shirt-Jacket': '2.2',
	      'Camp-Shirt': '2',
	      'Safari-Jacket': '2'
			};
			currency = customerfields.currency;
			var currentPricelevel = customerfields.pricelevel;
			var fabric_quantity = line_data.options.custcol_fabric_quantity;
			var itemID = line_data.item.internalid;
	    //nlapiLogExecution('debug','PRICE ', itemfields.price);
			if(itemfields.price != ""){
				var price = parseFloat(itemfields.price);
				var itemtype = line_data.options.custcol_producttype;
	      if(quantity[itemtype])
	      currentAmount = price * parseFloat(quantity[itemtype]);
				currentRate = currentAmount/parseFloat(fabric_quantity);
	      currentAmount = Math.round(currentAmount);
				returnObj.fabrictext += "<li>"+itemfields.item + " ";
				returnObj.fabrictext += currentAmount.toFixed(2) + "</li>";
	      totaladditionalsurcharge += parseFloat(currentAmount);
			}
	  }
	  //nlapiLogExecution('debug','CURRENT RATE',currentRate);
		if(line_data.options.custcol_producttype){
			//Check Fabric Prices based on block types 2/8/2019
			var fpsummary = line_data.options.custcol_fitprofile_summary;
			var fabricextra = line_data.options.custcol_fabric_extra;
			var ptype = line_data.options.custcol_producttype;

			var fpsJSON = JSON.parse(fpsummary);
			if(fpsJSON && fpsJSON.length>0){
				//Check for Block,
				var maxblockvalue = 0;
				for(var h =0;h<fpsJSON.length;h++){
					//get the max block value;
					if(fpsJSON[h].blockvalue && parseFloat(fpsJSON[h].blockvalue.substr(0,2)) > maxblockvalue)
						maxblockvalue = parseFloat(fpsJSON[h].blockvalue.substr(0,2));
				}
				if(maxblockvalue > 0){
					var blockSurcharges = _.filter(fabric_surcharges,function(z){
						//surchargerate,code,name,min,max,producttype
						return z.name == 'Block' && z.producttype == ptype &&
						( parseFloat(z.min) <= maxblockvalue && parseFloat(z.max) >= maxblockvalue);
					});
					if(blockSurcharges.length>0){
	          var customSurcharge = _.find(fabric_customsurcharges, function(z) {
	            return z.fabricinvoicerecord == blockSurcharges[0].internalid && tailor == z.tailor;
	          });
	          if (customSurcharge) {
	            returnObj.fabrictext += "<li>Large Size Surcharge ";
	            returnObj.fabrictext += (parseFloat(currentAmount) * customSurcharge.customsurcharge).toFixed(2);
	            totaladditionalsurcharge += parseFloat(customSurcharge.customsurcharge);
	          } else {
	  					returnObj.fabrictext += "<li>Large Size Surcharge ";
	  					returnObj.fabrictext += parseFloat(currentAmount * parseFloat(blockSurcharges[0].surchargerate)).toFixed(2) + "</li>";

	  					totaladditionalsurcharge += parseFloat(currentAmount * blockSurcharges[0].surchargerate);
	          }
					}
				}
				var itemtypes = [];
	      var ptype = line_data.options.custcol_producttype;
	      //Design Options //Unlined Turnup, Backwith Fabric
				if(ptype == '3-Piece-Suit'){
					var j_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_jacket,fabric_surcharges,fabric_customsurcharges);
					var t_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_trouser,fabric_surcharges,fabric_customsurcharges);
					var w_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_waistcoat,fabric_surcharges,fabric_customsurcharges);
					if(j_surcharge.rate != 0){
						returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
						returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
					}
					if(t_surcharge.rate != 0){
						returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
						returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount *  t_surcharge.rate);
					}
					if(w_surcharge.rate != 0){
						returnObj.fabrictext += "<li>"+w_surcharge.description + " ";
						returnObj.fabrictext += (currentAmount * w_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += (currentAmount *  w_surcharge.rate);
					}
				}else if(ptype == '2-Piece-Suit'){
					var j_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_jacket,fabric_surcharges,fabric_customsurcharges);
					var t_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_trouser,fabric_surcharges,fabric_customsurcharges);
					if(j_surcharge.rate != 0){
	          // nlapiLogExecution('debug','JSURCHARGE',JSON.stringify(j_surcharge));
						returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
						returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
					}
					if(t_surcharge.rate != 0){
						returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
						returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * t_surcharge.rate);
					}
				}else if(ptype == 'L-2PC-Pants'){
					var j_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesjacket,fabric_surcharges,fabric_customsurcharges);
					var t_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiespants,fabric_surcharges,fabric_customsurcharges);
	        if(j_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
	        }
	        if(t_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * t_surcharge.rate);
	        }
				}
				else if(ptype == 'L-3PC-Suit'){
					var j_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesjacket,fabric_surcharges,fabric_customsurcharges);
					var t_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiespants,fabric_surcharges,fabric_customsurcharges);
					var sk_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesskirt,fabric_surcharges,fabric_customsurcharges);
	        if(j_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
	        }
	        if(t_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * t_surcharge.rate);
	        }
	        if(sk_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+sk_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * sk_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * sk_surcharge.rate);
	        }
				}
				else if(ptype == 'L-2PC-Skirt'){
					var j_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesjacket,fabric_surcharges,fabric_customsurcharges);
					var t_surcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesskirt,fabric_surcharges,fabric_customsurcharges);
	        if(j_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+j_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * j_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * j_surcharge.rate);
	        }
	        if(t_surcharge.rate != 0){
	          returnObj.fabrictext += "<li>"+t_surcharge.description + " ";
	          returnObj.fabrictext += (currentAmount * t_surcharge.rate).toFixed(2) + "</li>";
	          totaladditionalsurcharge += parseFloat(currentAmount * t_surcharge.rate);
	        }
				}else{
					var singlesurcharge = {rate:0};
					if(fpsJSON[0].name == 'Jacket'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_jacket,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Trouser'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_trouser,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Waistcoat'){
	          singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_waistcoat,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Overcoat'){
	          singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_overcoat,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Ladies-Jacket'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesjacket,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Ladies-Pants'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiespants,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Ladies-Skirt'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ladiesskirt,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Trenchcoat'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_trenchcoat,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Short-Sleeves-Shirt'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_ssshirt,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Shorts'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_shorts,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Morning-Coat'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_morning_coat,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Safari-Jacket'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_safari_jacket,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Shirt-Jacket'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_shirt_jacket,fabric_surcharges,fabric_customsurcharges);
					}else if(fpsJSON[0].name == 'Camp-Shirt'){
						singlesurcharge = self.getSurcharge(ptype,line_data.options.custcol_designoptions_camp_shirt,fabric_surcharges,fabric_customsurcharges);
					}
					if(singlesurcharge.rate != 0){
						returnObj.fabrictext += "<li>"+singlesurcharge.description + " ";
						returnObj.fabrictext += (currentAmount * singlesurcharge.rate).toFixed(2) + "</li>";

	          totaladditionalsurcharge += parseFloat(currentAmount * singlesurcharge.rate);
					}
				}
			}
			//Check for fabric extra
			var fextra = line_data.options.custcol_fabric_extra;
			if(fextra){
				var fextraSurcharges = _.filter(fabric_surcharges,function(z){
					//surchargerate,code,name,min,max,producttype
					return z.code == 'Fabric Design' && z.producttype == ptype &&
					z.name == fextra;
				});
				if(fextraSurcharges.length>0){
	        //nlapiLogExecution('debug','HAS FaBric design',fextraSurcharges[0].name)
					returnObj.fabrictext += "<li>"+fextraSurcharges[0].name + " ";
					returnObj.fabrictext += (currentAmount * parseFloat(fextraSurcharges[0].surchargerate)).toFixed(2) + "</li>";
	        //nlapiLogExecution('debug','fextraSurcharges[0].surchargerate ', fextraSurcharges[0].surchargerate);
					totaladditionalsurcharge += parseFloat(currentAmount * fextraSurcharges[0].surchargerate);
				}
			}
		}
	  returnObj.fabrictext += '</ul></div></div>';
	  return {text: returnObj.fabrictext, amount: totaladditionalsurcharge};
	}
	, getCMTCogs: function(tailorID,line_data,requestfields, surcharges){
	  var customerfields = requestfields.customerfields;
		var itemfields = requestfields.itemfields;
	  var tailorCMTPrefMasterID = customerfields.custentity_jerome_cmt_service_preference;
	  var tailorCMTPrefMaster = tailorCMTPrefMasterID && tailorCMTPrefMasterID == 2 ? "Premium CMT":"Basic CMT";
	  var totaladditionalsurcharge = 0;
	  //nlapiLogExecution('debug','tailorCMTPrefMaster',tailorCMTPrefMaster)
	  var tailorSurchargeDisc = customerfields.custentity_surcharge_discount;
	  if(!tailorSurchargeDisc) tailorSurchargeDisc = 0;
	  var fabrictext = '<div><b>CMT</b><div style="padding-left:10px;"><ul>';
	  var arItemType = line_data.options.custcol_producttype;
	  //nlapiLogExecution('debug','cmtcogs ptype', arItemType);
	  var tailorCMTDisc = 0;
		if(arItemType){
			if(arItemType == '2-Piece-Suit'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_2pc;
			}
			else if(arItemType == '3-Piece-Suit'){//if(itemTypeArray.length == 3){
				tailorCMTDisc = customerfields.custentity_cmt_discount_3pc;
			}
			else if(arItemType == 'Shirt'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_shirt;
			}
			else if(arItemType == 'Jacket'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_jacket;
			}
			else if(arItemType == 'Trouser'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_trouser;
			}
			else if(arItemType == 'Waistcoat'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_waistcoat;
			}
			else if(arItemType == 'Overcoat'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_overcoat;
			}
	    else if(arItemType == 'Short-Sleeves-Shirt'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_ss_shirt;
			}
	    else if(arItemType == 'Trenchcoat'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_trenchcoat;
			}
	    else if(arItemType == 'Ladies-Jacket'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_ladies_jacket;
			}
	    else if(arItemType == 'Ladies-Pants'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_ladies_pants;
			}
	    else if(arItemType == 'Ladies-Skirt'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_ladies_skirt;
			}
	    else if(arItemType == 'L-2PC-Skirt'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_l2pc_skirt;
			}
	    else if(arItemType == 'L-3PC-Suit'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_l3pc_suit;
			}
	    else if(arItemType == 'L-2PC-Pants'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_l2pc_pants;
			}else if(arItemType == 'Shorts'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_shorts;
			}else if(arItemType == 'Morning-Coat'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_morning_coat;
			}else if(arItemType == 'Shirt-Jacket'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_shirt_jacket;
			}else if(arItemType == 'Safari-Jacket'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_safari_jacket;
			}else if(arItemType == 'Camp-Shirt'){
				tailorCMTDisc = customerfields.custentity_cmt_discount_camp_shirt;
			}
		}
		if (!tailorCMTDisc){
			tailorCMTDisc = 0;
		}
	  var surchargeamount = 0;
	  var surchargedescription = "";
	  if(line_data.options.custcol_designoptions_safari_jacket){
	    var itemsurcharges = surcharges.filter(function(i){return i.type == "Safari-Jacket";});
	    var dop = JSON.parse(line_data.options.custcol_designoptions_safari_jacket);
	    //Lets get the lining surcharge and find out what type of surcharge it is
	    var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
	    var LiningSurcharge;

	    var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
	    if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
	      LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
	    }
	    for(var kk=0;kk<itemsurcharges.length;kk++){
	      var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
	      if(dop_value){
	        var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
	        //We have a match on design options and the value in the table.
	        if(dop_surcharge){
	          //Check for Sleeve Linings
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	          if(dop_surcharge.code == 'T01692102' && itemsurcharges[kk].name == 'T016921'){
	            //Find the Sleeve Dependent
	            if(LiningSurcharge){
	              var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
	              if(isExempt)
	                surcharge = 0;
	              surcharge = Math.round(surcharge);
	              surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	              surchargedescription += "<li>Safari Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	            }
	          }else{
	            var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
	                surcharge = 0;
	            surcharge = Math.round(surcharge);
	            surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	            surchargedescription += "<li>Safari Jacket " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	          }
	        }
	      }
	    }
	  }
	  if(line_data.options.custcol_designoptions_camp_shirt){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Camp-Shirt";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_camp_shirt);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	  			surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Camp Shirt " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_shirt_jacket){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt-Jacket";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_shirt_jacket);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	  			surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Shirt Jacket " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_morning_coat){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Morning-Coat";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_morning_coat);
	  	//Lets get the lining surcharge and find out what type of surcharge it is
	  	var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
	  	var LiningSurcharge;

	  	var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
	  	if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
	  		LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
	  	}
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
	  			//We have a match on design options and the value in the table.
	  			if(dop_surcharge){
	  				//Check for Sleeve Linings
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  				if(dop_surcharge.code == 'T01492503' && itemsurcharges[kk].name == 'T014925'){
	  					//Find the Sleeve Dependent
	  					if(LiningSurcharge){
	  						var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
	              if(isExempt)
									surcharge = 0;
	              surcharge = Math.round(surcharge);
	  						surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  						surchargedescription += "<li>Morning Coat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	  					}
	  				}else{
	  					var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
									surcharge = 0;
	            surcharge = Math.round(surcharge);
	  					surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  					surchargedescription += "<li>Morning Coat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	  				}
	  			}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_shorts){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Shorts";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_shorts);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	  			surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Shorts " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_jacket){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Jacket";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_jacket);
	  	//Lets get the lining surcharge and find out what type of surcharge it is
	  	var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-j'});
	  	var LiningSurcharge;

	  	var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-j'});
	  	if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
	  		LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
	  	}
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
	  			//We have a match on design options and the value in the table.
	  			if(dop_surcharge){
	  				//Check for Sleeve Linings
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;

	          if(dop_surcharge.exemptselectedoptions){
	            var exemptselectedoptionsJSON = JSON.parse(dop_surcharge.exemptselectedoptions);
	            var keys = Object.keys(exemptselectedoptionsJSON);
	            for(var a=0;a<keys.length;a++){
	                var foundexemption = _.find(dop,function(x){return x.name == keys[a] && x.value == exemptselectedoptionsJSON[keys[a]]});
	                if(foundexemption){
	                  isExempt = true;
	                  break;
	                }
	            }
	          }
	  				if(dop_surcharge.code == 'T01022502' && itemsurcharges[kk].name == 'T010225'){
	  					//Find the Sleeve Dependent
	  					if(LiningSurcharge){
	  						var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
	              if(isExempt)
									surcharge = 0;
	              surcharge = Math.round(surcharge);
	  						surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  						surchargedescription += "<li>Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	  					}
	  				}else{
	  					var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
									surcharge = 0;
	            surcharge = Math.round(surcharge);
	  					surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  					surchargedescription += "<li>Jacket " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	  				}
	  			}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_waistcoat){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Waistcoat";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_waistcoat);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	  			surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Waistcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_trouser){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Trouser";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_trouser);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	        surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Trouser " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_overcoat){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Overcoat";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_overcoat);
	  	//Lets get the lining surcharge and find out what type of surcharge it is
	  	var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-bl-o'});
	  	var LiningSurcharge;

	  	var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-bl-o'});
	  	if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
	  		LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
	  	}
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  				//Check for Sleeve Linings
	  				if(dop_surcharge.code == 'T01041202' && itemsurcharges[kk].name == 'T010412'){
	  					//Find the Sleeve Dependent
	  					if(LiningSurcharge){
	              var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
	              if(isExempt)
									surcharge = 0;
	              surcharge = Math.round(surcharge);
	  						surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  						surchargedescription += "<li>Overcoat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	  					}
	  				}else{
	  					var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
									surcharge = 0;
	            surcharge = Math.round(surcharge);
	  					surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  					surchargedescription += "<li>Overcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	  				}
	  			}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_shirt){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Shirt";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_shirt);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	  			surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Shirt " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_ssshirt){
	  	var itemsurcharges = surcharges.filter(function(i){return i.type == "Short-Sleeves-Shirt";});
	  	var dop = JSON.parse(line_data.options.custcol_designoptions_ssshirt);
	  	for(var kk=0;kk<itemsurcharges.length;kk++){
	  		var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	  		if(dop_value){
	  			var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	  			if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	  			var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
									surcharge = 0;
	        surcharge = Math.round(surcharge);
	  			surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	  			surchargedescription += "<li>Short-Sleeves-Shirt " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"</li>";}
	  		}
	  	}
	  }
	  if(line_data.options.custcol_designoptions_ladiesjacket){
	    var itemsurcharges = surcharges.filter(function(i){return i.type == "Ladies-Jacket";});
	    var dop = JSON.parse(line_data.options.custcol_designoptions_ladiesjacket);
	    //Lets get the lining surcharge and find out what type of surcharge it is
	    var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-b-lj'});
	    var LiningSurcharge;

	    var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-b-lj'});
	    if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
	      LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
	    }
	    for(var kk=0;kk<itemsurcharges.length;kk++){
	      var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
	      if(dop_value){
	        var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
	        //We have a match on design options and the value in the table.
	        if(dop_surcharge){
	          //Check for Sleeve Linings
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	          if(dop_surcharge.code == 'T02722801' && itemsurcharges[kk].name == 'T027228'){
	            //Find the Sleeve Dependent
	            if(LiningSurcharge){
	              var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
	              if(isExempt)
	                surcharge = 0;
	              surcharge = Math.round(surcharge);
	              surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	              surchargedescription += "<li>Ladies-Jacket Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	            }
	          }else{
	            var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
	                surcharge = 0;
	            surcharge = Math.round(surcharge);
	            surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	            surchargedescription += "<li>Ladies-Jacket " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	          }
	        }
	      }
	    }
	  }

	  if(line_data.options.custcol_designoptions_ladiespants){
	    var itemsurcharges = surcharges.filter(function(i){return i.type == "Ladies-Pants";});
	    var dop = JSON.parse(line_data.options.custcol_designoptions_ladiespants);
	    for(var kk=0;kk<itemsurcharges.length;kk++){
	      var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name})
	      if(dop_value){
	        var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value})
	        if(dop_surcharge){
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	        var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	        if(isExempt)
	                surcharge = 0;
	        surcharge = Math.round(surcharge);
	        surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	        surchargedescription += "<li>Ladies-Pants " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2) +"</li>";}
	      }
	    }
	  }
	  if(line_data.options.custcol_designoptions_ladiesskirt){
	    var itemsurcharges = surcharges.filter(function(i){return i.type == "Ladies-Skirt";});
	    var dop = JSON.parse(line_data.options.custcol_designoptions_ladiesskirt);
	    //Lets get the lining surcharge and find out what type of surcharge it is
	    var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-fo-ls'});

	    for(var kk=0;kk<itemsurcharges.length;kk++){
	      var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
	      if(dop_value){
	        var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
	        //We have a match on design options and the value in the table.
	        if(dop_surcharge){
	          //Check for Sleeve Linings
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;

	            var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
	                surcharge = 0;
	            surcharge = Math.round(surcharge);
	            surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	            surchargedescription += "<li>Ladies-Skirt " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";

	        }
	      }
	    }
	  }
	  if(line_data.options.custcol_designoptions_trenchcoat){
	    var itemsurcharges = surcharges.filter(function(i){return i.type == "Trenchcoat";});
	    var dop = JSON.parse(line_data.options.custcol_designoptions_trenchcoat);
	    //Lets get the lining surcharge and find out what type of surcharge it is
	    var dop_liningsurcharge = _.find(dop,function(x){return x.name == 'li-bl-tc'});
	    var LiningSurcharge;

	    var itemsurcharge_Liningsurcharge = _.find(itemsurcharges,function(x){return x.name == 'li-bl-tc'});
	    if(itemsurcharge_Liningsurcharge && dop_liningsurcharge){
	      LiningSurcharge = _.find(itemsurcharge_Liningsurcharge.values,function(x){ return x.code == dop_liningsurcharge.value;});
	    }
	    for(var kk=0;kk<itemsurcharges.length;kk++){
	      var dop_value = _.find(dop,function(x){return x.name == itemsurcharges[kk].name});
	      if(dop_value){
	        var dop_surcharge = _.find(itemsurcharges[kk].values,function(x){return x.code == dop_value.value});
	        //We have a match on design options and the value in the table.
	        if(dop_surcharge){
	          //Check for Sleeve Linings
	          var isExempt = dop_surcharge.exemptfromsurcharge.indexOf(currentUser.toString())!=-1?true:false;
	          if(dop_surcharge.code == 'T01161402' && itemsurcharges[kk].name == 'T011614'){
	            //Find the Sleeve Dependent
	            if(LiningSurcharge){
	              var surcharge = (parseFloat(LiningSurcharge.sleeveliningsurcharge)+ parseFloat(LiningSurcharge.sleeveliningsurcharge*tailorSurchargeDisc/100)).toFixed(2);
	              if(isExempt)
	                surcharge = 0;
	              surcharge = Math.round(surcharge);
	              surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	              surchargedescription += "<li>Trenchcoat Sleeve " + LiningSurcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	            }
	          }else{
	            var surcharge = (parseFloat(dop_surcharge.surcharge)+ parseFloat(dop_surcharge.surcharge*tailorSurchargeDisc/100)).toFixed(2);
	            if(isExempt)
	                surcharge = 0;
	            surcharge = Math.round(surcharge);
	            surchargeamount = (parseFloat(surchargeamount) + parseFloat(surcharge)).toFixed(2);
	            surchargedescription += "<li>Trenchcoat " + dop_surcharge.description + " " + parseFloat(surcharge).toFixed(2)+"</li>";
	          }
	        }
	      }
	    }
	  }
	  var tailorCMTPref;
	  if (typeof arItemType === 'string' && arItemType == 'Shirt'){
	  	tailorCMTPref = 'Basic CMT';
	  } else {
	  	tailorCMTPref = tailorCMTPrefMaster;
	  }
			var cmtServiceItem;
			var cmtServicePrice;
			switch (tailorCMTPref){
				case 'Premium CMT':
					if(arItemType){
						if(arItemType == '2-Piece-Suit'){
							cmtServiceItem = '9910';
						}
						else if(arItemType == '3-Piece-Suit'){
							cmtServiceItem = '9911';
						}
						else if(arItemType == 'Shirt'){
							cmtServiceItem = '9909';
						}
						else if(arItemType == 'Jacket'){
							cmtServiceItem = '9905';
						}
						else if(arItemType == 'Trouser'){
							cmtServiceItem = '9906';
						}
						else if(arItemType == 'Waistcoat'){
							cmtServiceItem = '9907';
						}
						else if(arItemType == 'Overcoat'){
							cmtServiceItem = '9908';
						}
	          else if(arItemType == 'Trenchcoat'){
							cmtServiceItem = '292321';
						}
	          else if(arItemType == 'Short-Sleeves-Shirt'){
							cmtServiceItem = '292329';
						}
	          else if(arItemType == 'Ladies-Skirt'){
							cmtServiceItem = '292326';
						}
	          else if(arItemType == 'Ladies-Jacket'){
							cmtServiceItem = '292328';
						}
	          else if(arItemType == 'Ladies-Pants'){
							cmtServiceItem = '292327';
						}
	          else if(arItemType == 'L-3PC-Suit'){
							cmtServiceItem = '292332';
						}
	          else if(arItemType == 'L-2PC-Pants'){
							cmtServiceItem = '292331';
						}
	          else if(arItemType == 'L-2PC-Skirt'){
							cmtServiceItem = '292330';
						}else if(arItemType == 'Shorts'){
							cmtServiceItem = '296338';
						}else if(arItemType == 'Morning-Coat'){
							cmtServiceItem = '296339';
						}else if(arItemType == 'Safari-Jacket'){
							cmtServiceItem = '296340';
						}else if(arItemType == 'Shirt-Jacket'){
							cmtServiceItem = '296341';
						}else if(arItemType == 'Camp-Shirt'){
							cmtServiceItem = '296342';
						}
					}
	        //TODO: Lookup the item price for the cmt item
	        var serviceitemfieldsStr = nlapiRequestURL(nlapiResolveURL('suitelet','customscript_myaccountsuitelet','customdeploy1','external'),
	        {action:'getserviceitemfields',item:cmtServiceItem}).getBody();
	        var serviceitemfields = JSON.parse(serviceitemfieldsStr);
					cmtServicePrice = serviceitemfields.custitem_jerome_cmt_basic_price;
					break;
				case 'Basic CMT':
				default:
					if(arItemType){
						if(arItemType == '2-Piece-Suit'){
							cmtServiceItem = '9903';
						}
						else if(arItemType == '3-Piece-Suit'){
							cmtServiceItem = '9904';
						}
						else if(arItemType == 'Shirt'){
							cmtServiceItem = '9902';
						}
						else if(arItemType == 'Jacket'){
							cmtServiceItem = '9898';
						}
						else if(arItemType == 'Trouser'){
							cmtServiceItem = '9899';
						}
						else if(arItemType == 'Waistcoat'){
							cmtServiceItem = '9900';
						}
						else if(arItemType == 'Overcoat'){
							cmtServiceItem = '9901';
						}
	          else if(arItemType == 'Trenchcoat'){
							cmtServiceItem = '292321';
						}
	          else if(arItemType == 'Short-Sleeves-Shirt'){
							cmtServiceItem = '292329';
						}
	          else if(arItemType == 'Ladies-Skirt'){
							cmtServiceItem = '292326';
						}
	          else if(arItemType == 'Ladies-Jacket'){
							cmtServiceItem = '292328';
						}
	          else if(arItemType == 'Ladies-Pants'){
							cmtServiceItem = '292327';
						}
	          else if(arItemType == 'L-3PC-Suit'){
							cmtServiceItem = '292332';
						}
	          else if(arItemType == 'L-2PC-Pants'){
							cmtServiceItem = '292331';
						}
	          else if(arItemType == 'L-2PC-Skirt'){
							cmtServiceItem = '292330';
						}else if(arItemType == 'Shorts'){
							cmtServiceItem = '296338';
						}else if(arItemType == 'Morning-Coat'){
							cmtServiceItem = '296339';
						}else if(arItemType == 'Safari-Jacket'){
							cmtServiceItem = '296340';
						}else if(arItemType == 'Shirt-Jacket'){
							cmtServiceItem = '296341';
						}else if(arItemType == 'Camp-Shirt'){
							cmtServiceItem = '296342';
						}
					}
	        var serviceitemfieldsStr = nlapiRequestURL(nlapiResolveURL('suitelet','customscript_myaccountsuitelet','customdeploy1','external'),
	        {action:'getserviceitemfields',item:cmtServiceItem}).getBody();
	        var serviceitemfields = JSON.parse(serviceitemfieldsStr);
					cmtServicePrice = serviceitemfields.custitem_jerome_cmt_basic_price;
					break;
			}
			// go in to the service item, and look up the price based on premium or basic preference.
			if (cmtServiceItem && cmtServicePrice){
				var price = (parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
				var description = "<li>"+tailorCMTPref + " " + price + "</li>";
	      //Update the price here to include the surcharges
				//calculate the service item price
				// var serviceItemPrice = (parseFloat(surchargeamount) +parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice*tailorCMTDisc/100))).toFixed(2);
				description+= surchargedescription;
	      fabrictext += description;
	      totaladditionalsurcharge = parseFloat(price) + parseFloat(surchargeamount);
			}
	  fabrictext += '</ul></div></div>';
	  return {
	    text: fabrictext, amount: totaladditionalsurcharge
	  };
	}
	, getCogs: function(line_data){
	  var self=this;
	  var Profile = Application.getModel('Profile')
	  ,	customer_values = Profile.get();

	  var tailorID = customer_values.parent?customer_values.parent:nlapiGetUser();
	  var parent = tailorID;
	  var surcharges = this.getDesignOptionSurcharges();
	  var shippingsurcharges = this.getShippingSurcharges();
	  var fabricsurcharges = this.getFabricSurcharges();
	  var fabric_customsurcharges = this.getFabricCustomSurcharges();
	  var url = myaccountsuiteleturl;
	  var response = {};

	  var requestfieldsStr = nlapiRequestURL(nlapiResolveURL('suitelet','customscript_myaccountsuitelet','customdeploy1','external'),
	  {action:'getfabriccmtdescriptions',user:tailorID,item:line_data.item.internalid,pricelevel:customer_values.priceLevel,currency:customer_values.currency.internalid}).getBody();
	  var requestfields = JSON.parse(requestfieldsStr);
	  var f_cogs = self.getFabricCogs(tailorID,line_data,requestfields,fabricsurcharges,fabric_customsurcharges);
	  var cmt_cogs = self.getCMTCogs(tailorID,line_data,requestfields, surcharges);
	  var shipping_cogs = self.getShippingCogs(tailorID,line_data,shippingsurcharges);
	  var totalcogs = parseFloat(f_cogs.amount?f_cogs.amount:0);
	  totalcogs+= parseFloat(cmt_cogs.amount?cmt_cogs.amount:0);
	  totalcogs += parseFloat(shipping_cogs.amount?shipping_cogs.amount:0);
	  var fabrictext = f_cogs.text;
	  fabrictext += cmt_cogs.text;
	  fabrictext += shipping_cogs.text;
	  fabrictext += "<div><b>Total COGS:</b> "+totalcogs.toFixed(2)+"</div>";
	  return fabrictext.toString();
	}
	, list: function (page, clientName,soid,sort,clientid, customerid,cmtdate,startdate,enddate,cmtstatus, subtailor) {
		var url = myaccountsuiteleturl;
		var parameters = "";
		if(true){//customerid != nlapiGetUser()){
			if(!customerid) customerid = nlapiGetUser();
			//We have a parent.. then we need to just get the orders from the script
			if(subtailor){
				parameters += "&subtailor="+subtailor;
			}
			if(startdate){
				var s_date = startdate.split('-');
				parameters += "&startdate="+s_date[2]+"/"+s_date[1]+"/"+s_date[0];
			}
			if(enddate){
				var e_date = enddate.split('-');
				parameters += "&enddate="+e_date[2]+"/"+e_date[1]+"/"+e_date[0];
			}
			if(cmtdate){
				var cmtdate_date = cmtdate.split('-');
				parameters += "&cmtdate="+cmtdate_date[2]+"/"+cmtdate_date[1]+"/"+cmtdate_date[0];
			}
			if(clientName){
				parameters += "&clientname="+clientName;
			}
			if(soid){
				parameters += "&soid="+soid;
			}
			if(sort){
				parameters += "&sort="+sort;
			}
			if(clientid){
				parameters += "&clientid="+clientid;
			}
			if(cmtstatus){
				parameters += "&cmtstatus="+cmtstatus;
			}
			if(page){
				parameters += "&page="+page;
			}
			var res = nlapiRequestURL(url+"&action=getorders&user="+customerid+parameters);
			return JSON.parse(res.getBody());
		}else{
		// if the store has multiple currencies we add the currency column to the query
			var isMultiCurrency = context.getFeature('MULTICURRENCY')
			, total_field = 'custbody_total_tailor_price'
			, filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
				, new nlobjSearchFilter('custcol_itm_category_url', null, 'isnotempty')
			]
			, columns = [
				new nlobjSearchColumn('internalid').setSort(true)
				, new nlobjSearchColumn('trackingnumbers')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('status')
				, new nlobjSearchColumn(total_field)
				, new nlobjSearchColumn('custbody_customer_name')
			];
			// columns.push(new nlobjSearchColumn('custcol_expected_delivery_date'))
			columns.push(new nlobjSearchColumn('custcol_expected_production_date'))
			columns.push(new nlobjSearchColumn('custcol_tailor_delivery_days'))
			columns.push(new nlobjSearchColumn('custcol_so_id'))
			columns.push(new nlobjSearchColumn('item'))
			columns.push(new nlobjSearchColumn('custcol_avt_date_needed'))
			columns.push(new nlobjSearchColumn('custcol_avt_fabric_status'))
			columns.push(new nlobjSearchColumn('custcol_avt_date_sent'))
			columns.push(new nlobjSearchColumn('custcol_avt_cmt_status'))
			columns.push(new nlobjSearchColumn('custcol_avt_cmt_date_sent'))
			columns.push(new nlobjSearchColumn('custcol_avt_fabric_text'))
			columns.push(new nlobjSearchColumn('custcol_avt_cmt_status_text'))
			columns.push(new nlobjSearchColumn('custcol_cmt_production_time'))
			columns.push(new nlobjSearchColumn('custcol_avt_tracking'))
			columns.push(new nlobjSearchColumn('custcol_avt_solinestatus'))
			columns.push(new nlobjSearchColumn('custcol_avt_saleorder_line_key'))
			columns.push(new nlobjSearchColumn('custcol_avt_cmt_tracking'))
			columns.push(new nlobjSearchColumn('custcol_fabric_delivery_days'))
			columns.push(new nlobjSearchColumn('custcol_custom_fabric_details'))
			columns.push(new nlobjSearchColumn('custcol_producttype'));
			columns.push(new nlobjSearchColumn('custcol_othervendorname'));
			var flagcol = new nlobjSearchColumn('custcol_flag');
			columns.push(flagcol)
			columns.push(new nlobjSearchColumn('custcol_flag_comment'))
			if (isMultiCurrency) {
				columns.push(new nlobjSearchColumn('currency'));
			}

			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
			if(sort && sort == 'true'){
				filters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:D','SalesOrd:E','SalesOrd:F','SalesOrd:B','SalesOrd:G']));
			}
			if(clientId)
				filters.push(new nlobjSearchFilter('custcol_tailor_client',null,'is',clientId));

			if(soid){
				filters.push( new nlobjSearchFilter('custcol_so_id', null, 'startswith', soid));
			}
			if(clientName){
				filters.push( new nlobjSearchFilter('custcol_tailor_client_name', null, 'contains', clientName));
			}
			//if the site is multisite we add the siteid to the search filter
			if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid']).siteid) {
				filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid, '@NONE@']));
			}
			var result = {};

			result = Application.getAllSalesOrderPaginatedSearchResults({
				record_type: 'salesorder'
				, filters: filters
				, columns: columns
				, page: page
			});
			// result.totalRecordsFound = result.totalRecordsFound;
			// result.records = result.records;
			result.records = _.map(result.records || [], function (record) {
			var dateneeded = record.getValue('custcol_avt_date_needed');//this
			var expdeliverydate = record.getValue('custcol_expected_delivery_date');
			var fabricstatus = record.getValue('custcol_avt_fabric_status');
			var cmtstatus = record.getValue('custcol_avt_cmt_status');
			var datesent = record.getValue('custcol_avt_cmt_date_sent');
			var custcol_flag_comment = record.getValue('custcol_flag_comment');
			var custcol_flag = record.getValue('custcol_flag');
			var custcol_expected_production_date = record.getValue('custcol_expected_production_date');//this
			var cmtstatuscheck = false, fabstatuscheck = false, expFabDateNeeded, dateNeeded, confirmedDate;
			var custcol_tailor_delivery_days = record.getValue('custcol_tailor_delivery_days');
			var today = new Date();
			var cmtstatustext = "";
			var customitemtext = record.getText('item');
			var custcol_custom_fabric_details = record.getValue('custcol_custom_fabric_details');
			if(record.getValue('item') == '28034' ||
					record.getValue('item') == '28035' ||
					record.getValue('item') == '28030' ||
					record.getValue('item') == '28033' ||
					record.getValue('item') == '28036' ||
					record.getValue('item') == '28031' ||
					record.getValue('item') == '28032'){
						if(custcol_custom_fabric_details){
							var custcol_custom_fabric_details_json = JSON.parse(custcol_custom_fabric_details);
							if(custcol_custom_fabric_details_json)
								customitemtext = customitemtext.replace('CMT Item',custcol_custom_fabric_details_json.collection+'-'+custcol_custom_fabric_details_json.code);
						}
			}
			if(record.getValue('custcol_producttype')){
				customitemtext += ' - ' + record.getValue('custcol_producttype');
			}
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			if (cmtstatus) {
				cmtstatustext += record.getText('custcol_avt_cmt_status');
			}
			var morethan10days = false, clearstatus = false;
			if (datesent) {
				if (cmtstatustext != "") cmtstatustext += '-';
				var cDate = nlapiStringToDate(datesent);
				cDate.setDate(cDate.getDate());
				datesent = nlapiDateToString(cDate);
				cmtstatustext += datesent;

				if((today - cDate) > 863999146){
					morethan10days = true;
				}
			}
			else if (custcol_expected_production_date) {
				if (cmtstatustext != "") cmtstatustext += '-';
				cmtstatustext += custcol_expected_production_date;
				var cmtstatdate = nlapiStringToDate(custcol_expected_production_date);
				if((today - cmtstatdate) > 863999146){
					morethan10days = true;
				}
			}
			if (record.getValue('custcol_avt_cmt_tracking')) {
				if (cmtstatustext != "") cmtstatustext += '-';
				cmtstatustext += record.getValue('custcol_avt_cmt_tracking');
			}
			if((record.getText('status') == 'Cancelled' || record.getText('status') == 'Closed')//|| record.getText('status') == 'Billed'  Removed Billed
			|| ((record.getText('custcol_avt_cmt_status') == 'Delivered' ||
			record.getText('custcol_avt_cmt_status') == 'Left factory') && morethan10days)){
				clearstatus = true;
			}
			if ((cmtstatus == 7 || cmtstatus == 8) && fabricstatus != 1) {
				//check the dates of the fabric should be sent vs today
				if (custcol_expected_production_date) {
					expFabDateNeeded = nlapiStringToDate(custcol_expected_production_date);
					expFabDateNeeded.setDate(expFabDateNeeded.getDate() - parseFloat(record.getValue('custcol_cmt_production_time')));
					if (expFabDateNeeded < today)
						fabstatuscheck = true;
					else
						fabstatuscheck = false;
				}
				else {
					fabstatuscheck = false;
				}
			}
			else if (fabricstatus == 1) {
				fabstatuscheck = true;
			}
			else {
				fabstatuscheck = false;
			}
			if (cmtstatus == 4) {
				cmtstatuscheck = true;
			} else if (dateneeded) {
				dateNeeded = nlapiStringToDate(dateneeded)
				if (datesent) {
					confirmedDate = nlapiStringToDate(datesent);
					confirmedDate.setDate(confirmedDate.getDate() + parseFloat(custcol_tailor_delivery_days ? custcol_tailor_delivery_days : 0));
				}
				else if (custcol_expected_production_date) {
					confirmedDate = nlapiStringToDate(custcol_expected_production_date);
					confirmedDate.setDate(confirmedDate.getDate() + parseFloat(custcol_tailor_delivery_days ? custcol_tailor_delivery_days : 0));
				}

				if (confirmedDate) {
					if (confirmedDate > dateNeeded){
						cmtstatuscheck = true;
					}
					else
						cmtstatuscheck = false;
				} else {
					cmtstatuscheck = false
				}

			} else {
				cmtstatuscheck = false;
			}

			if (record.getValue('custcol_avt_date_needed')) {
				dateneeded = nlapiStringToDate(record.getValue('custcol_avt_date_needed'));
				dateneeded = dateneeded.getFullYear() + '-' + ('0' + (dateneeded.getMonth() + 1)).slice(-2) + '-' +
					('0' + dateneeded.getDate()).slice(-2);
			}
			var status = true;

			return {
				internalid: new Date().getTime() + Math.floor(Math.random() * 999999999999999999) + '_' + record.getValue('internalid')
				, date: record.getValue('trandate')
				, order_number: record.getValue('tranid')
				, status: record.getText('status')
				, clearstatus: clearstatus
				, summary: {
					total: toCurrency(record.getValue(total_field))
					, total_formatted: formatCurrency(record.getValue(total_field))
				}
				// we might need to change that to the default currency
				, currency: isMultiCurrency ? { internalid: record.getValue('currency'), name: record.getText('currency') } : null
				// Normalizes tracking number's values
				, trackingnumbers: record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null
				, type: record.getRecordType()
				, client_name: record.getValue('custbody_customer_name')
				, so_id: record.getValue('custcol_so_id')
				, item: customitemtext
				//,	fabricstatus: record.getText('custcol_avt_fabric_status')
				//,	cmtstatus: record.getText('custcol_avt_cmt_status')
				, custcol_flag: custcol_flag
				, custcol_flag_comment: custcol_flag_comment
				, custcol_avt_date_needed: dateneeded
				, tranline_status: cmtstatuscheck || fabstatuscheck//record.getText('custcol_avt_solinestatus')
				, fabricstatus: record.getValue('custcol_avt_fabric_text')
				, cmtstatus: cmtstatustext//record.getValue('custcol_avt_cmt_status_text')
				, solinekey: record.getValue('custcol_avt_saleorder_line_key')
				, othervendorname: record.getValue('custcol_othervendorname')
			};
		});
		var results_per_page = SC.Configuration.results_per_page;

		if(sort == 'true'){
			result.records.sort(function(a,b){
				return (a.tranline_status === b.tranline_status )? 0 : a.tranline_status? -1 : 1;
			});
			result.records.sort(function(a,b){
				return (a.clearstatus === b.clearstatus)? 0 : a.clearstatus? 1: -1;
			})
			result.records.sort(function(a,b){
				return (a.custcol_flag === b.custcol_flag)? 0 : a.custcol_flag == 'F'? 1 : -1
			});
		}
		var range_start = (page * results_per_page) - results_per_page
		,	range_end = page * results_per_page;
		result.records = result.records.slice(range_start, range_end);
		return result;
		}
	}

	, get: function (id, customerid) {
		'use strict';
		var self = this;

		// var response = {};
		//

		if(true){//customerid != nlapiGetUser()){
			// 	var res = nlapiRequestURL(url+"&action=getparent&user="+nlapiGetUser());
			// 	var body = JSON.parse(res.getBody());
			// 	customerid = body[0];
			var url = myaccountsuiteleturl;
			nlapiLogExecution('debug','customerid',customerid)
			if(!customerid)
				customerid = nlapiGetUser();
				nlapiLogExecution('debug','customerid1, id',customerid+ ','+id)
				var res = nlapiRequestURL(url+"&action=getorder&user="+customerid+"&id="+id);
				nlapiLogExecution('debug','res.getBody()',res.getBody())
				var result = JSON.parse(res.getBody());

				//We have a parent.. then we need to just get the orders from the script

				// Preloads info about the item
				this.store_item = Application.getModel('StoreItem');
				var items_to_preload = [];
				result.lines = _.values(result.lines);
				result.lines.forEach(function (line) {
					if(line.type != 'Markup'){
						items_to_preload[line.item] = {
							id: line.item
							, type: line.type
						};
					}
				});
				items_to_preload = _.values(items_to_preload);
				this.store_item.preloadItems(items_to_preload);

				result.lines.forEach(function (line) {
					line.item = line.type != 'Markup' ? self.store_item.get(line.item, line.type): line.item;
				});

				return result;
		}else{

			var placed_order = nlapiLoadRecord('salesorder', id)
				, result = this.createResult(placed_order);

			this.setAddresses(placed_order, result);
			this.setShippingMethods(placed_order, result);
			this.setLines(placed_order, result);
			this.setFulfillments(result);
			this.setPaymentMethod(placed_order, result);
			this.setReceipts(result, placed_order);
			this.setReturnAuthorizations(result, placed_order);

			result.promocode = (placed_order.getFieldValue('promocode')) ? {
				internalid: placed_order.getFieldValue('promocode')
				, name: placed_order.getFieldText('promocode')
				, code: placed_order.getFieldText('couponcode')
			} : null;

			// convert the obejcts to arrays
			result.addresses = _.values(result.addresses);
			result.shipmethods = _.values(result.shipmethods);
			result.lines = _.values(result.lines);
			result.fulfillments = _.values(result.fulfillments);
			result.receipts = _.values(result.receipts);
			return result;
		}

	}


	, setPaymentMethod: function (placed_order, result) {
		'use strict';

		return setPaymentMethodToResult(placed_order, result);
	}

	, createResult: function (placed_order) {
		'use strict';

		return {
			internalid: placed_order.getId()
			, type: placed_order.getRecordType()
			, trantype: placed_order.getFieldValue('type')
			, order_number: placed_order.getFieldValue('tranid')
			, purchasenumber: placed_order.getFieldValue('otherrefnum')
			, dueDate: placed_order.getFieldValue('duedate')
			, amountDue: toCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
			, amountDue_formatted: formatCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
			, memo: placed_order.getFieldValue('memo')
			, date: placed_order.getFieldValue('trandate')
			, status: placed_order.getFieldValue('status')
			, isReturnable: this.isReturnable(placed_order)
			, summary: {
				subtotal: toCurrency(placed_order.getFieldValue('custbody_total_tailor_price'))
				, subtotal_formatted: formatCurrency(placed_order.getFieldValue('custbody_total_tailor_price'))

				, taxtotal: toCurrency(placed_order.getFieldValue('taxtotal'))
				, taxtotal_formatted: formatCurrency(placed_order.getFieldValue('taxtotal'))

				, tax2total: toCurrency(0)
				, tax2total_formatted: formatCurrency(0)

				, shippingcost: toCurrency(placed_order.getFieldValue('shippingcost'))
				, shippingcost_formatted: formatCurrency(placed_order.getFieldValue('shippingcost'))

				, handlingcost: toCurrency(placed_order.getFieldValue('althandlingcost'))
				, handlingcost_formatted: formatCurrency(placed_order.getFieldValue('althandlingcost'))

				, estimatedshipping: 0
				, estimatedshipping_formatted: formatCurrency(0)

				, taxonshipping: toCurrency(0)
				, taxonshipping_formatted: formatCurrency(0)

				, discounttotal: toCurrency(placed_order.getFieldValue('discounttotal'))
				, discounttotal_formatted: formatCurrency(placed_order.getFieldValue('discounttotal'))

				, taxondiscount: toCurrency(0)
				, taxondiscount_formatted: formatCurrency(0)

				, discountrate: toCurrency(0)
				, discountrate_formatted: formatCurrency(0)

				, discountedsubtotal: toCurrency(0)
				, discountedsubtotal_formatted: formatCurrency(0)

				, giftcertapplied: toCurrency(placed_order.getFieldValue('giftcertapplied'))
				, giftcertapplied_formatted: formatCurrency(placed_order.getFieldValue('giftcertapplied'))

				, total: toCurrency(parseFloat(placed_order.getFieldValue('custbody_total_tailor_price')) + parseFloat(placed_order.getFieldValue('shippingcost')))
				, total_formatted: formatCurrency(parseFloat(placed_order.getFieldValue('custbody_total_tailor_price')) + parseFloat(placed_order.getFieldValue('shippingcost')))
			}

			, currency: context.getFeature('MULTICURRENCY') ?
				{
					internalid: placed_order.getFieldValue('currency')
					, name: placed_order.getFieldValue('currencyname')
				} : null
		};
	}

	, isReturnable: function (placed_order) {
		'use strict';

		var status_id = placed_order.getFieldValue('statusRef');

		return status_id !== 'pendingFulfillment' && status_id !== 'pendingApproval' && status_id !== 'closed';
	}

	, setFulfillments: function (result) {
		'use strict';

		var self = this;

		result.fulfillments = {};
		var filters = [
			new nlobjSearchFilter('createdfrom', null, 'is', result.internalid)
			, new nlobjSearchFilter('cogs', null, 'is', 'F')
			, new nlobjSearchFilter('shipping', null, 'is', 'F')
			, new nlobjSearchFilter('shiprecvstatusline', null, 'is', 'F')
		]

			, columns = [
				new nlobjSearchColumn('quantity')
				, new nlobjSearchColumn('item')
				, new nlobjSearchColumn('shipaddress')
				, new nlobjSearchColumn('shipmethod')
				, new nlobjSearchColumn('shipto')
				, new nlobjSearchColumn('trackingnumbers')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('status')

				// Ship Address
				, new nlobjSearchColumn('shipaddress')
				, new nlobjSearchColumn('shipaddress1')
				, new nlobjSearchColumn('shipaddress2')
				, new nlobjSearchColumn('shipaddressee')
				, new nlobjSearchColumn('shipattention')
				, new nlobjSearchColumn('shipcity')
				, new nlobjSearchColumn('shipcountry')
				, new nlobjSearchColumn('shipstate')
				, new nlobjSearchColumn('shipzip')
			]

			, fulfillments = Application.getAllSearchResults('itemfulfillment', filters, columns)
			, fulfillment_id = [];


		fulfillments.forEach(function (ffline) {

			if (ffline.getValue('status') === 'shipped') {

				var shipaddress = self.addAddress({
					internalid: ffline.getValue('shipaddress')
					, country: ffline.getValue('shipcountry')
					, state: ffline.getValue('shipstate')
					, city: ffline.getValue('shipcity')
					, zip: ffline.getValue('shipzip')
					, addr1: ffline.getValue('shipaddress1')
					, addr2: ffline.getValue('shipaddress2')
					, attention: ffline.getValue('shipattention')
					, addressee: ffline.getValue('shipaddressee')
				}, result);


				result.fulfillments[ffline.getId()] = result.fulfillments[ffline.getId()] || {
					internalid: ffline.getId()
					, shipaddress: shipaddress
					, shipmethod: {
						internalid: ffline.getValue('shipmethod')
						, name: ffline.getText('shipmethod')
					}
					, date: ffline.getValue('trandate')
					, trackingnumbers: ffline.getValue('trackingnumbers') ? ffline.getValue('trackingnumbers').split('<BR>') : null
					, lines: []
				};

				result.fulfillments[ffline.getId()].lines.push({
					item_id: ffline.getValue('item')
					, quantity: ffline.getValue('quantity')
					, rate: 0
					, rate_formatted: formatCurrency(0)
				});
				fulfillment_id.push(ffline.getId());

			}

		});


		if (fulfillment_id.length) {
			filters = [
				new nlobjSearchFilter('internalid', null, 'anyof', result.internalid)
				, new nlobjSearchFilter('fulfillingtransaction', null, 'anyof', fulfillment_id)
			];


			columns = [
				new nlobjSearchColumn('line')
				, new nlobjSearchColumn('item')
				, new nlobjSearchColumn('rate')
				, new nlobjSearchColumn('fulfillingtransaction')

			];


			// TODO: open issue: we need visibility to the orderline/orderdoc attributes of the fulfillment
			// and this sux :p
			Application.getAllSearchResults('salesorder', filters, columns).forEach(function (line) {
				var foundline = _.find(result.fulfillments[line.getValue('fulfillingtransaction')].lines, function (ffline) {
					return ffline.item_id === line.getValue('item') && !ffline.line_id;
				});

				foundline.line_id = result.internalid + '_' + line.getValue('line');
				foundline.rate = parseFloat(line.getValue('rate')) * foundline.quantity;
				foundline.rate_formatted = formatCurrency(foundline.rate);
				delete foundline.item_id;
			});
		}

	}

	, setLines: function (placed_order, result) {
		'use strict';

		result.lines = {};
		var items_to_preload = []
			, amount;

		// load clients for this record since result doesn't include first name & last name
		var customer_id = placed_order.getFieldValue('entity');
		var profile_filters = [new nlobjSearchFilter('custrecord_tc_tailor', null, 'is', customer_id)]
		, profile_columns = [new nlobjSearchColumn('custrecord_tc_first_name'), new nlobjSearchColumn('custrecord_tc_last_name')]
		, profiles = nlapiSearchRecord('customrecord_sc_tailor_client', null, profile_filters, profile_columns);

		// special function for retrieving client name

		var getClientName = function (clientId) {
			var result = null;
			for (index in profiles) {
				if (profiles[index].id == clientId) {
					result = profiles[index].getValue("custrecord_tc_first_name") + " " + profiles[index].getValue("custrecord_tc_last_name");
					break;
				}
			}
			return result;
		}

		for (var i = 1; i <= placed_order.getLineItemCount('item'); i++) {

			if (placed_order.getLineItemValue('item', 'itemtype', i) === 'Discount' && placed_order.getLineItemValue('item', 'discline', i)) {
				var discline = placed_order.getLineItemValue('item', 'discline', i);

				amount = Math.abs(parseFloat(placed_order.getLineItemValue('item', 'amount', i)));

				result.lines[discline].discount = (result.lines[discline].discount) ? result.lines[discline].discount + amount : amount;
				result.lines[discline].total = result.lines[discline].amount + result.lines[discline].tax_amount - result.lines[discline].discount;
			}
			else {
				var rate = toCurrency(placed_order.getLineItemValue('item', 'rate', i))
					, item_id = placed_order.getLineItemValue('item', 'item', i)
					, item_type = placed_order.getLineItemValue('item', 'itemtype', i);

				amount = toCurrency(placed_order.getLineItemValue('item', 'amount', i));

				var tax_amount = toCurrency(placed_order.getLineItemValue('item', 'tax1amt', i)) || 0
					, total = amount + tax_amount;

				var lineOption = [];

				// if (placed_order.getLineItemValue('item', 'custcol_flag_comment', i)) {
					lineOption.push({
						id: 'custcol_flag_comment'
						, name: 'Flag Comment'
						, value: placed_order.getLineItemText('item', 'custcol_flag_comment', i)
					});
				// }
				// if (placed_order.getLineItemValue('item', 'custcol_flag', i)) {
					lineOption.push({
						id: 'custcol_flag'
						, name: 'Flag'
						, value: placed_order.getLineItemText('item', 'custcol_flag', i)
					});
				// }

				if (placed_order.getLineItemValue('item', 'custcol_designoption_message', i)) {
					lineOption.push({
						id: 'custcol_designoption_message'
						, name: 'Design Options - Message'
						, value: placed_order.getLineItemValue('item', 'custcol_designoption_message', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_designoptions_jacket', i)) {
					lineOption.push({
						id: 'custcol_designoptions_jacket'
						, name: 'Design Options - Jacket'
						, value: placed_order.getLineItemValue('item', 'custcol_designoptions_jacket', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_designoptions_overcoat', i)) {
					lineOption.push({
						id: 'custcol_designoptions_overcoat'
						, name: 'Design Options - Overcoat'
						, value: placed_order.getLineItemValue('item', 'custcol_designoptions_overcoat', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_designoptions_shirt', i)) {
					lineOption.push({
						id: 'custcol_designoptions_shirt'
						, name: 'Design Options - Shirt'
						, value: placed_order.getLineItemValue('item', 'custcol_designoptions_shirt', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_designoptions_trouser', i)) {
					lineOption.push({
						id: 'custcol_designoptions_trouser'
						, name: 'Design Options - Trouser'
						, value: placed_order.getLineItemValue('item', 'custcol_designoptions_trouser', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_designoptions_waistcoat', i)) {
					lineOption.push({
						id: 'custcol_designoptions_waistcoat'
						, name: 'Design Options - Waistcoat'
						, value: placed_order.getLineItemValue('item', 'custcol_designoptions_waistcoat', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_fitprofile_summary', i)) {
					lineOption.push({
						id: 'custcol_fitprofile_summary'
						, name: 'Fit Profile Summary'
						, value: placed_order.getLineItemValue('item', 'custcol_fitprofile_summary', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_fitprofile_message', i)) {
					lineOption.push({
						id: 'custcol_fitprofile_message'
						, name: 'Fit Profile - Message'
						, value: placed_order.getLineItemValue('item', 'custcol_fitprofile_message', i)
					});
				}

				if (placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)) {
					lineOption.push({
						id: 'custcol_tailor_cust_pricing'
						, name: 'Tailor Pricing'
						, value: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_tailor_client', i)) {
					var clientId = placed_order.getLineItemValue('item', 'custcol_tailor_client', i);
					lineOption.push({
						id: 'custcol_tailor_client'
						, name: 'Tailor Client'
						, value: clientId
					});
					lineOption.push({
						id: 'custcol_tailor_client_name'
						, name: 'Client Name'
						, value: placed_order.getFieldValue('custbody_customer_name')//getClientName(clientId)
					});

				}
				if (placed_order.getLineItemValue('item', 'custcol_itm_category_url', i)) {
					lineOption.push({
						id: 'custcol_itm_category_url'
						, name: 'Category URL'
						, value: placed_order.getLineItemValue('item', 'custcol_itm_category_url', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_fabric_quantity', i)) {
					lineOption.push({
						id: 'custcol_fabric_quantity'
						, name: 'Fabric Quantity'
						, value: placed_order.getLineItemValue('item', 'custcol_fabric_quantity', i)
					});
				}

				/** start date needed, hold fabric, hold production **/
				if (placed_order.getLineItemValue('item', 'custcol_avt_date_needed', i)) {
					lineOption.push({
						id: 'custcol_avt_date_needed'
						, name: 'Date Needed'
						, value: placed_order.getLineItemValue('item', 'custcol_avt_date_needed', i) || '1/1/1900'
					});
				}

				if (placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)) {
					lineOption.push({
						id: 'custcol_custom_fabric_details'
						, name: 'Custom Fabric Details'
						, value: placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_producttype', i)) {
					lineOption.push({
						id: 'custcol_producttype'
						, name: 'Product Type'
						, value: placed_order.getLineItemValue('item', 'custcol_producttype', i)
					});
				}
				if (placed_order.getLineItemValue('item', 'custcol_vendorpicked', i)) {
					lineOption.push({
						id: 'custcol_vendorpicked'
						, name: 'CMT Vendor'
						, value: placed_order.getLineItemValue('item', 'custcol_vendorpicked', i)
					});
				}
				lineOption.push({
					id: 'custcol_othervendorname'
					, name: 'Other Vendor Name'
					, value: placed_order.getLineItemValue('item', 'custcol_othervendorname', i)
				});
				//nlapiLogExecution('debug','SET LINES custcol_producttype',placed_order.getLineItemValue('item', 'custcol_producttype', i))
				//nlapiLogExecution('debug','SET LINES custcol_vendorpicked',placed_order.getLineItemValue('item', 'custcol_vendorpicked', i))
				//nlapiLogExecution('debug','SET LINES custcol_custom_fabric_details',placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i))

				/** end date needed, hold fabric, hold production **/

					if(item_type != 'Markup'){
					result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
						internalid: placed_order.getLineItemValue('item', 'id', i)
						, quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

						, rate: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

						, amount: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
						, tax_amount: 0
						, tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i)
						, tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)
						, discount: 0

						, total: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

						, item: item_id
						, type: item_type
						, options: lineOption
						, shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null
						, shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
					};

					items_to_preload[item_id] = {
						id: item_id
						, type: item_type
					};
				}else{
					result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
						internalid: placed_order.getLineItemValue('item', 'id', i)
						, quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)
						, rate: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
						, amount: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
						, tax_amount: 0
						, tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i)
						, tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)
						, discount: 0
						, total: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
						, item: {
							storedisplayname2:placed_order.getLineItemValue('item', 'description', i)
							, displayname:placed_order.getLineItemText('item', 'item', i)
							, internalid:placed_order.getLineItemValue('item', 'id', i)
						}
						, type: item_type
						, options: lineOption
						, shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null
						, shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
					};
				}


			}

		}

		// Preloads info about the item
		this.store_item = Application.getModel('StoreItem');

		items_to_preload = _.values(items_to_preload);

		this.store_item.preloadItems(items_to_preload);

		// The api wont bring disabled items so we need to query them directly
		var items_to_query = []
			, self = this;

		_.each(result.lines, function (line) {
			if (line.item && line.type != 'Markup') {
				var item = self.store_item.get(line.item, line.type);
				if (!item || typeof item.itemid === 'undefined') {
					items_to_query.push(line.item);
				}
			}
		});

		if (items_to_query.length > 0) {
			var filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
				, new nlobjSearchFilter('internalid', null, 'is', result.internalid)
				, new nlobjSearchFilter('internalid', 'item', 'anyof', items_to_query)
			]

				, columns = [
					new nlobjSearchColumn('internalid', 'item')
					, new nlobjSearchColumn('type', 'item')
					, new nlobjSearchColumn('parent', 'item')
					, new nlobjSearchColumn('displayname', 'item')
					, new nlobjSearchColumn('storedisplayname', 'item')
					, new nlobjSearchColumn('itemid', 'item')
				]

				, inactive_items_search = Application.getAllSearchResults('transaction', filters, columns);

			inactive_items_search.forEach(function (item) {
				var inactive_item = {
					internalid: item.getValue('internalid', 'item')
					, type: item.getValue('type', 'item')
					, displayname: item.getValue('displayname', 'item')
					, storedisplayname: item.getValue('storedisplayname', 'item')
					, itemid: item.getValue('itemid', 'item')
				};

				self.store_item.set(inactive_item);
			});
		}

		result.lines = _.values(result.lines);

		result.lines.forEach(function (line) {
			line.rate_formatted = formatCurrency(line.rate);
			line.amount_formatted = formatCurrency(line.amount);
			line.tax_amount_formatted = formatCurrency(line.tax_amount);
			line.discount_formatted = formatCurrency(line.discount);
			line.total_formatted = formatCurrency(line.total);
			line.item = line.type != 'Markup' ? self.store_item.get(line.item, line.type): line.item;
		});

		// remove the temporary address list by id
		delete result.listAddresseByIdTmp;
	}

	, setShippingMethods: function (placed_order, result) {
		'use strict';
		result.shipmethods = {};

		if (placed_order.getLineItemCount('shipgroup') <= 0) {
			result.shipmethods[placed_order.getFieldValue('shipmethod')] = {
				internalid: placed_order.getFieldValue('shipmethod')
				, name: placed_order.getFieldText('shipmethod')
				, rate: toCurrency(placed_order.getFieldValue('shipping_rate'))
				, rate_formatted: formatCurrency(placed_order.getFieldValue('shipping_rate'))
				, shipcarrier: placed_order.getFieldValue('carrier')
			};
		}

		for (var i = 1; i <= placed_order.getLineItemCount('shipgroup'); i++) {
			result.shipmethods[placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)] = {
				internalid: placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)
				, name: placed_order.getLineItemValue('shipgroup', 'shippingmethod', i)
				, rate: toCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i))
				, rate_formatted: formatCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i))
				, shipcarrier: placed_order.getLineItemValue('shipgroup', 'shippingcarrier', i)
			};

		}

		result.shipmethod = placed_order.getFieldValue('shipmethod');
	}

	, addAddress: function (address, result) {
		'use strict';
		result.addresses = result.addresses || {};

		address.fullname = (address.attention) ? address.attention : address.addressee;
		address.company = (address.attention) ? address.addressee : null;

		delete address.attention;
		delete address.addressee;

		address.internalid = (address.country || '') + '-' +
			(address.state || '') + '-' +
			(address.city || '') + '-' +
			(address.zip || '') + '-' +
			(address.addr1 || '') + '-' +
			(address.addr2 || '') + '-' +
			(address.fullname || '') + '-' +
			(address.company || '');

		address.internalid = address.internalid.replace(/\s/g, '-');

		if (!result.addresses[address.internalid]) {
			result.addresses[address.internalid] = address;
		}

		return address.internalid;
	}

	, setAddresses: function (placed_order, result) {
		// TODO: normalize addresses, remove <br> and \r\n
		'use strict';
		result.addresses = {};
		result.listAddresseByIdTmp = {};
		for (var i = 1; i <= placed_order.getLineItemCount('iladdrbook'); i++) {
			// Adds all the addresses in the address book
			result.listAddresseByIdTmp[placed_order.getLineItemValue('iladdrbook', 'iladdrinternalid', i)] = this.addAddress({
				internalid: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr', i)
				, country: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcountry', i)
				, state: placed_order.getLineItemValue('iladdrbook', 'iladdrshipstate', i)
				, city: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcity', i)
				, zip: placed_order.getLineItemValue('iladdrbook', 'iladdrshipzip', i)
				, addr1: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr1', i)
				, addr2: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr2', i)
				, attention: placed_order.getLineItemValue('iladdrbook', 'iladdrshipattention', i)
				, addressee: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddressee', i)
			}, result);
		}

		// Adds Bill Address
		result.billaddress = this.addAddress({
			internalid: placed_order.getFieldValue('billaddress')
			, country: placed_order.getFieldValue('billcountry')
			, state: placed_order.getFieldValue('billstate')
			, city: placed_order.getFieldValue('billcity')
			, zip: placed_order.getFieldValue('billzip')
			, addr1: placed_order.getFieldValue('billaddr1')
			, addr2: placed_order.getFieldValue('billaddr2')
			, attention: placed_order.getFieldValue('billattention')
			, addressee: placed_order.getFieldValue('billaddressee')
		}, result);

		// Adds Shipping Address
		result.shipaddress = (placed_order.getFieldValue('shipaddress')) ? this.addAddress({
			internalid: placed_order.getFieldValue('shipaddress')
			, country: placed_order.getFieldValue('shipcountry')
			, state: placed_order.getFieldValue('shipstate')
			, city: placed_order.getFieldValue('shipcity')
			, zip: placed_order.getFieldValue('shipzip')
			, addr1: placed_order.getFieldValue('shipaddr1')
			, addr2: placed_order.getFieldValue('shipaddr2')
			, attention: placed_order.getFieldValue('shipattention')
			, addressee: placed_order.getFieldValue('shipaddressee')
		}, result) : null;
	}

	, setReceipts: function (result) {
		'use strict';

		result.receipts = Application.getModel('Receipts').list({
			orderid: result.internalid
		});

		return this;
	}

	, setReturnAuthorizations: function (result) {
		'use strict';

		result.returnauthorizations = Application.getModel('ReturnAuthorization').list({
			createdfrom: result.internalid
		});

		return this;
	}
});


//Model.js
Application.defineModel('ReturnAuthorization', {

	validation: {}

	, get: function (id) {
		'use strict';

		var amount_field = context.getFeature('MULTICURRENCY') ? 'fxamount' : 'amount'

			, filters = [
				new nlobjSearchFilter('internalid', null, 'is', id)
			]

			, columns = [
				// Basic info
				new nlobjSearchColumn('mainline')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('status')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('memo')

				// Summary
				, new nlobjSearchColumn('total')
				, new nlobjSearchColumn('taxtotal')
				, new nlobjSearchColumn('currency')
				, new nlobjSearchColumn('shippingamount')

				// Created from
				, new nlobjSearchColumn('internalid', 'createdfrom')
				, new nlobjSearchColumn('tranid', 'createdfrom')
				, new nlobjSearchColumn('type', 'createdfrom')

				// Items
				, new nlobjSearchColumn('internalid', 'item')
				, new nlobjSearchColumn('type', 'item')
				, new nlobjSearchColumn('quantity')
				, new nlobjSearchColumn('options')
				, new nlobjSearchColumn(amount_field)
				, new nlobjSearchColumn('rate')
			]

			, return_authorizations = Application.getAllSearchResults('returnauthorization', filters, columns)

			, main_return_authorization = _.find(return_authorizations, function (return_authorization) {
				return return_authorization.getValue('mainline') === '*';
			});

		return {
			internalid: main_return_authorization.getId()
			, type: main_return_authorization.getRecordType()

			, date: main_return_authorization.getValue('trandate')
			, tranid: main_return_authorization.getValue('tranid')
			, comment: main_return_authorization.getValue('memo')

			, status: {
				id: main_return_authorization.getValue('status')
				, label: main_return_authorization.getText('status')
			}

			, isCancelable: this.isCancelable(main_return_authorization)
			, createdfrom: this.getCreatedFrom(return_authorizations)
			, summary: this.getSummary(main_return_authorization)
			, lines: this.getLines(return_authorizations)
		};
	}

	, isCancelable: function (record) {
		'use strict';

		return record.getValue('status') === 'pendingApproval';
	}

	, getCreatedFrom: function (records) {
		'use strict';

		var created_from = _.find(records, function (return_authorization) {
			return return_authorization.getValue('internalid', 'createdfrom');
		});

		if (created_from) {
			return {
				internalid: created_from.getValue('internalid', 'createdfrom')
				, tranid: created_from.getValue('tranid', 'createdfrom')
				, type: created_from.getValue('type', 'createdfrom')
			};
		}
	}

	, getLines: function (records) {
		'use strict';

		var amount_field = context.getFeature('MULTICURRENCY') ? 'fxamount' : 'amount'

			, lines = _.filter(records, function (line) {
				// Sales Tax Group have negative internal ids
				return parseInt(line.getValue('internalid', 'item'), 10) > 0;
			})

			, store_item = Application.getModel('StoreItem');

		return _.map(lines, function (record) {
			var amount = record.getValue(amount_field)
				, rate = record.getValue('rate');

			return {
				// As we are returning the item, the quantity is negative
				// don't want to show that to the customer.
				quantity: Math.abs(record.getValue('quantity'))
				, options: getItemOptionsObject(record.getValue('options'))

				, reason: record.getValue('memo')

				, item: store_item.get(
					record.getValue('internalid', 'item')
					, record.getValue('type', 'item')
				)

				, amount: toCurrency(amount)
				, amount_formatted: formatCurrency(amount)

				, rate: toCurrency(rate)
				, rate_formatted: formatCurrency(rate)
			};
		});
	}

	, getSummary: function (record) {
		'use strict';

		var total = record.getValue('total')
			, taxtotal = record.getValue('taxtotal')
			, shipping = record.getValue('shippingamount');

		return {
			total: toCurrency(total)
			, total_formatted: formatCurrency(total)

			, taxtotal: toCurrency(taxtotal)
			, taxtotal_formatted: formatCurrency(taxtotal)

			, shippingamount: toCurrency(shipping)
			, shippingamount_formatted: formatCurrency(shipping)

			, currency: context.getFeature('MULTICURRENCY') ? {
				internalid: record.getValue('currency')
				, name: record.getText('currency')
			} : null
		};
	}

	, update: function (id, data, headers) {
		'use strict';

		if (data.status === 'cancelled') {
			nlapiRequestURL(SC.Configuration.returnAuthorizations.cancelUrlRoot + '/app/accounting/transactions/returnauthmanager.nl?type=cancel&id=' + id, null, headers);
		}
	}

	, create: function (data) {
		'use strict';

		var return_authorization = nlapiTransformRecord(data.type, data.id, 'returnauthorization');

		this.setLines(return_authorization, data.lines);

		return_authorization.setFieldValue('memo', data.comments);

		return nlapiSubmitRecord(return_authorization);
	}

	, findLine: function (line_id, lines) {
		'use strict';

		return _.findWhere(lines, {
			id: line_id
		});
	}

	, setLines: function (return_authorization, lines) {
		'use strict';

		var line_count = return_authorization.getLineItemCount('item')
			, add_line = true
			, i = 1;

		while (add_line && i <= line_count) {
			add_line = this.findLine(return_authorization.getLineItemValue('item', 'id', i), lines);

			if (add_line) {
				return_authorization.setLineItemValue('item', 'quantity', i, add_line.quantity);
				return_authorization.setLineItemValue('item', 'description', i, add_line.reason);
			}
			else {
				return_authorization.removeLineItem('item', i);
			}

			i++;
		}

		return !add_line ? this.setLines(return_authorization, lines) : this;
	}

	, list: function (data) {
		'use strict';

		var is_multicurrency = context.getFeature('MULTICURRENCY')

			, amount_field = is_multicurrency ? 'fxamount' : 'amount'

			, filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			]

			, columns = [
				new nlobjSearchColumn('internalid', 'item')
				, new nlobjSearchColumn('type', 'item')
				, new nlobjSearchColumn('parent', 'item')
				, new nlobjSearchColumn('displayname', 'item')
				, new nlobjSearchColumn('storedisplayname', 'item')
				, new nlobjSearchColumn('internalid')
				, new nlobjSearchColumn('taxtotal')
				, new nlobjSearchColumn('rate')
				, new nlobjSearchColumn('total')
				, new nlobjSearchColumn('mainline')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('internalid')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('status')
				, new nlobjSearchColumn('options')
				, new nlobjSearchColumn('linesequencenumber').setSort()
				, new nlobjSearchColumn(amount_field)
				, new nlobjSearchColumn('quantity')
			]

			, return_authorizations = null;

		if (data.createdfrom) {
			filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', data.createdfrom));
		}

		this.setDateFromTo(data.from, data.to, filters);

		switch (data.sort) {
			case 'number':
				columns[12].setSort(data.order > 0);
				break;

			default:
				columns[10].setSort(data.order > 0);
				columns[11].setSort(data.order > 0);
		}

		if (is_multicurrency) {
			columns.push(new nlobjSearchColumn('currency'));
		}

		if (data.page) {
			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

			return_authorizations = Application.getPaginatedSearchResults({
				record_type: 'returnauthorization'
				, filters: filters
				, columns: columns
				, page: data.page
			});

			return_authorizations.records = _.map(return_authorizations.records, function (record) {
				return {
					internalid: record.getId()
					, status: record.getText('status')
					, tranid: record.getValue('tranid')
					, date: record.getValue('trandate')

					, summary: {
						total: toCurrency(record.getValue('total'))
						, total_formatted: formatCurrency(record.getValue('total'))
					}

					, currency: is_multicurrency ? {
						internalid: record.getValue('currency')
						, name: record.getText('currency')
					} : null
				};
			});
		}
		else {
			return_authorizations = this.parseResults(Application.getAllSearchResults('returnauthorization', filters, columns));
		}

		return return_authorizations;
	}

	, setDateFromTo: function (from, to, filters) {
		'use strict';

		if (from) {
			filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', this.setDateInt(from), null));
		}

		if (to) {
			filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', this.setDateInt(to), null));
		}
	}

	, setDateInt: function (date) {
		'use strict';

		var offset = new Date().getTimezoneOffset() * 60 * 1000;

		return new Date(parseInt(date, 10) + offset);
	}

	, parseResults: function (return_authorizations) {
		'use strict';

		var return_address = context.getPreference('returnaddresstext')
			, is_multicurrency = context.getFeature('MULTICURRENCY')
			, amount_field = is_multicurrency ? 'fxamount' : 'amount'
			, store_item = Application.getModel('StoreItem')
			, return_authorization_id = 0
			, current_return = null
			, grouped_result = {};

		// the query returns the transaction headers mixed with the lines so we have to group the returns authorization
		_.each(return_authorizations, function (returnauthorization) {
			return_authorization_id = returnauthorization.getId();
			// create the return authorization
			if (!grouped_result[return_authorization_id]) {
				grouped_result[return_authorization_id] = { lines: [] };
			}

			current_return = grouped_result[return_authorization_id];

			// asterisk means true
			if (returnauthorization.getValue('mainline') === '*' || !current_return.internalid) {
				// if it's the mainline we add some fields
				_.extend(current_return, {
					internalid: returnauthorization.getValue('internalid')
					, status: returnauthorization.getText('status')
					, date: returnauthorization.getValue('trandate')
					, summary: {
						total: toCurrency(returnauthorization.getValue('total'))
						, total_formatted: formatCurrency(returnauthorization.getValue('total'))
					}
					, type: 'returnauthorization'
					, tranid: returnauthorization.getValue('tranid')
					, currency: is_multicurrency ? {
						internalid: returnauthorization.getValue('currency')
						, name: returnauthorization.getText('currency')
					} : null
				});

				// it the autorizhation is approved, add the return's information
				if (returnauthorization.getValue('status') !== 'pendingApproval') {
					current_return.order_number = returnauthorization.getValue('tranid');
					current_return.return_address = return_address;
				}
			}

			if (returnauthorization.getValue('mainline') !== '*') {
				// if it's a line, we add it to the lines collection of the return authorization
				// TODO: find the proper field for the internalid instead of building it
				current_return.lines.push({
					internalid: returnauthorization.getValue('internalid') + '_' + returnauthorization.getValue('linesequencenumber')
					, quantity: returnauthorization.getValue('quantity')
					, rate: toCurrency(returnauthorization.getValue('rate'))
					, amount: toCurrency(returnauthorization.getValue(amount_field))
					, tax_amount: toCurrency(returnauthorization.getValue('taxtotal'))
					, total: toCurrency(returnauthorization.getValue('total'))

					, options: getItemOptionsObject(returnauthorization.getValue('options'))
					// add item information to order's line, the storeitem collection was preloaded in the getOrderLines function
					, item: store_item.get(
						returnauthorization.getValue('internalid', 'item')
						, returnauthorization.getValue('type', 'item')
					)
				});
			}
		});

		return _.values(grouped_result);
	}
});


//Model.js
/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https://groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
// LiveOrder.js
// -------
// Defines the model used by the live-order.ss service
// Available methods allow fetching and updating Shopping Cart's data
Application.defineModel('LiveOrder', {

	get: function () {
		'use strict';

		var order_fields = this.getFieldValues()
			, result = {};

		try {
			result.lines = this.getLines(order_fields);
		}
		catch (e) {
			if (e.code === 'ERR_CHK_ITEM_NOT_FOUND' || e.code === 'ERR_CHK_DISABLED_MST') {
				return this.get();
			}
			else {
				throw e;
			}
		}

		order_fields = this.hidePaymentPageWhenNoBalance(order_fields);

		result.lines_sort = this.getLinesSort();
		result.latest_addition = context.getSessionObject('latest_addition');

		result.promocode = this.getPromoCode(order_fields);

		result.ismultishipto = this.getIsMultiShipTo(order_fields);
		// Ship Methods
		if (result.ismultishipto) {
			result.multishipmethods = this.getMultiShipMethods(result.lines);

			// These are set so it is compatible with non multiple shipping.
			result.shipmethods = [];
			result.shipmethod = null;
		}
		else {
			result.shipmethods = this.getShipMethods(order_fields);
			result.shipmethod = order_fields.shipmethod ? order_fields.shipmethod.shipmethod : null;
		}

		// Addresses
		result.addresses = this.getAddresses(order_fields);
		result.billaddress = order_fields.billaddress ? order_fields.billaddress.internalid : null;
		result.shipaddress = !result.ismultishipto ? order_fields.shipaddress.internalid : null;

		// Payment
		result.paymentmethods = this.getPaymentMethods(order_fields);

		// Paypal complete
		result.isPaypalComplete = context.getSessionObject('paypal_complete') === 'T';

		// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
		result.touchpoints = session.getSiteSettings(['touchpoints']).touchpoints;

		// Terms And Conditions
		result.agreetermcondition = order_fields.agreetermcondition === 'T';

		// Summary
		result.summary = order_fields.summary;

		// Transaction Body Field
		result.options = this.getTransactionBodyField();

		return result;
	}

	, update: function (data) {
		'use strict';

		var current_order = this.get();

		// Only do this if it's capable of shipping multiple items.
		if (this.isMultiShippingEnabled) {
			if (this.isSecure && this.isLoggedIn) {
				order.setEnableItemLineShipping(!!data.ismultishipto);
			}

			// Do the following only if multishipto is active (is the data recevie determine that MST is enabled and pass the MST Validation)
			if (data.ismultishipto) {
				order.removeShippingAddress();

				order.removeShippingMethod();

				this.removePromoCode(current_order);

				this.splitLines(data, current_order);

				this.setShippingAddressAndMethod(data, current_order);
			}
		}

		if (!this.isMultiShippingEnabled || !data.ismultishipto) {

			this.setShippingAddress(data, current_order);

			this.setShippingMethod(data, current_order);

			this.setPromoCode(data, current_order);
		}

		this.setBillingAddress(data, current_order);

		this.setPaymentMethods(data);

		this.setTermsAndConditions(data);

		this.setTransactionBodyField(data);

	}

	, submit: function () {
		'use strict';

		var paypal_address = _.find(customer.getAddressBook(), function (address) { return !address.phone && address.isvalid === 'T'; })
			, confirmation = order.submit();
		// We need remove the paypal's address because after order submit the address is invalid for the next time.
		this.removePaypalAddress(paypal_address);

		context.setSessionObject('paypal_complete', 'F');

		if (this.isMultiShippingEnabled) {
			order.setEnableItemLineShipping(false); // By default non order should be MST
		}

		return confirmation;
	}

	, isSecure: request.getURL().indexOf('https') === 0

	, isLoggedIn: session.isLoggedIn()

	, isMultiShippingEnabled: context.getSetting('FEATURE', 'MULTISHIPTO') === 'T' && SC.Configuration.isMultiShippingEnabled

	, addAddress: function (address, addresses) {
		'use strict';

		if (!address) {
			return null;
		}

		addresses = addresses || {};

		if (!address.fullname) {
			address.fullname = address.attention ? address.attention : address.addressee;
		}

		if (!address.company) {
			address.company = address.attention ? address.addressee : null;
		}

		delete address.attention;
		delete address.addressee;

		if (!address.internalid) {
			address.internalid = (address.country || '') + '-' +
				(address.state || '') + '-' +
				(address.city || '') + '-' +
				(address.zip || '') + '-' +
				(address.addr1 || '') + '-' +
				(address.addr2 || '') + '-' +
				(address.fullname || '') + '-' +
				address.company;

			address.internalid = address.internalid.replace(/\s/g, '-');
		}

		if (address.internalid !== '-------null') {
			addresses[address.internalid] = address;
		}

		return address.internalid;
	}

	, hidePaymentPageWhenNoBalance: function (order_fields) {
		'use strict';

		if (this.isSecure && this.isLoggedIn && order_fields.payment && session.getSiteSettings(['checkout']).checkout.hidepaymentpagewhennobalance === 'T' && order_fields.summary.total === 0) {
			order.removePayment();
			order_fields = this.getFieldValues();
		}
		return order_fields;
	}

	, redirectToPayPal: function () {
		'use strict';

		var touchpoints = session.getSiteSettings(['touchpoints']).touchpoints
			, continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
			, joint = ~continue_url.indexOf('?') ? '&' : '?';

		continue_url = continue_url + joint + 'paypal=DONE&fragment=' + request.getParameter('next_step');

		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
			, continueurl: continue_url
			, createorder: 'F'
			, type: 'paypalexpress'
			, shippingaddrfirst: 'T'
			, showpurchaseorder: 'T'
		});
	}

	, redirectToPayPalExpress: function () {
		'use strict';

		var touchpoints = session.getSiteSettings(['touchpoints']).touchpoints
			, continue_url = 'https://' + request.getHeader('Host') + touchpoints.checkout
			, joint = ~continue_url.indexOf('?') ? '&' : '?';

		continue_url = continue_url + joint + 'paypal=DONE';

		session.proceedToCheckout({
			cancelurl: touchpoints.viewcart
			, continueurl: continue_url
			, createorder: 'F'
			, type: 'paypalexpress'
		});
	}

	, backFromPayPal: function () {
		'use strict';

		var Profile = Application.getModel('Profile')
			, customer_values = Profile.get()
			, bill_address = order.getBillingAddress()
			, ship_address = order.getShippingAddress();

		if (customer_values.isGuest === 'T' && session.getSiteSettings(['registration']).registration.companyfieldmandatory === 'T') {
			customer_values.companyname = 'Guest Shopper';
			customer.updateProfile(customer_values);
		}

		if (ship_address.internalid && ship_address.isvalid === 'T' && !bill_address.internalid) {
			order.setBillingAddress(ship_address.internalid);
		}

		context.setSessionObject('paypal_complete', 'T');
	}

	// remove the shipping address or billing address if phone number is null (address not valid created by Paypal.)

	, removePaypalAddress: function (paypal_address) {
		'use strict';

		try {
			if (paypal_address && paypal_address.internalid) {
				customer.removeAddress(paypal_address.internalid);
			}
		}
		catch (e) {
			// ignore this exception, it is only for the cases that we can't remove paypal's address.
			// This exception will not send to the front-end
			var error = Application.processError(e);
			console.log('Error ' + error.errorStatusCode + ': ' + error.errorCode + ' - ' + error.errorMessage);
		}
	}

	, addLine: function (line_data) {
		'use strict';

		// Adds the line to the order
		var line_id = order.addItem({
			internalid: line_data.item.internalid.toString()
			, quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
			, options: line_data.options || {}
		});


		if (this.isMultiShippingEnabled) {
			// Sets it ship address (if present)
			line_data.shipaddress && order.setItemShippingAddress(line_id, line_data.shipaddress);

			// Sets it ship method (if present)
			line_data.shipmethod && order.setItemShippingMethod(line_id, line_data.shipmethod);
		}

		// Stores the latest addition
		context.setSessionObject('latest_addition', line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort.unshift(line_id);
		this.setLinesSort(lines_sort);

		return line_id;
	}

	, addLines: function (lines_data) {
		'use strict';

		var items = [];

		_.each(lines_data, function (line_data) {
			var item = {
				internalid: line_data.item.internalid.toString()
				, quantity: _.isNumber(line_data.quantity) ? parseInt(line_data.quantity, 10) : 1
				, options: line_data.options || {}
			};

			items.push(item);
		});

		var lines_ids = order.addItems(items)
			, latest_addition = _.last(lines_ids).orderitemid
			// Stores the current order
			, lines_sort = this.getLinesSort();

		lines_sort.unshift(latest_addition);
		this.setLinesSort(lines_sort);

		context.setSessionObject('latest_addition', latest_addition);

		return lines_ids;
	}

	, removeLine: function (line_id) {
		'use strict';

		// Removes the line
		order.removeItem(line_id);

		// Stores the current order
		var lines_sort = this.getLinesSort();
		lines_sort = _.without(lines_sort, line_id);
		this.setLinesSort(lines_sort);
	}

	, updateLine: function (line_id, line_data) {
		'use strict';

		var lines_sort = this.getLinesSort()
			, current_position = _.indexOf(lines_sort, line_id)
			, original_line_object = order.getItem(line_id);

		this.removeLine(line_id);

		if (!_.isNumber(line_data.quantity) || line_data.quantity > 0) {
			var new_line_id;
			try {
				new_line_id = this.addLine(line_data);
			}
			catch (e) {
				// we try to roll back the item to the original state
				var roll_back_item = {
					item: { internalid: parseInt(original_line_object.internalid, 10) }
					, quantity: parseInt(original_line_object.quantity, 10)
				};

				if (original_line_object.options && original_line_object.options.length) {
					roll_back_item.options = {};
					_.each(original_line_object.options, function (option) {
						roll_back_item.options[option.id.toLowerCase()] = option.value;
					});
				}

				new_line_id = this.addLine(roll_back_item);

				e.errorDetails = {
					status: 'LINE_ROLLBACK'
					, oldLineId: line_id
					, newLineId: new_line_id
				};

				throw e;
			}

			lines_sort = _.without(lines_sort, line_id, new_line_id);
			lines_sort.splice(current_position, 0, new_line_id);
			this.setLinesSort(lines_sort);
		}
	}

	, splitLines: function (data, current_order) {
		'use strict';
		_.each(data.lines, function (line) {
			if (line.splitquantity) {
				var splitquantity = typeof line.splitquantity === 'string' ? parseInt(line.splitquantity, 10) : line.splitquantity
					, original_line = _.find(current_order.lines, function (order_line) {
						return order_line.internalid === line.internalid;
					})
					, remaining = original_line ? (original_line.quantity - splitquantity) : -1;

				if (remaining > 0 && splitquantity > 0) {
					order.splitItem({
						'orderitemid': original_line.internalid
						, 'quantities': [
							splitquantity
							, remaining
						]
					});
				}
			}
		});
	}

	, removePromoCode: function (current_order) {
		'use strict';
		if (current_order.promocode && current_order.promocode.code) {
			order.removePromotionCode(current_order.promocode.code);
		}
	}

	, getFieldValues: function () {
		'use strict';

		var order_field_keys = this.isSecure ? SC.Configuration.order_checkout_field_keys : SC.Configuration.order_shopping_field_keys;

		if (this.isMultiShippingEnabled) {
			if (!_.contains(order_field_keys.items, 'shipaddress')) {
				order_field_keys.items.push('shipaddress');
			}
			if (!_.contains(order_field_keys.items, 'shipmethod')) {
				order_field_keys.items.push('shipmethod');
			}
			order_field_keys.ismultishipto = null;
		}

		return order.getFieldValues(order_field_keys, false);
	}

	, getPromoCode: function (order_fields) {
		'use strict';

		if (order_fields.promocodes && order_fields.promocodes.length) {
			return {
				internalid: order_fields.promocodes[0].internalid
				, code: order_fields.promocodes[0].promocode
				, isvalid: true
			};
		}
		else {
			return null;
		}
	}

	, getMultiShipMethods: function (lines) {
		'use strict';
		// Get multi ship methods
		var multishipmethods = {};

		_.each(lines, function (line) {
			if (line.shipaddress) {
				multishipmethods[line.shipaddress] = multishipmethods[line.shipaddress] || [];

				multishipmethods[line.shipaddress].push(line.internalid);
			}
		});

		_.each(_.keys(multishipmethods), function (address) {
			var methods = order.getAvailableShippingMethods(multishipmethods[address], address);

			_.each(methods, function (method) {
				method.internalid = method.shipmethod;
				method.rate_formatted = formatCurrency(method.rate);
				delete method.shipmethod;
			});

			multishipmethods[address] = methods;
		});

		return multishipmethods;
	}

	, getShipMethods: function (order_fields) {
		'use strict';

		var shipmethods = _.map(order_fields.shipmethods, function (shipmethod) {
			var rate = toCurrency(shipmethod.rate.replace(/^\D+/g, '')) || 0;

			return {
				internalid: shipmethod.shipmethod
				, name: shipmethod.name
				, shipcarrier: shipmethod.shipcarrier
				, rate: rate
				, rate_formatted: shipmethod.rate
			};
		});

		return shipmethods;
	}

	, getLinesSort: function () {
		'use strict';
		return context.getSessionObject('lines_sort') ? context.getSessionObject('lines_sort').split(',') : [];
	}

	, getPaymentMethods: function (order_fields) {
		'use strict';
		var paymentmethods = []
			, giftcertificates = order.getAppliedGiftCertificates()
			, paypal = _.findWhere(session.getPaymentMethods(), { ispaypal: 'T' });

		if (order_fields.payment && order_fields.payment.creditcard && order_fields.payment.creditcard.paymentmethod && order_fields.payment.creditcard.paymentmethod.creditcard === 'T' && order_fields.payment.creditcard.paymentmethod.ispaypal !== 'T') {
			// Main
			var cc = order_fields.payment.creditcard;
			paymentmethods.push({
				type: 'creditcard'
				, primary: true
				, creditcard: {
					internalid: cc.internalid
					, ccnumber: cc.ccnumber
					, ccname: cc.ccname
					, ccexpiredate: cc.expmonth + '/' + cc.expyear
					, ccsecuritycode: cc.ccsecuritycode
					, expmonth: cc.expmonth
					, expyear: cc.expyear
					, paymentmethod: {
						internalid: cc.paymentmethod.internalid
						, name: cc.paymentmethod.name
						, creditcard: cc.paymentmethod.creditcard === 'T'
						, ispaypal: cc.paymentmethod.ispaypal === 'T'
					}
				}
			});
		}
		else if (order_fields.payment && paypal && paypal.internalid === order_fields.payment.paymentmethod) {
			paymentmethods.push({
				type: 'paypal'
				, primary: true
				, complete: context.getSessionObject('paypal_complete') === 'T'
			});
		}
		else if (order_fields.payment && order_fields.payment.paymentterms === 'Invoice') {
			var customer_invoice = customer.getFieldValues([
				'paymentterms'
				, 'creditlimit'
				, 'balance'
				, 'creditholdoverride'
			]);

			paymentmethods.push({
				type: 'invoice'
				, primary: true
				, paymentterms: customer_invoice.paymentterms
				, creditlimit: parseFloat(customer_invoice.creditlimit || 0)
				, creditlimit_formatted: formatCurrency(customer_invoice.creditlimit)
				, balance: parseFloat(customer_invoice.balance || 0)
				, balance_formatted: formatCurrency(customer_invoice.balance)
				, creditholdoverride: customer_invoice.creditholdoverride
				, purchasenumber: order_fields.purchasenumber
			});
		}

		if (giftcertificates && giftcertificates.length) {
			_.forEach(giftcertificates, function (giftcertificate) {
				paymentmethods.push({
					type: 'giftcertificate'
					, giftcertificate: {
						code: giftcertificate.giftcertcode

						, amountapplied: toCurrency(giftcertificate.amountapplied || 0)
						, amountapplied_formatted: formatCurrency(giftcertificate.amountapplied || 0)

						, amountremaining: toCurrency(giftcertificate.amountremaining || 0)
						, amountremaining_formatted: formatCurrency(giftcertificate.amountremaining || 0)

						, originalamount: toCurrency(giftcertificate.originalamount || 0)
						, originalamount_formatted: formatCurrency(giftcertificate.originalamount || 0)
					}
				});
			});
		}

		return paymentmethods;
	}

	, getTransactionBodyField: function () {
		'use strict';

		var options = {};

		if (this.isSecure) {
			_.each(order.getCustomFieldValues(), function (option) {
				options[option.name] = option.value;
			});

		}
		return options;
	}

	, getAddresses: function (order_fields) {
		'use strict';

		var self = this
			, addresses = {}
			, address_book = this.isLoggedIn && this.isSecure ? customer.getAddressBook() : [];

		address_book = _.object(_.pluck(address_book, 'internalid'), address_book);
		// General Addresses
		if (order_fields.ismultishipto === 'T') {
			_.each(order_fields.items || [], function (line) {
				if (line.shipaddress && !addresses[line.shipaddress]) {
					self.addAddress(address_book[line.shipaddress], addresses);
				}
			});
		}
		else {
			this.addAddress(order_fields.shipaddress, addresses);
		}

		this.addAddress(order_fields.billaddress, addresses);

		return _.values(addresses);
	}

	// Set Order Lines into the result
	// Standarizes the result of the lines

	, getLines: function (order_fields) {
		'use strict';

		var lines = [];
		if (order_fields.items && order_fields.items.length) {
			var self = this
				, items_to_preload = []
				, address_book = this.isLoggedIn && this.isSecure ? customer.getAddressBook() : []
				, item_ids_to_clean = []
				, non_shippable_items_count = 0;

			address_book = _.object(_.pluck(address_book, 'internalid'), address_book);

			_.each(order_fields.items, function (original_line) {
				// Total may be 0
				var total = (original_line.promotionamount) ? toCurrency(original_line.promotionamount) : toCurrency(original_line.amount)
					, discount = toCurrency(original_line.promotiondiscount) || 0
					, line_to_add
					, is_shippable = !_.contains(SC.Configuration.non_shippable_types, original_line.itemtype);

				line_to_add = {
					internalid: original_line.orderitemid
					, quantity: original_line.quantity
					, rate: parseFloat(original_line.rate)
					, rate_formatted: original_line.rate_formatted
					, amount: toCurrency(original_line.amount)
					, tax_amount: 0
					, tax_rate: null
					, tax_code: null
					, discount: discount
					, total: total
					, item: original_line.internalid
					, itemtype: original_line.itemtype
					, isshippable: is_shippable
					, options: original_line.options
					, shipaddress: original_line.shipaddress
					, shipmethod: original_line.shipmethod
				};

				lines.push(line_to_add);

				if (!is_shippable) {
					non_shippable_items_count++;
				}

				if (line_to_add.shipaddress && !address_book[line_to_add.shipaddress]) {
					line_to_add.shipaddress = null;
					line_to_add.shipmethod = null;
					item_ids_to_clean.push(line_to_add.internalid);
				}
				else {
					items_to_preload.push({
						id: original_line.internalid
						, type: original_line.itemtype
					});
				}
			});

			if (item_ids_to_clean.length) {
				order.setItemShippingAddress(item_ids_to_clean, null);
				order.setItemShippingMethod(item_ids_to_clean, null);
			}

			var store_item = Application.getModel('StoreItem')
				, restart = false;

			store_item.preloadItems(items_to_preload);

			lines.forEach(function (line) {
				line.item = store_item.get(line.item, line.itemtype);

				if (!line.item) {
					self.removeLine(line.internalid);
					restart = true;
				}
				else {
					line.rate_formatted = formatCurrency(line.rate);
					line.amount_formatted = formatCurrency(line.amount);
					line.tax_amount_formatted = formatCurrency(line.tax_amount);
					line.discount_formatted = formatCurrency(line.discount);
					line.total_formatted = formatCurrency(line.total);
				}
			});

			if (restart) {
				throw { code: 'ERR_CHK_ITEM_NOT_FOUND' };
			}

			if (this.getIsMultiShipTo(order_fields) && non_shippable_items_count) {
				order.setEnableItemLineShipping(false);
				throw { code: 'ERR_CHK_DISABLED_MST' };
			}

			// Sort the items in the order they were added, this is because the update operation alters the order
			// TODO Check if this is necessary when instead of removing line on edition, lines are updated correctly
			var lines_sort = this.getLinesSort();

			if (lines_sort.length) {
				lines = _.sortBy(lines, function (line) {
					return _.indexOf(lines_sort, line.internalid);
				});
			}
			else {
				this.setLinesSort(_.pluck(lines, 'internalid'));
			}
		}

		return lines;
	}

	, getIsMultiShipTo: function (order_fields) {
		'use strict';
		return this.isMultiShippingEnabled && order_fields.ismultishipto === 'T';
	}

	, setLinesSort: function (lines_sort) {
		'use strict';
		return context.setSessionObject('lines_sort', lines_sort || []);
	}

	, setBillingAddress: function (data, current_order) {
		'use strict';

		if (data.sameAs) {
			data.billaddress = data.shipaddress;
		}

		if (data.billaddress !== current_order.billaddress) {
			if (data.billaddress) {
				if (data.billaddress && !~data.billaddress.indexOf('null')) {
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setBillingAddress(new String(data.billaddress).toString());
				}
			}
			else if (this.isSecure) {
				order.removeBillingAddress();
			}
		}
	}

	, setShippingAddressAndMethod: function (data, current_order) {
		'use strict';

		var current_package
			, packages = {}
			, item_ids_to_clean = []
			, original_line;

		_.each(data.lines, function (line) {
			original_line = _.find(current_order.lines, function (order_line) {
				return order_line.internalid === line.internalid;
			});

			if (original_line && original_line.isshippable) {
				if (line.shipaddress) {
					packages[line.shipaddress] = packages[line.shipaddress] || {
						shipMethodId: null,
						itemIds: []
					};

					packages[line.shipaddress].itemIds.push(line.internalid);
					if (!packages[line.shipaddress].shipMethodId && line.shipmethod) {
						packages[line.shipaddress].shipMethodId = line.shipmethod;
					}
				}
				else {
					item_ids_to_clean.push(line.internalid);
				}
			}
		});

		//CLEAR Shipping address and shipping methods
		if (item_ids_to_clean.length) {
			order.setItemShippingAddress(item_ids_to_clean, null);
			order.setItemShippingMethod(item_ids_to_clean, null);
		}

		//SET Shipping address and shipping methods
		_.each(_.keys(packages), function (address_id) {
			current_package = packages[address_id];
			order.setItemShippingAddress(current_package.itemIds, parseInt(address_id, 10));

			if (current_package.shipMethodId) {
				order.setItemShippingMethod(current_package.itemIds, parseInt(current_package.shipMethodId, 10));
			}
		});
	}

	, setShippingAddress: function (data, current_order) {
		'use strict';

		if (data.shipaddress !== current_order.shipaddress) {
			if (data.shipaddress) {
				if (this.isSecure && !~data.shipaddress.indexOf('null')) {
					// Heads Up!: This "new String" is to fix a nasty bug
					order.setShippingAddress(new String(data.shipaddress).toString());
				}
				else {
					var address = _.find(data.addresses, function (address) {
						return address.internalid === data.shipaddress;
					});

					address && order.estimateShippingCost(address);
				}
			}
			else if (this.isSecure) {
				order.removeShippingAddress();
			}
			else {
				order.estimateShippingCost({
					zip: null
					, country: null
				});
			}
		}
	}

	, setPaymentMethods: function (data) {
		'use strict';

		// Because of an api issue regarding Gift Certificates, we are going to handle them separately
		var gift_certificate_methods = _.where(data.paymentmethods, { type: 'giftcertificate' })
			, non_certificate_methods = _.difference(data.paymentmethods, gift_certificate_methods);

		// Payment Methods non gift certificate
		if (this.isSecure && non_certificate_methods && non_certificate_methods.length && this.isLoggedIn) {
			_.sortBy(non_certificate_methods, 'primary').forEach(function (paymentmethod) {

				if (paymentmethod.type === 'creditcard' && paymentmethod.creditcard) {

					var credit_card = paymentmethod.creditcard
						, require_cc_security_code = session.getSiteSettings(['checkout']).checkout.requireccsecuritycode === 'T'
						, cc_obj = credit_card && {
							internalid: credit_card.internalid
							, ccnumber: credit_card.ccnumber
							, ccname: credit_card.ccname
							, ccexpiredate: credit_card.ccexpiredate
							, expmonth: credit_card.expmonth
							, expyear: credit_card.expyear
							, paymentmethod: {
								internalid: credit_card.paymentmethod.internalid
								, name: credit_card.paymentmethod.name
								, creditcard: credit_card.paymentmethod.creditcard ? 'T' : 'F'
								, ispaypal: credit_card.paymentmethod.ispaypal ? 'T' : 'F'
							}
						};

					if (credit_card.ccsecuritycode) {
						cc_obj.ccsecuritycode = credit_card.ccsecuritycode;
					}

					if (!require_cc_security_code || require_cc_security_code && credit_card.ccsecuritycode) {
						// the user's default credit card may be expired so we detect this using try&catch and if it is we remove the payment methods.
						try {
							order.removePayment();

							order.setPayment({
								paymentterms: 'CreditCard'
								, creditcard: cc_obj
							});

							context.setSessionObject('paypal_complete', 'F');
						}
						catch (e) {
							if (e && e.code && e.code === 'ERR_WS_INVALID_PAYMENT') {
								order.removePayment();
							}
							throw e;
						}
					}
					// if the the given credit card don't have a security code and it is required we just remove it from the order
					else if (require_cc_security_code && !credit_card.ccsecuritycode) {
						order.removePayment();
					}
				}
				else if (paymentmethod.type === 'invoice') {
					order.removePayment();

					order.setPayment({ paymentterms: 'Invoice' });

					paymentmethod.purchasenumber && order.setPurchaseNumber(paymentmethod.purchasenumber);

					context.setSessionObject('paypal_complete', 'F');
				}
				else if (paymentmethod.type === 'paypal' && context.getSessionObject('paypal_complete') === 'F') {
					order.removePayment();

					var paypal = _.findWhere(session.getPaymentMethods(), { ispaypal: 'T' });
					paypal && order.setPayment({ paymentterms: '', paymentmethod: paypal.internalid });
				}
			});
		}
		else if (this.isSecure && this.isLoggedIn) {
			order.removePayment();
		}

		gift_certificate_methods = _.map(gift_certificate_methods, function (gift_certificate) { return gift_certificate.giftcertificate; });
		this.setGiftCertificates(gift_certificate_methods);
	}

	, setGiftCertificates: function (gift_certificates) {
		'use strict';

		// Remove all gift certificates so we can re-enter them in the appropriate order
		order.removeAllGiftCertificates();

		_.forEach(gift_certificates, function (gift_certificate) {
			order.applyGiftCertificate(gift_certificate.code);
		});
	}

	, setShippingMethod: function (data, current_order) {
		'use strict';
		if ((!this.isMultiShippingEnabled || !data.ismultishipto) && this.isSecure && data.shipmethod !== current_order.shipmethod) {
			var shipmethod = _.findWhere(current_order.shipmethods, { internalid: data.shipmethod });

			if (shipmethod) {
				order.setShippingMethod({
					shipmethod: shipmethod.internalid
					, shipcarrier: shipmethod.shipcarrier
				});
			}
			else {
				order.removeShippingMethod();
			}
		}
	}

	, setPromoCode: function (data, current_order) {
		'use strict';
		if (data.promocode && (!current_order.promocode || data.promocode.code !== current_order.promocode.code)) {
			try {
				order.applyPromotionCode(data.promocode.code);
			}
			catch (e) {
				order.removePromotionCode(data.promocode.code);
				current_order.promocode && order.removePromotionCode(current_order.promocode.code);
				throw e;
			}
		}
		else if (!data.promocode && current_order.promocode) {
			order.removePromotionCode(current_order.promocode.code);
		}
	}

	, setTermsAndConditions: function (data) {
		'use strict';
		var require_terms_and_conditions = session.getSiteSettings(['checkout']).checkout.requiretermsandconditions;

		if (require_terms_and_conditions.toString() === 'T' && this.isSecure && !_.isUndefined(data.agreetermcondition)) {
			order.setTermsAndConditions(data.agreetermcondition);
		}
	}

	, setTransactionBodyField: function (data) {
		'use strict';
		// Transaction Body Field
		if (this.isSecure && !_.isEmpty(data.options)) {
			order.setCustomFieldValues(data.options);
		}
	}

});


//Model.js
// OrderItem.js
// ----------
// Handles fetching of ordered items
Application.defineModel('OrderItem', {

	search: function (order_id, query, query_filters) {
		'use strict';

		var filters = [
			new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			, new nlobjSearchFilter('quantity', null, 'greaterthan', 0)
			, new nlobjSearchFilter('mainline', null, 'is', 'F')
			, new nlobjSearchFilter('cogs', null, 'is', 'F')
			, new nlobjSearchFilter('taxline', null, 'is', 'F')
			, new nlobjSearchFilter('shipping', null, 'is', 'F')
			, new nlobjSearchFilter('transactiondiscount', null, 'is', 'F')
			, new nlobjSearchFilter('isonline', 'item', 'is', 'T')
			, new nlobjSearchFilter('isinactive', 'item', 'is', 'F')
			, new nlobjSearchFilter('type', 'item', 'noneof', 'GiftCert')
		]

			, columns = [
				new nlobjSearchColumn('internalid', 'item', 'group')
				, new nlobjSearchColumn('type', 'item', 'group')
				, new nlobjSearchColumn('parent', 'item', 'group')
				, new nlobjSearchColumn('options', null, 'group')
				// to sort by price we fetch the max onlinecustomerprice
				, new nlobjSearchColumn('onlinecustomerprice', 'item', 'max')
				// to sort by recently purchased we grab the last date the item was purchased
				, new nlobjSearchColumn('trandate', null, 'max')
				// to sort by frequently purchased we count the number of orders which contains an item
				, new nlobjSearchColumn('internalid', null, 'count')
			]

			, item_name = new nlobjSearchColumn('formulatext', 'item', 'group');

		// when sorting by name, if the item has displayname we sort by that field, if not we sort by itemid
		item_name.setFormula('case when LENGTH({item.displayname}) > 0 then {item.displayname} else {item.itemid} end');

		columns.push(item_name);

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && session.getSiteSettings(['siteid'])) {
			filters.push(new nlobjSearchFilter('website', 'item', 'is', session.getSiteSettings(['siteid']).siteid));
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [session.getSiteSettings(['siteid']).siteid, '@NONE@']));
		}

		// show only items from one order
		if (order_id) {
			filters.push(new nlobjSearchFilter('internalid', null, 'is', order_id));
			columns.push(new nlobjSearchColumn('tranid', null, 'group'));
		}

		if (query_filters.date.from && query_filters.date.to) {
			var offset = new Date().getTimezoneOffset() * 60 * 1000;
			filters.push(new nlobjSearchFilter('trandate', null, 'within', new Date(parseInt(query_filters.date.from, 10) + offset), new Date(parseInt(query_filters.date.to, 10) + offset)));
		}

		if (query) {
			filters.push(
				new nlobjSearchFilter('itemid', 'item', 'contains', query).setLeftParens(true).setOr(true)
				, new nlobjSearchFilter('displayname', 'item', 'contains', query).setRightParens(true)
			);
		}

		// select field to sort by
		switch (query_filters.sort) {
			// sort by name
			case 'name':
				item_name.setSort(query_filters.order > 0);
				break;

			// sort by price
			case 'price':
				columns[4].setSort(query_filters.order > 0);
				break;

			// sort by recently purchased
			case 'date':
				columns[5].setSort(query_filters.order > 0);
				break;

			// sort by frequenlty purchased
			case 'quantity':
				columns[6].setSort(query_filters.order > 0);
				break;

			default:
				columns[6].setSort(true);
				break;
		}
		// fetch items
		var result = Application.getPaginatedSearchResults({
			record_type: 'salesorder'
			, filters: filters
			, columns: columns
			, page: query_filters.page
			, column_count: new nlobjSearchColumn('formulatext', null, 'count').setFormula('CONCAT({item}, {options})')
		})
			// prepare an item collection, this will be used to preload item's details
			, items_info = _.map(result.records, function (line) {
				return {
					id: line.getValue('internalid', 'item', 'group')
					, type: line.getValue('type', 'item', 'group')
				};
			});

		if (items_info.length) {
			var store_item = Application.getModel('StoreItem');

			// preload order's items information
			store_item.preloadItems(items_info);

			result.records = _.map(result.records, function (line) {
				// prepare the collection for the frontend
				return {
					item: store_item.get(line.getValue('internalid', 'item', 'group'), line.getValue('type', 'item', 'group'))
					, tranid: line.getValue('tranid', null, 'group') || null
					, options_object: getItemOptionsObject(line.getValue('options', null, 'group'))
					, trandate: line.getValue('trandate', null, 'max')
				};
			});
		}

		return result;
	}
});

//Model.js
// Receipts.js
// ----------
// Handles fetching receipts

var PlacedOrder = Application.getModel('PlacedOrder');

Application.defineModel('Receipts', _.extend({}, PlacedOrder, {

	_getReceiptType: function (type) {
		'use strict';

		var receipt_type = ['CustInvc', 'CashSale'];

		if (type === 'invoice') {
			receipt_type = ['CustInvc'];
		}
		else if (type === 'cashsale') {
			receipt_type = ['CashSale'];
		}

		return receipt_type;
	}

	, _getReceiptStatus: function (type, status) {
		'use strict';

		if (type === 'CustInvc') {
			status = this._getInvoiceStatus(status);
		}
		else if (type === 'CashSale') {
			status = this._getCashSaleStatus(status);
		}

		return type + ':' + status;
	}

	, _getCashSaleStatus: function (status) {
		'use strict';

		var response = null;

		switch (status) {
			case 'unapproved':
				response = 'A';
				break;

			case 'notdeposited':
				response = 'B';
				break;

			case 'deposited':
				response = 'C';
				break;
		}

		return response;
	}

	, _getInvoiceStatus: function (status) {
		'use strict';

		var response = null;

		switch (status) {
			case 'open':
				response = 'A';
				break;

			case 'paid':
				response = 'B';
				break;
		}

		return response;
	}

	// gets all the user's receipts
	, list: function (options) {
		'use strict';

		options = options || {};

		var reciept_type = this._getReceiptType(options.type)
			, isMultiCurrency = context.getFeature('MULTICURRENCY')
			, settings_site_id = session.getSiteSettings(['siteid'])
			, site_id = settings_site_id && settings_site_id.siteid
			, amount_field = isMultiCurrency ? 'fxamount' : 'amount'
			, filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
				, new nlobjSearchFilter('type', null, 'anyof', reciept_type)
			]

			, columns = [
				new nlobjSearchColumn('internalid')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('status')
				, new nlobjSearchColumn('type')
				, new nlobjSearchColumn('closedate')
				, new nlobjSearchColumn('mainline')
				, new nlobjSearchColumn('duedate').setSort()
				, new nlobjSearchColumn(amount_field)
				, new nlobjSearchColumn('tranid','createdfrom')
				, new nlobjSearchColumn('custbody_customer_name','createdfrom')
			]
			, amount_remaining;
			var customer = new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			customer.isor = true;
			customer.leftparens = 1;
			filters.push(customer);
			var parent = new nlobjSearchFilter('parent', 'entity', 'is', nlapiGetUser())
		if (isMultiCurrency) {
			amount_remaining = new nlobjSearchColumn('formulanumeric').setFormula('{amountremaining} / {exchangerate}');
		}
		else {
			amount_remaining = new nlobjSearchColumn('amountremaining');
		}

		columns.push(amount_remaining);

		// if the store has multiple currencies we add the currency column to the query
		if (isMultiCurrency) {
			columns.push(new nlobjSearchColumn('currency'));
		}

		// if the site is multisite we add the siteid to the search filter
		if (context.getFeature('MULTISITE') && site_id) {
			filters.push(new nlobjSearchFilter('website', null, 'anyof', [site_id, '@NONE@']));
		}

		if (options.status) {
			var self = this;

			filters.push(
				new nlobjSearchFilter('status', null, 'anyof', _.map(reciept_type, function (type) {
					return self._getReceiptStatus(type, options.status);
				}))
			);
		}

		if (options.orderid) {
			filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', options.orderid));
		}

		if (options.internalid) {
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', options.internalid));
		}

		var results = Application.getAllSearchResults(options.type === 'invoice' ? 'invoice' : 'transaction', filters, columns)
			, now = new Date().getTime();


		return _.map(results || [], function (record) {

			var due_date = record.getValue('duedate')
				, close_date = record.getValue('closedate')
				, tran_date = record.getValue('trandate')
				, due_in_milliseconds = due_date?nlapiStringToDate(due_date).getTime() - now:0//new Date(due_date).getTime() - now
				, total = toCurrency(record.getValue(amount_field))
				, total_formatted = formatCurrency(record.getValue(amount_field));

			return {
				internalid: record.getId()
				, tranid: record.getValue('tranid')
				, order_number: record.getValue('tranid') // Legacy attribute
				, date: tran_date // Legacy attribute
				, summary: { // Legacy attribute
					total: total
					, total_formatted: total_formatted
				}
				, total: total
				, total_formatted: total_formatted
				, recordtype: record.getValue('type')
				, mainline: record.getValue('mainline')
				, amountremaining: toCurrency(record.getValue(amount_remaining))
				, amountremaining_formatted: formatCurrency(record.getValue(amount_remaining))
				, closedate: close_date
				, closedateInMilliseconds: close_date?nlapiStringToDate(close_date).getTime():0//new Date(close_date).getTime()
				, trandate: tran_date
				, custbody_customer_name: record.getValue('custbody_customer_name','createdfrom')
				, createdfrom: record.getValue('tranid','createdfrom')
				, tranDateInMilliseconds: tran_date?nlapiStringToDate(tran_date).getTime():0//new Date(tran_date).getTime()
				, duedate: due_date
				, dueinmilliseconds: due_in_milliseconds
				, isOverdue: due_in_milliseconds <= 0 && ((-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24) >= 1
				, status: {
					internalid: record.getValue('status')
					, name: record.getText('status')
				}
				, currency: {
					internalid: record.getValue('currency')
					, name: record.getText('currency')
				}

			};
		});

	}

	, setAdjustments: function (receipt, result) {
		'use strict';

		result.payments = [];
		result.credit_memos = [];
		result.deposit_applications = [];

		var filters = [
			new nlobjSearchFilter('appliedtotransaction', null, 'is', receipt.getId())
			, new nlobjSearchFilter('type', null, 'anyof', ['CustCred', 'DepAppl', 'CustPymt'])
		]
			, columns = [
				new nlobjSearchColumn('total')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('status')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('appliedtotransaction')
				, new nlobjSearchColumn('amountremaining')
				, new nlobjSearchColumn('amountpaid')
				, new nlobjSearchColumn('amount')
				, new nlobjSearchColumn('type')
				, new nlobjSearchColumn('appliedtoforeignamount')

			]
			, searchresults = nlapiSearchRecord('transaction', null, filters, columns);

		if (searchresults) {
			_.each(searchresults, function (payout) {
				var array = (payout.getValue('type') === 'CustPymt') ? result.payments :
					(payout.getValue('type') === 'CustCred') ? result.credit_memos :
						(payout.getValue('type') === 'DepAppl') ? result.deposit_applications : null;

				if (array) {
					var internal_id = payout.getId()
						, duplicated_item = _.findWhere(array, { internalid: internal_id });

					if (!duplicated_item) {
						array.push({
							internalid: internal_id
							, tranid: payout.getValue('tranid')
							, appliedtoforeignamount: toCurrency(payout.getValue('appliedtoforeignamount'))
							, appliedtoforeignamount_formatted: formatCurrency(payout.getValue('appliedtoforeignamount'))

						});
					}
					else {
						duplicated_item.appliedtoforeignamount += toCurrency(payout.getValue('appliedtoforeignamount'));
						duplicated_item.appliedtoforeignamount_formatted = formatCurrency(duplicated_item.appliedtoforeignamount);
					}
				}
			});
		}
	}

	, setSalesRep: function (receipt, result) {
		'use strict';

		var salesrep_id = receipt.getFieldValue('salesrep')
			, salesrep_name = receipt.getFieldText('salesrep');

		if (salesrep_id) {
			result.salesrep = {
				name: salesrep_name
				, internalid: salesrep_id
			};

			var filters = [
				new nlobjSearchFilter('internalid', null, 'is', receipt.getId())
				, new nlobjSearchFilter('internalid', 'salesrep', 'is', 'salesrep')
			]

				, columns = [
					new nlobjSearchColumn('duedate')
					, new nlobjSearchColumn('salesrep')
					, new nlobjSearchColumn('email', 'salesrep')
					, new nlobjSearchColumn('entityid', 'salesrep')
					, new nlobjSearchColumn('mobilephone', 'salesrep')
					, new nlobjSearchColumn('fax', 'salesrep')
				];

			var search_results = nlapiSearchRecord('invoice', null, filters, columns);

			if (search_results) {
				var invoice = search_results[0];
				result.salesrep.phone = invoice.getValue('phone', 'salesrep');
				result.salesrep.email = invoice.getValue('email', 'salesrep');
				result.salesrep.fullname = invoice.getValue('entityid', 'salesrep');
				result.salesrep.mobilephone = invoice.getText('mobilephone', 'salesrep');
				result.salesrep.fax = invoice.getValue('fax', 'salesrep');
			}
		}
	}

	, get: function (id, type) {
		'use strict';
		// get the transaction header
		var filters = [
			new nlobjSearchFilter('mainline', null, 'is', 'T')
			, new nlobjSearchFilter('type', null, 'anyof', this._getReceiptType(type))
			, new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
			, new nlobjSearchFilter('internalid', null, 'is', id)
		]
			// TODO: review this code.
			, columns = [
				new nlobjSearchColumn('status')
				, new nlobjSearchColumn('createdfrom')
				, new nlobjSearchColumn('total')
				, new nlobjSearchColumn('taxtotal')
				, new nlobjSearchColumn('fxamount')
				, new nlobjSearchColumn('custbody_customer_name')
				, new nlobjSearchColumn('exchangerate')
				, new nlobjSearchColumn('altname','custbody_so_created_by')
				// , new nlobjSearchColumn('firstname','custbody_so_created_by')
				// , new nlobjSearchColumn('lastname','custbody_so_created_by')
				// , new nlobjSearchColumn('parent','custbody_so_created_by')
			]

			, mainline = Application.getAllSearchResults('transaction', filters, columns);

		if (!mainline[0]) {
			throw forbiddenError;
		}

		var receipt = nlapiLoadRecord(mainline[0].getRecordType(), id,  {recordmode: 'dynamic'})
			, result = this.createResult(receipt);

		this.setAddresses(receipt, result);
		this.setLines(receipt, result);
		this.setPaymentMethod(receipt, result);

		if (type === 'invoice') {
			this.setAdjustments(receipt, result);
			this.setSalesRep(receipt, result);
		}

		result.promocode = receipt.getFieldValue('promocode') ? {
			internalid: receipt.getFieldValue('promocode')
			, name: receipt.getFieldText('promocode')
			, code: receipt.getFieldText('couponcode')
		} : null;

		result.lines = _.reject(result.lines, function (line) {
			return line.quantity === 0;
		});

		// TODO: review this code.
		result.status = mainline[0].getText(columns[0]);
		result.internal_status = mainline[0].getValue(columns[0]);

		result.createdfrom = {
			id: mainline[0].getValue(columns[1])
			, name: mainline[0].getText(columns[1])
		};
		var taxtotal = parseFloat(mainline[0].getValue('taxtotal'))/parseFloat(mainline[0].getValue('exchangerate'));
		result.summary.total = toCurrency(mainline[0].getValue('fxamount'));
		result.summary.total_formatted = formatCurrency(mainline[0].getValue('fxamount'));
		result.summary.taxtotal = toCurrency(taxtotal);
		result.summary.taxtotal_formatted = formatCurrency(taxtotal);

		// convert the obejcts to arrays
		result.addresses = _.values(result.addresses);
		result.lines = _.values(result.lines);
		result.createdby = mainline[0].getValue('altname','custbody_so_created_by');
		this.setReturnAuthorizations(result, receipt);

		return result;
	}

	, createResult: function (placed_order) {
		'use strict';

		return {
			internalid: placed_order.getId()
			, type: placed_order.getRecordType()
			, trantype: placed_order.getFieldValue('type')
			, order_number: placed_order.getFieldValue('tranid')
			, purchasenumber: placed_order.getFieldValue('otherrefnum')
			, dueDate: placed_order.getFieldValue('duedate')
			, amountDue: toCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
			, amountDue_formatted: formatCurrency(placed_order.getFieldValue('amountremainingtotalbox'))
			, memo: placed_order.getFieldValue('memo')
			, date: placed_order.getFieldValue('trandate')
			, status: placed_order.getFieldValue('status')
			, customername: placed_order.getFieldValue('custbody_customer_name')
			, isReturnable: this.isReturnable(placed_order)
			, summary: {
				subtotal: toCurrency(placed_order.getFieldValue('subtotal'))
				, subtotal_formatted: formatCurrency(placed_order.getFieldValue('subtotal'))

				, taxtotal: toCurrency(placed_order.getFieldValue('taxtotal'))
				, taxtotal_formatted: formatCurrency(placed_order.getFieldValue('taxtotal'))

				, tax2total: toCurrency(0)
				, tax2total_formatted: formatCurrency(0)

				, shippingcost: toCurrency(placed_order.getFieldValue('shippingcost'))
				, shippingcost_formatted: formatCurrency(placed_order.getFieldValue('shippingcost'))

				, handlingcost: toCurrency(placed_order.getFieldValue('althandlingcost'))
				, handlingcost_formatted: formatCurrency(placed_order.getFieldValue('althandlingcost'))

				, estimatedshipping: 0
				, estimatedshipping_formatted: formatCurrency(0)

				, taxonshipping: toCurrency(0)
				, taxonshipping_formatted: formatCurrency(0)

				, discounttotal: toCurrency(placed_order.getFieldValue('discounttotal'))
				, discounttotal_formatted: formatCurrency(placed_order.getFieldValue('discounttotal'))

				, taxondiscount: toCurrency(0)
				, taxondiscount_formatted: formatCurrency(0)

				, discountrate: toCurrency(0)
				, discountrate_formatted: formatCurrency(0)

				, discountedsubtotal: toCurrency(0)
				, discountedsubtotal_formatted: formatCurrency(0)

				, giftcertapplied: toCurrency(placed_order.getFieldValue('giftcertapplied'))
				, giftcertapplied_formatted: formatCurrency(placed_order.getFieldValue('giftcertapplied'))

				, total: toCurrency(placed_order.getFieldValue('total'))
				, total_formatted: formatCurrency(placed_order.getFieldValue('total'))
			}

			, currency: context.getFeature('MULTICURRENCY') ?
				{
					internalid: placed_order.getFieldValue('currency')
					, name: placed_order.getFieldValue('currencyname')
				} : null
		};
	}
	, setLines: function (placed_order, result) {
		'use strict';

		result.lines = {};
		var items_to_preload = []
			, amount;

		for (var i = 1; i <= placed_order.getLineItemCount('item'); i++) {

			if (placed_order.getLineItemValue('item', 'itemtype', i) === 'Discount' && placed_order.getLineItemValue('item', 'discline', i)) {
				var discline = placed_order.getLineItemValue('item', 'discline', i);

				amount = Math.abs(parseFloat(placed_order.getLineItemValue('item', 'amount', i)));

				result.lines[discline].discount = (result.lines[discline].discount) ? result.lines[discline].discount + amount : amount;
				result.lines[discline].total = result.lines[discline].amount + result.lines[discline].tax_amount - result.lines[discline].discount;
			}
			else {
				var rate = toCurrency(placed_order.getLineItemValue('item', 'rate', i))
					, item_id = placed_order.getLineItemValue('item', 'item', i)
					, item_type = placed_order.getLineItemValue('item', 'itemtype', i);

				amount = toCurrency(placed_order.getLineItemValue('item', 'amount', i));

				var tax_amount = toCurrency(placed_order.getLineItemValue('item', 'tax1amt', i)) || 0
					, total = amount + tax_amount;
				if(item_type != 'Markup'){

					result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
						internalid: placed_order.getLineItemValue('item', 'id', i)
						, quantity: parseFloat(placed_order.getLineItemValue('item', 'quantity', i))

						, rate: rate

						, amount: amount

						, tax_amount: tax_amount
						, tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i)
						, tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)
						, description: placed_order.getLineItemValue('item','description',i)?placed_order.getLineItemValue('item','description',i):''
						, discount: 0

						, total: total

						, item: item_id
						, type: item_type
						, options: getItemOptionsObject(placed_order.getLineItemValue('item', 'options', i))
						, custcol_additionalfabricsurcharge: placed_order.getLineItemText('item','custcol_additionalfabricsurcharge',i)
						, shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null
						, shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
						//, lineOption: placed_order.getCustomFieldValues()
					};

					items_to_preload[item_id] = {
						id: item_id
						, type: item_type
					};
				}else{
					var rate = parseFloat(placed_order.getLineItemValue('item', 'quantity', i))?parseFloat(placed_order.getLineItemValue('item', 'quantity', i)):parseFloat(1);
					result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
						internalid: placed_order.getLineItemValue('item', 'id', i)
						, quantity: parseFloat(placed_order.getLineItemValue('item', 'quantity', i))?parseFloat(placed_order.getLineItemValue('item', 'quantity', i)):1

						, rate: parseFloat(amount)/parseFloat(rate)

						, amount: amount

						, tax_amount: tax_amount
						, tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i)
						, tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)

						, discount: 0

						, total: total

						, item: {
							storedisplayname2:placed_order.getLineItemValue('item', 'description', i)
							, displayname:placed_order.getLineItemText('item', 'item', i)
							, internalid:placed_order.getLineItemValue('item', 'id', i)
						}
						, type: item_type
						, options: getItemOptionsObject(placed_order.getLineItemValue('item', 'options', i))
						, shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null
						, shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
					};
				}
			}

		}

		// Preloads info about the item
		this.store_item = Application.getModel('StoreItem');

		items_to_preload = _.values(items_to_preload);

		this.store_item.preloadItems(items_to_preload);

		// The api wont bring disabled items so we need to query them directly
		var items_to_query = []
			, self = this;

		_.each(result.lines, function (line) {
			if (line.item && line.type != 'Markup') {
				var item = self.store_item.get(line.item, line.type);
				if (!item || typeof item.itemid === 'undefined') {
					items_to_query.push(line.item);
				}
			}
		});

		if (items_to_query.length > 0) {
			var filters = [
				new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
				, new nlobjSearchFilter('internalid', null, 'is', result.internalid)
				, new nlobjSearchFilter('internalid', 'item', 'anyof', items_to_query)
			]

				, columns = [
					new nlobjSearchColumn('internalid', 'item')
					, new nlobjSearchColumn('type', 'item')
					, new nlobjSearchColumn('parent', 'item')
					, new nlobjSearchColumn('displayname', 'item')
					, new nlobjSearchColumn('storedisplayname', 'item')
					, new nlobjSearchColumn('itemid', 'item')
				]

				, inactive_items_search = Application.getAllSearchResults('transaction', filters, columns);

			inactive_items_search.forEach(function (item) {
				var inactive_item = {
					internalid: item.getValue('internalid', 'item')
					, type: item.getValue('type', 'item')
					, displayname: item.getValue('displayname', 'item')
					, storedisplayname: item.getValue('storedisplayname', 'item')
					, itemid: item.getValue('itemid', 'item')
				};
				self.store_item.set(inactive_item);
			});
		}

		result.lines = _.values(result.lines);

		result.lines.forEach(function (line) {
			line.rate_formatted = formatCurrency(line.rate);
			line.amount_formatted = formatCurrency(line.amount);
			line.tax_amount_formatted = formatCurrency(line.tax_amount);
			line.discount_formatted = formatCurrency(line.discount);
			line.total_formatted = formatCurrency(line.total);
			line.item = line.type != 'Markup'?self.store_item.get(line.item, line.type):line.item;
		});

		// remove the temporary address list by id
		delete result.listAddresseByIdTmp;
	}
}));


//Model.js
// CreditCard.js
// ----------------
// This file define the functions to be used on Credit Card service
Application.defineModel('CreditCard', {

	validation: {
		ccname: { required: true, msg: 'Name is required' }
		, paymentmethod: { required: true, msg: 'Card Type is required' }
		, ccnumber: { required: true, msg: 'Card Number is required' }
		, expmonth: { required: true, msg: 'Expiration is required' }
		, expyear: { required: true, msg: 'Expiration is required' }
	}

	, get: function (id) {
		'use strict';

		//Return a specific credit card
		return customer.getCreditCard(id);
	}

	, getDefault: function () {
		'use strict';

		//Return the credit card that the customer setted to default
		return _.find(customer.getCreditCards(), function (credit_card) {
			return credit_card.ccdefault === 'T';
		});
	}

	, list: function () {
		'use strict';

		//Return all the credit cards with paymentmethod
		return _.filter(customer.getCreditCards(), function (credit_card) {
			return credit_card.paymentmethod;
		});
	}

	, update: function (id, data) {
		'use strict';

		//Update the credit card if the data is valid
		this.validate(data);
		data.internalid = id;

		return customer.updateCreditCard(data);
	}

	, create: function (data) {
		'use strict';

		//Create a new credit card if the data is valid
		this.validate(data);

		return customer.addCreditCard(data);
	}

	, remove: function (id) {
		'use strict';

		//Remove a specific credit card
		return customer.removeCreditCard(id);
	}
});

//Model.js
Application.defineModel('CreditMemo', {

	get: function (id) {
		'use strict';

		var creditmemo = nlapiLoadRecord('creditmemo', id)
			, result = {};

		this.createRecord(creditmemo, result);
		this.setInvoices(creditmemo, result);
		this.setItems(creditmemo, result);
		this.loadItems(creditmemo, result);

		return result;
	}

	, createRecord: function (record, result) {
		'use strict';

		result.internalid = record.getId();
		result.tranid = record.getFieldValue('tranid');

		result.subtotal = toCurrency(record.getFieldValue('subtotal'));
		result.subtotal_formatted = formatCurrency(record.getFieldValue('subtotal'));
		result.discount = toCurrency(record.getFieldValue('discounttotal'));
		result.discount_formatted = formatCurrency(record.getFieldValue('discounttotal'));
		result.taxtotal = toCurrency(record.getFieldValue('taxtotal'));
		result.taxtotal_formatted = formatCurrency(record.getFieldValue('taxtotal'));
		result.shippingcost = toCurrency(record.getFieldValue('shippingcost'));
		result.shippingcost_formatted = formatCurrency(record.getFieldValue('shippingcost'));
		result.total = toCurrency(record.getFieldValue('total'));
		result.total_formatted = formatCurrency(record.getFieldValue('total'));
		result.amountpaid = toCurrency(record.getFieldValue('amountpaid'));
		result.amountpaid_formatted = formatCurrency(record.getFieldValue('amountpaid'));
		result.amountremaining = toCurrency(record.getFieldValue('amountremaining'));
		result.amountremaining_formatted = formatCurrency(record.getFieldValue('amountremaining'));

		result.trandate = record.getFieldValue('trandate');
		result.status = record.getFieldValue('status');
		result.memo = record.getFieldValue('memo');
	}

	, setInvoices: function (record, result) {
		'use strict';

		result.invoices = [];

		for (var i = 1; i <= record.getLineItemCount('apply'); i++) {
			var invoice = {
				line: i
				, internalid: record.getLineItemValue('apply', 'internalid', i)
				, type: record.getLineItemValue('apply', 'type', i)
				, total: toCurrency(record.getLineItemValue('apply', 'total', i))
				, total_formatted: formatCurrency(record.getLineItemValue('apply', 'total', i))
				, apply: record.getLineItemValue('apply', 'apply', i) === 'T'
				, applydate: record.getLineItemValue('apply', 'applydate', i)
				, currency: record.getLineItemValue('apply', 'currency', i)

				, amount: toCurrency(record.getLineItemValue('apply', 'amount', i))
				, amount_formatted: formatCurrency(record.getLineItemValue('apply', 'amount', i))
				, due: toCurrency(record.getLineItemValue('apply', 'due', i))
				, due_formatted: formatCurrency(record.getLineItemValue('apply', 'due', i))
				, refnum: record.getLineItemValue('apply', 'refnum', i)
			};

			result.invoices.push(invoice);
		}
	}

	, setItems: function (record, result) {
		'use strict';

		result.items = [];

		for (var i = 1; i <= record.getLineItemCount('item'); i++) {
			var item = {
				internalid: record.getLineItemValue('item', 'item', i)
				, id: record.getLineItemValue('item', 'item', i)
				, type: record.getLineItemValue('item', 'itemtype', i)
				, quantity: record.getLineItemValue('item', 'quantity', i)
				, unitprice: toCurrency(record.getLineItemValue('item', 'rate', i))
				, unitprice_formatted: formatCurrency(record.getLineItemValue('item', 'rate', i))
				, total: toCurrency(record.getLineItemValue('item', 'amount', i))
				, total_formatted: formatCurrency(record.getLineItemValue('item', 'amount', i))

			};

			result.items.push(item);
		}
	}

	, loadItems: function (record, result) {
		'use strict';

		if (result.items.length) {
			// Preloads info about the item
			var storeItem = Application.getModel('StoreItem');

			storeItem.preloadItems(result.items);

			// The api wont bring disabled items so we need to query them directly
			var itemsToQuery = [];

			_.each(result.items, function (item) {
				var itemStored = storeItem.get(item.internalid, item.type);
				if (!itemStored || typeof itemStored.itemid === 'undefined') {
					itemsToQuery.push(item);
				}
				else {
					var preItem = _.findWhere(result.items, { internalid: itemStored.internalid + '' });
					if (preItem) {
						_.extend(preItem, itemStored);
					}
				}
			});

			if (itemsToQuery.length > 0) {
				var filters = [
					new nlobjSearchFilter('entity', null, 'is', nlapiGetUser())
					, new nlobjSearchFilter('internalid', null, 'is', result.internalid)
					, new nlobjSearchFilter('internalid', 'item', 'anyof', _.pluck(itemsToQuery, 'internalid'))
				]

					, columns = [
						new nlobjSearchColumn('internalid', 'item')
						, new nlobjSearchColumn('type', 'item')
						, new nlobjSearchColumn('parent', 'item')
						, new nlobjSearchColumn('displayname', 'item')
						, new nlobjSearchColumn('storedisplayname', 'item')
						, new nlobjSearchColumn('itemid', 'item')
					]

					, inactive_items_search = Application.getAllSearchResults('transaction', filters, columns);

				inactive_items_search.forEach(function (item) {
					var inactive_item = {
						internalid: item.getValue('internalid', 'item')
						, type: item.getValue('type', 'item')
						, displayname: item.getValue('displayname', 'item')
						, storedisplayname: item.getValue('storedisplayname', 'item')
						, itemid: item.getValue('itemid', 'item')
					};

					storeItem.set(inactive_item);

					var preItem = _.findWhere(result.items, { internalid: inactive_item.internalid + '' });
					if (preItem) {
						_.extend(preItem, inactive_item);
					}
				});
			}
		}
	}

});

//Model.js
// StoreItem.js
// ----------
// Handles the fetching of items information for a collection of order items
// If you want to fetch multiple items please use preloadItems before/instead calling get() multiple times.

/* jshint -W053 */
// We HAVE to use "new String"
// So we (disable the warning)[https:// groups.google.com/forum/#!msg/jshint/O-vDyhVJgq4/hgttl3ozZscJ]
Application.defineModel('StoreItem', {

	// Returns a collection of items with the items iformation
	// the 'items' parameter is an array of objects {id,type}
	preloadItems: function (items) {
		'use strict';

		var self = this
			, items_by_id = {}
			, parents_by_id = {};

		items = items || [];

		this.preloadedItems = this.preloadedItems || {};

		items.forEach(function (item) {
			if (!item.id || !item.type || item.type === 'Discount') {
				return;
			}
			if (!self.preloadedItems[item.id]) {
				items_by_id[item.id] = {
					internalid: new String(item.id).toString()
					, itemtype: item.type
					, itemfields: SC.Configuration.items_fields_standard_keys
				};
			}
		});

		if (!_.size(items_by_id)) {
			return this.preloadedItems;
		}

		var items_details = this.getItemFieldValues(items_by_id);

		// Generates a map by id for easy access. Notice that for disabled items the array element can be null
		_.each(items_details, function (item) {
			if (item && typeof item.itemid !== 'undefined') {
				// TODO: Remove support for Releted and Correlated items by default because of performance issues
				/*
				if (!is_advanced)
				{
					// Load related & correlated items if the site type is standard.
					// If the site type is advanced will be loaded by getItemFieldValues function
					item.relateditems_detail = session.getRelatedItems(items_by_id[item.internalid]);
					item.correlateditems_detail = session.getCorrelatedItems(items_by_id[item.internalid]);
				}
				*/

				if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child') {
					parents_by_id[item.itemoptions_detail.parentid] = {
						internalid: new String(item.itemoptions_detail.parentid).toString()
						, itemtype: item.itemtype
						, itemfields: SC.Configuration.items_fields_standard_keys
					};
				}

				self.preloadedItems[item.internalid] = item;
			}
		});

		if (_.size(parents_by_id)) {
			var parents_details = this.getItemFieldValues(parents_by_id);

			_.each(parents_details, function (item) {
				if (item && typeof item.itemid !== 'undefined') {
					self.preloadedItems[item.internalid] = item;
				}
			});
		}

		// Adds the parent inforamtion to the child
		_.each(this.preloadedItems, function (item) {
			if (item.itemoptions_detail && item.itemoptions_detail.matrixtype === 'child') {
				item.matrix_parent = self.preloadedItems[item.itemoptions_detail.parentid];
			}
		});

		return this.preloadedItems;
	}

	, getItemFieldValues: function (items_by_id) {
		'use strict';

		var item_ids = _.values(items_by_id)
			, is_advanced = session.getSiteSettings(['sitetype']).sitetype === 'ADVANCED';

		// Check if we have access to fieldset
		if (is_advanced) {
			try {
				// SuiteCommerce Advanced website have fieldsets
				return session.getItemFieldValues(SC.Configuration.items_fields_advanced_name, _.pluck(item_ids, 'internalid')).items;
			}
			catch (e) {
				throw invalidItemsFieldsAdvancedName;
			}
		}
		else {
			// Sitebuilder website version doesn't have fieldsets
			return session.getItemFieldValues(item_ids);
		}
	}

	// Return the information for the given item
	, get: function (id, type) {
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (!this.preloadedItems[id]) {
			this.preloadItems([{
				id: id
				, type: type
			}]);
		}
		return this.preloadedItems[id];
	}

	, set: function (item) {
		'use strict';

		this.preloadedItems = this.preloadedItems || {};

		if (item.internalid) {
			this.preloadedItems[item.internalid] = item;
		}
	}
});

//Model.js
// Payment.js
// -------
// Defines the model used by the payment.ss service
Application.defineModel('Payment', {

	get: function (id) {
		'use strict';

		var customer_payment = nlapiLoadRecord('customerpayment', id);

		return this.createResult(customer_payment);
	}

	, setPaymentMethod: function (customer_payment, result) {
		'use strict';

		result.paymentmethods = [];
		return setPaymentMethodToResult(customer_payment, result);
	}

	, createResult: function (customer_payment) {
		'use strict';

		var result = {};

		result.internalid = customer_payment.getId();
		result.type = customer_payment.getRecordType();
		result.tranid = customer_payment.getFieldValue('tranid');
		result.autoapply = customer_payment.getFieldValue('autoapply');
		result.trandate = customer_payment.getFieldValue('trandate');
		result.status = customer_payment.getFieldValue('status');
		result.payment = toCurrency(customer_payment.getFieldValue('payment'));
		result.payment_formatted = formatCurrency(customer_payment.getFieldValue('payment'));
		result.lastmodifieddate = customer_payment.getFieldValue('lastmodifieddate');
		result.balance = toCurrency(customer_payment.getFieldValue('balance'));
		result.balance_formatted = formatCurrency(customer_payment.getFieldValue('balance'));

		this.setPaymentMethod(customer_payment, result);
		this.setInvoices(customer_payment, result);

		return result;
	}
	, setInvoices: function (customer_payment, result) {
		'use strict';

		result.invoices = [];

		for (var i = 1; i <= customer_payment.getLineItemCount('apply'); i++) {
			var apply = customer_payment.getLineItemValue('apply', 'apply', i) === 'T';

			if (apply) {
				var invoice = {

					internalid: customer_payment.getLineItemValue('apply', 'internalid', i)
					, type: customer_payment.getLineItemValue('apply', 'type', i)
					, total: toCurrency(customer_payment.getLineItemValue('apply', 'total', i))
					, total_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'total', i))
					, apply: apply
					, applydate: customer_payment.getLineItemValue('apply', 'applydate', i)
					, currency: customer_payment.getLineItemValue('apply', 'currency', i)
					, disc: toCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
					, disc_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
					, amount: toCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
					, amount_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
					, due: toCurrency(customer_payment.getLineItemValue('apply', 'due', i))
					, due_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'due', i))
					, refnum: customer_payment.getLineItemValue('apply', 'refnum', i)
				};

				result.invoices.push(invoice);

			}
		}

		return result;
	}
});


//Model.js
// LivePayment.js
// -------
// Defines the model used by the live-payment.ss service
Application.defineModel('LivePayment', {

	create: function () {
		'use strict';
		var customer_payment = nlapiCreateRecord('customerpayment');

		customer_payment.setFieldValue('customer', nlapiGetUser());
		customer_payment.setFieldValue('autoapply', 'F');

		return customer_payment;
	}

	, get: function () {
		'use strict';

		try {
			var customer_payment = this.create();
			return this.createResult(customer_payment);
		}
		catch (e) {

			if (e instanceof nlobjError && e.getCode() === 'INSUFFICIENT_PERMISSION') {
				return {};
			}
			else {
				throw e;
			}
		}
	}

	, setPaymentMethod: function (customer_payment, result) {
		'use strict';

		result.paymentmethods = [];
		return setPaymentMethodToResult(customer_payment, result);
	}

	, createResult: function (customer_payment) {
		'use strict';

		var result = {};

		result.internalid = customer_payment.getId();
		result.type = customer_payment.getRecordType();
		result.tranid = customer_payment.getFieldValue('tranid');
		result.autoapply = customer_payment.getFieldValue('autoapply');
		result.trandate = customer_payment.getFieldValue('trandate');
		result.status = customer_payment.getFieldValue('status');
		result.payment = toCurrency(customer_payment.getFieldValue('payment'));
		result.payment_formatted = formatCurrency(customer_payment.getFieldValue('payment'));
		result.lastmodifieddate = customer_payment.getFieldValue('lastmodifieddate');
		result.balance = toCurrency(customer_payment.getFieldValue('balance'));
		result.balance_formatted = formatCurrency(customer_payment.getFieldValue('balance'));

		this.setPaymentMethod(customer_payment, result);
		this.setInvoices(customer_payment, result);
		this.setCredits(customer_payment, result);
		this.setDeposits(customer_payment, result);

		return result;
	}

	, setInvoices: function (customer_payment, result) {
		'use strict';

		result.invoices = [];

		for (var i = 1; i <= customer_payment.getLineItemCount('apply'); i++) {
			var invoice = {

				internalid: customer_payment.getLineItemValue('apply', 'internalid', i)
				, total: toCurrency(customer_payment.getLineItemValue('apply', 'total', i))
				, total_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'total', i))
				, apply: customer_payment.getLineItemValue('apply', 'apply', i) === 'T'
				, applydate: customer_payment.getLineItemValue('apply', 'applydate', i)
				, currency: customer_payment.getLineItemValue('apply', 'currency', i)
				, discamt: toCurrency(customer_payment.getLineItemValue('apply', 'discamt', i))
				, discamt_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'discamt', i))
				, disc: toCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
				, disc_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'disc', i))
				, discdate: customer_payment.getLineItemValue('apply', 'discdate', i)
				, amount: toCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
				, amount_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'amount', i))
				, due: toCurrency(customer_payment.getLineItemValue('apply', 'due', i))
				, due_formatted: formatCurrency(customer_payment.getLineItemValue('apply', 'due', i))
				, refnum: customer_payment.getLineItemValue('apply', 'refnum', i)
			};

			result.invoices.push(invoice);
		}

		if (result.invoices.length) {
			var invoices_info = Application.getModel('Receipts').list({
				type: 'invoice'
				, internalid: _.pluck(result.invoices, 'internalid')
			});

			_.each(result.invoices, function (invoice) {
				invoice = _.extend(invoice, _.findWhere(invoices_info, { internalid: invoice.internalid }));

				invoice.discountapplies = (invoice.due === invoice.total) && (invoice.discdate && stringtodate(invoice.discdate) >= new Date());
				invoice.discount = invoice.discamt && invoice.total ? BigNumber(invoice.discamt).div(invoice.total).times(100).round(2).toNumber() : 0;
				invoice.discount_formatted = invoice.discount + '%';

				var amount = BigNumber(invoice.due).minus(invoice.discountapplies ? invoice.discamt : 0).toNumber();
				invoice.amount = amount;
				invoice.amount_formatted = formatCurrency(amount);
				invoice.duewithdiscount = invoice.amount;
				invoice.duewithdiscount_formatted = invoice.amount_formatted;

			});
		}


		return result;
	}

	, setCredits: function (customer_payment, result) {
		'use strict';

		result.credits = [];
		result.creditmemosremaining = 0;

		for (var i = 1; i <= customer_payment.getLineItemCount('credit'); i++) {
			var creditmemo = {
				internalid: customer_payment.getLineItemValue('credit', 'internalid', i)
				, type: customer_payment.getLineItemValue('credit', 'type', i)
				, total: toCurrency(customer_payment.getLineItemValue('credit', 'total', i))
				, total_formatted: formatCurrency(customer_payment.getLineItemValue('credit', 'total', i))
				, apply: customer_payment.getLineItemValue('credit', 'apply', i) === 'T'
				, currency: customer_payment.getLineItemValue('apply', 'currency', i)
				, remaining: toCurrency(customer_payment.getLineItemValue('credit', 'due', i))
				, remaining_formatted: formatCurrency(customer_payment.getLineItemValue('credit', 'due', i))
				, amount: toCurrency(customer_payment.getLineItemValue('credit', 'amount', i))
				, amount_formatted: formatCurrency(customer_payment.getLineItemValue('credit', 'amount', i))
				, refnum: customer_payment.getLineItemValue('credit', 'refnum', i)
				, memo: nlapiLookupField('creditmemo',customer_payment.getLineItemValue('credit','internalid',i),'memo')
			};

			result.creditmemosremaining = BigNumber(creditmemo.remaining).plus(result.creditmemosremaining).toNumber();
			result.credits.push(creditmemo);
		}

		result.creditmemosremaining_formatted = formatCurrency(result.creditmemosremaining);

		return result;
	}

	, setDeposits: function (customer_payment, result) {
		'use strict';

		result.deposits = [];

		result.depositsremaining = 0;

		for (var i = 1; i <= customer_payment.getLineItemCount('deposit'); i++) {
			var deposit = {
				internalid: customer_payment.getLineItemValue('deposit', 'doc', i)
				, total: toCurrency(customer_payment.getLineItemValue('deposit', 'total', i))
				, total_formatted: formatCurrency(customer_payment.getLineItemValue('deposit', 'total', i))
				, apply: customer_payment.getLineItemValue('deposit', 'apply', i) === 'T'
				, currency: customer_payment.getLineItemValue('deposit', 'currency', i)
				, depositdate: customer_payment.getLineItemValue('deposit', 'depositdate', i)
				, remaining: toCurrency(customer_payment.getLineItemValue('deposit', 'remaining', i))
				, remaining_formatted: formatCurrency(customer_payment.getLineItemValue('deposit', 'remaining', i))
				, amount: toCurrency(customer_payment.getLineItemValue('deposit', 'amount', i))
				, amount_formatted: formatCurrency(customer_payment.getLineItemValue('deposit', 'amount', i))
				, refnum: customer_payment.getLineItemValue('deposit', 'refnum', i)
			};

			result.depositsremaining = BigNumber(deposit.remaining).plus(result.depositsremaining).toNumber();
			result.deposits.push(deposit);
		}

		result.depositsremaining_formatted = formatCurrency(result.depositsremaining);

		return result;
	}

	, update: function (payment_record, data) {
		'use strict';

		var self = this
			, invoices = data.invoices
			, credits = data.credits
			, deposits = data.deposits
			, credit_card = data.paymentmethods && data.paymentmethods[0] && data.paymentmethods[0].creditcard;

		// invoices

		for (var i = 1; i <= payment_record.getLineItemCount('apply'); i++) {
			var invoice = _.findWhere(invoices, {
				internalid: payment_record.getLineItemValue('apply', 'internalid', i)
			});

			if (invoice && invoice.apply) {
				payment_record.setLineItemValue('apply', 'apply', i, 'T');
				payment_record.setLineItemValue('apply', 'amount', i, invoice.amount);

				invoice.due = payment_record.getLineItemValue('apply', 'due', i);
				invoice.total = payment_record.getLineItemValue('apply', 'total', i);
				invoice.discdate = payment_record.getLineItemValue('apply', 'discdate', i);
				invoice.discamt = payment_record.getLineItemValue('apply', 'discamt', i);
				invoice.discountapplies = (invoice.due === invoice.total) && (invoice.discdate && stringtodate(invoice.discdate) >= new Date());
				invoice.duewithdiscount = BigNumber(invoice.due).minus(invoice.discountapplies ? invoice.discamt : 0).toNumber();

				if (self._isPayFull(invoice) && invoice.discountapplies && invoice.discamt) {
					payment_record.setLineItemValue('apply', 'disc', i, invoice.discamt);
				}
			}
		}

		// deposits

		for (i = 1; i <= payment_record.getLineItemCount('deposit'); i++) {
			var deposit = _.findWhere(deposits, {
				internalid: payment_record.getLineItemValue('deposit', 'doc', i)
			});

			if (deposit && deposit.apply) {
				payment_record.setLineItemValue('deposit', 'apply', i, 'T');
				payment_record.setLineItemValue('deposit', 'amount', i, deposit.amount);
			}
		}

		// credits

		for (i = 1; i <= payment_record.getLineItemCount('credit'); i++) {
			var credit = _.findWhere(credits, {
				internalid: payment_record.getLineItemValue('credit', 'internalid', i)
			});

			if (credit && credit.apply) {
				payment_record.setLineItemValue('credit', 'apply', i, 'T');
				payment_record.setLineItemValue('credit', 'amount', i, credit.amount);
			}
		}

		if (data.payment && credit_card && data.billaddress) {

			var selected_address = customer.getAddress(data.billaddress);

			if (selected_address) {
				customer.updateAddress({
					internalid: selected_address.internalid
					, addressee: selected_address.addressee
					, defaultbilling: 'T'
				});

				payment_record.setFieldValue('ccstreet', selected_address.addr1);
				payment_record.setFieldValue('cczipcode', selected_address.zip);
			}

			customer.updateCreditCard({
				internalid: credit_card.internalid
				, ccdefault: 'T'
			});

			payment_record.setFieldValue('paymentmethod', credit_card.paymentmethod.internalid);

			if (credit_card.ccsecuritycode) {
				payment_record.setFieldValue('ccsecuritycode', credit_card.ccsecuritycode);
			}

			payment_record.setFieldValue('payment', data.payment);

		}

		return payment_record;

	}

	, _isPayFull: function (invoice) {
		'use strict';

		if (invoice.discountapplies) {
			return invoice.amount === invoice.duewithdiscount;
		}
		else {
			return invoice.amount === invoice.due;
		}
	}

	, submit: function (data) {
		'use strict';

		var url = myaccountsuiteleturl;
		var res = nlapiRequestURL(url+"&action=createpayment&user="+nlapiGetUser(), JSON.stringify(data));
		var payment_record_id = JSON.parse(res.getBody());
		// update record
		// var payment_record = this.update(this.create(), data)
		// 	// save record.
		// 	, payment_record_id = nlapiSubmitRecord(payment_record)
			// create new record to next payment.
		var new_payment_record = this.get();

		if (payment_record_id !== '0') {
			// send confirmation
			new_payment_record.confirmation = _.extend(data, Application.getModel('Payment').get(payment_record_id));
		}
		else {
			data.internalid = '0';
			new_payment_record.confirmation = data;
		}

		return new_payment_record;
	}

});


//Model.js

Application.defineModel('Deposit', {

	get: function (id) {
		'use strict';

		var deposit = nlapiLoadRecord('customerdeposit', id)
			, result = {};

		this.createRecord(deposit, result);
		this.setInvoices(deposit, result);
		this.setPaymentMethod(deposit, result);

		return result;
	}

	, createRecord: function (record, result) {
		'use strict';

		result.internalid = record.getId();
		result.tranid = record.getFieldValue('tranid');
		result.payment = toCurrency(record.getFieldValue('payment'));
		result.payment_formatted = formatCurrency(record.getFieldValue('payment'));
		result.trandate = record.getFieldValue('trandate');
		result.status = record.getFieldValue('status');
		result.memo = record.getFieldValue('memo');
	}

	, setInvoices: function (record, result) {
		'use strict';

		result.invoices = [];
		var invoicesTotal = 0;

		for (var i = 1; i <= record.getLineItemCount('apply'); i++) {
			var invoice = {
				line: i
				, invoice_id: record.getLineItemValue('apply', 'id2', i)
				, deposit_id: record.getLineItemValue('apply', 'id', i)

				, type: record.getLineItemValue('apply', 'type', i)
				, total: toCurrency(record.getLineItemValue('apply', 'total', i))
				, total_formatted: formatCurrency(record.getLineItemValue('apply', 'total', i))

				, invoicedate: record.getLineItemValue('apply', 'applydate', i)
				, depositdate: record.getLineItemValue('apply', 'depositdate', i)

				, currency: record.getLineItemValue('apply', 'currency', i)
				, amount: toCurrency(record.getLineItemValue('apply', 'amount', i))
				, amount_formatted: formatCurrency(record.getLineItemValue('apply', 'amount', i))
				, due: toCurrency(record.getLineItemValue('apply', 'due', i))
				, due_formatted: formatCurrency(record.getLineItemValue('apply', 'due', i))
				, refnum: record.getLineItemValue('apply', 'refnum', i)
			};

			invoicesTotal += invoice.amount;
			result.invoices.push(invoice);
		}

		result.paid = toCurrency(invoicesTotal);
		result.paid_formatted = formatCurrency(invoicesTotal);
		result.remaining = toCurrency(result.payment - result.paid);
		result.remaining_formatted = formatCurrency(result.remaining);
	}

	, setPaymentMethod: function (record, result) {
		'use strict';

		var paymentmethod = {
			type: record.getFieldValue('paymethtype')
			, primary: true
		};

		if (paymentmethod.type === 'creditcard') {
			paymentmethod.creditcard = {
				ccnumber: record.getFieldValue('ccnumber')
				, ccexpiredate: record.getFieldValue('ccexpiredate')
				, ccname: record.getFieldValue('ccname')
				, paymentmethod: {
					ispaypal: 'F'
					, name: record.getFieldText('paymentmethod')
					, creditcard: 'T'
					, internalid: record.getFieldValue('paymentmethod')
				}
			};
		}

		if (record.getFieldValue('ccstreet')) {
			paymentmethod.ccstreet = record.getFieldValue('ccstreet');
		}

		if (record.getFieldValue('cczipcode')) {
			paymentmethod.cczipcode = record.getFieldValue('cczipcode');
		}

		if (record.getFieldValue('terms')) {
			paymentmethod.type = 'invoice';

			paymentmethod.purchasenumber = record.getFieldValue('otherrefnum');

			paymentmethod.paymentterms = {
				internalid: record.getFieldValue('terms')
				, name: record.getFieldText('terms')
			};
		}

		result.paymentmethods = [paymentmethod];
	}
});

//Model.js
Application.defineModel('DepositApplication', {

	get: function (id) {
		'use strict';

		var record = nlapiLoadRecord('depositapplication', id)
			, result = {};

		this.createResult(record, result);
		this.setInvoices(record, result);

		return result;
	}

	, createResult: function (record, result) {
		'use strict';

		result.internalid = record.getId();
		result.tranid = record.getFieldValue('tranid');
		result.total = toCurrency(record.getFieldValue('total'));
		result.total_formatted = formatCurrency(record.getFieldValue('total'));

		result.deposit =
			{
				internalid: record.getFieldValue('deposit')
				, name: record.getFieldText('deposit')
			};

		result.depositdate = record.getFieldValue('depositdate');
		result.trandate = record.getFieldValue('trandate');
		result.memo = record.getFieldValue('memo');
	}

	, setInvoices: function (record, result) {
		'use strict';

		result.invoices = [];

		for (var i = 1; i <= record.getLineItemCount('apply'); i++) {
			var invoice = {
				line: i
				, internalid: record.getLineItemValue('apply', 'internalid', i)
				, type: record.getLineItemValue('apply', 'type', i)
				, total: toCurrency(record.getLineItemValue('apply', 'total', i))
				, total_formatted: formatCurrency(record.getLineItemValue('apply', 'total', i))
				, apply: record.getLineItemValue('apply', 'apply', i) === 'T'
				, applydate: record.getLineItemValue('apply', 'applydate', i)
				, currency: record.getLineItemValue('apply', 'currency', i)
				, amount: toCurrency(record.getLineItemValue('apply', 'amount', i))
				, amount_formatted: formatCurrency(record.getLineItemValue('apply', 'amount', i))
				, due: toCurrency(record.getLineItemValue('apply', 'due', i))
				, due_formatted: formatCurrency(record.getLineItemValue('apply', 'due', i))
				, refnum: record.getLineItemValue('apply', 'refnum', i)
			};

			result.invoices.push(invoice);
		}
	}
});

//Model.js
// ProductList.js
// ----------------
// Handles creating, fetching and updating Product Lists

Application.defineModel('ProductList', {
	// ## General settings
	configuration: SC.Configuration.product_lists
	, later_type_id: '2'

	, verifySession: function () {
		'use strict';

		if (!(this.configuration.loginRequired && isLoggedIn())) {
			throw unauthorizedError;
		}
	}

	, getColumns: function () {
		'use strict';

		return {
			internalid: new nlobjSearchColumn('internalid')
			, templateid: new nlobjSearchColumn('custrecord_ns_pl_pl_templateid')
			, name: new nlobjSearchColumn('name')
			, description: new nlobjSearchColumn('custrecord_ns_pl_pl_description')
			, owner: new nlobjSearchColumn('custrecord_ns_pl_pl_owner')
			, scope: new nlobjSearchColumn('custrecord_ns_pl_pl_scope')
			, type: new nlobjSearchColumn('custrecord_ns_pl_pl_type')
			, created: new nlobjSearchColumn('created')
			, lastmodified: new nlobjSearchColumn('lastmodified')
		};
	}

	// Returns a product list based on a given id and userId
	, get: function (id, customerid) {
		'use strict';

		// Verify session if and only if we are in My Account...
		if (request.getURL().indexOf('https') === 0) {
			this.verifySession();
		}
		var parent = customerid;
		var filters = [new nlobjSearchFilter('internalid', null, 'is', id)
			, new nlobjSearchFilter('isinactive', null, 'is', 'F')
			, new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', parseInt(parent,10))]
			, product_lists = this.searchHelper(filters, this.getColumns(), true, null, null, parent, true,true);

		if (product_lists.length >= 1) {
			return product_lists[0];
		}
		else {
			throw notFoundError;
		}
	}

	// Returns the user's saved for later product list
	, getSavedForLaterProductList: function (customerid) {
		'use strict';

		this.verifySession();

			var parent = customerid;

		var filters = [new nlobjSearchFilter('custrecord_ns_pl_pl_type', null, 'is', this.later_type_id)
			, new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', parent)
			, new nlobjSearchFilter('isinactive', null, 'is', 'F')]
			, product_lists = this.searchHelper(filters, this.getColumns(), true,null, null, parent);

		if (product_lists.length >= 1) {
			return product_lists[0];
		}
		else {
			var self = this
				, sfl_template = _(_(this.configuration.list_templates).filter(function (pl) {
					return pl.type && pl.type.id && pl.type.id === self.later_type_id;
				})).first();

			if (sfl_template) {
				if (!sfl_template.scope) {
					sfl_template.scope = { id: '2', name: 'private' };
				}

				if (!sfl_template.description) {
					sfl_template.description = '';
				}

				return sfl_template;
			}

			throw notFoundError;
		}
	}

	// Sanitize html input
	, sanitize: function (text) {
		'use strict';

		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

	, searchHelper: function (filters, columns, include_store_items, order, template_ids, parentparam, saveforlater, includeitems) {
		'use strict';

		// Sets the sort order
		var order_tokens = order && order.split(':') || []
			, sort_column = order_tokens[0] || 'name'
			, sort_direction = order_tokens[1] || 'ASC'
			, productLists = [];

		columns[sort_column] && columns[sort_column].setSort(sort_direction === 'DESC');

		// Makes the request and format the response
		var records = Application.getAllSearchResults('customrecord_ns_pl_productlist', filters, _.values(columns))
			, ProductListItem = Application.getModel('ProductListItem');

		_.each(records, function (productListSearchRecord) {
			var product_list_type_text = productListSearchRecord.getText('custrecord_ns_pl_pl_type')
				, productList = {
					internalid: productListSearchRecord.getId()
					, templateid: productListSearchRecord.getValue('custrecord_ns_pl_pl_templateid')
					, name: productListSearchRecord.getValue('name')
					, description: productListSearchRecord.getValue('custrecord_ns_pl_pl_description') ? productListSearchRecord.getValue('custrecord_ns_pl_pl_description').replace(/\n/g, '<br>') : ''
					, owner: {
						id: productListSearchRecord.getValue('custrecord_ns_pl_pl_owner')
						, name: productListSearchRecord.getText('custrecord_ns_pl_pl_owner')
					}
					, scope: {
						id: productListSearchRecord.getValue('custrecord_ns_pl_pl_scope')
						, name: productListSearchRecord.getText('custrecord_ns_pl_pl_scope')
					}
					, type: {
						id: productListSearchRecord.getValue('custrecord_ns_pl_pl_type')
						, name: product_list_type_text
					}
					, created: productListSearchRecord.getValue('created')
					, lastmodified: productListSearchRecord.getValue('lastmodified')
					, items: []
				};
			if (template_ids && productList.templateid) {
				template_ids.push(productList.templateid);
			}

			productLists.push(productList);
		});
		if(includeitems){
			var plitems = ProductListItem.search(null, include_store_items, {
				sort: 'created'
				, order: '-1'
				, page: -1
			},parentparam);
			for(var i=0; i<productLists.length; i++){
				var items = _.filter(plitems, function(pli){
					return pli.productListId == productLists[i].internalid;
				});
				productLists[i].items = items;
			}
		}
		//Sort the product list.. get the first name by splitting space, sort if number
		var numberedlists = [];
		var textlist = [];
		for(var i=0; i<productLists.length; i++){
			if(isNaN(productLists[i].name.split(' ')[0])){
				textlist.order = productLists[i].name.split(' ')[0];
				textlist.push(productLists[i]);
			}else{
				productLists[i].order = productLists[i].name.split(' ')[0];
				numberedlists.push(productLists[i]);
			}
		}
		textlist.sort(function(a,b){
			return (a.order === b.order )? 0 : a.order < b.order? -1 : 1;
		});
		numberedlists.sort(function(a,b){
			return (a.order === b.order )? 0 : parseFloat(a.order) < parseFloat(b.order)? -1 : 1;
		});
		productLists = numberedlists.concat(textlist);
		return productLists;
	}

	// Retrieves all Product Lists for a given user
	, search: function (order, customerid) {
		'use strict';

		// Verify session if and only if we are in My Account...
		if (request.getURL().indexOf('https') === 0) {
			this.verifySession();
		}
		var parent = customerid;

		var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')
			, new nlobjSearchFilter('custrecord_ns_pl_pl_owner', null, 'is', parseInt(parent,10))]
			, template_ids = []
			, product_lists = this.searchHelper(filters, this.getColumns(), true, order, template_ids, parent,false,false)
			, self = this;

		// Add possible missing predefined list templates
		_(this.configuration.list_templates).each(function (template) {
			if (!_(template_ids).contains(template.templateid)) {
				if (!template.templateid || !template.name) {
					console.log('Error: Wrong predefined Product List. Please check backend configuration.');
				}
				else {
					if (!template.scope) {
						template.scope = { id: '2', name: 'private' };
					}

					if (!template.description) {
						template.description = '';
					}

					if (!template.type) {
						template.type = { id: '3', name: 'predefined' };
					}

					product_lists.push(template);
				}
			}
		});

		if (this.isSingleList()) {
			return _.filter(product_lists, function (pl) {
				// Only return predefined lists.
				return pl.type.name === 'predefined';
			});
		}

		return product_lists.filter(function (pl) {
			return pl.type.id !== self.later_type_id;
		});
	}

	, isSingleList: function () {
		'use strict';
		var self = this;

		return !this.configuration.additionEnabled && this.configuration.list_templates && _.filter(this.configuration.list_templates, function (pl) { return !pl.type || pl.type.id !== self.later_type_id; }).length === 1;
	}

	// Creates a new Product List record
	, create: function (data,customerid) {
		'use strict';

		this.verifySession();

			var parent = customerid;
		if(parent != nlapiGetUser()){
			var url = myaccountsuiteleturl;
			var res = nlapiRequestURL(url+"&action=createproductlist&user="+parent,JSON.stringify(data));
			var body = JSON.parse(res.getBody());
			return body;
		}
		var productList = nlapiCreateRecord('customrecord_ns_pl_productlist');

		data.templateid && productList.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateid);
		data.scope && data.scope.id && productList.setFieldValue('custrecord_ns_pl_pl_scope', data.scope.id);
		data.type && data.type.id && productList.setFieldValue('custrecord_ns_pl_pl_type', data.type.id);
		data.name && productList.setFieldValue('name', this.sanitize(data.name));
		data.description && productList.setFieldValue('custrecord_ns_pl_pl_description', this.sanitize(data.description));

		productList.setFieldValue('custrecord_ns_pl_pl_owner', nlapiGetUser());

		return nlapiSubmitRecord(productList);
	}

	// Updates a given Product List given its id
	, update: function (id, data, customerid) {
		'use strict';

		this.verifySession();

			var parent = customerid;

		var product_list = nlapiLoadRecord('customrecord_ns_pl_productlist', id);

		if (parseInt(product_list.getFieldValue('custrecord_ns_pl_pl_owner'), 10) !== nlapiGetUser()
			&& parseInt(product_list.getFieldValue('custrecord_ns_pl_pl_owner'), 10) != parseInt(parent,10)) {
			throw unauthorizedError;
		}

		data.templateid && product_list.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateid);
		data.scope && data.scope.id && product_list.setFieldValue('custrecord_ns_pl_pl_scope', data.scope.id);
		data.type && data.type.id && product_list.setFieldValue('custrecord_ns_pl_pl_type', data.type.id);
		data.name && product_list.setFieldValue('name', this.sanitize(data.name));
		product_list.setFieldValue('custrecord_ns_pl_pl_description', data.description ? this.sanitize(data.description) : '');

		nlapiSubmitRecord(product_list);
	}

	// Deletes a Product List given its id
	, delete: function (id, customerid) {
		'use strict';

		this.verifySession();

			var parent = customerid;

		var product_list = nlapiLoadRecord('customrecord_ns_pl_productlist', id);

		if (parseInt(product_list.getFieldValue('custrecord_ns_pl_pl_owner'), 10) !== nlapiGetUser()
				&& parseInt(product_list.getFieldValue('custrecord_ns_pl_pl_owner'), 10) != parseInt(parent,10)) {
			throw unauthorizedError;
		}

		product_list.setFieldValue('isinactive', 'T');

		var internalid = nlapiSubmitRecord(product_list);

		return internalid;
	}
});

//Item.Model.js
// ProductListItem.js
// ----------------
// Handles creating, fetching and updating Product List Items
Application.defineModel('ProductListItem', {
	// ## General settings
	configuration: SC.Configuration.product_lists

	, verifySession: function () {
		'use strict';

		if (!(this.configuration.loginRequired && isLoggedIn())) {
			throw unauthorizedError;
		}
	}

	// Returns a product list item based on a given id
	, get: function (id,customerid) {
		'use strict';

		this.verifySession();
		var url = myaccountsuiteleturl;
		var parent = customerid
		var filters = [new nlobjSearchFilter('internalid', null, 'is', id)
			, new nlobjSearchFilter('isinactive', null, 'is', 'F')
			, new nlobjSearchFilter('custrecord_ns_pl_pl_owner', 'custrecord_ns_pl_pli_productlist', 'is', parent)]
			, sort_column = 'custrecord_ns_pl_pli_item'
			, sort_direction = 'ASC'
			, productlist_items = this.searchHelper(filters, sort_column, sort_direction, true);

		if (productlist_items.length >= 1) {
			return productlist_items[0];
		}
		else {
			throw notFoundError;
		}
	}

	, delete: function (id, customerid) {
		'use strict';

		this.verifySession();
		var ProductList = Application.getModel('ProductList')
			, product_list_item = nlapiLoadRecord('customrecord_ns_pl_productlistitem', id)
			, parent_product_list = ProductList.get(product_list_item.getFieldValue('custrecord_ns_pl_pli_productlist'),customerid);
			var url = myaccountsuiteleturl;
			var parent = customerid;
		if (parseInt(parent_product_list.owner.id, 10) !== nlapiGetUser()
			&& parseInt(parent_product_list.owner.id, 10) != parseInt(customerid,10)) {
			throw unauthorizedError;
		}

		product_list_item.setFieldValue('isinactive', 'T');

		return nlapiSubmitRecord(product_list_item);
	}

	, getProductName: function (item) {
		'use strict';

		if (!item) {
			return '';
		}

		// If its a matrix child it will use the name of the parent
		if (item && item.matrix_parent && item.matrix_parent.internalid) {
			return item.matrix_parent.storedisplayname2 || item.matrix_parent.displayname;
		}

		// Otherways return its own name
		return item.storedisplayname2 || item.displayname;
	}

	// Sanitize html input
	, sanitize: function (text) {
		'use strict';

		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

	// Creates a new Product List Item record
	, create: function (data, customerid) {
		'use strict';

		this.verifySession();
		var url = myaccountsuiteleturl;
		var parent = customerid;

		if (!(data.productList && data.productList.id)) {
			throw notFoundError;
		}

		var ProductList = Application.getModel('ProductList')
			, parent_product_list = ProductList.get(data.productList.id, customerid);

		if (parseInt(parent_product_list.owner.id, 10) !== nlapiGetUser() && parseInt(parent_product_list.owner.id, 10) != parseInt(parent,10)) {
			throw unauthorizedError;
		}

		var productListItem = nlapiCreateRecord('customrecord_ns_pl_productlistitem');

		data.description && productListItem.setFieldValue('custrecord_ns_pl_pli_description', this.sanitize(data.description));

		if (data.options) {
			data.options && productListItem.setFieldValue('custrecord_ns_pl_pli_options', JSON.stringify(data.options || {}));
		}

		data.quantity && productListItem.setFieldValue('custrecord_ns_pl_pli_quantity', data.quantity);
		data.item && data.item.internalid && productListItem.setFieldValue('custrecord_ns_pl_pli_item', data.item.internalid);
		data.priority && data.priority.id && productListItem.setFieldValue('custrecord_ns_pl_pli_priority', data.priority.id);
		productListItem.setFieldValue('custrecord_ns_pl_pli_productlist', data.productList.id);

		data.internalid = nlapiSubmitRecord(productListItem);

		return data;
	}

	// Updates a given Product List Item given its id
	, update: function (id, data, customerid) {
		'use strict';

		this.verifySession();
		var url = myaccountsuiteleturl;
		var parent = customerid;

		var ProductList = Application.getModel('ProductList')
			, product_list_item = nlapiLoadRecord('customrecord_ns_pl_productlistitem', id)
			, parent_product_list = ProductList.get(product_list_item.getFieldValue('custrecord_ns_pl_pli_productlist'),customerid);

		if (parseInt(parent_product_list.owner.id, 10) !== nlapiGetUser() && parseInt(parent_product_list.owner.id, 10) != parseInt(parent,10) ) {
			throw unauthorizedError;
		}

		product_list_item.setFieldValue('custrecord_ns_pl_pli_description', this.sanitize(data.description));
		data.options && product_list_item.setFieldValue('custrecord_ns_pl_pli_options', JSON.stringify(data.options || {}));
		data.quantity && product_list_item.setFieldValue('custrecord_ns_pl_pli_quantity', data.quantity);

		data.item && data.item.id && product_list_item.setFieldValue('custrecord_ns_pl_pli_item', data.item.id);
		data.priority && data.priority.id && product_list_item.setFieldValue('custrecord_ns_pl_pli_priority', data.priority.id);
		data.productList && data.productList.id && product_list_item.setFieldValue('custrecord_ns_pl_pli_productlist', data.productList.id);

		nlapiSubmitRecord(product_list_item);
	}

	// Retrieves all Product List Items related to the given Product List Id
	, search: function (product_list_id, include_store_item, sort_and_paging_data, parentparam, clientid) {
		'use strict';

		this.verifySession();
		var parent;
		if(!parentparam){
			var url = myaccountsuiteleturl;
			var res = nlapiRequestURL(url+"&action=getparent&user="+nlapiGetUser());
			var body = JSON.parse(res.getBody());
			parent = body[0];
		}
		else {
			parent = parentparam;
		}
		// if (!product_list_id) {
		// 	return []; //it may happens when target list is a template and don't have a record yet.
		// }
		var filters = [
			new nlobjSearchFilter('isinactive', null, 'is', 'F')
			, new nlobjSearchFilter('custrecord_ns_pl_pl_owner', 'custrecord_ns_pl_pli_productlist', 'is', parent)
			,	new nlobjSearchFilter('isinactive', 'custrecord_ns_pl_pli_item', 'is', 'F' )]
			, sort_column = sort_and_paging_data.sort
			, sort_direction = sort_and_paging_data.order;
		if(clientid){
			filters.push(new nlobjSearchFilter('custrecord_ns_pl_pli_tailorclient',null,'anyof',['@NONE@',clientid]));
			filters.push(new nlobjSearchFilter('custrecord_ns_pl_pli_options',null,'contains',clientid));
		}
		if(product_list_id){
      filters.push(new nlobjSearchFilter('custrecord_ns_pl_pli_productlist', null, 'is', product_list_id));
    }
		if (!sort_column) {
			sort_column = 'created';
		}

		if (!sort_direction) {
			sort_direction = '-1';
		}

		return this.searchHelper(filters, sort_column, sort_direction === '-1' ? 'DESC' : 'ASC', include_store_item);
	}

	, searchHelper: function (filters, sort_column, sort_direction, include_store_item) {
		'use strict';

		// Selects the columns
		var productListItemColumns = {
			internalid: new nlobjSearchColumn('internalid')
			, name: new nlobjSearchColumn('formulatext', 'custrecord_ns_pl_pli_item').setFormula('case when LENGTH({custrecord_ns_pl_pli_item.displayname}) > 0 then {custrecord_ns_pl_pli_item.displayname} else {custrecord_ns_pl_pli_item.itemid} end')
			, description: new nlobjSearchColumn('custrecord_ns_pl_pli_description')
			, options: new nlobjSearchColumn('custrecord_ns_pl_pli_options')
			, quantity: new nlobjSearchColumn('custrecord_ns_pl_pli_quantity')
			, price: new nlobjSearchColumn('price', 'custrecord_ns_pl_pli_item')
			, created: new nlobjSearchColumn('created')
			, item_id: new nlobjSearchColumn('custrecord_ns_pl_pli_item')
			, item_type: new nlobjSearchColumn('type', 'custrecord_ns_pl_pli_item')
			, priority: new nlobjSearchColumn('custrecord_ns_pl_pli_priority')
			, lastmodified: new nlobjSearchColumn('lastmodified')
			, productlistid: new nlobjSearchColumn('custrecord_ns_pl_pli_productlist')
		};

		productListItemColumns[sort_column] && productListItemColumns[sort_column].setSort(sort_direction === 'DESC');

		// Makes the request and format the response
		var records = Application.getAllSearchResults('customrecord_ns_pl_productlistitem', filters, _.values(productListItemColumns))
			, productlist_items = []
			, StoreItem = Application.getModel('StoreItem')
			, self = this;
			nlapiLogExecution('debug','records', records.length);
		_(records).each(function (productListItemSearchRecord) {
			var itemInternalId = productListItemSearchRecord.getValue('custrecord_ns_pl_pli_item')
				, itemType = productListItemSearchRecord.getValue('type', 'custrecord_ns_pl_pli_item')
				, productListItem = {
					internalid: productListItemSearchRecord.getId()
					, description: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_description')
					, options: JSON.parse(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_options') || '{}')
					, quantity: parseInt(productListItemSearchRecord.getValue('custrecord_ns_pl_pli_quantity'), 10)
					, created: productListItemSearchRecord.getValue('created')
					, lastmodified: productListItemSearchRecord.getValue('lastmodified')
					, productListId: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_productlist')
					// we temporary store the item reference, after this loop we use StoreItem.preloadItems instead doing multiple StoreItem.get()
					, store_item_reference: { id: itemInternalId, type: itemType }
					, priority: {
						id: productListItemSearchRecord.getValue('custrecord_ns_pl_pli_priority')
						, name: productListItemSearchRecord.getText('custrecord_ns_pl_pli_priority')
					}
				};
			productlist_items.push(productListItem);
		});

		var store_item_references = _(productlist_items).pluck('store_item_reference')
			, results = [];

		// preload all the store items at once for performance
		StoreItem.preloadItems(store_item_references);

		_(productlist_items).each(function (productlist_item) {
			var store_item_reference = productlist_item.store_item_reference
				// get the item - fast because it was preloaded before. Can be null!
				, store_item = StoreItem.get(store_item_reference.id, store_item_reference.type);

			delete productlist_item.store_item_reference;

			if (!store_item) {
				return;
			}

			if (include_store_item) {
				productlist_item.item = store_item;
			}
			else {
				// only include basic store item data - fix the name to support matrix item names.
				productlist_item.item = {
					internalid: store_item_reference.id
					, displayname: self.getProductName(store_item)
					, ispurchasable: store_item.ispurchasable
					, itemoptions_detail: store_item.itemoptions_detail
				};
			}

			if (!include_store_item && store_item && store_item.matrix_parent) {
				productlist_item.item.matrix_parent = store_item.matrix_parent;
			}
			results.push(productlist_item);
		});
		return results;
	}
});

//Model.js
Application.defineModel('TransactionHistory', {

	search: function (data) {
		'use strict';

		var types = ['CustCred', 'CustDep', 'DepAppl', 'CustPymt', 'CustInvc', 'RtnAuth']

			, amount_field = context.getFeature('MULTICURRENCY') ? 'fxamount' : 'amount'

			, filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			]

			, columns = [
				new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('internalid')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('status')
				, new nlobjSearchColumn('total')
				, new nlobjSearchColumn(amount_field)
				, new nlobjSearchColumn('tranid','createdfrom')
				, new nlobjSearchColumn('custbody_customer_name')
			];

		switch (data.filter) {
			case 'creditmemo':
				types = ['CustCred'];
				break;

			case 'customerpayment':
				types = ['CustPymt'];
				break;

			case 'customerdeposit':
				types = ['CustDep'];
				break;

			case 'depositapplication':
				types = ['DepAppl'];
				break;

			case 'invoice':
				types = ['CustInvc'];
				break;

			case 'returnauthorization':
				types = ['RtnAuth'];
				break;
		}

		filters.push(new nlobjSearchFilter('type', null, 'anyof', types));

		if (data.from && data.to) {
			var offset = new Date().getTimezoneOffset() * 60 * 1000;

			filters.push(new nlobjSearchFilter('trandate', null, 'within', new Date(parseInt(data.from, 10) + offset), new Date(parseInt(data.to, 10) + offset)));
		}

		switch (data.sort) {
			case 'number':
				columns[2].setSort(data.order >= 0);
				break;

			case 'amount':
				columns[5].setSort(data.order >= 0);
				break;

			default:
				columns[0].setSort(data.order > 0);
				columns[1].setSort(data.order > 0);
		}

		var result = Application.getPaginatedSearchResults({
			record_type: 'transaction'
			, filters: filters
			, columns: columns
			, page: data.page
		});

		result.records = _.map(result.records, function (record) {
			return {
				recordtype: record.getRecordType()
				, internalid: record.getValue('internalid')
				, tranid: record.getValue('tranid')
				, trandate: record.getValue('trandate')
				, status: record.getText('status')
				, amount: toCurrency(record.getValue(amount_field))
				, amount_formatted: formatCurrency(record.getValue(amount_field))
				, createdfrom: record.getValue('tranid','createdfrom')
				, customername: record.getValue('custbody_customer_name')
			};
		});

		return result;
	}
});

//Model.js
Application.defineModel('PrintStatement', {

	getUrl: function (data) {
		'use strict';
		var customerId = customer.getFieldValues(['internalid']).internalid
			, offset = new Date().getTimezoneOffset() * 60 * 1000
			, statementDate = null
			, startDate = null
			, openOnly = data.openOnly ? 'T' : 'F'
			, inCustomerLocale = data.inCustomerLocale ? 'T' : 'F'
			, consolidatedStatement = data.consolidatedStatement ? 'T' : 'F'
			, statementTimestamp = parseInt(data.statementDate, 10)
			, startDateParam = data.startDate
			, startTimestamp = parseInt(startDateParam, 10)
			, email = data.email
			, baseUrl = email ? '/app/accounting/transactions/email.nl' : '/app/accounting/print/NLSPrintForm.nl'
			, url = baseUrl + '?submitted=T&printtype=statement&currencyprecision=2&formdisplayview=NONE&type=statement';

		if (isNaN(statementTimestamp) || (startDateParam && isNaN(startTimestamp))) {
			throw {
				status: 500
				, code: 'ERR_INVALID_DATE_FORMAT'
				, message: 'Invalid date format'
			};
		}

		statementDate = nlapiDateToString(new Date(statementTimestamp + offset));
		startDate = startDateParam ? nlapiDateToString(new Date(startTimestamp + offset)) : null;

		url += '&customer=' + customerId;
		url += startDate ? ('&start_date=' + startDate) : '';
		url += '&statement_date=' + statementDate;
		url += '&consolstatement=' + consolidatedStatement;
		url += '&openonly=' + openOnly;
		url += '&incustlocale=' + inCustomerLocale;

		return url;
	}
});

//Model.js
// Quote.js
// -------
// Defines the model used by the quote.ss service
Application.defineModel('Quote', {

	get: function (id) {
		'use strict';

		var fields = ['entitystatus']
			, recordLookup = nlapiLookupField('estimate', id, fields, true)
			, record = nlapiLoadRecord('estimate', id);

		return this.createResultSingle(record, recordLookup);
	}

	, list: function (data) {
		'use strict';

		var self = this
			, page = data.page
			, result = {}
			, filters = [
				new nlobjSearchFilter('mainline', null, 'is', 'T')
			]
			, columns = [
				new nlobjSearchColumn('internalid')
				, new nlobjSearchColumn('tranid')
				, new nlobjSearchColumn('trandate')
				, new nlobjSearchColumn('duedate')
				, new nlobjSearchColumn('expectedclosedate')
				, new nlobjSearchColumn('entitystatus')
				, new nlobjSearchColumn('total')
			];

		self.setFilter(data.filter, filters);
		self.setDateFromTo(data.from, data.to, filters);
		self.setSortOrder(data.sort, data.order, columns);

		result = Application.getPaginatedSearchResults({
			record_type: 'estimate'
			, filters: filters
			, columns: columns
			, page: page
		});

		result.records = _.map(result.records, function (record) {
			return self.createResultMultiple(record);
		});

		return result;
	}

	, setFilter: function (filter, filters) {
		'use strict';

		if (filter && 0 < filter) {
			filters.push(new nlobjSearchFilter('entitystatus', null, 'is', filter));
		}
	}

	, setDateFromTo: function (from, to, filters) {
		'use strict';

		if (from) {
			filters.push(new nlobjSearchFilter('trandate', null, 'onorafter', this.setDateInt(from), null));
		}

		if (to) {
			filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', this.setDateInt(to), null));
		}
	}

	, setDateInt: function (date) {
		'use strict';

		var offset = new Date().getTimezoneOffset() * 60 * 1000;

		return new Date(parseInt(date, 10) + offset);
	}

	, setSortOrder: function (sort, order, columns) {
		'use strict';

		switch (sort) {
			case 'trandate':
				columns[2].setSort(order > 0);
				break;

			case 'duedate':
				columns[3].setSort(order > 0);
				break;

			case 'total':
				columns[6].setSort(order > 0);
				break;

			default:
				columns[1].setSort(order > 0);
		}
	}

	, createResultSingle: function (record, recordLookup) {
		'use strict';

		var result = {}
			, duedate = record.getFieldValue('duedate');

		result.internalid = record.getId();
		result.type = record.getRecordType();
		result.tranid = record.getFieldValue('tranid');
		result.trandate = record.getFieldValue('trandate');
		result.duedate = duedate;
		result.isOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - this.getDateTime());
		result.isCloseOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - (this.getDateTime() + this.getDaysBeforeExpiration()));
		result.expectedclosedate = record.getFieldValue('expectedclosedate');
		result.entitystatus = recordLookup.entitystatus;
		result.salesrep = record.getFieldText('salesrep');

		// Itemas
		result.lineItems = this.getLines(record, 'item');
		result.itemsExtradata = {
			couponcode: record.getFieldText('couponcode')
			, promocode: record.getFieldText('promocode')
			, exchangerate: toCurrency(record.getFieldValue('exchangerate'))
			, exchangerate_formatted: formatCurrency(record.getFieldValue('exchangerate'))
			, discountitem: record.getFieldText('discountitem')
			, discountrate: record.getFieldValue('discountrate')
		};

		// Address
		result.billaddress = record.getFieldValue('billaddress');

		// Shipping
		result.shipping = {
			shipcarrier: record.getFieldText('shipcarrier')
			, shipmethod: record.getFieldText('shipmethod')

			, shippingcost: toCurrency(record.getFieldValue('shippingcost'))
			, shippingcost_formatted: formatCurrency(record.getFieldValue('shippingcost'))

			, shippingtaxcode: record.getFieldText('shippingtaxcode')

			, shippingtax1rate: toCurrency(record.getFieldValue('shippingtax1rate'))
			, shippingtax1rate_formatted: formatCurrency(record.getFieldValue('shippingtax1rate'))
		};

		// Messages
		result.message = record.getFieldValue('message');
		result.messageItems = this.getLines(record, 'message');

		// Summary
		result.summary = {
			subtotal: toCurrency(record.getFieldValue('subtotal'))
			, subtotal_formatted: formatCurrency(record.getFieldValue('subtotal'))

			, discounttotal: toCurrency(record.getFieldValue('discounttotal'))
			, discounttotal_formatted: formatCurrency(record.getFieldValue('discounttotal'))

			, taxtotal: toCurrency(record.getFieldValue('taxtotal'))
			, taxtotal_formatted: formatCurrency(record.getFieldValue('taxtotal'))

			, shippingcost: toCurrency(record.getFieldValue('shippingcost'))
			, shippingcost_formatted: formatCurrency(record.getFieldValue('shippingcost'))

			, total: formatCurrency(record.getFieldValue('total'))
			, total_formatted: formatCurrency(record.getFieldValue('total'))
		};

		return result;
	}

	, createResultMultiple: function (record) {
		'use strict';

		var result = {}
			, duedate = record.getValue('duedate');

		result.internalid = record.getValue('internalid');
		result.tranid = record.getValue('tranid');
		result.trandate = record.getValue('trandate');
		result.duedate = duedate;
		result.isOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - this.getDateTime());
		result.isCloseOverdue = this.isDateInterval(new Date(nlapiStringToDate(duedate)).getTime() - (this.getDateTime() + this.getDaysBeforeExpiration()));
		result.expectedclosedate = record.getValue('expectedclosedate');
		result.entitystatus = {
			id: record.getValue('entitystatus')
			, name: record.getText('entitystatus')
		};
		result.total = toCurrency(record.getValue('total'));
		result.total_formatted = formatCurrency(record.getValue('total'));

		return result;
	}

	, getLines: function (record, name) {
		'use strict';

		var data = [];

		for (var i = 1; i <= record.getLineItemCount(name); i++) {
			data.push(this.getLineInformation(record, i, name));
		}

		return data;
	}

	, getLineInformation: function (record, index, name) {
		'use strict';

		var lineInformation = {}
			, store_item = Application.getModel('StoreItem');

		switch (name) {
			case 'item':
				var amount = record.getLineItemValue(name, 'amount', index)
					, rate = record.getLineItemValue(name, 'rate', index);

				lineInformation = {
					quantity: record.getLineItemValue(name, 'quantity', index)
					, options: getItemOptionsObject(record.getLineItemValue(name, 'options', index))

					, amount: toCurrency(amount)
					, amount_formatted: formatCurrency(Math.abs(amount))

					, rate: toCurrency(rate)
					, rate_formatted: formatCurrency(Math.abs(rate))

					, item: store_item.get(
						record.getLineItemValue(name, 'item', index)
						, record.getLineItemValue(name, 'itemtype', index)
					)
				};
				break;

			case 'message':
				lineInformation = {
					subject: record.getFieldValue('subject')
					, message: record.getFieldText('message')
				};
				break;
		}

		return lineInformation;
	}

	, getDateTime: function () {
		'use strict';

		return new Date().getTime();
	}

	, isDateInterval: function (date) {
		'use strict';

		return 0 >= date && ((-1 * date) / 1000 / 60 / 60 / 24) >= 1;
	}

	, getDaysBeforeExpiration: function () {
		'use strict';

		return SC.Configuration.quote.days_to_expire * 24 * 60 * 60 * 1000;
	}
});


//Model.js
// Case.js
// ----------
// Handles fetching, creating and updating cases.
Application.defineModel('Case', {

	// ## General settings
	configuration: SC.Configuration.cases

	// Dummy date for cases with no messages. Not common, but it could happen.
	, dummy_date: new Date(1970, 1, 1)

	// Returns a new Case record
	, getNew: function () {
		'use strict';

		var case_record = nlapiCreateRecord('supportcase');

		// Categories
		var category_field = case_record.getField('category');
		var category_options = category_field.getSelectOptions();
		var category_option_values = [];

		_(category_options).each(function (category_option) {
			var category_option_value = {
				id: category_option.id
				, text: category_option.text
			};

			category_option_values.push(category_option_value);
		});

		// Origins
		var origin_field = case_record.getField('origin');
		var origin_options = origin_field.getSelectOptions();
		var origin_option_values = [];

		_(origin_options).each(function (origin_option) {
			var origin_option_value = {
				id: origin_option.id
				, text: origin_option.text
			};

			origin_option_values.push(origin_option_value);
		});

		// Statuses
		var status_field = case_record.getField('status');
		var status_options = status_field.getSelectOptions();
		var status_option_values = [];

		_(status_options).each(function (status_option) {
			var status_option_value = {
				id: status_option.id
				, text: status_option.text
			};

			status_option_values.push(status_option_value);
		});

		// Priorities
		var priority_field = case_record.getField('priority');
		var priority_options = priority_field.getSelectOptions();
		var priority_option_values = [];

		_(priority_options).each(function (priority_option) {
			var priority_option_value = {
				id: priority_option.id
				, text: priority_option.text
			};

			priority_option_values.push(priority_option_value);
		});

		var item_field = case_record.getField('item');
		var item_options = item_field.getSelectOptions();
		var item_option_values = [];

		_(item_options).each(function (item_option) {
			var item_option_value = {
				id: item_option.id
				, text: item_option.text
			};

			item_option_values.push(item_option_value);
		});
		var issue_field = case_record.getField('issue');
		var issue_options = issue_field.getSelectOptions();
		var issue_option_values = [];

		_(issue_options).each(function (issue_option) {
			var issue_option_value = {
				id: issue_option.id
				, text: issue_option.text
			};

			issue_option_values.push(issue_option_value);
		});
		var discountreasons_field = case_record.getField('custevent_discount_reasons');
		var discountreasons_options = discountreasons_field.getSelectOptions();
		var discountreasons_option_values = [];

		_(discountreasons_options).each(function (discountreasons_option) {
			var discountreasons_option_value = {
				id: discountreasons_option.id
				, text: discountreasons_option.text
			};

			discountreasons_option_values.push(discountreasons_option_value);
		});
		var liningcodes_field = case_record.getField('custevent_supportcase_lining');
		var liningcodes_options = liningcodes_field.getSelectOptions();
		var liningcodes_option_values = [];

		_(liningcodes_options).each(function (liningcodes_option) {
			var liningcodes_option_value = {
				id: liningcodes_option.id
				, text: liningcodes_option.text
			};

			liningcodes_option_values.push(liningcodes_option_value);
		});
		var columns = [], linings_option_record = [];
		columns.push(new nlobjSearchColumn('internalid'));
		columns.push(new nlobjSearchColumn('custrecord_flf_ftno'));
		columns.push(new nlobjSearchColumn('custrecord_flf_ftcode'));
		columns.push(new nlobjSearchColumn('custrecord_flf_ftstock'));
		columns.push(new nlobjSearchColumn('custrecord_flf_ftstatus'));
		columns.push(new nlobjSearchColumn('custrecord_flf_ftorderstock'));
		columns.push(new nlobjSearchColumn('custrecord_llp_price','custrecord_flf_lininglevel'));
		var linings = nlapiSearchRecord('customrecord_factory_lining_fabrics',null,
		[new nlobjSearchFilter('isinactive',null,'is','F'),new nlobjSearchFilter('custrecord_flf_useonsystem',null,'is','T')]
		,columns);
		for(var i=0;i<linings.length;i++){
			linings_option_record.push({
				internalid: linings[i].getValue('internalid'),
				custrecord_flf_ftno: linings[i].getValue('custrecord_flf_ftno'),
				custrecord_flf_ftcode: linings[i].getValue('custrecord_flf_ftcode'),
				custrecord_flf_ftstock: linings[i].getValue('custrecord_flf_ftstock'),
				custrecord_flf_ftstatus: linings[i].getValue('custrecord_flf_ftstatus'),
				custrecord_flf_ftorderstock: linings[i].getValue('custrecord_flf_ftorderstock'),
				custrecord_flf_lininglevel: linings[i].getValue('custrecord_llp_price','custrecord_flf_lininglevel')
			});
		}
		liningcodes_option_values = _.map(liningcodes_option_values, function(element) {
		    var lor = _.findWhere(linings_option_record, { internalid: element.id });
		    return _.extend(element, lor);
		});
		liningcodes_option_values = _.filter(liningcodes_option_values,function(element){
				return element.custrecord_flf_lininglevel != null;
		});
		var columns = [], accessories_option_record = [];
		columns.push(new nlobjSearchColumn('internalid'));
		columns.push(new nlobjSearchColumn('custrecord_ap_accessory_type'));
		columns.push(new nlobjSearchColumn('custrecord_ap_code'));
		columns.push(new nlobjSearchColumn('custrecord_ap_description'));
		columns.push(new nlobjSearchColumn('custrecord_ap_price'));
		columns.push(new nlobjSearchColumn('custrecord_ap_price2'));
		var accessories = nlapiSearchRecord('customrecord_accessory_pricing',null,new nlobjSearchFilter('isinactive',null,'is','F'),columns);
		for(var i=0;i<accessories.length;i++){
			accessories_option_record.push({
				internalid: accessories[i].getValue('internalid'),
				custrecord_ap_accessory_type_id: accessories[i].getValue('custrecord_ap_accessory_type'),
				custrecord_ap_accessory_type_text: accessories[i].getText('custrecord_ap_accessory_type'),
				custrecord_ap_code: accessories[i].getValue('custrecord_ap_code'),
				custrecord_ap_description: accessories[i].getValue('custrecord_ap_description'),
				custrecord_ap_price: accessories[i].getValue('custrecord_ap_price'),
				custrecord_ap_price2: accessories[i].getValue('custrecord_ap_price2')
			});
		}

		var monogramtypes_field = case_record.getField('custevent_supportcase_monogramtype');
		var monogramtypes_options = monogramtypes_field.getSelectOptions();
		var monogramtypes_option_values = [];

		_(monogramtypes_options).each(function (monogramtypes_option) {
			var monogramtypes_option_value = {
				id: monogramtypes_option.id
				, text: monogramtypes_option.text
			};
			monogramtypes_option_values.push(monogramtypes_option_value);
		});
		var monogramcolors_field = case_record.getField('custevent_supportcase_monogram_color');
		var monogramcolors_options = monogramcolors_field.getSelectOptions();
		var monogramcolors_option_values = [];

		_(monogramcolors_options).each(function (monogramcolors_option) {
			var monogramcolors_option_value = {
				id: monogramcolors_option.id
				, text: monogramcolors_option.text
			};
			monogramcolors_option_values.push(monogramcolors_option_value);
		});
		var monogramfontsizes_field = case_record.getField('custevent_supportcase_fontsize');
		var monogramfontsizes_options = monogramfontsizes_field.getSelectOptions();
		var monogramfontsizes_option_values = [];

		_(monogramfontsizes_options).each(function (monogramfontsizes_option) {
			var monogramfontsizes_option_value = {
				id: monogramfontsizes_option.id
				, text: monogramfontsizes_option.text
			};
			monogramfontsizes_option_values.push(monogramfontsizes_option_value);
		});
		var monogrampositions_field = case_record.getField('custevent_supportcase_monogram_pos');
		var monogrampositions_options = monogrampositions_field.getSelectOptions();
		var monogrampositions_option_values = [];

		_(monogrampositions_options).each(function (monogrampositions_option) {
			var monogrampositions_option_value = {
				id: monogrampositions_option.id
				, text: monogrampositions_option.text
			};
			monogrampositions_option_values.push(monogrampositions_option_value);
		});
		var cmtvendors_field = case_record.getField('custevent_supportcase_cmtvendor');
		var cmtvendors_options = cmtvendors_field.getSelectOptions();
		var cmtvendors_option_values = [];

		_(cmtvendors_options).each(function (cmtvendors_option) {
			var cmtvendors_option_value = {
				id: cmtvendors_option.id
				, text: cmtvendors_option.text
			};
			cmtvendors_option_values.push(cmtvendors_option_value);
		});
		var cuffpositions_field = case_record.getField('custevent_supportcase_cuff_position');
		var cuffpositions_options = cuffpositions_field.getSelectOptions();
		var cuffpositions_option_values = [];

		_(cuffpositions_options).each(function (cuffpositions_option) {
			var cuffpositions_option_value = {
				id: cuffpositions_option.id
				, text: cuffpositions_option.text
			};
			cuffpositions_option_values.push(cuffpositions_option_value);
		});

		// New record to return
		var newRecord = {
			categories: category_option_values
			, origins: origin_option_values
			, statuses: status_option_values
			, priorities: priority_option_values
			, items: item_option_values
			, issues: issue_option_values
			, discountreasons: discountreasons_option_values
			, liningcodes: liningcodes_option_values
			, accessories: accessories_option_record
			, monogramtypes: monogramtypes_option_values
			, monogramcolors: monogramcolors_option_values
			, monogramfontsizes: monogramfontsizes_option_values
			, monogrampositions: monogrampositions_option_values
			, cmtvendors: cmtvendors_option_values
			, cuffpositions: cuffpositions_option_values
		};

		return newRecord;
	}

	, getColumnsArray: function () {
		'use strict';

		return [
			new nlobjSearchColumn('internalid')
			, new nlobjSearchColumn('casenumber')
			, new nlobjSearchColumn('title')
			, new nlobjSearchColumn('status')
			, new nlobjSearchColumn('origin')
			, new nlobjSearchColumn('category')
			, new nlobjSearchColumn('company')
			, new nlobjSearchColumn('createddate')
			, new nlobjSearchColumn('lastmessagedate')
			, new nlobjSearchColumn('priority')
			, new nlobjSearchColumn('email')
			, new nlobjSearchColumn('item')
			, new nlobjSearchColumn('issue')
			, new nlobjSearchColumn('custevent_so_id')
			, new nlobjSearchColumn('custevent_related_sales_order')
			, new nlobjSearchColumn('custevent_discount_reasons')
			, new nlobjSearchColumn('custevent_date_needed')
			, new nlobjSearchColumn('custevent_replacement_soid')
			, new nlobjSearchColumn('custevent_supportcase_lining')
			, new nlobjSearchColumn('custevent_supportcase_quantity')
			, new nlobjSearchColumn('custevent_supportcase_total')
			, new nlobjSearchColumn('custevent_supportcase_fabriccode')
			, new nlobjSearchColumn('custevent_supportcase_accessory')
			, new nlobjSearchColumn('custevent_supportcase_large')
			, new nlobjSearchColumn('custevent_supportcase_small')
			, new nlobjSearchColumn('custevent_supportcase_cmtvendor')
			, new nlobjSearchColumn('custevent_supportcase_collarfinished')
			, new nlobjSearchColumn('custevent_supportcase_hasmonogram')
			, new nlobjSearchColumn('custevent_supportcase_monogramtext')
			, new nlobjSearchColumn('custevent_supportcase_monogramtype')
			, new nlobjSearchColumn('custevent_supportcase_fontsize')
			, new nlobjSearchColumn('custevent_supportcase_monogram_pos')
			, new nlobjSearchColumn('custevent_supportcase_monogram_color')
			, new nlobjSearchColumn('custevent_supportcase_cmtcollection')
			, new nlobjSearchColumn('custevent_supportcase_cuff_position')
			, new nlobjSearchColumn('custevent_sc_accessorycode')
			, new nlobjSearchColumn('custevent_sc_accessorydescription')
			, new nlobjSearchColumn('custevent_sc_accessoryprice')
			, new nlobjSearchColumn('custevent_sc_accessoryprice2')
			, new nlobjSearchColumn('custevent_is_cmt')
			, new nlobjSearchColumn('custevent_supportcase_cuffleft')
			, new nlobjSearchColumn('custevent_supportcase_cuffright')
			, new nlobjSearchColumn('custevent_requested_by')
		];
	}

	// Returns a Case based on a given id
	, get: function (id) {
		'use strict';

		var filters = [new nlobjSearchFilter('internalid', null, 'is', id), new nlobjSearchFilter('isinactive', null, 'is', 'F')]
			, columns = this.getColumnsArray()
			, result = this.searchHelper(filters, columns, 1, true);

		if (result.records.length >= 1) {
			return result.records[0];
		}
		else {
			throw notFoundError;
		}
	}

	// Retrieves all Cases for a given user
	, search: function (customer_id, list_header_data) {
		'use strict';

		var filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')]
			, columns = this.getColumnsArray()
			, selected_filter = parseInt(list_header_data.filter, 10);

		if (!_.isNaN(selected_filter)) {
			filters.push(new nlobjSearchFilter('status', null, 'anyof', selected_filter));
		}

		this.setSortOrder(list_header_data.sort, list_header_data.order, columns);

		return this.searchHelper(filters, columns, list_header_data.page, false);
	}

	, searchHelper: function (filters, columns, page, join_messages) {
		'use strict';

		var self = this
			, result = Application.getPaginatedSearchResults({
				record_type: 'supportcase'
				, filters: filters
				, columns: columns
				, page: page
			});

		result.records = _.map(result.records, function (case_record) {
			var current_record_id = case_record.getId()
				, created_date = nlapiStringToDate(case_record.getValue('createddate'))
				, custevent_date_needed = nlapiStringToDate(case_record.getValue('custevent_date_needed'))
				, last_message_date = nlapiStringToDate(case_record.getValue('lastmessagedate'))
				, support_case = {
					internalid: current_record_id
					, caseNumber: case_record.getValue('casenumber')
					, title: case_record.getValue('title')
					, grouped_messages: []
					, status: {
						id: case_record.getValue('status')
						, name: case_record.getText('status')
					}
					, origin: {
						id: case_record.getValue('origin')
						, name: case_record.getText('origin')
					}
					, category: {
						id: case_record.getValue('category')
						, name: case_record.getText('category')
					}
					, company: {
						id: case_record.getValue('company')
						, name: case_record.getText('company')
					}
					, priority: {
						id: case_record.getValue('priority')
						, name: case_record.getText('priority')
					}
					, custevent_so_id: case_record.getValue('custevent_so_id')
					, custevent_related_sales_order: {
						id: case_record.getValue('custevent_related_sales_order')
						, name: case_record.getText('custevent_related_sales_order')
					}
					, custevent_discount_reasons: {
						id: case_record.getValue('custevent_discount_reasons')
						, name: case_record.getText('custevent_discount_reasons')
					}
					, custevent_date_needed: nlapiDateToString(custevent_date_needed ? custevent_date_needed : self.dummy_date, 'date')
					, custevent_replacement_soid: case_record.getValue('custevent_replacement_soid')
					, createdDate: nlapiDateToString(created_date ? created_date : self.dummy_date, 'date')
					, lastMessageDate: nlapiDateToString(last_message_date ? last_message_date : self.dummy_date, 'date')
					, email: case_record.getValue('email')
					, custevent_supportcase_lining: {
						id: case_record.getValue('custevent_supportcase_lining')
						, name: case_record.getText('custevent_supportcase_lining')
					}
					, custevent_supportcase_quantity: case_record.getValue('custevent_supportcase_quantity')
					, custevent_supportcase_total: case_record.getValue('custevent_supportcase_total')
					, custevent_supportcase_fabriccode: case_record.getValue('custevent_supportcase_fabriccode')
					, custevent_supportcase_accessory: {
						id: case_record.getValue('custevent_supportcase_accessory')
						, name: case_record.getText('custevent_supportcase_accessory')
					}
					, custevent_supportcase_large: case_record.getValue('custevent_supportcase_large')
					, custevent_supportcase_small: case_record.getValue('custevent_supportcase_small')
					, custevent_supportcase_collarfinished: case_record.getValue('custevent_supportcase_collarfinished')
					, custevent_supportcase_hasmonogram: case_record.getValue('custevent_supportcase_hasmonogram')
					, custevent_supportcase_monogramtext: case_record.getValue('custevent_supportcase_monogramtext')
					, custevent_supportcase_fontsize: case_record.getValue('custevent_supportcase_fontsize')
					, custevent_supportcase_cmtcollection: case_record.getValue('custevent_supportcase_cmtcollection')
					, custevent_supportcase_cmtvendor: {
						id: case_record.getValue('custevent_supportcase_cmtvendor')
						, name: case_record.getText('custevent_supportcase_cmtvendor')
					}
					, custevent_supportcase_monogramtype: {
						id: case_record.getValue('custevent_supportcase_monogramtype')
						, name: case_record.getText('custevent_supportcase_monogramtype')
					}
					, custevent_supportcase_monogram_pos: {
						id: case_record.getValue('custevent_supportcase_monogram_pos')
						, name: case_record.getText('custevent_supportcase_monogram_pos')
					}
					, custevent_supportcase_monogram_color: {
						id: case_record.getValue('custevent_supportcase_monogram_color')
						, name: case_record.getText('custevent_supportcase_monogram_color')
					}
					, issue: {
						id: case_record.getValue('issue')
						, name: case_record.getText('issue')
					}
					, item: {
						id: case_record.getValue('item')
						, name: case_record.getText('item')
					}
					, custevent_sc_accessorycode: case_record.getValue('custevent_sc_accessorycode')
					, custevent_sc_accessorydescription: case_record.getValue('custevent_sc_accessorydescription')
					, custevent_sc_accessoryprice: case_record.getValue('custevent_sc_accessoryprice')
					, custevent_sc_accessoryprice2: case_record.getValue('custevent_sc_accessoryprice2')
					, custevent_supportcase_cuff_position: {
						id: case_record.getValue('custevent_supportcase_cuff_position')
						, name: case_record.getText('custevent_supportcase_cuff_position')
					}
					, custevent_is_cmt: case_record.getValue('custevent_is_cmt')
					, custevent_supportcase_cuffleft: case_record.getValue('custevent_supportcase_cuffleft')
					, custevent_supportcase_cuffright: case_record.getValue('custevent_supportcase_cuffright')
					, custevent_requested_by: case_record.getValue('custevent_requested_by')
				};

			if (join_messages) {
				self.appendMessagesToCase(support_case);
			}

			return support_case;
		});

		return result;
	}

	, stripHtmlFromMessage: function (message) {
		'use strict';

		return message.replace(/<br\s*[\/]?>/gi, '\n').replace(/<(?:.|\n)*?>/gm, '');
	}

	// When requesting a case detail, messages are included in the response.
	, appendMessagesToCase: function (support_case) {
		'use strict';

		var message_columns = {
			message_col: new nlobjSearchColumn('message', 'messages')
			, message_date_col: new nlobjSearchColumn('messagedate', 'messages').setSort(true)
			, author_col: new nlobjSearchColumn('author', 'messages')
		}
			, message_filters = [new nlobjSearchFilter('internalid', null, 'is', support_case.internalid), new nlobjSearchFilter('internalonly', 'messages', 'is', 'F')]
			, message_records = Application.getAllSearchResults('supportcase', message_filters, _.values(message_columns))
			, grouped_messages = []
			, messages_count = 0
			, self = this;

		_(message_records).each(function (message_record) {
			var customer_id = nlapiGetUser() + ''
				, message_date_tmp = nlapiStringToDate(message_record.getValue('messagedate', 'messages'))
				, message_date = message_date_tmp ? message_date_tmp : this.dummy_date
				, message_date_to_group_by = message_date.getFullYear() + '-' + (message_date.getMonth() + 1) + '-' + message_date.getDate()
				, message = {
					author: message_record.getValue('author', 'messages') === customer_id ? 'You' : message_record.getText('author', 'messages')
					, text: self.stripHtmlFromMessage(message_record.getValue('message', 'messages'))
					, messageDate: nlapiDateToString(message_date, 'timeofday')
					, initialMessage: false
				};

			if (grouped_messages[message_date_to_group_by]) {
				grouped_messages[message_date_to_group_by].messages.push(message);
			}
			else {
				grouped_messages[message_date_to_group_by] = {
					date: self.getMessageDate(message_date)
					, messages: [message]
				};
			}

			messages_count++;

			if (messages_count === message_records.length) {
				message.initialMessage = true;
			}
		});

		support_case.grouped_messages = _(grouped_messages).values();
		support_case.messages_count = messages_count;
	}

	, getMessageDate: function (validJsDate) {
		'use strict';

		var today = new Date()
			, today_dd = today.getDate()
			, today_mm = today.getMonth()
			, today_yyyy = today.getFullYear()
			, dd = validJsDate.getDate()
			, mm = validJsDate.getMonth()
			, yyyy = validJsDate.getFullYear();

		if (today_dd === dd && today_mm === mm && today_yyyy === yyyy) {
			return 'Today';
		}

		return nlapiDateToString(validJsDate, 'date');
	}

	// Creates a new Case record
	, create: function (customerId, data) {
		'use strict';
		try{
			customerId = customerId || nlapiGetUser() + '';

			var newCaseRecord = nlapiCreateRecord('supportcase');
			var keys = Object.keys(data);
			for(var i=0;i<keys.length;i++){
				if(	keys[i] == "file" || keys[i] == "filename" || keys[i] == "filetype" ||
						keys[i] == "file2" || keys[i] == "filename2" || keys[i] == "filetype2" ||
						keys[i] == "file3" || keys[i] == "filename3" || keys[i] == "filetype3") continue;
				if(keys[i] == "message" || keys[i] == "custevent_supportcase_hasmonogram"){
					if(!data.message)
						data.message = data.title;
					newCaseRecord.setFieldValue('incomingmessage', this.sanitize(data.message));
				}
				else
					newCaseRecord.setFieldValue(keys[i], this.sanitize(data[keys[i]].toString()));
			}
			if(data.custevent_supportcase_hasmonogram == "on" || data.custevent_supportcase_hasmonogram == true){
				newCaseRecord.setFieldValue("custevent_supportcase_hasmonogram", "T");
			}else{
				newCaseRecord.setFieldValue("custevent_supportcase_hasmonogram", "F");
			}
			// data.title && newCaseRecord.setFieldValue('title', this.sanitize(data.title));
			// data.message && newCaseRecord.setFieldValue('incomingmessage', this.sanitize(data.message));
			// data.category && newCaseRecord.setFieldValue('category', data.category);
			// data.email && newCaseRecord.setFieldValue('email', data.email);
			customerId && newCaseRecord.setFieldValue('company', customerId);
			// data.issue && newCaseRecord.setFieldValue('issue', data.issue);
			// data.item && newCaseRecord.setFieldValue('item', data.item);
			// data.custevent_so_id && newCaseRecord.setFieldValue('custevent_so_id', data.custevent_so_id);
			// data.custevent_related_sales_order && newCaseRecord.setFieldValue('custevent_related_sales_order', data.custevent_related_sales_order);
			// data.custevent_discount_reasons && newCaseRecord.setFieldValue('custevent_discount_reasons', data.custevent_discount_reasons);
			// data.custevent_date_needed && newCaseRecord.setFieldValue('custevent_date_needed', data.custevent_date_needed);
			// //data.custevent_discount_requested && newCaseRecord.setFieldValue('custevent_discount_requested', data.custevent_discount_requested);
			// data.custevent_replacement_soid && newCaseRecord.setFieldValue('custevent_replacement_soid', data.custevent_replacement_soid);
			var default_values = this.configuration.default_values;

			newCaseRecord.setFieldValue('status', default_values.status_start.id); // Not Started
			newCaseRecord.setFieldValue('origin', default_values.origin.id); // Web
			newCaseRecord.setFieldValue('profile', 2); // Jerome Clothiers
			var caseid = nlapiSubmitRecord(newCaseRecord);
			if(data.file){
				var r = nlapiRequestURL("https://3857857.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=384&deploy=1&compid=3857857&h=ad5340eb5ddc555adf33",
					{imageContents:data.file, filename:data.filename, filetype:data.filetype}
				);
				// nlapiLogExecution('debug','R',JSON.stringify(r));
				nlapiAttachRecord("file", r.getBody(), "supportcase", caseid);
			}
			if(data.file2){
				var r = nlapiRequestURL("https://3857857.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=384&deploy=1&compid=3857857&h=ad5340eb5ddc555adf33",
					{imageContents:data.file2, filename:data.filename2, filetype:data.filetype2}
				);
				// nlapiLogExecution('debug','R',JSON.stringify(r));
				nlapiAttachRecord("file", r.getBody(), "supportcase", caseid);
			}
			if(data.file3){
				var r = nlapiRequestURL("https://3857857.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=384&deploy=1&compid=3857857&h=ad5340eb5ddc555adf33",
					{imageContents:data.file3, filename:data.filename3, filetype:data.filetype3}
				);
				// nlapiLogExecution('debug','R',JSON.stringify(r));
				nlapiAttachRecord("file", r.getBody(), "supportcase", caseid);
			}
			return caseid;
		}catch(e){
				nlapiLogExecution("error","create case", e);
		}
	}

	, setSortOrder: function (sort, order, columns) {
		'use strict';

		switch (sort) {
			case 'createdDate':
				columns[7].setSort(order > 0);
				break;

			case 'lastMessageDate':
				columns[8].setSort(order > 0);
				break;

			default:
				columns[1].setSort(order > 0);
		}
	}

	// Sanitize html input
	, sanitize: function (text) {
		'use strict';

		return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
	}

	// Updates a Support Case given its id
	, update: function (id, data) {
		'use strict';

		if (data && data.status) {
			if (data.reply && data.reply.length > 0) {
				nlapiSubmitField('supportcase', id, ['incomingmessage', 'messagenew', 'status'], [this.sanitize(data.reply), 'T', data.status.id]);
			}
			else {
				nlapiSubmitField('supportcase', id, ['status'], data.status.id);
			}
		}
	}
});
