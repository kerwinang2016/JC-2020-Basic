/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Profile
// This file define the functions to be used on profile service
define(
	'DSCProfile.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'
	,	'Utils'
	]
,	function (
		SCModel
	,	ModelsInit
	,	Utils
	)
{
	'use strict';

	return SCModel.extend({
		name: 'DSCProfile'



	,	get: function ()
		{
			var profile = {};

			//You can get the profile information only if you are logged in.
			if (ModelsInit.session.isLoggedIn2() && this.isSecure)
			{

				//Define the fields to be returned
			    profile.stocklist = this.getStockList();
			// profile.favouriteFitToolData = this.getFitProfileData('get_favourite_fit_tools');
			// profile.designoptionRestrictionData = this.getFitProfileData('get_designoption_restriction');
			// profile.favouriteOptionsData = this.getFitProfileData('get_fav_designoption');
            }
			return profile;
		}
		, getStockList: function(type)
		{
			var myaccountsuiteleturl = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);
			var url = myaccountsuiteleturl;
			var res = nlapiRequestURL(url+"&action=getstocklist");
			var stocklist = JSON.parse(res.getBody());
			return stocklist;

			
		}

	});
});