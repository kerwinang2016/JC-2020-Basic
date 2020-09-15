define('Compiled.Javascript.TestData', 
	[]
,	function(){
	
	var compiled_javascript_shopping = '' +
		'var extensions = {};\n' +
		'\n' +
		'extensions[\'SuiteCommerce.Extension1.1.0.0\'] = function(){\n' +
		'\n' +
		'function getExtensionAssetsPath(asset){\n' +
		'return \'extensions/SuiteCommerce/Extension1/1.0.0/\' + asset;\n' +
		'};\n' +
		'\n' +
		'define("MyProductPrice.View", [\n' +
		'	"my_extension_1_product_price.tpl"\n' +
		',	"Backbone"\n' +
		']\n' +
		',	function (\n' +
		'		my_extension_1_product_price_tpl\n' +
		'	,	Backbone\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return Backbone.View.extend({\n' +
		'		template: my_extension_1_product_price_tpl\n' +
		'\n' +
		'	,	initialize: function initialize (options){\n' +
		'			this.pdp = options.pdp;\n' +
		'		}\n' +
		'\n' +
		'	,	getContext: function getContext (){\n' +
		'			return {\n' +
		'				price: "5"\n' +
		'			};\n' +
		'		}\n' +
		'\n' +
		'	});});\n' +
		'\n' +
		'define("MyError.View", [\n' +
		'	"my_extension_1_error.tpl"\n' +
		',	"Backbone"\n' +
		']\n' +
		',	function (\n' +
		'		my_extension_1_error_tpl\n' +
		'	,	Backbone\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return Backbone.View.extend({\n' +
		'		isErrorView: true\n' +
		'\n' +
		'	,	template: my_extension_1_error_tpl\n' +
		'\n' +
		'	,	initialize: function initialize (options){\n' +
		'			this.message = options.message;\n' +
		'		}\n' +
		'\n' +
		'	,	getContext: function getContext (){\n' +
		'			return {\n' +
		'				message: this.message			};\n' +
		'		}\n' +
		'\n' +
		'	});});\n' +
		'\n' +
		'define("MyExamplePDPExtension1", [\n' +
		'	"MyProductPrice.View"\n' +
		',	"MyError.View"\n' +
		',	"underscore"\n' +
		']\n' +
		',	function (\n' +
		'		MyProductPriceView\n' +
		'	,	MyErrorView\n' +
		'	,	_\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return {\n' +
		'		mountToApp: function mountToApp (application)\n' +
		'		{\n' +
		'			var pdp = application.getComponent("PDP");\n' +
		'			pdp.setChildViewIndex("ProductDetails.Full.View", "MainActionView", "MainActionView", 30);\n' +
		'			alert("Some other code in the mountoapp");\n' +
		'		}\n' +
		'	};});\n' +
		'\n' +
		'};\n' +
		'\n' +
		'extensions[\'SuiteCommerce.Extension2.1.0.0\'] = function(){\n' +
		'\n' +
		'function getExtensionAssetsPath(asset){\n' +
		'return \'extensions/SuiteCommerce/Extension2/1.0.0/\' + asset;\n' +
		'};\n' +
		'\n' +
		'define("MyExtension2.View", [\n' +
		'	"my_extension_2.tpl"\n' +
		',	"Backbone"\n' +
		']\n' +
		',	function (\n' +
		'		my_extension_2_tpl\n' +
		'	,	Backbone\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return Backbone.View.extend({\n' +
		'		template: my_extension_2_tpl\n' +
		'\n' +
		'	,	events: {\n' +
		'			"click [data-action=\'show-alert\']": "showAlert"\n' +
		'		}\n' +
		'\n' +
		'	,	initialize: function initialize (options){\n' +
		'			this.message = options.message || "Dummy text";\n' +
		'			this.text = options.text || "Alert Action";\n' +
		'		}\n' +
		'\n' +
		'	,	getContext: function getContext (){\n' +
		'			return {\n' +
		'				text: this.text			};\n' +
		'		}\n' +
		'\n' +
		'	});});\n' +
		'\n' +
		'define("MyExamplePDPExtension2", [\n' +
		'	"MyExtension2.View"\n' +
		']\n' +
		',	function (\n' +
		'		MyExtension2View\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return {\n' +
		'		mountToApp: function mountToApp (application)\n' +
		'		{\n' +
		'			var pdp = application.getComponent("PDP");\n' +
		'			pdp.setChildViewIndex("ProductDetails.Full.View", "MainActionView", "MainActionView", 30);\n' +
		'			alert("Some other code in the mountoapp");\n' +
		'		}\n' +
		'	};});\n' +
		'\n' +
		'};\n' +
		'\n' +
		'\n' +
		'try{\n' +
		'	extensions[\'SuiteCommerce.Extension1.1.0.0\']();\n' +
		'	SC.addExtensionModule(\'MyExamplePDPExtension1\');\n' +
		'}\n' +
		'catch(error)\n' +
		'{\n' +
		'	console.error(error)\n' +
		'}\n' +
		'\n' +
		'\n' +
		'try{\n' +
		'	extensions[\'SuiteCommerce.Extension2.1.0.0\']();\n' +
		'	SC.addExtensionModule(\'MyExamplePDPExtension2\');\n' +
		'}\n' +
		'catch(error)\n' +
		'{\n' +
		'	console.error(error)\n' +
		'}\n' +
		'\n';

	var compiled_javascript_myaccount = '' +
		'var extensions = {};\n' +
		'\n' +
		'extensions[\'SuiteCommerce.Extension1.1.0.0\'] = function(){\n' +
		'\n' +
		'function getExtensionAssetsPath(asset){\n' +
		'return \'extensions/SuiteCommerce/Extension1/1.0.0/\' + asset;\n' +
		'};\n' +
		'\n' +
		'define("MyProductPrice.View", [\n' +
		'	"my_extension_1_product_price.tpl"\n' +
		',	"Backbone"\n' +
		']\n' +
		',	function (\n' +
		'		my_extension_1_product_price_tpl\n' +
		'	,	Backbone\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return Backbone.View.extend({\n' +
		'		template: my_extension_1_product_price_tpl\n' +
		'\n' +
		'	,	initialize: function initialize (options){\n' +
		'			this.pdp = options.pdp;\n' +
		'		}\n' +
		'\n' +
		'	,	getContext: function getContext (){\n' +
		'			return {\n' +
		'				price: "5"\n' +
		'			};\n' +
		'		}\n' +
		'\n' +
		'	});});\n' +
		'\n' +
		'define("MyError.View", [\n' +
		'	"my_extension_1_error.tpl"\n' +
		',	"Backbone"\n' +
		']\n' +
		',	function (\n' +
		'		my_extension_1_error_tpl\n' +
		'	,	Backbone\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return Backbone.View.extend({\n' +
		'		isErrorView: true\n' +
		'\n' +
		'	,	template: my_extension_1_error_tpl\n' +
		'\n' +
		'	,	initialize: function initialize (options){\n' +
		'			this.message = options.message;\n' +
		'		}\n' +
		'\n' +
		'	,	getContext: function getContext (){\n' +
		'			return {\n' +
		'				message: this.message			};\n' +
		'		}\n' +
		'\n' +
		'	});});\n' +
		'\n' +
		'define("MyExamplePDPExtension1", [\n' +
		'	"MyProductPrice.View"\n' +
		',	"MyError.View"\n' +
		',	"underscore"\n' +
		']\n' +
		',	function (\n' +
		'		MyProductPriceView\n' +
		'	,	MyErrorView\n' +
		'	,	_\n' +
		'	)\n' +
		'{\n' +
		'\n' +
		'	return {\n' +
		'		mountToApp: function mountToApp (application)\n' +
		'		{\n' +
		'			var pdp = application.getComponent("PDP");\n' +
		'			pdp.setChildViewIndex("ProductDetails.Full.View", "MainActionView", "MainActionView", 30);\n' +
		'			alert("Some other code in the mountoapp");\n' +
		'		}\n' +
		'	};});\n' +
		'\n' +
		'};\n' +
		'\n' +
		'\n' +
		'try{\n' +
		'	extensions[\'SuiteCommerce.Extension1.1.0.0\']();\n' +
		'	SC.addExtensionModule(\'MyExamplePDPExtension1\');\n' +
		'}\n' +
		'catch(error)\n' +
		'{\n' +
		'	console.error(error)\n' +
		'}\n' +
		'\n';

	return {
		compiled_javascript_myaccount: compiled_javascript_myaccount,
		compiled_javascript_shopping: compiled_javascript_shopping
	};

});