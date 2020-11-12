// CaseCreate.View.js
// -----------------------
// Views for viewing Cases list.
define('CaseCreate.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'case_new'

	,	title: _('How can we help you?').translate()

	,	page_header: _('How can we help you?').translate()

	,	events: {
			'keypress [type="text"]': 'preventEnter'
		,	'click input[name="include_email"]': 'includeAnotherEmail'
		, 'change .case-fields': 'updateCaseFields'
		// , 'click .btn-case-submit': 'submitCase'
		, 'submit form': 'saveForm'
		}

	,	attributes: {
			'class': 'newCase'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.fields = options.fields;
			this.user = this.application.getUser();
			this.model.on('sync', jQuery.proxy(this, 'showSuccess'));
		}
	, submitCase: function(e){
		var self = this;
		if(jQuery('#item').length ==  1 && jQuery('#item').val() == ""){
			alert('Please Select an item');
			return;
		}
		if(jQuery('#issue').length ==  1 && jQuery('#issue').val() == ""){
			alert('Please Select an issue');
			return;
		}
		if(jQuery('#title').length ==  1 && jQuery('#title').val() == ""){
			alert('Title cannot be blank');
			return;
		}
		if(jQuery('#message').length ==  1 && jQuery('#message').val() == ""){
			alert('Message cannot be blank');
			return;
		}

		this.model.set('custevent_supportcase_quantity','');
		this.model.set('custevent_supportcase_total','');
		this.model.set('custevent_supportcase_lining','');
		this.model.set('custevent_supportcase_fabriccode','');
		this.model.set('custevent_supportcase_accessory','');


		self.model.save();

	}
	, updateCaseFields: function(e){
		e.preventDefault();
		var discount = this.application.user_instance.get("surchargediscount")?parseFloat(this.application.user_instance.get("surchargediscount"))/100:0;
		var self = this;
		switch(e.target.id){
			case "custevent_supportcase_hasmonogram":
			case "custevent_is_cmt":
											if(document.getElementById(e.target.id).checked)
										 		this.model.set(e.target.id, true);
											else
												this.model.set(e.target.id, false);
											this.showContent();
											break;
			case "custevent_supportcase_lining":
			case "custevent_supportcase_quantity":
											//Lining
											this.model.set(e.target.id, jQuery(e.target).val());
											if(jQuery("#item") == "297480"){
												if(jQuery("#custevent_supportcase_lining").val() != "" && jQuery("#custevent_supportcase_quantity").val() != ""){
													var liningObj = _.find(self.fields.get("liningcodes"),function(obj){
														return obj.id == jQuery("#custevent_supportcase_lining").val();
													});
													if(liningObj){
														var liningprice = parseFloat(liningObj.custrecord_flf_lininglevel);
														var quantity = parseFloat(jQuery("#custevent_supportcase_quantity").val());
														var totalprice = (liningprice*quantity);
														totalprice += 20;
														totalprice = totalprice + (totalprice*discount)


														self.model.set("custevent_supportcase_total",(totalprice).toFixed(2));
													}
													this.showContent();
												}else{
													self.model.set("custevent_supportcase_total","0.00");
													this.showContent();
												}
											}
											break;
			case "custevent_supportcase_accessory":
			case "custevent_supportcase_small":
			case "custevent_supportcase_large":
											//Buttons
											this.model.set(e.target.id, jQuery(e.target).val());
											if(jQuery("#item").val() == "297479"){
												if(jQuery("#custevent_supportcase_accessory").val() != ""){
													var acc = self.fields.get('accessories');
													var buttons = _.filter(acc,function(o){
													    return o.custrecord_ap_accessory_type_text == "Buttons";
													});
													var buttonObj = _.find(buttons,function(obj){
														return obj.internalid == jQuery("#custevent_supportcase_accessory").val();
													});
													var small = 0, large = 0, totalprice = 0;
													if(jQuery("#custevent_supportcase_small").val() != ""){
														var smallprice = buttonObj.custrecord_ap_price?parseFloat(buttonObj.custrecord_ap_price):0
														small = smallprice * parseFloat(jQuery("#custevent_supportcase_small").val());
													}
													if(jQuery("#custevent_supportcase_large").val() != ""){
														var largeprice = buttonObj.custrecord_ap_price2?parseFloat(buttonObj.custrecord_ap_price2):0;
														large = largeprice * parseFloat(jQuery("#custevent_supportcase_large").val());
													}
													totalprice = small + large;
													totalprice += 10;
													totalprice = totalprice + (totalprice * discount);
													self.model.set("custevent_supportcase_total",totalprice.toFixed(2));
													this.showContent();
												}else{
													self.model.set("custevent_supportcase_total","0.00");
													this.showContent();
												}
											}
											break;
			case "issue": 	if(jQuery(e.target).val() != '1' && jQuery(e.target).val() != '9')
										 		this.model.set('item', '');
											this.model.set(e.target.id, jQuery(e.target).val());
											var itemtext, issuetext;
											if(this.model.get('item')){
												var items = this.fields.get('items');
												itemtext = _.find(items,function(o){
													return o.id == self.model.get('item');
												}).text;
											}
											if(this.model.get('issue')){
												var issues = this.fields.get('issues');
												issuetext = _.find(issues,function(o){
													return o.id == self.model.get('issue');
												}).text;
											}
											var title = itemtext?issuetext + " - " + itemtext : issuetext;
											this.model.set('title', title);
											this.showContent();
											break;
		  case "item": 		this.model.set(e.target.id, jQuery(e.target).val());
											var itemtext, issuetext;

											if(this.model.get('item')){
												var items = this.fields.get('items');
												itemtext = _.find(items,function(o){
													return o.id == self.model.get('item');
												}).text;
											}
											if(this.model.get('issue')){
												var issues = this.fields.get('issues');
												issuetext = _.find(issues,function(o){
													return o.id == self.model.get('issue');
												}).text;
											}
											var title = itemtext?issuetext + " - " + itemtext : issuetext;
											this.model.set('title', title);
											this.showContent();
											break;
			case "myfile":	var fileData = document.getElementById('myfile').files[0];
											if(fileData){
												if(fileData.size >= 10000000){
													jQuery(e.target).val("");
													self.model.set('filetype', "");
													self.model.set('filename', "");
													self.model.set('file', "");
													alert('File size must be less than 10MB');
												}
												if(fileData.type.indexOf('jpeg') == -1 && fileData.type.indexOf('png') == -1 ){
													jQuery(e.target).val("");
													self.model.set('filetype', "");
													self.model.set('filename', "");
													self.model.set('file', "");
													alert('File type must be JPEG or PNG only');
												}else{
													var reader = new FileReader();
													self.model.set('filetype', fileData.type);
													self.model.set('filename', fileData.name);
													jQuery(e.target).next('.custom-file-label').html(fileData.name);
													reader.readAsBinaryString(fileData);
													reader.onload =  function(f){
														self.model.set('file', btoa(reader.result));
									    		};
												}
											}
											break;
				default: this.model.set(e.target.id, jQuery(e.target).val());
		}

	}
		// Prevents not desired behaviour when hitting enter
	,	preventEnter: function(event)
		{
			if (event.keyCode === 13)
			{
				event.preventDefault();
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'newcase', [{
				text: this.title
			,	href: '/newcase'
			}]);
		}

	,	showSuccess: function()
		{
			var case_link_name = _('support case #$(0)').translate(this.model.get('caseNumber'))
			,	new_case_internalid = this.model.get('internalid')
			,	case_link = '<a href="/cases/' + new_case_internalid + '">' + case_link_name + '</a>'
			,	new_case_message = _('Good! your $(0) was submitted. We will contact you briefly.').translate(case_link);

			this.newCaseId = new_case_internalid;
			this.newCaseMessage = new_case_message;

			Backbone.history.navigate('cases', {trigger: true});
		}

	,	includeAnotherEmail: function()
		{
			this.$('.case-new-email').collapse('toggle');

			var email_input = this.$('.input-case-email');

			email_input.prop('disabled', !email_input.prop('disabled'));
		}
	});
});
