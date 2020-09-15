
define(
	'DSC.CstmProfile.CstemProfile.ServiceController'
,	[
		'ServiceController'
		,'DSCProfile.Model'
	]
,	function(
		ServiceController
		,DSCProfileModel
	)
	{
		'use strict';

		return ServiceController.extend({

			name: 'DSC.CstmProfile.CstemProfile.ServiceController'

			// The values in this object are the validation needed for the current service.
		,	options: {
				common: {
				}
			}

		,	get: function get()
			{
				return DSCProfileModel.get();
			}

		,	post: function post()
			{
				// not implemented
			}

		,	put: function put()
			{
				// not implemented
			}
			
		,	delete: function()
			{
				// not implemented
			}
		});
	}
);