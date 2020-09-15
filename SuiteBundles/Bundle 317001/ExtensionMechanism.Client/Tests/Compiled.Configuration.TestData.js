define('Compiled.Configuration.TestData'
,	[

	]
,	function(

	)
{

	var compiled_configuration = 'var domain = nlapiGetWebContainer().getShoppingSession().getSiteSettings([\'touchpoints\']).touchpoints.home;\n' +
	'domain = domain.match(/https?:\\/\\/([^#?\\/]+)[#?\\/]?/);\n' +
	'domain = domain[1];\n' +
	'var deepExtend = function deepExtend(target, source)\n' +
	'					{\n' +
	'						if(_.isArray(target) || !_.isObject(target))\n' +
	'						{\n' +
	'							return source;\n' +
	'						}\n' +
	'\n' +
	'						_.each(source, function(value, key)\n' +
	'						{\n' +
	'							if(key in target)\n' +
	'							{\n' +
	'								target[key] = deepExtend(target[key], value);\n' +
	'							}\n' +
	'							else\n' +
	'							{\n' +
	'								target[key] = value;\n' +
	'							}\n' +
	'						});\n' +
	'\n' +
	'						return target;\n' +
	'					};\n' +
	'\n' +
	'// Start domain1.com.uy\n' +
	'if (domain === "domain1.com.uy") {\n' +
	'	deepExtend(ConfigurationManifestDefaults, {"home":{"carouselImages":["img/extension-1-home-1.jpg","img/carousel-home-3.jpg","img/extension-1-home-4.jpg"]},"extension1":{"checkbox":true,"list":[{"string":"String 01","checkbox":true,"integer":12},{"string":"String 03","checkbox":false,"integer":10},{"string":"String 06","checkbox":true,"integer":25}]},"extension3":{"string":"Yep"}});\n' +
	'}\n' +
	'// End domain1.com.uy\n' +
	'\n';

	return compiled_configuration;
});
