// FormRenderer.Views.js
// -----------------------
// Views for profile's operations
define('AlterationForm.View',  ['Alterations.Collection'], function (AlterationsCollection)
{
	'use strict';

	return  Backbone.View.extend({
		template: 'clientalterations_form'
		,	attributes: {
				'id': 'alterationformview'
			,	'class': 'alterationformview'
			}
		, title: _('Alteration Form').translate()

		, events: {
			 'change [data-field="alteration-fields"]' : 'updateFields'
			,'click #in-modal-alteration-modal-close': 'closeAlteration'
			,'click #in-modal-alteration-modal-submit': 'updateAlteration'
			,'click #in-modal-alteration-modal-remove': 'removeAlteration'
			,'click #in-modal-alteration-modal-print': 'printAlteration'
			,'click #in-modal-alteration-modal-download': 'downloadAlteration'
			,'click #alteration-modal-submit-with-pdf': 'submitWithPDF'
		}
		, initialize: function (options) {
			this.model = options.model;
			this.application = options.application;
			this.client = options.client;
			this.parentView = options.parentView;
			// this.model.on('sync', this.updateAlterationFields());
		}
		, updateAlterationFields: function(){

			this.alterationData = this.model.get('custrecord_alterations_measure_values');
			var alterationArr = [], alterationJSON = {};
			if(this.alterationData){
				alterationArr = JSON.parse(this.alterationData);
			}
			for(var i=0; i<alterationArr.length;i++){
			  alterationJSON[alterationArr[i].name] = alterationArr[i].value;
			}
			this.jacketQuantity = alterationJSON["alteration_jkt"]?parseFloat(alterationJSON["alteration_jkt"]):0;
			this.waistcoatQuantity = alterationJSON["alteration_wst"]?parseFloat(alterationJSON["alteration_wst"]):0;
			this.trouserQuantity = alterationJSON["alteration_trs"]?parseFloat(alterationJSON["alteration_trs"]):0;
			this.shirtQuantity = alterationJSON["alteration_sht"]?parseFloat(alterationJSON["alteration_sht"]):0;
			this.overcoatQuantity = alterationJSON["alteration_ovc"]?parseFloat(alterationJSON["alteration_ovc"]):0;
			this.jacketOvercoatQuantity = this.jacketQuantity + this.overcoatQuantity;
			this.ordernumber = alterationJSON["alteration_order_no"]?alterationJSON["alteration_order_no"]:"";
			this.clientname = alterationJSON["alteration_client_name"]?alterationJSON["alteration_client_name"]:this.client.get('custrecord_tc_first_name') + " " + this.client.get('custrecord_tc_last_name');
			this.alterationdate = alterationJSON["alteration_date"]?alterationJSON["alteration_date"]:"";
		}
		, submitWithPDF: function(e){
			e.preventDefault();
		}
		, closeAlteration: function (e){
				e.preventDefault();
				jQuery(".modal.in").modal("hide");
		}
		, updateAlteration: function (e){
				e.preventDefault();
				var self = this;
				var alterationInternalId;
				jQuery('input:disabled').removeAttr('disabled');
				jQuery('select:disabled').removeAttr('disabled');
				var formValues = jQuery('[id*="alteration-form"]').serialize().split("&");
				var clientId = this.client.get('id');
				var dataToSend = new Array();
				for(var i =0; i< formValues.length; i++){
					var obj = {};
					var formValue = formValues[i];
					var field = formValue.split("=")[0]
						, value = jQuery('[id*="' + formValue.split("=")[0]+'"]').val().replace(/\%0D%0A/g, ' ').replace(/\s+/g, ' ').trim();

						if(field == "alteration_rec_id" && self.model.get('internalid')){
							alterationInternalId = self.model.get('internalid');
						} else {
							obj.name = field;
							obj.value = decodeURIComponent(value);
							//obj.value = value;
							dataToSend.push(obj);
						}
				};
				this.model.set("custrecord_alterations_client" , clientId );
				this.model.set("custrecord_alterations_measure_values", JSON.stringify(dataToSend));
				this.model.set("name", "Alterations Form");
				var id = this.model.save().done(function(){
					self.options.parentView.alterations.reset();
					var alterations = new AlterationsCollection();
					alterations.fetch({data:{
						clientid: self.client.get('id')
					}}).done(function(data){
						self.parentView.alterations = alterations;
						jQuery("#alterations").html(SC.macros.alterationsMacro(self.parentView,self.parentView.alterations));
					});

				});
				jQuery(".modal.in").modal("hide");
				self.parentView.showConfirmationMessage(_('The alteration was added to your alteration list').translate());
				// if(alterationInternalId){
				// 	param.type = "update_alteration";
				// 	param.id = alterationInternalId;
				//
				// } else {
				// 	param.type = "create_alteration_form";
				// 	param.id = clientId;
				// }
		}
		, removeAlteration: function (e){
				e.preventDefault();

				var self = this;
				var alterationitem = _.find(self.parentView.alterations.models,function(o){
			 		return o.get('internalid') == self.model.get('internalid');
			 	});
				self.parentView.alterations.remove(alterationitem);
				jQuery("#alterations").html(SC.macros.alterationsMacro(self.parentView,self.parentView.alterations));
				self.parentView.showConfirmationMessage(_('The alteration was removed from your alteration list').translate());

				this.model.destroy();

				jQuery(".modal.in").modal("hide");
		}
		, printAlteration: function (e){
				e.preventDefault();
				var alterationRecId = jQuery( "[name='alteration_rec_id']" ).val();
				if (alterationRecId) {
					var scriptLink = '/app/site/hosting/scriptlet.nl?script=279&deploy=1&compid=3857857&h=7146800f2cdac0a8e1b9';
					var link = scriptLink + '&recid=' + alterationRecId;
					window.open(link);
				}
		}
		, downloadAlteration: function (e){
				e.preventDefault();
				var alterationRecId = jQuery( "[name='alteration_rec_id']" ).val();
				if (alterationRecId) {
					var scriptLink = '/app/site/hosting/scriptlet.nl?script=279&deploy=1&compid=3857857&h=7146800f2cdac0a8e1b9';
					var link = scriptLink + '&recid=' + alterationRecId;
					window.open(link);
				}
		}
		, updateFields: function(e){
			e.preventDefault();
			switch(jQuery(e.target).attr('name')){
				case "alteration_jkt":
				this.jacketQuantity = jQuery(e.target).val()? parseFloat(jQuery(e.target).val()): 0;
				break;
				case "alteration_ovc":
				this.overcoatQuantity = jQuery(e.target).val()? parseFloat(jQuery(e.target).val()): 0;
				break;
				case "alteration_trs":
				this.trouserQuantity = jQuery(e.target).val()? parseFloat(jQuery(e.target).val()): 0;
				break;
				case "alteration_wst":
				this.waistcoatQuantity = jQuery(e.target).val()? parseFloat(jQuery(e.target).val()): 0;
				break;
				case "alteration_sht":
				this.shirtQuantity = jQuery(e.target).val()? parseFloat(jQuery(e.target).val()): 0;
				break;
				case "alteration_date":
				this.alterationdate = jQuery(e.target).val()? jQuery(e.target).val():"";
				break;
				case "alteration_client_name":
				this.clientname = jQuery(e.target).val()? jQuery(e.target).val():"";
				break;
				case "alteration_order_no":
				this.ordernumber = jQuery(e.target).val()? jQuery(e.target).val():"";
				break;
			}
			this.jacketOvercoatQuantity = this.jacketQuantity?parseFloat(this.jacketQuantity):0 + this.overcoatQuantity?parseFloat(this.overcoatQuantity):0;
			this.showInModal();
		}
	});
});
