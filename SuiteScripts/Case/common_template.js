/*
/* ------------------------------------------
 * ------------ LOGGING UTILITIES -----------
 * ------------------------------------------ */
/** Main logging class.
 * @constructor
 * @description Use this class to to log events in your code.
 * @param {boolean} [isClient=false] - Set to true if used for Client Side Scripts, false if used for Server Side Scripts. Defaults to false;
 * @returns {Log} log - A Log object for debugging and logging purposes.
 */

function Logger(isClient) {
	if (isClient && typeof isClient === 'boolean')
		this.isClient = true;
	else
		this.isClient = false;

	/**
	 * Method to invoke a debug type of log.
	 * @param {String} title - The title for the log.
	 * @param {String} [details] - The details for the log.
	 * @throws {nlobjError} O1_MISSING_REQD_ARGMENT - When the title is missing.
	 */
	this.debug = function (title, details) {
		if (this.isClient)
			alert(title + '. ' + details);
		else
			(StringUtils.isEmpty(title)) ? this.titleError : nlapiLogExecution('DEBUG', title, details);
	};

	/**
	 * Method to invoke an audit type of log.
	 * @param {String} title - The title for the log.
	 * @param {String} [details] - The details for the log.
	 * @throws {nlobjError} O1_MISSING_REQD_ARGMENT - When the title is missing.
	 */
	this.audit = function (title, details) {
		if (this.isClient == false)
			(StringUtils.isEmpty(title)) ? this.titleError : nlapiLogExecution('AUDIT', title, details);
		else
			alert(title + '. ' + details);
	};

	/**
	 * Method to invoke an error type of log.
	 * @param {String} title - The title for the log.
	 * @param {String} [details] - The details for the log.
	 * @throws {nlobjError} O1_MISSING_REQD_ARGMENT - When the title is missing.
	 */
	this.error = function (title, details) {
		if (this.isClient == false)
			(StringUtils.isEmpty(title)) ? this.titleError : nlapiLogExecution('ERROR', title, details);
		else
			alert(title + '. ' + details);
	};

	/**
	 * Method to throw O1_MISSING_REQD_ARGMENT when the title of the log is missing.
	 * @private
	 */
	this.titleError = function () {
		throw nlapiCreateError('O1_MISSING_REQD_ARGMENT', 'Missing title on nlapiLogExecution call.', true);
	};
};

/**
 * Log the error and email it to the specified recipients.
 * @description Helper function to add an entry of an error and its details on the execution log when
 * a Server Side script is used or pop-up an alert box containing the error message when a Client Side
 * Script is used. This will also send an email about the error and its details to the specified recipients.
 * @param {string} OnlineOne_Error_Message - The error message.
 * @param {nlobjError|Error} Error - An nlobjError object if a NetSuite error occurs; Error if a JavaScript error occurs.
 */

function logEmailError(errorMessage, err) {

	var errorDetails = '';

	if (!ObjectUtils.isEmpty(err) && (err instanceof nlobjError || typeof err === nlobjError)) {
		errorDetails = '\n' + 'Error:' + err.getCode() + '\n';
		errorDetails += 'Error Reference:' + err.getId() + '\n';
		errorDetails += 'Error Details:' + err.getDetails() + '\n\n';
		errorDetails += 'Stack Trace:' + err.getStackTrace() + '\n';
	} else if (!ObjectUtils.isEmpty(err) && (!(err instanceof nlobjError || typeof err === nlobjError))) {
		/* NetSuite uses Mozilla Rhino. The error object has other properties. */
		errorDetails = '\n' + 'Error:' + err.name + '\n';
		errorDetails += 'Error Details:' + err.message + '\n\n';
		errorDetails += 'Stack Trace:' + err.stack + '\n';
	}

	//Log the error on the execution log/show a pop-up box with the error message.
	log.error('ERROR_NOTIFICATION', errorMessage + ".  " + errorDetails);

	try {
		var body = "Account: " + context.getCompany() + "\n";
		body += "Client: " + CLIENT_NAME + "\n";
		body += "Environment: " + context.getEnvironment() + "\n";
		body += "Execution Context: " + context.getExecutionContext() + "\n";
		body += "Date and Time: " + DateTimeZoneUtils.getCurrentDateTimeText('10', 'datetimetz') + "\n";
		body += "User: " + context.getUser() + ' ' + context.getName() + "\n";
		body += "User Role: " + context.getRole() + "\n";
		body += "NetSuite Version: " + context.getVersion() + "\n";
		body += "Script: " + SCRIPT_NAME + "\n";
		body += "Deployment ID: " + context.getDeploymentId() + "\n";
		body += "Script File: " + SCRIPT_FILE_NAME + "\n\n";
		body += "Error Details: " + errorMessage + "." + errorDetails + "\n";

		//Send the email
		nlapiSendEmail(FROM_EMAIL, TO_EMAIL, "Error Notification", body, CC_EMAILS, null, null, null);
	} catch (e) {
		//Log Error and Continue
		var errorMessage = "Error sending email";
		var errorDetails = '';

		if (!ObjectUtils.isEmpty(e) && e instanceof nlobjError) {
			errorDetails = '\n' + 'Error:' + e.getCode() + '\n';
			errorDetails += 'Error Reference:' + e.getId() + '\n';
			errorDetails += 'Error Details:' + e.getDetails() + '\n\n';
			errorDetails += 'Stack Trace:' + e.getStackTrace() + '\n';
		} else if (!ObjectUtils.isEmpty(e)) {
			/* NetSuite uses Mozilla Rhino. The error object has other properties. */
			errorDetails = '\n' + 'Error:' + e.name + '\n';
			errorDetails += 'Error Details:' + e.message + '\n\n';
			errorDetails += 'Stack Trace:' + e.stack + '\n';
		}

		nlapiLogExecution("ERROR", "Error Notification", errorMessage + ".  " + errorDetails);
	}

}

