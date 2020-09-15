
define(
	'DSC.CstmProfile.CstemProfile'
,   [
		'DSC.CstmProfile.CstemProfile.View'
	,	'DSCProfile.Router'	
	]
,   function (
		CstemProfileView,Router
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (container)
		{
			// using the 'Layout' component we add a new child view inside the 'Header' existing view 
			// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
			// more documentation of the Extensibility API in
			// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html
			
			/** @type {LayoutComponent} */
			var layout = container.getComponent('Layout');

			var myAccountMenu = container.getComponent("MyAccountMenu"); 
			var preordersmenugroup = {
				id: 'stocklist'
			,	name: _('Stock List Ext').translate()
			,	url: 'stocklistext'
			,	index: 12
		   }
			
			if(layout)
			{
				layout.addChildView('Header.Logo', function() { 
					return new CstemProfileView({ container: container });
				});
			}

			if(myAccountMenu !== undefined && myAccountMenu !== null){
				myAccountMenu.addGroup(preordersmenugroup);
			}
			return new Router(container);

		}
	};
});
