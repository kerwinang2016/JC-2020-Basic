var WizardSettings = {
    qsType: 'Basic',
    bundleId: 65289,
    statusFilename: 'qs-basic-installation.json',
    folderIds: {
        suiteBundles: -16,
        liveHostingFiles: 1
    },
    webHostingName: 'Web Site Hosting Files',
    liveHostingName: 'Live Hosting Files'
};

function wizard() {

    'use strict';

    try {
        var method = request.getMethod(),
            data = JSON.parse(request.getBody() || '{}');

        for(var param in Wizard.params) {
            data[Wizard.params[param]] = request.getParameter(Wizard.params[param]);
        }

        switch (method) {
            case 'GET':
            case 'POST':
                data.method = method;
                Wizard.show(data);
                break;

            default:
                Wizard.sendError(methodNotAllowedError);
        }
    } catch (e) {
        Wizard.sendError(e);
    }

}

//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);


// Customized Backbone Validation Library
var Backbone = {};
// Copyright (c) 2011-2012 Thomas Pedersen
// Distributed under MIT License
//
// Documentation and full license available at:
// http://thedersen.com/projects/backbone-validation
Backbone.Validation = (function(_){
  'use strict';

  // Default options
  // ---------------

  var defaultOptions = {
    forceUpdate: false,
    selector: 'name',
    labelFormatter: 'sentenceCase',
    valid: Function.prototype,
    invalid: Function.prototype
  };


  // Helper functions
  // ----------------

  // Formatting functions used for formatting error messages
  var formatFunctions = {
    // Uses the configured label formatter to format the attribute name
    // to make it more readable for the user
    formatLabel: function(attrName, model) {
      return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
    },

    // Replaces nummeric placeholders like {0} in a string with arguments
    // passed to the function
    format: function() {
      var args = Array.prototype.slice.call(arguments),
          text = args.shift();
      return text.replace(/\{(\d+)\}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    }
  };

  // Flattens an object
  // eg:
  //
  //     var o = {
  //       address: {
  //         street: 'Street',
  //         zip: 1234
  //       }
  //     };
  //
  // becomes:
  //
  //     var o = {
  //       'address.street': 'Street',
  //       'address.zip': 1234
  //     };
  var flatten = function (obj, into, prefix) {
    into = into || {};
    prefix = prefix || '';

    _.each(obj, function(val, key) {
      if(obj.hasOwnProperty(key)) {
        if (val && typeof val === 'object' && !(
          val instanceof Date ||
          val instanceof RegExp /*||
          val instanceof Backbone.Model ||
          val instanceof Backbone.Collection*/)
        ) {
          flatten(val, into, prefix + key + '.');
        }
        else {
          into[prefix + key] = val;
        }
      }
    });

    return into;
  };

  // Validation
  // ----------

  var Validation = (function(){

    // Returns an object with undefined properties for all
    // attributes on the model that has defined one or more
    // validation rules.
    var getValidatedAttrs = function(model) {
      return _.reduce(_.keys(model.validation || {}), function(memo, key) {
        memo[key] = void 0;
        return memo;
      }, {});
    };

    // Looks on the model for validations for a specified
    // attribute. Returns an array of any validators defined,
    // or an empty array if none is defined.
    var getValidators = function(model, attr) {
      var attrValidationSet = model.validation ? model.validation[attr] || {} : {};

      // If the validator is a function or a string, wrap it in a function validator
      if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
        attrValidationSet = {
          fn: attrValidationSet
        };
      }

      // Stick the validator object into an array
      if(!_.isArray(attrValidationSet)) {
        attrValidationSet = [attrValidationSet];
      }

      // Reduces the array of validators into a new array with objects
      // with a validation method to call, the value to validate against
      // and the specified error message, if any
      return _.reduce(attrValidationSet, function(memo, attrValidation) {
        _.each(_.without(_.keys(attrValidation), 'msg'), function(validator) {
          memo.push({
            fn: defaultValidators[validator],
            val: attrValidation[validator],
            msg: attrValidation.msg
          });
        });
        return memo;
      }, []);
    };

    // Validates an attribute against all validators defined
    // for that attribute. If one or more errors are found,
    // the first error message is returned.
    // If the attribute is valid, an empty string is returned.
    var validateAttr = function(model, attr, value, computed) {
      // Reduces the array of validators to an error message by
      // applying all the validators and returning the first error
      // message, if any.
      return _.reduce(getValidators(model, attr), function(memo, validator){
        // Pass the format functions plus the default
        // validators as the context to the validator
        var ctx = _.extend({}, formatFunctions, defaultValidators),
            result = validator.fn.call(ctx, value, attr, validator.val, model, computed);

        if(result === false || memo === false) {
          return false;
        }
        if (result && !memo) {
          return validator.msg || result;
        }
        return memo;
      }, '');
    };

    // Loops through the model's attributes and validates them all.
    // Returns and object containing names of invalid attributes
    // as well as error messages.
    var validateModel = function(model, attrs) {
      var error,
          invalidAttrs = {},
          isValid = true,
          computed = _.clone(attrs),
          flattened = flatten(attrs);

      _.each(flattened, function(val, attr) {
        error = validateAttr(model, attr, val, computed);
        if (error) {
          invalidAttrs[attr] = error;
          isValid = false;
        }
      });

      return {
        invalidAttrs: invalidAttrs,
        isValid: isValid
      };
    };

    // Contains the methods that are mixed in on the model when binding
    var mixin = function(view, options) {
      return {

        // Check whether or not a value passes validation
        // without updating the model
        preValidate: function(attr, value) {
          return validateAttr(this, attr, value, _.extend({}, this.attributes));
        },

        // Check to see if an attribute, an array of attributes or the
        // entire model is valid. Passing true will force a validation
        // of the model.
        isValid: function(option) {
          var flattened = flatten(this.attributes);

          if(_.isString(option)){
            return !validateAttr(this, option, flattened[option], _.extend({}, this.attributes));
          }
          if(_.isArray(option)){
            return _.reduce(option, function(memo, attr) {
              return memo && !validateAttr(this, attr, flattened[attr], _.extend({}, this.attributes));
            }, true, this);
          }
          if(option === true) {
            this.validate();
          }
          return this.validation ? this._isValid : true;
        },

        // This is called by Backbone when it needs to perform validation.
        // You can call it manually without any parameters to validate the
        // entire model.
        validate: function(attrs, setOptions){
          var model = this,
              validateAll = !attrs,
              opt = _.extend({}, options, setOptions),
              validatedAttrs = getValidatedAttrs(model),
              allAttrs = _.extend({}, validatedAttrs, model.attributes, attrs),
              changedAttrs = flatten(attrs || allAttrs),

              result = validateModel(model, allAttrs);

          model._isValid = result.isValid;

          // After validation is performed, loop through all changed attributes
          // and call the valid callbacks so the view is updated.
          _.each(validatedAttrs, function(val, attr){
            var invalid = result.invalidAttrs.hasOwnProperty(attr);
            if(!invalid){
              opt.valid(view, attr, opt.selector);
            }
          });

          // After validation is performed, loop through all changed attributes
          // and call the invalid callback so the view is updated.
          _.each(validatedAttrs, function(val, attr){
            var invalid = result.invalidAttrs.hasOwnProperty(attr),
                changed = changedAttrs.hasOwnProperty(attr);

            if(invalid && (changed || validateAll)){
              opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector);
            }
          });

          /**** CUSTOM: we need to REMOVE the defer as it is useless server side ****/
          // Trigger validated events.
          // Need to defer this so the model is actually updated before
          // the event is triggered.
          // _.defer(function() {
          //   model.trigger('validated', model._isValid, model, result.invalidAttrs);
          //   model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
          // });
          /**** END CUSTOM ****/

          // Return any error messages to Backbone, unless the forceUpdate flag is set.
          // Then we do not return anything and fools Backbone to believe the validation was
          // a success. That way Backbone will update the model regardless.
          if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
            return result.invalidAttrs;
          }
        }
      };
    };

    // Helper to mix in validation on a model
    var bindModel = function(view, model, options) {
      _.extend(model, mixin(view, options));
    };

    // Removes the methods added to a model
    var unbindModel = function(model) {
      delete model.validate;
      delete model.preValidate;
      delete model.isValid;
    };

    // Mix in validation on a model whenever a model is
    // added to a collection
    var collectionAdd = function(model) {
      bindModel(this.view, model, this.options);
    };

    // Remove validation from a model whenever a model is
    // removed from a collection
    var collectionRemove = function(model) {
      unbindModel(model);
    };

    // Returns the public methods on Backbone.Validation
    return {

      // Current version of the library
      version: '0.8.0',

      // Called to configure the default options
      configure: function(options) {
        _.extend(defaultOptions, options);
      },

      // Hooks up validation on a view with a model
      // or collection
      bind: function(view, options) {
        var model = view.model,
            collection = view.collection;

        options = _.extend({}, defaultOptions, defaultCallbacks, options);

        if(typeof model === 'undefined' && typeof collection === 'undefined'){
          throw 'Before you execute the binding your view must have a model or a collection.\n' +
                'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
        }

        if(model) {
          bindModel(view, model, options);
        }
        else if(collection) {
          collection.each(function(model){
            bindModel(view, model, options);
          });
          collection.bind('add', collectionAdd, {view: view, options: options});
          collection.bind('remove', collectionRemove);
        }
      },

      // Removes validation from a view with a model
      // or collection
      unbind: function(view) {
        var model = view.model,
            collection = view.collection;

        if(model) {
          unbindModel(view.model);
        }
        if(collection) {
          collection.each(function(model){
            unbindModel(model);
          });
          collection.unbind('add', collectionAdd);
          collection.unbind('remove', collectionRemove);
        }
      },

      // Used to extend the Backbone.Model.prototype
      // with validation
      mixin: mixin(null, defaultOptions)
    };
  }());


  // Callbacks
  // ---------

  var defaultCallbacks = Validation.callbacks = {

    // Gets called when a previously invalid field in the
    // view becomes valid. Removes any error message.
    // Should be overridden with custom functionality.
    valid: function(view, attr, selector) {
      view.$('[' + selector + '~="' + attr + '"]')
          .removeClass('invalid')
          .removeAttr('data-error');
    },

    // Gets called when a field in the view becomes invalid.
    // Adds a error message.
    // Should be overridden with custom functionality.
    invalid: function(view, attr, error, selector) {
      view.$('[' + selector + '~="' + attr + '"]')
          .addClass('invalid')
          .attr('data-error', error);
    }
  };


  // Patterns
  // --------

  var defaultPatterns = Validation.patterns = {
    // Matches any digit(s) (i.e. 0-9)
    digits: /^\d+$/,

    // Matched any number (e.g. 100.000)
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

    // Matches a valid email address (e.g. mail@example.com)
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

    // Mathes any valid url (e.g. http://www.xample.com)
    url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
  };


  // Error messages
  // --------------

  // Error message for the build in validators.
  // {x} gets swapped out with arguments form the validator.
  var defaultMessages = Validation.messages = {
    required: '{0} is required',
    acceptance: '{0} must be accepted',
    min: '{0} must be greater than or equal to {1}',
    max: '{0} must be less than or equal to {1}',
    range: '{0} must be between {1} and {2}',
    length: '{0} must be {1} characters',
    minLength: '{0} must be at least {1} characters',
    maxLength: '{0} must be at most {1} characters',
    rangeLength: '{0} must be between {1} and {2} characters',
    oneOf: '{0} must be one of: {1}',
    equalTo: '{0} must be the same as {1}',
    pattern: '{0} must be a valid {1}'
  };

  // Label formatters
  // ----------------

  // Label formatters are used to convert the attribute name
  // to a more human friendly label when using the built in
  // error messages.
  // Configure which one to use with a call to
  //
  //     Backbone.Validation.configure({
  //       labelFormatter: 'label'
  //     });
  var defaultLabelFormatters = Validation.labelFormatters = {

    // Returns the attribute name with applying any formatting
    none: function(attrName) {
      return attrName;
    },

    // Converts attributeName or attribute_name to Attribute name
    sentenceCase: function(attrName) {
      return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function(match, index) {
        return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
      }).replace('_', ' ');
    },

    // Looks for a label configured on the model and returns it
    //
    //      var Model = Backbone.Model.extend({
    //        validation: {
    //          someAttribute: {
    //            required: true
    //          }
    //        },
    //
    //        labels: {
    //          someAttribute: 'Custom label'
    //        }
    //      });
    label: function(attrName, model) {
      return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
    }
  };


  // Built in validators
  // -------------------

  var defaultValidators = Validation.validators = (function(){
    // Use native trim when defined
    var trim = String.prototype.trim ?
      function(text) {
        return text === null ? '' : String.prototype.trim.call(text);
      } :
      function(text) {
        var trimLeft = /^\s+/,
            trimRight = /\s+$/;

        return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
      };

    // Determines whether or not a value is a number
    var isNumber = function(value){
      return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
    };

    // Determines whether or not not a value is empty
    var hasValue = function(value) {
      return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === ''));
    };

    return {
      // Function validator
      // Lets you implement a custom function used for validation
      fn: function(value, attr, fn, model, computed) {
        if(_.isString(fn)){
          fn = model[fn];
        }
        return fn.call(model, value, attr, computed);
      },

      // Required validator
      // Validates if the attribute is required or not
      required: function(value, attr, required, model, computed) {
        var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
        if(!isRequired && !hasValue(value)) {
          return false; // overrides all other validators
        }
        if (isRequired && !hasValue(value)) {
          return this.format(defaultMessages.required, this.formatLabel(attr, model));
        }
      },

      // Acceptance validator
      // Validates that something has to be accepted, e.g. terms of use
      // `true` or 'true' are valid
      acceptance: function(value, attr, accept, model) {
        if(value !== 'true' && (!_.isBoolean(value) || value === false)) {
          return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
        }
      },

      // Min validator
      // Validates that the value has to be a number and equal to or greater than
      // the min value specified
      min: function(value, attr, minValue, model) {
        if (!isNumber(value) || value < minValue) {
          return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
        }
      },

      // Max validator
      // Validates that the value has to be a number and equal to or less than
      // the max value specified
      max: function(value, attr, maxValue, model) {
        if (!isNumber(value) || value > maxValue) {
          return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
        }
      },

      // Range validator
      // Validates that the value has to be a number and equal to or between
      // the two numbers specified
      range: function(value, attr, range, model) {
        if(!isNumber(value) || value < range[0] || value > range[1]) {
          return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
        }
      },

      // Length validator
      // Validates that the value has to be a string with length equal to
      // the length value specified
      length: function(value, attr, length, model) {
        if (!hasValue(value) || trim(value).length !== length) {
          return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
        }
      },

      // Min length validator
      // Validates that the value has to be a string with length equal to or greater than
      // the min length value specified
      minLength: function(value, attr, minLength, model) {
        if (!hasValue(value) || trim(value).length < minLength) {
          return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
        }
      },

      // Max length validator
      // Validates that the value has to be a string with length equal to or less than
      // the max length value specified
      maxLength: function(value, attr, maxLength, model) {
        if (!hasValue(value) || trim(value).length > maxLength) {
          return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
        }
      },

      // Range length validator
      // Validates that the value has to be a string and equal to or between
      // the two numbers specified
      rangeLength: function(value, attr, range, model) {
        if(!hasValue(value) || trim(value).length < range[0] || trim(value).length > range[1]) {
          return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
        }
      },

      // One of validator
      // Validates that the value has to be equal to one of the elements in
      // the specified array. Case sensitive matching
      oneOf: function(value, attr, values, model) {
        if(!_.include(values, value)){
          return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
        }
      },

      // Equal to validator
      // Validates that the value has to be equal to the value of the attribute
      // with the name specified
      equalTo: function(value, attr, equalTo, model, computed) {
        if(value !== computed[equalTo]) {
          return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
        }
      },

      // Pattern validator
      // Validates that the value has to match the pattern specified.
      // Can be a regular expression or the name of one of the built in patterns
      pattern: function(value, attr, pattern, model) {
        if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
          return this.format(defaultMessages.pattern, this.formatLabel(attr, model), pattern);
        }
      }
    };
  }());

  return Validation;
}(_));


