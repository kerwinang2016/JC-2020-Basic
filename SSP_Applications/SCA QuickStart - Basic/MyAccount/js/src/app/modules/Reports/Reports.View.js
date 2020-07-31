// Reports.View.js
// -----------------------

define('Reports.View', function ()
{
	'use strict';
	var Views = {}
	Views.OrderType = Backbone.View.extend({

		template: 'reports_ordertype_view'

	,	title: _('Sale Type Dashboard').translate()

	,	page_header: _('Sale Type Dashboard').translate()

	,	attributes: {
			'class': 'reports_ordertype_view'
		}
	, events: {
		'change #saletype': 'updateSaleType'
	}
	,	initialize: function (options)
		{
			var self = this;
			this.options = options;
			this.application = options.application;
			var tailor = SC.Application('MyAccount').user_instance.get('parent');
			jQuery.ajax({
				url:_.getAbsoluteUrl('services/reports.ss')+"?action=lineordertypereport&tailor="+tailor,
				async:false,
				success: function (result) {
							self.data = JSON.parse(result);
				}
			});
		}
	, updateSaleType: function(e){
		e.preventDefault();
		var tailor = SC.Application('MyAccount').user_instance.get('parent');
		var data = {
			internalid:	jQuery(e.target).data('internalid')
			, ordertypeid: e.target.value
			, soid: jQuery(e.target).data('soid')
		}
		//console.log(e);
		jQuery.ajax({
		    url: _.getAbsoluteUrl('services/reports.ss')+"?action=updatelineordertype&tailor="+tailor,
		    type: 'PUT',
				data: data,
		    success: function(result) {
		        // Do something with the result
		    }
		});
	}
	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'reports_ordertype_view', [{
				text: this.title
			,	href: '/ordertypereport'
			}]);
		}

	});
	Views.Margin = Backbone.View.extend({

		template: 'reports_detailed_view'

	,	title: _('Margin Dashboard').translate()

	,	page_header: _('Margin Dashboard').translate()

	,	attributes: {
			'class': 'reports_detailed_view'
		}

	,	initialize: function (options)
		{
			var self = this;
			this.options = options;
			this.application = options.application;
			var tailor = SC.Application('MyAccount').user_instance.get('parent');
			jQuery.ajax({
				url:_.getAbsoluteUrl('services/reports.ss')+"?action=marginreport&tailor="+tailor,
				async:false,
				success: function (result) {
							self.data = JSON.parse(result);
				}
			});
		}
	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'reports_detailed_view', [{
				text: this.title
			,	href: '/marginreport'
			}]);
		}
	});
	return Views;
});
