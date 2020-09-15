define('Compiled.ConfigurationManifest.TestData'
,	[

	]
,	function(

	)
{

	var compiled_configuration_manifest = '';

	compiled_configuration_manifest += '[{"type":"object","group":{"id":"extensions","title":"My Extensions","description":"My Extensions configuration"}},{"type":"object","subtab":{"id":"extension1","group":"extensions","title":"Extension 1 Options","description":"General configuration for Extension 1","docRef":""},"properties":{"extension1.checkbox":{"group":"extensions","subtab":"extension1","type":"boolean","title":"Check the Checkbox","description":"Check the Checkbox for Extension 1","default":true},"extension1.list":{"group":"extensions","subtab":"extension1","type":"array","title":"Check lists","description":"Check the List for Extension 1","items":{"type":"object","properties":{"string":{"type":"string","title":"String","description":"","mandatory":true},"checkbox":{"type":"boolean","title":"Boolean","description":""},"integer":{"type":"integer","title":"Integer","description":""}}},"default":[{"string":"String 01","checkbox":true,"integer":12},{"string":"String 03","checkbox":false,"integer":10},{"string":"String 06","checkbox":true,"integer":25}]}}},{"type":"object","modifications":[{"target":"$.properties[home.carouselImages].default","action":"add","value":"img/extension-1-home-4.jpg"},{"target":"$.properties[home.carouselImages].default[0]","action":"replace","value":"img/extension-1-home-1.jpg"},{"target":"$.properties[home.carouselImages].default[1]","action":"remove"}]},{"type":"object","subtab":{"id":"extension3","group":"extensions","title":"Extension 3 Options","description":"General configuration for Extension 3","docRef":""},"properties":{"extension3.string":{"group":"extensions","subtab":"extension3","type":"string","title":"Check the String","description":"Check the String for Extension 1","default":"Yep"}}}]';

	return compiled_configuration_manifest;
});