/* ------------------------------------------
 * ------------ STRING UTILITIES -----------
 * ------------------------------------------ */

/**
 * Character
 */
var Character = {

	/**
	 * Returns true if character c is a whitespace character
	 *
	 * @param {Object} c
	 */
	isWhitespace: function (c) {
		var whitespaceChars = " \t\n\v\f\r\u001C\u001D\u001E\u001F";
		return (whitespaceChars.indexOf(c) !== StringUtils.INDEX_NOT_FOUND);
	}

};

/**
 * StringBuilder class for JavaScript. Cuts away all temporary strings in
 * String concatenation.
 *
 * Use it the way you would use a Java StringBuilder.
 *
 * var sb = new StringBuilder("ABC");
 * sb.append("DEF");
 * alert(sb.toString());
 *
 * @param {Object} s the initial string
 */

function StringBuilder(s) {
	this.buffer = [];
	if (typeof s != undefined) {
		this.buffer.push(s);
	}
};

/**
 * Append an item to the String
 *
 * @param {Object} str
 */
StringBuilder.prototype.append = function (str) {
	this.buffer.push(str);
};

/**
 * Returns the string
 */
StringBuilder.prototype.toString = function () {
	return this.buffer.join("");
};

/**
 * String Utilities
 */
var StringUtils = {
	//-------------------------------------------------------------------------
	// CONSTANTS
	/**
	 * Empty String object
	 */
	EMPTY: "",

	/**
	 * Failed index search
	 */
	INDEX_NOT_FOUND: -1,

	//-------------------------------------------------------------------------
	// BLANK/EMPTY
	/**
	 * Returns true if the str is undefined, null, or
	 * has a length of 0
	 *
	 * @param {Object} str
	 */
	isEmpty: function (str) {
		return ((str == null) || (str.length === 0) || (str == '') || (typeof str === undefined));
	},

	/**
	 * Returns true if str is not empty
	 *
	 * @param {Object} str
	 */
	isNotEmpty: function (str) {
		return !StringUtils.isEmpty(str);
	},

	/**
	 * Returns true if str is empty or only contains
	 * whitespace chars
	 *
	 * @param {Object} str
	 */
	isBlank: function (str) {
		var i, // counter
			strLen; // the str length
		if ((str == null) || ((strLen = str.length) === 0)) {
			return true;
		}
		for (i = 0; i < strLen; i++) {
			if (!Character.isWhitespace(str.charAt(i))) {
				return false;
			}
		}
		return true;
	},

	/**
	 * Returns true if str is not blank
	 *
	 * @param {Object} str
	 */
	isNotBlank: function (str) {
		return !StringUtils.isBlank(str);
	},

	//-------------------------------------------------------------------------
	// TRIMMING
	/**
	 * Remove whitespace chars from beginning and end
	 * of str
	 *
	 * @param {Object} str
	 */
	trim: function (str) {
		return (str == null) ? null : str.replace(/^\s+|\s+$/g, "");
	},

	/**
	 * Remove whitespace chars from the beginning of str
	 *
	 * @param {Object} str
	 */
	ltrim: function (str) {
		return (str == null) ? null : str.replace(/^\s+/, "");
	},

	/**
	 * Remove whitespace chars from the end of str
	 *
	 * @param {Object} str
	 */
	rtrim: function (str) {
		return (str == null) ? null : str.replace(/\s+$/, "");
	},

	/**
	 * Returns null if the trimmed string is empty.
	 *
	 * @see StringUtils.isEmpty
	 * @param {Object} str
	 */
	trimToNull: function (str) {
		var ts = StringUtils.trim(str);
		return StringUtils.isEmpty(ts) ? null : ts;
	},

	/**
	 * Returns null if the trimmed string is empty.
	 *
	 * @see StringUtils.isEmpty
	 * @param {Object} str
	 */
	trimToEmpty: function (str) {
		return ((str == null) ? StringUtils.EMPTY : StringUtils.trim(str));
	},

	//-------------------------------------------------------------------------
	// STRIPPING (no, not at joints)
	/**
	 * Strips the characters specified in stripChars from the start
	 * of str. If stripChars is not specified, whitespaces are removed.
	 *
	 * If str is null, the return is null too.
	 *
	 * @param {Object} str
	 * @param {Object} stripChars
	 */
	stripStart: function (str, stripChars) {
		var strLen;
		if ((str == null) || ((strLen = str.length) === 0)) {
			return str;
		}
		var start = 0;
		if (stripChars == null) {
			while ((start !== strLen) && Character.isWhitespace(str.charAt(start))) {
				start++;
			}
		} else if (stripChars.length === 0) {
			return str;
		} else {
			while ((start !== strLen) && (stripChars.indexOf(str.charAt(start)) !== -1)) {
				start++;
			}
		}
		return str.substring(start);
	},

	/**
	 * Strips the characters specified in stripChars from the end
	 * of str. If stripChars is not specified, whitespaces are removed.
	 *
	 * If str is null, the return is null too.
	 *
	 * @param {Object} str
	 * @param {Object} stripChars
	 */
	stripEnd: function (str, stripChars) {
		var end;
		if ((str == null) || ((end = str.length) === 0)) {
			return str;
		}

		if (stripChars == null) {
			while ((end !== 0) && Character.isWhitespace(str.charAt(end - 1))) {
				end--;
			}
		} else if (stripChars.length === 0) {
			return str;
		} else {
			while ((end !== 0) && (stripChars.indexOf(str.charAt(end - 1)) !== -1)) {
				end--;
			}
		}
		return str.substring(0, end);
	},

	/**
	 * Strip the specified characters in stripChars from the start
	 * and end of str
	 *
	 * @param {Object} str
	 * @param {Object} stripChars
	 */
	strip: function (str, stripChars) {
		if (StringUtils.isEmpty(str)) {
			return str;
		}
		str = StringUtils.stripStart(str, stripChars);
		return StringUtils.stripEnd(str, stripChars);
	},

	/**
	 * Similar to trimToNull, but stripping whitechars.
	 *
	 * @param {Object} str
	 */
	stripToNull: function (str, stripChars) {
		if (str == null) {
			return null;
		}
		str = StringUtils.strip(str, stripChars);
		return (str.length === 0) ? null : str;
	},

	/**
	 * Similar to trimToEmpty.
	 *
	 * @param {Object} str
	 */
	stripToEmpty: function (str, stripChars) {
		return (str == null) ? StringUtils.EMPTY : StringUtils.strip(str, stripChars);
	},


	//-------------------------------------------------------------------------
	// INDEX OF
	/**
	 * Finds the index of the ord-th occurrence of searchStr
	 * within str.
	 *
	 * @param {Object} str
	 * @param {Object} searchStr
	 * @param {Object} ord
	 */
	ordinalIndexOf: function (str, searchStr, ord) {
		if (str == null || searchStr == null || ord <= 0) {
			return StringUtils.INDEX_NOT_FOUND;
		}
		if (searchStr.length === 0) {
			return 0;
		}
		var found = 0;
		var index = StringUtils.INDEX_NOT_FOUND;
		do {
			index = str.indexOf(searchStr, index + 1);
			if (index < 0) {
				return index;
			}
			found++;
		} while (found < ord);
		return index;
	},


	//-------------------------------------------------------------------------
	// CONTAINS
	/**
	 * Returns true if str contains searchStr, false if otherwise.
	 *
	 * @param {Object} str
	 * @param {Object} searchStr
	 */
	contains: function (str, searchStr) {
		if (str == null || searchStr == null) {
			return false;
		}
		return str.indexOf(searchStr) >= 0;
	},

	/**
	 * Just like contains, but ignoring case
	 *
	 * @param {Object} str
	 * @param {Object} searchStr
	 */
	containsIgnoreCase: function (str, searchStr) {
		if (str == null || searchStr == null) {
			return false;
		}
		return StringUtils.contains(str.toLocaleUpperCase(), searchStr.toLocaleUpperCase());
	},

	//-------------------------------------------------------------------------
	// LEFT/RIGHT/MID
	/**
	 * Gets the leftmost len characters of a String.
	 *
	 * @param {Object} str
	 * @param {Object} len
	 */
	left: function (str, len) {
		if (str == null) {
			return null;
		}
		if (len <= 0) {
			return StringUtils.EMPTY;
		}
		if (str.length <= len) {
			return str;
		} else {
			return str.substring(0, len);
		}
	},

	/**
	 * Gets the rightmost len characters of a String.
	 *
	 * @param {Object} str
	 * @param {Object} len
	 */
	right: function (str, len) {
		if (str == null) {
			return null;
		}
		if (len <= 0) {
			return StringUtils.EMPTY;
		}
		if (str.length <= len) {
			return str;
		} else {
			return str.substring(str.length - len);
		}
	},

	/**
	 * Gets len characters from the middle of a String.
	 *
	 * @param {Object} str
	 * @param {Object} pos
	 * @param {Object} len
	 */
	mid: function (str, pos, len) {
		if (str == null) {
			return null;
		}
		if (len < 0 || pos > str.length) {
			return StringUtils.EMPTY;
		}
		if (pos < 0) {
			pos = 0;
		}
		if (str.length <= (pos + len)) {
			return str.substring(pos);
		} else {
			return str.substring(pos, pos + len);
		}
	},

	//-----------------------------------------------------------------------
	// SUBSTRINGS
	/**
	 * Gets the substring before the first occurrence of a sep.
	 * The sep is not returned. If sep is null, str is returned.
	 * (Before null, there's the whole string itself).
	 *
	 * @param {Object} str
	 * @param {Object} sep
	 */
	substringBefore: function (str, sep) {
		if (StringUtils.isEmpty(str) || (sep == null)) {
			return str;
		}
		if (sep.length === 0) {
			return StringUtils.EMPTY;
		}
		var pos = str.indexOf(sep);
		if (pos === -1) {
			return str;
		}
		return str.substring(0, pos);
	},

	/**
	 * Gets the substring after the first occurrence of a sep.
	 * The sep is not returned. If sep is null, StringUtils.EMPTY
	 * is returned. After null there's nothing.
	 *
	 * @param {Object} str
	 * @param {Object} sep
	 */
	substringAfter: function (str, sep) {
		if (StringUtils.isEmpty(str)) {
			return str;
		}
		if (sep == null) {
			return StringUtils.EMPTY;
		}
		var pos = str.indexOf(sep);
		if (pos === -1) {
			return StringUtils.EMPTY;
		}
		return str.substring(pos + sep.length);
	},

	/**
	 * Gets the substring before the last occurrence of a sep.
	 * The sep is not returned.
	 *
	 * @param {Object} str
	 * @param {Object} sep
	 */
	substringBeforeLast: function (str, sep) {
		if (StringUtils.isEmpty(str) || StringUtils.isEmpty(sep)) {
			return str;
		}
		var pos = str.lastIndexOf(sep);
		if (pos === -1) {
			return str;
		}
		return str.substring(0, pos);
	},

	/**
	 * Gets the substring after the last occurrence of a sep.
	 * The sep is not returned.
	 *
	 * @param {Object} str
	 * @param {Object} sep
	 */
	substringAfterLast: function (str, sep) {
		if (StringUtils.isEmpty(str)) {
			return str;
		}
		if (StringUtils.isEmpty(sep)) {
			return StringUtils.EMPTY;
		}
		var pos = str.lastIndexOf(sep);
		if (pos === -1 || pos === (str.length - sep.length)) {
			return StringUtils.EMPTY;
		}
		return str.substring(pos + sep.length);
	},

	//-----------------------------------------------------------------------
	// SUBSTRING BETWEEN
	/**
	 * Gets the String that is nested in between two instances of the
	 * same String.
	 *
	 * @param {Object} str
	 * @param {Object} tag
	 */
	substringBetween: function (str, tag) {
		return StringUtils.substringBetweenStrings(str, tag, tag);
	},

	/**
	 * Gets the String that is nested in between two Strings.
	 * Only the first match is returned.
	 *
	 * @param {Object} str
	 * @param {Object} open
	 * @param {Object} close
	 */
	substringBetweenStrings: function (str, open, close) {
		if (str == null || open == null || close == null) {
			return null;
		}
		var start = str.indexOf(open);
		if (start !== -1) {
			var end = str.indexOf(close, start + open.length);
			if (end !== -1) {
				return str.substring(start + open.length, end);
			}
		}
		return null;
	},

	/**
	 * Searches a String for substrings delimited by a start and end tag,
	 * returning all matching substrings in an array.
	 *
	 * @param {Object} str
	 * @param {Object} open
	 * @param {Object} close
	 */
	substringsBetweenStrings: function (str, open, close) {
		if (str == null || StringUtils.isEmpty(open) || StringUtils.isEmpty(close)) {
			return null;
		}
		var strLen = str.length;
		if (strLen === 0) {
			return [];
		}
		var closeLen = close.length;
		var openLen = open.length;
		var list = [];
		var pos = 0;
		while (pos < (strLen - closeLen)) {
			var start = str.indexOf(open, pos);
			if (start < 0) {
				break;
			}
			start += openLen;
			var end = str.indexOf(close, start);
			if (end < 0) {
				break;
			}
			list.push(str.substring(start, end));
			pos = end + closeLen;
		}
		if (list.length > 0) {
			return list;
		} else {
			return null;
		}
	},

	//-----------------------------------------------------------------------
	// CHOMPING
	/**
	 * Removes one newline from end of a String if it's there,
	 * otherwise leave it alone.
	 *
	 * @param {Object} str
	 */
	chomp: function (str) {
		var cr = '\r';
		var lf = '\n';
		if (StringUtils.isEmpty(str)) {
			return str;
		}

		if (str.length === 1) {
			var ch = str.charAt(0);
			if (ch === cr || ch === lf) {
				return StringUtils.EMPTY;
			} else {
				return str;
			}
		}

		var lastIdx = str.length - 1;
		var last = str.charAt(lastIdx);

		if (last === lf) {
			if (str.charAt(lastIdx - 1) === cr) {
				lastIdx--;
			}
		} else if (last !== cr) {
			lastIdx++;
		}
		return str.substring(0, lastIdx);
	},

	/**
	 * Removes sep from the end of str if it's there,
	 * otherwise leave it alone.
	 *
	 * @param str  the String to chomp from, may be null
	 * @param sep  separator String, may be null
	 * @return String without trailing sep, null if null String input
	 */
	chompSeparator: function (str, sep) {
		if (StringUtils.isEmpty(str) || sep == null) {
			return str;
		}
		if (StringUtils.endsWith(str, sep)) {
			return str.substring(0, str.length - sep.length);
		}
		return str;
	},

	//-----------------------------------------------------------------------
	// STARTS ENDS WITH
	/**
	 * Check whether str starts with prefix, starting from
	 * the offset.
	 *
	 * @param {Object} str
	 * @param {Object} prefix
	 * @param {Object} toffset
	 */
	startsWithOffset: function (str, prefix, toffset) {
		var to = toffset;
		var po = 0;
		var pc = prefix.length;
		// a null string can't start with anything
		if (str == null) {
			return false;
		}
		if ((toffset < 0) || (toffset > str.length - pc)) {
			return false;
		}
		while (--pc >= 0) {
			if (str.charAt(to++) !== prefix.charAt(po++)) {
				return false;
			}
		}
		return true;
	},

	/**
	 * Returns true if str starts with prefix
	 *
	 * @param {Object} str
	 * @param {Object} prefix
	 */
	startsWith: function (str, prefix) {
		return StringUtils.startsWithOffset(str, prefix, 0);
	},

	/**
	 * Returns true if str ends with prefix.
	 *
	 * @param {Object} str
	 * @param {Object} suffix
	 */
	endsWith: function (str, suffix) {
		if (str == null || suffix == null) {
			return false;
		}
		return StringUtils.startsWithOffset(str, suffix, str.length - suffix.length);
	},

	//-----------------------------------------------------------------------
	// CHOP
	/**
	 * Remove the last character from a String.
	 *
	 * @param {Object} str
	 */
	chop: function (str) {
		var cr = '\r';
		var lf = '\n';

		if (str == null) {
			return null;
		}
		var strLen = str.length;
		if (strLen < 2) {
			return StringUtils.EMPTY;
		}
		var lastIdx = strLen - 1;
		var ret = str.substring(0, lastIdx);
		var last = str.charAt(lastIdx);
		if (last === lf) {
			if (ret.charAt(lastIdx - 1) === cr) {
				return ret.substring(0, lastIdx - 1);
			}
		}
		return ret;
	},

	//-----------------------------------------------------------------------
	// ABBREVIATE
	abbreviateOffset: function (str, offset, maxWidth) {
		if (str == null) {
			return null;
		}
		if (maxWidth < 4) {
			throw new Error("Minimum abbreviation width is 4");
		}
		if (str.length <= maxWidth) {
			return str;
		}
		if (offset > str.length) {
			offset = str.length;
		}
		if ((str.length - offset) < (maxWidth - 3)) {
			offset = str.length - (maxWidth - 3);
		}
		if (offset <= 4) {
			return str.substring(0, maxWidth - 3) + "...";
		}
		if (maxWidth < 7) {
			throw new Error("Minimum abbreviation width with offset is 7");
		}
		if ((offset + (maxWidth - 3)) < str.length) {
			return "..." + abbreviate(str.substring(offset), maxWidth - 3);
		}
		return "..." + str.substring(str.length - (maxWidth - 3));
	},

	abbreviate: function (str, maxWidth) {
		return abbreviateOffset(str, 0, maxWidth);
	},

	//-----------------------------------------------------------------------
	// DIFFERENCE
	/**
	 * Compares two Strings, and returns the portion where they differ.
	 * (The portion of str2, that is).
	 *
	 * @param {Object} str1
	 * @param {Object} str2
	 */
	difference: function (str1, str2) {
		if (str1 == null) {
			return str2;
		}
		if (str2 == null) {
			return str1;
		}
		var at = StringUtils.indexOfDifference(str1, str2);
		if (at === -1) {
			return StringUtils.EMPTY;
		}
		return str2.substring(at);
	},

	/**
	 * Compares two Strings, and returns the index at which the
	 * Strings begin to differ. If one of them is null, return 0
	 * (that is, no string is the same as null unless it is null too).
	 *
	 * @param {Object} str1
	 * @param {Object} str2
	 */
	indexOfDifference: function (str1, str2) {
		if (str1 == str2) {
			return StringUtils.INDEX_NOT_FOUND;
		}
		if (str1 == null || str2 == null) {
			return 0;
		}
		var i;
		for (i = 0; i < str1.length && i < str2.length; ++i) {
			if (str1.charAt(i) !== str2.charAt(i)) {
				// we don't return i at this point because
				// one of the strings may be empty
				break;
			}
		}
		if (i < str2.length || i < str1.length) {
			return i;
		}
		return StringUtils.INDEX_NOT_FOUND;
	},

	//-----------------------------------------------------------------------
	// DEFAULTS
	/**
	 * Returns either the passed in String, or if the String is
	 * null, the value of defaultStr (and if defaultStr is null,
	 * returns empty).
	 *
	 * @param {Object} str
	 * @param {Object} defaultStr
	 */
	defaultString: function (str, defaultStr) {
		if (typeof defaultStr == "undefined") {
			defaultStr = StringUtils.EMPTY;
		}
		return (str == null) ? defaultStr : str;
	},

	/**
	 * Returns either the passed in String, or if the String is
	 * empty or null, the value of defaultStr.
	 *
	 * @param {Object} str
	 * @param {Object} defaultStr
	 */
	defaultIfEmpty: function (str, defaultStr) {
		return StringUtils.isEmpty(str) ? defaultStr : str;
	},

	//-----------------------------------------------------------------------
	// REVERSE
	reverse: function (str) {
		if (StringUtils.isEmpty(str) || str.length === 1) {
			return str;
		}
		var sb = new StringBuilder();
		var i;
		for (i = str.length - 1; i >= 0; i--) {
			sb.append(str.charAt(i));
		}
		return sb.toString();
	},

	reverseDelimited: function (str, sepChars) {
		if (StringUtils.isEmpty(str) || str.length === 1) {
			return str;
		}
		var tokens = str.split(sepChars);
		tokens.reverse();
		return tokens.join(sepChars);
	},

	//-----------------------------------------------------------------------
	// COUNT MATCHES
	countMatches: function (str, sub) {
		if (StringUtils.isEmpty(str) || StringUtils.isEmpty(sub)) {
			return 0;
		}
		var count = 0;
		var idx = 0;
		while ((idx = str.indexOf(sub, idx)) != -1) {
			count++;
			idx += sub.length;
		}
		return count;
	}
};

