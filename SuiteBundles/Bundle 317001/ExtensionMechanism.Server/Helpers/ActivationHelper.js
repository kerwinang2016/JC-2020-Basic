/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */

 define(
    [
       './ExtensionHelperSS2'
    ,   'N/record'
    ,   'N/search'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        ExtensionHelperSS2
    ,   record
    ,   search
    )
{

    var activation_helper = {

        ERROR_STATUS: 'ERROR'

    ,   CANCELLED_STATUS: 'CANCELLED'

    ,   FINISHED_STATUS: 'FINISHED'

    ,   IN_PROGRESS_STATUS: 'IN_PROGRESS'

    ,   PENDING_STATUS: 'PENDING'

    ,   deletePreviousActivations: function deletePreviousActivations(domain, subsidiary, location, app_id)
        {
            var result = ExtensionHelperSS2.getActiveExtensionsOfOldWebsite(domain, subsidiary, location, app_id);

            if(result.activation_id)
            {
                _.each(result.extensions, function(extension_id)
                {
                    record.delete({type: 'customrecord_ns_sc_extmech_ext_active', id: extension_id});
                });

                record.delete({type: 'customrecord_ns_sc_extmech_activation', id: result.activation_id});
            }
        }

    ,   createActivation: function createActivation(website_id, domain, subsidiary, location, app_id, user_id)
        {
            var activation_record;
            this.deletePreviousActivations(domain, subsidiary, location, app_id);

            activation_record = record.create({type: 'customrecord_ns_sc_extmech_activation'});
            activation_record.setValue({fieldId: 'custrecord_website_id', value: website_id});
            activation_record.setValue({fieldId: 'custrecord_domain_id', value: domain});
            activation_record.setValue({fieldId: 'custrecord_application_id', value: app_id});
            activation_record.setValue({fieldId: 'custrecord_location_id', value: location});
            activation_record.setValue({fieldId: 'custrecord_subsidiary_id', value: subsidiary});
            activation_record.setValue({fieldId: 'custrecord_activation_user', value: user_id});
            activation_record.setValue({fieldId: 'custrecord_activation_state', value: this.PENDING_STATUS});

            var record_id = activation_record.save({enableSourcing: true});

            return record_id;
        }

    ,   getActivation: function getActivation(website_id, domain, subsidiary, location)
        {
            if(!website_id || !domain)
            {
                throw new Error('Invalid combination of website_id, domain, subsidiary and location');
            }

            var filters = [
                ['custrecord_website_id', search.Operator.IS,  website_id]
            ,   'and'
            ,   ['custrecord_domain_id', search.Operator.IS, domain]
            ];

			  subsidiary = subsidiary === '-' ? null : subsidiary;
			  location = location === '-' ? null : location;

            if(subsidiary)
            {
                filters = filters.concat([
                    'and'
                ,   ['custrecord_subsidiary_id', search.Operator.IS, subsidiary]
                ]);

                if(location)
                {
                    filters = filters.concat([
                        'and'
                    ,   ['custrecord_location_id', search.Operator.IS, location]
                    ]);
                }
            }

            var result = search.create({
                type: 'customrecord_ns_sc_extmech_activation'
            ,   filters: filters
            ,   columns: [
                    'custrecord_activation_state'
                ]
            })
            .run().getRange({start: 0, end: 1});

            if(!result || !result.length)
            {
                return null;
            }

            var activation_record = {
                'id': result[0].id
            ,   'state': result[0].getValue('custrecord_activation_state')
            };

            return activation_record;
        }

    ,   updateActivationState: function updateActivationState(activation_id, new_state, user, app_id, job_id)
        {
            this._validateState(new_state);

            var values = {
                'custrecord_activation_state': new_state
            };

            if(user)
            {
                values.custrecord_activation_user = user;
            }

            if(app_id)
            {
                values.custrecord_application_id = app_id;
            }

            if(job_id)
            {
                values.custrecord_activation_job = job_id;
            }

            record.submitFields({
                type: 'customrecord_ns_sc_extmech_activation'
            ,   id: activation_id
            ,   values: values
            });
        }

    ,   _validateState: function _validateState(activation_state)
        {
            var states = [
                this.ERROR_STATUS
            ,   this.CANCELLED_STATUS
            ,   this.FINISHED_STATUS
            ,   this.IN_PROGRESS_STATUS
            ,   this.PENDING_STATUS
            ];

            if(!_.contains(states, activation_state))
            {
                throw new Error('Invalid activation state: ' + activation_state);
            }
        }
    };

    return activation_helper;
});