/* exported isLoggedIn, forbiddenError, getItemOptionsObject, formatCurrency, toCurrency, recordTypeExists, addAddressToResult, setPaymentMethodToResult, unauthorizedError, notFoundError, methodNotAllowedError, invalidItemsFieldsAdvancedName */
/* jshint -W079 */

// Create server side console
// use to log on SSP application
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

// Backbone.Events
// -----------------
// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback functions
// to an event; trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     _.extend(object, Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');

var slice = Array.prototype.slice
	// Regular expression used to split event strings
,	eventSplitter = /\s+/;

var Events = {

	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	on: function(events, callback, context) {
		'use strict';

		var calls, event, node, tail, list;

		if (!callback)
		{
			return this;
		}

		events = events.split(eventSplitter);
		calls = this._callbacks || (this._callbacks = {});

		// Create an immutable callback list, allowing traversal during
		// modification.  The tail is an empty object that will always be used
		// as the next node.
		while (!!(event = events.shift())) {
			list = calls[event];
			node = list ? list.tail : {};
			node.next = tail = {};
			node.context = context;
			node.callback = callback;
			calls[event] = {tail: tail, next: list ? list.next : node};
		}

		return this;
	},

	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	off: function(events, callback, context) {
		'use strict';
		var event, calls, node, tail, cb, ctx;

		// No events, or removing *all* events.
		if (!(calls = this._callbacks))
		{
			return;
		}

		if (!(events || callback || context)) {
			delete this._callbacks;
			return this;
		}

		// Loop through the listed events and contexts, splicing them out of the
		// linked list of callbacks if appropriate.
		events = events ? events.split(eventSplitter) : _.keys(calls);
		while (!!(event = events.shift())) {
			node = calls[event];
			delete calls[event];

			if (!node || !(callback || context))
			{
				continue;
			}

			// Create a new list, omitting the indicated callbacks.
			tail = node.tail;
			while ((node = node.next) !== tail) {
				cb = node.callback;
				ctx = node.context;
				if ((callback && cb !== callback) || (context && ctx !== context)) {
					this.on(event, cb, ctx);
				}
			}
		}

		return this;
	},

	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	trigger: function(events) {
		'use strict';

		var event, node, calls, tail, args, all, rest;
		if (!(calls = this._callbacks))
		{
			return this;
		}
		all = calls.all;
		events = events.split(eventSplitter);
		rest = slice.call(arguments, 1);

		// For each event, walk through the linked list of callbacks twice,
		// first to trigger the event, then to trigger any `"all"` callbacks.
		while (!!(event = events.shift())) {
			if (!!(node = calls[event])) {
				tail = node.tail;
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, rest);
				}
			}
			if (!!(node = all)) {
				tail = node.tail;
				args = [event].concat(rest);
				while ((node = node.next) !== tail) {
					node.callback.apply(node.context || this, args);
				}
			}
		}

		return this;
	}
};

// Aliases for backwards compatibility.
Events.bind = Events.on;
Events.unbind = Events.off;

// This sands for SuiteCommerce
var SC = {};

