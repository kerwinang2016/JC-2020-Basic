define('NoticesList.View', ['ListHeader'], function (ListHeader)
{
	'use strict';

	return Backbone.View.extend({

		template: 'notices_list'

	,	title: _('Notices').translate()

	,	page_header: _('Notices').translate()

	,	attributes: {
			'class': 'notices-list'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.collection = options.collection;
			this.page = options.page;
			this.listenCollection();
			this.collection.update({
				page: this.page
			});
			// this.setupListHeader();
			// this.collection.update && this.collection.update({
			// 	filter: this.selectedFilter
			// ,	range: range
			// sort: this.selectedSort
			// ,	order: this.order
			// ,	page: this.page
			// ,	killerId: this.application.killerId
			// }, this);

		}
	// ,	setupListHeader: function()
	// 	{
	// 		this.listHeader = new ListHeader({
	// 			view: this
	// 		,	application: this.application
	// 		,	collection: this.collection
	// 		//,	filters: this.initializeFilterOptions()
	// 		//,	sorts: this.sortOptions
	// 		});
	// 	}

	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}

	,	setLoading: function (is_loading)
		{
			this.isLoading = is_loading;
		}
	,	initializeFilterOptions: function()
		{
			var filter_options = [
				{
					value: 'all'
				,	name: _('Show All Statuses').translate()
				,	selected: true
				,	filter: function ()
					{
						return this.original.models;
					}
				}]
			,	statuses = this.fields ? this.fields.get('statuses') : [];

			_.each(statuses, function (status) {
				var filter_option = {
					value: status.id
				,	name: status.text
				,	filter: function ()
					{
						return this.original.filter(function (some_case)
						{
							return some_case.get('status').id === status.id;
						});
					}
				};

				filter_options.push(filter_option);
			});

			return filter_options;
		}
	,	sortOptions: [
			{
				value: 'caseNumber'
			,	name: _('by Issue number').translate()
			,	selected: true
			}
		,	{
				value: 'createdDate'
			,	name: _('by Creation date').translate()
			}
		,	{
				value: 'lastMessageDate'
			,	name: _('by Last Message date').translate()
			}
		]

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'noticeslist', [{
				text: this.title
			,	href: '/noticeslist'
			}]);
		}
	//
	// ,	render: function()
	// 	{
	// 		console.log('Triggered Reset')
	// 		Backbone.View.prototype.render.apply(this, arguments);
	//
	// 		// if (!_.isUndefined(this.inform_new_case))
	// 		// {
	// 		// 	this.informNewCaseCreation();
	// 		//
	// 		// 	if (!this.isLoading)
	// 		// 	{
	// 		// 		delete this.inform_new_case;
	// 		// 	}
	// 		// }
	// 	}

	// ,	informNewCaseCreation: function()
	// 	{
	// 		// this.highlightNewCase(this.new_case_internalid);
	// 		// this.showConfirmationMessage(this.new_case_message);
	// 	}

		// Temporarily highlights the case record just added
	// ,	highlightNewCase: function (internalid)
	// 	{
	// 		// var $list_dom = jQuery(this.el).find('a[data-id='+ internalid +']');
	// 		//
	// 		// if ($list_dom && $list_dom.length === 1)
	// 		// {
	// 		// 	$list_dom.addClass('case-list-new-case-highlight');
	// 		//
	// 		// 	setTimeout( function ()
	// 		// 	{
	// 		// 		$list_dom.removeClass('case-list-new-case-highlight');
	// 		// 	}, 3000);
	// 		// }
	// 	}
	});
});
