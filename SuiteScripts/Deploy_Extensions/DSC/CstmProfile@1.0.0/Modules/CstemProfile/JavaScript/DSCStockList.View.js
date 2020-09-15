
define('DSCStockList.View',
[
'Backbone'
,'stock_list.tpl'
,'underscore'
,'DSCFitProfile.Model'
],function(Backbone,stock_list_tpl,_,DSCProfileModel){


     return Backbone.View.extend({
        template: stock_list_tpl
    ,	title: _('Stock List Test').translate()
    ,	attributes: {'class': 'StockListView'}
    , events: {

    }
    , initialize: function(options){
        console.log('stock list civewww');
        this.application = options.application;
        // this.profile_model = DSCProfileModel.getInstance(); 
        // console.log('this.profile_model',this.profile_model);
    } 
    ,	getSelectedMenu: function ()   //13/09/2019 saad
		{
			return 'stocklist';
		}
    ,	getBreadcrumbPages: function () //13/09/2019 saad
		{
			return {
				text: this.title
			,	href: '/stocklist'
			};
		}

    	//@method getContext @return {Balance.View.Context}
	,	getContext: function () 
    {
        var stocklist = this.profile_model.get("stocklist");
        console.log('stocklist',stocklist);
        //@class Balance.View.Context
        return {
            //@property {Profile.Model} model
            stocklist: stocklist
        }
    }
});

});