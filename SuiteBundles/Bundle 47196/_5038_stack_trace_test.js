/**
 * Module Description
 * 
 * Version Date Author Remarks
 * 
 * 1.00 12 Sep 2013 aalcabasa
 * 
 */
testSuite = {
    suiteName: '_5038.stacktrace.StackTrace Test',
    
    dependencies: [{
        parentFolder: "../../../vendor",
        fileSet: "sinon.js"
    }, {
        parentFolder: "../../../../src/lib",
        fileSet: ["_5038_stacktrace.js", "constants.js"].join()
    }],
    
    setUp: function() {
        var scope = this.scope;
        scope.stubbedFunctions = [];
        

        nlapiLogExecution = sinon.stub();
        
    },
    
    tearDown: function() {
        var scope = this.scope;
        for ( var i = 0; i < scope.stubbedFunctions.length; i++) {
            scope.stubbedFunctions[i].restore();
        }
    },
    
    "test logAndShowError / standard error / error code should be PAYMENT GATEWAY ERROR": function() {
        jsUnity.assertions.assertException(function() {
            _5038.stacktrace.StackTrace.logAndShowError({}, nlobjError);
        });
        
        sinon.assert
            .calledWith(nlapiLogExecution, "SYSTEM", "PAYMENT GATEWAY ERROR");
    },
    
    "test logAndShowError / Netsuite error / error code should be PAYMENT GATEWAY ERROR": function() {
        jsUnity.assertions.assertException(function() {
            _5038.stacktrace.StackTrace
                .logAndShowError(nlapiCreateError("test"), nlobjError);
        });
        
        sinon.assert
            .calledWith(nlapiLogExecution, "SYSTEM", "PAYMENT GATEWAY ERROR");
    }

};