/* ------------------------------------------
 * ------------ OBJECT UTILITIES -----------
 * ------------------------------------------ */

var ObjectUtils = {
	/**
	 * Returns true if the object is undefined, null, empty, or
	 * has a length of 0
	 * @param {Object} obj
	 */
	isEmpty: function (obj) {
		return ((obj == null) || (obj == '') || (typeof obj === undefined));
	},

	/**
	 * Returns true if the object is not empty
	 * @param {Object} obj
	 */
	isNotEmpty: function (obj) {
		return !ObjectUtils.isEmpty(obj);
	}
};

/* ------------------------------------------
 * ------------ ARRAY UTILITIES -----------
 * ------------------------------------------ */

/**
 * Checks if a primitive instance or an object instance is within an array.
 * @description Returns a value of true when a primitive instance or object instance exists within the array; false otherwise.
 * @param {string|number|boolean|Object} - The value to be searched for inside the Array object.
 * @returns {boolean} - True if the value exists within the Array object; false otherwise.
 */
Array.prototype.contains = function (value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === value) {
			return true;
		}
	}
	return false;
};

/* ------------------------------------------
 * ------------ CSV UTILITIES -----------
 * ------------------------------------------ */

var CSVUtils = {
	/**
	 * Returns the rows of the CSV file/string in an array.
	 * @param str - The CSV string.
	 * @returns {Array} rows - rows of the CSV file/string
	 */
	getRows: function (str) {
		return str.split(/\r\n|\n/);
	},

	/**
	 * Function to split a CSV row and return the values as an array.
	 * @param sep - the separator
	 * @returns {Array} values - an array of values.
	 */
	getRowData: function (str, sep) {
		for (var values = str.split(sep = sep || ","), x = values.length - 1, tl; x >= 0; x--) {
			if (values[x].replace(/"\s+$/, '"').charAt(values[x].length - 1) == '"') {
				if ((tl = values[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
					values[x] = values[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
				} else if (x) {
					values.splice(x - 1, 2, [values[x - 1], values[x]].join(sep));
				} else values = values.shift().split(sep).concat(values);
			} else values[x].replace(/""/g, '"');
		}
		return values;
	}
};

/* ------------------------------------------
 * ------- SCHEDULED SCRIPT UTILITIES -------
 * ------------------------------------------ */

ScheduledScriptUtils = {
	/**
	 * Checks whether the usage units is running low.
	 * @param {Number} minUsage - the minimum usage
	 * @returns {Boolean} val - returns true if the script is running low on usage. False, otherwise.
	 */
	isRunningLowOnUsage: function (minUsage) {
		var remainingUsage = context.getRemainingUsage();
		if (remainingUsage <= parseInt(minUsage)) return true;

		return false;
	},
	/**
	 * Re-schedules the scheduled script.
	 * @param {Object} parameters - the script parameters
	 */
	reSchedule: function (parameters) {
		nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), parameters);
	}
};

/* ------------------------------------------
 * ----------- WIZARD UTILITIES -----------
 * ------------------------------------------ */

var WizardBuilder = {
	buildWizard: function (wizardDetails) {
		var assistant = nlapiCreateAssistant(wizardDetails.title, wizardDetails.hideHeader);
		assistant.setOrdered(wizardDetails.isOrdered);
		assistant.setNumbered(wizardDetails.isNumbered);
		assistant.setShortcut(wizardDetails.addShortcut);

		if (wizardDetails.css != null)
			assistant.setScript(wizardDetails.css);

		if ((splash = wizardDetails.splash) != null)
			assistant.setSplash(splash.title, splash.msg1, splash.msg2);

		for (var i = 0; i < wizardDetails.steps.length; i++) {
			var step = assistant.addStep(wizardDetails.steps[i].name, wizardDetails.steps[i].label);
			if (StringUtils.isNotEmpty(wizardDetails.steps[i].helpText)) step.setHelpText(wizardDetails.steps[i].helpText);
		}

		return assistant;
	}
};

/* ------------------------------------------
 * ----------- DATE/TIME UTILITIES -----------
 * ------------------------------------------ */

Date.prototype.getMonthName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names[this.getMonth()];
};

Date.prototype.getMonthNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names_short[this.getMonth()];
};

