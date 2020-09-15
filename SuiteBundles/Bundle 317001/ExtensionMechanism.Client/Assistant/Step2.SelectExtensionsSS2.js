/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/ui/message'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        message
    )
{

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

            var lists = ['themes_list', 'extensions_list'];

            _.each(lists, function(sublistId)
            {
                var ext_count = form.getLineCount({sublistId: sublistId});
                for(var i = 0; i < ext_count; i++)
                {
                    var latest_version = form.getSublistValue({sublistId: sublistId, fieldId: 'extension_new_version', line: i});

                    if(!latest_version)
                    {
                        form.getSublistField({sublistId: sublistId, fieldId: 'extension_update', line: i}).isDisabled = true;
                    }

                    var is_install_ext = form.getSublistValue({sublistId: sublistId, fieldId: 'is_install', line: i});

                    if(is_install_ext) {
                        form.getSublistField({sublistId: sublistId, fieldId: 'extension_update', line: i}).isDisabled = true;
                        form.getSublistField({sublistId: sublistId, fieldId: 'extension_active', line: i}).isDisabled = true;
                    }
                }
            });
        }

    ,   saveRecord: function(context)
        {
            var form = context.currentRecord
            ,   themes_lines = form.getLineCount('themes_list')
            ,   is_theme_selected;

            for(var i = 0; i < themes_lines; i++)
            {
                is_theme_selected = form.getSublistValue({
                    sublistId: 'themes_list'
                ,   fieldId: 'extension_active'
                ,   line: i
                });

                if(is_theme_selected)
                {
                    break;
                }
            }

            //This will be -1 when SCIS
            if(themes_lines !== -1 && !is_theme_selected)
            {
                message.create({
                    title: 'Error'
                ,   message: 'Select a Theme is required'
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
            ,   sublist_id = context.sublistId
            ,   checkbox_value;

            if(field_id === 'extension_active')
            {
                checkbox_value = form.getCurrentSublistValue(sublist_id, field_id);

                //If the active checkbox was uncheked then uncheck the update checkbox
                if(!checkbox_value)
                {
                    form.setCurrentSublistValue(sublist_id, 'extension_update', false);
                }
                //In the case of the themes, the previously checked must be unchecked
                else if(sublist_id === 'themes_list')
                {
                    var ext_count = form.getLineCount({sublistId: sublist_id})
                    ,   current_index = form.getCurrentSublistIndex('themes_list');

                    for(var i = 0; i < ext_count; i++)
                    {
                        var is_checked = form.getSublistValue({sublistId: sublist_id, fieldId: field_id, line: i});

                        if(is_checked && current_index !== i)
                        {
                            form.selectLine({sublistId: sublist_id, line: i});
                            form.setCurrentSublistValue({sublistId: sublist_id, fieldId: field_id, value: false});
                            form.selectLine({sublistId: sublist_id, line: current_index});
                        }
                    }
                }
            }
            else if(field_id === 'extension_update')
            {
                checkbox_value = form.getCurrentSublistValue(sublist_id, field_id);

                //If the update checkbox was cheked then check the active checkbox
                if(checkbox_value)
                {
                    form.setCurrentSublistValue(sublist_id, 'extension_active', true);
                }
            }
        }

    ,   step_back: function()
        {
            window.location = window.location.href.replace('STEP_2', 'STEP_0');
        }

    };

    return client;
});
