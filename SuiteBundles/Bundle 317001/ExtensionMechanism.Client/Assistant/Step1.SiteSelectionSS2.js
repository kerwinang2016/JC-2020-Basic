/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        '../ServiceClient/WebsiteServiceClientSS2'
    ,   'N/ui/message'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        WebsiteServiceClient
    ,   message
    )
{

    var websites = {};
    var locations = {};

    function resetSelect(form, field_id)
    {
        var select = form.getField({fieldId: field_id});
        if(select.getSelectOptions().length > 0)
        {
            select.removeSelectOption(null);
        }
        select.insertSelectOption({value: '-', text: 'Pick one', isSelected: true});

        return select;
    }

    function disableDomainSelect(form, disable)
    {
        jQuery('html').attr('style', 'cursor: ' + (disable ? 'wait' : 'default'));
        form.getField({fieldId: 'custpage_domain'}).isDisabled = disable;
    }

    function fillSelect(select, collection, value, text)
    {
        _.each(collection, function(option)
        {
            select.insertSelectOption({value: option[value], text: option[text], isSelected: false});
        });
    }

    var client = {

        pageInit: function(context)
        {
            var form = context.currentRecord
            ,   error = form.getValue({fieldId: 'custpage_error'});

            if(error)
            {
                error = JSON.parse(error);
                message.create(error).show();
            }
        }

    ,   saveRecord: function(context)
        {
            var form = context.currentRecord
            ,   website = form.getValue({fieldId: 'custpage_website_field'})
            ,   domain = form.getValue({fieldId: 'custpage_domain'});

            if (website === '-')
            {
                message.create({
                    title: 'Error'
                ,   message: 'Please select a website.'
                ,   type: message.Type.ERROR
                })
                .show({duration: 5000});

                return false;
            }
            else if(domain === '-')
            {
                message.create({
                    title: 'Error'
                ,   message: 'Please select a domain.'
                ,   type: message.Type.ERROR
                })
                .show({duration: 5000});

                return false;
            }
            return true;
        }

    ,   fieldChanged: function(context)
        {
            var form = context.currentRecord
            ,   field_id = context.fieldId
            ,   website_id = form.getValue({fieldId: 'custpage_website_field'})
            ,   subsidiary_select
            ,   location_select;

            if (field_id === 'custpage_website_field')
            {
                var domain_select = resetSelect(form, 'custpage_domain');
                subsidiary_select = resetSelect(form, 'custpage_subsidiary');
                location_select = resetSelect(form, 'custpage_location');
                domain_select.isDisabled = true;
                subsidiary_select.isDisabled = true;
                location_select.isDisabled = true;

                if(website_id !== '-')
                {
                    if(!websites[website_id] || !websites[website_id].domains)
                    {
                        //This is to show the wait cursor
                        disableDomainSelect(form, true);

                        WebsiteServiceClient.getWebsite(website_id).then(
                            function(website)
                            {
                                websites[website.website_id] = website;

                                fillSelect(domain_select, website.domains, 'domain', 'domain');
                                fillSelect(subsidiary_select, website.subsidiaries, 'subsidiary_id', 'subsidiary_name');

                                disableDomainSelect(form, false);
                            }
                        ).catch(
                            function(error)
                            {
                                console.error(error);
                            }
                        );
                    }
                    else
                    {
                        var website = websites[website_id];

                        fillSelect(domain_select, website.domains, 'domain', 'domain');
                        fillSelect(subsidiary_select, website.subsidiaries, 'subsidiary_id', 'subsidiary_name');

                        disableDomainSelect(form, false);
                    }
                }
            }
            else if (field_id === 'custpage_domain')
            {
                var domain_id = form.getValue({fieldId: 'custpage_domain'});
                location_select = form.getField({fieldId: 'custpage_location'});
                subsidiary_select = form.getField({fieldId: 'custpage_subsidiary'});

                if (website_id !== '-' && domain_id !== '-')
                {
                    var domain = _.findWhere(websites[website_id].domains, {domain: domain_id})
                    ,   manifest = domain && domain.manifest;

                    if(manifest.type === 'SCIS')
                    {
                        subsidiary_select.isDisabled = false;
                        var subsidiary = form.getValue({fieldId: 'custpage_subsidiary'});

                        location_select.isDisabled = subsidiary === '-';
                    }
                    else
                    {
                        subsidiary_select.isDisabled = true;
                        location_select.isDisabled = true;
                        resetSelect(form, 'custpage_subsidiary');
                        resetSelect(form, 'custpage_location');
                    }
                }
                else
                {
                    subsidiary_select.isDisabled = true;
                    location_select.isDisabled = true;
                }
            }
            else if (field_id === 'custpage_subsidiary')
            {
                location_select = form.getField({fieldId: 'custpage_location'});
                location_select.isDisabled = true;

                var subsidiary_id = form.getValue({fieldId: 'custpage_subsidiary'});
                if (subsidiary_id !== '-')
                {
                    var locations_select = resetSelect(form, 'custpage_location');

                    if(!locations[subsidiary_id])
                    {
                        WebsiteServiceClient.getSubsidiaryLocations(subsidiary_id)
                        .then(
                            function(locations_data)
                            {
                                locations[subsidiary_id] = locations_data;
                                fillSelect(locations_select, locations_data, 'location_id', 'location_name');
                                location_select.isDisabled = false;
                            }
                        )
                        .catch(
                            function(error)
                            {
                                console.error(error);
                            }
                        );
                    }
                    else
                    {
                        fillSelect(locations_select, locations[subsidiary_id], 'location_id', 'location_name');
                        location_select.isDisabled = false;
                    }
                }
            }
        }

    ,   step_back: function()
        {
            var new_location = window.location.href.replace('STEP_1', 'STEP_0');
            new_location = new_location.replace(/error=[^&]*&?/, '');
            window.location = new_location;
        }

    };

    return client;
});
