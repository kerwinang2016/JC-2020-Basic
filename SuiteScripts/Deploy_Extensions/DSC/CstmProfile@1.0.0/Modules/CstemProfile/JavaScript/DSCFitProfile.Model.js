define(
	'DSCFitProfile.Model'
,	[
		'Backbone'
	,	'underscore'
	]
,	function (
		Backbone
	,	_
	)
{
	'use strict';
	
    return Backbone.Model.extend(
    {
        urlRoot: _.getAbsoluteUrl('extensions/DSC/CstmProfile/1.0.0/services/CstemProfile.Service.ss')
    });
});