define('Compiled.SspLibraries.TestData', [], function(){

var compiled_ssp_libraries = 'require(\'SCA\');\n' +
'\n' +
'var extensions = {};\n' +
'\n' +
'extensions[\'SuiteCommerce.Extension1.1.0.0\'] = function(){\n' +
'\n' +
'define("Extension1.Model", [\n' +
'	"SC.Model"\n' +
',	"SC.Models.Init"\n' +
']\n' +
',	function (\n' +
'		SCModel\n' +
'	,	ModelsInit\n' +
'	)\n' +
'{\n' +
'\n' +
'	return SCModel.extend({\n' +
'		name: "Extension1"\n' +
'\n' +
'\n' +
'	,	test: function (){\n' +
'			nlapiLogExecution("DEBUG", "Loading Extension1.Model");\n' +
'			return "Test Data";\n' +
'\n' +
'		}\n' +
'	});});\n' +
'\n' +
'define("Extension1.Other.Model", [\n' +
'	"SC.Model"\n' +
',	"SC.Models.Init"\n' +
']\n' +
',	function (\n' +
'		SCModel\n' +
'	,	ModelsInit\n' +
'	)\n' +
'{\n' +
'\n' +
'	return SCModel.extend({\n' +
'		name: "Extension1.Other"\n' +
'\n' +
'\n' +
'	,	test: function (){\n' +
'			nlapiLogExecution("DEBUG", "Loading Extension1.Other.Model");\n' +
'			return "Test Data OtherModel";\n' +
'\n' +
'		}\n' +
'	});});\n' +
'\n' +
'\n' +
'};\n' +
'\n' +
'extensions[\'SuiteCommerce.Extension2.1.0.0\'] = function(){\n' +
'\n' +
'define("Extension2.Model", [\n' +
'	"SC.Model"\n' +
',	"SC.Models.Init"\n' +
']\n' +
',	function (\n' +
'		SCModel\n' +
'	,	ModelsInit\n' +
'	)\n' +
'{\n' +
'\n' +
'	return SCModel.extend({\n' +
'		name: "Extension2"\n' +
'\n' +
'\n' +
'	,	test: function (){\n' +
'			nlapiLogExecution("DEBUG", "Loading Extension2.Model");\n' +
'			return "Test Data Extension2.Model";\n' +
'\n' +
'		}\n' +
'	});});\n' +
'\n' +
'define("Extension2.Other.Model", [\n' +
'	"SC.Model"\n' +
',	"SC.Models.Init"\n' +
']\n' +
',	function (\n' +
'		SCModel\n' +
'	,	ModelsInit\n' +
'	)\n' +
'{\n' +
'\n' +
'	return SCModel.extend({\n' +
'		name: "Extension2.Other"\n' +
'\n' +
'\n' +
'	,	test: function (){\n' +
'			nlapiLogExecution("DEBUG", "Loading Extension2.Other.Model");\n' +
'			return "Test Data Extension2.Other Model";\n' +
'\n' +
'		}\n' +
'	});});\n' +
'\n' +
'\n' +
'};\n' +
'\n' +
'var SiteSettings = require(\'SiteSettings.Model\').get();\n' +
'var website_id = SiteSettings.siteid;\n' +
'var key_mapping = {\n' +
'	\'8\': {\n' +
'		\'domain1.com.uy\': \'3\'\n' +
'	}\n' +
'};\n' +
'\n' +
'var key;\n' +
'if(website_id === 8 && key_mapping[website_id]){\n' +
'	var mapping = key_mapping[website_id];\n' +
'	if(mapping[domain]){\n' +
'		key = mapping[domain];\n' +
'	}\n' +
'else if(mapping[\'activation_id\']){\n' +
'	key = mapping[\'activation_id\'];\n' +
'}\n' +
'}\n' +
'\n' +
'if(key === \'3\'){\n' +
'try{\n' +
'	extensions[\'SuiteCommerce.Extension1.1.0.0\']();\n' +
'	require(\'Extension1.Other.Model\');\n' +
'}\n' +
'catch(error){\n' +
'	console.log(error.message)\n' +
'}\n' +
'\n' +
'try{\n' +
'	extensions[\'SuiteCommerce.Extension2.1.0.0\']();\n' +
'	require(\'Extension2.Other.Model\');\n' +
'}\n' +
'catch(error){\n' +
'	console.log(error.message)\n' +
'}\n' +
'\n' +
'}\n' +
'\n' +
'var ie_css_map = undefined;\n' +
'ie_css = _.extend(ie_css_map, ie_css);\n' +
'\n' +
'var include_mapping = {\n' +
'    "8": {\n' +
'        "3": {\n' +
'            "shopping": {\n' +
'                "templates": [\n' +
'                    "extensions/shopping-templates_3.js"\n' +
'                ],\n' +
'                "js": [\n' +
'                    "javascript/shopping.js",\n' +
'                    "extensions/shopping_3.js"\n' +
'                ],\n' +
'                "css": [\n' +
'                    "extensions/shopping_3.css"\n' +
'                ],\n' +
'                "ie": []\n' +
'            },\n' +
'            "checkout": {\n' +
'                "templates": [\n' +
'                    "extensions/checkout-templates_3.js"\n' +
'                ],\n' +
'                "js": [\n' +
'                    "javascript/checkout.js",\n' +
'                    "extensions/checkout_3.js"\n' +
'                ],\n' +
'                "css": [\n' +
'                    "extensions/checkout_3.css"\n' +
'                ],\n' +
'                "ie": []\n' +
'            },\n' +
'            "myaccount": {\n' +
'                "templates": [\n' +
'                    "extensions/myaccount-templates_3.js"\n' +
'                ],\n' +
'                "js": [\n' +
'                    "javascript/myaccount.js",\n' +
'                    "extensions/myaccount_3.js"\n' +
'                ],\n' +
'                "css": [\n' +
'                    "extensions/myaccount_3.css"\n' +
'                ],\n' +
'                "ie": []\n' +
'            }\n' +
'        }\n' +
'    }\n' +
'};\n' +
'var theme_assets_paths = {};\n' +
'var Application = require(\'Application\');\n' +
'\n' +
'var app_includes;\n' +
'\n' +
'var isExtended = false;\n' +
'\n' +
'var themeAssetsPath = \'\';\n' +
'if(include_mapping[website_id] && include_mapping[website_id][key]){\n' +
'	app_includes = include_mapping[website_id][key];\n' +
'	_.each(app_includes, function(app, app_name){\n' +
'		for(var i=0; i < ie_css[key][app_name]; i++){\n' +
'			app.ie.push(\'extensions/ie_\' + app_name + \'_\' + i + \'_\' + key + \'.css\');\n' +
'		}\n' +
'	});\n' +
'\n' +
'	isExtended = true;\n' +
'\n' +
'	themeAssetsPath = theme_assets_paths[key];\n' +
'}\n' +
'else{\n' +
'	app_includes = {\n' +
'    "shopping": {\n' +
'        "templates": [\n' +
'            "shopping-templates.js"\n' +
'        ],\n' +
'        "js": [\n' +
'            "javascript/shopping.js"\n' +
'        ],\n' +
'        "css": [\n' +
'            "css/shopping.css"\n' +
'        ],\n' +
'        "ie": []\n' +
'    },\n' +
'    "checkout": {\n' +
'        "templates": [\n' +
'            "checkout-templates.js"\n' +
'        ],\n' +
'        "js": [\n' +
'            "javascript/checkout.js"\n' +
'        ],\n' +
'        "css": [\n' +
'            "css/checkout.css"\n' +
'        ],\n' +
'        "ie": []\n' +
'    },\n' +
'    "myaccount": {\n' +
'        "templates": [\n' +
'            "myaccount-templates.js"\n' +
'        ],\n' +
'        "js": [\n' +
'            "javascript/myaccount.js"\n' +
'        ],\n' +
'        "css": [\n' +
'            "css/myaccount.css"\n' +
'        ],\n' +
'        "ie": []\n' +
'    }\n' +
'};\n' +
'	_.each(app_includes, function(app){\n' +
'		app.templates = _.map(app.templates, function(file){\n' +
'			return Application.getNonManageResourcesPathPrefix() + file;\n' +
'		});\n' +
'		app.css = _.map(app.css, function(file){\n' +
'			return Application.getNonManageResourcesPathPrefix() + file;\n' +
'		});\n' +
'		if(SC.Configuration.unmanagedResourcesFolderName)\n' +
'		{\n' +
'			app.js.unshift(\'backward-compatibility-amd-unclean.js\');\n' +
'		}\n' +
'	});\n' +
'}\n' +
'_.each(app_includes, function(app, app_name){\n' +
'	app.js = app.templates.concat(app.js);\n' +
'});\n';

	return compiled_ssp_libraries;
});
