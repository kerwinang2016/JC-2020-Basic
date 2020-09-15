


/* File: src/third_parties/underscore.js*/
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u._,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this._wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports._=m):u._=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var _=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=_(m.allKeys),m.extendOwn=m.assign=_(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=_(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n._wrapped),t instanceof m&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u._=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(t.variable||"obj","_",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t._chain=!0,t};var P=function(n,t){return n._chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this._wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),m.prototype.value=function(){return this._wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);



/* File: src/third_parties/almond.js*/
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());



/* File: src/third_parties/is-my-json-valid.js*/
!function(u){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=u();else if("function"==typeof define&&define.amd)define('is-my-json-valid', [],function(){return u();});else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.isMyJsonValid=u()}}(function(){return function u(e,a,r){function t(n,c){if(!a[n]){if(!e[n]){var i="function"==typeof require&&require;if(!c&&i)return i(n,!0);if(f)return f(n,!0);var o=new Error("Cannot find module '"+n+"'");throw o.code="MODULE_NOT_FOUND",o}var d=a[n]={exports:{}};e[n][0].call(d.exports,function(u){var a=e[n][1][u];return t(a?a:u)},d,d.exports,u,e,a,r)}return a[n].exports}for(var f="function"==typeof require&&require,n=0;n<r.length;n++)t(r[n]);return t}({1:[function(u,e,a){function r(){throw new Error("setTimeout has not been defined")}function t(){throw new Error("clearTimeout has not been defined")}function f(u){if(s===setTimeout)return setTimeout(u,0);if((s===r||!s)&&setTimeout)return s=setTimeout,setTimeout(u,0);try{return s(u,0)}catch(e){try{return s.call(null,u,0)}catch(e){return s.call(this,u,0)}}}function n(u){if(b===clearTimeout)return clearTimeout(u);if((b===t||!b)&&clearTimeout)return b=clearTimeout,clearTimeout(u);try{return b(u)}catch(e){try{return b.call(null,u)}catch(e){return b.call(this,u)}}}function c(){m&&p&&(m=!1,p.length?y=p.concat(y):g=-1,y.length&&i())}function i(){if(!m){var u=f(c);m=!0;for(var e=y.length;e;){for(p=y,y=[];++g<e;)p&&p[g].run();g=-1,e=y.length}p=null,m=!1,n(u)}}function o(u,e){this.fun=u,this.array=e}function d(){}var s,b,l=e.exports={};!function(){try{s="function"==typeof setTimeout?setTimeout:r}catch(u){s=r}try{b="function"==typeof clearTimeout?clearTimeout:t}catch(u){b=t}}();var p,y=[],m=!1,g=-1;l.nextTick=function(u){var e=new Array(arguments.length-1);if(arguments.length>1)for(var a=1;a<arguments.length;a++)e[a-1]=arguments[a];y.push(new o(u,e)),1!==y.length||m||f(i)},o.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=d,l.addListener=d,l.once=d,l.off=d,l.removeListener=d,l.removeAllListeners=d,l.emit=d,l.binding=function(u){throw new Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(u){throw new Error("process.chdir is not supported")},l.umask=function(){return 0}},{}],2:[function(u,e,a){"function"==typeof Object.create?e.exports=function(u,e){u.super_=e,u.prototype=Object.create(e.prototype,{constructor:{value:u,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(u,e){u.super_=e;var a=function(){};a.prototype=e.prototype,u.prototype=new a,u.prototype.constructor=u}},{}],3:[function(u,e,a){e.exports=function(u){return u&&"object"==typeof u&&"function"==typeof u.copy&&"function"==typeof u.fill&&"function"==typeof u.readUInt8}},{}],4:[function(u,e,a){(function(e,r){function t(u,e){var r={seen:[],stylize:n};return arguments.length>=3&&(r.depth=arguments[2]),arguments.length>=4&&(r.colors=arguments[3]),y(e)?r.showHidden=e:e&&a._extend(r,e),O(r.showHidden)&&(r.showHidden=!1),O(r.depth)&&(r.depth=2),O(r.colors)&&(r.colors=!1),O(r.customInspect)&&(r.customInspect=!0),r.colors&&(r.stylize=f),i(r,u,r.depth)}function f(u,e){var a=t.styles[e];return a?"["+t.colors[a][0]+"m"+u+"["+t.colors[a][1]+"m":u}function n(u,e){return u}function c(u){var e={};return u.forEach(function(u,a){e[u]=!0}),e}function i(u,e,r){if(u.customInspect&&e&&z(e.inspect)&&e.inspect!==a.inspect&&(!e.constructor||e.constructor.prototype!==e)){var t=e.inspect(r,u);return v(t)||(t=i(u,t,r)),t}var f=o(u,e);if(f)return f;var n=Object.keys(e),y=c(n);if(u.showHidden&&(n=Object.getOwnPropertyNames(e)),S(e)&&(n.indexOf("message")>=0||n.indexOf("description")>=0))return d(e);if(0===n.length){if(z(e)){var m=e.name?": "+e.name:"";return u.stylize("[Function"+m+"]","special")}if(x(e))return u.stylize(RegExp.prototype.toString.call(e),"regexp");if(A(e))return u.stylize(Date.prototype.toString.call(e),"date");if(S(e))return d(e)}var g="",h=!1,j=["{","}"];if(p(e)&&(h=!0,j=["[","]"]),z(e)){var O=e.name?": "+e.name:"";g=" [Function"+O+"]"}if(x(e)&&(g=" "+RegExp.prototype.toString.call(e)),A(e)&&(g=" "+Date.prototype.toUTCString.call(e)),S(e)&&(g=" "+d(e)),0===n.length&&(!h||0==e.length))return j[0]+g+j[1];if(r<0)return x(e)?u.stylize(RegExp.prototype.toString.call(e),"regexp"):u.stylize("[Object]","special");u.seen.push(e);var w;return w=h?s(u,e,r,y,n):n.map(function(a){return b(u,e,r,y,a,h)}),u.seen.pop(),l(w,g,j)}function o(u,e){if(O(e))return u.stylize("undefined","undefined");if(v(e)){var a="'"+JSON.stringify(e).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return u.stylize(a,"string")}return h(e)?u.stylize(""+e,"number"):y(e)?u.stylize(""+e,"boolean"):m(e)?u.stylize("null","null"):void 0}function d(u){return"["+Error.prototype.toString.call(u)+"]"}function s(u,e,a,r,t){for(var f=[],n=0,c=e.length;n<c;++n)J(e,String(n))?f.push(b(u,e,a,r,String(n),!0)):f.push("");return t.forEach(function(t){t.match(/^\d+$/)||f.push(b(u,e,a,r,t,!0))}),f}function b(u,e,a,r,t,f){var n,c,o;if(o=Object.getOwnPropertyDescriptor(e,t)||{value:e[t]},o.get?c=o.set?u.stylize("[Getter/Setter]","special"):u.stylize("[Getter]","special"):o.set&&(c=u.stylize("[Setter]","special")),J(r,t)||(n="["+t+"]"),c||(u.seen.indexOf(o.value)<0?(c=m(a)?i(u,o.value,null):i(u,o.value,a-1),c.indexOf("\n")>-1&&(c=f?c.split("\n").map(function(u){return"  "+u}).join("\n").substr(2):"\n"+c.split("\n").map(function(u){return"   "+u}).join("\n"))):c=u.stylize("[Circular]","special")),O(n)){if(f&&t.match(/^\d+$/))return c;n=JSON.stringify(""+t),n.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(n=n.substr(1,n.length-2),n=u.stylize(n,"name")):(n=n.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),n=u.stylize(n,"string"))}return n+": "+c}function l(u,e,a){var r=0,t=u.reduce(function(u,e){return r++,e.indexOf("\n")>=0&&r++,u+e.replace(/\u001b\[\d\d?m/g,"").length+1},0);return t>60?a[0]+(""===e?"":e+"\n ")+" "+u.join(",\n  ")+" "+a[1]:a[0]+e+" "+u.join(", ")+" "+a[1]}function p(u){return Array.isArray(u)}function y(u){return"boolean"==typeof u}function m(u){return null===u}function g(u){return null==u}function h(u){return"number"==typeof u}function v(u){return"string"==typeof u}function j(u){return"symbol"==typeof u}function O(u){return void 0===u}function x(u){return w(u)&&"[object RegExp]"===N(u)}function w(u){return"object"==typeof u&&null!==u}function A(u){return w(u)&&"[object Date]"===N(u)}function S(u){return w(u)&&("[object Error]"===N(u)||u instanceof Error)}function z(u){return"function"==typeof u}function E(u){return null===u||"boolean"==typeof u||"number"==typeof u||"string"==typeof u||"symbol"==typeof u||"undefined"==typeof u}function N(u){return Object.prototype.toString.call(u)}function F(u){return u<10?"0"+u.toString(10):u.toString(10)}function $(){var u=new Date,e=[F(u.getHours()),F(u.getMinutes()),F(u.getSeconds())].join(":");return[u.getDate(),P[u.getMonth()],e].join(" ")}function J(u,e){return Object.prototype.hasOwnProperty.call(u,e)}var k=/%[sdj%]/g;a.format=function(u){if(!v(u)){for(var e=[],a=0;a<arguments.length;a++)e.push(t(arguments[a]));return e.join(" ")}for(var a=1,r=arguments,f=r.length,n=String(u).replace(k,function(u){if("%%"===u)return"%";if(a>=f)return u;switch(u){case"%s":return String(r[a++]);case"%d":return Number(r[a++]);case"%j":try{return JSON.stringify(r[a++])}catch(u){return"[Circular]"}default:return u}}),c=r[a];a<f;c=r[++a])n+=m(c)||!w(c)?" "+c:" "+t(c);return n},a.deprecate=function(u,t){function f(){if(!n){if(e.throwDeprecation)throw new Error(t);e.traceDeprecation?console.trace(t):console.error(t),n=!0}return u.apply(this,arguments)}if(O(r.process))return function(){return a.deprecate(u,t).apply(this,arguments)};if(e.noDeprecation===!0)return u;var n=!1;return f};var T,I={};a.debuglog=function(u){if(O(T)&&(T=e.env.NODE_DEBUG||""),u=u.toUpperCase(),!I[u])if(new RegExp("\\b"+u+"\\b","i").test(T)){var r=e.pid;I[u]=function(){var e=a.format.apply(a,arguments);console.error("%s %d: %s",u,r,e)}}else I[u]=function(){};return I[u]},a.inspect=t,t.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},t.styles={special:"cyan",number:"yellow",boolean:"yellow",undefined:"grey",null:"bold",string:"green",date:"magenta",regexp:"red"},a.isArray=p,a.isBoolean=y,a.isNull=m,a.isNullOrUndefined=g,a.isNumber=h,a.isString=v,a.isSymbol=j,a.isUndefined=O,a.isRegExp=x,a.isObject=w,a.isDate=A,a.isError=S,a.isFunction=z,a.isPrimitive=E,a.isBuffer=u("./support/isBuffer");var P=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];a.log=function(){console.log("%s - %s",$(),a.format.apply(a,arguments))},a.inherits=u("inherits"),a._extend=function(u,e){if(!e||!w(e))return u;for(var a=Object.keys(e),r=a.length;r--;)u[a[r]]=e[a[r]];return u}}).call(this,u("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./support/isBuffer":3,_process:1,inherits:2}],5:[function(u,e,a){a["date-time"]=/^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}[tT ]\d{2}:\d{2}:\d{2}(\.\d+)?([zZ]|[+-]\d{2}:\d{2})$/,a.date=/^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}$/,a.time=/^\d{2}:\d{2}:\d{2}$/,a.email=/^\S+@\S+$/,a["ip-address"]=a.ipv4=/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,a.ipv6=/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,a.uri=/^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]*$/,a.color=/(#?([0-9A-Fa-f]{3,6})\b)|(aqua)|(black)|(blue)|(fuchsia)|(gray)|(green)|(lime)|(maroon)|(navy)|(olive)|(orange)|(purple)|(red)|(silver)|(teal)|(white)|(yellow)|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\))/,a.hostname=/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/,a.alpha=/^[a-zA-Z]+$/,a.alphanumeric=/^[a-zA-Z0-9]+$/,a.style=/\s*(.+?):\s*([^;]+);?/g,a.phone=/^\+(?:[0-9] ?){6,14}[0-9]$/,a["utc-millisec"]=/^[0-9]{1,15}\.?[0-9]{0,15}$/},{}],6:[function(u,e,a){var r=u("generate-object-property"),t=u("generate-function"),f=u("jsonpointer"),n=u("xtend"),c=u("./formats"),i=function(u,e,a){var r=function(u){return u&&u.id===a?u:"object"==typeof u&&u?Object.keys(u).reduce(function(e,a){return e||r(u[a])},null):null},t=r(u);if(t)return t;a=a.replace(/^#/,""),a=a.replace(/\/$/,"");try{return f.get(u,decodeURI(a))}catch(u){var n,c=a.indexOf("#");if(0!==c)if(c===-1)n=e[a];else{var i=a.slice(0,c);n=e[i];var o=a.slice(c).replace(/^#/,"");try{return f.get(n,o)}catch(u){}}else n=e[a];return n||null}},o=function(u){u=JSON.stringify(u);for(var e=/\[([^\[\]"]+)\]/;e.test(u);)u=u.replace(e,'."+$1+"');return u},d={};d.any=function(){return"true"},d.null=function(u){return u+" === null"},d.boolean=function(u){return"typeof "+u+' === "boolean"'},d.array=function(u){return"Array.isArray("+u+")"},d.object=function(u){return"typeof "+u+' === "object" && '+u+" && !Array.isArray("+u+")"},d.number=function(u){return"typeof "+u+' === "number"'},d.integer=function(u){return"typeof "+u+' === "number" && (Math.floor('+u+") === "+u+" || "+u+" > 9007199254740992 || "+u+" < -9007199254740992)"},d.string=function(u){return"typeof "+u+' === "string"'};var s=function(u){for(var e=[],a=0;a<u.length;a++)e.push("object"==typeof u[a]?JSON.stringify(u[a]):u[a]);for(var a=1;a<e.length;a++)if(e.indexOf(e[a])!==a)return!1;return!0},b=function(u,e){var a,r=(0|e)!==e?Math.pow(10,e.toString().split(".").pop().length):1;if(r>1){var t=(0|u)!==u?Math.pow(10,u.toString().split(".").pop().length):1;a=t>r||Math.round(r*u)%(r*e)}else a=u%e;return!a},l=function(u,e,a,f,p){var y=p?n(c,p.formats):c,m={unique:s,formats:y,isMultipleOf:b},g=!!p&&!!p.verbose,h=!(!p||void 0===p.greedy)&&p.greedy,v={},j=function(u){return u+(v[u]=(v[u]||0)+1)},O={},x=function(u){if(O[u])return O[u];var e=j("pattern");return m[e]=new RegExp(u),O[u]=e,e},w=["i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","z"],A=function(){var u=w.shift();return w.push(u+u[0]),u},S=function(u,t,f,n){var s=t.properties,b=t.type,v=!1;Array.isArray(t.items)&&(s={},t.items.forEach(function(u,e){s[e]=u}),b="array",v=!0);var O=0,w=function(e,a,r){z("errors++"),f===!0&&(z("if (validate.errors === null) validate.errors = []"),g?z("validate.errors.push({field:%s,message:%s,value:%s,type:%s})",o(a||u),JSON.stringify(e),r||u,JSON.stringify(b)):z("validate.errors.push({field:%s,message:%s})",o(a||u),JSON.stringify(e)))};t.required===!0?(O++,z("if (%s === undefined) {",u),w("is required"),z("} else {")):(O++,z("if (%s !== undefined) {",u));var E=[].concat(b).map(function(e){return d[e||"any"](u)}).join(" || ")||"true";if("true"!==E&&(O++,z("if (!(%s)) {",E),w("is the wrong type"),z("} else {")),v)if(t.additionalItems===!1)z("if (%s.length > %d) {",u,t.items.length),w("has additional items"),z("}");else if(t.additionalItems){var N=A();z("for (var %s = %d; %s < %s.length; %s++) {",N,t.items.length,N,u,N),S(u+"["+N+"]",t.additionalItems,f,n),z("}")}if(t.format&&y[t.format]){"string"!==b&&c[t.format]&&z("if (%s) {",d.string(u));var F=j("format");m[F]=y[t.format],"function"==typeof m[F]?z("if (!%s(%s)) {",F,u):z("if (!%s.test(%s)) {",F,u),w("must be "+t.format+" format"),z("}"),"string"!==b&&c[t.format]&&z("}")}if(Array.isArray(t.required)){var $=function(e){var a=r(u,e);z("if (%s === undefined) {",a),w("is required",a),z("missing++"),z("}")};z("if ((%s)) {","object"!==b?d.object(u):"true"),z("var missing = 0"),t.required.map($),z("}"),h||(z("if (missing === 0) {"),O++)}if(t.uniqueItems&&("array"!==b&&z("if (%s) {",d.array(u)),z("if (!(unique(%s))) {",u),w("must be unique"),z("}"),"array"!==b&&z("}")),t.enum){var J=t.enum.some(function(u){return"object"==typeof u}),k=J?function(e){return"JSON.stringify("+u+") !== JSON.stringify("+JSON.stringify(e)+")"}:function(e){return u+" !== "+JSON.stringify(e)};z("if (%s) {",t.enum.map(k).join(" && ")||"false"),w("must be an enum value"),z("}")}if(t.dependencies&&("object"!==b&&z("if (%s) {",d.object(u)),Object.keys(t.dependencies).forEach(function(e){var a=t.dependencies[e];"string"==typeof a&&(a=[a]);var c=function(e){return r(u,e)+" !== undefined"};Array.isArray(a)&&(z("if (%s !== undefined && !(%s)) {",r(u,e),a.map(c).join(" && ")||"true"),w("dependencies not set"),z("}")),"object"==typeof a&&(z("if (%s !== undefined) {",r(u,e)),S(u,a,f,n),z("}"))}),"object"!==b&&z("}")),t.additionalProperties||t.additionalProperties===!1){"object"!==b&&z("if (%s) {",d.object(u));var N=A(),T=j("keys"),I=function(u){return T+"["+N+"] !== "+JSON.stringify(u)},P=function(u){return"!"+x(u)+".test("+T+"["+N+"])"},Z=Object.keys(s||{}).map(I).concat(Object.keys(t.patternProperties||{}).map(P)).join(" && ")||"true";z("var %s = Object.keys(%s)",T,u)("for (var %s = 0; %s < %s.length; %s++) {",N,N,T,N)("if (%s) {",Z),t.additionalProperties===!1?(n&&z("delete %s",u+"["+T+"["+N+"]]"),w("has additional properties",null,JSON.stringify(u+".")+" + "+T+"["+N+"]")):S(u+"["+T+"["+N+"]]",t.additionalProperties,f,n),z("}")("}"),"object"!==b&&z("}")}if(t.$ref){var q=i(a,p&&p.schemas||{},t.$ref);if(q){var D=e[t.$ref];D||(e[t.$ref]=function(u){return D(u)},D=l(q,e,a,!1,p));var F=j("ref");m[F]=D,z("if (!(%s(%s))) {",F,u),w("referenced schema does not match"),z("}")}}if(t.not){var M=j("prev");z("var %s = errors",M),S(u,t.not,!1,n),z("if (%s === errors) {",M),w("negative schema matches"),z("} else {")("errors = %s",M)("}")}if(t.items&&!v){"array"!==b&&z("if (%s) {",d.array(u));var N=A();z("for (var %s = 0; %s < %s.length; %s++) {",N,N,u,N),S(u+"["+N+"]",t.items,f,n),z("}"),"array"!==b&&z("}")}if(t.patternProperties){"object"!==b&&z("if (%s) {",d.object(u));var T=j("keys"),N=A();z("var %s = Object.keys(%s)",T,u)("for (var %s = 0; %s < %s.length; %s++) {",N,N,T,N),Object.keys(t.patternProperties).forEach(function(e){var a=x(e);z("if (%s.test(%s)) {",a,T+"["+N+"]"),S(u+"["+T+"["+N+"]]",t.patternProperties[e],f,n),z("}")}),z("}"),"object"!==b&&z("}")}if(t.pattern){var _=x(t.pattern);"string"!==b&&z("if (%s) {",d.string(u)),z("if (!(%s.test(%s))) {",_,u),w("pattern mismatch"),z("}"),"string"!==b&&z("}")}if(t.allOf&&t.allOf.forEach(function(e){S(u,e,f,n)}),t.anyOf&&t.anyOf.length){var M=j("prev");t.anyOf.forEach(function(e,a){0===a?z("var %s = errors",M):z("if (errors !== %s) {",M)("errors = %s",M),S(u,e,!1,!1)}),t.anyOf.forEach(function(u,e){e&&z("}")}),z("if (%s !== errors) {",M),w("no schemas match"),z("}")}if(t.oneOf&&t.oneOf.length){var M=j("prev"),U=j("passes");z("var %s = errors",M)("var %s = 0",U),t.oneOf.forEach(function(e,a){S(u,e,!1,!1),z("if (%s === errors) {",M)("%s++",U)("} else {")("errors = %s",M)("}")}),z("if (%s !== 1) {",U),w("no (or more than one) schemas match"),z("}")}for(void 0!==t.multipleOf&&("number"!==b&&"integer"!==b&&z("if (%s) {",d.number(u)),z("if (!isMultipleOf(%s, %d)) {",u,t.multipleOf),w("has a remainder"),z("}"),"number"!==b&&"integer"!==b&&z("}")),void 0!==t.maxProperties&&("object"!==b&&z("if (%s) {",d.object(u)),z("if (Object.keys(%s).length > %d) {",u,t.maxProperties),w("has more properties than allowed"),z("}"),"object"!==b&&z("}")),void 0!==t.minProperties&&("object"!==b&&z("if (%s) {",d.object(u)),z("if (Object.keys(%s).length < %d) {",u,t.minProperties),w("has less properties than allowed"),z("}"),"object"!==b&&z("}")),void 0!==t.maxItems&&("array"!==b&&z("if (%s) {",d.array(u)),z("if (%s.length > %d) {",u,t.maxItems),w("has more items than allowed"),z("}"),"array"!==b&&z("}")),void 0!==t.minItems&&("array"!==b&&z("if (%s) {",d.array(u)),z("if (%s.length < %d) {",u,t.minItems),w("has less items than allowed"),z("}"),"array"!==b&&z("}")),void 0!==t.maxLength&&("string"!==b&&z("if (%s) {",d.string(u)),z("if (%s.length > %d) {",u,t.maxLength),w("has longer length than allowed"),z("}"),"string"!==b&&z("}")),void 0!==t.minLength&&("string"!==b&&z("if (%s) {",d.string(u)),z("if (%s.length < %d) {",u,t.minLength),w("has less length than allowed"),z("}"),"string"!==b&&z("}")),void 0!==t.minimum&&("number"!==b&&"integer"!==b&&z("if (%s) {",d.number(u)),z("if (%s %s %d) {",u,t.exclusiveMinimum?"<=":"<",t.minimum),w("is less than minimum"),z("}"),"number"!==b&&"integer"!==b&&z("}")),void 0!==t.maximum&&("number"!==b&&"integer"!==b&&z("if (%s) {",d.number(u)),z("if (%s %s %d) {",u,t.exclusiveMaximum?">=":">",t.maximum),w("is more than maximum"),z("}"),"number"!==b&&"integer"!==b&&z("}")),s&&Object.keys(s).forEach(function(e){Array.isArray(b)&&b.indexOf("null")!==-1&&z("if (%s !== null) {",u),S(r(u,e),s[e],f,n),Array.isArray(b)&&b.indexOf("null")!==-1&&z("}")});O--;)z("}")},z=t("function validate(data) {")("if (data === undefined) data = null")("validate.errors = null")("var errors = 0");return S("data",u,f,p&&p.filter),z("return errors === 0")("}"),z=z.toFunction(m),z.errors=null,Object.defineProperty&&Object.defineProperty(z,"error",{get:function(){return z.errors?z.errors.map(function(u){return u.field+" "+u.message}).join("\n"):""}}),z.toJSON=function(){return u},z};e.exports=function(u,e){return"string"==typeof u&&(u=JSON.parse(u)),l(u,{},u,!0,e)},e.exports.filter=function(u,a){var r=e.exports(u,n(a,{filter:!0}));return function(u){return r(u),u}}},{"./formats":5,"generate-function":7,"generate-object-property":8,jsonpointer:10,xtend:11}],7:[function(u,e,a){var r=u("util"),t=/[\{\[]/,f=/[\}\]]/;e.exports=function(){var u=[],e=0,a=function(a){for(var r="";r.length<2*e;)r+="  ";u.push(r+a)},n=function(u){return u?f.test(u.trim()[0])&&t.test(u[u.length-1])?(e--,a(r.format.apply(r,arguments)),e++,n):t.test(u[u.length-1])?(a(r.format.apply(r,arguments)),e++,n):f.test(u.trim()[0])?(e--,a(r.format.apply(r,arguments)),n):(a(r.format.apply(r,arguments)),n):n};return n.toString=function(){return u.join("\n")},n.toFunction=function(u){var e="return ("+n.toString()+")",a=Object.keys(u||{}).map(function(u){return u}),r=a.map(function(e){return u[e]});return Function.apply(null,a.concat(e)).apply(null,r)},arguments.length&&n.apply(null,arguments),n}},{util:4}],8:[function(u,e,a){var r=u("is-property"),t=function(u,e){return r(e)?u+"."+e:u+"["+JSON.stringify(e)+"]"};t.valid=r,t.property=function(u){return r(u)?u:JSON.stringify(u)},e.exports=t},{"is-property":9}],9:[function(u,e,a){"use strict";function r(u){return/^[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/.test(u);
}e.exports=r},{}],10:[function(u,e,a){function r(u){switch(u){case"~1":return"/";case"~0":return"~"}throw new Error("Invalid tilde escape: "+u)}function t(u){return d.test(u)?u.replace(s,r):u}function f(u,e,a){for(var r,f,n=1,c=e.length;n<c&&(r=t(e[n++]),f=c>n,"undefined"==typeof u[r]&&(Array.isArray(u)&&"-"===r&&(r=u.length),f&&(""!==e[n]&&e[n]<1/0||"-"===e[n]?u[r]=[]:u[r]={})),f);)u=u[r];var i=u[r];return void 0===a?delete u[r]:u[r]=a,i}function n(u){if("string"==typeof u){if(u=u.split("/"),""===u[0])return u;throw new Error("Invalid JSON pointer.")}if(Array.isArray(u))return u;throw new Error("Invalid JSON pointer.")}function c(u,e){if("object"!=typeof u)throw new Error("Invalid input object.");e=n(e);var a=e.length;if(1===a)return u;for(var r=1;r<a;){if(u=u[t(e[r++])],a===r)return u;if("object"!=typeof u)return}}function i(u,e,a){if("object"!=typeof u)throw new Error("Invalid input object.");if(e=n(e),0===e.length)throw new Error("Invalid JSON pointer for set.");return f(u,e,a)}function o(u){var e=n(u);return{get:function(u){return c(u,e)},set:function(u,a){return i(u,e,a)}}}var d=/~/,s=/~[01]/g;a.get=c,a.set=i,a.compile=o},{}],11:[function(u,e,a){function r(){for(var u={},e=0;e<arguments.length;e++){var a=arguments[e];for(var r in a)t.call(a,r)&&(u[r]=a[r])}return u}e.exports=r;var t=Object.prototype.hasOwnProperty},{}]},{},[6])(6)});



/* File: src/third_parties/jsonpath-plus.js*/
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define('jsonpath-plus', [],function(){return e();});else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.jsonpathPlus=e()}}(function(){var define,module,exports;return function e(t,r,n){function a(i,c){if(!r[i]){if(!t[i]){var p="function"==typeof require&&require;if(!c&&p)return p(i,!0);if(o)return o(i,!0);var s=new Error("Cannot find module '"+i+"'");throw s.code="MODULE_NOT_FOUND",s}var u=r[i]={exports:{}};t[i][0].call(u.exports,function(e){var r=t[i][1][e];return a(r?r:e)},u,u.exports,e,t,r,n)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)a(n[i]);return a}({1:[function(require,module,exports){function Context(){}var indexOf=require("indexof"),Object_keys=function(e){if(Object.keys)return Object.keys(e);var t=[];for(var r in e)t.push(r);return t},forEach=function(e,t){if(e.forEach)return e.forEach(t);for(var r=0;r<e.length;r++)t(e[r],r,e)},defineProp=function(){try{return Object.defineProperty({},"_",{}),function(e,t,r){Object.defineProperty(e,t,{writable:!0,enumerable:!1,configurable:!0,value:r})}}catch(e){return function(e,t,r){e[t]=r}}}(),globals=["Array","Boolean","Date","Error","EvalError","Function","Infinity","JSON","Math","NaN","Number","Object","RangeError","ReferenceError","RegExp","String","SyntaxError","TypeError","URIError","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","eval","isFinite","isNaN","parseFloat","parseInt","undefined","unescape"];Context.prototype={};var Script=exports.Script=function(e){return this instanceof Script?void(this.code=e):new Script(e)};Script.prototype.runInContext=function(e){if(!(e instanceof Context))throw new TypeError("needs a 'context' argument.");var t=document.createElement("iframe");t.style||(t.style={}),t.style.display="none",document.body.appendChild(t);var r=t.contentWindow,n=r.eval,a=r.execScript;!n&&a&&(a.call(r,"null"),n=r.eval),forEach(Object_keys(e),function(t){r[t]=e[t]}),forEach(globals,function(t){e[t]&&(r[t]=e[t])});var o=Object_keys(r),i=n.call(r,this.code);return forEach(Object_keys(r),function(t){(t in e||indexOf(o,t)===-1)&&(e[t]=r[t])}),forEach(globals,function(t){t in e||defineProp(e,t,r[t])}),document.body.removeChild(t),i},Script.prototype.runInThisContext=function(){return eval(this.code)},Script.prototype.runInNewContext=function(e){var t=Script.createContext(e),r=this.runInContext(t);return forEach(Object_keys(t),function(r){e[r]=t[r]}),r},forEach(Object_keys(Script.prototype),function(e){exports[e]=Script[e]=function(t){var r=Script(t);return r[e].apply(r,[].slice.call(arguments,1))}}),exports.createScript=function(e){return exports.Script(e)},exports.createContext=Script.createContext=function(e){var t=new Context;return"object"==typeof e&&forEach(Object_keys(e),function(r){t[r]=e[r]}),t}},{indexof:2}],2:[function(e,t,r){var n=[].indexOf;t.exports=function(e,t){if(n)return e.indexOf(t);for(var r=0;r<e.length;++r)if(e[r]===t)return r;return-1}},{}],3:[function(require,module,exports){var module;!function(glbl,require){"use strict";function push(e,t){return e=e.slice(),e.push(t),e}function unshift(e,t){return t=t.slice(),t.unshift(e),t}function NewError(e){this.avoidNew=!0,this.value=e,this.message='JSONPath should not be called with "new" (it prevents return of (unwrapped) scalar values)'}function JSONPath(e,t,r,n,a){if(!(this instanceof JSONPath))try{return new JSONPath(e,t,r,n,a)}catch(e){if(!e.avoidNew)throw e;return e.value}"string"==typeof e&&(a=n,n=r,r=t,t=e,e={}),e=e||{};var o=e.hasOwnProperty("json")&&e.hasOwnProperty("path");if(this.json=e.json||r,this.path=e.path||t,this.resultType=e.resultType&&e.resultType.toLowerCase()||"value",this.flatten=e.flatten||!1,this.wrap=!e.hasOwnProperty("wrap")||e.wrap,this.sandbox=e.sandbox||{},this.preventEval=e.preventEval||!1,this.parent=e.parent||null,this.parentProperty=e.parentProperty||null,this.callback=e.callback||n||null,this.otherTypeCallback=e.otherTypeCallback||a||function(){throw new Error("You must supply an otherTypeCallback callback option with the @other() operator.")},e.autostart!==!1){var i=this.evaluate({path:o?e.path:t,json:o?e.json:r});if(!i||"object"!=typeof i)throw new NewError(i);return i}}var isNode=module&&!!module.exports,allowedResultTypes=["value","path","pointer","parent","parentProperty","all"],moveToAnotherArray=function(e,t,r){for(var n=0,a=e.length;n<a;n++){var o=e[n];r(o)&&t.push(e.splice(n--,1)[0])}},vm=isNode?require("vm"):{runInNewContext:function(expr,context){var keys=Object.keys(context),funcs=[];moveToAnotherArray(keys,funcs,function(e){return"function"==typeof context[e]});var code=funcs.reduce(function(e,t){return"var "+t+"="+context[t].toString()+";"+e},"");return code+=keys.reduce(function(e,t){return"var "+t+"="+JSON.stringify(context[t]).replace(/\u2028|\u2029/g,function(e){return"\\u202"+("\u2028"===e?"8":"9")})+";"+e},expr),eval(code)}};JSONPath.prototype.evaluate=function(e,t,r,n){var a=this,o=this.flatten,i=this.wrap,c=this.parent,p=this.parentProperty;if(this.currResultType=this.resultType,this.currPreventEval=this.preventEval,this.currSandbox=this.sandbox,r=r||this.callback,this.currOtherTypeCallback=n||this.otherTypeCallback,t=t||this.json,e=e||this.path,e&&"object"==typeof e){if(!e.path)throw new Error('You must supply a "path" property when providing an object argument to JSONPath.evaluate().');t=e.hasOwnProperty("json")?e.json:t,o=e.hasOwnProperty("flatten")?e.flatten:o,this.currResultType=e.hasOwnProperty("resultType")?e.resultType:this.currResultType,this.currSandbox=e.hasOwnProperty("sandbox")?e.sandbox:this.currSandbox,i=e.hasOwnProperty("wrap")?e.wrap:i,this.currPreventEval=e.hasOwnProperty("preventEval")?e.preventEval:this.currPreventEval,r=e.hasOwnProperty("callback")?e.callback:r,this.currOtherTypeCallback=e.hasOwnProperty("otherTypeCallback")?e.otherTypeCallback:this.currOtherTypeCallback,c=e.hasOwnProperty("parent")?e.parent:c,p=e.hasOwnProperty("parentProperty")?e.parentProperty:p,e=e.path}if(c=c||null,p=p||null,Array.isArray(e)&&(e=JSONPath.toPathString(e)),e&&t&&allowedResultTypes.indexOf(this.currResultType)!==-1){this._obj=t;var s=JSONPath.toPathArray(e);"$"===s[0]&&s.length>1&&s.shift();var u=this._trace(s,t,["$"],c,p,r);return u=u.filter(function(e){return e&&!e.isParentSelector}),u.length?1!==u.length||i||Array.isArray(u[0].value)?u.reduce(function(e,t){var r=a._getPreferredOutput(t);return o&&Array.isArray(r)?e=e.concat(r):e.push(r),e},[]):this._getPreferredOutput(u[0]):i?[]:void 0}},JSONPath.prototype._getPreferredOutput=function(e){var t=this.currResultType;switch(t){case"all":return e.path="string"==typeof e.path?e.path:JSONPath.toPathString(e.path),e;case"value":case"parent":case"parentProperty":return e[t];case"path":return JSONPath.toPathString(e[t]);case"pointer":return JSONPath.toPointer(e.path)}},JSONPath.prototype._handleCallback=function(e,t,r){if(t){var n=this._getPreferredOutput(e);e.path="string"==typeof e.path?e.path:JSONPath.toPathString(e.path),t(n,r,e)}},JSONPath.prototype._trace=function(e,t,r,n,a,o){function i(e){l=l.concat(e)}var c,p=this;if(!e.length)return c={path:r,value:t,parent:n,parentProperty:a},this._handleCallback(c,o,"value"),c;var s=e[0],u=e.slice(1),l=[];if(t&&Object.prototype.hasOwnProperty.call(t,s))i(this._trace(u,t[s],push(r,s),t,s,o));else if("*"===s)this._walk(s,u,t,r,n,a,o,function(e,t,r,n,a,o,c,s){i(p._trace(unshift(e,r),n,a,o,c,s))});else if(".."===s)i(this._trace(u,t,r,n,a,o)),this._walk(s,u,t,r,n,a,o,function(e,t,r,n,a,o,c,s){"object"==typeof n[e]&&i(p._trace(unshift(t,r),n[e],push(a,e),n,e,s))});else if("("===s[0]){if(this.currPreventEval)throw new Error("Eval [(expr)] prevented in JSONPath expression.");i(this._trace(unshift(this._eval(s,t,r[r.length-1],r.slice(0,-1),n,a),u),t,r,n,a,o))}else{if("^"===s)return r.length?{path:r.slice(0,-1),expr:u,isParentSelector:!0}:[];if("~"===s)return c={path:push(r,s),value:a,parent:n,parentProperty:null},this._handleCallback(c,o,"property"),c;if("$"===s)i(this._trace(u,t,r,null,null,o));else if(0===s.indexOf("?(")){if(this.currPreventEval)throw new Error("Eval [?(expr)] prevented in JSONPath expression.");this._walk(s,u,t,r,n,a,o,function(e,t,r,n,a,o,c,s){p._eval(t.replace(/^\?\((.*?)\)$/,"$1"),n[e],e,a,o,c)&&i(p._trace(unshift(e,r),n,a,o,c,s))})}else if(s.indexOf(",")>-1){var h,f;for(h=s.split(","),f=0;f<h.length;f++)i(this._trace(unshift(h[f],u),t,r,n,a,o))}else if("@"===s[0]){var y=!1,d=s.slice(1,-2);switch(d){case"scalar":t&&["object","function"].indexOf(typeof t)!==-1||(y=!0);break;case"boolean":case"string":case"undefined":case"function":typeof t===d&&(y=!0);break;case"number":typeof t===d&&isFinite(t)&&(y=!0);break;case"nonFinite":"number"!=typeof t||isFinite(t)||(y=!0);break;case"object":t&&typeof t===d&&(y=!0);break;case"array":Array.isArray(t)&&(y=!0);break;case"other":y=this.currOtherTypeCallback(t,r,n,a);break;case"integer":t!==+t||!isFinite(t)||t%1||(y=!0);break;case"null":null===t&&(y=!0)}if(y)return c={path:r,value:t,parent:n,parentProperty:a},this._handleCallback(c,o,"value"),c}else/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(s)&&i(this._slice(s,u,t,r,n,a,o))}return l.reduce(function(e,r){return e.concat(r.isParentSelector?p._trace(r.expr,t,r.path,n,a,o):r)},[])},JSONPath.prototype._walk=function(e,t,r,n,a,o,i,c){var p,s,u;if(Array.isArray(r))for(p=0,s=r.length;p<s;p++)c(p,e,t,r,n,a,o,i);else if("object"==typeof r)for(u in r)Object.prototype.hasOwnProperty.call(r,u)&&c(u,e,t,r,n,a,o,i)},JSONPath.prototype._slice=function(e,t,r,n,a,o,i){if(Array.isArray(r)){var c,p=r.length,s=e.split(":"),u=s[0]&&parseInt(s[0],10)||0,l=s[1]&&parseInt(s[1],10)||p,h=s[2]&&parseInt(s[2],10)||1;u=u<0?Math.max(0,u+p):Math.min(p,u),l=l<0?Math.max(0,l+p):Math.min(p,l);var f=[];for(c=u;c<l;c+=h)f=f.concat(this._trace(unshift(c,t),r,n,a,o,i));return f}},JSONPath.prototype._eval=function(e,t,r,n,a,o){if(!this._obj||!t)return!1;e.indexOf("@parentProperty")>-1&&(this.currSandbox._$_parentProperty=o,e=e.replace(/@parentProperty/g,"_$_parentProperty")),e.indexOf("@parent")>-1&&(this.currSandbox._$_parent=a,e=e.replace(/@parent/g,"_$_parent")),e.indexOf("@property")>-1&&(this.currSandbox._$_property=r,e=e.replace(/@property/g,"_$_property")),e.indexOf("@path")>-1&&(this.currSandbox._$_path=JSONPath.toPathString(n.concat([r])),e=e.replace(/@path/g,"_$_path")),e.match(/@([\.\s\)\[])/)&&(this.currSandbox._$_v=t,e=e.replace(/@([\.\s\)\[])/g,"_$_v$1"));try{return vm.runInNewContext(e,this.currSandbox)}catch(t){throw console.log(t),new Error("jsonPath: "+t.message+": "+e)}},JSONPath.cache={},JSONPath.toPathString=function(e){var t,r,n=e,a="$";for(t=1,r=n.length;t<r;t++)/^(~|\^|@.*?\(\))$/.test(n[t])||(a+=/^[0-9*]+$/.test(n[t])?"["+n[t]+"]":"['"+n[t]+"']");return a},JSONPath.toPointer=function(e){var t,r,n=e,a="";for(t=1,r=n.length;t<r;t++)/^(~|\^|@.*?\(\))$/.test(n[t])||(a+="/"+n[t].toString().replace(/\~/g,"~0").replace(/\//g,"~1"));return a},JSONPath.toPathArray=function(e){var t=JSONPath.cache;if(t[e])return t[e];var r=[],n=e.replace(/@(?:null|boolean|number|string|integer|undefined|nonFinite|scalar|array|object|function|other)\(\)/g,";$&;").replace(/[\['](\??\(.*?\))[\]']/g,function(e,t){return"[#"+(r.push(t)-1)+"]"}).replace(/\['([^'\]]*)'\]/g,function(e,t){return"['"+t.replace(/\./g,"%@%").replace(/~/g,"%%@@%%")+"']"}).replace(/~/g,";~;").replace(/'?\.'?(?![^\[]*\])|\['?/g,";").replace(/%@%/g,".").replace(/%%@@%%/g,"~").replace(/(?:;)?(\^+)(?:;)?/g,function(e,t){return";"+t.split("").join(";")+";"}).replace(/;;;|;;/g,";..;").replace(/;$|'?\]|'$/g,""),a=n.split(";").map(function(e){var t=e.match(/#([0-9]+)/);return t&&t[1]?r[t[1]]:e});return t[e]=a,t[e]},JSONPath.eval=function(e,t,r){return JSONPath(r,t,e)},"function"==typeof define&&define.amd?define(function(){return JSONPath}):isNode?module.exports=JSONPath:(glbl.jsonPath={eval:JSONPath.eval},glbl.JSONPath=JSONPath)}(this||self,"undefined"==typeof require?null:require)},{vm:1}]},{},[3])(3)});



/* File: src/third_parties/meta-schema-draftv4.js*/

define(
	'meta-schema-draftv4'
,	[
	]
,	function (
	)
{
	'use strict';

	return {
	    "id": "http://json-schema.org/draft-04/schema#",
	    "$schema": "http://json-schema.org/draft-04/schema#",
	    "description": "Core schema meta-schema",
	    "definitions": {
	        "schemaArray": {
	            "type": "array",
	            "minItems": 1,
	            "items": { "$ref": "#" }
	        },
	        "positiveInteger": {
	            "type": "integer",
	            "minimum": 0
	        },
	        "positiveIntegerDefault0": {
	            "allOf": [ { "$ref": "#/definitions/positiveInteger" }, { "default": 0 } ]
	        },
	        "simpleTypes": {
	            "enum": [ "array", "boolean", "integer", "null", "number", "object", "string" ]
	        },
	        "stringArray": {
	            "type": "array",
	            "items": { "type": "string" },
	            "minItems": 1,
	            "uniqueItems": true
	        }
	    },
	    "type": "object",
	    "properties": {
	        "id": {
	            "type": "string",
	            "format": "uri"
	        },
	        "$schema": {
	            "type": "string",
	            "format": "uri"
	        },
	        "title": {
	            "type": "string"
	        },
	        "description": {
	            "type": "string"
	        },
	        "default": {},
	        "multipleOf": {
	            "type": "number",
	            "minimum": 0,
	            "exclusiveMinimum": true
	        },
	        "maximum": {
	            "type": "number"
	        },
	        "exclusiveMaximum": {
	            "type": "boolean",
	            "default": false
	        },
	        "minimum": {
	            "type": "number"
	        },
	        "exclusiveMinimum": {
	            "type": "boolean",
	            "default": false
	        },
	        "maxLength": { "$ref": "#/definitions/positiveInteger" },
	        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
	        "pattern": {
	            "type": "string",
	            "format": "regex"
	        },
	        "additionalItems": {
	            "anyOf": [
	                { "type": "boolean" },
	                { "$ref": "#" }
	            ],
	            "default": {}
	        },
	        "items": {
	            "anyOf": [
	                { "$ref": "#" },
	                { "$ref": "#/definitions/schemaArray" }
	            ],
	            "default": {}
	        },
	        "maxItems": { "$ref": "#/definitions/positiveInteger" },
	        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
	        "uniqueItems": {
	            "type": "boolean",
	            "default": false
	        },
	        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
	        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
	        "required": { "$ref": "#/definitions/stringArray" },
	        "additionalProperties": {
	            "anyOf": [
	                { "type": "boolean" },
	                { "$ref": "#" }
	            ],
	            "default": {}
	        },
	        "definitions": {
	            "type": "object",
	            "additionalProperties": { "$ref": "#" },
	            "default": {}
	        },
	        "properties": {
	            "type": "object",
	            "additionalProperties": { "$ref": "#" },
	            "default": {}
	        },
	        "patternProperties": {
	            "type": "object",
	            "additionalProperties": { "$ref": "#" },
	            "default": {}
	        },
	        "dependencies": {
	            "type": "object",
	            "additionalProperties": {
	                "anyOf": [
	                    { "$ref": "#" },
	                    { "$ref": "#/definitions/stringArray" }
	                ]
	            }
	        },
	        "enum": {
	            "type": "array",
	            "minItems": 1,
	            "uniqueItems": true
	        },
	        "type": {
	            "anyOf": [
	                { "$ref": "#/definitions/simpleTypes" },
	                {
	                    "type": "array",
	                    "items": { "$ref": "#/definitions/simpleTypes" },
	                    "minItems": 1,
	                    "uniqueItems": true
	                }
	            ]
	        },
	        "allOf": { "$ref": "#/definitions/schemaArray" },
	        "anyOf": { "$ref": "#/definitions/schemaArray" },
	        "oneOf": { "$ref": "#/definitions/schemaArray" },
	        "not": { "$ref": "#" }
	    },
	    "dependencies": {
	        "exclusiveMaximum": [ "maximum" ],
	        "exclusiveMinimum": [ "minimum" ]
	    },
	    "default": {}
	};
});



/* File: src/accessControl.js*/
function accessControl()
{
	var requiredPermissions = [
		{rol: 'LIST_FILECABINET', level: 1}
	,	{rol: 'LIST_WEBSITE', level: 1}
	,	{rol: 'ADMI_DOMAINS', level: 4}
	,	{rol: 'ADMI_STORESETUP', level: 4}
	,	{rol: 'ADMI_CUSTOMSCRIPT', level: 1}
	,	{rol: 'ADMI_CUSTRECORD', level: 1}
	];
	for (var i = 0; i < requiredPermissions.length; i++)
	{
		var permission = requiredPermissions[i];
		var storeSetUpPermissionLevel = nlapiGetContext().getPermission(permission.rol);
		if(storeSetUpPermissionLevel < permission.level)
		{
			throw new Error('Only the users with the following permissions: "Documents and Files", "Website (External) publisher", "Set Up Domains", "Set Up Web Site", "SuiteScript", "Custom Record Types" can modify the configuration record');
		}
	}
}


/* File: src/PluginContainer.js*/
//@module PluginContainer Defines the architecture to extend module through plugins
define('PluginContainer'
,	[]
,	function()
{
	'use strict';

	// @class PluginContainer The PluginContainer pattern is very similar to events listeners pattern but
	// designed to let listeners hook more appropiately into some processing. One or more Plugin objects
	// are installed into a PluginContainer and the owner of the container runs container.executeAll()
	// Registered plugins will be then executed by priority order and if any input is passed it will transformed
	var PluginContainer = function()
	{
		this.initialize();
	};

	_(PluginContainer.prototype).extend(
	{
		// @method initialize
		initialize: function()
		{
			this.plugins = [];
		}

		// @method executeAll execute all registered plugins The first param is the
		// input and the rest of the params will be passed to Plugin's execute method.
		// @param {Any} input. Optional. The input that plugins will take and transform.
		// @return {Any} the output, if any
	,	executeAll: function ()
		{
			var args = Array.prototype.slice.call(arguments, 0);

			_(this.plugins).each(function (p)
			{
				args[0] = p.execute.apply(p, args) || args[0];
			});

			return args[0];
		}

	,	_getPluginName: function (plugin)
		{
			return _(plugin).isString() ? plugin : plugin.name;
		}

		//@method install add a new plugin @param {Plugin} plugin
	,	install: function (plugin)
		{
			this.plugins.push(plugin);
			this.plugins = _(this.plugins).sort(function (a,b)
			{
				return a.priority < b.priority ? 1 : -1;
			});
		}

		//@method uninstall Remove an installed plugin @param {Plugin|String} plugin
	,   uninstall: function (plugin)
		{
			var name = this._getPluginName(plugin);
			this.plugins = _(this.plugins).reject(function(p)
			{
				return p.name===name;
			});
		}
	});

	return PluginContainer;

	// @class Plugin installable in a PluginContainer. There is no concrete API, only an execute method and
	// It's up to the users to define de Plugin semantics @property {String} name used to identify the plugins in the container
	// @property {Number} priority lower numbers will execute before higher numbers
	// @method {Function} execute @param {Any} input @return {Any} pugins have the possibility of
	// @return {Any} will do some modifications to any passed object and will return these modifications - implementer freedom
});



/* File: src/configuration/Configuration.Verifications.js*/
/*
	@module config
	@class ConfigurationVerifications
*/

define('Configuration.Verifications'
,	[
		'Configuration.Tool'
	,	'PluginContainer'
	,	'is-my-json-valid'
	,	'meta-schema-draftv4'
	]
,	function
	(
		Tool
	,	PluginContainer
	,	validator
	,	metaSchema
	)
{
	'use strict';

	Tool.prototype.init.install({
		name: 'verifications'
	,	execute: function(self)
		{
			//@method validate validates the json schema of given object @param {Object} data
			self.validate = validator(metaSchema, {verbose: 'true'});
		}
	});

	_.extend(Tool.prototype, {

		// @method validateJSONSchema @param data @return {Array<String>} the errors or falsy otherwhise.
		validateJSONSchema: function(data)
		{
			var result = this.validate(data);
			return !result ? this.validate.errors : undefined;
		}
		/*
		@method validateReferences perform the following validations :

		 * any property or subtab referencing an undeclared group gives error
		 * duplicated properties declarations gives an error

		@param data
		@returns {Array<String>} errors
		*/
	,	validateReferences: function(data)
		{
			var self = this, groups = {}, groupsCount = {}, subtabs = {}, subtabsCount = {}, props = {}, errors = [];

			//verify duplicated groups and subtabs declarations
			_.each(data, function(field)
			{
				if(field.group)
				{
					groups[field.group.id] = field.group;
					groupsCount[field.group.id] = groupsCount[field.group.id] || 0;
					groupsCount[field.group.id]++;
				}
				if(field.subtab)
				{
					subtabs[field.subtab.id] = field.subtab;
					subtabsCount[field.subtab.id] = subtabsCount[field.subtab.id] || 0;
					subtabsCount[field.subtab.id]++;
				}
			});

			_.each(groupsCount, function(val, key)
			{
				if(val>1)
				{
					errors.push('Duplicated group declaration: '+key);
				}
			});

			_.each(subtabsCount, function(val, key)
			{
				if(val>1)
				{
					errors.push('Duplicated subtab declaration: '+key);
				}
			});

			this.iterateProperties(data, function(property)
			{
				self.validatePropertyId(property.id, errors);
				if(props[property.id])
				{
					errors.push('Duplicated property declaration: '+property.id);
				}
				props[property.id] = true;
				if(property.group && !groups[property.group])
				{
					errors.push('property: '+property.id+' references non existent group '+property.group);
				}
				if(property.subtab && !subtabs[property.subtab])
				{
					errors.push('property: '+property.id+' references non existent subtab '+property.subtab);
				}
			});
			return errors;
		}

		/**
		@method validatePropertyId allow only alphanumeric characters
		**/
	,	validatePropertyId: function(id, errors)
		{
			var regex = /^[a-zA-Z0-9]*$/;
			if(!regex.exec(id))
			{
				errors.push('invalid property id: '+id+' . can only contain alphanumeric characters.');
			}
		}
	});
});



/* File: src/configuration/Configuration.Modifications.js*/
/*
	@module config
	@class ConfigurationModifications
*/

define('Configuration.Modifications'
,	[
		'Configuration.Tool'
	,	'PluginContainer'
	,	'jsonpath-plus'
	]
,	function
	(
		Tool
	,	PluginContainer
	,	JSONPath
	)
{
	'use strict';

	Tool.prototype.init.install({
		name: 'modfications'
	,	execute: function(self)
		{
			self._installModificationsPlugins();
		}
	});

	_.extend(Tool.prototype, {

		/*
		@property {PluginContainer} modificationPlugins these plugins will receive a modification definition for
		a property and a target property to modify accordingly. Usage:

			tool.modificationPlugins.install
		*/
		modificationPlugins: new PluginContainer()

	,	getModifications: function(data)
		{
			return JSONPath({
						json: data
					,	path: '$[*].modifications[*]'
					,	resultType: 'all'
					});
		}

		// @method modifications it will execute the registered modification plugins to given manifest object which will be modified
		// @param {Array<Object>} data the manifest
	,	modifications: function(data, modificationsResult)
		{
			var errors = [];
			var self = this;

			var appliedModifications = {};
			_.each(data, function(configuration)
			{
				_.each(modificationsResult, function(mod, index)
				{
					var jsonResults;
					try
					{
						jsonResults = JSONPath({
							json: configuration
						,	path: mod.value.target
						,	resultType: 'all'
						});
					}
					catch(ex)
					{
						errors.push('Syntax error in the modification target in ' + JSON.stringify(mod.value));
						return;
					}
					if (_.size(jsonResults) > 0)
					{
						appliedModifications[index] = true;
						var pluginContext = {
							mod: mod.value
						,	jsonResults: jsonResults
						,	configuration: configuration
						, 	errors: errors
						};
						self.modificationPlugins.executeAll(pluginContext);
					}
				});
			});

			//throw an error for each modification that was not applied on any element
			_.each(modificationsResult,function(mod, index)
			{
				if (!appliedModifications[index])
				{
					errors.push('Nothing is been modified with ' + JSON.stringify(mod.value));
				}
			});

			return errors;
		}

		//@method _installModificationsPlugins install the default modification plugins
	,	_installModificationsPlugins: function()
		{
			this.modificationPlugins.install(
			{
				name: 'add'
			,	execute: function(context)
				{
					var mod = context.mod
					,	jsonResults = context.jsonResults
					,	errors = context.errors;

					if (mod.action === 'add')
					{
						_.each(jsonResults, function(jsonResult)
						{
							//when target it's array add the value as a new element of the array at the end
							if(_.isArray(jsonResult.value))
							{
								jsonResult.value.push(mod.value);
							}//objects
							else if (_.isObject(jsonResult.value))
							{
								if (_.isObject(mod.value) && !_.isArray(mod.value))
								{
									_.extend(jsonResult.value, mod.value);
								}
								else
								{
									errors.push('The value must be a JSON object' + JSON.stringify(mod));
								}
							}//the target it's a String
							else if (_.isString(jsonResult.value))
							{
								if(_.isString(mod.value) || _.isNumber(mod.value))
								{
									var parentProperty = jsonResult.parentProperty;
									jsonResult.parent[parentProperty] +=  mod.value;
								}
								else
								{
									errors.push('Only a string or a number value can be added to a target of string type ' + JSON.stringify(mod));
								}
							}
							else
							{
								errors.push('The target of this action must be a Array, Object or String ' + JSON.stringify(mod));
							}
						});
					}
				}
			});
			this.modificationPlugins.install(
			{
				name: 'replace'
			,	execute: function(context)
				{
					var mod = context.mod
					,	jsonResults = context.jsonResults
					,	errors = context.errors;

					if (mod.action === 'replace')
					{
						_.each(jsonResults, function(jsonResult)
						{
							if (_.isString(jsonResult.value) || _.isNumber(jsonResult.value) || _.isBoolean(jsonResult.value) || jsonResult.value === null)
							{
								var parentProperty = jsonResult.parentProperty;
								jsonResult.parent[parentProperty] = mod.value;
							}
							else
							{
								errors.push('The target of this action must be a String, Number, Boolean or NULL ' + JSON.stringify(mod));
							}
						});
					}
				}
			});
			this.modificationPlugins.install(
			{
				name: 'remove'
			,	execute: function(context)
				{
					var mod = context.mod
					,	jsonResults = context.jsonResults
					,	errors = context.errors;
					/*
					This array has objects with two properties
					{
						arrayRef -> this point to a array with items to be deleted
						indexes -> this is a array of the indexes to be deleted y the array (arrayRef)
					}
					*/
					var toDelete = [];
					if (mod.action === 'remove')
					{
						/*
						Store in "toDelete" all the arrays and respective indexes that need to be deleted(they are not deleted at ones becouse the
						indexes that are waitting to be processed are going to be affected)
						*/
						_.each(jsonResults, function(jsonResult)
						{
							if ((_.isString(jsonResult.value) || _.isNumber(jsonResult.value) || _.isBoolean(jsonResult.value) || jsonResult.value === null) && _.isArray(jsonResult.parent))
							{
								addToDelete(jsonResult.parent, jsonResult.parentProperty);
							}
							else
							{
								errors.push('The target of this action must be a String, Number, Boolean or NULL ' + JSON.stringify(mod));
							}
						});
						if (!errors.length)
						{
							_.each(toDelete, function(item)
							{
								//order in descending way
								var indexesOrdered = item.indexes.sort(function(a, b)
								{
									if(a < b)
									{
										return 1;
									}
									else if(a > b)
									{
										return -1;
									}
									return 0;
								});
								//delete the elements from the arrays
								for (var i = 0; i < indexesOrdered.length; i++)
								{
									item.arrayRef.splice(indexesOrdered[i],1);
								}
							});
						}
					}
					function addToDelete(array, index)
					{
						//if the array param it's already in the list, just add the index to the respective array
						for (var i = 0; i < toDelete.length; i++)
						{
							if(toDelete[i].arrayRef === array)
							{
								toDelete[i].indexes.push(index);
								return;
							}
						}
						//if the array do not exist in the list
						toDelete.push(
						{
							arrayRef : array
						,	indexes:[index]
						});
					}
				}
			});
		}
	});
});



/* File: src/configuration/Configuration.Tool.js*/
/* @module config
@class ConfigurationTool
The configuration tool is meant to be used from the gulp tasks to validate and apply configuration modifications at buildtime. */
define('Configuration.Tool'
,	[
		'PluginContainer'
	]
,	function
	(
		PluginContainer
	)
{
	'use strict';

	var Tool = function()
	{
		this.init.executeAll(this);
	};

	_.extend(Tool.prototype, {

		// @property {PluginContainer} init extensions can register here behavior that needs to be executed when
		// the instance is created (constructor). Given parameter is this/self
		init: new PluginContainer()

	,	iterateProperties: function(data, fn)
		{
			_.each(data, function(object)
			{
				_.each(object.properties, function(property, id)
				{
					var context = property;

					context = _.extend(context, {
						id: id
					});

					fn(context);

					if(property.type === 'array' && property.items && property.items.type==='object')
					{
						_.each(property.items.properties, function(arrayObjectProp, arrayObjectPropId)
						{
							var childId = id+'.'+arrayObjectPropId;
							var childContext = arrayObjectProp;
							//TODO: remove id property since gives error when copying and pasting properties from output file in filecabinet.
							childContext = _.extend(childContext, {id: childId});
							fn(childContext);
						});
					}
				});
			});
		}

	,	getProperty: function(data, propertyId)
		{
			var result;

			this.iterateProperties(data, function(property)//TODO: performance - ._each don't break
			{
				if(property.id === propertyId)
				{
					result = property.id === propertyId ? property : result;
				}
			});

			return result;
		}
	});

	return Tool;
});



/* File: src/configuration/Configuration.js*/
/* @module config
	@class Configuration
*/
define('Configuration'
,	[
		'Configuration.Tool'
	,	'Configuration.Modifications'
	,	'Configuration.Verifications'
	]
,	function
	(
		Tool
	)
{
	'use strict';

	return Tool;
});



/* File: src/AbstractEditor.js*/
//@module suiteEditor

// @class AbstractEditor
function AbstractEditor(config)
{
	config = config || {};
	// @property {Object} config
	this.config = config;
    this.manifest = config.manifest;
	this.propertyId = config.propertyId;
    this.propertyValue = config.propertyValue;
	this.configurationId = config.configurationId;
	this.configuration = config.configuration;
	//Used to create the help reference links
	this.docRefLinkDisplayText = config.docRefLinkDisplayText || 'See Help';
	this.docRefLinkUrlPrefix = config.docRefLinkUrlPrefix || 'https://system.netsuite.com/app/help/helpcenter.nl?fid=';
	this.docRefLinkUrlSufix = config.docRefLinkUrlSufix || '.html';

}

/*
@class ConfigProperty configuration property definition.
@property {String} type
@property {String} title
@property {String} description

@property {String} group the id of the group this property belongs. The group must exists @required
@property {String} subtab the id of the group this property belongs. The group must exists @optional

@property {Boolean} required
@property {Boolean} translate

@property {String} nstype

@class ConfigGroup
@property {String} id
@property {String} title
@property {String} description


*/

_.extend(AbstractEditor.prototype, {

	//load() related utilities
	configurationTypeMap: {
		'integer': 'integer'
	,	'float': 'float'
	,	'number': 'float'
	,   'string': 'text'
	,   'boolean': 'checkbox'
	,   'enum': 'select'
	,	'select': 'select'
	}

	// @class Field @property name @property type @property id @property description
	// @class AbstractEditor
	// @method propertyToField creates a suitescript ui field object from a property config object.
	// Responsible of setting declared metadata to the nlobjField.
	// @param {String} id @param {ConfigProperty} property @return {Field}
,	propertyToField: function(id, property)
	{
		var field = {}
		,	self = this;
		id = this.toUnderscore(id).replace(/\./gi,'__');
		var name = id.replace(/([A-Z])/g, ' $1');

		field.name = property.title || name.charAt(0).toUpperCase() + name.slice(1);
		field.type = property.nsType || ((property.enum || property.source) ? 'select' : this.configurationTypeMap[property.type]);

		field.id = this.transformFieldId(id);
		field.description = property.description;
		field.mandatory = property.mandatory;
		field.docRef = property.docRef;

		field.default = property.default;

		if(property.source && property.source.indexOf('$resource.')===0)
		{
			//it's a config resource like $resource.template.item-options
			var sourceSplitted = property.source.split('.');
			if(sourceSplitted.length>2)
			{
				field.options = _.find(self.manifest, function(obj)
				{
					return obj.resource && obj.resource[sourceSplitted[1]] && obj.resource[sourceSplitted[1]][sourceSplitted[2]]
				}).resource[sourceSplitted[1]][sourceSplitted[2]];
			}
		}
		else if(property.source) // it is a netsuite nlobjField source
		{
			field.source = property.source;
		}
		else if(property.enum) //it's an array literal
		{
			field.options = property.enum;
		}
		if (field.options && property.multiselect)
		{
			field.type = 'multiselect';
		}
		if(property.hidden ||
			property.group && self._hiddenGroups[property.group] ||
			property.subtab && self._hiddenSubtabs[property.subtab])
		{
			field.hidden = true;
		}
		return field;
	}


,	addFieldTo: function(container, config, tab)
	{
		var fourthParam = config.type === 'select' ? (config.source||null) : null;
		var field;

		if(tab) //Heads up! we have to write this nasty if() because method overloading in suitescript 1.0 will fail.
		{
			field = container.addField(config.id, config.type, config.name, fourthParam, tab);
		}
		else
		{
			field = container.addField(config.id, config.type, config.name, fourthParam);
		}
		if(config.mandatory)
		{
			field.setMandatory(true);
		}
		var helpText = "";
		if(config.description)
		{
			helpText = config.description;
		}

		helpText += this.createHelpLink(config.docRef);

		field.setHelpText(helpText);

		_.each(config.options, function(opt)
		{
			var selected = false;
			field.addSelectOption(opt, opt, selected);
		});
		if(this.config.readonly || config.readonly)
		{
			field.setDisplayType('disabled');
		}
		if(this.config.hidden || config.hidden)
		{
			field.setDisplayType('hidden');
		}
		return field;
	}

,	getFieldValue: function (value, type)
	{
		if (type === 'boolean' || type === 'checkbox')
		{
			if (value === 'T')
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		else if (type === 'integer')
		{
			return parseInt(value);
		}
		else
		{
			return value;
		}
	}

,	setFieldValue: function (value, type)
	{
		if (type === 'boolean' || type === 'checkbox')
		{
			if (value === true)
			{
				return 'T';
			}
			else
			{
				return 'F';
			}
		}
		else if (type === 'integer' || type === 'float' || type === 'number')
		{
			if(isNaN(value) || value === null)
			{				
				return '';
			}
			else
			{
				return type === 'integer' ? value.toString() : value;
			}
		}
		else
		{
			return value || '';
		}
	}

	//misc utilities

,	transformId: function (id)
	{
		return 'custpage_' + id.toLowerCase();
	}
,	transformFieldId: function (id)
	{
		return this.transformId('field_' + id);
	}

,	toUnderscore: function (camelCase)
	{
		return camelCase.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
	}

,	toCamelCase: function (underscore)
    {
        return underscore.replace(/(_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
    }

,	toNormal: function (camelCase)
	{
		camelCase = camelCase.replace(/([A-Z])/g, ' $1');
		return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
	}

	// @method getPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} default_value value to return if nothing is found.
,	getPathFromObject: function  (object, path, default_value)
	{
		if (!path)
		{
			return object;
		}
		else if (object)
		{
			var tokens = path.split('.')
			,	prev = object
			,	n = 0;

			while (!_.isUndefined(prev) && n < tokens.length)
			{
				prev = prev[tokens[n++]];
			}

			if (!_.isUndefined(prev))
			{
				return prev;
			}
		}

		return default_value;
	}

	// @method setPathFromObject @param {Object} object @param {String} path a path with values separated by dots @param {Any} value the value to set
,	setPathFromObject: function (object, path, value)
	{
		if (!path)
		{
			return;
		}
		else if (!object)
		{
			return;
		}

		var tokens = path.split('.')
		,	prev = object;

		for(var token_idx = 0; token_idx < tokens.length-1; ++token_idx)
		{
			var current_token = tokens[token_idx];

			if( _.isUndefined(prev[current_token]))
			{
				prev[current_token] = {};
			}
			prev = prev[current_token];
		}

		prev[_.last(tokens)] = value;
	}
,	createHelpLink: function (docRef)
	{
		if(docRef == undefined || docRef == '')
		{
			return '';
		}
		return " <a target='_blank' href='" + this.docRefLinkUrlPrefix + docRef + this.docRefLinkUrlSufix + "'>" + this.docRefLinkDisplayText + "</a>";
	}
});



/* File: src/SchemaEditor.js*/
/*
@module suiteEditor
@class SchemaEditor This editor will be given a configurationManifest.json object.

 * load() will render the configuration inputs using SuiteScript nlobjForm, nlobjField, nlobjTab, etc using
 UI grouping as declared in "group" and "subGroup".

 * fetch() will generate a json object which properties values are all the properties edited by the user in
 the UI. The '.' in the property id will generate a new level in the json. For example, property id "foo.bar"
 will generate the following structure: {foo: {bar: "some value"}}

@extends AbstractEditor
*/
function SchemaEditor()
{
	AbstractEditor.apply(this, arguments);
}
SchemaEditor.prototype = new AbstractEditor();

_.extend(SchemaEditor.prototype, {

	// @method load it will use this.config.data json-schema object to generate suitescript UI for editing it. It will create nlobjForm this.form
	load: function()
	{
		var self = this
		,	unalocatedEntries = []
		,	form = nlapiCreateForm(this.config.title)
		,	context = nlapiGetContext()
		,	websiteId = this.config.request.getParameter((this.config.request.getMethod() === 'POST') ? 'custpage_sc_config_website': 'website') 
		,	webSiteRecord = nlapiLoadRecord('website', websiteId)
		,	websiteScope = webSiteRecord.getFieldValue('websitescope');

		this.form = form;
		self._subtabs = {};
		self._tabs = {};
		self._hiddenGroups = {};
		self._hiddenSubtabs = {};

		// here we generate the tabs and subtabs structure. Each tab is a 'group' and each subtab is a 'subtab' of the group.

        // first sort by group.title alphabetically
        this.manifest = this.manifest.sort(function(e1, e2)
        {
			if(e1.group && e2.group)
        	{
        		return e1.group.title.toLowerCase() > e2.group.title.toLowerCase() ? 1 : -1;
        	}
        	else
        	{
        		return -1;
        	}
        });

        // then, create the tabs
		_.each(this.manifest, function(entry)
		{
			if (entry.group && entry.group.id )
			{
				if(self.entryIsVisible(entry.group,websiteScope,context))
				{
					var tabId = self.transformId(entry.group.id)
					,	tabName = entry.group.title || self.toNormal(entry.group.id)
					,	tabHelp = self.createHelpLink(entry.group.docRef);

					var tab = form.addTab(tabId, tabName);
					tab.setHelpText(tabHelp);
					self._tabs[tabId] = true;
				}
				else
				{
					self._hiddenGroups[entry.group.id] = true;
				}
			}
		});

		//then create the subtabs
		_.each(this.manifest, function(entry)
		{
			if(entry.subtab && entry.subtab.id && entry.subtab.group)
			{

				var tabId = self.transformId(entry.subtab.group)
				if(self._tabs[tabId])
				{
					if(!self._hiddenGroups[entry.subtab.group] && self.entryIsVisible(entry.subtab,websiteScope,context))
					{
						var subTabName = entry.subtab.title || self.toNormal(entry.subtab.id)
						,	subTabId = tabId+'_'+entry.subtab.id.toLowerCase()
						self._subtabs[subTabId] = true;
						var subTab = form.addSubTab(subTabId, subTabName, tabId);

						subTab.setHelpText(self.createHelpLink(entry.subtab.docRef));
					}
					else
					{
						self._hiddenSubtabs[entry.subtab.id] = true;
					}
				}
			}
		});

        // iterate through each entry properties to populate the UI
        _.each(this.manifest, function (entry)
        {
            _.each(entry.properties, function(property, key)
            {
                self.processConfigValue(key, property);
            });
        });

        var title2;
        if(this.config.readonly)
        {
        	title2 = 'Configuration successfully saved. ' ;
        }
        else
        {
        	domain =  this.config.request.getParameter((this.config.request.getMethod() === 'POST') ? 'custpage_sc_config_domain': 'domain') ;
        	title2 =
				'Configuring website: "' + webSiteRecord.getFieldValue('displayname') +
				(domain ? '", domain: <a href="http://' + domain +'">'+domain+'</a>' : '') ;
        }
        title2 += (this.debug ? '<p>Debug: ' + this.debug + '</p>' : '');
		this.form
			.addField('custpage_params', 'inlinehtml')
			.setLayoutType('normal', 'startrow')
			.setDefaultValue(title2);
	}

,	entryIsVisible: function(entry, websiteScope, context)
	{
		try
		{
			if(entry.hidden) return false;

			if(entry.showIfAnyWebsiteScope && entry.showIfAnyWebsiteScope.indexOf(websiteScope) < 0) return false;

			if(entry.showIfNoneWebsiteScope && entry.showIfNoneWebsiteScope.indexOf(websiteScope) >= 0) return false;

			var	showIfAnyFeatures = false
			,	i;

			if(entry.showIfAllFeatures)
			{
				for(i=0; i<entry.showIfAllFeatures.length; i++)
				{
					if(!context.getFeature(entry.showIfAllFeatures[i])) return false;
				}
			}

			if(entry.showIfAnyFeatures)
			{
				for(i=0; i<entry.showIfAnyFeatures.length; i++)
				{
					if(context.getFeature(entry.showIfAnyFeatures[i])){
						showIfAnyFeatures = true;
						break;
					}
				}
				if(!showIfAnyFeatures) return false;
			}

			if(entry.showIfNoneFeatures)
			{
				for(i=0; i<entry.showIfNoneFeatures.length; i++)
				{
					if(context.getFeature(entry.showIfNoneFeatures[i])) return false;
				}
			}

			return true;
		}
		catch(e)
		{
			nlapiLogExecution('DEBUG','Error',JSON.stringify(e));
			return true;
		}
	}

,	findMetaProperty: function(id)
	{
		var metaProperty = null;

		_.find(this.manifest, function(entry)
		{
			if (entry.properties && entry.properties[id])
			{
				metaProperty = entry.properties[id];
			}
		});

		return metaProperty;
	}

,	getDefaultConfig: function(manifest)
	{
		manifest = manifest || configurationManifests;

		var self = this
		,	defaultConfig = {};

		// set all the values only if the group exists
		_.each(manifest, function(entry)
		{
			_.each(entry.properties, function(value, key)
			{
				if (value.default)
				{
					self.setPathFromObject(defaultConfig, key, value.default);
				}
			});
		});

		return defaultConfig;
	}

	// @method processConfigValue load an individual configObject in the UI. It will use other sub-type editors like the ArrayEditor
	// @param {Object} configValue @param {nlobjTab} tab
,	processConfigValue: function (configId, configValue)
	{
        var form = this.form
        ,   self = this
        ,   tab = self.transformId(configValue.group);

        if(tab && configValue.group && !this._hiddenGroups[configValue.group])
        {
        	if(configValue.subtab && !this._hiddenGroups[configValue.subtab])
        	{
				var subTabId = tab+'_'+configValue.subtab.toLowerCase();
				if(self._subtabs[subTabId])
				{
					tab = subTabId;
				}
        	}

            if(configValue.type !== 'array') // treat as field
            {
                var fieldData = self.propertyToField(configId, configValue);
                var field = self.addFieldTo(form, fieldData, tab);
                var value = this.getPathFromObject(self.configuration, configId, fieldData.default);                
                var val = this.setFieldValue(value, configValue.type);
                field.setDefaultValue(val);                
            }
            else
            {
                var arrayEditor = new ArrayEditor({
                	form: form
                ,	tab: tab
                ,	propertyId: configId
                ,	propertyValue: configValue
                ,	configuration: self.configuration
                ,	manifest: self.manifest
                ,	readonly: self.config.readonly
            	});
                arrayEditor.load();
                self.debug += arrayEditor.debug;
            }
        }
	}

	// @method fetch given a POST request by submitting the UI form, it will generate the edited JSON object form that data.
	// @para {nlobjRequest} request @returns {Object}
,	fetch: function(request)
	{
		var self = this;
		var s = '';
		var params = request.getAllParameters();
		var parsed = {};

		for (var param in params)
		{
			if (param.indexOf('custpage_') === 0)
			{
				var name = '';
				var value = '';

				//support for sublists - array of objects
				if (param.indexOf('custpage_list_') === 0)
				{
					if (/data$/.test(param))
					{
						name = param.substring('custpage_list_'.length, param.length);
						name = name.substring(0, name.lastIndexOf('data'));						
						var fields = params[param.substring(0, param.lastIndexOf('data')) + 'fields'];
						var types = params[param.substring(0, param.lastIndexOf('data')) + 'types'];

						value = self.parseLineItems(params[param], fields, types);
						name = name.replace(/__/g, '.');
						name = self.toCamelCase(name);
						self.setPathFromObject(parsed, name, value);

					}
				}
				else //support for simple types
				{
					name = param.substring('custpage_field_'.length, param.length);
					name = name.replace(/__/g, '.');
					name = self.toCamelCase(name);					
					var metaProperty = self.findMetaProperty(name);

					if(metaProperty && metaProperty.type)
					{
						value = self.getFieldValue(params[param],  metaProperty.type);

						if(metaProperty.multiselect)
						{
							//heads up! netsuite's is separating multiselect values with \x5 character
							value = (value === '') ? [] : value.split(/\x5/);
						}
						// if(metaProperty.enum && metaProperty.enum.length && _.isObject(metaProperty.enum[0]))
						// {
						// 	value = _.find(metaProperty.enum, function(enum) { return enum.name === value}).value;
						// }						
						self.setPathFromObject(parsed, name, value);
					}
				}
			}
		}
		return parsed;
	}

	// Note: netsuite is separating lines with char \x2 and line items with char \x1
,	parseLineItems: function (values, fields, types)
	{
		var result = [];
		//if are not elements in the list, return an empty one list
		if (values === '')
		{
			return result;
		}
		var lines = values.split(/\x2/);

		fields = fields.split(/\x1/);
		types = types.split(/\x1/);
		if (fields.length === 1)
		{
			if (types[0] === 'checkbox')
			{
				for (var i = 0; i < lines.length; i++)
				{
					lines[i] = this.getFieldValue(lines[i], types[0]);
				}
			}
			return lines;
		}
		else
		{
			for (var i = 0; i < lines.length; i++)
			{
				var line = lines[i].split(/\x1/);
				var obj = {};

				for (var j = 0; j < fields.length; j++)
				{
					var value = this.getFieldValue(line[j], types[j]);
					if (result || result === false)
					{
						var name = fields[j].substring('custpage_field_'.length, fields[j].length);
						obj[this.toCamelCase(name)] = value;
					}
				}

				result.push(obj);
			}
			return result;
		}
	}
});



/* File: src/ArrayEditor.js*/
// @module suiteEditor @class ArrayEditor
// It uses a subList for representing the array of objects. If items.type=='object' then we use subList with multiple fields/columns for properties. So, this object's properties must be simple values.
// @extends AbstractEditor
function ArrayEditor()
{
	AbstractEditor.apply(this, arguments);
}
ArrayEditor.prototype = new AbstractEditor();
_.extend(ArrayEditor.prototype, {

	load: function()
	{
		var form = this.config.form;
		var tab = this.config.tab
		var self = this;
		var list = form.addSubList('custpage_list_' + self.toUnderscore(self.propertyId).replace(/\./gi,'__'), 'inlineeditor', self.propertyValue.title, tab);

		var helpText = self._sublistExtractHelpText()


		list.setHelpText(helpText);

		var values = this.getPathFromObject(self.configuration, self.propertyId, self.propertyValue.default);

		if(self.propertyValue.items.type === 'object')
		{
			_.each(self.propertyValue.items.properties, function (propertyVal, propertyKey)
			{
				var listProperty = self.propertyToField(propertyKey, propertyVal);
				self.addFieldTo(list, listProperty);

				if (values)
				{
					_.each(values, function(value, index)
					{
						var fieldId = self.transformFieldId(self.toUnderscore(propertyKey).replace(/\./gi,'__'))
						,	val = self.setFieldValue(value[propertyKey], propertyVal.type);

						list.setLineItemValue(fieldId, index + 1, val);
					});
				}
			});
		}
		else
		{
			var obj = self.propertyToField(self.propertyId, self.propertyValue.items);
			self.addFieldTo(list, obj);
			if(values)
			{
				// load defaults
				for(var i = 0; i < values.length; i++)
				{
					var val = self.setFieldValue(values[i], obj.type);
					list.setLineItemValue(obj.id, i + 1, val);
				}
			}
		}
	}


	//@method _sublistExtractHelpText internal utility for extracting not only the help text for the array field but also from each object property in case is an array of objects.
	//Note: because ns sublist children dont support help text at the column level - we obtain all columns here and show them as part of the sublist help itself

,	_sublistExtractHelpText: function()
	{
		var self = this
		  , helpText = '<div style="color:#5A6F8F; font-weight:bold; white-space:nowrap; background:white;margin: 0 4px 0 4px;padding: 2px 2px 0 2px; font-size:13px">' + self.propertyValue.title + '</div>';
		helpText += self.createHelpLink(self.propertyValue.docRef);
		return helpText ;
	}

});



/* File: src/ConfigurationSchema.js*/
// @module suiteEditor
// @class ConfigurationSchema a tool that, given a website id and domain, obtains the configuration schema object.
// TODO: move everything from sclite-manifest-helper to here and remove that file.

function ConfigurationSchema(website, domain)
{
	'use strict';
	// @property {String} website
	this.website = website;
	// @property {String} domain
	this.domain = domain;
	// @property {Object} manifest
	this.manifest = this.getManifest(this.website, this.domain, 'configurationManifest.json');

	var manifest_domain;

	try
	{
		manifest_domain = this.getManifest(this.website, this.domain, 'extensions/configurationManifest-' + this.domain + '.json');
	}
	catch (error)
	{}

	if (manifest_domain)
	{
		var Configuration = require('Configuration')
		,	ConfigurationTool = new Configuration()
		,	modifications = ConfigurationTool.getModifications(manifest_domain)
		,	manifest_complete = this.manifest.concat(manifest_domain);

		if (modifications.length)
		{
			var errors = ConfigurationTool.modifications(manifest_complete, modifications);

			if (errors.length)
			{
				throw nlapiCreateError('SCA_MOD_MANIFEST', 'Configuration Modifications error for domain ' + this.domain, true);
			}
		}

		this.manifest = manifest_complete;
	}
}

_.extend(ConfigurationSchema.prototype, {

	//@method getKey given a domain and a website builds the key for the custom record that will store the configuration object for that domain-website.
	getKey: function ()
	{
		'use strict';
		return this.domain ? this.website + '|' + this.domain : this.website;
	}

	/*
	@method getConfigurationRecord Usage:

		JSON.parse(schema.getConfigurationRecord().getValue('custrecord_ns_scc_value')) || {}

	@return {nlobjRecord}
	*/
,	getConfigurationRecord: function()
	{
		'use strict';
		var search = nlapiCreateSearch('customrecord_ns_sc_configuration',
			[new nlobjSearchFilter('custrecord_ns_scc_key', null, 'is', this.getKey())],
			[new nlobjSearchColumn('custrecord_ns_scc_value')]
		);

		var result = search.runSearch().getResults(0, 1000);

		if (result.length)
		{
			return result[result.length - 1];
		}
		else
		{
			return null;
		}
	}

	// @method getManifest given a website and domain this method read the manifest file from the ssp and @returns {Object}
,	getManifest: function (websiteId, domain, manifest_file)
	{
		'use strict';
		var website = nlapiLoadRecord('website', websiteId)
		,   manifest;

		if (domain)
		{
			manifest = this.getManifestByDomain(website, domain, manifest_file);
		}

		if (!manifest)
		{
			manifest = this.getManifestByWebsite(website, manifest_file);
		}

		if(!manifest)
		{
			throw nlapiCreateError('SCA_NO_MANIFEST', 'No manifest was found by ' + manifest_file, true);
		}

		return JSON.parse(manifest.getValue());
	}

,	getManifestByDomain: function (website, domain, manifest_file)
	{
		'use strict';
		var count = website.getLineItemCount('shoppingdomain')
		,    domains = [];

		for (var i = 1; i < count + 1; i++)
		{
			var domainValue =  website.getLineItemValue('shoppingdomain', 'domain', i);
			var touchpointsValue =  website.getLineItemValue('shoppingdomain', 'touchpoints', i);
			domains.push({ domain: domainValue, touchpoints: touchpointsValue});
		}

		if (!domains)
		{
			return;
		}

		var webAppId;

		try
		{
			for (i = 0; i < domains.length; i++)
			{
				if (domains[i].domain === domain)
				{
					var touchpoints = JSON.parse(domains[i].touchpoints);
					if (touchpoints)
					{
						for (var key in touchpoints[0])
						{
							webAppId = touchpoints[0][key];
							if (webAppId)
							{
								break;
							}
						}
					}
					break;
				}
			}
		}
		catch (ex) {}

		if(!webAppId)
		{
			return;
		}

		return this.searchManifestBySsp(webAppId, manifest_file);
	}

,	getManifestByWebsite: function (website, manifest_file)
	{
		'use strict';
		var webAppId =  website.getLineItemValue('entrypoints', 'webapp', 1);

		return this.searchManifestBySsp(webAppId, manifest_file);
	}

	// @method searchManifestBySsp @param {String} webAppId @returns {nlobjFile} the file record containing the manifest
,	searchManifestBySsp: function (webAppId, manifest_file)
	{
		'use strict';
		if (!webAppId)
		{
			throw nlapiCreateError('SCA_INVALID_WEBAPPID', 'Invalid webapp id :"' + manifest_file + '"', true);
		}

		var appInfo = this.getAppInfo(webAppId);

		var appFolder = nlapiLoadRecord('folder', appInfo.folderId);

		if (!appFolder)
		{
			throw nlapiCreateError('SCA_SPPFOLDER_NOTFOUND', 'Folder with id ' + appInfo.folderId + ' was not found', true);
		}

		var folderId = appFolder.getId();

		var path_tree = manifest_file.split('/');

		var manifest_name = path_tree.pop();

		while (path_tree.length)
		{
			var folder_name = path_tree.shift();

			var folder = nlapiSearchRecord(
				'folder'
			,	null
			,	[new nlobjSearchFilter('parent', null, 'is', folderId), new nlobjSearchFilter('name', null, 'is', folder_name)]
			);

			if(folder && folder[0])
			{
				folderId = folder[0].getId();
			}
			else
			{
				throw nlapiCreateError('SCA_NO_MANIFEST', 'No manifest was found by ' + manifest_file, true);
			}

		}

		var manifestRecords = nlapiSearchRecord(
			'file'
			,	null
			,	[new nlobjSearchFilter('folder', null, 'is',folderId), new nlobjSearchFilter('name', null, 'is', manifest_name)]
			);

		if (!manifestRecords)
		{
			throw nlapiCreateError('SCA_NO_MANIFEST', 'No manifest was found by ' + manifest_file, true);
		}

		var manifestId = manifestRecords[0].getId();

		return nlapiLoadFile(manifestId);
	}

	// @method getAppInfo this method does the workaround for obtaining the folder id from given webapp refocord because that record is not yet scriptable so we need to do this nasty workaround. @param {String} webapp the webapp record id @returns{folderId:String}
,	getAppInfo: function (webapp)
	{
		'use strict';
		return {
			folderId: nlapiLookupField('webapp', webapp,'folderid')
		};
	}
});



/* File: src/sclite-select-suitelet.js*/
function getShoppingDomain()
{
	'use strict';
	if(window.location && window.location.hostname)
	{
		var suffix = window.location.hostname.substring(window.location.hostname.indexOf('.'));
		return 'shopping'+suffix;
	}
	else
	{
		return 'shopping.netsuite.com';
	}
}

function SCConfigurationSelect(request, response)
{
	'use strict';
	accessControl();
	var domain;
	if (request.getMethod() ==='GET')
	{
		var form = nlapiCreateForm('SuiteCommerce Configuration'); // title

		var websites = [];
		//get the script parameter
		var siteType = nlapiGetContext().getSetting('SCRIPT', 'custscript_ns_sc_site_type_param');
		var webSiteSearchFilters = new nlobjSearchFilter('sitetype', null, 'is', siteType);
		var webSiteSearchResults = nlapiSearchRecord('website', null, webSiteSearchFilters);

		for (var i = 0; i < webSiteSearchResults.length; i++)
		{
			websites.push(nlapiLoadRecord('website', webSiteSearchResults[i].getId()));
		}
		var website_select = form.addField('custpage_website', 'select', 'Select Website');
		website_select.setLayoutType('outsideabove','startrow');
		website_select.addSelectOption('-','Pick one');

		var domain_select = form.addField('custpage_domain', 'select', 'Select Domain');
		domain_select.setLayoutType('outsideabove','startrow');
		domain_select.setPadding(1);
		domain_select.addSelectOption('-','Pick one');

		var infoMessage = form.addField('custpage_website_info', 'inlinehtml');
		infoMessage.setLayoutType('outsideabove','startrow');
		infoMessage.setDefaultValue('');
		//each property is an objects like {domainData:[], warning: 'one string'}, the property name is id of the website.
		var websiteData = {};

		for (i = 0; i < websites.length; i++)
		{
			var ws = websites[i]
			,	domainsCount = ws.getLineItemCount('shoppingdomain');
			var websiteDomainData = [];
			var warning = '';
			website_select.addSelectOption(ws.getId(),ws.getFieldValue('displayname'));
			if(siteType ==='STANDARD')
			{
				websiteDomainData.push({name:getShoppingDomain()});
			}
			var primaryFound = false;

			for(var j = 0; j < domainsCount; j++)
			{
				domain =  ws.getLineItemValue('shoppingdomain', 'domain', j+1);
				var isPrimary = ws.getLineItemValue('shoppingdomain', 'isprimary', j+1);
				if(isPrimary === 'T')
				{
					websiteDomainData.push({name: domain, primary:true});
					primaryFound = true;
				}
				else
				{
					websiteDomainData.push({name: domain});
				}
			}
			//set the warning messages
			if(websiteDomainData.length > 1)
			{
				if (siteType ==='STANDARD')
				{
					if(primaryFound)
					{
						warning = 'One domain is set primary. Only the configuration for the primary domain will be active. Shopping.netsuite.com will still redirect to primary domain.';
					}
					else
					{
						warning = 'Showing shopping Netsuite domain. There are more domains created but none set as primary, Shopping domain will be active.';
					}
				}
				else if (primaryFound)
				{
					warning = 'One domain is set primary. Only the configuration for the primary domain will be active.';
				}
			}
			websiteData[ws.getId()] = {domainData: websiteDomainData, warning: warning};
		}
		form.addSubmitButton('Configure');
		form.addResetButton();

		var copyScript = "window.open(nlapiResolveURL('SUITELET', 'customscript_ns_sc_config_copy', 'customdeploy_ns_sc_config_copy') + '&sitetype=" + siteType + "','_self')";
		form.addButton('copy_button', 'Copy configuration', copyScript);

		//Send to the client all the data of the loaded websites
		var custpage_sc_config_ws_data = form.addField('custpage_sc_config_ws_data', 'inlinehtml');


		custpage_sc_config_ws_data.setDefaultValue(JSON.stringify(websiteData));
		custpage_sc_config_ws_data.setDisplayType('hidden');

		//setting up the script that change the values of the domain select on the client
		form.setScript('customscript_ns_sc_config_select_client');
		response.writePage(form);

	}
	else if (request.getMethod() === 'POST')
	{
		var configKey = request.getParameter('custpage_domain')
		,	websiteId = configKey.split('|')[0];
		domain = configKey.split('|')[1];


		var urlParams = [];
		urlParams.website = websiteId;
		if(domain)
		{
			urlParams.domain = domain;
		}

		nlapiSetRedirectURL('SUITELET', 'customscript_ns_sc_config', 1, null, urlParams);
	}
}


/* File: src/sclite-configuration-suitelet.js*/
// @module suiteEditor
// @function SCAConfiguration the MAIN request function - this name must be associated as the suitelet function in the script record
// @param {nlobjRequest} request @param {nlobjResponse} response
function SCAConfiguration(request, response)
{
	accessControl();
	var params = request.getAllParameters()
	,	websiteId = params['website']
	,	domain = params['domain'];

	if(request.getMethod() === 'POST')
	{
		websiteId = request.getParameter('custpage_sc_config_website');
		domain = request.getParameter('custpage_sc_config_domain');
	}

	var schema = new ConfigurationSchema(websiteId, domain)
	,	config = schema.getConfigurationRecord();

	var editor = new SchemaEditor({
		title: 'SuiteCommerce Configuration'
	,	manifest: schema.manifest
	,	configuration: config && JSON.parse(config.getValue('custrecord_ns_scc_value')) || {}
	,	configurationId: config && config.getId()
	,	request: request
	// ,	debugFolderId: schema.folderId
	// ,	readonly: request.getMethod() === 'POST' //will show a read only ui after user saves the form. Works but not desired - left it just as a reference.
	});

	if (request.getMethod() === 'POST')
	{
		var configuration
		,	configurationId = config && config.getId()
		,	data = editor.fetch(request);

		editor.configuration = data;

		if (configurationId)
		{
			configuration = nlapiLoadRecord('customrecord_ns_sc_configuration', configurationId);
		}
		else
		{
			configuration = nlapiCreateRecord('customrecord_ns_sc_configuration');
			configuration.setFieldValue('custrecord_ns_scc_key', schema.getKey());
		}

		configuration.setFieldValue('custrecord_ns_scc_value', JSON.stringify(data));
		nlapiSubmitRecord(configuration);
	}

	editor.load();

	// set key values for later post
	editor.form.addField('custpage_sc_config_website', 'text').setDisplayType('hidden').setDefaultValue(websiteId);
	if(domain)
	{
		editor.form.addField('custpage_sc_config_domain', 'text').setDisplayType('hidden').setDefaultValue(domain);
	}
	editor.form.addSubmitButton('Save');

	response.writePage(editor.form);

}



/* File: src/sclite-copy-suitelet.js*/
//jshint laxcomma:true
function SCConfigurationCopy(request, response)
{
	'use strict';
	accessControl();
	if (request.getMethod() === 'GET')
	{
		var form = nlapiCreateForm('Copy SuiteCommerce Configuration')
		,	siteType = request.getParameter('sitetype')
		,	websites = []
		,	webSiteSearchFilters = new nlobjSearchFilter('sitetype', null, 'is', siteType)
		,	webSiteSearchResults = nlapiSearchRecord('website', null, webSiteSearchFilters)
		;

		for (var i = 0; i < webSiteSearchResults.length; i++)
		{
			websites.push(nlapiLoadRecord('website', webSiteSearchResults[i].getId()));
		}

		var origin_website_select = form.addField('custpage_origin_website', 'select', 'Origin Website');
		origin_website_select.setLayoutType('outsideabove','startrow');
		origin_website_select.addSelectOption('-','Pick one');

		var origin_domain_select = form.addField('custpage_origin_domain', 'select', 'Origin Domain');
		origin_domain_select.setLayoutType('outsideabove','startrow');
		origin_domain_select.addSelectOption('-','Pick one');

		var destination_website_select = form.addField('custpage_destination_website', 'select', 'Destination Website');
		destination_website_select.setLayoutType('outsideabove','startrow');
		destination_website_select.setPadding(1);
		destination_website_select.addSelectOption('-','Pick one');

		var destination_domain_select = form.addField('custpage_destination_domain', 'select', 'Destination Domain');
		destination_domain_select.setLayoutType('outsideabove','startrow');
		destination_domain_select.addSelectOption('-','Pick one');

		var origin_infoMessage = form.addField('custpage_origin_website_info', 'inlinehtml');
		origin_infoMessage.setLayoutType('outsideabove','startrow');
		origin_infoMessage.setDefaultValue('');

		var destination_infoMessage = form.addField('custpage_destination_website_info', 'inlinehtml');
		destination_infoMessage.setLayoutType('outsideabove','startrow');
		destination_infoMessage.setDefaultValue('');


		// each property is an objects like {domainData:[], warning: 'one string'}, the property name is id of the website.
		var websiteData = {};

		for (i = 0; i < websites.length; i++)
		{
			var website = websites[i]
			,	domainsCount = website.getLineItemCount('shoppingdomain')
			,	websiteDomainData = []
			,	warning = ''
			;

			origin_website_select.addSelectOption(website.getId(),website.getFieldValue('displayname'));
			destination_website_select.addSelectOption(website.getId(),website.getFieldValue('displayname'));

			if(siteType ==='STANDARD')
			{
				websiteDomainData.push({name:getShoppingDomain()});
			}

			var primaryFound = false;
			for(var j = 0; j < domainsCount; j++)
			{
				var domain =  website.getLineItemValue('shoppingdomain', 'domain', j+1);
				var isPrimary = website.getLineItemValue('shoppingdomain', 'isprimary', j+1);
				if(isPrimary === 'T')
				{
					websiteDomainData.push({name: domain, primary:true});
					primaryFound = true;
				}
				else
				{
					websiteDomainData.push({name: domain});
				}
			}

			//set the warning messages
			if(websiteDomainData.length > 1)
			{
				if (siteType ==='STANDARD')
				{
					if(primaryFound)
					{
						warning = 'One domain is set primary. Only the configuration for the primary domain will be active. '+getShoppingDomain()+' will still redirect to primary domain.';
					}
					else
					{
						warning = 'Showing shopping Netsuite domain. There are more domains created but none set as primary, Shopping domain will be active.';
					}
				}
				else if (primaryFound)
				{
					warning = 'One domain is set primary. Only the configuration for the primary domain will be active.';
				}
			}
			websiteData[website.getId()] = {domainData: websiteDomainData, warning: warning};
		}

		form.addSubmitButton('Copy');
		form.addResetButton();

		//Send to the client all the data of the loaded websites
		var custpage_sc_config_ws_data = form.addField('custpage_sc_config_ws_data', 'inlinehtml');

		custpage_sc_config_ws_data.setDefaultValue(JSON.stringify(websiteData));
		custpage_sc_config_ws_data.setDisplayType('hidden');

		//setting up the script that change the values of the domain select on the client
		form.setScript('customscript_ns_sc_config_select_client');
		response.writePage(form);
	}
	else if (request.getMethod() === 'POST')
	{
		var origin_configKey = request.getParameter('custpage_origin_domain')
		,	origin_websiteId = origin_configKey.split('|')[0]
		,	origin_domain = origin_configKey.split('|')[1]

		,	destination_configKey = request.getParameter('custpage_destination_domain')
		,	destination_websiteId = destination_configKey.split('|')[0]
		,	destination_domain = destination_configKey.split('|')[1]

		,	origin_schema = new ConfigurationSchema(origin_websiteId, origin_domain)
		,	origin_config = origin_schema.getConfigurationRecord() ? JSON.parse(origin_schema.getConfigurationRecord().getValue('custrecord_ns_scc_value')) : {}

		// It's necessary to get the destination configuration to re write it if it exist or create it if it doesn't
		,	destination_schema = new ConfigurationSchema(destination_websiteId, destination_domain)
		,	destination_config = destination_schema.getConfigurationRecord()
		,	destination_id = destination_config && destination_config.getId()

		,	configuration
		;

		if (destination_id)
		{
			configuration = nlapiSubmitField('customrecord_ns_sc_configuration', destination_id, 'custrecord_ns_scc_value', JSON.stringify(origin_config));
		}
		else
		{
			configuration = nlapiCreateRecord('customrecord_ns_sc_configuration');
			configuration.setFieldValue('custrecord_ns_scc_key', destination_schema.getKey());
			configuration.setFieldValue('custrecord_ns_scc_value', JSON.stringify(origin_config));
			nlapiSubmitRecord(configuration);
		}


		var urlParams = [];
		urlParams.website = destination_websiteId;
		if(destination_domain)
		{
			urlParams.domain = destination_domain;
		}

		nlapiSetRedirectURL('SUITELET', 'customscript_ns_sc_config', 1, null, urlParams);
	}
}