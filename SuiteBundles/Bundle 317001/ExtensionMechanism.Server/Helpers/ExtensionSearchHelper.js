define(
	'ExtensionSearchHelper'
,	[
	]
,	function (
	)
{
	'use strict';

	var extension_search_helper = {

		getTargets: function getTargets()
		{
			var targets_search = nlapiSearchRecord(
				'customlist_ns_sc_extmech_ext_targets'
			,	null
			,	null
			,	[
					new nlobjSearchColumn('internalid')
				,	new nlobjSearchColumn('name')
				]
			);

			var targets_result = [];

			_.each(targets_search || [], function(target) {

				var formatted_target = {
					name: target.getValue('name')
				,	target_id: target.getId()
				};

				targets_result.push(formatted_target);
			});

			return targets_result;
		}

	};

	return extension_search_helper;
});
