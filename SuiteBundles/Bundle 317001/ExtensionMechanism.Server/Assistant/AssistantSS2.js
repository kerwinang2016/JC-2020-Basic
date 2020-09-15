/**
 *@NApiVersion 2.x
 */
define(
    [
        'N/ui/serverWidget'
    ,   'N/runtime'
    ,   'N/redirect'
    ,   'N/search'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        serverWidget
    ,   runtime
    ,   redirect
    ,   search
    )
{
    var step = {

        renderStep: function(form)
        {
            return form;
        }

    ,   redirectStep: function()
        {
            return {};
        }

    ,   handleErrors: function(form, error)
        {
            var error_field = form.getField({id : 'custpage_error'});
            if(error_field)
            {
                return;
            }

            form.addField({
                id: 'custpage_error'
            ,   type: serverWidget.FieldType.LONGTEXT
            ,   label: 'custpage_error'
            })
            .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            form.updateDefaultValues({
                custpage_error: JSON.stringify(error)
            });
        }

    ,   renderStepLabel: function(form)
        {
            if(!this.website || !this.domain)
            {
               return;
            }

            var domain_data = _.findWhere(this.website.domains, {domain: this.domain})
            ,   app_manifest = domain_data.manifest;

            var ws_label = form.addField({
                id: 'custpage_sc_website_label'
            ,   type: serverWidget.FieldType.TEXT
            ,   label: 'Website'
            });
            ws_label.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.STARTROW
            });
            ws_label.updateDisplaySize({width : 50, height: 20});
            ws_label.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            ws_label.defaultValue = this.website.name;

            var domain_label = form.addField({
                id: 'custpage_sc_domain_label'
            ,   type: serverWidget.FieldType.TEXT
            ,   label: 'Domain'
            });
            domain_label.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });
            domain_label.updateDisplaySize({width : 50, height: 20});
            domain_label.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            domain_label.defaultValue = this.domain;

            if(!app_manifest || app_manifest.type !== 'SCIS')
            {
                return;
            }

            var subsidiary = {name: 'All'};
            if(this.subsidiary)
            {
                subsidiary = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: this.subsidiary,
                    columns: ['name']
                });
            }

            var subsidiary_label = form.addField({
                id: 'custpage_sc_subsidiary_label'
            ,   type: serverWidget.FieldType.TEXT
            ,   label: 'Subsidiary'
            });
            subsidiary_label.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });
            subsidiary_label.updateDisplaySize({width : 50, height: 20});
            subsidiary_label.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            subsidiary_label.defaultValue = subsidiary.name;

            var location = {name: 'All'};
            if(this.location)
            {
                location = search.lookupFields({
                    type: search.Type.LOCATION,
                    id: this.location,
                    columns: ['name']
                });
            }

            var location_label = form.addField({
                id: 'custpage_sc_location_label'
            ,   type: serverWidget.FieldType.TEXT
            ,   label: 'Location'
            });
            location_label.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.ENDROW
            });
            location_label.updateDisplaySize({width : 50, height: 20});
            location_label.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            location_label.defaultValue = location.name;
        }

     ,  goToStep: function(next_step_data)
        {
            var script = runtime.getCurrentScript();

            redirect.toSuitelet({
                scriptId: script.id
            ,   deploymentId: script.deploymentId
            ,   parameters: next_step_data
            });
        }

    ,   onRequest: function(context)
        {
            if (context.request.method === 'GET')
            {
                var form = serverWidget.createForm({
                    title: 'Extensions'
                });

                var error = context.request.parameters.error;

                if(error)
                {
                    this.handleErrors(
                        form
                    ,   JSON.parse(error)
                    );
                }

                form.addField({
                    id: 'service_name'
                ,   type: serverWidget.FieldType.TEXT
                ,   label: 'service_name'
                })
                .updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

                var script = runtime.getCurrentScript()
                ,   service_name = context.request.parameters.service_name || script.getParameter({name: 'custscript_service_name'});

                form.updateDefaultValues({
                    service_name: service_name
                });

                form = this.renderStep(context.request, form);

                context.response.writePage(form);
            }
            else
            {
                var params = context.request.parameters
                ,   input_parameters = params.entryformquerystring
                ,   next_step_data = {
                        website_id: null
                    ,   domain_id: null
                    ,   subsidiary_id: null
                    ,   location_id: null
                    ,   service_name: null
                    };

                next_step_data = _.mapObject(next_step_data, function(value, key)
                {
                    var regexp = new RegExp('[\?&]' + key + '=([^&]*)')
                    ,   match = input_parameters.match(regexp);
                    return match && match[1];
                });

                var new_step_data = this.redirectStep(context.request);
                next_step_data = _.extend(next_step_data, new_step_data);
                //Removes null values
                next_step_data = _.pick(next_step_data, _.identity);
                this.goToStep(next_step_data);
            }
        }

    };

    return step;
});
