/**
 *@NApiVersion 2.x
 */
define(
	[
		'N/util'
    ,   'N/error'
    ,   '../../third_parties/underscore.js'
	]
,	function(
		util
    ,   error_module
	)
	{
		var map_reduce_error_helper = {

			_handleErrorInStage: function _handleErrorInStage(summary)
            {
                var errors = {};
                if(summary.errors)
                {
                    summary.errors.iterator().each(function(key, value)
                    {
                        var error = JSON.parse(value);
                        //chek if is a job_id number to handle this
                        if(parseInt(error.name))
                        {
                            errors[error.name] = error;
                        }
                        return true;
                    });
                }
                return errors;
            }

        ,   handleErrors: function handleErrors(summary_context)
            {
                var mapSummary = summary_context.mapSummary
                ,   reduceSummary = summary_context.reduceSummary;

                var map_errors = this._handleErrorInStage(mapSummary)
                ,   reduce_errors = this._handleErrorInStage(reduceSummary);

                var result = {};
                util.extend(result, map_errors);
                util.extend(result, reduce_errors);

                return result;
            }

        ,   getErrorMessage: function getErrorMessage(job_id, error)
            {
                var error_message = error || 'Unexpected Error';

                if(error.message && error.stack)
                {
                    error_message = {
                        message: error.message
                    ,   stack: error.stack
                    ,   name: job_id
                    };

                    if(error.data)
                    {
                        error_message.data = error.data;
                    }
                }

                return error_message;
            }

        ,   throwError: function throwError(job_id, error)
            {
                var error_message = this.getErrorMessage(job_id, error);

                throw _.isObject(error_message) ? error_message : error_module.create({name: job_id, message: error_message});
            }

		};

		return map_reduce_error_helper;
	}
);
