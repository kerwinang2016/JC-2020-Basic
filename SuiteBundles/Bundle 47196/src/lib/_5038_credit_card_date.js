/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.creditcard) {
    _5038.creditcard = {};
}

_5038.creditcard.CreditCardDate = function(input) {
    var creditCardDate = input;
    var month = null;
    var year = null;
    processDate(creditCardDate);
    
    function processDate(value) {
        if (!value) {
            month = null;
            year = null;
        } else {
            var valueArray = value.split("/");
            month = parseInt(valueArray[0], 10);
            year = parseInt(valueArray[1], 10);
        }
    }
    
    function getMonth() {
        return month;
    }
    
    function getYear() {
        return year;
    }
    
    function getFullValue() {
        return creditCardDate;
    }
    
    this.getMonth = getMonth;
    this.getYear = getYear;
    this.getFullValue = getFullValue;
    
    
    return this;
};