var Application = _.extend({

	originalModels: {}

,	extendedModels: {}

,	init: function () {}

,	wrapFunctionWithEvents: function (methodName, thisObj, fn)
	{
		'use strict';

		return _.wrap(fn, function (func)
		{
			// Gets the arguments passed to the function from the execution code (removes func from arguments)
			var args = _.toArray(arguments).slice(1);

			// Fires the 'before:ObjectName.MethodName' event most common 'before:Model.method'
			Application.trigger.apply(Application, ['before:' + methodName, thisObj].concat(args));

			// Executes the real code of the method
			var result = func.apply(thisObj, args);

			// Fires the 'before:ObjectName.MethodName' event adding result as 1st parameter
			Application.trigger.apply(Application, ['after:' + methodName, thisObj, result].concat(args));

			// Returns the result from the execution of the real code, modifications may happend in the after event
			return result;
		});
	}

,	defineModel: function (name, definition)
	{
		'use strict';

		Application.originalModels[name] = definition;
	}

,	pushToExtendedModels: function (name)
	{
		'use strict';

		var model = {};

		_.each(Application.originalModels[name], function (value, key)
		{
			if (typeof value === 'function')
			{
				model[key] = Application.wrapFunctionWithEvents(name + '.' + key, model, value);
			}
			else
			{
				model[key] = value;
			}
		});

		if (!model.validate)
		{
			model.validate = Application.wrapFunctionWithEvents(name + '.validate', model, function (data)
			{
				if (this.validation)
				{
					var validator = _.extend({
							validation: this.validation
						,	attributes: data
						}, Backbone.Validation.mixin)

					,	invalidAttributes = validator.validate();

					if (!validator.isValid())
					{
						throw {
							status: 400
						,	code: 'ERR_BAD_REQUEST'
						,	message: invalidAttributes
						};
					}
				}
			});
		}

		Application.extendedModels[name] = model;
	}

,	extendModel: function (name, extensions)
	{
		'use strict';

		if (Application.originalModels[name])
		{
			if (!Application.extendedModels[name])
			{
				Application.pushToExtendedModels(name);
			}

			var model = Application.extendedModels[name];

			_.each(extensions, function (value, key)
			{
				if (typeof value === 'function')
				{
					model[key] = Application.wrapFunctionWithEvents(name + '.' + key, model, value);
				}
				else
				{
					model[key] = value;
				}
			});
		}
		else
		{
			throw nlapiCreateError('APP_ERR_UNKNOWN_MODEL', 'The model ' + name + ' is not defined');
		}
	}

,	getModel: function (name)
	{
		'use strict';

		if (Application.originalModels[name])
		{
			if (!Application.extendedModels[name])
			{
				Application.pushToExtendedModels(name);
			}

			return Application.extendedModels[name];
		}
		else
		{
			throw nlapiCreateError('APP_ERR_UNKNOWN_MODEL', 'The model ' + name + ' is not defined');
		}

	}

,	sendContent: function (content, options)
	{
		'use strict';

		// Default options
		options = _.extend({status: 200, cache: false}, options || {});

		// Triggers an event for you to know that there is content being sent
		Application.trigger('before:Application.sendContent', content, options);

		// We set a custom status
		response.setHeader('Custom-Header-Status', parseInt(options.status, 10).toString());

		// The content type will be here
		var content_type = false;

		// If its a complex object we transform it into an string
		if (_.isArray(content) || _.isObject(content))
		{
			content_type = 'JSON';
			content = JSON.stringify( content );
		}

		// If you set a jsonp callback this will honor it
		if (request.getParameter('jsonp_callback'))
		{
			content_type = 'JAVASCRIPT';
			content = request.getParameter('jsonp_callback') + '(' + content + ');';
		}

		//Set the response chache option
		if (options.cache)
		{
			response.setCDNCacheable(options.cache);
		}

		// Content type was set so we send it
		content_type && response.setContentType(content_type);

		response.write(content);

		Application.trigger('after:Application.sendContent', content, options);
	}

,	processError: function (e)
	{
		'use strict';

		var status = 500
		,	code = 'ERR_UNEXPECTED'
		,	message = 'error';

		if (e instanceof nlobjError)
		{
			code = e.getCode();
			message = e.getDetails();
		}
		else if (_.isObject(e) && !_.isUndefined(e.status))
		{
			status = e.status;
			code = e.code;
			message = e.message;
		}
		else
		{
			var error = nlapiCreateError(e);
			code = error.getCode();
			message = (error.getDetails() !== '') ? error.getDetails() : error.getCode();
		}

		if (status === 500 && code === 'INSUFFICIENT_PERMISSION')
		{
			status = forbiddenError.status;
			code = forbiddenError.code;
			message = forbiddenError.message;
		}

		var content = {
			errorStatusCode: parseInt(status,10).toString()
		,	errorCode: code
		,	errorMessage: message
		};

		if (e.errorDetails)
		{
			content.errorDetails = e.errorDetails;
		}

		return content;
	}

,	sendError: function (e)
	{
		'use strict';

		Application.trigger('before:Application.sendError', e);

		var content = Application.processError(e)
		,	content_type = 'JSON';

		response.setHeader('Custom-Header-Status', content.errorStatusCode);

		if (request.getParameter('jsonp_callback'))
		{
			content_type = 'JAVASCRIPT';
			content = request.getParameter('jsonp_callback') + '(' + JSON.stringify(content) + ');';
		}
		else
		{
			content = JSON.stringify(content);
		}

		response.setContentType(content_type);

		response.write(content);

		Application.trigger('after:Application.sendError', e);
	}

,	getPaginatedSearchResults: function (options)
	{
		'use strict';

		options = options || {}; 

		var results_per_page = options.results_per_page || SC.Configuration.results_per_page
		,	page = options.page || 1
		,	columns = options.columns || []
		,	filters = options.filters || []
		,	record_type = options.record_type
		,	range_start = (page * results_per_page) - results_per_page
		,	range_end = page * results_per_page
		,	do_real_count = _.any(columns, function (column)
			{
				return column.getSummary();
			})
		,	result = {
				page: page
			,	recordsPerPage: results_per_page
			,	records: []
			};

		if (!do_real_count || options.column_count)
		{	
			var column_count = options.column_count || new nlobjSearchColumn('internalid', null, 'count')
			,	count_result = nlapiSearchRecord(record_type, null, filters, [column_count]);
			
			result.totalRecordsFound = parseInt(count_result[0].getValue(column_count), 10);
		}

		if (do_real_count || (result.totalRecordsFound > 0 && result.totalRecordsFound > range_start))
		{
			var search = nlapiCreateSearch(record_type, filters, columns).runSearch();
			result.records = search.getResults(range_start, range_end);

			if (do_real_count && !options.column_count)
			{
				result.totalRecordsFound = search.getResults(0, 1000).length;
			}
		}
		
		return result;
	}

,	getAllSearchResults: function (record_type, filters, columns)
	{
		'use strict';

		var search = nlapiCreateSearch(record_type, filters, columns);
		search.setIsPublic(true);

		var searchRan = search.runSearch()
		,	bolStop = false
		,	intMaxReg = 1000
		,	intMinReg = 0
		,	result = [];

		while (!bolStop && nlapiGetContext().getRemainingUsage() > 10)
		{
			// First loop get 1000 rows (from 0 to 1000), the second loop starts at 1001 to 2000 gets another 1000 rows and the same for the next loops
			var extras = searchRan.getResults(intMinReg, intMaxReg);

			result = Application.searchUnion(result, extras);
			intMinReg = intMaxReg;
			intMaxReg += 1000;
			// If the execution reach the the last result set stop the execution
			if (extras.length < 1000)
			{
				bolStop = true;
			}
		}

		return result;
	}

,	searchUnion: function (target, array)
	{
		'use strict';

		return target.concat(array);
	}

}, Events);

// Utilities
function getItemOptionsObject (options_string)
{
	'use strict';

	var options_object = [];

	if (options_string && options_string !== '- None -')
	{
		var split_char_3 = String.fromCharCode(3)
		,	split_char_4 = String.fromCharCode(4);

		_.each(options_string.split(split_char_4), function (option_line)
		{
			option_line = option_line.split(split_char_3);
			options_object.push({
				id: option_line[0]
			,	name: option_line[2]
			,	value: option_line[3]
			,	displayvalue: option_line[4]
			,	mandatory: option_line[1]
			});
		});
	}

	return options_object;
}

function formatCurrency (value, symbol)
{
	'use strict';
	var value_float = parseFloat(value);

	if (isNaN(value_float))
	{
		value_float = parseFloat(0); //return value;
	}

	var negative = value_float < 0;
	value_float = Math.abs(value_float);
	value_float = parseInt((value_float + 0.005) * 100, 10) / 100;

	var value_string = value_float.toString()

	,	groupseparator = ','
	,	decimalseparator = '.'
	,	negativeprefix = '('
	,	negativesuffix = ')'
	,	settings = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings ? SC.ENVIRONMENT.siteSettings : {};

	if (window.hasOwnProperty('groupseparator'))
	{
		groupseparator = window.groupseparator;
	}
	else if (settings.hasOwnProperty('groupseparator'))
	{
		groupseparator = settings.groupseparator;
	}

	if (window.hasOwnProperty('decimalseparator'))
	{
		decimalseparator = window.decimalseparator;
	}
	else if (settings.hasOwnProperty('decimalseparator'))
	{
		decimalseparator = settings.decimalseparator;
	}

	if (window.hasOwnProperty('negativeprefix'))
	{
		negativeprefix = window.negativeprefix;
	}
	else if (settings.hasOwnProperty('negativeprefix'))
	{
		negativeprefix = settings.negativeprefix;
	}

	if (window.hasOwnProperty('negativesuffix'))
	{
		negativesuffix = window.negativesuffix;
	}
	else if (settings.hasOwnProperty('negativesuffix'))
	{
		negativesuffix = settings.negativesuffix;
	}

	value_string = value_string.replace('.',decimalseparator);
	var decimal_position = value_string.indexOf(decimalseparator);

	// if the string doesn't contains a .
	if (!~decimal_position)
	{
		value_string += decimalseparator + '00';
		decimal_position = value_string.indexOf(decimalseparator);
	}
	// if it only contains one number after the .
	else if (value_string.indexOf(decimalseparator) === (value_string.length - 2))
	{
		value_string += '0';
	}

	var thousand_string = '';
	for (var i = value_string.length - 1; i >= 0; i--)
	{
		//If the distance to the left of the decimal separator is a multiple of 3 you need to add the group separator
		thousand_string = (i > 0 && i < decimal_position && (((decimal_position-i) % 3) === 0) ? groupseparator : '') + value_string[i] + thousand_string;
	}

	if (!symbol)
	{
		if (typeof session !== 'undefined' && session.getShopperCurrency)
		{
			symbol = session.getShopperCurrency().symbol;
		}
		else if (settings.shopperCurrency)
		{
			symbol = settings.shopperCurrency.symbol;
		}
		else if (SC && SC.ENVIRONMENT && SC.ENVIRONMENT.currentCurrency)
		{
			symbol = SC.ENVIRONMENT.currentCurrency.symbol;
		}

		if(!symbol)
		{
			symbol = '$';
		}
	}

	value_string  = symbol + thousand_string;

	return negative ? (negativeprefix + value_string + negativesuffix) : value_string;
}


