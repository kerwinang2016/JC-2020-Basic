/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    
    var _5038 = {};
    
}


if (!_5038.string) {
    
    _5038.string = {};
    
}


_5038.string.StringFormatter = function StringFormatter(string) {
    
    string = String(string);
    

    this.setString = function setString(newString) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.setString");
        
        string = String(newString);
        
        return this;
        
    };
    

    this.encodeHTML = function encodeHTML() {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.encodeHTML");
        
        string = nlapiEscapeXML(string);
        
        return this;
        
    };
    

    this.decodeHTML = function decodeHTML() {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.decodeHTML");
        
        string = string.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        
        return this;
        
    };
    
    this.escapeJSON = function escapeJSON() {
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.escapeJSON");

        string = string.replace(/[\\]/g, '\\\\')
                       .replace(/[\"]/g, '\\\"')
                       .replace(/[\/]/g, '\\\/')
                       .replace(/[\b]/g, '\\b')
                       .replace(/[\f]/g, '\\f')
                       .replace(/[\n]/g, '\\n')
                       .replace(/[\r]/g, '\\r')
                       .replace(/[\t]/g, '\\t')
                       .replace(/[\u]/g, '\\u');

        return this;
    };
    

    this.hideCardNumbers = function hideCardNumbers(cardNumber) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.hideCardNumbers");
        

        var regex = /([0-9]{12})([0-9]{4})/g;
        
        if (!!cardNumber && (cardNumber.length > 0)) {
            
            regex = new RegExp("(" + cardNumber.substring(0, 12) + ")" + "("

            + cardNumber.substring(12) + ")", "g");
            
        }
        
        string = string.toString().replace(regex, "************$2");
        
        return this;
        
    };
    
    this.hideSecurityCode = function hideSecurityCode(securityCodeNameArray, securityCode) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.hideSecurityCode");
        
        for (var indx = 0; indx < securityCodeNameArray.length; indx++) {
        	var securityCodeRegEx = new RegExp(securityCodeNameArray[indx] + "[\\s\\D\\W]*" + securityCode);
       	 
	       	 var securityCodeSubstrings = string.match(securityCodeRegEx); 
	       	 
	       	 if (securityCodeSubstrings) {
	       		 for (var substringIndx = 0; substringIndx < securityCodeSubstrings.length; substringIndx++) {
	           		 var removedSecurityCodeStr = securityCodeSubstrings[substringIndx].replace(/[0-9]/g, "*");
	           		 string = string.replace(securityCodeSubstrings[substringIndx], removedSecurityCodeStr);
	           	 }
	       	 }
        }
        
        return this;	
        
    };
    

    this.replaceParameters = function replaceParameters(parameters) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.replaceParameters");
        

        for ( var i in parameters) {
            
            var re = new RegExp("\\{" + i + "\\}", "g");
            
            string = string.replace(re, parameters[i]);
            
        }
        

        return this;
        
    };
    

    this.getPadString = function getPadString(minLength, character) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.getPadString");
        

        var remainingLength = parseInt(minLength, 10) - string.length;
        

        return remainingLength > 0 ? new Array(remainingLength + 1)

        .join(character || " ") : "";
        
    };
    

    this.padLeft = function padLeft(minLength, character) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.padLeft");
        

        string = this.getPadString(minLength, character) + string;
        
        return this;
        
    };
    

    this.padRight = function pad(minLength, character) {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.padRight");
        

        string = string + this.getPadString(minLength, character);
        
        return this;
        
    };
    

    this.encodeURI = function stringFormatterEncodeURI() {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.encodeURI");
        
        string = encodeURI(string);
        
        return this;
        
    };
    

    this.toString = function toString() {
        
        _5038.stacktrace.StackTrace.addLogEntry("_5038.string.StringFormatter.toString");
        

        return string;
        
    };
    

    this.stringify = function stringify(object) {
        
        string = JSON.stringify(object);
        
        return this;
        
    };
    

    this.formatToCents = function formatToCents(amount) {
        
        var amt = new Number(amount);
        

        if (isNaN(amt)) {
            
            amt = "0";
            
        } else {
            
            amt = new String(amt.toFixed(2));
            
            amt = amt.replace(/\D/, "");
            
        }
        

        return amt;
        
    };
    
    this.removePrecedingZero = function removePrecedingZero(amount){
        var amt = new Number(amount);
        
        if (isNaN(amt)) {
            amt = "0";
        } else {
            amt = new String(amt);
            amt = parseInt(amt, 10);
        }
        return amt;
    };
    
   this.formatTruncateDecimal = function formatTruncateDecimal(amount) {
        var amt = new Number(amount);
        
        if (isNaN(amt)) {
            amt = "0";
        } else {
            amt = new String(amt.toFixed(0));
        }

        return amt;
        
    };

    return this;
    
};