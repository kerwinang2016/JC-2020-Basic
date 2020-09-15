define('SuiteScriptMock.TestData', [
	]
,	function (
	)
{
	'use strict';

	var mock_files = {

		'53': {

			getId: function getId()
			{
				return '53';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '13';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("Extension4.Model", [\n';
				content += '	"SC.Model"\n';
				content += ',	"SC.Models.Init"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		SCModel\n';
				content += '	,	ModelsInit\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return SCModel.extend({\n';
				content += '		name: "Extension4"\n\n\n';
				content += '	,	test: function (){\n';
				content += '			nlapiLogExecution("DEBUG", "Loading Extension4.Model");\n';
				content += '			return "Test Data";\n\n';
				content += '		}\n';
				content += '	});';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5518';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("MyExamplePDPExtension1", [\n';
				content += '	"MyProductPrice.View"\n';
				content += ',	"MyError.View"\n';
				content += ',	"underscore"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		MyProductPriceView\n';
				content += '	,	MyErrorView\n';
				content += '	,	_\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return {\n';
				content += '		mountToApp: function mountToApp (application)\n';
				content += '		{\n';
				content += '			var pdp = application.getComponent("PDP");\n';
				content += '			pdp.setChildViewIndex("ProductDetails.Full.View", "MainActionView", "MainActionView", 30);\n';
				content += '			alert("Some other code in the mountoapp");\n';
				content += '		}\n';
				content += '	};';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyProductPrice.View.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyProductPrice.View.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5518';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("MyProductPrice.View", [\n';
				content += '	"my_extension_1_product_price.tpl"\n';
				content += ',	"Backbone"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		my_extension_1_product_price_tpl\n';
				content += '	,	Backbone\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return Backbone.View.extend({\n';
				content += '		template: my_extension_1_product_price_tpl\n\n';
				content += '	,	initialize: function initialize (options){\n';
				content += '			this.pdp = options.pdp;\n';
				content += '		}\n\n';
				content += '	,	getContext: function getContext (){\n';
				content += '			return {\n';
				content += '				price: "5"\n';
				content += '			};\n';
				content += '		}\n\n';
				content += '	});';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyError.View.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyError.View.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5518';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("MyError.View", [\n';
				content += '	"my_extension_1_error.tpl"\n';
				content += ',	"Backbone"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		my_extension_1_error_tpl\n';
				content += '	,	Backbone\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return Backbone.View.extend({\n';
				content += '		isErrorView: true\n\n';
				content += '	,	template: my_extension_1_error_tpl\n\n';
				content += '	,	initialize: function initialize (options){\n';
				content += '			this.message = options.message;\n';
				content += '		}\n\n';
				content += '	,	getContext: function getContext (){\n';
				content += '			return {\n';
				content += '				message: this.message';
				content += '			};\n';
				content += '		}\n\n';
				content += '	});';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension2/javascript/MyExamplePDPExtension2/MyExamplePDPExtension2.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension2/javascript/MyExamplePDPExtension2/MyExamplePDPExtension2.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5518';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("MyExamplePDPExtension2", [\n';
				content += '	"MyExtension2.View"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		MyExtension2View\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return {\n';
				content += '		mountToApp: function mountToApp (application)\n';
				content += '		{\n';
				content += '			var pdp = application.getComponent("PDP");\n';
				content += '			pdp.setChildViewIndex("ProductDetails.Full.View", "MainActionView", "MainActionView", 30);\n';
				content += '			alert("Some other code in the mountoapp");\n';
				content += '		}\n';
				content += '	};';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension2/javascript/MyExamplePDPExtension2/MyExtension2.View.js': {
			
			getId: function getId()
			{
				return 'ExtensionSource/Extension2/javascript/MyExamplePDPExtension2/MyExtension2.View.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5518';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("MyExtension2.View", [\n';
				content += '	"my_extension_2.tpl"\n';
				content += ',	"Backbone"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		my_extension_2_tpl\n';
				content += '	,	Backbone\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return Backbone.View.extend({\n';
				content += '		template: my_extension_2_tpl\n\n';
				content += '	,	events: {\n';
				content += '			"click [data-action=\'show-alert\']": "showAlert"\n';
				content += '		}\n\n';
				content += '	,	initialize: function initialize (options){\n';
				content += '			this.message = options.message || "Dummy text";\n';
				content += '			this.text = options.text || "Alert Action";\n';
				content += '		}\n\n';
				content += '	,	getContext: function getContext (){\n';
				content += '			return {\n';
				content += '				text: this.text';
				content += '			};\n';
				content += '		}\n\n';
				content += '	});';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension2/templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension2/templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5518';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += '<div>{{price}} IS LESS THAN $100</div>\n';
				content += '{{!----\n';
				content += 'The context variables for this template are not currently documented. ';
				content += 'Use the {{log this}} helper to view the context variables in the Console of your browser\'s developer tools.\n';
				content += '----}}';

				return nlapiEncrypt(content, 'base64');
			}
		}

	,	'ExtensionSource/Extension1/templates/Header/header.tpl': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/templates/Header/header.tpl';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5457';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += '<div class="header-message" data-view="Message.Placeholder"></div>\n';
				content += '<div class="header-main-wrapper">\n';
				content += '<div class="header-subheader">\n';
				content += '<div class="header-subheader-container">\n';
				content += '<ul class="header-subheader-options">\n';
				content += '{{#if showLanguagesOrCurrencies}}\n';
				content += '<li class="header-subheader-settings">\n';
				content += '<a href="#" class="header-subheader-settings-link" data-toggle="dropdown" title="{{translate \'Settings\'}}">\n';
				content += '<i class="header-menu-settings-icon"></i>\n';
				content += '<i class="header-menu-settings-carret"></i>\n';
				content += '</a>\n';
				content += '<div class="header-menu-settings-dropdown">\n';
				content += '<h5 class="header-menu-settings-dropdown-title">{{translate \'Site Settings\'}}</h5>\n';
				content += '{{#if showLanguages}}\n';
				content += '<div data-view="Global.HostSelector"></div>\n';
				content += '{{/if}}\n';
				content += '{{#if showCurrencies}}\n';
				content += '<div data-view="Global.CurrencySelector"></div>\n';
				content += '{{/if}}\n';
				content += '</div>\n';
				content += '</li>\n';
				content += '{{/if}}\n';
				content += '<li data-view="StoreLocatorHeaderLink"></li>\n';
				content += '<li data-view="RequestQuoteWizardHeaderLink"></li>\n';
				content += '<li data-view="QuickOrderHeaderLink"></li>\n';
				content += '</ul>\n';
				content += '</div>\n';
				content += '</div>\n';
				content += '<nav class="header-main-nav">\n';
				content += '<div id="banner-header-top" class="content-banner banner-header-top" data-cms-area="header_banner_top" data-cms-area-filters="global"></div>\n';
				content += '<div class="header-sidebar-toggle-wrapper">\n';
				content += '<button class="header-sidebar-toggle" data-action="header-sidebar-show">\n';
				content += '<i class="header-sidebar-toggle-icon"></i>\n';
				content += '</button>\n';
				content += '</div>\n';
				content += '<div class="header-content">\n';
				content += '<div class="header-logo-wrapper">\n';
				content += '<div data-view="Header.Logo"></div>\n';
				content += '</div>\n';
				content += '<div class="header-right-menu">\n';
				content += '<div class="header-menu-profile" data-view="Header.Profile">\n';
				content += '</div>\n';
				content += '<div class="header-menu-locator-mobile" data-view="StoreLocatorHeaderLink"></div>\n';
				content += '<div class="header-menu-searchmobile">\n';
				content += '<button class="header-menu-searchmobile-link" data-action="show-sitesearch" title="{{translate \'Search\'}}">\n';
				content += '<i class="header-menu-searchmobile-icon"></i>\n';
				content += '</button>\n';
				content += '</div>\n';
				content += '<div class="header-menu-cart">\n';
				content += '<div class="header-menu-cart-dropdown" >\n';
				content += '<div data-view="Header.MiniCart"></div>\n';
				content += '</div>\n';
				content += '</div>\n';
				content += '</div>\n';
				content += '</div>\n';
				content += '<div id="banner-header-bottom" class="content-banner banner-header-bottom" data-cms-area="header_banner_bottom" data-cms-area-filters="global"></div>\n';
				content += '</nav>\n';
				content += '</div>\n';
				content += '<div class="header-sidebar-overlay" data-action="header-sidebar-hide"></div>\n';
				content += '<div class="header-secondary-wrapper" data-view="Header.Menu" data-phone-template="header_sidebar" data-tablet-template="header_sidebar">\n';
				content += '</div>\n';
				content += '<div class="header-site-search" data-view="SiteSearch" data-type="SiteSearch"></div>\n';
				content += '{{!----\n';
				content += 'Use the following context variables when customizing this template: \n';
				content += '	profileModel (Object)\n';
				content += '	profileModel.addresses (Array)\n';
				content += '	profileModel.addresses.0 (Array)\n';
				content += '	profileModel.creditcards (Array)\n';
				content += '	profileModel.firstname (String)\n';
				content += '	profileModel.paymentterms (undefined)\n';
				content += '	profileModel.phoneinfo (undefined)\n';
				content += '	profileModel.middlename (String)\n';
				content += '	profileModel.vatregistration (undefined)\n';
				content += '	profileModel.creditholdoverride (undefined)\n';
				content += '	profileModel.lastname (String)\n';
				content += '	profileModel.internalid (String)\n';
				content += '	profileModel.addressbook (undefined)\n';
				content += '	profileModel.campaignsubscriptions (Array)\n';
				content += '	profileModel.isperson (undefined)\n';
				content += '	profileModel.balance (undefined)\n';
				content += '	profileModel.companyname (undefined)\n';
				content += '	profileModel.name (undefined)\n';
				content += '	profileModel.emailsubscribe (String)\n';
				content += '	profileModel.creditlimit (undefined)\n';
				content += '	profileModel.email (String)\n';
				content += '	profileModel.isLoggedIn (String)\n';
				content += '	profileModel.isRecognized (String)\n';
				content += '	profileModel.isGuest (String)\n';
				content += '	profileModel.priceLevel (String)\n';
				content += '	profileModel.subsidiary (String)\n';
				content += '	profileModel.language (String)\n';
				content += '	profileModel.currency (Object)\n';
				content += '	profileModel.currency.internalid (String)\n';
				content += '	profileModel.currency.symbol (String)\n';
				content += '	profileModel.currency.currencyname (String)\n';
				content += '	profileModel.currency.code (String)\n';
				content += '	profileModel.currency.precision (Number)\n';
				content += '	showLanguages (Boolean)\n';
				content += '	showCurrencies (Boolean)\n';
				content += '	showLanguagesOrCurrencies (Boolean)\n';
				content += '	showLanguagesAndCurrencies (Boolean)\n';
				content += '	isHomeTouchpoint (Boolean)\n';
				content += '	cartTouchPoint (String)\n';
				content += '----}}';

				return nlapiEncrypt(content, 'base64');
			}
		}

	,	'ExtensionSource/Extension1/suitescript/MyExamplePDPExtension1/Extension1.Model.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/suitescript/MyExamplePDPExtension1/Extension1.Model.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5013';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("Extension1.Model", [\n';
				content += '	"SC.Model"\n';
				content += ',	"SC.Models.Init"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		SCModel\n';
				content += '	,	ModelsInit\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return SCModel.extend({\n';
				content += '		name: "Extension1"\n\n\n';
				content += '	,	test: function (){\n';
				content += '			nlapiLogExecution("DEBUG", "Loading Extension1.Model");\n';
				content += '			return "Test Data";\n\n';
				content += '		}\n';
				content += '	});';
				content += '});';

				return content;
			}
		}

	,	'ExtensionSource/Extension1/suitescript/MyExamplePDPExtension1/Extension1.Other.Model.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/suitescript/MyExamplePDPExtension1/Extension1.Other.Model.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5013';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("Extension1.Other.Model", [\n';
				content += '	"SC.Model"\n';
				content += ',	"SC.Models.Init"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		SCModel\n';
				content += '	,	ModelsInit\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return SCModel.extend({\n';
				content += '		name: "Extension1.Other"\n\n\n';
				content += '	,	test: function (){\n';
				content += '			nlapiLogExecution("DEBUG", "Loading Extension1.Other.Model");\n';
				content += '			return "Test Data OtherModel";\n\n';
				content += '		}\n';
				content += '	});';
				content += '});';

				return content;
			}

		}

	,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Model.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Model.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5014';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("Extension2.Model", [\n';
				content += '	"SC.Model"\n';
				content += ',	"SC.Models.Init"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		SCModel\n';
				content += '	,	ModelsInit\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return SCModel.extend({\n';
				content += '		name: "Extension2"\n\n\n';
				content += '	,	test: function (){\n';
				content += '			nlapiLogExecution("DEBUG", "Loading Extension2.Model");\n';
				content += '			return "Test Data Extension2.Model";\n\n';
				content += '		}\n';
				content += '	});';
				content += '});';

				return content;
			}

		}

	,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js': {
			
			getId: function getId()
			{
				return 'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5014';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'define("Extension2.Other.Model", [\n';
				content += '	"SC.Model"\n';
				content += ',	"SC.Models.Init"\n';
				content += ']\n';
				content += ',	function (\n';
				content += '		SCModel\n';
				content += '	,	ModelsInit\n';
				content += '	)\n';
				content += '{\n\n';
				content += '	return SCModel.extend({\n';
				content += '		name: "Extension2.Other"\n\n\n';
				content += '	,	test: function (){\n';
				content += '			nlapiLogExecution("DEBUG", "Loading Extension2.Other.Model");\n';
				content += '			return "Test Data Extension2.Other Model";\n\n';
				content += '		}\n';
				content += '	});';
				content += '});';

				return content;
			}

		}

	,	'ExtensionSource/Extension2/SuiteScript/file_absolute_path.js': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension2/SuiteScript/file_absolute_path.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5014';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'nlapiLogExecution("DEBUG", "logging something");';

				return content;
			}
		}

	,	'Folder1/Folder2/file_without_manifest_path.js': {

			getId: function getId()
			{
				return 'Folder1/Folder2/file_without_manifest_path.js';
			}

		,	getType: function getType()
			{
				return 'JavaScript File';
			}

		,	getFolder: function getFolder()
			{
				return '5015';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += 'nlapiLogExecution("DEBUG", "logging something");';

				return content;
			}
		}

	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5333';
			}
		,	getValue: function getValue()
			{
				return nlapiEncrypt('@import "my-extension-1-error";\n' + '@import "my-extension-1-product-price";', 'base64');
			}
		}

	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-error.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-error.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5333';
			}
		,	getValue: function getValue()
			{
				var content = '';

				content += '$font-stack:    Helvetica, sans-serif;\n';
				content += '$primary-color: #F00;\n';
				content += '.my-extension-1-error-content {\n';
				content += '	font: 100% $font-stack;\n';
  				content += '	color: $primary-color;\n';
  				content += '}';

				return nlapiEncrypt(content, 'base64');
			}

		}

	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5333';
			}
		,	getValue: function getValue()
			{
				var content = '';

				content += '@import "my-extension-1-error";\n';
				content += 'body {\n';
				content += '	nav {\n';
				content += '		ul {\n';
				content += '			margin: 0;\n';
				content += '			padding: 0;\n';
				content += '			list-style: none;\n';
				content += '			color: $primary-color;\n';
				content += '		}\n\n';
				content += '		li { display: inline-block; }\n\n';
				content += '		a {\n';
				content += '			display: block;\n';
				content += '			padding: 6px 12px;\n';
				content += '			text-decoration: none;\n';
				content += '		}\n';
				content += '	}\n';
				content += '}\n';

				return nlapiEncrypt(content, 'base64');
			}
		}

	,	'ExtensionSource/Extension3/sass/SassFiles/shopping_extension3.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension3/sass/SassFiles/shopping_extension3.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5454';
			}
		,	getValue: function getValue()
			{
				var content = '';

				content += '@import "file_1";\n';
				content += '@import "file_2";\n';

				return nlapiEncrypt(content, 'base64');
			}
		}

	,	'ExtensionSource/Extension3/sass/SassFiles/file_1.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension3/sass/SassFiles/file_1.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5454';
			}
		,	getValue: function getValue()
			{
				var content = '';
				content += '$primaryColor: #eeccff;\n';
				content += 'body {\n';
				content += '	$primaryColor: #ccc;\n';
				content += '	background: $primaryColor;\n';
				content += '}\n\n';
				content += 'p {\n';
				content += '	color: $primaryColor;\n';
				content += '}\n';

				return nlapiEncrypt(content, 'base64');
			}
		}
		
	,	'ExtensionSource/Extension3/sass/SassFiles/file_2.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension3/sass/SassFiles/file_2.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '5454';
			}
		,	getValue: function getValue()
			{
				var content = '';

				content += '$container-width: 100%;\n';
				content += '.container {;\n';
				content += '	width: $container-width;\n';
				content += '}\n';
				content += '.col-4 {;\n';
				content += '	width: $container-width / 4;\n';
				content += '}\n';

				return nlapiEncrypt(content, 'base64');
			}
		}

	,	'ExtensionSource/Theme1/sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss': {

			getId: function getId()
			{
				return 'ExtensionSource/Theme1/sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '3331';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += '@import "my-extension-1-error";\n';
				content += 'body {\n';
				content += '	nav {\n';
				content += '		ul {\n';
				content += '			margin: 0;\n';
				content += '			padding: 0;\n';
				content += '			list-style: none;\n';
				content += '			color: green;\n';
				content += '		}\n\n';
				content += '		li { display: inline-block; }\n\n';
				content += '		a {\n';
				content += '			display: block;\n';
				content += '			padding: 6px 12px;\n';
				content += '			text-decoration: none;\n';
				content += '		}\n';
				content += '	}\n';
				content += '}\n';

				return nlapiEncrypt(content, 'base64');


			}
		}

	,	'ExtensionSource/Theme1/templates/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl': {

			getId: function getId()
			{
				return 'ExtensionSource/Theme1/templates/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl';
			}

		,	getType: function getType()
			{
				return 'Other Binary File';
			}

		,	getFolder: function getFolder()
			{
				return '3331';
			}

		,	getValue: function getValue()
			{
				var content = '';
				content += '<div>{{price}} IS LESS THAN $0</div>\n';
				content += '{{!----\n';
				content += 'The context variables for this template are not currently documented. ';
				content += 'Use the {{log this}} helper to view the context variables in the Console of your browser\'s developer tools.\n';
				content += '----}}';

				return nlapiEncrypt(content, 'base64');
			}
		}

	,	'ExtensionSource/Extension3/configuration/Extension3.json': {

			getId: function getId()
			{
				return 'ExtensionSource/Extension3/configuration/Extension3.json';
			}

		,	getType: function getType()
			{
				return 'JSON File';
			}

		,	getFolder: function getFolder()
			{
				return '5437';
			}

		,	getValue: function getValue()
			{
				var content = '';

				content += '{\n';
				content += '	"type": "object",\n';
				content += '	"subtab": {\n';
				content += '		"id": "extension3",\n';
				content += '		"group": "extensions",\n';
				content += '		"title": "Extension 3 Options",\n';
				content += '		"description": "General configuration for Extension 3",\n';
				content += '		"docRef": ""\n';
				content += '	},\n';
				content += '	"properties": {\n';
				content += '		"extension3.string": {\n';
				content += '			"group": "extensions",\n';
				content += '			"subtab": "extension3",\n';
				content += '			"type": "string",\n';
				content += '			"title": "Check the String",\n';
				content += '			"description": "Check the String for Extension 1",\n';
				content += '			"default": "Yep"\n';
				content += '		}\n';
				content += '	}\n';
				content += '}\n';

				return content;
			}
		}

		,	'ExtensionSource/Extension1/configuration/Extension1.json': {

				getId: function getId()
				{
					return 'ExtensionSource/Extension1/configuration/Extension1.json';
				}

			,	getType: function getType()
				{
					return 'JSON File';
				}

			,	getFolder: function getFolder()
				{
					return '5436';
				}

			,	getValue: function getValue()
				{
					var content = '';

					content += '{\n';
					content += '	"type": "object",\n';
					content += '	"subtab": {\n';
					content += '		"id": "extension1",\n';
					content += '		"group": "extensions",\n';
					content += '		"title": "Extension 1 Options",\n';
					content += '		"description": "General configuration for Extension 1",\n';
					content += '		"docRef": ""\n';
					content += '	},\n';
					content += '	"properties": {\n';
					content += '		"extension1.checkbox": {\n';
					content += '			"group": "extensions",\n';
					content += '			"subtab": "extension1",\n';
					content += '			"type": "boolean",\n';
					content += '			"title": "Check the Checkbox",\n';
					content += '			"description": "Check the Checkbox for Extension 1",\n';
					content += '			"default": true\n';
					content += '		},\n';
					content += '		"extension1.list": {\n';
					content += '			"group": "extensions",\n';
					content += '			"subtab": "extension1",\n';
					content += '			"type": "array",\n';
					content += '			"title": "Check lists",\n';
					content += '			"description": "Check the List for Extension 1",\n';
					content += '			"items": {\n';
					content += '				"type": "object",\n';
					content += '				"properties": {\n';
					content += '					"string": {\n';
					content += '						"type": "string",\n';
					content += '						"title": "String",\n';
					content += '						"description": "",\n';
					content += '						"mandatory": true\n';
					content += '					},\n';
					content += '					"checkbox": {\n';
					content += '						"type": "boolean",\n';
					content += '						"title": "Boolean",\n';
					content += '						"description": ""\n';
					content += '					},\n';
					content += '					"integer": {\n';
					content += '						"type": "integer",\n';
					content += '						"title": "Integer",\n';
					content += '						"description": ""\n';
					content += '					}\n';
					content += '				}\n';
					content += '			},\n';
					content += '			"default": [\n';
					content += '				{\n';
					content += '					"string": "String 01",\n';
					content += '					"checkbox": true,\n';
					content += '					"integer": 12\n';
					content += '				},\n';
					content += '				{\n';
					content += '					"string": "String 03",\n';
					content += '					"checkbox": false,\n';
					content += '					"integer": 10\n';
					content += '				},\n';
					content += '				{\n';
					content += '					"string": "String 06",\n';
					content += '					"checkbox": true,\n';
					content += '					"integer": 25\n';
					content += '				}\n';
					content += '			]\n';
					content += '		}\n';
					content += '	}\n';
					content += '}\n';

					return content;
				}
			}

		,	'ExtensionSource/Extension1/configuration/Extension1-extra.json': {

				getId: function getId()
				{
					return 'ExtensionSource/Extension1/configuration/Extension1-extra.json';
				}

			,	getType: function getType()
				{
					return 'JSON File';
				}

			,	getFolder: function getFolder()
				{
					return '5436';
				}

			,	getValue: function getValue()
				{
					var content = '';

					content += '{\n';
					content += '	"type": "object",\n';
					content += '	"modifications": [\n';
					content += '		{\n';
					content += '			"target": "$.properties[home.carouselImages].default",\n';
					content += '			"action": "add",\n';
					content += '			"value": "img/extension-1-home-4.jpg"\n';
					content += '		},\n';
					content += '		{\n';
					content += '			"target": "$.properties[home.carouselImages].default[0]",\n';
					content += '			"action": "replace",\n';
					content += '			"value": "img/extension-1-home-1.jpg"\n';
					content += '		},\n';
					content += '		{\n';
					content += '			"target": "$.properties[home.carouselImages].default[1]",\n';
					content += '			"action": "remove"\n';
					content += '		}\n';
					content += '	]\n';
					content += '}\n';

					return content;
				}
			}

		,	'MySSPApplication/MountainX/configurationManifest.json': {

				getId: function getId()
				{
					return 'MySSPApplication/MountainX/configurationManifest.json';
				}

			,	getType: function getType()
				{
					return 'JSON File';
				}

			,	getFolder: function getFolder()
				{
					return '5455';
				}

			,	getValue: function getValue()
				{
					var content = '';

					content += '[\n';
					content += '	{\n';
					content += '        "type": "object",\n';
					content += '        "subtab": {\n';
					content += '            "id": "home",\n';
					content += '            "title": "Home",\n';
					content += '            "description": "Home",\n';
					content += '            "group": "layout"\n';
					content += '        },\n';
					content += '        "properties": {\n';
					content += '            "home.carouselImages": {\n';
					content += '                "group": "layout",\n';
					content += '                "type": "array",\n';
					content += '                "title": "Carousel images",\n';
					content += '                "docRef": "bridgehead_4666978268",\n';
					content += '                "description": "Carousel images Urls",\n';
					content += '                "items": {\n';
					content += '                    "type": "string",\n';
					content += '                    "title": "Url"\n';
					content += '                },\n';
					content += '                "default": [\n';
					content += '                    "img/carousel-home-1.jpg",\n';
					content += '                    "img/carousel-home-2.jpg",\n';
					content += '                    "img/carousel-home-3.jpg"\n';
					content += '                ],\n';
					content += '                "id": "home.carouselImages"\n';
					content += '            },\n';
					content += '            "home.bottomBannerImages": {\n';
					content += '                "group": "layout",\n';
					content += '                "type": "array",\n';
					content += '                "title": "Bottom banners images",\n';
					content += '                "docRef": "bridgehead_4393296407",\n';
					content += '                "description": "Bottom banners images Urls",\n';
					content += '                "items": {\n';
					content += '                    "type": "string",\n';
					content += '                    "title": "Url"\n';
					content += '                },\n';
					content += '                "default": [\n';
					content += '                    "img/banner-bottom-home-1.jpg",\n';
					content += '                    "img/banner-bottom-home-2.jpg",\n';
					content += '                    "img/banner-bottom-home-3.jpg"\n';
					content += '                ],\n';
					content += '                "id": "home.bottomBannerImages"\n';
					content += '            }\n';
					content += '        }\n';
					content += '    }\n';
					content += ']\n';

					return content;
				}
			}

		,	'MySSPApplication/KilimanjaroTest/javascript-libs.js': {

				getId: function getId()
				{
					return 'MySSPApplication/KilimanjaroTest/javascript-libs.js';
				}

			,	getType: function getType()
				{
					return 'JSON File';
				}

			,	getFolder: function getFolder()
				{
					return '5455';
				}

			,	getValue: function getValue()
				{
					var content = '';

					content += 'console.log("Here should be almond source code");\n';
					content += 'console.log("Here should be handlebar source code");';

					return content;
				}
			}
		};

	return {
		mock_files: mock_files
	};
});
