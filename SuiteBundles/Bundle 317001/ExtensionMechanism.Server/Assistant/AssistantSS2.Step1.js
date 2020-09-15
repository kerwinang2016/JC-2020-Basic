/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        './AssistantSS2'
    ,   '../Services/WebsiteApiSS2'
    ,   '../Helpers/ActivationHelper'
    ,   'N/ui/serverWidget'
    ,   'N/ui/message'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        Assistant
    ,   WebsiteApi
    ,   ActivationHelper
    ,   serverWidget
    ,   message
    )
{
    var step_1 = {

        renderWebsiteSelect: function(form)
        {
            var website_select = form.addField({
                id: 'custpage_website_field'
            ,   type: serverWidget.FieldType.SELECT
            ,   label: 'Select a Web Site'
            });

            website_select.updateBreakType({
                breakType : serverWidget.FieldBreakType.STARTROW
            });

            website_select.isMandatory = true;

            website_select.addSelectOption({
                value: '-'
            ,   text: 'Pick one'
            ,   isSelected: true
            });

            var website_data = WebsiteApi.getWebsites();
			_.each(website_data, function(ws)
			{
				website_select.addSelectOption({
                    value: ws.website_id
                ,   text: ws.name
                });
			});
        }

    ,   renderDomainSelect: function(form)
        {
            var domain_select = form.addField({
                id: 'custpage_domain'
            ,   type: serverWidget.FieldType.SELECT
            ,   label: 'Select a Domain'
            });

            domain_select.updateBreakType({
                breakType : serverWidget.FieldBreakType.STARTROW
            });

            domain_select.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });

            domain_select.isMandatory = true;

            domain_select.addSelectOption({
                value: '-'
            ,   text: 'Pick one'
            ,   isSelected: true
            });
        }

    ,   renderSubsidiarySelect: function(form)
        {
            var subsidiary_select = form.addField({
                id: 'custpage_subsidiary'
            ,   type: serverWidget.FieldType.SELECT
            ,   label: 'Select Subsidiary'
            });

            subsidiary_select.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });

            subsidiary_select.updateBreakType({
                breakType : serverWidget.FieldBreakType.STARTROW
            });

            subsidiary_select.addSelectOption({
                value: '-'
            ,   text: 'Pick one'
            ,   isSelected: true
            });
        }

    ,   renderLocationSelect: function(form)
        {
            var location_select = form.addField({
                id: 'custpage_location'
            ,   type: serverWidget.FieldType.SELECT
            ,   label: 'Select Location'
            });

            location_select.updateDisplayType({
                displayType : serverWidget.FieldDisplayType.DISABLED
            });

            location_select.addSelectOption({
                value: '-'
            ,   text: 'Pick one'
            ,   isSelected: true
            });
        }

    ,   renderStep: function(request, form)
        {
            form.title = 'New Activation';

            this.renderWebsiteSelect(form);
            this.renderDomainSelect(form);
            this.renderSubsidiarySelect(form);
            this.renderLocationSelect(form);

            form.addSubmitButton({
                label : 'Next'
            });

            form.addButton({
                id : 'custpage_sc_extensions_cancel_button'
            ,   label : 'Cancel'
            ,   functionName: 'step_back'
            });

            form.clientScriptModulePath = '../../ExtensionMechanism.Client/Assistant/Step1.SiteSelectionSS2.js';

            return form;
        }

    ,   redirectStep: function(request)
        {
            var params = request.parameters
            ,   website_id = params.custpage_website_field
            ,   domain_id = params.custpage_domain
            ,   subsidiary_id = params.custpage_subsidiary
            ,   location_id = params.custpage_location
            ,   next_step_data = {};

            if(!website_id || website_id === '-')
            {
                //Stay in step1 and show an error
                next_step_data.error = JSON.stringify({
                    title: 'Error'
                ,   message: 'Select a Website is required'
                ,   type: message.Type.ERROR
                });
                return next_step_data;
            }

            if(!domain_id || domain_id === '-')
            {
                //Stay in step1 and show an error
                next_step_data.error = JSON.stringify({
                    title: 'Error'
                ,   message: 'Select a Domain is required'
                ,   type: message.Type.ERROR
                });
                return next_step_data;
            }

            var activation = ActivationHelper.getActivation(website_id, domain_id, subsidiary_id, location_id) || {};
            if(activation.state === ActivationHelper.PENDING_STATUS || activation.state === ActivationHelper.IN_PROGRESS_STATUS)
            {
                next_step_data.error = JSON.stringify({
                    title: 'Error'
                ,   message: [
                        'There is another activation in progress'
                    ,   'website id: ' + website_id
                    ,   'domain: ' + domain_id
                    ,   'subsidiary: ' + (subsidiary_id || '-')
                    ,   'location: ' + (location_id || '-')
                    ].join(' ')
                ,   type: message.Type.ERROR
                });
                return next_step_data;
            }

            next_step_data.website_id = website_id;
            next_step_data.domain_id = domain_id;
            next_step_data.subsidiary_id = subsidiary_id !== '-' ? subsidiary_id : null;
            next_step_data.location_id = location_id !== '-' ? location_id : null;
            next_step_data.service_name = 'STEP_2';
            return next_step_data;
        }

    };

    return _.extend({}, Assistant, step_1);
});
