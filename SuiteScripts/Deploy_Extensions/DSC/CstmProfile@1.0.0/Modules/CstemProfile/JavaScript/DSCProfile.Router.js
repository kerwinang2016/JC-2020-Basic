define('DSCProfile.Router', [
    'Backbone','DSCStockList.View'
  ], function (Backbone,StockListView) {
    return Backbone.Router.extend({
  
      initialize: function (application) {
          this.application = application;
        }
  
        ,
      routes: {
        'stocklistext': 'stockList'
      }
      ,	initialize: function (application)
		{
      this.application = application;
        console.log('test');
        }
        
    , 	stockList: function(){ 

			var view = new StockListView({
					application:this.application
				//, model: this.application.getUser()
			});
			console.log('view',view);
			view.showContent();

	}	
      
    });
  });