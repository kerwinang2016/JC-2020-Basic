/**
 * @NApiVersion 2.x
 */

/**
 * This helper is meant to be used on every server side error try catch we have.
 * By default will log the error and sent you a json object with the error details for you to sent it as response
 * The ideal error sent should have: 
    { 
        code: 'CODE_OF_THE_ERROR', //let's use WEBSITE_API_ERROR, FILE_API_ERROR, EXTENSION_API_ERROR, EXTMECH_INSTALL_SCRIPT, EXTMECH_BACKUP_CLEANER, SASS_COMPILER_ERROR,ASSISTANT_VIEW_STEP_1,2,3_ERROR, MANAGER_VIEW_ERROR 
        line: 'File.js/methodName', 
        description: 'actual error code here...', 
        workaround: (optional) simple recommendation or things the user can check, if you have it please send it.' 
        error: error object as it comes from netsuite, the handler will format it
    }

 * For backward compatibility it supports the following format (an error from netsuite)
 * {
        cause: cause,
        message: message,
        details: details,
        name: name,
        code: code
    }

* if throw_error is sent to true it will return an error formated using N/error module with title and message
*/

define(
    [
        'N/log'
    ,   'N/error'
    ]
,   function(
        log
    ,   error_module
    )
{
    function handleError(e, throw_error)
    {
        var error,
            error_obj;

        //new format
        if(e.error) {
            var stack = e.error.stack ? e.error.stack : '',
                stack_message = stack && stack.join ? stack.join('\n') : stack;

            error_obj = {
                title : e.code + ' : ' + e.error.name,
                details : 'Error on ' + e.line + '.\nDetails:\n' +
                        (e.error.message || '') + '\n' + (e.description || '') + '\n' + (e.workaround || '') +
                        '\nStacktrace:\n' + stack_message
            };

            log.error(error_obj);

        } else {
           error = e.cause || e;
           log.error(error);
        }

        var result = {
            header : {
                status : {
                    code : 'ERROR'
                },
                message: error_obj ? error_obj.details : (error.message || error.details || 'Unexpected Error'),
                extra_data: e.data || {},
                error_code: error_obj ? error_obj.title : (error.name || error.code || 'Unexpected Error')  
            }
        };

        if(throw_error) {
            
            return error_module.create({
                name: result.header.error_code,
                message: result.header.message
            });

        } else {
            return result;
        }
    }

    return {
        handleError : handleError,
    };

});