// FormRenderer.Views.js
// -----------------------
// Views for profile's operations
define('NewFitProfileForm.View',  ['NewFitProfile.Collection'], function (FitProfileCollection)
{
	'use strict';

	return  Backbone.View.extend({
		template: 'newfitprofile'
		, events: {
			'click [id="in-modal-butt-submit"]': 'submitFitProfile'
			, 'click [id="in-modal-butt-remove"]': 'removeFitProfile'
			, 'click [id="in-modal-butt-copy"]': 'copyFitProfile'
			, 'change [id*="name"]': 'fitprofileFieldsChanged'
			, 'change [id*="custrecord_fp_product_type"]': 'fitprofileFieldsChanged'
			, 'change [id*="custrecord_fp_measure_type"]': 'fitprofileFieldsChanged'
			, 'change [id*="units"]': 'fitprofileFieldsChanged'
			, 'change [id*="fit"]': 'fitprofileFieldsChanged'
			, 'change [id*="body-block"]': 'fitprofileFieldsChanged'
			, 'change [id*="body-fit"]': 'fitprofileFieldsChanged'
			, 'change .block-measurement-fld': 'fitprofileFieldsChanged'
			, 'change .body-measure-fld': 'fitprofileFieldsChanged'
			, 'change .allowance-fld': 'fitprofileFieldsChanged'
			//The reason why we create multiple events here is because old implementations we dont want to change
		}
		,	attributes: {
				'id': 'fitprofileview'
			,	'class': 'fitprofileview'
			}
		, title: _('Fit Profile').translate()

		, initialize: function (options) {
			this.model = options.model;
			this.application = options.application;
			this.parentView = options.parentView;
			this.model.set('custrecord_fp_client', this.parentView.model.get('id'));
			this.measurement_config = options.measurement_config
			this.defaultfavfittools = options.defaultfavfittools
			this.bodyBlockMeasurements = options.bodyBlockMeasurements
			this.influences = options.influences
			this.measurementdefaults = options.measurementdefaults
			this.inchConfig = options.inchConfig
			this.cmConfig = options.cmConfig
			this.presetsConfig = options.presetsConfig
			this.itemRangeConfig = this.cmConfig;
			this.productTypeIds = {
					"Jacket": "3",
					"Trouser": "4",
					"Waistcoat": "6",
					"Overcoat": "8",
					"Shirt": "7",
					"3-Piece-Suit": "9",
					"2-Piece-Suit": "10",
					"Short-Sleeves-Shirt": "12",
					"Trenchcoat": "13",
					"Ladies-Jacket": "14",
					"Ladies-Pants": "15",
					"Ladies-Skirt": "16",
					"L-2PC-Skirt": "17",
					"L-3PC-Suit": "18",
					"L-2PC-Pants": "19",
					"Morning-Coat": "27",
					"Shorts": "28",
					"Camp-Shirt": "29",
					"Shirt-Jacket": "30",
					"Safari-Jacket": "31"
			};
			this.measurementTypeIds = {
				"Body": "2",
				"Block": "1"
			}
			this.focusElementId = "";
		}
		, fitprofileFieldsChanged: function(e){
			e.preventDefault();
			var self = this;
			switch(jQuery(e.target).attr('name')){
				case "name":
				this.model.set('name',jQuery(e.target).val());
				break;
				case "custrecord_fp_product_type":
					this.model.set('custrecord_fp_product_type_text',jQuery(e.target).val());
					this.model.set('custrecord_fp_measure_value','');
					this.model.set("custrecord_fp_product_type", this.productTypeIds[jQuery(e.target).val()]);
					if(this.model.get('custrecord_fp_product_type_text') && this.model.get('custrecord_fp_measure_type_text') == 'Block' && !this.model.get('internalid')){
						var pData = [];
						if(this.defaultfavfittools.length>0){
							var data= this.defaultfavfittools;
							ptData = _.find(data,function(o){ return o.itemType == self.model.get('custrecord_fp_product_type_text');});
							if(ptData){
								_.each(ptData.measurementValues,function(o){
	                o.name = unescape(o.name);
	              });
								this.model.set('custrecord_fp_measure_value', JSON.stringify(ptData.measurementValues));
							}
						}
					}
				break;
				case "custrecord_fp_measure_type":
					this.model.set('custrecord_fp_measure_type_text',jQuery(e.target).val());
					this.model.set("custrecord_fp_measure_type", this.measurementTypeIds[jQuery(e.target).val()]);
					this.model.set('custrecord_fp_measure_value','');
					if(this.model.get('custrecord_fp_product_type_text') && this.model.get('custrecord_fp_measure_type_text') == 'Block' && !this.model.get('internalid')){
						var pData = [];
						if(this.defaultfavfittools.length>0){
							var data= this.defaultfavfittools;
							ptData = _.find(data,function(o){ return o.itemType == self.model.get('custrecord_fp_product_type_text');});
							if(ptData){
								_.each(ptData.measurementValues,function(o){
									o.name = unescape(o.name);
								});
								this.model.set('custrecord_fp_measure_value', JSON.stringify(ptData.measurementValues));
							}
						}
					}
				break;
				case "units":
					this.units = jQuery(e.target).val();
					var fpMeasureValue = this.model.get('custrecord_fp_measure_value');
					fpMeasureValue = fpMeasureValue?JSON.parse(fpMeasureValue):[];
					var obj = _.find(fpMeasureValue,function(o){
						return o.name == jQuery(e.target).attr('name');
					});
					if(obj){
						obj.value = jQuery(e.target).val();
					}else{
						fpMeasureValue.push({
								name: jQuery(e.target).attr('name')
							, value: jQuery(e.target).val()
						})
					}
					this.model.set('custrecord_fp_measure_value', JSON.stringify(fpMeasureValue));

					if(this.units == 'CM')
						this.itemRangeConfig = this.cmConfig;
					else
						this.itemRangeConfig = this.inchConfig;
				break;
				case "fit":
					this.selectedFitValue = jQuery(e.target).val();
					var fpMeasureValue = this.model.get('custrecord_fp_measure_value');
					fpMeasureValue = fpMeasureValue?JSON.parse(fpMeasureValue):[];
					var obj = _.find(fpMeasureValue,function(o){
						return o.name == jQuery(e.target).attr('name');
					});
					if(obj){
						obj.value = jQuery(e.target).val();
					}else{
						fpMeasureValue.push({
								name: jQuery(e.target).attr('name')
							, value: jQuery(e.target).val()
						})
					}
					this.model.set('custrecord_fp_measure_value', JSON.stringify(fpMeasureValue));
				break;
				case "block":
					this.model.set('custrecord_fp_block_value',jQuery(e.target).val());
					this.selectedBlockValue = jQuery(e.target).val();
					var fpMeasureValue = this.model.get('custrecord_fp_measure_value');
					fpMeasureValue = fpMeasureValue?JSON.parse(fpMeasureValue):[];
					var obj = _.find(fpMeasureValue,function(o){
						return o.name == jQuery(e.target).attr('name');
					});
					if(obj){
						obj.value = jQuery(e.target).val();
					}else{
						fpMeasureValue.push({
								name: jQuery(e.target).attr('name')
							, value: jQuery(e.target).val()
						})
					}
					this.model.set('custrecord_fp_measure_value', JSON.stringify(fpMeasureValue));
				break;
				default:
					var fpMeasureValue = this.model.get('custrecord_fp_measure_value');

					fpMeasureValue = fpMeasureValue?JSON.parse(fpMeasureValue):[];
					var obj = _.find(fpMeasureValue,function(o){
						return o.name == jQuery(e.target).attr('name');
					});
					if(obj){
						obj.value = jQuery(e.target).val();
					}else{
						fpMeasureValue.push({
								name: jQuery(e.target).attr('name')
							, value: jQuery(e.target).val()
						})
					}
					this.model.set('custrecord_fp_measure_value', JSON.stringify(fpMeasureValue));
					if(jQuery(e.target).hasClass('block-measurement-fld')){

					}else if(jQuery(e.target).hasClass('body-measure-fld')){

					}else if(jQuery(e.target).hasClass('allowance-fld')){

					}
			}
			this.focusElementId = jQuery(e.target).attr('id').split('in-modal-')[1];
			this.showInModal();
			this.$el.find('[id*="'+this.focusElementId+'"]').focus();
		}
		, submitFitProfile: function(e){
			e.preventDefault();
			var finishMeasurements = jQuery('[id*="profile-form"] span[id*="finish_"]');
				var hasErrors = false;
				for (var i = 0; i < finishMeasurements.length; i++) {
					if (finishMeasurements[i].attributes['min-value'] && finishMeasurements[i].attributes['max-value']) {
						var min = parseFloat(finishMeasurements[i].attributes['min-value'].value),
							max = parseFloat(finishMeasurements[i].attributes['max-value'].value),
							finalvalue = parseFloat(finishMeasurements[i].innerHTML);
						if (min && max) {
							if(finalvalue == 0 && finishMeasurements[i].dataset.optional == 'true'){
								//we accept this

							}else	if (min > finalvalue || finalvalue > max) {
								hasErrors = true;
								break;
							}
						}
					}
				};
				if (hasErrors) {
					var message = 'Body measurements finished value is not within the range.';
					var $confirmation_message = this.$('[data-type="fit-alert-placeholder"]')
					,	$msg_el = jQuery(SC.macros.message(message, 'error', true));

					$confirmation_message.show().empty().append($msg_el);

					setTimeout(function()
					{
						jQuery('[data-type="fit-alert-placeholder"]').fadeOut(3000);
					}, 10000);
					return false;
				}
				var measureTypeValue = jQuery("[id*='custrecord_fp_measure_type']").val() ?
					jQuery("[id*='custrecord_fp_measure_type']").val() : jQuery("[id*='custrecord_fp_measure_type'").val();

				if(jQuery('[id*="body-fit"]').val() == 'Slim' && jQuery('[id*="body-block"]').val() != 'Select' && jQuery("[id*='custrecord_fp_product_type']").val() == 'Shirt'){
					if(parseFloat(jQuery('[id*="body-block"]').val()) < 35 || parseFloat(jQuery('[id*="body-block"]').val()) > 46){

						var message = 'You can only select slim profile for sizes 35 - 46';
						var $confirmation_message = this.$('[data-type="fit-alert-placeholder"]')
						,	$msg_el = jQuery(SC.macros.message(message, 'error', true));

						$confirmation_message.show().empty().append($msg_el);

						setTimeout(function()
						{
							jQuery('[data-type="fit-alert-placeholder"]').fadeOut(3000);
						}, 10000);
						return false;
					}
				}

				var regex = new RegExp("\\+","g");
				var formValues = jQuery('[id="in-modal-profile-form"]').serialize().split("&")
					, self = this
					, dataToSend = new Array()
					, measurementValues = new Array();

				// this.model.set("name", jQuery("[id='in-modal-name']").val());
				// this.model.set("custrecord_fp_product_type", this.productTypeIds[jQuery("[id*='custrecord_fp_product_type']").val()]);
				// this.model.set("custrecord_fp_measure_type", this.measurementTypeIds[jQuery("[id*='custrecord_fp_measure_type']").val()]);
				// this.model.set('custrecord_fp_client', self.parentView.model.get('id'));
				var validation = this.model.validate()
				if(validation){
					var keys = Object.keys(validation);
					var message = "";
					for(var i=0;i<keys.length;i++){
						if(i>0)
							message += "<br/>";
						message += validation[keys[i]];
					}
					var $confirmation_message = this.$('[data-type="fit-alert-placeholder"]')
					,	$msg_el = jQuery(SC.macros.message(message, 'error', true));

					$confirmation_message.show().empty().append($msg_el);

					setTimeout(function()
					{
						jQuery('[data-type="fit-alert-placeholder"]').fadeOut(3000);
					}, 10000);
					return false;
				}else {
					_.each(formValues, function (formValue) {
						var field = formValue.split("=")[0]
							, value = formValue.split("=")[1]
							, formData = new Object()
							, param = new Object();

						if (field == "custrecord_fp_client" || field == "name" || field == "custrecord_fp_product_type"
						|| field == "custrecord_fp_measure_type") {
							formData.name = field;
							if (field == "custrecord_fp_client" || field == "name") {
								formData.value = value.replace(regex, " ");
							} else {
								formData.text = value.replace(regex, " ");
							}
							formData.type = "field";
							formData.sublist = "";

							dataToSend.push(formData);
						} else {
							if(value && parseFloat(value) == 0){
								//you can only go here if you are an optional.. check if the finish is 0 dont save if it is
								var fieldname = field;
								if(field.indexOf('allowance') != -1){
									var a = field.split('-');
									a.shift();
									fieldname = a.join('-');
								}
								var x = jQuery('[id*="finish_'+fieldname+'"]')
								if(x.length != 0 && x.data().optional && x.html() == '0'){

								}else{
									var measureData = new Object();
									measureData.name = unescape(field);
									measureData.value = value.replace(regex, " ");

									measurementValues.push(measureData);}
								}

							else{
								var fieldname = field;
								if(field.indexOf('allowance') != -1){
									var a = field.split('-');
									a.shift();
									fieldname = a.join('-');
								}
								var x = jQuery('[id*="finish_'+fieldname+'"]')
								if(x.length != 0 && x.data().optional && x.html() == '0'){

								}else{
								var measureData = new Object();
								measureData.name = unescape(field);
								measureData.value = value.replace(regex, " ");

								measurementValues.push(measureData);
								}
							}
						}
					});

					var param = new Object();
					var bvalue = this.lookupBlockValue();
					if(bvalue){
						self.model.set("custrecord_fp_block_value", bvalue);
					}
					self.model.set("custrecord_fp_measure_value", JSON.stringify(measurementValues));
					self.model.save().done(function(){
						var fitProfiles = new FitProfileCollection();
						fitProfiles.fetch({data:{
							clientid: self.parentView.model.get('id')
						}}).done(function(){
							self.parentView.fitProfiles = fitProfiles;
							jQuery("#fit-profiles").html(SC.macros.fitProfilesMacro(self.parentView,self.parentView.fitProfiles));
							jQuery(".modal.in").modal("hide");
							self.parentView.showConfirmationMessage(_('The fitprofile was added/updated in your list').translate());
						})
					});
				}
		}
		, lookupBlockValue: function(){
			var self = this;
			if(jQuery('[name*="custrecord_fp_measure_type"]').val() == 'Block'){
				return jQuery('[name="block"]').val();
			}else{
				//Should be a body
				//3:Jacket, 4:Trouser, 6:Waistcoat, 7:Shirt, 8:Overcoat
				var ptype = jQuery('[name*="custrecord_fp_product_type"]').val(), result;
				switch(ptype){
					case 'Jacket':
					case 'Shirt':
					case 'Overcoat':
					case 'Short-Sleeves-Shirt':
						var partvalue = 0;
						var partmeasure = jQuery('[id*="finish_Waist"]').html(), partvalue = 0;

						if(partmeasure){
							partvalue = jQuery('[name*="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
							partvalue = parseFloat(partvalue)/2
							var filtered = _.filter(self.bodyBlockMeasurements,function(data){
							return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
							})
							if(filtered && filtered.length>0){
								result = filtered.reduce(function(prev, curr){
						        return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
						    });
							}else{
								var filtered = _.filter(self.bodyBlockMeasurements,function(data){
									return data.custrecord_bbm_producttypetext == ptype;
								});
								result = filtered.reduce(function(prev, curr){
						        return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
						    });
							}
						}
						break;
					case 'Waistcoat':
						var partvalue = 0;
						var partmeasure = jQuery('[id*="finish_waist"]').html(), partvalue = 0;

						if(partmeasure){
							partvalue = jQuery('[name*="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
							partvalue = parseFloat(partvalue)/2
							var filtered = _.filter(self.bodyBlockMeasurements,function(data){
							return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
							})
							if(filtered && filtered.length>0){
								result = filtered.reduce(function(prev, curr){
										return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
								});
							}else{
								var filtered = _.filter(self.bodyBlockMeasurements,function(data){
									return data.custrecord_bbm_producttypetext == ptype;
								});
								result = filtered.reduce(function(prev, curr){
										return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
								});
							}
						}
						break;
					case 'Trouser':
						var partvalue = 0;
						var partmeasure = jQuery('[id*="finish_seat"]').html(), partvalue = 0;
						if(partmeasure){
							partvalue = jQuery('[name*="units"]').val() == 'CM'?partmeasure:parseFloat(partmeasure)*2.54;
							partvalue = parseFloat(partvalue)/2
							var filtered = _.filter(self.bodyBlockMeasurements,function(data){
							return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partvalue) && data.custrecord_bbm_producttypetext == ptype;
							})
							if(filtered && filtered.length>0){
								result = filtered.reduce(function(prev, curr){
										return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
								});
							}else{
								var filtered = _.filter(self.bodyBlockMeasurements,function(data){
									return data.custrecord_bbm_producttypetext == ptype;
								});
								result = filtered.reduce(function(prev, curr){
						        return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
						    });
							}
						}
						break;
					default:
				}
				return result?result.custrecord_bbm_block:0;
			}
		}
		, removeFitProfile: function(e){
			e.preventDefault();

			var self = this;
			self.model.destroy();
			var fitprofilemodel = _.find(self.parentView.fitProfiles.models,function(o){
				return o.get('internalid') == self.model.get('internalid');
			});
			self.parentView.fitProfiles.remove(fitprofilemodel);
			jQuery("#fit-profiles").html(SC.macros.fitProfilesMacro(self.parentView,self.parentView.fitProfiles));
			self.parentView.showConfirmationMessage(_('The fitprofile was removed from your list').translate());


			jQuery(".modal.in").modal("hide");

		}
		, copyFitProfile: function(e){
			e.preventDefault();
			var self = this;
			var clonedmodel = self.model.clone();
			clonedmodel.unset('internalid');
			clonedmodel.unset('id');
			clonedmodel.unset('name');
			self.model = clonedmodel;
			this.showInModal();
			// clonedmodel.save().done(function(data){
			// 	var fitProfiles = new FitProfileCollection();
			// 	fitProfiles.fetch({data:{
			// 		clientid: self.parentView.model.get('id')
			// 	}}).done(function(){
			// 		self.parentView.fitProfiles = fitProfiles;
			// 		jQuery("#fit-profiles").html(SC.macros.fitProfilesMacro(self.parentView,self.parentView.fitProfiles));
			// 	})
			// });
			// jQuery(".modal.in").modal("hide");
			// self.parentView.showConfirmationMessage(_('The fitprofile was removed from your list').translate());
		}

	});
});
