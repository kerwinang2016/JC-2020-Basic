define('Compiled.Templates.TestData', [], function(){
	
	var default_tpl = 'console.log("Here should be almond source code");\nconsole.log("Here should be handlebar source code");\n\n';

	var compiled_shopping_tpl = default_tpl +
		'define(\'header.tpl\', [\'Handlebars\',\'Handlebars.CompilerNameLookup\',\'header_sidebar.tpl\',\'header_sidebar.tpl\'], function(Handlebars, compilerNameLookup){ var t = {"1":function(depth0,helpers,partials,data) {\n' +
		'  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = " <li class=\\"header-subheader-settings\\"><a href=\\"#\\" class=\\"header-subheader-settings-link\\" data-toggle=\\"dropdown\\" title=\\""\n' +
		'    + escapeExpression(((compilerNameLookup(helpers,"translate") || (depth0 && compilerNameLookup(depth0,"translate")) || helperMissing).call(depth0, "Settings", {"name":"translate","hash":{},"data":data})))\n' +
		'    + "\\"><i class=\\"header-menu-settings-icon\\"></i><i class=\\"header-menu-settings-carret\\"></i></a><div class=\\"header-menu-settings-dropdown\\"><h5 class=\\"header-menu-settings-dropdown-title\\">"\n' +
		'    + escapeExpression(((compilerNameLookup(helpers,"translate") || (depth0 && compilerNameLookup(depth0,"translate")) || helperMissing).call(depth0, "Site Settings", {"name":"translate","hash":{},"data":data})))\n' +
		'    + "</h5> ";\n' +
		'  stack1 = compilerNameLookup(helpers,"if").call(depth0, (depth0 != null ? compilerNameLookup(depth0,"showLanguages") : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});\n' +
		'  if (stack1 != null) { buffer += stack1; }\n' +
		'  buffer += " ";\n' +
		'  stack1 = compilerNameLookup(helpers,"if").call(depth0, (depth0 != null ? compilerNameLookup(depth0,"showCurrencies") : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});\n' +
		'  if (stack1 != null) { buffer += stack1; }\n' +
		'  return buffer + " </div></li> ";\n' +
		'},"2":function(depth0,helpers,partials,data) {\n' +
		'  return " <div data-view=\\"Global.HostSelector\\"></div> ";\n' +
		'  },"4":function(depth0,helpers,partials,data) {\n' +
		'  return " <div data-view=\\"Global.CurrencySelector\\"></div> ";\n' +
		'  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {\n' +
		'  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\\"header-message\\" data-view=\\"Message.Placeholder\\"></div><div class=\\"header-main-wrapper\\"><div class=\\"header-subheader\\"><div class=\\"header-subheader-container\\"><ul class=\\"header-subheader-options\\"> ";\n' +
		'  stack1 = compilerNameLookup(helpers,"if").call(depth0, (depth0 != null ? compilerNameLookup(depth0,"showLanguagesOrCurrencies") : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});\n' +
		'  if (stack1 != null) { buffer += stack1; }\n' +
		'  return buffer + " <li data-view=\\"StoreLocatorHeaderLink\\"></li><li data-view=\\"RequestQuoteWizardHeaderLink\\"></li><li data-view=\\"QuickOrderHeaderLink\\"></li></ul></div></div><nav class=\\"header-main-nav\\"><div id=\\"banner-header-top\\" class=\\"content-banner banner-header-top\\" data-cms-area=\\"header_banner_top\\" data-cms-area-filters=\\"global\\"></div><div class=\\"header-sidebar-toggle-wrapper\\"><button class=\\"header-sidebar-toggle\\" data-action=\\"header-sidebar-show\\"><i class=\\"header-sidebar-toggle-icon\\"></i></button></div><div class=\\"header-content\\"><div class=\\"header-logo-wrapper\\"><div data-view=\\"Header.Logo\\"></div></div><div class=\\"header-right-menu\\"><div class=\\"header-menu-profile\\" data-view=\\"Header.Profile\\"></div><div class=\\"header-menu-locator-mobile\\" data-view=\\"StoreLocatorHeaderLink\\"></div><div class=\\"header-menu-searchmobile\\"><button class=\\"header-menu-searchmobile-link\\" data-action=\\"show-sitesearch\\" title=\\""\n' +
		'    + escapeExpression(((compilerNameLookup(helpers,"translate") || (depth0 && compilerNameLookup(depth0,"translate")) || helperMissing).call(depth0, "Search", {"name":"translate","hash":{},"data":data})))\n' +
		'    + "\\"><i class=\\"header-menu-searchmobile-icon\\"></i></button></div><div class=\\"header-menu-cart\\"><div class=\\"header-menu-cart-dropdown\\" ><div data-view=\\"Header.MiniCart\\"></div></div></div></div></div><div id=\\"banner-header-bottom\\" class=\\"content-banner banner-header-bottom\\" data-cms-area=\\"header_banner_bottom\\" data-cms-area-filters=\\"global\\"></div></nav></div><div class=\\"header-sidebar-overlay\\" data-action=\\"header-sidebar-hide\\"></div><div class=\\"header-secondary-wrapper\\" data-view=\\"Header.Menu\\" data-phone-template=\\"header_sidebar\\" data-tablet-template=\\"header_sidebar\\"></div><div class=\\"header-site-search\\" data-view=\\"SiteSearch\\" data-type=\\"SiteSearch\\"></div> ";\n' +
		'},"useData":true}; var main = t.main; t.main = function(){\n' +
		'var ctx = arguments[0];\n' +
		'ctx._extension_path = \'extensions/SuiteCommerce/Extension1/1.0.0/\';\n' +
		'ctx._theme_path = \'extensions/SuiteCommerce/Theme1/1.0.0/\';\n' +
		'return main.apply(this, arguments);\n' +
		'};\n' +
		'var template = Handlebars.template(t); template.Name = \'header\'; return template;});\n' +
		'\n' +
		'define(\'my_extension_1_product_price.tpl\', [\'Handlebars\',\'Handlebars.CompilerNameLookup\'], function(Handlebars, compilerNameLookup){ var t = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {\n' +
		'  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;\n' +
		'  return "<div>"\n' +
		'    + escapeExpression(((helper = (helper = compilerNameLookup(helpers,"price") || (depth0 != null ? compilerNameLookup(depth0,"price") : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"price","hash":{},"data":data}) : helper)))\n' +
		'    + " IS LESS THAN $100</div> ";\n' +
		'},"useData":true}; var main = t.main; t.main = function(){\n' +
		'var ctx = arguments[0];\n' +
		'ctx._extension_path = \'extensions/SuiteCommerce/Extension2/1.0.0/\';\n' +
		'ctx._theme_path = \'extensions/SuiteCommerce/Theme1/1.0.0/\';\n' +
		'return main.apply(this, arguments);\n' +
		'};\n' +
		'var template = Handlebars.template(t); template.Name = \'my_extension_1_product_price\'; return template;});';
	
	
	var compiled_templates_override = default_tpl + 
		'define(\'header.tpl\', [\'Handlebars\',\'Handlebars.CompilerNameLookup\',\'header_sidebar.tpl\',\'header_sidebar.tpl\'], function(Handlebars, compilerNameLookup){ var t = {"1":function(depth0,helpers,partials,data) {\n' +
		'  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = " <li class=\\"header-subheader-settings\\"><a href=\\"#\\" class=\\"header-subheader-settings-link\\" data-toggle=\\"dropdown\\" title=\\""\n' +
		'    + escapeExpression(((compilerNameLookup(helpers,"translate") || (depth0 && compilerNameLookup(depth0,"translate")) || helperMissing).call(depth0, "Settings", {"name":"translate","hash":{},"data":data})))\n' +
		'    + "\\"><i class=\\"header-menu-settings-icon\\"></i><i class=\\"header-menu-settings-carret\\"></i></a><div class=\\"header-menu-settings-dropdown\\"><h5 class=\\"header-menu-settings-dropdown-title\\">"\n' +
		'    + escapeExpression(((compilerNameLookup(helpers,"translate") || (depth0 && compilerNameLookup(depth0,"translate")) || helperMissing).call(depth0, "Site Settings", {"name":"translate","hash":{},"data":data})))\n' +
		'    + "</h5> ";\n' +
		'  stack1 = compilerNameLookup(helpers,"if").call(depth0, (depth0 != null ? compilerNameLookup(depth0,"showLanguages") : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});\n' +
		'  if (stack1 != null) { buffer += stack1; }\n' +
		'  buffer += " ";\n' +
		'  stack1 = compilerNameLookup(helpers,"if").call(depth0, (depth0 != null ? compilerNameLookup(depth0,"showCurrencies") : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.noop,"data":data});\n' +
		'  if (stack1 != null) { buffer += stack1; }\n' +
		'  return buffer + " </div></li> ";\n' +
		'},"2":function(depth0,helpers,partials,data) {\n' +
		'  return " <div data-view=\\"Global.HostSelector\\"></div> ";\n' +
		'  },"4":function(depth0,helpers,partials,data) {\n' +
		'  return " <div data-view=\\"Global.CurrencySelector\\"></div> ";\n' +
		'  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {\n' +
		'  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\\"header-message\\" data-view=\\"Message.Placeholder\\"></div><div class=\\"header-main-wrapper\\"><div class=\\"header-subheader\\"><div class=\\"header-subheader-container\\"><ul class=\\"header-subheader-options\\"> ";\n' +
		'  stack1 = compilerNameLookup(helpers,"if").call(depth0, (depth0 != null ? compilerNameLookup(depth0,"showLanguagesOrCurrencies") : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});\n' +
		'  if (stack1 != null) { buffer += stack1; }\n' +
		'  return buffer + " <li data-view=\\"StoreLocatorHeaderLink\\"></li><li data-view=\\"RequestQuoteWizardHeaderLink\\"></li><li data-view=\\"QuickOrderHeaderLink\\"></li></ul></div></div><nav class=\\"header-main-nav\\"><div id=\\"banner-header-top\\" class=\\"content-banner banner-header-top\\" data-cms-area=\\"header_banner_top\\" data-cms-area-filters=\\"global\\"></div><div class=\\"header-sidebar-toggle-wrapper\\"><button class=\\"header-sidebar-toggle\\" data-action=\\"header-sidebar-show\\"><i class=\\"header-sidebar-toggle-icon\\"></i></button></div><div class=\\"header-content\\"><div class=\\"header-logo-wrapper\\"><div data-view=\\"Header.Logo\\"></div></div><div class=\\"header-right-menu\\"><div class=\\"header-menu-profile\\" data-view=\\"Header.Profile\\"></div><div class=\\"header-menu-locator-mobile\\" data-view=\\"StoreLocatorHeaderLink\\"></div><div class=\\"header-menu-searchmobile\\"><button class=\\"header-menu-searchmobile-link\\" data-action=\\"show-sitesearch\\" title=\\""\n' +
		'    + escapeExpression(((compilerNameLookup(helpers,"translate") || (depth0 && compilerNameLookup(depth0,"translate")) || helperMissing).call(depth0, "Search", {"name":"translate","hash":{},"data":data})))\n' +
		'    + "\\"><i class=\\"header-menu-searchmobile-icon\\"></i></button></div><div class=\\"header-menu-cart\\"><div class=\\"header-menu-cart-dropdown\\" ><div data-view=\\"Header.MiniCart\\"></div></div></div></div></div><div id=\\"banner-header-bottom\\" class=\\"content-banner banner-header-bottom\\" data-cms-area=\\"header_banner_bottom\\" data-cms-area-filters=\\"global\\"></div></nav></div><div class=\\"header-sidebar-overlay\\" data-action=\\"header-sidebar-hide\\"></div><div class=\\"header-secondary-wrapper\\" data-view=\\"Header.Menu\\" data-phone-template=\\"header_sidebar\\" data-tablet-template=\\"header_sidebar\\"></div><div class=\\"header-site-search\\" data-view=\\"SiteSearch\\" data-type=\\"SiteSearch\\"></div> ";\n' +
		'},"useData":true}; var main = t.main; t.main = function(){\n' +
		'var ctx = arguments[0];\n' +
		'ctx._extension_path = \'extensions/SuiteCommerce/Extension1/1.0.0/\';\n' +
		'ctx._theme_path = \'extensions/SuiteCommerce/Theme1/1.0.0/\';\n' +
		'return main.apply(this, arguments);\n' +
		'};\n' +
		'var template = Handlebars.template(t); template.Name = \'header\'; return template;});\n' +
		'\n' +
		'define(\'my_extension_1_product_price.tpl\', [\'Handlebars\',\'Handlebars.CompilerNameLookup\'], function(Handlebars, compilerNameLookup){ var t = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {\n' +
		'  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;\n' +
		'  return "<div>"\n' +
		'    + escapeExpression(((helper = (helper = compilerNameLookup(helpers,"price") || (depth0 != null ? compilerNameLookup(depth0,"price") : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"price","hash":{},"data":data}) : helper)))\n' +
		'    + " IS LESS THAN $0</div> ";\n' +
		'},"useData":true}; var main = t.main; t.main = function(){\n' +
		'var ctx = arguments[0];\n' +
		'ctx._extension_path = \'extensions/SuiteCommerce/Extension2/1.0.0/\';\n' +
		'ctx._theme_path = \'extensions/SuiteCommerce/Theme1/1.0.0/\';\n' +
		'return main.apply(this, arguments);\n' +
		'};\n' +
		'var template = Handlebars.template(t); template.Name = \'my_extension_1_product_price\'; return template;});\n' +
		'\n';
	
	var compiled_templates_override_folder_optional = compiled_templates_override;

	return {
		default_tpl: default_tpl
	,	compiled_shopping_tpl: compiled_shopping_tpl
	,	compiled_templates_override: compiled_templates_override
	,	compiled_templates_override_folder_optional: compiled_templates_override_folder_optional
	};
});