function toCurrency (amount)
{
	'use strict';

	var r = parseFloat(amount);

	return isNaN(r) ? 0 : r;
}

// returns true if and only if the given record type name is present in the current account - useful for checking if a bundle is installed or not in this account.
function recordTypeExists (record_type_name) 
{
	'use strict';

	try 
	{
		nlapiCreateRecord(record_type_name);
	}
	catch (error)
	{
		return false;
	}
	return true;
}

function addAddressToResult (address, result)
{
	'use strict';

	result.addresses = result.addresses || {};

	address.fullname = address.attention ? address.attention : address.addressee;
	address.company = address.attention ? address.addressee : null;

	delete address.attention;
	delete address.addressee;

	if (!address.internalid)
	{
		address.internalid =	(address.country || '') + '-' +
								(address.state || '') + '-' +
								(address.city || '') + '-' +
								(address.zip || '') + '-' +
								(address.addr1 || '') + '-' +
								(address.addr2 || '') + '-' +
								(address.fullname || '') + '-' +
								address.company;

		address.internalid = address.internalid.replace(/\s/g, '-');
	}

	if (!result.addresses[address.internalid])
	{
		result.addresses[address.internalid] = address;
	}

	return address.internalid;
}

function setPaymentMethodToResult (record, result)
{
	'use strict';
	var paymentmethod = {
		type: record.getFieldValue('paymethtype')
	,	primary: true
	};

	if (paymentmethod.type === 'creditcard')
	{
		paymentmethod.creditcard = {
			ccnumber: record.getFieldValue('ccnumber')
		,	ccexpiredate: record.getFieldValue('ccexpiredate')
		,	ccname: record.getFieldValue('ccname')
		,	internalid: record.getFieldValue('creditcard')
		,	paymentmethod: {
				ispaypal: 'F'
			,	name: record.getFieldText('paymentmethod')
			,	creditcard: 'T'
			,	internalid: record.getFieldValue('paymentmethod')
			}
		};
	}

	if (record.getFieldValue('ccstreet'))
	{
		paymentmethod.ccstreet = record.getFieldValue('ccstreet');
	}

	if (record.getFieldValue('cczipcode'))
	{
		paymentmethod.cczipcode = record.getFieldValue('cczipcode');
	}

	if (record.getFieldValue('terms'))
	{
		paymentmethod.type = 'invoice';

		paymentmethod.purchasenumber = record.getFieldValue('otherrefnum');

		paymentmethod.paymentterms = {
				internalid: record.getFieldValue('terms')
			,	name: record.getFieldText('terms')
		};
	}

	result.paymentmethods = [paymentmethod];
}

function isLoggedIn ()
{
	'use strict';

	// MyAccount (We need to make the following difference because isLoggedIn is always false in Shopping)
	if (request.getURL().indexOf('https') === 0)
	{
		return session.isLoggedIn();
	}
	else // Shopping
	{
		return parseInt(nlapiGetUser() + '', 10) > 0 && !session.getCustomer().isGuest();
	}
}

/// Default error objetcs
var unauthorizedError = {
		status: 401
	,	code: 'ERR_USER_NOT_LOGGED_IN'
	,	message: 'Not logged In'
	}

,	forbiddenError = {
		status: 403
	,	code: 'ERR_INSUFFICIENT_PERMISSIONS'
	,	message: 'Insufficient permissions'
	}

,	notFoundError = {
		status: 404
	,	code: 'ERR_RECORD_NOT_FOUND'
	,	message: 'Not found'
	}

,	methodNotAllowedError = {
		status: 405
	,	code: 'ERR_METHOD_NOT_ALLOWED'
	,	message: 'Sorry, You are not allowed to preform this action.'
	}

,	invalidItemsFieldsAdvancedName = {
		status: 500
	,	code:'ERR_INVALID_ITEMS_FIELDS_ADVANCED_NAME'
	,	message: 'Please check if the fieldset is created.'
	};


var Wizard = _.extend(Application, {

    settings: WizardSettings,

    status: {
        steps: {}
    },

    params: ['step', 'robots_move', 'website_id'],

    loadStatusFile: function() {
        return nlapiLoadFile(this.settings.webHostingName+'/'+this.settings.liveHostingName+'/' + this.settings.statusFilename);
    },
    createStatusFile: function() {
        var statusFile = nlapiCreateFile(this.settings.statusFilename, 'PLAINTEXT', JSON.stringify(this.status));
        statusFile.setFolder(this.settings.folderIds.liveHostingFiles);
        nlapiSubmitFile(statusFile);
        return statusFile;
    },
    loadStatus: function() {
        try {
            this.status = JSON.parse(this.loadStatusFile().getValue());
        } catch(e) {
            if(e.code === 'RCRD_DSNT_EXIST') {
                this.createStatusFile();
            } else {
                throw e;
            }
        }
    },
    saveStatus: function() {
        try {
            nlapiDeleteFile(this.loadStatusFile().getId());
            this.createStatusFile();
        } catch(e) {
            if(e.code === 'RCRD_DSNT_EXIST') {
                this.createStatusFile();
            } else {
                throw e;
            }
        }
    },

    show: function(data) {
        this.loadStatus();
        var info = this.getModel('Model').get(data);
        info.params = data;
        this.sendContent(info);
        this.saveStatus();
    },

    /*run: function(data) {
        this.loadStatus();
        var info = this.getModel('Model').save(data);
        info.params = data;
        this.sendContent(info);
        this.saveStatus();
    },*/

    sendContent: function (data, options) {
        'use strict';

        options = _.extend({status: 200, cache: false}, options || {});

        var content = Wizard.getModel('View').renderContent(data),
            statusCode = parseInt(options.status, 10).toString();

        this.send(data, content, statusCode, 'sendContent');
    },

    /*sendResult: function (data, options) {
        'use strict';

        options = _.extend({status: 200, cache: false}, options || {});

        var content = Wizard.getModel('View').renderResult(data),
            statusCode = parseInt(options.status, 10).toString();

        this.send(data, content, statusCode, 'sendResult');
    },*/

    sendError: function (e) {
        'use strict';

        var data = Application.processError(e),
            content = Wizard.getModel('View').renderError(data),
            statusCode = data.errorStatusCode;

        this.send(e, content, statusCode, 'sendError');
    },

    send: function(data, content, statusCode, method) {
        Application.trigger('before:Application.'+method, data);

        response.setHeader('Custom-Header-Status', statusCode);
        response.setContentType('HTMLDOC');
        response.write(content);

        Application.trigger('after:Application.sendError'+method, data);
    }

});



Application.defineModel('Model.WebSite', {

    getFieldsets: function (){
        return this.fieldsets;
    },
    getHostingRoot: function() {
        return this.hostingRoot;
    },
    getFacets: function (){
        return this.facets;
    },

    hostingRoot: Wizard.settings.folderIds.liveHostingFiles,
    facets: [
        'pricelevel5'
    ],
    fieldsets: [
        {
            name: 'Search',
            id: 'search',
            fields: [
                'itemimages_detail',
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'displayname',
                'internalid',
                'itemid',
                'outofstockbehavior',
                'outofstockmessage',
                'stockdescription',
                'storedescription',
                'storedisplayname2',
                'storedisplaythumbnail',
                'urlcomponent',
                'isbackorderable',
                'ispurchasable',
                'isinstock',
                'custitem_ns_pr_rating',
                'custitem_ns_pr_count'
            ]
        },
        {
            name: 'Typeahead',
            id: 'typeahead',
            fields: [
                'itemimages_detail',
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'displayname',
                'internalid',
                'itemid',
                'storedisplayname2',
                'storedisplaythumbnail',
                'urlcomponent'
            ]
        },
        {
            name: 'Matrix Child Items',
            id: 'matrixchilditems',
            fields: [
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'quantityavailable',
                'internalid',
                'outofstockbehavior',
                'outofstockmessage',
                'stockdescription',
                'isbackorderable',
                'ispurchasable',
                'isinstock'
            ]
        },
        {
            name: 'Details',
            id: 'details',
            fields: [
                'displayname',
                'description',
                'itemid',
                'outofstockmessage',
                'outofstockbehavior',
                'showoutofstockmessage',
                'storedisplayimage',
                'quantityavailable',
                'stockdescription',
                'itemimages_detail',
                'featureddescription',
                'storedetaileddescription',
                'itemoptions_detail',
                'matrixchilditems_detail',
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'pagetitle2',
                'internalid',
                'isinactive',
                'isonline',
                'itemtype',
                'pagetitle',
                'storedescription2',
                'storedisplayname2',
                'urlcomponent',
                'isbackorderable',
                'ispurchasable',
                'isinstock',
                'custitem_ns_pr_attributes_rating',
                'custitem_ns_pr_item_attributes',
                'custitem_ns_pr_rating',
                'custitem_ns_pr_rating_by_rate',
                'custitem_ns_pr_count',
                'storedescription'
            ]
        },
        {
            name: 'Order',
            id: 'order',
            fields: [
                'displayname',
                'description',
                'itemid',
                'outofstockmessage',
                'outofstockbehavior',
                'showoutofstockmessage',
                'storedisplayimage',
                'quantityavailable',
                'stockdescription',
                'itemimages_detail',
                'featureddescription',
                'storedetaileddescription',
                'itemoptions_detail',
                'matrixchilditems_detail',
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'pagetitle2',
                'internalid',
                'isinactive',
                'isonline',
                'itemtype',
                'pagetitle',
                'storedescription2',
                'storedisplayname2',
                'urlcomponent',
                'isbackorderable',
                'ispurchasable',
                'isinstock'
            ]
        },
        {
            name: 'Related Items',
            id: 'relateditems',
            fields: [
                'itemimages_detail',
                'itemoptions_detail',
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'quantityavailable',
                'displayname',
                'internalid',
                'itemid',
                'outofstockbehavior',
                'outofstockmessage',
                'stockdescription',
                'storedescription',
                'storedisplayname2',
                'storedisplaythumbnail',
                'urlcomponent',
                'isbackorderable',
                'ispurchasable',
                'isinstock'
            ]
        },
        {
            name: 'Related Items Details',
            id: 'relateditems_details',
            fields: [
                'internalid',
                'relateditems_detail'
            ]
        },
        {
            name: 'Correlated Items',
            id: 'correlateditems',
            fields: [
                'itemimages_detail',
                'itemoptions_detail',
                'onlinecustomerprice',
                'onlinecustomerprice_detail',
                'quantityavailable',
                'displayname',
                'internalid',
                'outofstockbehavior',
                'outofstockmessage',
                'stockdescription',
                'storedescription',
                'storedisplayname2',
                'storedisplaythumbnail',
                'urlcomponent',
                'isbackorderable',
                'ispurchasable',
                'isinstock'
            ]
        },
        {
            name: 'Correlated Items Details',
            id: 'correlateditems_details',
            fields: [
                'internalid',
                'correlateditems_detail'
            ]
        }
    ]

});

