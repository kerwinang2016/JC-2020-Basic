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
		, 'change #issue': 'updateIssue'
		, 'click .btn-case-submit': 'submitCase'
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
		this.model.set('title', jQuery('#title').val());
		this.model.set('issue', jQuery('#issue').val());
		if(jQuery('#issue').val() == '1'){
			this.model.set('item', jQuery('#item').val());
		}else{
			this.model.set('item', '');
		}
		if(jQuery('#issue').val() == '6'){
			var fileData = document.getElementById('myfile').files[0];

			if(fileData.type.indexOf('image') != -1){
				var reader = new FileReader();
				reader.readAsBinaryString(fileData);
				this.model.set('file', reader.result);
				this.model.set('filetype', fileData.type);
				this.model.set('filename', fileData.name);
			}
		}
		this.model.set('message', jQuery('#message').val());
		this.model.save();
	}
	, updateIssue: function(e){
		this.model.set('issue', jQuery('#issue').val());
		this.showContent();
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
