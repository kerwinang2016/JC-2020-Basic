if (typeof console === 'undefined') {
    console = {};
}

(function ()
{
    'use strict';

    // Pass these methods through to the console if they exist, otherwise just
    // fail gracefully. These methods are provided for convenience.
    var console_methods = 'assert clear count debug dir dirxml exception group groupCollapsed groupEnd info log profile profileEnd table time timeEnd trace warn'.split(' ')
        ,	idx = console_methods.length
        ,	noop = function(){};

    while (--idx >= 0)
    {
        var method = console_methods[idx];

        if (typeof console[method] === 'undefined')
        {
            console[method] = noop;
        }
    }

    if (typeof console.memory === 'undefined')
    {
        console.memory = {};
    }

    _.each({'log': 'DEBUG', 'info': 'AUDIT', 'error': 'EMERGENCY', 'warn': 'ERROR'}, function (value, key)
    {
        console[key] = function ()
        {
            nlapiLogExecution(value, arguments.length > 1 ? arguments[0] : '', arguments.length > 1 ? arguments[1] : arguments[0] || 'null' );
        };
    });

    _.extend(console, {

        timeEntries: []

        ,	time: function (text)
        {
            if (typeof text === 'string')
            {
                console.timeEntries[text] = Date.now();
            }
        }

        ,	timeEnd: function (text)
        {
            if (typeof text === 'string')
            {
                if (!arguments.length)
                {
                    console.warn('TypeError:', 'Not enough arguments');
                }
                else
                {
                    if (typeof console.timeEntries[text] !== 'undefined')
                    {
                        console.log(text + ':', Date.now() - console.timeEntries[text] + 'ms');
                        delete console.timeEntries[text];
                    }
                }
            }
        }
    });
}());