Application.defineModel('Model.Content', {

    getCds: function() {
        return this.cds;
    },
    getMerchandising: function() {
        return this.merchandising;
    },

    merchandising: [
        {
            id: "home-merchandising",
            title: "Featured Items",
            fieldset: "search",
            results: 10
        }
    ],

    cds: [
        {
            type: "LANDING",
            title: "Contact Us",
            url: "/contactus",
            html: "contactus"
        },
        {
            type: "LANDING",
            title: "Contact Us - Thank you",
            url: "/contactus-thankyou",
            html: "contactus_thankyou"
        },
        {
            type: "LANDING",
            title: "Jobs",
            url: "/jobs",
            html: "jobs"
        },
        {
            type: "LANDING",
            title: "Our Guarantees",
            url: "/our_guarantees",
            html: "our_guarantees"
        },
        {
            type: "LANDING",
            title: "Who we are",
            url: "/who_we_are",
            html: "who_we_are"
        },
        {
            type: "ENHANCED",
            title: "Globals",
            targets: ["*", "/*"],
            rules: [
                {
                    target: ".content-toplogo",
                    name: "Content - Top Logo",
                    html: "toplogo"
                }
            ]
        },
        {
            type: "ENHANCED",
            title: "Home - Content",
            targets: ["/", "/?*"],
            rules: [
                {
                    target: "#home-slider",
                    name: "Home - Slider",
                    html: "slider"
                }
            ]
        },
        {
            type: "ENHANCED",
            title: "Demo Category",
            targets: ["/demo-category", "/demo-category?*"],
            rules: [
                {
                    target: "#banner-section-top",
                    name: "Demo Category - Banner Top",
                    html: "cat_banner_top"
                }
            ]
        }
    ]

});

