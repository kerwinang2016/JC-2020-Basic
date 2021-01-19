(function (SC) {

    'use strict';

    // application configuration
    // if needed, the second argument - omitted here - is the application name ('Shopping', 'MyAccount', 'Checkout')
    _.each(SC._applications, function(application) {

        application.on('beforeStartGlobal', function() {

        	var configuration = application.Configuration;
          var count = "";
          var self = this;
          var records = [];
          if(configuration.currentTouchpoint == 'home'){
            jQuery.ajax({
      				url: "/shopflow/services/notices.ss",
      				async: false,
      				success: function(data){
                self.records = data.records;
      				}
      			});
          }else if(configuration.currentTouchpoint == 'customercenter'){
            jQuery.ajax({
      				url: "/myaccount/services/notices.ss",
      				async: false,
      				success: function(data){
                self.records = data.records;
      				}
      			});
          }else{
            jQuery.ajax({
      				url: "/checkout/services/notices.ss",
      				async: false,
      				success: function(data){
                self.records = data.records;
      				}
      			});
          }

          var count = _.filter(this.records,function(o){
            return o.custrecord_nba_noticeboard_custrecord_nba_read_notice == 'F';
          });
        	configuration.navigationTabs = [
	        	{
	        		text: _('Home').translate()
	        	,	href: '/'
	        	,	data: {
	        			touchpoint: 'home'
	        		,	hashtag: '#'
	        		}
	        	}
	        ,	{
	        		text: _('Orders').translate()
	        	,	href: '#'
	        	,	data: {
	        			touchpoint: 'customercenter'
	        		,	hashtag: '#ordershistory'
	        		}
	        	}
	        ,	{
	        		text: _('Clients').translate()
	        	,	href: '#'
	        	,	data: {
	        			touchpoint: 'customercenter'
	        		,	hashtag: '#clientlist'
	        		}
	        	}
	        ,	{
	        		text: _('Notices').translate()
	        	,	href: '#'
	        	,	data: {
	        			touchpoint: 'customercenter'
	        		,	hashtag: '#noticeslist'
            },
            count: count.length
	        	}
	        ,	{
	        		text: _('My Account').translate()
	        	,	href: '#'
	        	,	data: {
	        			touchpoint: 'customercenter'
	        		,	hashtag: '#overview'
	        		}
	        	}
	        ,	{
	        		text: _('Guides').translate()
	        	,	href: '#'
	        	,	data: {
	        			touchpoint: 'customercenter'
	        		,	hashtag: '#trainingguides'
	        		}
	        	}
          ,	{
	        		text: _('Applications').translate()
	        	,	href: '#'
	        	,	data: {
	        			touchpoint: 'home'
	        		,	hashtag: '#applications'
	        		}
	        	}
	        ];

        	configuration.quickLinks = [
                {
            		text: _('New Order').translate()
            	,	href: '/tailorclient'
            	,	data: {
            			touchpoint: 'home'
            		,	hashtag: '#/tailorclient'
            		}
            	,	xPosition: "0px"
            	}
            ,	{
            		text: _('Saved Order').translate()
            	,	href: '#'
            	,	data: {
            			touchpoint: 'home'
            		,	hashtag: '#cart'
            		}
            	,  xPosition: "-90px"
            	}
            ,	{
            		text: _('Order Dashboard').translate()
            	,	href: '#'
            	,	data: { // Test Issue #110 - Order Dashboard link
            			touchpoint: 'customercenter'
                    ,   hashtag: '#ordershistory'
            		}
            	,  xPosition: "-180px"
        		}
            ,	{
            		text: _('My Product Lists').translate()
            	,	href: '#'
            	,	data: {
            			touchpoint: 'customercenter'
            		,	hashtag: '#productlists'
            		}
            	,  xPosition: "-270px"
        		}
            ,	{
            		text: _('Fabrics').translate()
            	,	href: '#'
            	,	data: {
            			touchpoint: 'home'
            		,	hashtag: '#Inventory/Fabrics'
            		}
            	,  xPosition: "-360px"
        		}
            ,	{
            		text: _('Update Measurements').translate()
            	,	href: '#'
            	,	data: {
            			touchpoint: 'customercenter'
            		,	hashtag: '#fitprofile'
            		}
            	,  xPosition: "-450px"
        		}
    		];

        });

    });

}(SC));
