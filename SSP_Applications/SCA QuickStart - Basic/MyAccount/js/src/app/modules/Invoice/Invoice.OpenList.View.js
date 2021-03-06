// Invoice.Views.js
// -----------------------
// Views for handling invoices listing
define('Invoice.OpenList.View', ['Invoice.Collection', 'ListHeader','js/libs/jszip.js','js/libs/jszip-utils.js','js/libs/FileSaver.js'], function (InvoiceCollection, ListHeader, JSZip)
{
	'use strict';

	// returns the amount of days based on milliseconds
	function getDays(milliseconds)
	{
		return milliseconds / 1000 / 60 / 60 / 24;
	}

	return Backbone.View.extend({

		template: 'open_invoices_list'

	,	title: _('Invoices').translate()

	,	page_header: _('Invoices').translate()

	,	attributes: {
			'class': 'Invoices'
		}

	,	events: {
			'click [data-type="invoice"]': 'toggleInvoiceHandler',
			'click [data-action="downloadinvoices"]': 'downloadInvoices',
			'click [data-action="consolidateinvoices"]': 'consolidateInvoices'
		}

	,	initialize : function (options)
		{
			var self = this
			,	application = options.application;

			this.application = application;
			this.user = application.getUser();

			// manges sorting and filtering of the collection
			this.listHeader = new ListHeader({
				view: this
			,	application: application
			,	collection: this.collection
			,	filters: this.filterOptions
			,	sorts: this.sortOptions
			,	selectable: true
			});

			this.collection.on('sync reset', function ()
			{
				var collection = this;

				application.getLivePayment().getSelectedInvoices().each(function (invoice)
				{
					collection.get(invoice).set('checked', true);
				});

				self.render();
			});
		}
	, download_file : function (fileURL, fileName) {
		    // for non-IE
		    if (!window.ActiveXObject) {
		        var save = document.createElement('a');
		        save.href = fileURL;
		        save.target = '_blank';
		        var filename = fileURL.substring(fileURL.lastIndexOf('/')+1);
		        save.download = fileName || filename;
			       if ( navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search("Chrome") < 0) {
						document.location = save.href;
		// window event not working here
					}else{
				        var evt = new MouseEvent('click', {
				            'view': window,
				            'bubbles': true,
				            'cancelable': false
				        });
				        save.dispatchEvent(evt);
				        (window.URL || window.webkitURL).revokeObjectURL(save.href);
					}
		    }

		    // for IE < 11
		    else if ( !! window.ActiveXObject && document.execCommand)     {
		        var _window = window.open(fileURL, '_blank');
		        _window.document.close();
		        _window.document.execCommand('SaveAs', true, fileName || fileURL)
		        _window.close();
		    }
		}
	, create_zip: function (fileData) {
		// var fileURL = [	'https://3857857.app.netsuite.com/app/site/hosting/scriptlet.nl?script=121&deploy=1&custparam_record_id=674314&custparam_record_type=invoice&custparam_template=4',
		// 				'https://3857857.app.netsuite.com/app/site/hosting/scriptlet.nl?script=121&deploy=1&custparam_record_id=674476&custparam_record_type=invoice&custparam_template=4'];
	  var contents = "";
		var zip = new JSZip();
		for(var i=0; i<fileData.length; i++){
			var request = jQuery.ajax({
			url: fileData[i].url,
			type: "GET",
			async: false,
			contentType: "application/pdf",
			mimeType:'text/plain; charset=x-user-defined' // <-[1]
			}).done(function( data ) {
				zip.file(fileData[i].filename, data, { binary: true });
			});
		}
		zip.generateAsync({type:"blob"}).then(function(content) {
			// see FileSaver.js
			saveAs(content, "Invoices.zip");
		});
	}
	, consolidateInvoices: function(e){
		e.preventDefault();
		var self = this;
		var count = jQuery('[data-action="select"]:checked').length;
		var count2 = 0;
		var fileData = [];
		var csvContent = "data:text/csv;charset=utf-8,Invoice Number, Date, Due Date, Amount, Order, Customer, Type\r\n";

		var fileid = new Date();
		var filename = "ConsolidatedInvoices_"+fileid.getTime()+".csv";
		console.log('clicked download consolidate')
		//Invoice Number, Date, Due Date, Amount, Order, Customer, Type
		if(jQuery('#select-all').prop('checked') == false){
			if(count > 0){
				var ids = [];
				jQuery('[data-action="select"]:checked').each(function(f,g){
					var id = jQuery(g).val();
					var data = [];
					//Get the Details of the lists from open invoices collection
					var inv = _.find(self.collection.models,function (invoice){
						return invoice.get('internalid') == id;
					});
					if(inv){
						var invoicenumber = "Invoice "+inv.get('tranid');
						var trandate = inv.get('trandate');
						var duedate = inv.get('duedate');
						var amount = inv.get('summary').total.toString().replace(/,/g,'');
						var order = inv.get('createdfrom');
						var client = inv.get('custbody_customer_name');
						var ordertype = inv.get('custbody_customer_name')?'Production':'Other';

						data.push(invoicenumber);
						data.push(trandate);
						data.push(duedate);
						data.push(amount);
						data.push(order);
						data.push(client);
						data.push(ordertype);
						fileData.push(data);
					}
	    	});
			}
		}else{
			//Select all has been selected

			this.collection.each(function (invoice)
			{
				var data = [];
				data.push("Invoice "+invoice.get('tranid'));
				data.push(invoice.get('trandate'));
				data.push(invoice.get('duedate'));
				data.push(invoice.get('summary').total.toStrig().replace(/,/g,''));
				data.push(invoice.get('createdfrom'));
				data.push(invoice.get('custbody_customer_name'));
				data.push(invoice.get('custbody_customer_name')?'Production':'Other');
				fileData.push(data);
			});
		}
		if(fileData.length>0){
			fileData.forEach(function(rowArray) {
			    var row = rowArray.join(",");
			    csvContent += row + "\r\n";
			});
			var encodedUri = encodeURI(csvContent);
			var link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", filename);
			document.body.appendChild(link);
			link.click();
		}
	}
	, downloadInvoices: function(e){
		e.preventDefault();
		var self = this;
		var count = jQuery('[data-action="select"]:checked').length;
		var count2 = 0;
		if(jQuery('#select-all').prop('checked') == false){
			if(count > 0){
				if(count >1 ){
					var ids = [];
					var zip = new JSZip();
					var fileData = [];
					jQuery('[data-action="select"]:checked').each(function(f,g){
						var id = jQuery(g).val();
						var fileid = jQuery(g).attr('data-name');
						var filename = "Invoice_"+fileid+".pdf";
						fileData.push({
							url:"/app/site/hosting/scriptlet.nl?script=121&deploy=1&custparam_record_id="+id+"&custparam_record_type=invoice&custparam_template=4",
							filename: filename
						});

		    	});
					this.create_zip(fileData);
					//self.download_file("/app/site/hosting/scriptlet.nl?script=121&deploy=1&custparam_record_id="+ids+"&custparam_record_type=invoice&custparam_template=4","Invoices.zip");
				}else{
					jQuery('[data-action="select"]:checked').each(function(f,g){
						var id = jQuery(g).val();
						var fileid = jQuery(g).attr('data-name');
						self.download_file("/app/site/hosting/scriptlet.nl?script=121&deploy=1&custparam_record_id="+id+"&custparam_record_type=invoice&custparam_template=4","Invoice_"+fileid+".pdf");
					});
				}
			}
		}else{
			//Select all has been selected
			var fileData = [];
			this.collection.each(function (invoice)
			{
				var id = invoice.get('internalid');
				var fileid = invoice.get('tranid');
				var filename = "Invoice_"+fileid+".pdf";
				fileData.push({
					url:"/app/site/hosting/scriptlet.nl?script=121&deploy=1&custparam_record_id="+id+"&custparam_record_type=invoice&custparam_template=4",
					filename: filename
				});
			});
			this.create_zip(fileData);

		}
	}
		//Returns the count of selected invoices (This method is used by the template)
	,	getSelectedInvoicesLength: function()
		{
			return this.collection.filter(function (invoice)
			{
				return invoice.get('checked');
			}).length;
		}

		//Handle to used to change the status of an invoice
	,	toggleInvoiceHandler: function (e)
		{
			this.toggleInvoice(jQuery(e.target).closest('[data-type="invoice"]').data('id'));
		}

		//Change the state (selected/unselected) of the specified invoice Model
	,	toggleInvoice: function (invoice)
		{
			invoice = this.collection.get(invoice);

			if (invoice)
			{
				this[invoice.get('checked') ? 'unselectInvoice' : 'selectInvoice'](invoice);
				this.render();
			}
		}

		//select a specified invoice Model
	,	selectInvoice: function (invoice)
		{
			if (invoice)
			{
				invoice.set('checked', true);
			}

			return this.application.getLivePayment().selectInvoice(invoice.id);
		}

		//unselect a specified invoice Model
	,	unselectInvoice: function (invoice)
		{
			if (invoice)
			{
				invoice.set('checked', false);
			}

			return this.application.getLivePayment().unselectInvoice(invoice.id);
		}

		// selects all invoices
	,	selectAll: function ()
		{
			var self = this
			,	has_changed = false;

			this.collection.each(function (invoice)
			{
				if (!invoice.get('checked'))
				{
					has_changed = true;
					// select the invoice
					self.selectInvoice(invoice, {
						silent: true
					});
				}
			});

			// The select all might've been called
			// on a collection that was already fully selected
			// so let's not due an painfull useless render, shall we?
			if (has_changed)
			{
				this.render();
			}
		}

		// unselects all invoices
	,	unselectAll: function ()
		{
			var self = this
			,	has_changed = false;

			this.collection.each(function (invoice)
			{
				if (invoice.get('checked'))
				{
					has_changed = true;
					// unselects the invoice
					self.unselectInvoice(invoice, {
						silent: true
					});
				}
			});

			// The unselect all might've been called
			// on a collection that had none selected
			// so let's not due an painfull useless render, shall we?
			if (has_changed)
			{
				this.render();
			}
		}

	,	showContent: function ()
		{
			this.options.application.getLayout().showContent(this, 'invoices', [{
				text: this.title
			,	href: '/invoices'
			}]);
		}

		// Array of default filter options
		// filters always apply on the original collection
	,	filterOptions: [
			{
				value: 'overdue'
			,	name: _('Show Overdue').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || invoice.get('isOverdue');
					});
				}
			}
		,	{
				value: 'next7days'
			,	name: _('Show Due next 7 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 7;
					});
				}
			}
		,	{
				value: 'next30days'
			,	name: _('Show Due next 30 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 30;
					});
				}
			}
		,	{
				value: 'next60days'
			,	name: _('Show Due next 60 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 60;
					});
				}
			}
		,	{
				value: 'next90days'
			,	name: _('Show Due next 90 days').translate()
			,	filter: function ()
				{
					return this.original.filter(function (invoice)
					{
						return !invoice.get('dueinmilliseconds') || getDays(invoice.get('dueinmilliseconds')) <= 90;
					});
				}
			}
		,	{
				value: 'all'
			,	name: _('Show All').translate()
			,	selected: true
			,	filter: function ()
				{
					return this.original.models;
				}
			}
		]

		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'duedate'
			,	name: _('By Due Date').translate()
			,	selected: true
			,	sort: function ()
				{
					return this.models.sort(function (invoiceOne, invoiceTwo)
					{
						var milli_inv_one = invoiceOne.get('dueinmilliseconds') || 0
						,	milli_inv_two = invoiceTwo.get('dueinmilliseconds') || 0;

						if (milli_inv_one !== milli_inv_two)
						{
							return milli_inv_one < milli_inv_two ? -1 : 1;
						}

						return invoiceOne.get('tranid') < invoiceTwo.get('tranid') ? -1 : 1;
					});
				}
			}
		,	{
				value: 'trandate'
			,	name: _('By Invoice Date').translate()
			,	sort: function ()
				{
					return this.models.sort(function (invoiceOne, invoiceTwo)
					{
						var milli_inv_one = invoiceOne.get('tranDateInMilliseconds') || 0
						,	milli_inv_two = invoiceTwo.get('tranDateInMilliseconds') || 0;

						if (milli_inv_one !== milli_inv_two)
						{
							return milli_inv_one < milli_inv_two ? -1 : 1;
						}

						return invoiceOne.get('tranid') < invoiceTwo.get('tranid') ? -1 : 1;
					});
				}
			}
		,	{
				value: 'invoicenumber'
			,	name: _('By Invoice Number').translate()
			,	sort: function ()
				{
					return this.sortBy(function (invoice)
					{
						return invoice.get('tranid');
					});
				}
			}
		,	{
				value: 'amountdue'
			,	name: _('By Amount Due').translate()
			,	sort: function ()
				{
					return this.sortBy(function (invoice)
					{
						return invoice.get('amountremaining');
					});
				}
			}
		]
	});
});