Wizard.defineModel('Model', {

    steps: [
        'checkBundles',
        'assetsRobots',
        'website',
        'cdsMerch',
        'finished'
    ],

    get: function(params) {
        var data = {},
            step,
            status;
        for(var index in this.steps) {
            step = this.steps[index];
            status = this[step](params, data, Wizard.status.steps[step] || {});
            Wizard.status.steps[step] = status;
            if(!status.done) {
                break;
            }
        }
        return data;
    },

    /********************************
     ************ STEPS *************
     ********************************/

    checkBundles: function(params, data, status) {
        if(!status.done) {
            data.bundles = {
                cds: recordTypeExists('customrecord_ns_cd_content'),
                merchandising: recordTypeExists('customrecord_merch_rule'),
                reviews: recordTypeExists('customrecord_ns_pr_review'),
                prod_lists: recordTypeExists('customrecord_ns_pl_productlist')
            };
            status.data = data.bundles;
            for (var bundle in data.bundles) {
                if (!data.bundles[bundle]) {
                    status.done = false;
                    return status;
                }
            }
            status.done = true;
        } else {
            data.bundles = status.data;
        }
        return status;
    },

    assetsRobots: function(params, data, status) {
        if(status.done) {
            data.assets_robots = status.data;
        }
        else{
            var assetsFolders = this.getAssetsFolders(),
                assetsIdBundle = assetsFolders.bundle,
                assetsIdLive = assetsFolders.live;

            var robotsFiles = this.getRobotsFiles(),
                robotsFileBundle = robotsFiles.bundle,
                robotsFileLive = robotsFiles.live;

            if (params['step'] !== '2' || params.method === 'GET') {

                data.assets_robots = {
                    assets_moved: !assetsIdBundle && !!assetsIdLive,
                    robots_moved: !robotsFileBundle && !!robotsFileLive
                };

            } else {

                // statuses: success: 1, warning: 0, error: -1
                data.assets_robots = {
                    assets: {
                        status: (!assetsIdBundle && !!assetsIdLive)? 1 : -1,
                        code: 'SUCC_ASSETS_MOVED'
                    },
                    robots: {
                        status: (!robotsFileBundle && !!robotsFileLive)? 1 : -1,
                        code: 'SUCC_ROBOTS_MOVED'
                    }
                };

                var moveRobots = params['robots_move'];
                var liveHostingFilesId = Wizard.settings.folderIds.liveHostingFiles;;

                /* MOVE ASSETS */
                if(assetsIdBundle) {
                    if(!assetsIdLive) {
                        // move it to live hosting files
                        try {
                            nlapiSubmitField('folder', assetsIdBundle, 'parent', liveHostingFilesId);
                            // successfully moved
                            data.assets_robots.assets.status = 1;
                            data.assets_robots.assets.code = 'SUCC_ASSETS_MOVED';
                        } catch(e) {
                            // error moving
                            data.assets_robots.assets.status = -1;
                            data.assets_robots.assets.code = 'ERR_ASSETS_ON_MOVING';
                        }
                    } else {
                        // assets already exists
                        data.assets_robots.assets.status = 0;
                        data.assets_robots.assets.code = 'ERR_ASSETS_ALREADY_EXISTS';
                    }
                } else {
                    if(assetsIdLive) {
                        // already moved
                        data.assets_robots.assets.status = 1;
                        data.assets_robots.assets.code = 'SUCC_ASSETS_ALREADY_MOVED';
                    } else {
                        // no assets found
                        data.assets_robots.assets.status = -1;
                        data.assets_robots.assets.code = 'ERR_ASSETS_NOT_FOUND';
                    }
                }

                /* MOVE robots.txt */
                if(moveRobots === 'move') {
                    if(data.assets_robots.assets.status >= 0) {
                        if (robotsFileBundle) {
                            if (!robotsFileLive) {
                                // move it to live hosting files
                                robotsFileBundle.setFolder(liveHostingFilesId);
                                if(nlapiSubmitFile(robotsFileBundle) !== 0) {
                                    // successfully moved
                                    data.assets_robots.robots.status = 1;
                                    data.assets_robots.robots.code = 'SUCC_ROBOTS_MOVED';
                                } else {
                                    // error moving
                                    data.assets_robots.assets.status = -1;
                                    data.assets_robots.assets.code = 'ERR_ROBOTS_ON_MOVING';
                                }
                            } else {
                                // robots already exists
                                data.assets_robots.robots.status = 0;
                                data.assets_robots.robots.code = 'ERR_ROBOTS_ALREADY_EXISTS';
                            }
                        } else {
                            if (robotsFileLive) {
                                // already moved
                                data.assets_robots.robots.status = 1;
                                data.assets_robots.robots.code = 'SUCC_ROBOTS_ALREADY_MOVED';
                            } else {
                                // no robots found
                                data.assets_robots.robots.status = -1;
                                data.assets_robots.robots.code = 'ERR_ASSETS_NOT_FOUND';
                            }
                        }
                    } else {
                        // assets failed
                        data.assets_robots.robots.status = -1;
                        data.assets_robots.robots.code = 'ERR_ROBOTS_ASSETS_FAILED';
                    }
                    status.done = (data.assets_robots.robots.status >= 0);
                } else {
                    // do not move it
                    data.assets_robots.robots.status = 0;
                    data.assets_robots.robots.code = 'ERR_ROBOTS_NOT_MOVE';

                    status.done = (data.assets_robots.assets.status >= 0);
                }

                status.data = data.assets_robots;
            }
        }
        return status;
    },

    website: function(params, data, status) {
        if(status.done) {
            data.website = status.data || {};
        } else {
            if(params['step'] !== '3' || params.method == 'GET') {
                data.website = {
                    websites: []
                };

                // try to load websites
                for(var i = 0; i < 20; i++) {
                    var siteRecord = null;
                    try {
                        siteRecord = nlapiLoadRecord('website', i+1);
                    } catch (e) {
                    }
                    if(siteRecord) {
                        var type = siteRecord.getFieldValue('igniteedition');
                        if(type === 'ADVANCED') {
                            data.website.websites.push({
                                internalid: i+1,
                                internalname: siteRecord.getFieldValue('internalname'),
                                displayname: siteRecord.getFieldValue('displayname')
                            });
                        }
                    }
                }
            } else {

                var websiteId = parseInt(params['website_id'], 10),
                    websiteModel = Wizard.getModel('Model.WebSite'),
                    siteRecord = null;

                data.website = {
                    website_id: websiteId,
                    status: _.extend({
                        fieldsets: -1
                    }, status.data.status || {})
                };

                /* SET FIELDSETS */
                if(data.website.status.fieldsets < 0) {
                    siteRecord = nlapiLoadRecord('website', websiteId);
                    try {
                        var fieldsets = websiteModel.getFieldsets();
                        _.each(fieldsets, function (fieldset) {
                            siteRecord.selectNewLineItem('fieldset');
                            siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', fieldset.name);
                            siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', fieldset.id);
                            siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
                            siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', fieldset.fields.join(','));
                            siteRecord.commitLineItem('fieldset');
                        });
                        nlapiSubmitRecord(siteRecord);
                        data.website.status.fieldsets = 1;
                    } catch (e) {
                    }
                }

                status.done = true;
            }
        }
        status.data = data.website;
        return status;
    },

    cdsMerch: function(params, data, status) {
        data.cds_merch = {};
        if(status.done) {
            data.cds_merch = status.data;
        } else {
            if(params['step'] !== '4' || params.method == 'GET') {
                // do nothing
            } else {
                data.cds_merch = {
                    cds: {
                        landings: -1,
                        enhanced: -1
                    },
                    merch: -1
                };

                var contentModel = Wizard.getModel('Model.Content'),
                    websiteId = data.website.website_id;

                if(!status.done_cds) {
                    // ---- CDS ----
                    var contents = contentModel.getCds();

                    // CREATE LANDING PAGES
                    var landings = _.where(contents, {type: 'LANDING'}),
                        landingsSuccess = [];
                    _.each(landings, function (content) {
                        var html = WizardCds[content.html],
                            title = 'QuickStart ' + Wizard.settings.qsType + ': ' + content.title;

                        var contentRecord = nlapiCreateRecord('customrecord_ns_cd_content');
                        contentRecord.setFieldValue('name', title);
                        contentRecord.setFieldValue('custrecord_ns_cdc_content', html);
                        contentRecord.setFieldValue('custrecord_ns_cdc_type', 5);
                        contentRecord.setFieldValue('custrecord_ns_cdc_approved', 'T');
                        var contentRecordId = nlapiSubmitRecord(contentRecord, true);

                        if (contentRecordId > 0) {
                            var pageRecord = nlapiCreateRecord('customrecord_ns_cd_page');
                            pageRecord.setFieldValue('custrecord_ns_cdp_type', 1);
                            pageRecord.setFieldValue('name', title);
                            pageRecord.setFieldValue('custrecord_ns_cdp_url', content.url);
                            pageRecord.setFieldValue('custrecord_ns_cdp_site', websiteId);
                            pageRecord.setFieldValue('custrecord_ns_cdp_mainbody', contentRecordId);
                            pageRecord.setFieldValue('custrecord_ns_cdp_title', content.title);
                            pageRecord.setFieldValue('custrecord_ns_cdp_pageheader', content.title);
                            pageRecord.setFieldValue('custrecord_ns_cdp_status', 1);
                            pageRecord.setFieldValue('custrecord_ns_cdp_approved', 'T');
                            var pageRecordId = nlapiSubmitRecord(pageRecord, true);
                            if (pageRecordId > 0) {
                                landingsSuccess.push(pageRecordId);
                            }
                        }
                    });
                    if (landings.length === landingsSuccess.length) {
                        data.cds_merch.cds.landings = 1;
                    }

                    // CREATE ENHANCED PAGES
                    var enhanced = _.where(contents, {type: 'ENHANCED'}),
                        enhancedSuccess = [];
                    _.each(enhanced, function (content) {
                        var pageTitle = 'QuickStart ' + Wizard.settings.qsType + ': ' + content.title;

                        var pageRecord = nlapiCreateRecord('customrecord_ns_cd_page');
                        pageRecord.setFieldValue('custrecord_ns_cdp_type', 2);
                        pageRecord.setFieldValue('name', pageTitle);
                        pageRecord.setFieldValue('custrecord_ns_cdp_site', websiteId);
                        pageRecord.setFieldValue('custrecord_ns_cdp_status', 1);
                        pageRecord.setFieldValue('custrecord_ns_cdp_approved', 'T');
                        var pageRecordId = nlapiSubmitRecord(pageRecord, true);

                        if (pageRecordId > 0) {
                            var success = true;
                            // ADD TARGETS
                            _.each(content.targets, function (target) {
                                var targetRecord = nlapiCreateRecord('customrecord_ns_cd_query');
                                targetRecord.setFieldValue('custrecord_ns_cdq_pageid', pageRecordId);
                                targetRecord.setFieldValue('custrecord_ns_cdq_query', target);
                                var targetRecordId = nlapiSubmitRecord(targetRecord, true);
                                if (!(targetRecordId > 0)) {
                                    success = false;
                                }
                            });

                            _.each(content.rules, function (rule) {
                                var title = 'QuickStart ' + Wizard.settings.qsType + ': ' + rule.name,
                                    html = WizardCds[rule.html];

                                var contentRecord = nlapiCreateRecord('customrecord_ns_cd_content');
                                contentRecord.setFieldValue('name', title);
                                contentRecord.setFieldValue('custrecord_ns_cdc_content', html);
                                contentRecord.setFieldValue('custrecord_ns_cdc_type', 5);
                                contentRecord.setFieldValue('custrecord_ns_cdc_approved', 'T');
                                contentRecord.setFieldValue('custrecord_ns_cdc_status', 1);
                                var contentRecordId = nlapiSubmitRecord(contentRecord, true);

                                if (contentRecordId > 0) {

                                    var contentPageRecord = nlapiCreateRecord('customrecord_ns_cd_pagecontent');
                                    contentPageRecord.setFieldValue('custrecord_ns_cdpc_pageid', pageRecordId);
                                    contentPageRecord.setFieldValue('custrecord_ns_cdpc_target', rule.target);
                                    contentPageRecord.setFieldValue('custrecord_ns_cdpc_contentid', contentRecordId);
                                    var contentRecordId = nlapiSubmitRecord(contentPageRecord, true);
                                    if (!(contentRecordId > 0)) {
                                        success = false;
                                    }
                                }
                            });
                            if (success) {
                                enhancedSuccess.push(pageRecordId);
                            }
                        }

                    });
                    if (enhanced.length === enhancedSuccess.length) {
                        data.cds_merch.cds.enhanced = 1;
                    }
                    status.done_cds = true;
                }

                if(!status.done_merch) {

                    var merchRules = contentModel.getMerchandising(),
                        merchRulesSuccess = [];

                    var websiteRecord = nlapiLoadRecord('website', websiteId),
                        websiteName = websiteRecord.getFieldValue('internalname');

                    _.each(merchRules, function(merchRule) {

                        var fieldsetsColumns = [
                            new nlobjSearchColumn('internalid')
                        ];
                        var fieldsetFilters = [
                            new nlobjSearchFilter('custrecord_fieldset_id', null, 'is', merchRule.fieldset),
                            new nlobjSearchFilter('custrecord_site_name_fieldsets', null, 'is', websiteName)
                        ];
                        var fieldsetsResults = Wizard.getAllSearchResults('customrecord_merch_website_fieldsets', fieldsetFilters, fieldsetsColumns);

                        if(fieldsetsResults && fieldsetsResults.length) {
                            var fieldsetId = fieldsetsResults[0].getValue(fieldsetsColumns[0]);

                            var merchRuleRecord = nlapiCreateRecord('customrecord_merch_rule');
                            merchRuleRecord.setFieldValue('name', merchRule.id);
                            merchRuleRecord.setFieldValue('custrecord_merch_title', merchRule.title);
                            merchRuleRecord.setFieldValue('custrecord_site', websiteId);
                            merchRuleRecord.setFieldValue('custrecord_site_name_rule', websiteName);
                            merchRuleRecord.setFieldValue('custrecord_fieldset', fieldsetId);
                            merchRuleRecord.setFieldValue('custrecord_no_of_results', merchRule.results);
                            merchRuleRecord.setFieldValue('custrecord_is_approved', 'T');
                            merchRuleRecord.setFieldValue('custrecord_current_item', 'T');
                            merchRuleRecord.setFieldValue('custrecord_item_cart', 'T');
                            var merchRuleRecordId = nlapiSubmitRecord(merchRuleRecord, true);
                            if(merchRuleRecordId > 0) {
                                merchRulesSuccess.push(merchRuleRecordId);
                            }
                        }

                    });
                    if (merchRules.length === merchRulesSuccess.length) {
                        data.cds_merch.merch = 1;
                    }

                    status.done_merch = true;
                }

                status.done = status.done_cds && status.done_merch;
                status.data = data.cds_merch;
            }
        }
        return status;
    },

    finished: function(params, data, status) {
        data.finished = {};
        status.done = true;
        return status;
    },


    /********************************
     ************ UTILS *************
     ********************************/

    getAssetsFolders: function() {
        var baseFolder = 'Bundle '+Wizard.settings.bundleId,
            liveHostingFilesId = Wizard.settings.folderIds.liveHostingFiles;

        /* MOVE ASSETS FOLDER */
        var columns = [
            new nlobjSearchColumn('internalid'),
            new nlobjSearchColumn('parent')
        ];
        var filters = [
            new nlobjSearchFilter('name', null, 'is', 'assets')
        ];
        var results = Wizard.getAllSearchResults('folder', filters, columns);

        // search for all assets folder, and extract bundle and live ones
        var assetsIdBundle = null;
        var assetsIdLive = null;
        _.each(results, function(result) {
            var id = result.getValue(columns[0]),
                parentId = result.getValue(columns[1]),
                parentText = result.getText(columns[1]);
            if(parentId.toString() === liveHostingFilesId.toString()) {
                assetsIdLive = id;
            } else if(parentText === baseFolder) {
                // TODO: check that folder is child of SuiteBundles
                assetsIdBundle = id;
            }
        });
        return {
            bundle: assetsIdBundle,
            live: assetsIdLive
        };
    },
    getRobotsFiles: function() {
        var baseFolder = 'Bundle '+Wizard.settings.bundleId,
            basePath = 'SuiteBundles/'+baseFolder+'/';
        var robotsFileBundle = null;
        var robotsFileLive = null;
        try {
            robotsFileBundle = nlapiLoadFile(basePath + 'robots.txt');
        } catch(e) {}
        try {
            robotsFileLive = nlapiLoadFile(Wizard.settings.webHostingName+'/'+Wizard.settings.liveHostingName+'/robots.txt');
        } catch(e) {}
        return {
            bundle: robotsFileBundle,
            live: robotsFileLive
        };
    }

});

Wizard.defineModel('View', {

    mergeData: function (data) {
        return _.extend({
            settings: Wizard.settings,
            status: Wizard.status
        }, data);
    },

    parseHTML: function (data, template) {
        return WizardTemplates[template]({data: data});
    },

    renderContent: function (data) {
        return this.render(data, 'wizard');
    },

    renderResult: function (data) {
        return this.render(data, 'wizard');
    },

    renderError: function (data) {
        return this.render(data, 'error');
    },

    render: function (data, template) {
        data = this.mergeData(data);
        data.content = this.parseHTML(data, template);
        return this.parseHTML(data, "common");
    }
});



