/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/
define('OrderHistory.Requests.Views'
,	[
	]
,	function (
	)
{
	'use strict';

	return Backbone.View.extend({

		// @property {Function} template
		template: 'orderhistory_requests'

		// @property {String} title
	,	title: 'Order Request'

	,	modalClass: 'global-views-modal-small'

		// @property {String} page_header
	,	page_header: 'Order Request'

		// @property {Object} attributes
	,	attributes: {
			'id': 'OrderHistoryRequestsView'
		,	'class': 'orderhistory-requests-modal'
		}

	,	events: {
			'click [data-action="submitrequest"]' : 'submitRequest'
		}
		// @method initialize
	,	initialize: function (options){
			var self = this;

			this.application = options.application;
      this.user = options.application.getUser();
      this.fields = options.fields;
			this.model = options.model;
			this.orderHistoryDetailsView = options.orderHistoryDetailsView;
		}
	,	destroy: function destroy (){
			this._destroy();
		}
	, submitRequest: function (e){
			e.preventDefault();
			var self = this;
      if(jQuery('#in-modal-custevent_discount_reasons').length != 0){
				if(!jQuery("#in-modal-custevent_discount_reasons").val()){
					alert('discount reason is required');
          return;
				}
      	this.model.set('custevent_discount_reasons',jQuery('#in-modal-custevent_discount_reasons').val());
			}
      if(jQuery('#in-modal-custevent_discount_requested').length != 0)
      this.model.set('custevent_discount_requested',jQuery('#in-modal-custevent_discount_requested').val());
      this.model.set('message',jQuery('#in-modal-message').val());

      if(jQuery('#in-modal-custevent_replacement_soid').length != 0){
				this.model.set('custevent_replacement_soid',jQuery('#in-modal-custevent_replacement_soid').val());
      }
      if(jQuery('#in-modal-custevent_date_needed').length != 0){
        if(!jQuery("#in-modal-custevent_date_needed").val()){
          alert('rush date needed is required');
          return;
        }
        var d = new Date(jQuery("#in-modal-custevent_date_needed").val());
        var m = parseFloat(d.getMonth())+1;
        this.model.set('custevent_date_needed',d.getDate() + "/" + m +"/"+d.getFullYear());
      }
			this.model.save().success(function (response)
			{
        alert('The Order Request was submitted');

				var optionsData = this.model.get('options');
				optionsData.custbody_support_cases = response.internalid;
				this.model.set("options", optionsData);
				this.model.save();
				self.orderHistoryDetailsView.showContent();
			});
			jQuery(".modal.in").modal("hide");
		}
	});

});
