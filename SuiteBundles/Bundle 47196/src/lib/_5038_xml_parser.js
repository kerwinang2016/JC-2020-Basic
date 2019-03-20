/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author mmoya
 */

if (!_5038) {
    var _5038 = {};
}

if (!_5038.xmlparser) {
    _5038.xmlparser = {};
}

_5038.xmlparser.NODE_TYPE_TEXT = 3;
_5038.xmlparser.MAX_LENGTH = 10000;

_5038.xmlparser.XMLParser = function XMLParser() {
    this.parseXML = function parseXML(xmlString) {
        var xmlDoc = null;
        var obj = {};

        if (xmlString != null && xmlString != "") {
            if (xmlString.length > _5038.xmlparser.MAX_LENGTH) {
                throw nlapiCreateError("PGP012", "The XML length exceeds the maximum allowed length " + _5038.xmlparser.MAX_LENGTH + " characters.");
            }
            
            try {
                xmlDoc = nlapiStringToXML(xmlString);
            } catch (err) {
                throw nlapiCreateError("PGP013", "An error occurred while parsing the XML.");
            }

            var xmlNodes = nlapiSelectNodes(xmlDoc, "/node()");
            obj = this.processNodes(xmlNodes[0]);
        }

        return obj;
    };

    this.processNodes = function processNodes(xmlNode) {
        var obj = {};

        var children = nlapiSelectNodes(xmlNode, "node()");
        
        if (!isNodeArrayEmpty(children)) {
            if (children.length == 1 && isText(children[0].nodeType)) {
                var childNode = children[0];

                //assign only if value has non-space characters
                if (!isEmpty(childNode.nodeValue.trim())) {
                    obj[xmlNode.nodeName] = convertToString(childNode.nodeValue);
                }
            }
            else {
                // If a node has multiple elements, merge them before assigning
                var tempObj = {};
                for (var childIdx = 0; childIdx < children.length; childIdx++) {
                    var curNode = children[childIdx];
                    tempObj = mergeObjects(tempObj, this.processNodes(curNode));
                }

                obj[xmlNode.nodeName] = tempObj;
            }
        }

        return obj;
    };
    
    function isNodeArrayEmpty(nodes) {
        return nodes == null || nodes.length == 0;
    }

    function isText(str) {
        return  str == _5038.xmlparser.NODE_TYPE_TEXT;
    }
    
    function isEmpty(str) {
        return  str == '';
    }

    function convertToString(str) {
        return str + '';
    }

    function mergeObjects(obj1, obj2) {
        for (var attrname in obj2) {
            obj1[attrname] = obj2[attrname];
        }

        return obj1;
    }

    return this;
};