Date.locale = {
    en: {
       month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
       month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
};

DateTimeZoneUtils = {

	/**
	 * This is a method to get the current Date/Time
	 * based on the time zone offset specified.
	 *
	 * @param timeZoneOffSet {Number} - The time zone offset.
	 *
	 * @returns {Date} date - The Date/Time Object based on the time zone offset specified.
	 */
	getCurrentDateTime: function (timeZoneOffSet) {
		if ((timeZoneOffSet == null && timeZoneOffSet == '' && timeZoneOffSet == undefined) || isNaN(timeZoneOffSet))
			return new Date();

		var currentDateTime = new Date();
		var UTC = currentDateTime.getTime() + (currentDateTime.getTimezoneOffset() * 60000);
		currentDateTime = UTC + (timeZoneOffSet * 60 * 60 * 1000);

		return new Date(currentDateTime);
	},

	/**
	 * This is a method to get the current Date/Time based on a passed time zone offset
	 * converted to the specified Date/Time string format.
	 *
	 * @param timeZoneOffSet {Number} - The time zone offset.
	 * @param nsDateFormat {String} - The Date/Time format string to convert the date to.
	 *
	 * @returns {String} dateString - The Date/Time Object based on the time zone offset specified converted to the Date/Time string format specified.
	 */
	getCurrentDateTimeText: function (timeZoneOffSet, nsDateFormat) {
		return nlapiDateToString(this.getCurrentDateTime(timeZoneOffSet), nsDateFormat);
	},


	/**
	 * This is a method to get the current Date/Time based on
	 * the time zone selected on the Company Preferences page.
	 *
	 * @returns {Date} date - The Date/Time Object based on the time zone selected under the Company Preferences page.
	 */
	getCompanyCurrentDateTime: function () {
		var currentDateTime = new Date();
		var companyTimeZone = nlapiLoadConfiguration('companyinformation').getFieldText('timezone');
		var timeZoneOffSet = (companyTimeZone.indexOf('(GMT)') == 0) ? 0 : new Number(companyTimeZone.substr(4, 6).replace(/\+|:00/gi, '').replace(/:30/gi, '.5'));
		var UTC = currentDateTime.getTime() + (currentDateTime.getTimezoneOffset() * 60000);
		var companyDateTime = UTC + (timeZoneOffSet * 60 * 60 * 1000);

		return new Date(companyDateTime);
	},

	/**
	 * This is a method to get the current Date/Time based on the time zone selected
	 * on the Company Preferences page converted to a specified Date/Time string format.
	 *
	 * @param nsDateFormat {String} - The Date/Time format string to convert the date to.
	 *
	 * @returns {String} dateString - The Date/Time Object based on the time zone selected under the Company Preferences page converted to the Date/Time string format specified.
	 */
	getCompanyCurrentDateTimeText: function (nsDateFormat) {
		return nlapiDateToString(this.getCompanyCurrentDateTime(), nsDateFormat);
	},


	/**
	 * This is a method to get the current Date/Time based on
	 * the time zone selected on the Subsidiary passed as a parameter.
	 *
	 * @param subsidiary {Number} - The subsidiary internal id.
	 *
	 * @returns {Date} date - The Date/Time Object based on the time zone selected under the Subsidiary record specified.
	 */
	getSubsidiaryCurrentDateTime: function (subsidiary) {
		var currentDateTime = new Date();
		var subsidiaryTimeZone = nlapiLoadRecord('subsidiary', subsidiary).getFieldText('TIMEZONE');
		var timeZoneOffSet = (subsidiaryTimeZone.indexOf('(GMT)') == 0) ? 0 : new Number(subsidiaryTimeZone.substr(4, 6).replace(/\+|:00/gi, '').replace(/:30/gi, '.5'));
		var UTC = currentDateTime.getTime() + (currentDateTime.getTimezoneOffset() * 60000);
		var subsidiaryDateTime = UTC + (timeZoneOffSet * 60 * 60 * 1000);

		return new Date(subsidiaryDateTime);
	},

	/**
	 * This is a method to get the current Date/Time based on the time zone selected on
	 * the Subsidiary passed as a parameter converted to the Date/Time String format specified.
	 *
	 * @param subsidiary {Number} - The subsidiary internal id.
	 * @param nsDateFormat {String} - The Date/Time format string to convert the date to.
	 *
	 * @returns {String} dateString - The Date/Time Object based on the time zone selected under the Subsidiary record converted to the Date/Time string format specified.
	 */
	getSubsidiaryCurrentDateTimeText: function (subsidiary, nsDateFormat) {
		return nlapiDateToString(this.getCurrentDateTime(subsidiary), nsDateFormat);
	}
};

/* ------------------------------------------
 * ------------ NSUtils UTILITIES -----------
 * ------------------------------------------ */
var NSUtils = {
		/**
		 * Converts results into JSON format.
		 *
		 * @param {nlobjSearchResult} }res
		 * @returns {Array}
		 */
		nlobjSearchResults2JSON : function(res) {
			if (res==null) return [];
			var jsonArr = [];
			try {
				for (var i=0; i<res.length; i++){
					var columns = res[i].getAllColumns();
					var jsonObj = {internalid : res[i].getId()};
					for (var j=0; j<columns.length; j++){
						jsonObj[columns[j].getName()] = res[i].getValue(columns[j].getName());
					}
					jsonArr.push(jsonObj);
				}
				return jsonArr;
			}
			catch(e) {
				log.error('nlobjSearchResults2JSON: Unexpected Error -', e.message);
				return null;
			}
		},
		/**
		 * Retrieve all records in one search.
		 *
		 * @param recordType
		 * @param {nlobjSearchColumn} columns
		 * @returns {Array}
		 */
		searchAllRecord : function(recordType, columns) {
            if (columns==null) columns = new Array();
			columns.push(new nlobjSearchColumn('internalid').setSort());
			//columns.push(new nlobjSearchColumn('name'));
 			var hasResults=true, lastId=0;
			var allRes = [];
			while (hasResults) {
				var filters = [];
				filters.push (new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId));
				var res = nlapiSearchRecord(recordType, null, filters, columns);
				if (res!=null){
					lastId = res[res.length-1].getId();
					allRes = allRes.concat(res);
				} else {
					hasResults = false;
				}
			}
			return allRes;
		}
};
