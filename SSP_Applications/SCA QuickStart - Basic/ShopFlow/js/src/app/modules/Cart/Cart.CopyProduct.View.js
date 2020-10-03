/*
	© 2019 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Cart
define('Cart.CopyProduct.View'
,	[
		'ItemDetails.Model'
	]
,	function (
		ItemDetailsModel
	)
{
	'use strict';

	return Backbone.View.extend({

		// @property {Function} template
		template: 'cart_copyproduct_modal'

		// @property {String} title
	,	title: 'Copy Item'

	,	modalClass: 'global-views-modal-small'

		// @property {String} page_header
	,	page_header: 'Copy Product'

		// @property {Object} attributes
	,	attributes: {
			'id': 'CartCopyProductView'
		,	'class': 'copy-product-modal shopping-cart-modal'
		}

	,	events: {
			'click [data-action="copy-products"]' : 'copyProducts'
		}
		// @method initialize
	,	initialize: function (options){
			var self = this;
			this.productType = options.productType;
			this.selected_options = options.selected_options;
			this.application = options.application;
			this.item = options.item;
			this.model = options.model;
			this.cartview = options.cartview;
			jQuery.get(_.getAbsoluteUrl('js/extraQuantity.json')).done(function (data) {
					self.extraQuantity = data;
			});

			jQuery.get(_.getAbsoluteUrl('services/blockQuantity.ss')).done(function (data) {
				self.blockQuantity = data;
			});
			this.producttypes = [];
			switch(this.productType){
				case '3-Piece-Suit':
					this.producttypes = [{name:'3-Piece-Suit'},{name:'Jacket'},{name:'Trouser'},{name:'Waistcoat'}]; break;
				case '2-Piece-Suit':
					this.producttypes = [{name:'2-Piece-Suit'},{name:'Jacket'},{name:'Trouser'}]; break;
				case 'L-2PC-Skirt':
					this.producttypes = [{name:'L-2PC-Skirt'},{name:'Ladies-Jacket'},{name:'Ladies-Skirt'}]; break;
				case 'L-2PC-Pants':
					this.producttypes = [{name:'L-2PC-Pants'},{name:'Ladies-Jacket'},{name:'Ladies-Pants'}]; break;
				case 'L-3PC-Suit':
					this.producttypes = [{name:'L-3PC-Suit'},{name:'Ladies-Jacket'},{name:'Ladies-Pants'},{name:'Ladies-Skirt'}]; break;
			}
		}
	,	destroy: function destroy (){
			this._destroy();
		}
	, copyProducts: function (e){
			e.preventDefault();

			var self = this;
			jQuery(".cart-copyproduct-modal-details input[type=checkbox]:checked").each(function(x,y){

				var pt = y.name;
				var option_values = []
				var selected_options = JSON.parse(JSON.stringify(self.selected_options));
				var selected_item = self.item.get('item');
				var selected_item_internalid = selected_item.get('internalid');
				var item_detail = self.getItemForCart(selected_item_internalid, self.item.get('quantity'));

				var d = _.find(selected_options,function(data){
					return (data.id).toLowerCase() == "custcol_producttype";
				});
				d.value = pt;
				var fpsummary = _.find(selected_options,function(data){
					return (data.id).toLowerCase() == "custcol_fitprofile_summary";
				});

				var fpsummaryval = JSON.parse(fpsummary.value);

				var fitprofile = _.filter(fpsummaryval,function(v){return v.name == pt;});

				if(fitprofile && fitprofile.length>0)
				fpsummary.value = JSON.stringify(fitprofile);

				var fabricExtra = _.find(selected_options,function(data){
					return (data.id).toLowerCase() == "custcol_fabric_extra";
				});
				var fabricQuantity = _.find(selected_options,function(data){
					return (data.id).toLowerCase() == "custcol_fabric_quantity";
				});
				switch(self.productType){
					case '3-Piece-Suit':
							if(pt == 'Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_waistcoat" ||
											(selected_options[i].id).toLowerCase() == "custcol_designoptions_trouser" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_trouser" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_waistcoat" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_trouser_in" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_waistcoat_in" ) {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_jacket";
								});

								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Trouser'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_waistcoat" ||
											(selected_options[i].id).toLowerCase() == "custcol_designoptions_jacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_jacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_waistcoat" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_jacket_in" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_waistcoat_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_trouser";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Waistcoat'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_trouser" ||
											(selected_options[i].id).toLowerCase() == "custcol_designoptions_jacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_jacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_trouser" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_jacket_in" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_trouser_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_waistcoat";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
						break;
					case '2-Piece-Suit':
							if(pt == 'Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_trouser" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_trouser" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_trouser_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_jacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Trouser'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_jacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_jacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_jacket_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_trouser";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
						break;
					case 'L-2PC-Skirt':
							if(pt == 'Ladies-Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesskirt" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesskirt" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesskirt_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiesjacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Ladies-Skirt'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiesskirt";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
						break;
					case 'L-2PC-Pants':
							if(pt == 'Ladies-Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiespants" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiespants" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiespants_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiesjacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Ladies-Pants'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiespants";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
						break;
					case 'L-3PC-Suit':
							if(pt == 'Ladies-Jacket'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesskirt" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesskirt" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesskirt_in" ||
											(selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiespants" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiespants" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiespants_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiesjacket";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Ladies-Skirt'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket_in" ||
											(selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiespants" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiespants" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiespants_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiesskirt";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
							else if(pt=='Ladies-Pants'){
								for(var i = 0; i < selected_options.length; i++){
									if ((selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesjacket_in" ||
											(selected_options[i].id).toLowerCase() == "custcol_designoptions_ladiesskirt" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesskirt" ||
											(selected_options[i].id).toLowerCase() == "custcol_fitprofile_ladiesskirt_in") {
											selected_options[i].value = "";
									}
								}
								var dop = _.find(selected_options,function(data){
									return (data.id).toLowerCase() == "custcol_designoptions_ladiespants";
								});
								var correctQuantity = self.getUpdatedQuantity(pt, fitprofile,fabricExtra.value, dop.value);
								fabricQuantity.value = correctQuantity;
							}
						break;
				}
				item_detail.set('_optionsDetails', selected_item.get('itemoptions_detail'));
				item_detail.setOptionsArray(selected_options, true);
				item_detail.setOption('custcol_avt_wbs_copy_key', selected_item_internalid.toString() + '_' + new Date().getTime());

				var add_to_cart_promise = self.copyItemToCart(item_detail),
					whole_promise = null;
				whole_promise = jQuery.when(add_to_cart_promise).then(jQuery.proxy(this, 'executeAddToCartCallback'));

				add_to_cart_promise.success(function ()
				{
					self.cartview.showContent();
				});
			});
			jQuery(".modal.in").modal("hide");

		}
		,	executeAddToCartCallback: function()
			{
				if (!this.addToCartCallback)
				{
					return;
				}

				this.addToCartCallback();
			}

		, getUpdatedQuantity: function(productType, fitProfileSummary, fabricextra,dop){
			// 1. product type block size
			// 2. extra quantity
			// 3. design options
				var item = productType, self = this;
				var qty = 0;
				for (var i = 0; i < fitProfileSummary.length; i++) {
						if (fitProfileSummary[i].value){
								if(fitProfileSummary[i].blockvalue){
										var bq = _.find(this.blockQuantity,function(q){
											return q.custrecord_bqm_producttext == fitProfileSummary[i].name && q.custrecord_bqm_block == fitProfileSummary[i].blockvalue;
										})
										if(bq){
											if(qty < parseFloat(bq.custrecord_bqm_quantity))
												qty = parseFloat(bq.custrecord_bqm_quantity);
										}
								}
						}
				}
				var extra = 0;
				var extraQuantityCodes = _.find(self.extraQuantity[1].values,function(temp){
					return temp.code == productType;
				});

				if(extraQuantityCodes){
						var val = _.find(extraQuantityCodes.design,function(temp2){
							return temp2.code == fabricextra
						});
						if(val && val.value != "")
							extra = parseFloat(val.value);
				}
				for (var i = 0; i < fitProfileSummary.length; i++) {
					var ptype = fitProfileSummary[i].name;
					var designQuantityCodes = _.find(self.extraQuantity[0].values,function(temp){
						return temp.code == productType;
					});
					if(designQuantityCodes){
					_.each(JSON.parse(dop),function(temp){
						var val = _.find(designQuantityCodes.design,function(temp2){
							return temp2.code == temp.value
						});
						if(val && val.value != "")
							extra+= parseFloat(val.value);
						});
					}
				}
				return (qty + extra).toFixed(2);
		}
	,	copyItemToCart: function (item)
		{
			//return this.cart.addItem(item);
			return this.model.addItem(item);
		}
	,	getItemForCart: function (id, qty, opts)
		{
			return new ItemDetailsModel({
				internalid: id
			,	quantity: qty
			,	options: opts
			});
		}

		//
	});

});
