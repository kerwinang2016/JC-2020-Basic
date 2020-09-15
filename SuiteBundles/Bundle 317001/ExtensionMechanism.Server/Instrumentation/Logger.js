/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        'N/internal/elasticLogger'
    ,   'N/log'
    ]
,   function(
        loggerFactory
    ,   log
    )
{

    var logger = {

        app_types: {
            'SCA': loggerFactory.Type.SCA
        ,   'SCS': loggerFactory.Type.SCS
        ,   'SCIS': loggerFactory.Type.SCIS
        ,   'SCEM': loggerFactory.Type.SCEM
        }

    ,   logData: function(data)
        {
            var i
            ,   logger
            ,   application_type = this.app_types[data.type];

            log.debug({title: 'SCEM Instrumentation', details: data});

            logger = loggerFactory.create({
                'type': application_type
            });

            data.info = data.info || [];
            for (i = 0; i < data.info.length; i++)
            {
                logger.info(data.info[i]);
            }

            data.error = data.error || [];
            for (i = 0; i < data.error.length; i++)
            {
                logger.error(data.error[i]);
            }
        }
    };

    return logger;

});
