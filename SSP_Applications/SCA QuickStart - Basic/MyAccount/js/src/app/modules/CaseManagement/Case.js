// Case.js
// -----------------

/*
Change History   
-------------- 
Date: 04-03-2019
Changed by:Shoaib Iqbal
Change /Jira Ticket #: JHD-29
Change Description: Updates to Cases section on myaccount
*/
/*
Change History   
-------------- 
Date: 06-03-2019
Changed by: Salman Khan
Change /Jira Ticket #: JHD-30
Change Description: Training Guides section to contain links to download the PDF
*/
// Defines the Case module. (Model, Views, Router)
define('Case', 
['CaseDetail.View', 'Case.Collection','Case.Model', 'Case.Router', 'CaseCreate.View', 'CaseList.View', 'TrainingGuides.View'],
function (CaseDetailView, CaseCollection, CaseModel, CaseRouter, CaseCreateView, CaseList, TrainingGuide) //JHD-30
{
	'use strict';

	var case_menuitems = function (application) 
	{
		if (!application.CaseModule.isEnabled())
		{
			return undefined;
		}

		return {
			id: function ()
			{
				return 'cases';				
			}

		,	name: function ()
			{
				return _('Support').translate();
			}

		,	index: 5

		,	children: function () 
			{
				var items = [
					/*{ JHD-29
						parent: 'cases'
					,	id: 'cases_all'
					,	name: _('All My Cases').translate()
					,	url: 'cases'
					,	index: 1
					}

				,	{
						parent: 'cases'
					,	id: 'newcase'
					,	name: _('Submit New Case').translate()
					,	url: 'newcase'
					,	index: 2
				}*/
				,	{
						parent: 'cases'
					,	id: 'faqs'
					,	name: _('FAQS').translate()
					,	url: ''
					,	index: 3
					}
				,	{
						parent: 'cases'
					,	id: 'trainingguides'
					,	name: _('Training Guides').translate()
					,	url: 'trainingguides' //JHD-30
					,	index: 4
					}
				];
				
				return items;
			}

		,	permission: 'lists.listCase.1'
		};
	};

	// Encapsulate all Case elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var CaseModule = function() {
		
		var app = {};
		
		var views = {
				CaseDetail: CaseDetailView
			,	NewCase: CaseCreateView
			,	CaseList: CaseList
			,	TrainingGuides : TrainingGuide //JHD-30
			}

		,	models = {
				Case: CaseModel
			}

		,	collections = {
				Case: CaseCollection			
			};

		// Is Case functionality available for this application?
		var isCaseManagementEnabled = function () 
		{
			var application = app;

			return application.getConfig('cases.config') !== undefined && SC.ENVIRONMENT.CASES.enabled;
		};

		var mountToApp = function (application)
		{
			app = application;
			application.CaseModule = CaseModule;

			// always start our router.
			return new CaseRouter(application);
		};

		return {
			Views : views
		,	Models: models
		,	Collections: collections
		,	Router: CaseRouter
		,	isEnabled: isCaseManagementEnabled
		,	mountToApp: mountToApp
		,	MenuItems: case_menuitems
		};
	}();

	return CaseModule;
});