var WizardTemplates = {
	"common": _.template("<!DOCTYPE html>\r\n<html>\r\n<head lang=\"en\">\r\n    <meta charset=\"UTF-8\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" \/>\r\n    <title>SCA QuickStart <%= data.qsType %> - Installation Wizard<\/title>\r\n    <link rel=\"stylesheet\" type=\"text\/css\" href=\"https:\/\/netdna.bootstrapcdn.com\/bootstrap\/3.1.1\/css\/bootstrap.min.css\" \/>\r\n    <style type=\"text\/css\">\r\n        .wrapper {\r\n            max-width: 980px;\r\n            margin: auto;\r\n        }\r\n    <\/style>\r\n<\/head>\r\n<body>\r\n    <div class=\"wrapper row-fluid\">\r\n        <h1><a href=\"\">SCA QuickStart <%= data.qsType %> - Installation Wizard<\/a><\/h1>\r\n\r\n        <%= data.content %>\r\n\r\n    <\/div>\r\n    <!-- script type=\"text\/javascript\" src=\"\/\/code.jquery.com\/jquery-1.11.0.min.js\"><\/script>\r\n    <script type=\"text\/javascript\" src=\"\/\/cdnjs.cloudflare.com\/ajax\/libs\/underscore.js\/1.7.0\/underscore-min.js\"><\/script>\r\n    <script type=\"text\/javascript\" src=\"\/\/cdnjs.cloudflare.com\/ajax\/libs\/backbone.js\/1.1.2\/backbone-min.js\"><\/script -->\r\n<\/body>\r\n<\/html>"),
	"error": _.template("<h2>AN ERROR OCCURRED<\/h2>\r\n\r\n<p><strong>Status Code:<\/strong> <%= data.errorStatusCode %><\/p>\r\n<p><strong>Error Code:<\/strong> <%= data.errorCode %><\/p>\r\n<p><strong>Error Message:<\/strong> <%= data.errorMessage %><\/p>"),
	"wizard": _.template("<% var stepsStatus = data.status.steps; %>\r\n<form action=\"\" method=\"post\" class=\"form\">\r\n\r\n    <% if(data.bundles) { %>\r\n        <h3>1. Bundle Dependencies:<\/h3>\r\n\r\n        <% var all_bundles = true; %>\r\n        <ul>\r\n            <li>\r\n                Content Delivery Service: <span class=\"glyphicon <% if(data.bundles.cds) { %>glyphicon-ok text-success<% } else { all_bundles = false; %>glyphicon-remove text-danger<% } %>\"><\/span>\r\n            <\/li>\r\n            <li>\r\n                Product Merchandising: <span class=\"glyphicon <% if(data.bundles.merchandising) { %>glyphicon-ok text-success<% } else { all_bundles = false; %>glyphicon-remove text-danger<% } %>\"><\/span>\r\n            <\/li>\r\n            <li>\r\n                Product Reviews Records: <span class=\"glyphicon <% if(data.bundles.reviews) { %>glyphicon-ok text-success<% } else { all_bundles = false; %>glyphicon-remove text-danger<% } %>\"><\/span>\r\n            <\/li>\r\n            <li>\r\n                Product Lists Records: <span class=\"glyphicon <% if(data.bundles.prod_lists) { %>glyphicon-ok text-success<% } else { all_bundles = false; %>glyphicon-remove text-danger<% } %>\"><\/span>\r\n            <\/li>\r\n        <\/ul>\r\n        <% if(!all_bundles) { %>\r\n        <p class=\"bg-danger text-danger\">\r\n            Some required bundles are missing. Make sure you install them before continuing.\r\n        <\/p>\r\n        <div class=\"form-group\">\r\n            <button type=\"submit\" class=\"btn btn-primary\">I've installed them. Continue.<\/button>\r\n        <\/div>\r\n        <% } %>\r\n    <% } %>\r\n\r\n    <% if(data.assets_robots) { %>\r\n        <h3>2. Moving required files:<\/h3>\r\n\r\n        <% if(stepsStatus.assetsRobots && stepsStatus.assetsRobots.done) { %>\r\n        <p>Step finished. Status:<\/p>\r\n        <ul>\r\n            <li>\r\n                <% var assetsData = data.assets_robots.assets; %>\r\n                \"assets\" folder:\r\n                <% if(assetsData.status > 0) { %>\r\n                <span class=\"glyphicon glyphicon-ok text-success\"><\/span> <strong>Moved<\/strong>\r\n                <% } else if(assetsData.status === 0) { %>\r\n                <span class=\"glyphicon glyphicon-ok text-warning\"><\/span> <strong>Not moved<\/strong> - an \"assets\" folder exists in target location, please merge manually.\r\n                <% } else { %>\r\n                <span class=\"glyphicon glyphicon-remove text-error\"><\/span> <strong>Error moving<\/strong>\r\n                    <% if(assetsData.code === 'ERR_ASSETS_NOT_FOUND') { %>\r\n                    - \"assets\" folder not found in bundle folder.\r\n                    <% } %>\r\n                <% } %>\r\n            <\/li>\r\n            <li>\r\n                <% var robotsData = data.assets_robots.robots; %>\r\n                \"robots.txt\" file:\r\n                <% if(robotsData.status > 0) { %>\r\n                <span class=\"glyphicon glyphicon-ok text-success\"><\/span> <strong>Moved<\/strong>\r\n                <% } else if(robotsData.status === 0) { %>\r\n                <span class=\"glyphicon glyphicon-ok text-warning\"><\/span> <strong>Not moved<\/strong> - existing site is running in \"Live Hosting Files\".\r\n                <% } else { %>\r\n                <strong>Not moved<\/strong>\r\n                <% } %>\r\n            <\/li>\r\n        <\/ul>\r\n        <% } else { %>\r\n        <input type=\"hidden\" name=\"step\" value=\"2\" \/>\r\n        <p>Current status:<\/p>\r\n        <ul>\r\n            <li>\r\n                \"assets\" folder: <% if(data.assets_robots.assets_moved) { %><span class=\"glyphicon glyphicon-ok text-success\"><\/span> <strong>Already moved<\/strong><% } else { %><strong>Not yet moved<\/strong><% } %>\r\n            <\/li>\r\n            <li>\r\n                \"robots.txt\" file: <% if(data.assets_robots.robots_moved) { %><span class=\"glyphicon glyphicon-ok text-success\"><\/span> <strong>Already moved<\/strong><% } else { %><strong>Not yet moved<\/strong><% } %>\r\n            <\/li>\r\n        <\/ul>\r\n        <% if(!data.assets_robots.robots_moved) { %>\r\n        <p>Bundled \"assets\" folder and \"robots.txt\" need to be moved to \"Live Hosting Files\".<\/p>\r\n        <div class=\"form-group\">\r\n            <div class=\"radio\">\r\n                <label>\r\n                    <input type=\"radio\" name=\"robots_move\" value=\"move\" required \/> <strong>It's OK to move \"robots.txt\" to \"Live Hosting Files\"<\/strong>, I don't have another site running there.\r\n                <\/label>\r\n            <\/div>\r\n            <div class=\"radio\">\r\n                <label>\r\n                    <input type=\"radio\" name=\"robots_move\" value=\"not_move\" required \/> <strong>Do not move \"robots.txt\"<\/strong>, I don't want to affect the other Web Site.\r\n                <\/label>\r\n            <\/div>\r\n        <\/div>\r\n        <p>This step will attempt to move \"assets\" folder regardless of the robots option selected.<\/p>\r\n        <% } %>\r\n        <% if(!data.website) { %>\r\n        <div class=\"form-group\">\r\n            <button type=\"submit\" class=\"btn btn-primary\">Run Step 2<\/button>\r\n        <\/div>\r\n        <% } %>\r\n        <% } %>\r\n    <% } %>\r\n\r\n    <% if(data.website) { %>\r\n        <h3>3. Choose Web Site & Fieldsets:<\/h3>\r\n\r\n        <% if(stepsStatus.website && stepsStatus.website.done) { %>\r\n        <p>\r\n            Fieldsets set up. Status:\r\n            <% if(data.website.status.fieldsets >= 0) { %>\r\n            <span class=\"glyphicon glyphicon-ok text-success\"><\/span>\r\n            <% } else { %>\r\n            <span class=\"glyphicon glyphicon-remove text-error\"><\/span> You'll need to manually add the fieldsets.\r\n            <% } %>\r\n        <\/p>\r\n        <% } else { %>\r\n        <input type=\"hidden\" name=\"step\" value=\"3\" \/>\r\n        <p>The following will save the selected website, and set up in the fieldsets in it.<\/p>\r\n        <% if(data.website.websites && data.website.websites.length) { %>\r\n        <div class=\"form-group\">\r\n            <div class=\"row\">\r\n                <div class=\"col-md-4\">\r\n                    <select name=\"website_id\" size=\"<%- data.website.websites.length %>\" class=\"form-control\" required>\r\n                        <option value=\"\" selected>- Select a Web Site -<\/option>\r\n                        <% _.each(data.website.websites, function(website) { %>\r\n                        <option value=\"<%- website.internalid %>\"><%= website.displayname %> (<%= website.internalname %>)<\/option>\r\n                        <% }) %>\r\n                    <\/select>\r\n                <\/div>\r\n            <\/div>\r\n        <\/div>\r\n        <div class=\"form-group\">\r\n            <button type=\"submit\" class=\"btn btn-primary\">Run Setup<\/button>\r\n        <\/div>\r\n        <% } else { %>\r\n            <p class=\"bg-danger text-danger\">\r\n                No valid SuiteCommerce Advanced Web Site was found (at least with ID between 1 and 20). Make sure you create one before continuing.\r\n            <\/p>\r\n            <div class=\"form-group\">\r\n                <a href=\"\" class=\"btn btn-primary\">I've created one. Refresh.<\/a>\r\n            <\/div>\r\n        <% } %>\r\n        <% } %>\r\n    <% } %>\r\n\r\n    <% if(data.cds_merch) { %>\r\n        <h3>4. Content Delivery and Merchandising Zones:<\/h3>\r\n\r\n        <% if(stepsStatus.cdsMerch && stepsStatus.cdsMerch.done) { %>\r\n        Entries creation performed. Results:\r\n        <ul>\r\n            <li>\r\n                Content Delivery\r\n                <ul>\r\n                    <li>\r\n                        Landing Pages:\r\n                        <% if(data.cds_merch.cds.landings >= 0) { %>\r\n                        <span class=\"glyphicon glyphicon-ok text-success\"><\/span>\r\n                        <% } else { %>\r\n                        <span class=\"glyphicon glyphicon-remove text-error\"><\/span>\r\n                        <% } %>\r\n                    <\/li>\r\n                    <li>\r\n                        Enhanced Pages:\r\n                        <% if(data.cds_merch.cds.enhanced >= 0) { %>\r\n                        <span class=\"glyphicon glyphicon-ok text-success\"><\/span>\r\n                        <% } else { %>\r\n                        <span class=\"glyphicon glyphicon-remove text-error\"><\/span>\r\n                        <% } %>\r\n                    <\/li>\r\n                <\/ul>\r\n            <\/li>\r\n            <li>\r\n                Merchandising Zones:\r\n                <% if(data.cds_merch.merch >= 0) { %>\r\n                <span class=\"glyphicon glyphicon-ok text-success\"><\/span>\r\n                <% } else { %>\r\n                <span class=\"glyphicon glyphicon-remove text-error\"><\/span>\r\n                <% } %>\r\n            <\/li>\r\n        <\/ul>\r\n        <% } else { %>\r\n        <input type=\"hidden\" name=\"step\" value=\"4\" \/>\r\n        <p>QuickStart's Content Delivery and Merchandising Zones record entries will be created and associated to the above selected Web Site.<\/p>\r\n        <div class=\"form-group\">\r\n            <button type=\"submit\" class=\"btn btn-primary\">Create Entries<\/button>\r\n        <\/div>\r\n        <% } %>\r\n    <% } %>\r\n\r\n    <% if(data.finished) { %>\r\n        <h3>Done! You're good to go.<\/h3>\r\n    <% } %>\r\n<\/form>")
};

