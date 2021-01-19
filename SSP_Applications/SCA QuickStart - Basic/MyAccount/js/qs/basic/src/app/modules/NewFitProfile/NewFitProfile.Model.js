// Client.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('NewFitProfile.Model', function ()
{
	'use strict';
	function validateMeasureValues (value, name, form)
	{
		if(!value){
			return _('Measurement details is required').translate();
		}
		if(form.custrecord_fp_measure_type_text == 'Block'){
			var measurements = JSON.parse(value);
			var fitObj = _.find(measurements,function(o){return o.name=='fit';});
			if(!fitObj || fitObj.value == "Select"){
				return _('Fit is required').translate();
			}
			var blockObj = _.find(measurements,function(o){return o.name=='block';});
			if(!blockObj || blockObj.value == "Select"){
				return _('Block is required').translate();
			}
		}else{
			var measurements = JSON.parse(value);
			var fitObj = _.find(measurements,function(o){return o.name=='fit';});
			if(!fitObj || fitObj.value == "Select"){
				return _('Fit is required').translate();
			}
			var unitsObj = _.find(measurements,function(o){return o.name=='units';});
			if(!unitsObj || unitsObj.value == "Select"){
				return _('Units is required').translate();
			}
		}
		// if (form.include_email && !value)
		// {
		// 	return _('Email is required').translate();
		// }
	}
	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/tailorfitprofile.ss')

		,	validation:
			{
				name: {
					required: true
				,	msg: _('Fitprofile name is required').translate()
				}
			,	custrecord_fp_product_type: {
					required: true
				,	msg: _('Product type is required').translate()
				}
			,	custrecord_fp_measure_type: {
					required: true
				,	msg: _('Measure type is required').translate()
				}
			,	custrecord_fp_client: {
					required: true
				,	msg: _('Client is required').translate()
				}
			,	custrecord_fp_measure_value: {
				// 	required: true
				// ,	msg: _('Measurement details is required').translate()
						fn: validateMeasureValues
				}
			// ,	email: {
			// 		fn: validateEmail
			// 	}
			}
	});
});
