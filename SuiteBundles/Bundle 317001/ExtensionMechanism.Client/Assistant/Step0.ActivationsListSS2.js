/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/ui/dialog'
    ,   '../../third_parties/underscore.js'
    ]
,   function(
        dialog
    )
{
    var client = {

        pageInit: function()
        {
            try
            {
                var state_tpl = '<div><b><%= name %></b>: <span onclick="jQuery(\'#<%= job_name + activation_id %>\').toggle(); var txt = jQuery(this).text(); jQuery(this).text(txt.indexOf(\'more\') !== -1 ? txt.replace(\'more\', \'less\') : txt.replace(\'less\', \'more\'));" style="cursor: pointer; color:<%= color %>"><%= job_state + postfix %></span></div>';
                var state_error_tpl = '<div id="<%= job_name + activation_id %>" style="display: none; overflow: auto; max-height: 150px;"><%= job_errors %></div>';
                var extensions_title_tpl = '<div><b>Extensions</b>: <span onclick="jQuery(\'#extensions\').toggle(); var txt = jQuery(this).text(); jQuery(this).text(txt.indexOf(\'more\') !== -1 ? txt.replace(\'more\', \'less\') : txt.replace(\'less\', \'more\'));" style="cursor: pointer;"><%= postfix %></span></div>';
                var extensions_tpl = '<div id="extensions" style="display: none;"><%= extensions %></div>';

                state_tpl = _.template(state_tpl);
                state_error_tpl = _.template(state_error_tpl);
                extensions_title_tpl = _.template(extensions_title_tpl);
                extensions_tpl = _.template(extensions_tpl);


                jQuery('.showModal').click(function()
                {
                    var activation_id = jQuery(this).attr('data-modal');
                    var jobs_states = jQuery('#' + activation_id).text();
                    jobs_states = JSON.parse(jobs_states);

                    var colors = {
                        'DONE': 'green',
                        'ERROR': 'red',
                        'IN_PROGRESS': 'black',
                        'PENDING': 'black'
                    };

                    var job_map = {
                        ACT_MANIFEST_COMPILER_JOB: 'ACTIVATION MANIFEST'
                    ,   SASS_JOB: 'SASS COPIER'
                    ,   SASS_COMPILER_JOB: 'SASS COMPILER'
                    ,   JAVASCRIPT_JOB: 'JAVASCRIPT'
                    ,   TEMPLATES_JOB: 'TEMPLATES'
                    ,   SSP_LIBRARIES_JOB: 'SSP LIBRARIES'
                    ,   CONFIGURATION_JOB: 'CONFIGURATION'
                    ,   MANIFEST_LOADER_JOB: 'MANIFEST LOADER'
                    ,   IMPACT_CHANGES_JOB: 'IMPACT CHANGES'
                    ,   RESTORE_BACKUP_JOB: 'RESTORE BACKUP'
                    };

                    var states = [];
                    var extensions;
                    _.each(jobs_states, function(job, job_name)
                    {
                        var postfix = job.state === 'ERROR' ? ' (more)' : '';

                        states.push(
                            state_tpl({
                                name: job_map[job_name]
                            ,   job_name: job_name
                            ,   activation_id: activation_id
                            ,   job_state: job.state
                            ,   color: colors[job.state]
                            ,   postfix: postfix
                            })
                        );

                        if(job.errors)
                        {
                            job.errors = job.errors.msg || job.errors;
                            job.errors = _.isString(job.errors) ? job.errors : JSON.stringify(job.errors);

                            states.push(
                                state_error_tpl({
                                    job_name: job_name
                                ,   activation_id: activation_id
                                ,   job_errors: job.errors.trim()
                                })
                            );
                            extensions = job.extensions;
                        }
                    });

                    extensions = _.map(extensions, function (extension){
                        return extension.name;
                    });

                    states.unshift(extensions_tpl({extensions: extensions.join('</br>')}));
                    states.unshift(extensions_title_tpl({postfix: ' (more)'}));

                    dialog.alert({
                        title: 'Activation Log',
                        message: states.join('</br>')
                    });
                });
            }
            catch(error){}
        }

    ,   new_activation: function()
        {
            if(/service_name=STEP_0/.test(window.location.href))
            {
                window.location = window.location.href.replace('STEP_0', 'STEP_1');
                return;
            }

            window.location = window.location.href + '&service_name=STEP_1';
        }

    };

    return function(){
        client.pageInit();
        return client;
    }();
});