var WizardCds = {
	"cat_banner_top": "<img src=\"\/assets\/images\/content\/lb_woman.jpg\">",
	"contactus": "<div class=\"contact-us-image row-fluid\">\n    <div class=\"span4\">\n        <h3>Questions?<\/h3>\n        <p>Please fill out the form or call us toll free at:<\/p>\n        <p><a href=\"#\">1-800-992-9922<\/a><\/p>\n    <\/div>\n    <div class=\"span8\">\n        <div class=\"form-wrap\">\n            <form id=\"contact-us-form\" action=\"https:\/\/forms.na1.netsuite.com\/app\/site\/crm\/externalleadpage.nl?compid=TSTDRV1179634&formid=3&h=67aa3c807d9845129f2b\" method=\"POST\">\n                <fieldset>\n                    <label>First Name:<\/label>\n                    <input id=\"firstname\" name=\"firstname\" maxlength=\"300\" size=\"25\" type=\"text\">\n                    <label>Last Name:<\/label>\n                    <input id=\"lastname\" name=\"lastname\" maxlength=\"300\" size=\"25\" type=\"text\">\n                    <label>Email:<\/label>\n                    <input id=\"email\" maxlength=\"254\" name=\"email\" class=\"inputreq\" size=\"-1\" type=\"text\">\n                    <label>Message Title:<\/label>\n                    <input id=\"custentity_title\" maxlength=\"300\" name=\"custentity_title\" class=\"inputreq\" size=\"25\" type=\"text\">\n                    <label>Message:<\/label>\n                    <textarea name=\"comments\" id=\"comments\" rows=\"4\" class=\"inputreq textarea\"><\/textarea>\n                    <label><\/label>\n                    <button type=\"submit\" class=\"btn btn-primary\">Submit<\/button>\n\n\n                    <script>\n                        if (SC.ENVIRONMENT.jsEnvironment === \"browser\") {\n                            jQuery(document).ready(function () {\n                                jQuery('#contact-us-form').validate({\n                                    rules: {\n                                        email: {\n                                            required: true,\n                                            email: true\n                                        },\n                                        firstname: {\n                                            required: true\n                                        },\n                                        lastname: {\n                                            required: true\n                                        },\n                                        custentity_title: {\n                                            required: true\n                                        },\n                                        comments: {\n                                            required: true\n                                        }\n                                    }\n                                });\n                            });\n                        }\n                    <\/script>\n                <\/fieldset>\n            <\/form>\n        <\/div>\n    <\/div>\n<\/div>",
	"contactus_thankyou": "<br><br><font size=\"4\"><font size=\"5\">Your message was sent. Our customer care team will respond your inquiry shortly.&nbsp; <br><\/font><br><\/font><br><br>",
	"jobs": "<hr>\n\n<ul style=\"border: 0px; font-size: 13px; margin: 0px 0px 1em; outline: 0px; padding: 0px 1.3em; vertical-align: baseline; font-family: ff-tisa-web-pro-1, ff-tisa-web-pro-2, georgia, 'times new roman', times, serif; line-height: 18.2000007629395px;\"><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Lorem ipsum dolor sit amet, consectetuer adipiscing elit.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Aliquam tincidunt mauris eu risus.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vestibulum auctor dapibus neque.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Nunc dignissim risus id metus.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Cras ornare tristique elit.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vivamus vestibulum nulla nec ante.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Praesent placerat risus quis eros.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Fusce pellentesque suscipit nibh.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Integer vitae libero ac risus egestas placerat.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vestibulum commodo felis quis tortor.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Ut aliquam sollicitudin leo.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Cras iaculis ultricies nulla.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Donec quis dui at dolor tempor interdum.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vivamus molestie gravida turpis.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Fusce lobortis lorem at ipsum semper sagittis.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Nam convallis pellentesque nisl.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Integer malesuada commodo nulla.<\/li><\/ul><hr>",
	"our_guarantees": "<hr>\n\n<ul style=\"border: 0px; font-size: 13px; margin: 0px 0px 1em; outline: 0px; padding: 0px 1.3em; vertical-align: baseline; font-family: ff-tisa-web-pro-1, ff-tisa-web-pro-2, georgia, 'times new roman', times, serif; line-height: 18.2000007629395px;\"><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Lorem ipsum dolor sit amet, consectetuer adipiscing elit.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Aliquam tincidunt mauris eu risus.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vestibulum auctor dapibus neque.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Nunc dignissim risus id metus.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Cras ornare tristique elit.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vivamus vestibulum nulla nec ante.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Praesent placerat risus quis eros.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Fusce pellentesque suscipit nibh.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Integer vitae libero ac risus egestas placerat.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vestibulum commodo felis quis tortor.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Ut aliquam sollicitudin leo.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Cras iaculis ultricies nulla.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Donec quis dui at dolor tempor interdum.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Vivamus molestie gravida turpis.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Fusce lobortis lorem at ipsum semper sagittis.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Nam convallis pellentesque nisl.<\/li><li style=\"border: 0px; margin: 0px 0px 0.8em 1.3em; outline: 0px; padding: 0px; vertical-align: baseline; list-style: disc outside;\">Integer malesuada commodo nulla.<\/li><\/ul><hr>",
	"slider": "<a href=\"\/demo-category\"><img src=\"\/assets\/images\/content\/slider\/slider1.jpg\" \/><\/a>\n<a href=\"\/demo-category2\"><img src=\"\/assets\/images\/content\/slider\/slider2.jpg\" \/><\/a>\n<a href=\"\/search\"><img src=\"\/assets\/images\/content\/slider\/slider3.jpg\" \/><\/a>",
	"toplogo": "<p>Need help ordering? Call us anytime <a href=\"#\">1-800-992-9922<\/a><\/p>",
	"who_we_are": "<hr><p style=\"text-align: justify; font-size: 11px; line-height: 14px; margin: 0px 0px 14px; padding: 0px; font-family: Arial, Helvetica, sans;\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus interdum venenatis congue. Suspendisse ut vestibulum sapien. Vestibulum porta, lorem nec luctus porttitor, justo risus fringilla sapien, id consectetur justo enim in ex. Sed lectus ex, ornare at ipsum vel, iaculis convallis urna. Morbi venenatis felis ex. Quisque elementum aliquam ultricies. Donec commodo at velit ultricies pretium.<\/p><p style=\"text-align: justify; font-size: 11px; line-height: 14px; margin: 0px 0px 14px; padding: 0px; font-family: Arial, Helvetica, sans;\">Donec vel purus in lorem pulvinar finibus. Cras pellentesque nisi eros, at dictum nisi luctus consectetur. Nam pulvinar gravida leo, et commodo felis sollicitudin ac. Fusce eros velit, eleifend imperdiet metus quis, volutpat gravida sapien. Nullam ut quam purus. Phasellus finibus lacinia tortor ac sollicitudin. Proin quis velit ac tortor egestas placerat eu sit amet ante. Curabitur imperdiet tincidunt facilisis. Cras egestas dolor ac fermentum facilisis. Etiam non justo sem. Integer quis lorem at ante semper interdum. Fusce orci augue, dapibus non gravida eget, mollis non massa. Morbi augue ipsum, sollicitudin vel sagittis eget, bibendum vitae risus. Mauris eleifend arcu nulla.<\/p><p style=\"text-align: justify; font-size: 11px; line-height: 14px; margin: 0px 0px 14px; padding: 0px; font-family: Arial, Helvetica, sans;\">Sed a neque efficitur, vehicula diam at, hendrerit quam. Phasellus nunc massa, tristique nec erat commodo, sollicitudin volutpat nisi. Duis ut suscipit lorem. Nam pellentesque at libero ut fringilla. Aenean tincidunt purus ac felis convallis tincidunt. Aenean mauris risus, consectetur et tortor ac, porttitor mollis tellus. Sed congue vulputate ullamcorper. Praesent arcu nulla, tincidunt quis quam quis, congue varius elit. Donec porttitor felis mi, ac blandit ex ultricies at.<\/p><p style=\"text-align: justify; font-size: 11px; line-height: 14px; margin: 0px 0px 14px; padding: 0px; font-family: Arial, Helvetica, sans;\">Suspendisse eget ante ut lorem elementum sagittis in sit amet tellus. Curabitur congue enim ipsum, eu imperdiet eros consequat egestas. Quisque placerat congue metus, sit amet sagittis elit rutrum non. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras fermentum arcu et eros volutpat tempor sed in turpis. Nulla eget augue sed neque tristique malesuada in at massa. Curabitur sit amet varius lorem. Integer ut augue quis ligula sollicitudin congue.<\/p>\n\n<hr>"
};