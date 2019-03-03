(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.getYouTubeID = factory();
  }
}(this, function (exports) {

  return function (url, opts) {
    if (opts == undefined) {
      opts = {fuzzy: true};
    }

    if (/youtu\.?be/.test(url)) {

      // Look first for known patterns
      var i;
      var patterns = [
        /youtu\.be\/([^#\&\?]{11})/,  // youtu.be/<id>
        /\?v=([^#\&\?]{11})/,         // ?v=<id>
        /\&v=([^#\&\?]{11})/,         // &v=<id>
        /embed\/([^#\&\?]{11})/,      // embed/<id>
        /\/v\/([^#\&\?]{11})/         // /v/<id>
      ];

      // If any pattern matches, return the ID
      for (i = 0; i < patterns.length; ++i) {
        if (patterns[i].test(url)) {
          return patterns[i].exec(url)[1];
        }
      }

      if (opts.fuzzy) {
        // If that fails, break it apart by certain characters and look 
        // for the 11 character key
        var tokens = url.split(/[\/\&\?=#\.\s]/g);
        for (i = 0; i < tokens.length; ++i) {
          if (/^[^#\&\?]{11}$/.test(tokens[i])) {
            return tokens[i];
          }
        }
      }
    }

    return null;
  };

}));

},{}],2:[function(require,module,exports){
/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

},{}],3:[function(require,module,exports){
(function (global){
/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.14.7
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Popper = factory());
}(this, (function () { 'use strict';

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
var timeoutDuration = 0;
for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var window = element.ownerDocument.defaultView;
  var css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent || null;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TH, TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
}

function getWindowSizes(document) {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
  var width = sizes.width || element.clientWidth || result.right - result.left;
  var height = sizes.height || element.clientHeight || result.bottom - result.top;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  var parentNode = getParentNode(element);
  if (!parentNode) {
    return false;
  }
  return isFixed(parentNode);
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  padding = padding || 0;
  var isPaddingNumber = typeof padding === 'number';
  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var window = element.ownerDocument.defaultView;
  var styles = window.getComputedStyle(element);
  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroys the popper.
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicity asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
 * @returns {Object} The popper's position offsets rounded
 *
 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
 * good as it can be within reason.
 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
 *
 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
 * as well on High DPI screens).
 *
 * Firefox prefers no rounding for positioning and does not have blurriness on
 * high DPI screens.
 *
 * Only horizontal placement and left/right values need to be considered.
 */
function getRoundedOffsets(data, shouldRound) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;
  var round = Math.round,
      floor = Math.floor;

  var noRound = function noRound(v) {
    return v;
  };

  var referenceWidth = round(reference.width);
  var popperWidth = round(popper.width);

  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
  var isVariation = data.placement.indexOf('-') !== -1;
  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
  var verticalToInteger = !shouldRound ? noRound : round;

  return {
    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
    top: verticalToInteger(popper.top),
    bottom: verticalToInteger(popper.bottom),
    right: horizontalToInteger(popper.right)
  };
}

var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
    // and not the bottom of the html element
    if (offsetParent.nodeName === 'HTML') {
      top = -offsetParent.clientHeight + offsets.bottom;
    } else {
      top = -offsetParentRect.height + offsets.bottom;
    }
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    if (offsetParent.nodeName === 'HTML') {
      left = -offsetParent.clientWidth + offsets.right;
    } else {
      left = -offsetParentRect.width + offsets.right;
    }
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjunction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-end` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unit-less, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the `height`.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * A scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper. This makes sure the popper always has a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near each other
   * without leaving any gap between the two. Especially useful when the arrow is
   * enabled and you want to ensure that it points to its reference element.
   * It cares only about the first axis. You can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjunction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations)
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position.
     * The popper will never be placed outside of the defined boundaries
     * (except if `keepTogether` is enabled)
     */
    boundariesElement: 'viewport'
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define your own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the information used by Popper.js.
 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overridden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass an object with the same
 * structure of the `options` object, as the 3rd argument. For example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement.
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled.
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated. This callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js.
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Creates a new Popper.js instance.
   * @class Popper
   * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as the popper
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedules an update. It will run on the next UI update available.
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10.
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

return Popper;

})));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
module.exports=[
  "abaft",
  "abandoned",
  "abased",
  "abashed",
  "abasic",
  "abbatial",
  "abdicable",
  "abdicant",
  "abdicative",
  "abdominal",
  "abdominous",
  "abducent",
  "aberrant",
  "aberrational",
  "abeyant",
  "abhorrent",
  "abiotic",
  "ablaze",
  "able",
  "ablebodied",
  "ablutophobic",
  "abnormal",
  "abolitionary",
  "abominable",
  "aboriginal",
  "above",
  "aboveground",
  "abrupt",
  "absent",
  "absentminded",
  "absolute",
  "absolutistic",
  "abstract",
  "abstracted",
  "absurd",
  "abusive",
  "abysmal",
  "abyssal",
  "academic",
  "academical",
  "acardiac",
  "acceptable",
  "accepted",
  "accessible",
  "acclimatable",
  "acclimatisable",
  "acculturational",
  "acculturative",
  "accurate",
  "accused",
  "achluophobic",
  "achronite",
  "acid",
  "acidfast",
  "acidforming",
  "acidic",
  "acidifiable",
  "acidimetric",
  "acidimetrical",
  "acidophilic",
  "acidophobic",
  "acidotic",
  "acidulous",
  "aciduric",
  "acidy",
  "acoustic",
  "acquiescent",
  "acrid",
  "acrobatic",
  "acrophobic",
  "acrylic",
  "actinide",
  "actinium",
  "activated",
  "active",
  "actual",
  "actuarial",
  "actuarian",
  "acute",
  "adamantine",
  "adamantium",
  "added",
  "addictive",
  "additional",
  "addlebrained",
  "adept",
  "adequate",
  "adhesive",
  "adjacent",
  "adjoining",
  "administrative",
  "adobe",
  "adolescent",
  "adorable",
  "adored",
  "adoring",
  "adrenal",
  "adroit",
  "adult",
  "advanced",
  "advantageous",
  "adventureful",
  "adventuresome",
  "adventurous",
  "adversarial",
  "adverse",
  "advertent",
  "aerial",
  "aerobic",
  "aerodynamic",
  "aerodynamical",
  "aeromarine",
  "aeromedical",
  "aeronautic",
  "aeronautical",
  "aerophobic",
  "aesthetic",
  "afeard",
  "affable",
  "affectionate",
  "affirmative",
  "afflicted",
  "affluent",
  "affordable",
  "aforementioned",
  "afraid",
  "agate",
  "agatoid",
  "aged",
  "ageless",
  "ageold",
  "aggressive",
  "aghast",
  "agile",
  "agitable",
  "agitational",
  "agitative",
  "agonizing",
  "agoraphobic",
  "agrarian",
  "agreeable",
  "agreed",
  "agricultural",
  "agrobiologic",
  "agrobiological",
  "agrologic",
  "agrological",
  "agronomic",
  "agronomical",
  "agrostographic",
  "agrostographical",
  "agrostologic",
  "agrostological",
  "ahistoric",
  "ahistorical",
  "aichmophobic",
  "ailing",
  "ailurophilic",
  "ailurophobic",
  "aimless",
  "airborne",
  "airsick",
  "airtight",
  "airworthy",
  "airy",
  "alabaster",
  "alamode",
  "albinic",
  "albinistic",
  "albino",
  "albite",
  "alchemic",
  "alchemistical",
  "alert",
  "algebraic",
  "algophobic",
  "algorithmic",
  "alien",
  "alive",
  "alkalic",
  "alkaline",
  "alkalisable",
  "alkalizable",
  "alkaloidal",
  "alkylic",
  "allayed",
  "alleged",
  "allegorical",
  "allegoristic",
  "allegro",
  "allergenic",
  "allergic",
  "allied",
  "alliterative",
  "allpowerful",
  "allpurpose",
  "allstar",
  "alluring",
  "almond",
  "almondy",
  "alphabetic",
  "alphabetical",
  "alphameric",
  "alphanumeric",
  "alright",
  "alternative",
  "altophobic",
  "altruistic",
  "amaranth",
  "amateur",
  "amateurish",
  "amaxophobic",
  "amazing",
  "amber",
  "amberous",
  "ambery",
  "ambient",
  "ambigious",
  "ambisyllabic",
  "ambitious",
  "ambivalent",
  "amebic",
  "ameboid",
  "amenable",
  "americium",
  "amethyst",
  "amethystine",
  "amiable",
  "amicable",
  "ammoniac",
  "ammoniacal",
  "ammonic",
  "ammonitic",
  "ammonitoid",
  "ammophilic",
  "amnestic",
  "amoebaean",
  "amoebalike",
  "amoebic",
  "amoeboid",
  "amoral",
  "amphibian",
  "amphibiotic",
  "amphibious",
  "amphibole",
  "amphibolic",
  "amphibolite",
  "amphisbaenian",
  "amphisbaenic",
  "amphisbaenoid",
  "amphisbaenous",
  "amphitheatric",
  "amphitheatrical",
  "ample",
  "amputated",
  "amused",
  "amusing",
  "anachronic",
  "anachronistic",
  "anachronous",
  "anaemic",
  "anaesthetic",
  "analogical",
  "analogistic",
  "analogous",
  "analytical",
  "anarchic",
  "anarchistic",
  "anarthric",
  "anarthrous",
  "anatomical",
  "ancestral",
  "ancient",
  "androgenic",
  "androgenous",
  "androgynous",
  "androphagous",
  "androphilic",
  "anecdotal",
  "anesthetic",
  "angelic",
  "angry",
  "angstridden",
  "angsty",
  "anguished",
  "angular",
  "anhydrite",
  "animalic",
  "animalistic",
  "animated",
  "animist",
  "animistic",
  "annihilated",
  "annoyed",
  "annoying",
  "anonymous",
  "anorthite",
  "anorthosite",
  "antagonisable",
  "antagonistic",
  "antarctic",
  "antarthritic",
  "antebellum",
  "antediluvian",
  "antelopian",
  "antelopine",
  "anthophilic",
  "anthophobic",
  "anthracite",
  "anthropocentric",
  "anthropoid",
  "anthropoidal",
  "anthropological",
  "anthropomorphic",
  "anthropophobic",
  "antiallergenic",
  "anticapitalist",
  "anticapitalist",
  "anticlimactic",
  "antidemocratic",
  "antidemocratical",
  "antidotal",
  "antidotical",
  "antifeminist",
  "antifeministic",
  "antifungal",
  "antigorite",
  "antigovernment",
  "antigovernmental",
  "antigravitation",
  "antigravitational",
  "antiheroic",
  "antihuman",
  "antihumanistic",
  "antihygienic",
  "antimagnetic",
  "antimediaeval",
  "antimedical",
  "antimedication",
  "antimedicative",
  "antimedicine",
  "antimilitaristic",
  "antimilitary",
  "antimonarch",
  "antimonarchal",
  "antimonarchial",
  "antimonarchic",
  "antimonarchical",
  "antimonarchistic",
  "antimonarchy",
  "antimoral",
  "antimoralistic",
  "antimorality",
  "antimystical",
  "antinational",
  "antinationalisation",
  "antinationalistic",
  "antinatural",
  "antinaturalistic",
  "antinihilistic",
  "antioptimistic",
  "antioptimistical",
  "antipacifistic",
  "antipestilence",
  "antipestilent",
  "antipestilential",
  "antiphilosophic",
  "antiphilosophical",
  "antiphilosophy",
  "antipolitical",
  "antipolitics",
  "antiquarian",
  "antiquated",
  "antique",
  "antirational",
  "antirationalistic",
  "antiromance",
  "antiromantic",
  "antischolastic",
  "antischool",
  "antiscience",
  "antiscientific",
  "antisocial",
  "antisolar",
  "antiterrorist",
  "antitoxic",
  "antiutopian",
  "antiutopic",
  "antiviral",
  "antivirus",
  "antsy",
  "anxious",
  "apathetic",
  "apelike",
  "aphidian",
  "aphidious",
  "apian",
  "apiarian",
  "apicultural",
  "apidologic",
  "apidological",
  "apiologic",
  "apiological",
  "apiphobic",
  "apish",
  "apivorous",
  "apocalyptic",
  "apolitical",
  "apostolic",
  "apostrophic",
  "apothecial",
  "appalling",
  "apparent",
  "apparitional",
  "appealing",
  "appercetive",
  "appetitive",
  "appetizing",
  "applicable",
  "appreciative",
  "apprehensive",
  "apprentice",
  "appropriate",
  "apricot",
  "apt",
  "aquamarine",
  "aquaphobic",
  "aquarial",
  "aquatic",
  "aqueous",
  "aquicultural",
  "aquiline",
  "arachnidan",
  "arachnivorous",
  "arachnologic",
  "arachnological",
  "arachnophobic",
  "aragonite",
  "arbitrary",
  "arboraceous",
  "arboreal",
  "arbored",
  "arboreous",
  "arborescent",
  "arboresque",
  "arboricultural",
  "arborous",
  "arcane",
  "archaeological",
  "archaic",
  "archaistic",
  "archangelic",
  "archangelical",
  "archeologic",
  "archeological",
  "archetypal",
  "archetypic",
  "architectural",
  "archival",
  "arctic",
  "arctophilic",
  "ardent",
  "arduous",
  "argumentative",
  "arid",
  "aristocratic",
  "armed",
  "armless",
  "armourclad",
  "armoured",
  "armourpiercing",
  "armourplated",
  "aromatic",
  "arrogant",
  "arterial",
  "artful",
  "arthralgic",
  "arthritic",
  "arthritical",
  "arthrodial",
  "arthrodic",
  "arthromeric",
  "artificial",
  "artistic",
  "artless",
  "artsycraftsy",
  "arty",
  "artycrafty",
  "asbestine",
  "asbestoid",
  "asbestoidal",
  "asbestos",
  "asbestous",
  "ash",
  "ashamed",
  "ashen",
  "ashy",
  "asinine",
  "asocial",
  "asparaginous",
  "asphalt",
  "asphaltic",
  "asphaltum",
  "aspherical",
  "asphyxiated",
  "aspiring",
  "assertive",
  "assiduous",
  "assistant",
  "associated",
  "associative",
  "astatine",
  "asteria",
  "asthmatic",
  "asthmatoid",
  "astonishing",
  "astounding",
  "astrakhan",
  "astral",
  "astraphobic",
  "astrapophobic",
  "astrobiological",
  "astrochemical",
  "astrographic",
  "astrolabical",
  "astrological",
  "astromantic",
  "astrometric",
  "astronautic",
  "astronomical",
  "astrophilic",
  "astrophotographic",
  "astrophysical",
  "astute",
  "asyllabic",
  "athletic",
  "atmospheric",
  "atomic",
  "atrocious",
  "atrophic",
  "atrophied",
  "attack",
  "attentive",
  "attractive",
  "atypical",
  "auburn",
  "audacious",
  "audiophilic",
  "augite",
  "augmented",
  "auroral",
  "aurorean",
  "aurous",
  "auspicial",
  "auspicious",
  "autecologic",
  "autecological",
  "authentic",
  "authorial",
  "authoritarian",
  "authoritative",
  "authorized",
  "autobiographical",
  "autographic",
  "autographical",
  "autoimmune",
  "automatic",
  "automotive",
  "autonomous",
  "autophobic",
  "autositic",
  "autumnal",
  "auxiliary",
  "available",
  "avaricious",
  "avengeful",
  "aventurine",
  "average",
  "avian",
  "aviaphobic",
  "aviophobic",
  "avoided",
  "awake",
  "aware",
  "aweinspiring",
  "awesome",
  "awestricken",
  "awestruck",
  "awful",
  "awkward",
  "axiomatic",
  "azure",
  "baboonish",
  "baby",
  "babyfaced",
  "babyish",
  "bacciferous",
  "bacciform",
  "baccivorous",
  "bacillophobic",
  "backward",
  "bacterial",
  "bactericidal",
  "bacteriologic",
  "bacteriological",
  "bacteriophobic",
  "bacteroid",
  "bad",
  "badtempered",
  "baffling",
  "baggy",
  "bairnish",
  "bairnly",
  "balanced",
  "bald",
  "baldheaded",
  "balding",
  "baldish",
  "baleful",
  "balky",
  "balladic",
  "balmy",
  "balneal",
  "balneologic",
  "balneological",
  "balsamaceous",
  "balsamic",
  "balsamiferous",
  "balsaminaceous",
  "balsamy",
  "banal",
  "baneful",
  "barathea",
  "barbarian",
  "barbaric",
  "barbarous",
  "bardic",
  "bardish",
  "bardlike",
  "bardy",
  "bare",
  "bared",
  "barite",
  "barky",
  "barnacled",
  "baroque",
  "barren",
  "baryte",
  "basalt",
  "basaltic",
  "basaltine",
  "base",
  "baseborn",
  "basehearted",
  "bashful",
  "basic",
  "batiste",
  "battlescarred",
  "battlesome",
  "batty",
  "beachy",
  "beaming",
  "beamish",
  "beamlike",
  "beamy",
  "beaten",
  "beatific",
  "beauish",
  "beauteous",
  "beautiful",
  "becoming",
  "bediasite",
  "bedridden",
  "beefwitted",
  "beefwittedly",
  "beefy",
  "beelike",
  "beeswax",
  "befuddled",
  "befuddling",
  "beggarly",
  "beguiling",
  "behavioral",
  "beige",
  "belated",
  "bellicose",
  "belligerent",
  "belocolus",
  "belonephobic",
  "beloved",
  "bemused",
  "beneficent",
  "beneficial",
  "benevolent",
  "benighted",
  "benign",
  "benignant",
  "bereaved",
  "bereft",
  "beribboned",
  "berkelium",
  "berrylike",
  "berserk",
  "beryl",
  "besotted",
  "best",
  "bestial",
  "beton",
  "betrothed",
  "bewildered",
  "bewitched",
  "bewitching",
  "bibliographic",
  "bibliographical",
  "bibliolatrous",
  "bibliological",
  "bibliomaniacal",
  "bibliophagous",
  "bibliophilic",
  "bicolor",
  "big",
  "bigboned",
  "biggish",
  "bigheaded",
  "bighearted",
  "bigoted",
  "bilinear",
  "bilineate",
  "bilingual",
  "bimetallic",
  "bimetallistic",
  "binary",
  "binding",
  "bioclimatic",
  "bioclimatological",
  "biodegradable",
  "bioecologic",
  "bioecological",
  "bioeconomic",
  "bioeconomical",
  "biological",
  "biomedical",
  "bionic",
  "biophilic",
  "biotechnological",
  "biotite",
  "bipartisan",
  "birdbrained",
  "birdbrained",
  "birdlike",
  "birthstone",
  "bitesized",
  "bitter",
  "bitty",
  "bitumen",
  "bixbite",
  "bizarre",
  "black",
  "blackcoated",
  "blackhearted",
  "blackish",
  "blamable",
  "blameable",
  "blameful",
  "blameless",
  "blameworthy",
  "bland",
  "blank",
  "blasphemous",
  "bleached",
  "bleak",
  "bleakish",
  "bleareyed",
  "bleary",
  "blessed",
  "blind",
  "blissful",
  "blithe",
  "blitheful",
  "blithesome",
  "blizzardly",
  "blizzardy",
  "bloated",
  "blockish",
  "blocky",
  "blond",
  "blonde",
  "blondish",
  "bloodcurdling",
  "bloodshot",
  "bloodsucking",
  "bloodthirsty",
  "blotchy",
  "blousy",
  "blowsy",
  "blowy",
  "blowzy",
  "blubbery",
  "blue",
  "blueblack",
  "bluecoated",
  "bluecollar",
  "blueish",
  "blueribbon",
  "blunt",
  "blushing",
  "blusterous",
  "boarish",
  "boastful",
  "bohrium",
  "boiled",
  "boiling",
  "bold",
  "boldfaced",
  "boldhearted",
  "bolstered",
  "bombastic",
  "bonedry",
  "boneheaded",
  "bonelike",
  "bonny",
  "bony",
  "bookish",
  "booklearned",
  "boolean",
  "boorish",
  "bootlicking",
  "boreal",
  "bored",
  "boring",
  "bort",
  "bosky",
  "bossy",
  "botanic",
  "botanical",
  "botchy",
  "bothersome",
  "bottlegreen",
  "bottom",
  "bouncy",
  "boundless",
  "bovid",
  "bovine",
  "boyish",
  "braced",
  "braided",
  "brainless",
  "brainsick",
  "brainy",
  "brambly",
  "branny",
  "brash",
  "brashy",
  "brass",
  "brassbound",
  "brassish",
  "brassy",
  "brattish",
  "bratty",
  "brave",
  "braving",
  "brazen",
  "breaded",
  "breakable",
  "breathless",
  "breathtaking",
  "breezelike",
  "breezy",
  "bribable",
  "bribeable",
  "brick",
  "brickish",
  "brickred",
  "brickred",
  "bricky",
  "bridal",
  "brief",
  "brigandish",
  "bright",
  "brightish",
  "brilliant",
  "brimstone",
  "brimstony",
  "brinish",
  "briny",
  "brisk",
  "brittle",
  "broad",
  "broadfaced",
  "broadish",
  "broadminded",
  "brocatel",
  "brocatello",
  "broke",
  "broken",
  "brokendown",
  "brokenhearted",
  "brokenhearted",
  "bronchial",
  "brontophobic",
  "bronze",
  "bronzy",
  "broody",
  "brotherlike",
  "brotherly",
  "brown",
  "brownish",
  "browny",
  "brunette",
  "brusque",
  "brutal",
  "brutalitarian",
  "brutish",
  "bubbly",
  "bubonic",
  "buckskin",
  "buggy",
  "bulletproof",
  "bullish",
  "bulllike",
  "bullous",
  "bumbling",
  "bumpkinish",
  "bumpkinly",
  "bumpy",
  "buoyant",
  "burdensome",
  "bureaucratic",
  "burglarious",
  "burgundy",
  "buried",
  "burlap",
  "burly",
  "burned",
  "burnedout",
  "burning",
  "burnt",
  "bushy",
  "busied",
  "busy",
  "busying",
  "butterfingered",
  "buttery",
  "byzantine",
  "byzantium",
  "cabbagy",
  "cacophonophilic",
  "cacotopic",
  "cactuslike",
  "cactuslike",
  "cadaveric",
  "cadaverous",
  "caffeinated",
  "caffeinic",
  "cagophilic",
  "cainophobic",
  "cainotophobic",
  "calceiform",
  "calciphilic",
  "calciphobic",
  "calcite",
  "calcivorous",
  "calicoed",
  "californium",
  "calligraphic",
  "calligraphical",
  "callous",
  "calm",
  "calmative",
  "calmy",
  "caloric",
  "caloried",
  "calorifacient",
  "calorific",
  "calx",
  "camerashy",
  "camlet",
  "camoflage",
  "camouflage",
  "campy",
  "cancellable",
  "candid",
  "candied",
  "candycoated",
  "candystriped",
  "canine",
  "cankered",
  "cankerous",
  "cannibal",
  "cannibalistic",
  "canophilic",
  "cantankerous",
  "capable",
  "capillary",
  "capitalist",
  "capitalistic",
  "capitate",
  "capless",
  "capricious",
  "capsizable",
  "captious",
  "captivating",
  "captivative",
  "capturable",
  "carbasus",
  "carbon",
  "carbonaceous",
  "carbonic",
  "carboniferous",
  "carbonless",
  "carbonous",
  "carcinogenic",
  "cardboard",
  "cardiac",
  "cardinal",
  "cardiographic",
  "cardiologic",
  "cardiological",
  "cardiotonic",
  "cardiovascular",
  "carefree",
  "careful",
  "careless",
  "caressive",
  "careworn",
  "caring",
  "carmine",
  "carnauba",
  "carnelian",
  "carneous",
  "carniferous",
  "carnivalesque",
  "carnivallike",
  "carnivoral",
  "carnivorous",
  "carnose",
  "carnous",
  "carping",
  "carriable",
  "carroty",
  "carryable",
  "carsick",
  "cashmere",
  "castiron",
  "castoff",
  "castoff",
  "caststeel",
  "cataclysmic",
  "catastrophal",
  "catastrophic",
  "catastrophical",
  "catatonic",
  "catchable",
  "catching",
  "catchy",
  "catechisable",
  "categorical",
  "catlike",
  "catoptrophobic",
  "cattish",
  "cattlehide",
  "catty",
  "cauliflorous",
  "causable",
  "causational",
  "causative",
  "causeless",
  "caustic",
  "caustical",
  "cautious",
  "cavalier",
  "cavelike",
  "cavernous",
  "cavitied",
  "cayenned",
  "celadon",
  "celebrated",
  "celebrative",
  "celebratory",
  "celestial",
  "celestine",
  "celestite",
  "celllike",
  "cellular",
  "cement",
  "cementitious",
  "censorable",
  "censorial",
  "censorian",
  "censorious",
  "censual",
  "censurable",
  "censureless",
  "centaurial",
  "centaurian",
  "centauric",
  "centerable",
  "centered",
  "centipedal",
  "centophobic",
  "central",
  "centralistic",
  "centralized",
  "centric",
  "centrifugal",
  "cepevorous",
  "cephalic",
  "cepivorous",
  "ceramic",
  "cerate",
  "cere",
  "cerebellar",
  "cerebral",
  "cerebric",
  "cerebroid",
  "cerebrospinal",
  "cerise",
  "certain",
  "certifiable",
  "certificatory",
  "certified",
  "cerulean",
  "cetologic",
  "cetological",
  "chaindriven",
  "chainreacting",
  "chalcedony",
  "chalcopyrite",
  "chalk",
  "chalkstony",
  "chalky",
  "challenging",
  "chanceful",
  "chancy",
  "changeable",
  "changeful",
  "chantable",
  "chaotic",
  "characterful",
  "characteristic",
  "characterless",
  "charcoal",
  "charcoaly",
  "chargeable",
  "chargeful",
  "chargeless",
  "charismatic",
  "charitable",
  "charityless",
  "charlatanical",
  "charlatanish",
  "charlatanistic",
  "charming",
  "charred",
  "charterable",
  "chartreuse",
  "chaseable",
  "chasmophilic",
  "chaste",
  "chattable",
  "chattery",
  "chatty",
  "chauvinist",
  "chauvinistic",
  "cheap",
  "cheatable",
  "checkable",
  "checked",
  "checkered",
  "cheeky",
  "cheerful",
  "cheerless",
  "cheery",
  "cheesecloth",
  "cheeselike",
  "cheesy",
  "chelonaphilic",
  "chemic",
  "chemical",
  "chemophobic",
  "cherishable",
  "cherubic",
  "cherubical",
  "chevrette",
  "chevroned",
  "chewable",
  "chewed",
  "chewy",
  "chiasmic",
  "chic",
  "chickenhearted",
  "chickenlivered",
  "chief",
  "chiffon",
  "childish",
  "childless",
  "childlike",
  "childly",
  "childproof",
  "childsafe",
  "chilled",
  "chilly",
  "chino",
  "chintzy",
  "chippable",
  "chipper",
  "chiropterophilic",
  "chiroptophobic",
  "chiselled",
  "chitchatty",
  "chivalric",
  "chivalrous",
  "chloroformic",
  "chocolate",
  "chocolatey",
  "chocolaty",
  "choky",
  "choleric",
  "chondrite",
  "choosable",
  "choosey",
  "choosy",
  "choppy",
  "choral",
  "chordal",
  "chordamesodermal",
  "chordamesodermic",
  "chorded",
  "choreographic",
  "chorographic",
  "chorographical",
  "chosen",
  "chromatinic",
  "chromatnic",
  "chromic",
  "chromite",
  "chromium",
  "chromophilic",
  "chromophobic",
  "chromosomal",
  "chronogrammatic",
  "chronogrammatical",
  "chronographic",
  "chronological",
  "chronometric",
  "chronometrical",
  "chrysophilic",
  "chrysoprase",
  "chubby",
  "chuckleheaded",
  "chuffy",
  "chummy",
  "chunky",
  "churchless",
  "churchly",
  "churchy",
  "churlish",
  "churnable",
  "cibophobic",
  "cilia",
  "cilium",
  "cinderlike",
  "cinderous",
  "cindery",
  "cinematic",
  "cinematographic",
  "cinnabar",
  "cinnamic",
  "cinnamoned",
  "cinnamonic",
  "cipolin",
  "circular",
  "circulatory",
  "circumfluent",
  "circumnavigable",
  "circumnavigatory",
  "circumspect",
  "circumstantial",
  "citable",
  "citatory",
  "citeable",
  "citied",
  "citified",
  "citizenly",
  "citreous",
  "citric",
  "citrine",
  "citylike",
  "civic",
  "civil",
  "civilian",
  "civilisable",
  "civilisational",
  "civilisatory",
  "civilized",
  "civillaw",
  "claimable",
  "clairvoyant",
  "clamlike",
  "clammy",
  "clandestine",
  "clannish",
  "classconscious",
  "classic",
  "classical",
  "classified",
  "classless",
  "classy",
  "claustrophilic",
  "claustrophobic",
  "clay",
  "clayey",
  "clayish",
  "clean",
  "cleanable",
  "cleancut",
  "cleanfaced",
  "cleanhanded",
  "cleanlimbed",
  "cleansable",
  "cleanshaven",
  "clearable",
  "clearcut",
  "cleareyed",
  "clearheaded",
  "clearsighted",
  "clerical",
  "clerkish",
  "clever",
  "cleverish",
  "cliffy",
  "climactic",
  "climatic",
  "climatologic",
  "climatological",
  "climbing",
  "clingy",
  "clinical",
  "clinophilic",
  "clippable",
  "clockwork",
  "cloddy",
  "cloggy",
  "cloistered",
  "cloned",
  "close",
  "closeby",
  "closed",
  "closefitting",
  "closein",
  "closeknit",
  "cloth",
  "clothed",
  "clotty",
  "cloudy",
  "clownish",
  "clownlike",
  "clubbable",
  "clubby",
  "clubfooted",
  "clueless",
  "clumpish",
  "clumpy",
  "clumsy",
  "cluttered",
  "coachable",
  "coal",
  "coaly",
  "coarse",
  "coarsegrained",
  "coastal",
  "coated",
  "cob",
  "cobblestone",
  "cobwebby",
  "cockeyed",
  "cocksure",
  "cocky",
  "cocoa",
  "codependent",
  "coed",
  "coeducational",
  "coercionary",
  "coercive",
  "coessential",
  "coexistent",
  "coffeecolored",
  "cogitative",
  "cognisant",
  "cognitive",
  "cognizant",
  "coherent",
  "cohesive",
  "cold",
  "coldblooded",
  "coldhearted",
  "coldheartedly",
  "coldish",
  "coldwater",
  "collaborative",
  "collapsible",
  "collective",
  "collielike",
  "collinear",
  "colloquial",
  "collusive",
  "colluvium",
  "colonial",
  "colonisable",
  "coloristic",
  "colossal",
  "colourable",
  "colourational",
  "colourblind",
  "coloured",
  "colourific",
  "colouristic",
  "colourless",
  "coltish",
  "columnar",
  "columnarized",
  "columned",
  "combatable",
  "combative",
  "combustible",
  "combustive",
  "comedial",
  "comely",
  "comfortable",
  "comfortless",
  "comfy",
  "comic",
  "comical",
  "commanding",
  "commenceable",
  "commendable",
  "commendatory",
  "commensurable",
  "commensurate",
  "commentable",
  "commentarial",
  "commentative",
  "commentatorial",
  "commercial",
  "commercialistic",
  "comminative",
  "comminatory",
  "commiserable",
  "commiserative",
  "committable",
  "commodious",
  "common",
  "commonable",
  "commonlaw",
  "commonplace",
  "commonsense",
  "commonsensible",
  "commonsensical",
  "communal",
  "communalistic",
  "communicable",
  "communicative",
  "communicatory",
  "communionable",
  "communist",
  "communistic",
  "communistical",
  "communital",
  "community",
  "commutable",
  "commutative",
  "commutual",
  "compact",
  "compactable",
  "companionable",
  "companionless",
  "companyless",
  "comparable",
  "comparative",
  "compassable",
  "compassionate",
  "compassionless",
  "compatible",
  "compatriotic",
  "compellable",
  "compellent",
  "compensable",
  "compensational",
  "compensatory",
  "compentant",
  "competitive",
  "complacent",
  "complainable",
  "complaisant",
  "complementable",
  "complementary",
  "complemented",
  "completable",
  "complete",
  "complex",
  "complexional",
  "complexioned",
  "complexionless",
  "compliable",
  "compliant",
  "complicated",
  "componental",
  "componented",
  "comprehensive",
  "compressive",
  "comprisable",
  "compulsive",
  "compulsory",
  "computable",
  "computational",
  "computative",
  "concave",
  "conceited",
  "conceivable",
  "concentrative",
  "conceptual",
  "concerned",
  "concessible",
  "concessionary",
  "concessive",
  "conchin",
  "conchiolin",
  "conchologic",
  "conchological",
  "concise",
  "concludable",
  "concludible",
  "conclusional",
  "conclusive",
  "concrete",
  "concretionary",
  "concurrent",
  "condemnable",
  "condemnatory",
  "condemned",
  "condensable",
  "condensational",
  "condensative",
  "condensed",
  "condescending",
  "condescensive",
  "conditioned",
  "confident",
  "confidential",
  "configurational",
  "configurative",
  "confineable",
  "confined",
  "confirmable",
  "confirmatory",
  "confirmed",
  "confiscable",
  "confiscatory",
  "conflictive",
  "conflictory",
  "confluent",
  "confounded",
  "confounding",
  "confused",
  "confusing",
  "confusional",
  "congenial",
  "congested",
  "congratulant",
  "congratulational",
  "congratulatory",
  "congregational",
  "congregative",
  "congressional",
  "congruent",
  "congruous",
  "connectable",
  "connectible",
  "conscientious",
  "conscionable",
  "conscious",
  "consecutive",
  "consensual",
  "consentaneous",
  "consentient",
  "conservable",
  "conservational",
  "conservative",
  "considerable",
  "considerate",
  "consignable",
  "consistent",
  "consolable",
  "consolatory",
  "consolidative",
  "conspicuous",
  "conspirative",
  "conspiratorial",
  "constant",
  "constellatory",
  "constituent",
  "constitutional",
  "constitutive",
  "constrainable",
  "constrained",
  "constrictive",
  "constringent",
  "construable",
  "constructible",
  "constuctional",
  "constuctive",
  "consumable",
  "consummate",
  "consumptive",
  "contactual",
  "contagious",
  "containable",
  "contained",
  "contaminable",
  "contaminated",
  "contaminative",
  "contaminous",
  "contemnible",
  "contemplable",
  "contemplative",
  "contemporaneous",
  "contemporary",
  "contemptible",
  "contemptile",
  "contemptuous",
  "content",
  "contentable",
  "contented",
  "contentional",
  "contentious",
  "contestable",
  "contextual",
  "contiguous",
  "continental",
  "continual",
  "continued",
  "continuing",
  "continuous",
  "contorted",
  "contortional",
  "contortioned",
  "contortionistic",
  "contortive",
  "contractible",
  "contractile",
  "contractional",
  "contractive",
  "contractual",
  "contractured",
  "contradictable",
  "contradictious",
  "contradictive",
  "contradictory",
  "contrary",
  "contributable",
  "contrite",
  "contrivable",
  "contrived",
  "controlled",
  "controlless",
  "controversial",
  "controvertible",
  "contumelious",
  "contusioned",
  "convectional",
  "convective",
  "convenable",
  "convenient",
  "conventional",
  "conventual",
  "convergent",
  "conversable",
  "conversant",
  "conversational",
  "converted",
  "convertible",
  "conveyable",
  "convictable",
  "convictible",
  "convictional",
  "convictive",
  "convincible",
  "convincing",
  "convivial",
  "convulsant",
  "convulsible",
  "convulsionary",
  "convulsive",
  "cookable",
  "cooked",
  "cool",
  "cooperative",
  "copacetic",
  "coplanar",
  "copper",
  "coppery",
  "copyrightable",
  "coquettish",
  "coral",
  "coralliferous",
  "coralline",
  "coralloid",
  "cordial",
  "corduroy",
  "corelative",
  "cork",
  "corked",
  "corking",
  "corky",
  "corncolored",
  "cornmeal",
  "corny",
  "coronary",
  "corporal",
  "corporate",
  "corporational",
  "corporatist",
  "corporative",
  "corporeal",
  "correct",
  "correctable",
  "correctible",
  "correctional",
  "corrective",
  "correlatable",
  "correlational",
  "correlative",
  "corroborant",
  "corroborative",
  "corrodible",
  "corrosional",
  "corrosive",
  "corrupt",
  "corrupted",
  "corruptful",
  "corruptible",
  "corrupting",
  "corruptive",
  "cosey",
  "coseys",
  "cosie",
  "cosies",
  "cosmetological",
  "cosmic",
  "cosmogonal",
  "cosmogonic",
  "cosmogonical",
  "cosmographic",
  "cosmographical",
  "cosmologic",
  "cosmological",
  "cosmonautic",
  "costeffective",
  "costless",
  "costly",
  "cosy",
  "cotton",
  "cottony",
  "coulrophobic",
  "councilmanic",
  "counselable",
  "countable",
  "counteractive",
  "countercoloured",
  "counterproductive",
  "counterterrorist",
  "countrified",
  "countrybred",
  "countrywide",
  "couped",
  "courageous",
  "courteous",
  "courtly",
  "coverable",
  "covered",
  "covert",
  "covetable",
  "coveting",
  "covetous",
  "cowardly",
  "cowlike",
  "coy",
  "coyish",
  "cozey",
  "cozy",
  "crabbed",
  "crabby",
  "crackable",
  "cracked",
  "crackless",
  "crafty",
  "craggy",
  "cramped",
  "cranial",
  "craniate",
  "craniological",
  "craniometric",
  "craniometrical",
  "cranioscopical",
  "cranky",
  "crashing",
  "crass",
  "craven",
  "crawly",
  "crazed",
  "crazy",
  "cream",
  "creamcolored",
  "creamy",
  "creased",
  "creasy",
  "creatable",
  "creational",
  "creationary",
  "creationistic",
  "creative",
  "creatural",
  "creaturely",
  "credentialed",
  "credible",
  "creditable",
  "credulous",
  "creeded",
  "creepy",
  "crematory",
  "creophagous",
  "crestfallen",
  "cretaceous",
  "cretinoid",
  "cretinous",
  "creviced",
  "criminal",
  "criminative",
  "criminologic",
  "criminological",
  "crimpy",
  "crimson",
  "crippling",
  "crispy",
  "critical",
  "criticisable",
  "crocodiloid",
  "cronish",
  "crooked",
  "crosslegged",
  "crotchety",
  "crowning",
  "crucial",
  "crude",
  "cruel",
  "cruelhearted",
  "crumbable",
  "crumbly",
  "crumby",
  "crumply",
  "crurophilic",
  "cruse",
  "crushable",
  "crushing",
  "crustaceous",
  "crusted",
  "crusty",
  "crying",
  "cryogenic",
  "cryophilic",
  "cryptic",
  "cryptocrystalline",
  "cryptographic",
  "cryptographical",
  "cryptovolcanic",
  "cryptozoic",
  "crystal",
  "crystalliferous",
  "crystalline",
  "crystallisable",
  "crystallitic",
  "crystallographic",
  "crystalloid",
  "crystalloidal",
  "cthonophagous",
  "cubic",
  "cubical",
  "cubiform",
  "cubistic",
  "cuboid",
  "cuddlesome",
  "cuddly",
  "culinary",
  "culm",
  "culpable",
  "cultic",
  "cultish",
  "cultivable",
  "cultivated",
  "cultual",
  "cultural",
  "cultured",
  "cultureless",
  "cumbersome",
  "cumbrous",
  "cummy",
  "cumulative",
  "cuneiform",
  "cunning",
  "cupulate",
  "curable",
  "curative",
  "curatorial",
  "curbable",
  "curdy",
  "cured",
  "curious",
  "curium",
  "curly",
  "curmudgeonly",
  "current",
  "curricular",
  "cursed",
  "cursive",
  "cursorial",
  "cursory",
  "curt",
  "curvaceous",
  "curved",
  "curvilinear",
  "curvy",
  "cushiony",
  "cushy",
  "cussed",
  "custodial",
  "customable",
  "customary",
  "custombuilt",
  "custommade",
  "cut",
  "cute",
  "cutprice",
  "cutrate",
  "cuttable",
  "cyan",
  "cybernetic",
  "cyberpunk",
  "cycadaceous",
  "cyclopean",
  "cylinderlike",
  "cylindraceous",
  "cylindrical",
  "cynical",
  "cynophobic",
  "cystic",
  "czarist",
  "dacite",
  "daemonic",
  "daffy",
  "daft",
  "dainty",
  "damageable",
  "damaged",
  "damaging",
  "damask",
  "damp",
  "dampish",
  "dampproof",
  "dampproof",
  "dandriffy",
  "dandruffy",
  "dangerous",
  "dank",
  "dapper",
  "dapplegray",
  "daredevil",
  "daring",
  "dark",
  "darkish",
  "darksome",
  "darmstadtium",
  "dashing",
  "dastardly",
  "dated",
  "daughterlike",
  "daughterly",
  "dauntless",
  "daydreaming",
  "daydreamy",
  "dazed",
  "dazzling",
  "deactivated",
  "dead",
  "deadbeat",
  "deadly",
  "deadpan",
  "deadsmooth",
  "dear",
  "deathful",
  "deathless",
  "deathlike",
  "deathly",
  "debatable",
  "debilitated",
  "debilitative",
  "debonair",
  "decadent",
  "decagonal",
  "decahedral",
  "decapitated",
  "decasyllabic",
  "decayable",
  "decayed",
  "deceased",
  "deceitful",
  "decent",
  "deceptive",
  "decidophobic",
  "deciduous",
  "decipherable",
  "decisive",
  "declamatory",
  "declarative",
  "declaratory",
  "declared",
  "declinable",
  "declinate",
  "declinational",
  "declinatory",
  "decomposable",
  "decomposed",
  "decontaminative",
  "decorated",
  "decorative",
  "decorous",
  "decrepit",
  "dedicated",
  "deducible",
  "deductible",
  "deductive",
  "deep",
  "deerskin",
  "defaceable",
  "defamatory",
  "defeasible",
  "defeated",
  "defectible",
  "defective",
  "defenceless",
  "defenestrated",
  "defensive",
  "deferable",
  "deferent",
  "deferential",
  "defiable",
  "defiant",
  "deficient",
  "definable",
  "definite",
  "definitive",
  "deflated",
  "deflationary",
  "deflectable",
  "deformable",
  "deformational",
  "deformative",
  "deformed",
  "deft",
  "defunct",
  "defunctive",
  "degenerative",
  "degradable",
  "degraded",
  "degrading",
  "dehydrated",
  "deific",
  "deiform",
  "deistic",
  "deistical",
  "dejected",
  "delayable",
  "delayed",
  "delectable",
  "delegable",
  "deliberate",
  "deliberative",
  "delicate",
  "delicious",
  "delighted",
  "delightful",
  "delightless",
  "delightsome",
  "delirious",
  "delusional",
  "delusive",
  "demagnetisable",
  "demagnetizable",
  "demandable",
  "demanding",
  "demented",
  "democratic",
  "demoded",
  "demographic",
  "demographical",
  "demoniac",
  "demonian",
  "demonic",
  "demonstrable",
  "demonstrational",
  "demonstrative",
  "demotic",
  "demure",
  "demurrable",
  "dendrachate",
  "dendric",
  "dendriform",
  "dendritic",
  "dendrochronological",
  "dendroid",
  "dendrological",
  "dendrophagous",
  "dendrophilic",
  "dendrophilous",
  "dendrophobic",
  "deniable",
  "denim",
  "dense",
  "dental",
  "dentine",
  "dentophobic",
  "deodorizing",
  "departed",
  "departmental",
  "dependable",
  "dependent",
  "depictive",
  "depilatory",
  "depleted",
  "depletive",
  "depletory",
  "deplorable",
  "deportable",
  "deposable",
  "depositional",
  "depraved",
  "deprecative",
  "deprecatory",
  "depreciable",
  "depreciatory",
  "depressant",
  "depressed",
  "depressible",
  "depressing",
  "depressive",
  "deprivable",
  "deprived",
  "derangeable",
  "deranged",
  "derelict",
  "derisible",
  "derisive",
  "derivable",
  "derivational",
  "derivative",
  "dermal",
  "dermatic",
  "dermatographic",
  "dermatoid",
  "dermatological",
  "dermatomic",
  "dermatophytic",
  "dermatoplastic",
  "dermatropic",
  "dermic",
  "dermographic",
  "dermoid",
  "derogative",
  "derogatory",
  "descendent",
  "descendible",
  "describable",
  "descriptive",
  "desecrated",
  "deserted",
  "desertic",
  "deserticolous",
  "desertlike",
  "desertlike",
  "deserved",
  "deserving",
  "designative",
  "designatory",
  "desirable",
  "desired",
  "desirous",
  "despairful",
  "despairing",
  "desperate",
  "despicable",
  "despisable",
  "despiteful",
  "despiteous",
  "despondent",
  "despotic",
  "destined",
  "destitute",
  "destroyable",
  "destroyed",
  "destructible",
  "destructive",
  "detachable",
  "detailed",
  "detainable",
  "detectable",
  "detectible",
  "deteriorative",
  "determinable",
  "determinant",
  "determinate",
  "determinately",
  "determinative",
  "determined",
  "deterministic",
  "detestable",
  "detonable",
  "detonative",
  "detoxicant",
  "detractive",
  "detrimental",
  "deviant",
  "deviative",
  "deviceful",
  "devious",
  "devoid",
  "devoted",
  "devotional",
  "devout",
  "dewy",
  "dewyeyed",
  "dexterous",
  "diabetic",
  "diabolic",
  "diagnosable",
  "diagnostic",
  "diagonal",
  "dialectal",
  "dialectical",
  "dialectologic",
  "dialectological",
  "diamant",
  "diamantiferous",
  "diamantine",
  "diamond",
  "diarthrodial",
  "dicey",
  "dichromatic",
  "dictatorial",
  "didactic",
  "diet",
  "dietary",
  "dietetic",
  "different",
  "differentiable",
  "differential",
  "difficult",
  "diffident",
  "diffractive",
  "diffusible",
  "digestible",
  "digestional",
  "digestive",
  "digital",
  "digitiform",
  "dignified",
  "digressive",
  "dihedral",
  "dihydrated",
  "dihydric",
  "dilapidated",
  "dilligent",
  "dim",
  "diminished",
  "diminutive",
  "dimmed",
  "dimming",
  "dimply",
  "dimwitted",
  "dingy",
  "dinky",
  "dinosaurian",
  "diopside",
  "diplocardiac",
  "diplomatic",
  "dippy",
  "dire",
  "directionless",
  "directorial",
  "direful",
  "dirgeful",
  "dirt",
  "dirty",
  "dirtyfaced",
  "disabled",
  "disadvantaged",
  "disaffected",
  "disagreeable",
  "disallowable",
  "disappointed",
  "disappointing",
  "disarming",
  "disastrous",
  "disbursable",
  "discernible",
  "discerning",
  "disciplinable",
  "disciplinal",
  "disciplinary",
  "disciplined",
  "discoloured",
  "discombobulated",
  "discomfortable",
  "disconcerted",
  "disconsolate",
  "discontented",
  "discontinuous",
  "discophilic",
  "discountable",
  "discourageable",
  "discourteous",
  "discoverable",
  "discreditable",
  "discreet",
  "discrepant",
  "discrete",
  "discretional",
  "discretionary",
  "discussable",
  "discussible",
  "disdainful",
  "diseased",
  "disembodied",
  "disenfranchised",
  "disgraceful",
  "disguisable",
  "disgusted",
  "disgustful",
  "disgusting",
  "dishevelled",
  "dishonest",
  "dishonorable",
  "dishonourable",
  "disillusioned",
  "disillusive",
  "disimpassioned",
  "disinclined",
  "disingenuous",
  "disinherited",
  "disintegrable",
  "disintegrative",
  "disintegratory",
  "disinterested",
  "dislikeable",
  "disliked",
  "disloyal",
  "dismal",
  "dismissible",
  "dismissive",
  "dismountable",
  "disobedient",
  "disordered",
  "disorganized",
  "disparaged",
  "disparaging",
  "dispassionate",
  "dispellable",
  "dispensable",
  "dispersible",
  "dispirited",
  "dispiriting",
  "dispiteous",
  "displaceable",
  "displayed",
  "displeased",
  "displeasing",
  "displeasureable",
  "disposable",
  "dispossessed",
  "dispossessory",
  "disproportionable",
  "disproportional",
  "disprovable",
  "disputable",
  "disqualifiable",
  "disquieted",
  "disquieting",
  "disregardful",
  "disreputable",
  "disrespectable",
  "disrespectful",
  "disruptive",
  "dissatisfactory",
  "dissatisfied",
  "dissected",
  "dissectible",
  "dissentient",
  "dissentious",
  "dissident",
  "dissimilar",
  "dissociable",
  "dissocial",
  "dissociative",
  "dissolvable",
  "dissonant",
  "dissuadable",
  "dissuasive",
  "dissyllabic",
  "distant",
  "distasteful",
  "distended",
  "distent",
  "distillable",
  "distinct",
  "distinctive",
  "distinguished",
  "distinguishing",
  "distorted",
  "distortional",
  "distortive",
  "distracted",
  "distractible",
  "distractive",
  "distressful",
  "distributable",
  "distrustful",
  "disturbed",
  "disturbing",
  "disused",
  "disyllabic",
  "divergent",
  "diverse",
  "diversifiable",
  "diversified",
  "diversiform",
  "divinable",
  "divinatory",
  "divine",
  "diving",
  "divorceable",
  "dizzied",
  "dizzy",
  "dizzying",
  "docile",
  "doctoral",
  "doctorial",
  "doctrinaire",
  "doctrinal",
  "documentary",
  "doddered",
  "doddering",
  "dodecagonal",
  "dodecahedral",
  "dodecasyllabic",
  "dogged",
  "doggish",
  "doggoned",
  "doglike",
  "dogmatic",
  "dogpoor",
  "dogtired",
  "dollfaced",
  "dollish",
  "dolomite",
  "dolorous",
  "dolostone",
  "doltish",
  "domestic",
  "domesticable",
  "domesticated",
  "domesticative",
  "dominant",
  "dominating",
  "domineering",
  "doomed",
  "dopey",
  "dopy",
  "dorky",
  "dormant",
  "dorsal",
  "dorsispinal",
  "dotted",
  "doubleedged",
  "doublejointed",
  "doubtful",
  "doughty",
  "doughy",
  "dour",
  "doused",
  "dovecolored",
  "dovish",
  "dowdy",
  "downcast",
  "downfallen",
  "downhearted",
  "downtrodden",
  "downy",
  "dozing",
  "dozy",
  "drab",
  "draconian",
  "draconic",
  "drafty",
  "dragonish",
  "dragonlike",
  "dramatic",
  "dramatisable",
  "dramatizable",
  "dramaturgic",
  "dramaturgical",
  "drastic",
  "draughty",
  "drawn",
  "dreadable",
  "dreadful",
  "dreamful",
  "dreamlike",
  "dreamy",
  "drear",
  "drearisome",
  "dreary",
  "dressy",
  "drifty",
  "drinkable",
  "dripdry",
  "dripping",
  "drippy",
  "driveable",
  "drizzly",
  "droll",
  "dronish",
  "drooly",
  "droopy",
  "drossy",
  "droughty",
  "drouthy",
  "drowsy",
  "druidic",
  "druidical",
  "dry",
  "dryadic",
  "dualpurpose",
  "dubious",
  "dubnium",
  "ducal",
  "duckie",
  "duelistic",
  "dull",
  "dullish",
  "dumb",
  "dumbfounded",
  "dumbstruck",
  "dumpish",
  "dumpy",
  "duncical",
  "duncish",
  "dunderheaded",
  "dungy",
  "dunite",
  "durable",
  "durational",
  "durative",
  "duskish",
  "dusky",
  "dustless",
  "dustproof",
  "dusty",
  "duteous",
  "dutiable",
  "dutiful",
  "dutybound",
  "dwarfed",
  "dwarfish",
  "dwarven",
  "dyable",
  "dying",
  "dynamic",
  "dynamistic",
  "dynamitic",
  "dynastic",
  "dynastical",
  "dysfunctional",
  "dysmorphophobic",
  "dystopian",
  "dystopic",
  "eager",
  "eagleeyed",
  "earnest",
  "earth",
  "earthborn",
  "earthbound",
  "earthen",
  "earthenware",
  "earthly",
  "earthy",
  "easeful",
  "eastbound",
  "eastern",
  "easternmost",
  "eastmost",
  "easy",
  "easygoing",
  "eatable",
  "eaved",
  "ebony",
  "ebullient",
  "eccentric",
  "eccentrical",
  "ecclesiastical",
  "ecclesiologic",
  "ecclesiological",
  "eclectic",
  "eclogite",
  "ecologic",
  "ecological",
  "econometric",
  "econometrical",
  "economic",
  "economical",
  "ecosystemic",
  "ecstatic",
  "ectocranial",
  "ectoplasmatic",
  "ectoplasmic",
  "ecumenical",
  "edacious",
  "edgy",
  "edible",
  "edificial",
  "editorial",
  "educable",
  "educated",
  "educational",
  "educative",
  "educatory",
  "eerie",
  "effaceable",
  "effectible",
  "effective",
  "effectual",
  "effeminate",
  "effervescent",
  "effervescible",
  "effete",
  "efficacious",
  "efficient",
  "effigial",
  "efflorescent",
  "effortful",
  "effortless",
  "effusive",
  "egalitarian",
  "egocentric",
  "egoistic",
  "egoistical",
  "egomaniacal",
  "egotistic",
  "egotistical",
  "egregious",
  "einsteinium",
  "ejective",
  "elaborate",
  "elaborative",
  "elastic",
  "elated",
  "elder",
  "elderly",
  "electoral",
  "electric",
  "electrical",
  "electrified",
  "electrobiological",
  "electrocardiographic",
  "electrodynamic",
  "electrokinetic",
  "electroluminescent",
  "electrolytic",
  "electromagnetic",
  "electromechanical",
  "electrometallurgical",
  "electrometric",
  "electrometrical",
  "electronic",
  "electrophilic",
  "electrophonic",
  "electrosensitive",
  "electrostatic",
  "elegant",
  "elemental",
  "elementary",
  "elephantiasic",
  "elephantine",
  "elephantoid",
  "elevated",
  "elfin",
  "elfish",
  "elicitable",
  "eligible",
  "eliminable",
  "elite",
  "ellipsoidal",
  "elliptic",
  "elliptical",
  "elmy",
  "eloquent",
  "elusive",
  "elvish",
  "emaciated",
  "emanatory",
  "emancipated",
  "emancipating",
  "emancipative",
  "emancipatory",
  "emasculated",
  "emasculative",
  "emasculatory",
  "embarrassed",
  "embarrassing",
  "embattled",
  "emblematic",
  "embolic",
  "embolismic",
  "embraceable",
  "embracive",
  "emerald",
  "emeritus",
  "emersed",
  "emetophobic",
  "emigrational",
  "emigrative",
  "emigratory",
  "eminent",
  "emo",
  "emotionable",
  "emotional",
  "emotionalistic",
  "emotionless",
  "emotive",
  "empathetic",
  "empathic",
  "emphatic",
  "empirical",
  "empiristic",
  "employable",
  "emptiable",
  "emptied",
  "empty",
  "emptyhanded",
  "emptyheaded",
  "empyrean",
  "emulsible",
  "emulsifiable",
  "emulsive",
  "enarthrodial",
  "encephalic",
  "encephalitic",
  "enchanted",
  "enchanting",
  "encouraging",
  "encyclopaedic",
  "endangered",
  "endemic",
  "endless",
  "endocardial",
  "endocranial",
  "endocrine",
  "endocrinologic",
  "endocrinological",
  "endocrinopathic",
  "endocrinous",
  "endodermal",
  "endodermic",
  "endowed",
  "endurable",
  "endurant",
  "enduring",
  "energetic",
  "energetistic",
  "energistic",
  "enervated",
  "enervative",
  "enetophobic",
  "enforceable",
  "engaged",
  "engaging",
  "enginous",
  "englacial",
  "engrammic",
  "enhanced",
  "enhancive",
  "enharmonic",
  "enigmatic",
  "enjambed",
  "enjoyable",
  "enlargeable",
  "enneahedral",
  "enneasyllabic",
  "enormous",
  "enraged",
  "enrapt",
  "enslaved",
  "enstatite",
  "enterprising",
  "entertaining",
  "enthralled",
  "enthroned",
  "enthusiastic",
  "entire",
  "entitled",
  "entodermal",
  "entodermic",
  "entomologic",
  "entomological",
  "entomophagous",
  "entomophobic",
  "entrepreneurial",
  "enumerable",
  "enunciable",
  "enunciatory",
  "enuncuative",
  "enviable",
  "envious",
  "environmental",
  "enzymatic",
  "enzymolytic",
  "eolithic",
  "eonian",
  "ephebiphobic",
  "ephemeral",
  "epicardiac",
  "epicardial",
  "epicentral",
  "epicurean",
  "epidemic",
  "epidermal",
  "epidermic",
  "epidermoid",
  "epimyocardial",
  "episodic",
  "epistemological",
  "epitaphic",
  "epoxy",
  "equable",
  "equal",
  "equalitarian",
  "equanimous",
  "equatable",
  "equational",
  "equatorial",
  "equestrian",
  "equiangular",
  "equicontinuous",
  "equidistant",
  "equilateral",
  "equilibratory",
  "equilibrious",
  "equilibristic",
  "equine",
  "equinophobic",
  "equipable",
  "equitable",
  "equivalent",
  "eradicable",
  "erasable",
  "erect",
  "erectable",
  "erectile",
  "erective",
  "ergasiophobic",
  "ergonomic",
  "ergophilic",
  "ergophobic",
  "ermined",
  "erosive",
  "errable",
  "erratic",
  "erythrophobic",
  "escapable",
  "esophageal",
  "esoteric",
  "especial",
  "essential",
  "establishable",
  "established",
  "establishmentarian",
  "esthetic",
  "esthetical",
  "eternal",
  "ethereal",
  "ethical",
  "ethnic",
  "ethnocentric",
  "ethnogenic",
  "ethnographic",
  "ethnographical",
  "ethnohistoric",
  "ethnohistorical",
  "ethnolinguistic",
  "ethnologic",
  "ethnological",
  "ethnomusicological",
  "ethologic",
  "ethological",
  "etymologic",
  "etymological",
  "eucalyptic",
  "euhedral",
  "euphoric",
  "evacuated",
  "evadable",
  "evadible",
  "evaluable",
  "evasive",
  "even",
  "evenhanded",
  "evenminded",
  "eventempered",
  "eventful",
  "evergreen",
  "everlasting",
  "everyday",
  "evident",
  "evil",
  "evileyed",
  "evilminded",
  "evocable",
  "evolutional",
  "evolutionary",
  "evolutive",
  "evolvable",
  "evolved",
  "exacerbated",
  "exact",
  "exactable",
  "exacting",
  "exaggerated",
  "exalted",
  "exceedable",
  "excellent",
  "exceptional",
  "excess",
  "excessive",
  "exchangeable",
  "excisable",
  "excitable",
  "excited",
  "exciting",
  "exclaimational",
  "exclamatory",
  "exclusionary",
  "exclusionist",
  "exclusive",
  "exclusivistic",
  "excommunicable",
  "excusable",
  "executable",
  "exemplary",
  "exemplifiable",
  "exemplificative",
  "exemptible",
  "exhaustible",
  "exhaustive",
  "exilable",
  "existent",
  "existential",
  "existentialist",
  "existentialistic",
  "exodermal",
  "exorable",
  "exorcismal",
  "exorcistic",
  "exorcistical",
  "exoskeletal",
  "exoteric",
  "exothermic",
  "exotic",
  "expandable",
  "expanded",
  "expansive",
  "expectable",
  "expectant",
  "expected",
  "expecting",
  "expedient",
  "expediential",
  "expeditionary",
  "expeditious",
  "expensive",
  "experienced",
  "experimental",
  "expert",
  "explainable",
  "explicable",
  "exploding",
  "exploitable",
  "exploitative",
  "exploitatory",
  "exploitive",
  "explorable",
  "explosive",
  "exponential",
  "exportable",
  "exposable",
  "exposed",
  "expressible",
  "exquisite",
  "extended",
  "extendible",
  "extensible",
  "exterior",
  "exterminable",
  "external",
  "extinct",
  "extinguishable",
  "extinguished",
  "extra",
  "extracellular",
  "extracorporeal",
  "extragalactic",
  "extrajudicial",
  "extralegal",
  "extranuclear",
  "extraordinary",
  "extraplanetary",
  "extraterrestrial",
  "extraterritorial",
  "extraverted",
  "extravertish",
  "extravertive",
  "extremal",
  "extreme",
  "extrovert",
  "extroverted",
  "extrovertish",
  "extrovertive",
  "exuberant",
  "exultant",
  "eyeable",
  "fab",
  "fabled",
  "fabric",
  "fabulous",
  "facial",
  "facile",
  "factional",
  "factorable",
  "fadable",
  "faded",
  "faint",
  "fainthearted",
  "faintish",
  "fair",
  "fairish",
  "fairylike",
  "faithful",
  "faithless",
  "fake",
  "falconiform",
  "falconine",
  "falconnoid",
  "falsehearted",
  "falsifiable",
  "famed",
  "fameless",
  "familial",
  "familiar",
  "familyish",
  "famished",
  "famous",
  "fanatical",
  "fanciful",
  "fancy",
  "far",
  "farcical",
  "farflung",
  "farseeing",
  "farsighted",
  "fascinated",
  "fascinating",
  "fascist",
  "fashionable",
  "fast",
  "fastmoving",
  "fat",
  "fatal",
  "fatfaced",
  "fatherly",
  "fathomable",
  "fatigable",
  "fatlike",
  "fatlike",
  "fattening",
  "fattish",
  "fatty",
  "fatwitted",
  "faultfinding",
  "faulty",
  "favourite",
  "fawning",
  "fearful",
  "fearless",
  "fearsome",
  "feasible",
  "feather",
  "featherbrained",
  "feathered",
  "featheredged",
  "featherlight",
  "feathery",
  "federal",
  "feeble",
  "feebleminded",
  "feeblish",
  "feedable",
  "feisty",
  "fel",
  "feldspar",
  "felicific",
  "felicitous",
  "feline",
  "fellow",
  "felonious",
  "felt",
  "female",
  "feminine",
  "feminist",
  "feministic",
  "femoral",
  "feral",
  "fermentable",
  "fermium",
  "fernlike",
  "ferny",
  "ferocious",
  "ferreous",
  "ferrety",
  "ferric",
  "ferriferous",
  "ferrous",
  "fertile",
  "fertilizable",
  "fervent",
  "fervid",
  "festive",
  "fetid",
  "feudal",
  "feudalist",
  "feverish",
  "feverous",
  "fibered",
  "fiberglass",
  "fibre",
  "fibroid",
  "fibrous",
  "fickle",
  "fictional",
  "fidgety",
  "fiendish",
  "fierce",
  "fiery",
  "fightable",
  "figurable",
  "filched",
  "filibusterous",
  "fillable",
  "filmable",
  "filterable",
  "filthy",
  "finable",
  "final",
  "financial",
  "findable",
  "fine",
  "fineable",
  "finedrawn",
  "finegrain",
  "finegrained",
  "finespun",
  "finical",
  "finicky",
  "finnicky",
  "firebreathing",
  "firebreathing",
  "firebreathing",
  "fireless",
  "fireproof",
  "fireresistant",
  "fireretardant",
  "fireretardant",
  "firm",
  "first",
  "firstborn",
  "firstgeneration",
  "fiscal",
  "fishable",
  "fishy",
  "fit",
  "fittable",
  "fixable",
  "fixed",
  "fixedincome",
  "fizzy",
  "flabby",
  "flaky",
  "flamboyant",
  "flamecolored",
  "flameproof",
  "flaming",
  "flammable",
  "flamy",
  "flannel",
  "flashy",
  "flat",
  "flatterable",
  "flattering",
  "flattish",
  "flaunty",
  "flavorous",
  "flavoured",
  "flavourful",
  "flavourless",
  "flavoursome",
  "flavoury",
  "flawless",
  "flax",
  "flayed",
  "fleece",
  "fleecy",
  "fleeting",
  "fleshcolored",
  "fleshless",
  "fleshly",
  "fleshy",
  "flexible",
  "flexitarian",
  "flighty",
  "flimsy",
  "flinty",
  "flirtational",
  "flirtatious",
  "flirty",
  "floatable",
  "floating",
  "floaty",
  "flocculable",
  "floggable",
  "floodable",
  "floppy",
  "floral",
  "floreated",
  "floriated",
  "floricultural",
  "florid",
  "floriferous",
  "floristic",
  "flourishing",
  "floury",
  "flowable",
  "flowered",
  "flowering",
  "flowery",
  "fluent",
  "fluffy",
  "fluid",
  "fluidal",
  "fluidic",
  "fluorescent",
  "fluorite",
  "fluorspar",
  "flushed",
  "flyable",
  "flying",
  "foamy",
  "fogbound",
  "fogged",
  "foggy",
  "foggyish",
  "foil",
  "foilable",
  "foldable",
  "foliaceous",
  "foliaged",
  "foliated",
  "followable",
  "fond",
  "foolhardy",
  "foolish",
  "foolproof",
  "footed",
  "forbidden",
  "forbidding",
  "forcible",
  "fordable",
  "foreclosable",
  "foreign",
  "foreknowable",
  "forensic",
  "foreseeable",
  "forest",
  "forestial",
  "forfeitable",
  "forgeable",
  "forgetful",
  "forgettable",
  "forgivable",
  "forlorn",
  "formable",
  "formal",
  "former",
  "formidable",
  "formivorous",
  "forthcoming",
  "fortified",
  "fortitudinous",
  "fortuitous",
  "fortunate",
  "fortunehunting",
  "fortuneless",
  "forworn",
  "fossilisable",
  "fossillike",
  "fossillike",
  "foulard",
  "foulmouthed",
  "foulmouthed",
  "foxlike",
  "foxy",
  "fozy",
  "fractious",
  "fracturable",
  "fragile",
  "fragrant",
  "frail",
  "framable",
  "francium",
  "frangible",
  "frank",
  "frantic",
  "fraternal",
  "fratricidal",
  "freakish",
  "freaky",
  "freckled",
  "frecklefaced",
  "freckly",
  "free",
  "freeborn",
  "freemasonic",
  "freeswimming",
  "freethinking",
  "freetrade",
  "freezable",
  "freezing",
  "frenzied",
  "fresh",
  "fretful",
  "freudian",
  "friended",
  "friendless",
  "friendly",
  "friggatriskaidekaphobic",
  "frightenable",
  "frightened",
  "frightening",
  "frigid",
  "frilly",
  "frisky",
  "frivolous",
  "frizzly",
  "frizzy",
  "frogged",
  "froggy",
  "frolicky",
  "frolicsome",
  "front",
  "frostbitten",
  "frostbreathing",
  "frostbreathing",
  "frostbreathing",
  "frosted",
  "frosty",
  "frothy",
  "frousy",
  "frouzy",
  "frowsy",
  "frowzy",
  "frozen",
  "fructivorous",
  "frugal",
  "frugivorous",
  "fruitarian",
  "fruited",
  "fruitful",
  "fruity",
  "fruticose",
  "fuchsia",
  "full",
  "fullgrown",
  "fulltime",
  "fumbling",
  "fun",
  "functional",
  "fundamental",
  "fungal",
  "fungic",
  "fungicidal",
  "fungiform",
  "fungoid",
  "fungous",
  "fungus",
  "funny",
  "fur",
  "furious",
  "furred",
  "furry",
  "furtive",
  "fusible",
  "fussy",
  "futile",
  "future",
  "futuristic",
  "fuzzy",
  "gabardine",
  "gabby",
  "gadgety",
  "gainable",
  "galactic",
  "galactoid",
  "gallant",
  "galloping",
  "gamboge",
  "gammy",
  "gamy",
  "gangly",
  "gangrene",
  "gangrenous",
  "gargantuan",
  "garish",
  "garlicky",
  "garnet",
  "garnishable",
  "gaseous",
  "gasolinic",
  "gassy",
  "gastric",
  "gastroenterologic",
  "gastrointestinal",
  "gastronomic",
  "gastronomical",
  "gastroscopic",
  "gastrovascular",
  "gatherable",
  "gauche",
  "gaudy",
  "gaugeable",
  "gaunt",
  "gauze",
  "gauzy",
  "gelatinoid",
  "gelatinous",
  "gem",
  "gemmological",
  "gemmy",
  "gemological",
  "gemstone",
  "genealogic",
  "genealogical",
  "general",
  "generalpurpose",
  "generic",
  "generous",
  "genetic",
  "genial",
  "genius",
  "genocidal",
  "gentile",
  "gentle",
  "gentled",
  "gentlemanlike",
  "gentlemanly",
  "gentlewomanly",
  "gentling",
  "genuine",
  "geode",
  "geographical",
  "geologic",
  "geological",
  "geomedical",
  "geometric",
  "geometrical",
  "geophilic",
  "georgiaite",
  "gephyrophobic",
  "gerascophobic",
  "germfree",
  "germicidal",
  "germinable",
  "germless",
  "germlike",
  "germproof",
  "gerontophobic",
  "ghast",
  "ghastful",
  "ghastly",
  "ghetto",
  "ghostlike",
  "ghostly",
  "ghoulish",
  "giant",
  "giddied",
  "giddy",
  "giddying",
  "gifted",
  "giftwrapped",
  "giftwrapped",
  "gigantean",
  "gigantesque",
  "gigantic",
  "giggly",
  "gimmicky",
  "girlish",
  "girly",
  "giveable",
  "glacial",
  "glaciered",
  "glaciologic",
  "glaciological",
  "glad",
  "gladiatorial",
  "glamorous",
  "glandlike",
  "glandular",
  "glandulous",
  "glass",
  "glassy",
  "glaucophane",
  "glazed",
  "gleaming",
  "gleeful",
  "gleesome",
  "glistening",
  "glittery",
  "global",
  "gloomful",
  "gloomy",
  "glorious",
  "glossophilic",
  "glossophobic",
  "glossy",
  "glowing",
  "gluey",
  "glum",
  "gluteal",
  "glutinous",
  "gluttonous",
  "glycemic",
  "gnarled",
  "gnarly",
  "gnatty",
  "gnawable",
  "gnomic",
  "gnomish",
  "gnomologic",
  "gnomological",
  "gnomonic",
  "godfearing",
  "godforsaken",
  "godless",
  "godlike",
  "godly",
  "godsent",
  "gold",
  "golden",
  "goldenrod",
  "goldfilled",
  "goldfoil",
  "goldleaf",
  "good",
  "goodhearted",
  "goodhumoured",
  "goodish",
  "goodlooking",
  "goodly",
  "goodnatured",
  "goodsized",
  "goodtempered",
  "gooey",
  "goofy",
  "goosebumpy",
  "goosepimply",
  "gorgeable",
  "gorgeous",
  "gorillian",
  "gorilline",
  "gorilloid",
  "gossipy",
  "gothic",
  "gourdlike",
  "governable",
  "governing",
  "governmental",
  "grabbable",
  "graceful",
  "graceless",
  "gracious",
  "gradable",
  "grained",
  "grainy",
  "graminivorous",
  "grand",
  "grandfatherly",
  "grandiloquent",
  "grandiose",
  "grandmotherly",
  "grandparental",
  "granite",
  "granitic",
  "granivorous",
  "grantable",
  "grapey",
  "graphic",
  "graphicial",
  "graphite",
  "grapy",
  "graspable",
  "grassgreen",
  "grasslike",
  "grassy",
  "grateful",
  "gratis",
  "gratuitous",
  "grave",
  "gravelish",
  "gravelly",
  "gray",
  "grayish",
  "grazeable",
  "greasy",
  "great",
  "greathearted",
  "greedsome",
  "greedy",
  "green",
  "greenish",
  "greensick",
  "gregarious",
  "greisen",
  "grey",
  "greyish",
  "griefstricken",
  "grieving",
  "grievous",
  "griffinesque",
  "griffinish",
  "grilled",
  "grim",
  "grindable",
  "grisly",
  "groggy",
  "groovelike",
  "groovy",
  "gross",
  "grotesque",
  "grouchy",
  "groundable",
  "growable",
  "grown",
  "grownup",
  "grubby",
  "grumpy",
  "grusome",
  "guardable",
  "gubernatorial",
  "guerdon",
  "guessable",
  "guidable",
  "guileless",
  "guiltless",
  "guilty",
  "gullible",
  "gummous",
  "gummy",
  "gunmetal",
  "gunshy",
  "gushy",
  "gustable",
  "gutless",
  "gutsy",
  "gymnasial",
  "gymnastic",
  "gynephilic",
  "gynophobic",
  "gypsum",
  "habitual",
  "haemophobic",
  "hairraising",
  "hairsplitting",
  "hairy",
  "half",
  "halfalive",
  "halfangry",
  "halfasleep",
  "halfawake",
  "halfbare",
  "halfbleached",
  "halfboiled",
  "halfcrazed",
  "halfcrazy",
  "halfdazed",
  "halfdemocratic",
  "halfdestroyed",
  "halfdivine",
  "halffeminine",
  "halfhypnotised",
  "halfintellectual",
  "halfintelligible",
  "halfjoking",
  "halfliberal",
  "halflinen",
  "halfminded",
  "halfpetrified",
  "halfplayful",
  "halfpleased",
  "halfpleasing",
  "halfromantic",
  "halfround",
  "halfsyllabled",
  "halftheatrical",
  "halfwhite",
  "halfwitted",
  "halfwomanly",
  "halfwoolen",
  "halite",
  "hallowed",
  "hallucinational",
  "hallucinative",
  "hallucinatory",
  "hallucinogenic",
  "halophilic",
  "handcrafted",
  "handdrawn",
  "handheld",
  "handheld",
  "handmade",
  "handsewn",
  "handsome",
  "handsomeish",
  "handwoven",
  "handwritten",
  "handy",
  "hapless",
  "happy",
  "haptephobic",
  "harassed",
  "hard",
  "hardfeatured",
  "hardheaded",
  "hardhearted",
  "hardshell",
  "hardworking",
  "harebrained",
  "harlequinesque",
  "harmful",
  "harmless",
  "harmonic",
  "harmonious",
  "harpaxophilic",
  "harsh",
  "hassium",
  "hasteful",
  "hasteless",
  "hasty",
  "hated",
  "hateful",
  "haughty",
  "haunted",
  "hawkeyed",
  "hawkish",
  "haywire",
  "hazardous",
  "hazy",
  "head",
  "headless",
  "headstrong",
  "healthful",
  "healthy",
  "heartaching",
  "heartbreaking",
  "heartbroken",
  "heartfelt",
  "heartfree",
  "heartless",
  "heartrending",
  "heartrending",
  "heartsick",
  "heartsickening",
  "heartsore",
  "heartstricken",
  "heartwarming",
  "heartwhole",
  "heated",
  "heathen",
  "heathenish",
  "heavenly",
  "heavensent",
  "heavy",
  "heavyhearted",
  "heavyset",
  "hedenbergite",
  "hedonistic",
  "heedful",
  "heedless",
  "heinous",
  "heliodor",
  "heliophilic",
  "heliophobic",
  "helminthologic",
  "helminthological",
  "helpful",
  "helpless",
  "hemihedral",
  "hemispheric",
  "hemispherical",
  "hemispheroidal",
  "hemophobic",
  "hemp",
  "hendecagonal",
  "hendecahedral",
  "hendecasyllabic",
  "hennish",
  "heptagonal",
  "heptahedral",
  "heptahedrical",
  "heptasyllabic",
  "herbaceous",
  "herbal",
  "herbicidal",
  "herbivorous",
  "herby",
  "herculean",
  "heretical",
  "hermitic",
  "hermitical",
  "hermitish",
  "hermitlike",
  "heroic",
  "herpetologic",
  "herpetological",
  "herringlike",
  "hesitant",
  "hessian",
  "hexadic",
  "hexaemeric",
  "hexagonal",
  "hexagrammoid",
  "hexahedral",
  "hexakosioihexekontahexaphobic",
  "hexametral",
  "hexametric",
  "hexametrical",
  "hexangular",
  "hexapartite",
  "hexasyllabic",
  "hexed",
  "hick",
  "hidden",
  "hideous",
  "hieroglyphic",
  "high",
  "highborn",
  "highbred",
  "highclass",
  "highexplosive",
  "highfaluting",
  "highhanded",
  "highlyexplosive",
  "highspirited",
  "highspiritedly",
  "hilarious",
  "hillocked",
  "hillocky",
  "hilly",
  "hip",
  "hippophagous",
  "hippophilic",
  "hippophobic",
  "hippy",
  "hirsutophilic",
  "historic",
  "historical",
  "historied",
  "historiographic",
  "historiographical",
  "hogged",
  "hoggish",
  "hoglike",
  "holistic",
  "hollow",
  "hollowhearted",
  "holographic",
  "holohedral",
  "holy",
  "homebred",
  "homebrewed",
  "homegrown",
  "homeless",
  "homely",
  "homemade",
  "homemade",
  "homeopathic",
  "homesick",
  "homespun",
  "homey",
  "homicidal",
  "hominine",
  "hominoid",
  "honest",
  "honeyed",
  "honeyful",
  "honeysuckled",
  "honeysweet",
  "honorary",
  "honorific",
  "honourable",
  "honourless",
  "hopeful",
  "hoplophobia",
  "hopping",
  "horizontal",
  "hormonal",
  "hornblende",
  "hornmad",
  "horoscopic",
  "horrendous",
  "horrible",
  "horrid",
  "horrific",
  "horrified",
  "horrifying",
  "horrorstruck",
  "horselike",
  "horseplayful",
  "horsey",
  "horsy",
  "horticultural",
  "hospitable",
  "hostile",
  "hot",
  "hotheaded",
  "hotheaded",
  "hottempered",
  "houndish",
  "houndlike",
  "houndy",
  "huge",
  "hulkingsuperstrong",
  "hulky",
  "human",
  "humane",
  "humanitarian",
  "humanlike",
  "humanoid",
  "humble",
  "humbled",
  "humdrum",
  "humid",
  "humiliated",
  "humoristic",
  "humorous",
  "humourful",
  "humourless",
  "humoursome",
  "hungry",
  "hurried",
  "hurt",
  "hurtful",
  "hushhush",
  "hyacinth",
  "hydrated",
  "hydrogen",
  "hydrometallurgical",
  "hydrophilic",
  "hydrophobic",
  "hygenic",
  "hygienic",
  "hygrophilic",
  "hylophagous",
  "hyperactive",
  "hyperallergenic",
  "hyperangelic",
  "hyperangelical",
  "hyperbolic",
  "hyperbrutal",
  "hypercephalic",
  "hyperdemocratic",
  "hyperintelligent",
  "hypermystical",
  "hyperpolysyllabic",
  "hyperprophetic",
  "hyperprophetical",
  "hyperrational",
  "hyperritualistic",
  "hyperromantic",
  "hypersaintly",
  "hypersceptical",
  "hyperscholastic",
  "hypersensitive",
  "hyperspherical",
  "hypersthene",
  "hypervigilant",
  "hypnotic",
  "hypnotised",
  "hypnotizing",
  "hypoactive",
  "hypoallergenic",
  "hypocephalic",
  "hypocritical",
  "hypodermal",
  "hypoglycemic",
  "hypothetical",
  "hysterical",
  "iambic",
  "ice",
  "icebound",
  "icecold",
  "iced",
  "ichthyophagous",
  "ichthyophobic",
  "icicled",
  "icky",
  "iconic",
  "iconophilic",
  "icosahedral",
  "icy",
  "ideal",
  "idealistic",
  "identical",
  "ideological",
  "idiocratic",
  "idiocratical",
  "idiosyncratic",
  "idiotic",
  "idiotproof",
  "idle",
  "idled",
  "idling",
  "igneous",
  "ignitable",
  "igniteable",
  "ignoble",
  "ignorant",
  "ignored",
  "ill",
  "illadvised",
  "illaffected",
  "illbehaved",
  "illbred",
  "illconsidered",
  "illdefined",
  "illdisposed",
  "illegal",
  "illegible",
  "illfated",
  "illfavoured",
  "illgotten",
  "illhumored",
  "illhumoured",
  "illicit",
  "illimitable",
  "illinformed",
  "illiterate",
  "illjudged",
  "illlooking",
  "illmannered",
  "illnatured",
  "illogical",
  "illsorted",
  "illstarred",
  "illsuited",
  "illtempered",
  "illtempered",
  "illtimed",
  "illuminating",
  "illusory",
  "illustrious",
  "illwilled",
  "imaginative",
  "immaculate",
  "immaterial",
  "immature",
  "immediate",
  "immense",
  "imminent",
  "immobile",
  "immoderate",
  "immolated",
  "immoral",
  "immortal",
  "immovable",
  "immoveable",
  "immune",
  "immunological",
  "imparisyllabic",
  "impassionate",
  "impassioned",
  "impatient",
  "impeccable",
  "impending",
  "imperfect",
  "imperial",
  "imperialistic",
  "imperious",
  "impertinent",
  "impervious",
  "impious",
  "impish",
  "impolite",
  "important",
  "imported",
  "imposing",
  "impossible",
  "impotent",
  "impoverished",
  "imprecise",
  "impregnable",
  "impressed",
  "impressive",
  "improbable",
  "improved",
  "improvident",
  "improvised",
  "imprudent",
  "impudent",
  "impulsive",
  "inaccurate",
  "inadequate",
  "inadvertent",
  "inanimate",
  "inappropriate",
  "inartistic",
  "inattentive",
  "inborn",
  "inbred",
  "incandescent",
  "incapable",
  "incautious",
  "incendiary",
  "incensed",
  "incognisant",
  "incognizant",
  "incoherent",
  "incombustible",
  "incompatible",
  "incompetent",
  "incomplete",
  "incomprehensible",
  "inconclusive",
  "inconsequent",
  "inconsequential",
  "inconsiderate",
  "inconspicuous",
  "inconstant",
  "incontinuous",
  "inconvenient",
  "incorporated",
  "incorporeal",
  "incorrupt",
  "incorruptible",
  "increased",
  "incredible",
  "incredulous",
  "incurable",
  "indecipherable",
  "indecisive",
  "indefatigable",
  "indefinite",
  "independent",
  "indestructible",
  "indicolite",
  "indifferent",
  "indigenous",
  "indigo",
  "indigoblue",
  "indigoid",
  "indiscreet",
  "indisposed",
  "indistinct",
  "indistinctive",
  "individual",
  "individualistic",
  "indomitable",
  "indoor",
  "industrial",
  "industrialized",
  "industrious",
  "inedible",
  "ineffective",
  "inept",
  "inexistent",
  "inexpensive",
  "inexperienced",
  "inexplosive",
  "inextinguishable",
  "infamous",
  "infantile",
  "infantine",
  "infatuated",
  "infectious",
  "inferior",
  "infertile",
  "infinite",
  "infirm",
  "inflammable",
  "inflatable",
  "influential",
  "influenzal",
  "influenzalike",
  "informal",
  "ingenious",
  "ingenuous",
  "inglorious",
  "inherent",
  "inherited",
  "inhuman",
  "inhumane",
  "initial",
  "injudicious",
  "injured",
  "injurious",
  "inky",
  "inland",
  "inner",
  "innocent",
  "innocuous",
  "innovative",
  "inodorous",
  "inopportune",
  "inorganic",
  "inquiring",
  "inquisitive",
  "insane",
  "insanitary",
  "insectean",
  "insecticidal",
  "insectile",
  "insectival",
  "insectivorous",
  "insectologic",
  "insectological",
  "insecure",
  "insensate",
  "insensible",
  "insensitive",
  "insentient",
  "inseverable",
  "inside",
  "insidious",
  "insignificant",
  "insincere",
  "insipid",
  "insistent",
  "insolent",
  "insomniac",
  "inspirational",
  "instant",
  "institutional",
  "instrumental",
  "insubordinate",
  "insufficient",
  "insulaphilic",
  "insulted",
  "insulting",
  "insured",
  "insurrectional",
  "insurrectionary",
  "intact",
  "intangible",
  "integral",
  "intellectual",
  "intellectualistic",
  "intelligent",
  "intelligible",
  "intense",
  "intensive",
  "interacademic",
  "interartistic",
  "interchurch",
  "interclerical",
  "intercontradictory",
  "intercorporate",
  "intercosmic",
  "intercranial",
  "intercrystalline",
  "interdental",
  "interdestructive",
  "interested",
  "interesting",
  "interfaith",
  "interglacial",
  "interglandular",
  "intergovernmental",
  "interhemispheric",
  "interior",
  "interisland",
  "interlibrary",
  "intermarine",
  "intermediate",
  "intermetallic",
  "internal",
  "international",
  "internuclear",
  "interoceanic",
  "interparenthetic",
  "interparenthetical",
  "interplanetary",
  "interreligious",
  "interscholastic",
  "interscience",
  "interspinal",
  "interspinous",
  "intersubjective",
  "interuniversity",
  "intestinal",
  "intimate",
  "intolerable",
  "intolerant",
  "intoxicated",
  "intracardiac",
  "intracranial",
  "intradermal",
  "intragovernmental",
  "intranational",
  "intranuclear",
  "intrapsychic",
  "intraspinal",
  "intravert",
  "intraverted",
  "intravertish",
  "intriguing",
  "introvert",
  "introverted",
  "introvertish",
  "intrusive",
  "invaluable",
  "invasive",
  "inverse",
  "inversive",
  "invigorative",
  "invincible",
  "invisibility",
  "invisible",
  "involuntary",
  "involved",
  "invulnerable",
  "ionic",
  "irascible",
  "irate",
  "iridescent",
  "irksome",
  "ironbound",
  "ironclad",
  "ironfisted",
  "irongray",
  "irongrey",
  "ironhanded",
  "ironhearted",
  "ironic",
  "ironical",
  "irradiated",
  "irrational",
  "irrationalist",
  "irrationalistic",
  "irregular",
  "irrelevant",
  "irrepressible",
  "irreproachable",
  "irresistible",
  "irresponsible",
  "irresponsive",
  "irreversible",
  "irritable",
  "irritated",
  "irritating",
  "isinglass",
  "islandish",
  "islandless",
  "islandlike",
  "isleless",
  "isleted",
  "isoceles",
  "isogonal",
  "isogonic",
  "isolated",
  "isopolitical",
  "isotope",
  "itching",
  "itchy",
  "ittybitty",
  "ivory",
  "ivorytowered",
  "jade",
  "jaded",
  "jadegreen",
  "jadeite",
  "jadish",
  "jagged",
  "jaunty",
  "jazzy",
  "jealous",
  "jeanlike",
  "jeffersonite",
  "jellied",
  "jestful",
  "jesting",
  "jet",
  "jetblack",
  "jewel",
  "jingoistic",
  "jittery",
  "jobless",
  "jockeyish",
  "jocund",
  "jokeless",
  "joking",
  "jolly",
  "journalary",
  "journalish",
  "journalistic",
  "jovial",
  "joyful",
  "joyless",
  "joyous",
  "jubilant",
  "judgemental",
  "judgmental",
  "judicial",
  "judicious",
  "juice",
  "juiced",
  "juicy",
  "jumping",
  "jumpy",
  "junior",
  "just",
  "jute",
  "juvenal",
  "juvenescent",
  "juvenile",
  "kainolophobic",
  "kainophobic",
  "kakotopic",
  "kaleidoscopic",
  "kamikaze",
  "kaolin",
  "kaolinite",
  "kaput",
  "karmic",
  "katatonic",
  "keen",
  "keraunophobic",
  "ketogenetic",
  "ketogenic",
  "ketonic",
  "key",
  "khaki",
  "kilted",
  "kimberlite",
  "kinaesthetic",
  "kind",
  "kindhearted",
  "kindly",
  "kinesthetic",
  "kinetic",
  "kinglike",
  "kingly",
  "kingsize",
  "kitschy",
  "kittenish",
  "klepto",
  "kleptomaniac",
  "kleptomanic",
  "klutzy",
  "knavish",
  "kneedeep",
  "kneehigh",
  "kneelength",
  "knightly",
  "knitted",
  "knotted",
  "knotty",
  "knowing",
  "knowledgeable",
  "known",
  "knuckleheaded",
  "kooky",
  "kosher",
  "kunzite",
  "kyanite",
  "laborious",
  "labyrinthine",
  "lace",
  "lacelike",
  "lacertilian",
  "lackadaisical",
  "lacklustre",
  "laconic",
  "lacquer",
  "lacquerware",
  "lacy",
  "ladyish",
  "ladylike",
  "lagging",
  "laissezfaire",
  "lambskin",
  "lambswool",
  "lame",
  "lamentable",
  "laminate",
  "lamproite",
  "lamprophyre",
  "landpoor",
  "lapis",
  "lardy",
  "large",
  "largehearted",
  "largescale",
  "largish",
  "larval",
  "larvicidal",
  "larvivorous",
  "last",
  "late",
  "latticed",
  "laudable",
  "lavender",
  "lavish",
  "lawabiding",
  "lawful",
  "lawless",
  "lawlike",
  "lawrencium",
  "lawyerlike",
  "lawyerly",
  "lax",
  "lazuline",
  "lazy",
  "lazyish",
  "leachy",
  "lead",
  "leading",
  "leady",
  "leafed",
  "leaflike",
  "leafy",
  "lean",
  "learned",
  "leather",
  "leathern",
  "leathery",
  "leekgreen",
  "leery",
  "left",
  "leftist",
  "legal",
  "legalistic",
  "legatine",
  "legendary",
  "legged",
  "leggy",
  "legible",
  "legislative",
  "legislatorial",
  "legless",
  "leisurable",
  "leisured",
  "leisureless",
  "lemon",
  "lemonish",
  "lemony",
  "lemuroid",
  "lengthy",
  "leopardprint",
  "lepidolite",
  "leprous",
  "lethal",
  "lethargic",
  "lettered",
  "letterhigh",
  "letterperfect",
  "level",
  "lexical",
  "lexicographic",
  "lexicographical",
  "lexicologic",
  "lexicological",
  "lexiconophilic",
  "lexicostatistic",
  "lexicostatistical",
  "lherzolite",
  "liable",
  "liberal",
  "liberalistic",
  "liberated",
  "liberating",
  "libertarian",
  "liberticidal",
  "lifeless",
  "lifesize",
  "light",
  "lighted",
  "lighthearted",
  "lightsome",
  "lightweight",
  "lignite",
  "lignivorous",
  "ligyrophobic",
  "likable",
  "like",
  "liked",
  "likely",
  "likeminded",
  "lilac",
  "lilylivered",
  "lilywhite",
  "limbless",
  "lime",
  "limestone",
  "limitless",
  "limivorous",
  "limnophilic",
  "limpid",
  "limping",
  "limy",
  "linear",
  "linen",
  "lineny",
  "linguistic",
  "linoleum",
  "linty",
  "lionesque",
  "lionhearted",
  "lionly",
  "lipophobic",
  "liquid",
  "literal",
  "literalistic",
  "literalminded",
  "literary",
  "literate",
  "lithe",
  "lithophilic",
  "little",
  "littlish",
  "live",
  "lively",
  "livid",
  "living",
  "loath",
  "loathful",
  "loathsome",
  "local",
  "locomotive",
  "locomotor",
  "locustal",
  "logical",
  "logophilic",
  "lonely",
  "lonesome",
  "long",
  "longish",
  "longsuffering",
  "longterm",
  "looney",
  "loony",
  "loopy",
  "lopsided",
  "lost",
  "lousy",
  "loutish",
  "lovable",
  "loveable",
  "lovecraftian",
  "loved",
  "loveless",
  "lovelorn",
  "lovely",
  "loverless",
  "lovesick",
  "lovesome",
  "loveydovey",
  "loving",
  "low",
  "lowborn",
  "lowbred",
  "lowcost",
  "lowerclass",
  "lowfat",
  "lowish",
  "lowkey",
  "lowly",
  "lowspirited",
  "loyal",
  "lucid",
  "lucky",
  "ludicrous",
  "lukewarm",
  "luminescent",
  "luminiferous",
  "luminous",
  "lumpish",
  "lumpy",
  "lunar",
  "lunatic",
  "lunies",
  "lunisolar",
  "luny",
  "lupine",
  "luscious",
  "lush",
  "lustered",
  "lustrous",
  "luxuriant",
  "luxurious",
  "lycanthropic",
  "lygophilic",
  "lygophobic",
  "lying",
  "lyrical",
  "macabre",
  "machiavellian",
  "macho",
  "macrobiotic",
  "macroclimatic",
  "macroeconomic",
  "macroeconomical",
  "macronuclear",
  "macroscopic",
  "mad",
  "maddening",
  "maddish",
  "magenta",
  "magic",
  "magical",
  "magnanimous",
  "magnesial",
  "magnesian",
  "magnesic",
  "magnesium",
  "magnetic",
  "magnific",
  "magnificent",
  "mahogany",
  "maimouphilic",
  "main",
  "maize",
  "majestic",
  "major",
  "makeshift",
  "malacologic",
  "malacological",
  "maladroit",
  "malcontent",
  "male",
  "maleficent",
  "malevolent",
  "malicious",
  "malignant",
  "maligned",
  "malleable",
  "malnourished",
  "malodorous",
  "malophilic",
  "mammalian",
  "mammalogical",
  "mammoth",
  "managerial",
  "managing",
  "maniacal",
  "manic",
  "manicdepressive",
  "manipulable",
  "manipulative",
  "manlike",
  "manly",
  "manmade",
  "mannerly",
  "marauding",
  "marble",
  "marginal",
  "marine",
  "marital",
  "maritime",
  "marked",
  "marmatite",
  "maroon",
  "married",
  "marshlike",
  "marshy",
  "marvellous",
  "masculine",
  "masochistic",
  "masonic",
  "massive",
  "master",
  "masterful",
  "masticated",
  "material",
  "materialistic",
  "maternal",
  "maternalistic",
  "mathematical",
  "matriarchal",
  "matriarchic",
  "matricidal",
  "matrilateral",
  "matrilineal",
  "matrimonial",
  "matronal",
  "matronly",
  "mature",
  "maudlin",
  "mauve",
  "maximum",
  "maxixe",
  "mazelike",
  "meagre",
  "mean",
  "meaningful",
  "meaningless",
  "meanspirited",
  "measled",
  "measly",
  "meaty",
  "mechanical",
  "mechanistic",
  "meddlesome",
  "mediaeval",
  "medical",
  "medicinal",
  "medicore",
  "medium",
  "mediumsized",
  "meek",
  "mega",
  "megacephalic",
  "megalomaniacal",
  "megamalophilic",
  "meitnerium",
  "melancholy",
  "melissophobic",
  "melittologic",
  "melittological",
  "mellow",
  "melodic",
  "melodious",
  "melodramatic",
  "melting",
  "mendelevium",
  "menial",
  "mental",
  "mercantile",
  "mercenary",
  "merciful",
  "mercurial",
  "mere",
  "meritocrat",
  "meritocratic",
  "merry",
  "mesodermal",
  "mesodermic",
  "messianic",
  "messy",
  "metal",
  "metalled",
  "metallic",
  "metalliferous",
  "metalline",
  "metallographic",
  "metallographical",
  "metamathematical",
  "metamorphic",
  "metamorphous",
  "metaphoric",
  "metaphorical",
  "metaphysical",
  "metapsychological",
  "metazoic",
  "metempsychic",
  "metempsychosic",
  "metempsychosical",
  "meteorographic",
  "meteorological",
  "meteoropathologic",
  "meticulous",
  "metrophilic",
  "metropolitan",
  "mettlesome",
  "mica",
  "microbial",
  "microbian",
  "microbic",
  "microbicidal",
  "microbiologic",
  "microbiological",
  "microbiophobic",
  "microclimatic",
  "microclimatologic",
  "microclimatological",
  "microcosmic",
  "microcosmical",
  "microcystalline",
  "microeconomic",
  "microeconomical",
  "microphysical",
  "microscopic",
  "mid",
  "middle",
  "middleclass",
  "mighty",
  "mild",
  "militant",
  "militaristic",
  "military",
  "milklivered",
  "milkwhite",
  "milky",
  "minced",
  "mindful",
  "mindless",
  "mineralogic",
  "mineralogical",
  "mini",
  "miniature",
  "minimal",
  "minimum",
  "miniscule",
  "ministerial",
  "minor",
  "minuscular",
  "minute",
  "miraculous",
  "mirky",
  "mirthful",
  "miry",
  "misandrist",
  "misandrous",
  "misanthropic",
  "miscellaneous",
  "mischievous",
  "miscreant",
  "miserable",
  "miserly",
  "misleading",
  "misogynic",
  "misogynistic",
  "misogynous",
  "missing",
  "mistrustful",
  "misty",
  "misunderstood",
  "mobile",
  "moderate",
  "modern",
  "modernistic",
  "modest",
  "modish",
  "moist",
  "moistful",
  "moldavite",
  "molecular",
  "moleskin",
  "molybdenite",
  "momentary",
  "monarchal",
  "monarchical",
  "monarchist",
  "monarchistic",
  "monetary",
  "moneygrubbing",
  "monkeyish",
  "monochromatic",
  "monochrome",
  "monocultural",
  "monodramatic",
  "monogamous",
  "monolithic",
  "monometallic",
  "mononuclear",
  "monophagous",
  "monosyllabic",
  "monotonous",
  "monstrous",
  "monumental",
  "moody",
  "moonish",
  "moonlit",
  "moonstone",
  "moonwalking",
  "moony",
  "mopey",
  "moral",
  "morbid",
  "moronic",
  "morose",
  "mossy",
  "motherly",
  "motionless",
  "moudly",
  "mountable",
  "mountainous",
  "mousey",
  "mousy",
  "moving",
  "mucky",
  "mudbrick",
  "muddled",
  "muddy",
  "multicoloured",
  "multicystalline",
  "multilineal",
  "multilinear",
  "multimetallic",
  "multinuclear",
  "multipurpose",
  "mundane",
  "murderous",
  "murky",
  "muscovite",
  "mushroomy",
  "mushy",
  "musical",
  "musicianly",
  "musicological",
  "musophobic",
  "mustard",
  "mutant",
  "mutated",
  "mutinous",
  "mutual",
  "muzzled",
  "mycologic",
  "mycological",
  "mycophagous",
  "myocardial",
  "myopic",
  "myrmecological",
  "myrmecophagous",
  "myrmecophilic",
  "myrmecophilous",
  "myrtle",
  "mysophobic",
  "mysterious",
  "mystical",
  "mythical",
  "mythoclastic",
  "mythological",
  "mythopoeic",
  "naggish",
  "naggy",
  "naive",
  "naptunium",
  "narcissistic",
  "narcistic",
  "narcoleptic",
  "narrow",
  "nasty",
  "natant",
  "natatorial",
  "natatory",
  "national",
  "nationalistic",
  "native",
  "natural",
  "naughty",
  "nauseating",
  "nauseous",
  "nautical",
  "naval",
  "navy",
  "near",
  "nearby",
  "nearsighted",
  "nearsighted",
  "neat",
  "nebulous",
  "necessary",
  "necromantic",
  "necromantical",
  "necrophagous",
  "necrophobic",
  "necropolitan",
  "necrotic",
  "needless",
  "needy",
  "negative",
  "neglectful",
  "negligent",
  "neighbourly",
  "nematologic",
  "nematological",
  "nemophilic",
  "neofascist",
  "neon",
  "neophilic",
  "neophobic",
  "nepheline",
  "nephelite",
  "nephrite",
  "nepotic",
  "nepotistic",
  "nepotistical",
  "nerdy",
  "nervous",
  "nettlesome",
  "neuroeconomic",
  "neuroeconomical",
  "neurological",
  "neurotic",
  "neutered",
  "neutral",
  "neutralizing",
  "new",
  "newborn",
  "newrich",
  "newspaperish",
  "newsworthy",
  "newsy",
  "next",
  "nice",
  "nickel",
  "nickelic",
  "nickeliferous",
  "nickelous",
  "nifty",
  "niggling",
  "nightmarish",
  "nihilistic",
  "nimble",
  "nirvanic",
  "nitpicking",
  "nitro",
  "nitrophilic",
  "nobelium",
  "noble",
  "nobleminded",
  "nocturnal",
  "noetic",
  "noir",
  "nomadic",
  "nomophobic",
  "nonabsolute",
  "nonabsolutistic",
  "nonacademic",
  "nonacademical",
  "nonacculturated",
  "nonagrarian",
  "nonagricultural",
  "nonalgebraic",
  "nonalgebraical",
  "nonallergenic",
  "nonangelic",
  "nonartistic",
  "nonartistical",
  "nonblack",
  "noncapitalistic",
  "noncarcinogenic",
  "noncarnivorous",
  "nonchalant",
  "nonchurched",
  "nonchurchgoing",
  "noncollinear",
  "noncontinuous",
  "noncontradictory",
  "noncorporate",
  "noncorporative",
  "noncreative",
  "noncriminal",
  "noncrystalline",
  "noncrystallised",
  "noncrystallising",
  "noncultural",
  "noncultured",
  "nondeadly",
  "nondecasyllabic",
  "nondemocratic",
  "nondemocratical",
  "nondenominational",
  "nondeodorizing",
  "nondescript",
  "nondesirous",
  "nondespotic",
  "nondestructive",
  "nondifficult",
  "nondiplomatic",
  "nondramatic",
  "noneconomical",
  "noneducable",
  "noneducational",
  "nonempty",
  "nonessential",
  "nonevolutional",
  "nonevolutionary",
  "nonevolving",
  "nonexistent",
  "nonexistential",
  "nonexisting",
  "nonexperimental",
  "nonfalsifiable",
  "nonfat",
  "nonfatal",
  "nonfinancial",
  "nonfireproof",
  "nonflammable",
  "nonfragrant",
  "nongeometric",
  "nongeometrical",
  "nonglacial",
  "nongreen",
  "nonhazardous",
  "nonhistoric",
  "nonhistorical",
  "nonincorporated",
  "nonincorporative",
  "nonintrospective",
  "nonintroversive",
  "nonintroverted",
  "noninvincible",
  "nonirrational",
  "nonlegal",
  "nonlegislative",
  "nonlineal",
  "nonlinear",
  "nonliteral",
  "nonliterary",
  "nonliving",
  "nonluminous",
  "nonmagnetic",
  "nonmathematic",
  "nonmathematical",
  "nonmedicable",
  "nonmedical",
  "nonmedicative",
  "nonmelodramatic",
  "nonmercenary",
  "nonmetallic",
  "nonmetalliferous",
  "nonmetallurgic",
  "nonmetallurgical",
  "nonmonarchal",
  "nonmonarchial",
  "nonmonarchic",
  "nonmonarchistic",
  "nonmoving",
  "nonmystic",
  "nonmystical",
  "nonmythical",
  "nonmythologic",
  "nonmythological",
  "nonnational",
  "nonnationalistic",
  "nonobjective",
  "nonobjectivistic",
  "nonodoriferous",
  "nonodorous",
  "nonorganic",
  "nonpartisan",
  "nonphilosophic",
  "nonphilosophical",
  "nonplanetary",
  "nonpoisonous",
  "nonpolitical",
  "nonpriestly",
  "nonprogressive",
  "nonproift",
  "nonprophetic",
  "nonprophetical",
  "nonpsychiatric",
  "nonpsychic",
  "nonpsychical",
  "nonpsychoanalytic",
  "nonpsychoanalytical",
  "nonpsychologic",
  "nonpsychological",
  "nonpsychopathic",
  "nonpsychotic",
  "nonrational",
  "nonrationalised",
  "nonrationalistic",
  "nonrationalistical",
  "nonrectangular",
  "nonreligious",
  "nonritualistic",
  "nonromantic",
  "nonround",
  "nonroyal",
  "nonscholarly",
  "nonscholastic",
  "nonscholastical",
  "nonscientific",
  "nonsecular",
  "nonsensical",
  "nonsentient",
  "nonskeptic",
  "nonskeptical",
  "nonsolar",
  "nonsolicitous",
  "nonspheral",
  "nonspheric",
  "nonspherical",
  "nonspinal",
  "nonspiny",
  "nonspirited",
  "nonspiritous",
  "nonspiritual",
  "nonspirituous",
  "nonstick",
  "nonsticky",
  "nonstop",
  "nonsubjective",
  "nonterrestrial",
  "nonterritorial",
  "nontheatric",
  "nontheatrical",
  "nontheocratic",
  "nontheocratical",
  "nontheologic",
  "nontheological",
  "nontoxic",
  "nontraditional",
  "nontrigonometric",
  "nontrigonometrical",
  "nonvacant",
  "nonvagrant",
  "nonvaluable",
  "nonvalued",
  "nonzoologic",
  "nonzoological",
  "normal",
  "northbound",
  "northeastern",
  "northern",
  "northernmost",
  "northmost",
  "northwestern",
  "nosey",
  "nosophobic",
  "nostalgic",
  "nosy",
  "notable",
  "notaphilic",
  "noteworthy",
  "notorious",
  "novel",
  "novice",
  "nubuck",
  "nuclear",
  "nude",
  "numb",
  "numbing",
  "numeric",
  "numerical",
  "nuptial",
  "nutbrown",
  "nutlike",
  "nutritional",
  "nutritious",
  "nutty",
  "nyctophilic",
  "nyctophobic",
  "nylon",
  "oafish",
  "obedient",
  "obeliskoid",
  "obese",
  "objective",
  "oblivious",
  "oblong",
  "obnoxious",
  "obscene",
  "obsequious",
  "observant",
  "obsessive",
  "obsidian",
  "obsolete",
  "obtuse",
  "obvious",
  "occasional",
  "occupational",
  "oceangoing",
  "oceanic",
  "oceanlike",
  "oceanographic",
  "oceanographical",
  "ochre",
  "octagonal",
  "octahedral",
  "odd",
  "odious",
  "odorful",
  "odoriferous",
  "odorous",
  "odourful",
  "odourless",
  "offbeat",
  "offcolour",
  "offended",
  "offensive",
  "official",
  "ogreish",
  "oily",
  "ok",
  "okay",
  "old",
  "oldfashioned",
  "olericultural",
  "olfactophobic",
  "oligoantigenic",
  "olive",
  "olivine",
  "olympic",
  "ombrophilic",
  "ombrophobic",
  "ominous",
  "omnipotent",
  "omnipresent",
  "omniscient",
  "omnivorous",
  "omphacite",
  "ondontophobic",
  "onerous",
  "oniony",
  "only",
  "onyx",
  "oozy",
  "opal",
  "open",
  "openminded",
  "operatic",
  "operational",
  "operose",
  "ophidiophilic",
  "ophidiophobic",
  "ophiophilic",
  "ophthalmological",
  "opinionated",
  "opposite",
  "oppressed",
  "oppressive",
  "optic",
  "optical",
  "optimal",
  "optimistic",
  "optometric",
  "optometrical",
  "orange",
  "orchestral",
  "orcish",
  "ordinary",
  "ore",
  "organic",
  "organisational",
  "organizational",
  "organoactinoid",
  "organometallic",
  "oriental",
  "original",
  "originative",
  "ornamental",
  "ornate",
  "ornery",
  "ornithologic",
  "ornithological",
  "ornithophilic",
  "ornithophobic",
  "orthoclase",
  "orthodontic",
  "orthodox",
  "orthogonal",
  "oryzivorous",
  "oscitant",
  "osmophilic",
  "osmophobic",
  "ossivorous",
  "ostentatious",
  "ostracized",
  "other",
  "otherworldly",
  "outdoor",
  "outdoorsy",
  "outer",
  "outgoing",
  "outraged",
  "outrageous",
  "outside",
  "outstanding",
  "oval",
  "overaggressive",
  "overbearing",
  "overbig",
  "overbrutal",
  "overburdened",
  "overconfident",
  "overconservative",
  "overconstant",
  "overcooked",
  "overcultured",
  "overcurious",
  "overdesirous",
  "overdestructive",
  "overdramatic",
  "overdry",
  "overemotional",
  "overempty",
  "overfaithful",
  "overgrown",
  "overhaughty",
  "overhostile",
  "overjoyed",
  "overjoyful",
  "overjoyous",
  "overliberal",
  "overliterary",
  "overluxuriant",
  "overluxurious",
  "overnoble",
  "overparticular",
  "overpolitical",
  "overpriced",
  "overrated",
  "overrational",
  "overreligious",
  "overseas",
  "oversize",
  "overskeptical",
  "oversolemn",
  "overtheatrical",
  "overvigorous",
  "overweak",
  "overwealthy",
  "overweight",
  "overwhelming",
  "overzealous",
  "oxygen",
  "oxymoronic",
  "pachydermal",
  "pachydermatous",
  "pachydermic",
  "pachydermoid",
  "pachydermous",
  "pacified",
  "pacifist",
  "pacifistic",
  "padparadscha",
  "paediatric",
  "pagan",
  "paganist",
  "paganistic",
  "painful",
  "painstaking",
  "painted",
  "palaeobiologic",
  "palaeobiological",
  "palaeobotanic",
  "palaeobotanical",
  "palaeoclimatologic",
  "palaeoclimatological",
  "palaeoecologic",
  "palaeoecological",
  "palaeological",
  "palaeophilic",
  "palaeozoologic",
  "palaeozoological",
  "pale",
  "paleobiologic",
  "paleobiological",
  "paleoclimatologic",
  "paleoclimatological",
  "paleoecologic",
  "paleoecological",
  "paleogeologic",
  "paleographic",
  "paleographical",
  "paleogrographical",
  "paleolithic",
  "paleological",
  "paleopsychic",
  "paleopsychological",
  "paleozoologic",
  "paleozoological",
  "palish",
  "pallid",
  "pancratic",
  "pancreatic",
  "panicky",
  "panoramic",
  "panphobic",
  "panpsychic",
  "panpsychistic",
  "paper",
  "papershelled",
  "papery",
  "papyraceous",
  "papyral",
  "paradoxal",
  "paradoxical",
  "paraffin",
  "paragonit",
  "paragonita",
  "paragonite",
  "parallel",
  "paralysed",
  "paralytic",
  "paralyzed",
  "paralyzing",
  "paramedical",
  "paramilitant",
  "paramilitaristic",
  "paramilitary",
  "paramount",
  "paranoiac",
  "paranoid",
  "paranormal",
  "parapsychological",
  "parasitic",
  "parasiticidal",
  "paraskavedekatriaphobic",
  "paraskavidekatriaphobic",
  "parenthetic",
  "parenthetical",
  "parisyllabic",
  "parliamentary",
  "parochial",
  "parochialist",
  "parodic",
  "parodistic",
  "parsimonious",
  "partial",
  "particular",
  "partlycoloured",
  "parttime",
  "passionate",
  "passive",
  "pastoral",
  "pasty",
  "pastyfaced",
  "patchwork",
  "patchy",
  "paternal",
  "pathetic",
  "pathworky",
  "patient",
  "patriarchal",
  "patriarchic",
  "patriarchical",
  "patrician",
  "patricidal",
  "patrilateral",
  "patrilineal",
  "patriotic",
  "patronal",
  "patronising",
  "patronizing",
  "pattern",
  "patterned",
  "patterny",
  "peaceable",
  "peaceful",
  "peach",
  "peachy",
  "peacockish",
  "peacocky",
  "pear",
  "pearl",
  "pearlized",
  "pearly",
  "peat",
  "pebbledashed",
  "pebbly",
  "peckish",
  "peculiar",
  "pedagogic",
  "pedagogical",
  "pedagogish",
  "pedagoguish",
  "pedantic",
  "pediatric",
  "pediophobic",
  "pedophobic",
  "peerless",
  "peevish",
  "peewee",
  "pegmatite",
  "pelage",
  "penniless",
  "pennypinching",
  "pennywise",
  "pensive",
  "pentagonal",
  "pentagonoid",
  "pentangular",
  "pentasyllabic",
  "pepperish",
  "peppery",
  "peppy",
  "perceptive",
  "perfect",
  "perfumy",
  "pericardial",
  "pericranial",
  "peridental",
  "peridot",
  "peridotite",
  "periglacial",
  "perilous",
  "perispheric",
  "perispherical",
  "peristerophilic",
  "periwinkle",
  "periwinkled",
  "perkish",
  "perky",
  "perlucin",
  "permanent",
  "permier",
  "pernicious",
  "pernickety",
  "perovskite",
  "perpendicular",
  "perpetual",
  "perplexed",
  "perseverant",
  "persevering",
  "persimmon",
  "persistent",
  "persnickety",
  "personal",
  "perspicacious",
  "persuasive",
  "pescatarian",
  "pesky",
  "pessimistic",
  "pestersome",
  "pesticidal",
  "pestilent",
  "petaled",
  "petaline",
  "petalled",
  "petalless",
  "petalous",
  "petit",
  "petitbourgeois",
  "petite",
  "petrified",
  "petrophilic",
  "pettifogging",
  "pettish",
  "petty",
  "petulant",
  "phagophobic",
  "phanerocystalline",
  "phantasmagorial",
  "phantasmagorian",
  "phantasmagoric",
  "phantasmagorical",
  "phantasmal",
  "phantastic",
  "phantastical",
  "phantomlike",
  "phantomlike",
  "pharmaceutical",
  "pharmacologic",
  "pharmacological",
  "phenocryst",
  "phenomenal",
  "philalethic",
  "philanthropic",
  "philharmonic",
  "philologic",
  "philological",
  "philosophical",
  "phlegmy",
  "phlogopite",
  "phobic",
  "phobophobic",
  "phonolite",
  "phonophobic",
  "phony",
  "phosphorescent",
  "phosphorus",
  "photodramatic",
  "photographic",
  "photoluminescent",
  "photonuclear",
  "photophilic",
  "photophobic",
  "photosensitive",
  "physical",
  "physiological",
  "phytoclimatologic",
  "phytoclimatological",
  "phytophilic",
  "pickled",
  "picky",
  "pictorial",
  "pictural",
  "picturesque",
  "piecemeal",
  "piercing",
  "pigeonhearted",
  "pigeonite",
  "piggish",
  "pigish",
  "pilfered",
  "pillared",
  "pilotable",
  "pine",
  "pinelike",
  "pink",
  "pinkish",
  "pintsize",
  "piny",
  "pious",
  "piperaceous",
  "piratic",
  "piratical",
  "piscatorial",
  "piscatory",
  "piscicultural",
  "pisciform",
  "piscine",
  "piscivorous",
  "pisiform",
  "pitchblack",
  "pitchdark",
  "piteous",
  "pithikosophilic",
  "pitiful",
  "pixilated",
  "pixyish",
  "placid",
  "plagihedral",
  "plaid",
  "plaided",
  "plain",
  "planetary",
  "planetoidal",
  "planispherical",
  "planktologic",
  "planktological",
  "plantsemiorganic",
  "plaster",
  "plastered",
  "plastery",
  "plastic",
  "platonic",
  "plausible",
  "playful",
  "pleasable",
  "pleasant",
  "pleased",
  "pleasing",
  "pleasurable",
  "pleasureful",
  "pleasureseeking",
  "plucky",
  "plugugly",
  "plump",
  "pluriliteral",
  "plush",
  "plushed",
  "plutonium",
  "poachable",
  "pockmarked",
  "poetic",
  "pogonophilic",
  "pointless",
  "poisoned",
  "poisonous",
  "pokeable",
  "polar",
  "polarized",
  "polished",
  "polite",
  "political",
  "polkadotted",
  "pollotarian",
  "polluted",
  "polonium",
  "polycystalline",
  "polyester",
  "polygonal",
  "polyhedral",
  "polyhistoric",
  "polymorphonuclear",
  "polynuclear",
  "polyphagous",
  "polysyllabic",
  "pompous",
  "poor",
  "poorly",
  "poorspirited",
  "popular",
  "porcelain",
  "porcine",
  "porky",
  "porous",
  "portable",
  "portly",
  "portrayable",
  "positive",
  "possessive",
  "possible",
  "postal",
  "postapocalyptic",
  "postarthritic",
  "postcardiac",
  "postdental",
  "postglacial",
  "postindustrial",
  "postlegal",
  "postmodern",
  "postpericardial",
  "postprophetic",
  "postscholastic",
  "postwar",
  "potbellied",
  "potbellied",
  "potent",
  "potential",
  "potty",
  "povertystricken",
  "powderblue",
  "powdery",
  "powellite",
  "powerful",
  "practical",
  "pragmatic",
  "preachy",
  "preagricultural",
  "prealgebraic",
  "preartistic",
  "prebeloved",
  "prebronze",
  "precambrian",
  "precapitalistic",
  "precardiac",
  "precarnival",
  "precious",
  "precise",
  "precolourable",
  "precosmic",
  "precosmical",
  "precranial",
  "precrystalline",
  "precultural",
  "predacious",
  "predatory",
  "predesirous",
  "predespondent",
  "predestitute",
  "predeterminate",
  "predeterminative",
  "predicatable",
  "predictive",
  "prediplomatic",
  "predisastrous",
  "predominant",
  "predramatic",
  "preeconomic",
  "preeconomical",
  "preevolutional",
  "preexistent",
  "preferred",
  "prefinancial",
  "prefriendly",
  "preggers",
  "preglacial",
  "pregnant",
  "prehistoric",
  "prelawful",
  "prelegal",
  "prelegislative",
  "preliminary",
  "preliterary",
  "preliterate",
  "preluxurious",
  "premature",
  "premedical",
  "premium",
  "premolar",
  "premonarchal",
  "premonarchial",
  "premonarchical",
  "premythical",
  "prenatal",
  "prenational",
  "preobjective",
  "preoccupied",
  "preoceanic",
  "preodorous",
  "prepolitical",
  "prepsychological",
  "prepubescent",
  "prerational",
  "preregal",
  "preromantic",
  "preroyal",
  "prescient",
  "prescientific",
  "presecular",
  "presentient",
  "preshrunk",
  "presidential",
  "presolar",
  "prespinal",
  "prestigious",
  "presumptuous",
  "pretentious",
  "preterlegal",
  "preterrestrial",
  "prettied",
  "pretty",
  "prettying",
  "prettyish",
  "previgilant",
  "previous",
  "priceless",
  "pricey",
  "prickly",
  "prideful",
  "priestless",
  "priestly",
  "priggish",
  "prim",
  "primaeval",
  "primary",
  "primatologic",
  "primatological",
  "prime",
  "primitive",
  "primordial",
  "princely",
  "principal",
  "printed",
  "prior",
  "prismatic",
  "prissy",
  "pristine",
  "private",
  "privatized",
  "privileged",
  "privy",
  "proabolition",
  "proabsolutism",
  "proabsolutist",
  "proacademic",
  "proagrarian",
  "probable",
  "procapitalism",
  "prochurch",
  "proclergy",
  "proclerical",
  "prodemocrat",
  "prodemocratic",
  "productive",
  "profascist",
  "professional",
  "proficient",
  "profitable",
  "profound",
  "progressive",
  "prolific",
  "promethean",
  "prominent",
  "promising",
  "promonarchy",
  "pronationalist",
  "pronationalistic",
  "proper",
  "prophesiable",
  "prophetic",
  "propolitics",
  "proportionable",
  "proportional",
  "proportioned",
  "proposed",
  "proromantic",
  "prosaic",
  "proscholastic",
  "proscience",
  "proscientific",
  "proselytical",
  "proselytistic",
  "prosperous",
  "protactium",
  "protected",
  "protective",
  "protozoological",
  "proud",
  "prouniversity",
  "provincial",
  "prudent",
  "prudish",
  "pseudoacademic",
  "pseudoanaemic",
  "pseudoangelic",
  "pseudoangelical",
  "pseudoartistic",
  "pseudoconservative",
  "pseudocrystalline",
  "pseudocultural",
  "pseudodemocratic",
  "pseudodivine",
  "pseudodramatic",
  "pseudoeconomical",
  "pseudofaithful",
  "pseudohexagonal",
  "pseudohistoric",
  "pseudohistorical",
  "pseudoinsane",
  "pseudolegal",
  "pseudolegislative",
  "pseudoliberal",
  "pseudoliterary",
  "pseudomedical",
  "pseudomythical",
  "pseudonational",
  "pseudonoble",
  "pseudopolitical",
  "pseudopriestly",
  "pseudoprophetic",
  "pseudoprophetical",
  "pseudopsychological",
  "pseudoregal",
  "pseudoreligious",
  "pseudorhombohedral",
  "pseudoromantic",
  "pseudoroyal",
  "pseudoscholarly",
  "pseudoscholastic",
  "pseudoscientific",
  "pseudospiritual",
  "pseudotetragonal",
  "pseudozoological",
  "psychasthenic",
  "psychedelic",
  "psychiatric",
  "psychiatrical",
  "psychic",
  "psychoactive",
  "psychoanalytic",
  "psychoanalytical",
  "psychodelic",
  "psychodiagnostic",
  "psychogenic",
  "psychographic",
  "psychological",
  "psychometric",
  "psychometrical",
  "psychoneurotic",
  "psychopathic",
  "psychopathologic",
  "psychopathological",
  "psychopharmacological",
  "psychophobic",
  "psychosocial",
  "psychosomatic",
  "psychotherapeutic",
  "psychotic",
  "psychotropic",
  "psychrophilic",
  "pubescent",
  "public",
  "publicized",
  "pudgy",
  "puerile",
  "puffy",
  "pugnacious",
  "pumice",
  "pumpkin",
  "punctilious",
  "punctual",
  "puny",
  "puppyish",
  "puppylike",
  "pure",
  "purebred",
  "purehearted",
  "purgatorial",
  "puritanical",
  "purple",
  "purplish",
  "purply",
  "purposeful",
  "purposeless",
  "pusslike",
  "putrid",
  "puzzled",
  "puzzling",
  "pygmy",
  "pygmyish",
  "pyrite",
  "pyrocrystalline",
  "pyrophobic",
  "pyroxene",
  "quaint",
  "qualified",
  "quarrelsome",
  "quarterwitted",
  "quartz",
  "quartziferous",
  "quartzitic",
  "quasiabsolute",
  "quasiacademic",
  "quasiangelic",
  "quasiartistic",
  "quasibronze",
  "quasicomfortable",
  "quasiconservative",
  "quasiconstant",
  "quasicontinuous",
  "quasidejected",
  "quasidelighted",
  "quasidemocratic",
  "quasidepressed",
  "quasidesolate",
  "quasidesperate",
  "quasidespondent",
  "quasidifficult",
  "quasidignified",
  "quasidignifying",
  "quasidiplomatic",
  "quasidisastrous",
  "quasidisgraced",
  "quasidisgusted",
  "quasidramatic",
  "quasieconomic",
  "quasieconomical",
  "quasiempty",
  "quasiexistent",
  "quasiextraterritorial",
  "quasifaithful",
  "quasifinancial",
  "quasifireproof",
  "quasihistoric",
  "quasihistorical",
  "quasihonourable",
  "quasilawful",
  "quasilegal",
  "quasilegislated",
  "quasilegislative",
  "quasiliberal",
  "quasiliterary",
  "quasiluxurious",
  "quasimedical",
  "quasimythical",
  "quasinational",
  "quasinationalistic",
  "quasiobjective",
  "quasiphilosophical",
  "quasipleasurable",
  "quasipolitical",
  "quasipoor",
  "quasiprogressive",
  "quasiprophetic",
  "quasiprophetical",
  "quasirational",
  "quasireligious",
  "quasiromantic",
  "quasiroyal",
  "quasischolarly",
  "quasischolastic",
  "quasiscientific",
  "quasispherical",
  "quasispirited",
  "quasispiritual",
  "quasisubjective",
  "quasiterritorial",
  "quasitheatrical",
  "quasiwealthy",
  "queasy",
  "queenlike",
  "queenly",
  "quelled",
  "quenched",
  "quenching",
  "querulous",
  "questionable",
  "quibbling",
  "quick",
  "quicksilvery",
  "quicktempered",
  "quickwitted",
  "quiescent",
  "quilted",
  "quintessential",
  "quixotic",
  "rabid",
  "radiant",
  "radiated",
  "radiation",
  "radical",
  "radioactive",
  "radiological",
  "radioluminescent",
  "radiophobic",
  "radium",
  "radon",
  "raggedraggedy",
  "raggletaggle",
  "raging",
  "rainbow",
  "rainbowy",
  "rainproof",
  "rainy",
  "rancid",
  "rancorous",
  "rancour",
  "random",
  "ranidaphobic",
  "rapid",
  "rapt",
  "raptorial",
  "rapturous",
  "rare",
  "rash",
  "raskly",
  "raspberry",
  "rational",
  "ratlike",
  "rattish",
  "rattlebrained",
  "rattleheaded",
  "ravenous",
  "raw",
  "rawhide",
  "rayon",
  "readaptable",
  "readjustable",
  "ready",
  "readywitted",
  "real",
  "realisable",
  "reanalyzable",
  "reapproachable",
  "rear",
  "rearmost",
  "rearrangeable",
  "reasonable",
  "reasonless",
  "reattachable",
  "rebel",
  "rebellious",
  "rebuffable",
  "rebuttable",
  "receivable",
  "recent",
  "receptive",
  "rechargeable",
  "recidivistic",
  "recitable",
  "reckless",
  "reckonable",
  "reclaimable",
  "reclinable",
  "reclining",
  "recloseable",
  "reclusive",
  "recognized",
  "recommendable",
  "recompensable",
  "reconcilable",
  "reconstructible",
  "recordable",
  "recoverable",
  "recruitable",
  "rectangular",
  "rectilinear",
  "red",
  "redblooded",
  "reddish",
  "redeemable",
  "redemandable",
  "redissoluble",
  "redistillable",
  "redoubtable",
  "redressible",
  "reduced",
  "redundant",
  "reedy",
  "refertilizable",
  "refillable",
  "reflectible",
  "reflective",
  "reflexional",
  "reflexive",
  "reforgeable",
  "reformable",
  "refractable",
  "refractional",
  "refractive",
  "refracturable",
  "refreshful",
  "refreshing",
  "refundable",
  "refusable",
  "refutable",
  "regainable",
  "regal",
  "regardable",
  "regenerable",
  "regenerated",
  "regenerative",
  "regional",
  "registerable",
  "registered",
  "registrable",
  "regretful",
  "regrettable",
  "regulable",
  "regular",
  "rehearsable",
  "reincarnated",
  "reincarnating",
  "reinflatable",
  "reinforced",
  "reissuable",
  "rejectable",
  "rejoiceful",
  "relapsable",
  "relatable",
  "relative",
  "relaxative",
  "relaxatory",
  "relaxed",
  "relaxer",
  "releasable",
  "relegable",
  "relevant",
  "reliable",
  "reliant",
  "relievable",
  "relieved",
  "religionistic",
  "religious",
  "relishable",
  "reluctant",
  "remaining",
  "remarkable",
  "remittable",
  "remorseful",
  "remorseless",
  "remotecontrolled",
  "removable",
  "renderable",
  "renegotiable",
  "renewed",
  "renounceable",
  "renowned",
  "reobtainable",
  "repairable",
  "repayable",
  "repealable",
  "repeatable",
  "repellent",
  "reponsible",
  "reportable",
  "reprehensible",
  "representational",
  "representative",
  "repressed",
  "repressible",
  "repressive",
  "reproachable",
  "reproductive",
  "reptilian",
  "reptiloid",
  "republican",
  "republishable",
  "repulsive",
  "repunishable",
  "reputable",
  "required",
  "resalable",
  "resealable",
  "resentful",
  "reservable",
  "reserved",
  "resident",
  "residential",
  "resigned",
  "resistant",
  "resolvable",
  "respectable",
  "respected",
  "respectful",
  "respirable",
  "responsive",
  "restful",
  "resting",
  "restless",
  "restorable",
  "restorative",
  "restored",
  "restoring",
  "restrainable",
  "restrictive",
  "resurrectional",
  "resurrectionary",
  "resurrective",
  "resuscitative",
  "retail",
  "retaliative",
  "retaliatory",
  "retired",
  "retiring",
  "retouchable",
  "retrievable",
  "retrophilic",
  "returnable",
  "reunitable",
  "reusable",
  "revealable",
  "revengeful",
  "revenual",
  "revenued",
  "revered",
  "reverend",
  "reverent",
  "reversible",
  "reviewable",
  "reviled",
  "revisitable",
  "revivable",
  "revocable",
  "revolting",
  "revolutionary",
  "rheophilic",
  "rhinestone",
  "rhinophilic",
  "rhizophilic",
  "rhombic",
  "rhombohedral",
  "rhyolite",
  "ribbonlike",
  "ribbony",
  "rich",
  "rideable",
  "ridiculous",
  "right",
  "rightable",
  "righteous",
  "rightist",
  "rightwing",
  "riotous",
  "ripe",
  "ripening",
  "risky",
  "ritualistic",
  "ritzy",
  "rival",
  "roastable",
  "roasted",
  "roasting",
  "robo",
  "robotic",
  "robotlike",
  "robust",
  "rockable",
  "rockbound",
  "rockfaced",
  "rocky",
  "roentgenium",
  "roguish",
  "rollable",
  "romantic",
  "romanticistic",
  "rookie",
  "roomy",
  "ropable",
  "ropeable",
  "roseate",
  "rosecolored",
  "roselike",
  "rosy",
  "rotatable",
  "rotten",
  "rough",
  "round",
  "roundbuilt",
  "rounded",
  "rowable",
  "royal",
  "royalistic",
  "rubber",
  "rubbery",
  "rubbly",
  "rubellite",
  "rubidium",
  "rubied",
  "ruby",
  "ruddy",
  "rude",
  "ruinable",
  "ruinous",
  "ruling",
  "runic",
  "running",
  "runtish",
  "runty",
  "rural",
  "russet",
  "rust",
  "rusted",
  "rustic",
  "rusty",
  "rutherfordium",
  "rutile",
  "saccharine",
  "sacramental",
  "sacred",
  "sacrificial",
  "sacrilegious",
  "sad",
  "saddened",
  "saddening",
  "sadistic",
  "safe",
  "sagacious",
  "sainted",
  "saintless",
  "saintly",
  "salamandrine",
  "salaried",
  "saline",
  "salmon",
  "salmonlike",
  "salmonoid",
  "salted",
  "saltish",
  "saltwater",
  "salty",
  "sanctified",
  "sanctimonious",
  "sand",
  "sanded",
  "sandpapery",
  "sandstone",
  "sandy",
  "sane",
  "sangria",
  "sanguine",
  "sanidine",
  "sanitarian",
  "sanitary",
  "sapient",
  "sapphire",
  "sappy",
  "sarcastic",
  "sarcophilic",
  "sardonic",
  "sassy",
  "satiated",
  "satin",
  "satiny",
  "satirical",
  "satisfactory",
  "satisfied",
  "savage",
  "savorous",
  "savourless",
  "savoury",
  "savvy",
  "sawdustish",
  "sawdusty",
  "scabby",
  "scabrous",
  "scaled",
  "scaley",
  "scaly",
  "scandalous",
  "scarabaeiform",
  "scarabaeoid",
  "scarecrowish",
  "scarecrowy",
  "scared",
  "scarlet",
  "scarred",
  "scary",
  "scathing",
  "scatterbrained",
  "scattered",
  "scavenger",
  "sceptical",
  "scheelite",
  "schematic",
  "scholarless",
  "scholarly",
  "scholastic",
  "scholiastic",
  "scientific",
  "scintillating",
  "sciophilic",
  "scoleciphobic",
  "scopophobic",
  "scornful",
  "scorpaenoid",
  "scorpioid",
  "scorpionic",
  "scotophobic",
  "scowlful",
  "scrapable",
  "scratchy",
  "scrawny",
  "screaming",
  "scribblenautable",
  "scribblenautible",
  "scribblenautic",
  "scribblenautical",
  "scribblenautilogic",
  "scribblenautilogical",
  "scribblenautophilic",
  "scribblenautophobic",
  "scribblephobic",
  "scribbophobic",
  "scribophobic",
  "scrummy",
  "scrumptious",
  "sculpturesque",
  "scummy",
  "seaborgium",
  "seaborne",
  "seafaring",
  "seagoing",
  "seagreen",
  "seaisland",
  "sealbrown",
  "seared",
  "seasick",
  "seasonal",
  "seaworthy",
  "secluded",
  "seclusive",
  "secondary",
  "secondbest",
  "secondclass",
  "secondhand",
  "secondrate",
  "secret",
  "secretive",
  "secular",
  "secularistic",
  "secure",
  "sedate",
  "sedentary",
  "sediment",
  "sedulous",
  "seedy",
  "seemly",
  "segregated",
  "seismic",
  "seismographic",
  "seismographical",
  "seismologic",
  "seismological",
  "seismoscopic",
  "select",
  "selective",
  "selenite",
  "selenium",
  "selfassured",
  "selfaware",
  "selfcentered",
  "selfcolored",
  "selfconceited",
  "selfcontradiction",
  "selfdeprecating",
  "selfdepreciative",
  "selfdestroyed",
  "selfdestroying",
  "selfdisgraced",
  "selfdisgracing",
  "selfdisquieting",
  "selfdissatisfied",
  "selfeducated",
  "selfemptying",
  "selfevolved",
  "selfevolving",
  "selfexistent",
  "selfhonoured",
  "selfhypnotic",
  "selfhypnotised",
  "selfindulgent",
  "selfish",
  "selfless",
  "selfrighteous",
  "selfsatisfied",
  "selftaught",
  "selfteaching",
  "selftrained",
  "selfvulcanising",
  "semantic",
  "semiacademic",
  "semiacademical",
  "semiacidic",
  "semiacidified",
  "semiacidulated",
  "semiadhesive",
  "semiagricultural",
  "semibleached",
  "semiboiled",
  "semicapitalistic",
  "semiconservative",
  "semicontinuous",
  "semicrystalline",
  "semicultured",
  "semidestructive",
  "semidivine",
  "semidramatic",
  "semidramatical",
  "semidry",
  "semiemotional",
  "semiexperimental",
  "semifluid",
  "semigeometric",
  "semigeometrical",
  "semihistoric",
  "semihistorical",
  "semiilliterate",
  "semiintellectual",
  "semiintellectualized",
  "semiintelligent",
  "semiironic",
  "semiironical",
  "semilegislative",
  "semiliberal",
  "semiliquid",
  "semiliterate",
  "semimagical",
  "semimagnetic",
  "semimagnetical",
  "semimarine",
  "semimathematical",
  "semimedicinal",
  "semimetallic",
  "semimonarchic",
  "semimonarchical",
  "semimystical",
  "semimythic",
  "semimythical",
  "seminationalistic",
  "semineurotic",
  "semineutral",
  "seminocturnal",
  "semiobjective",
  "semiparalysis",
  "semiparalyzed",
  "semipassive",
  "semipeaceful",
  "semipetrified",
  "semiphilosophic",
  "semiphilosophical",
  "semipoisonous",
  "semipolitical",
  "semiprimitive",
  "semiprogressive",
  "semipsychologic",
  "semipsychological",
  "semirationalised",
  "semirebellious",
  "semireligious",
  "semiretired",
  "semiromantic",
  "semiround",
  "semischolastic",
  "semisolemn",
  "semispheric",
  "semisubterranean",
  "semitheatric",
  "semitheatrical",
  "semitheological",
  "semivolcanic",
  "semivulcanised",
  "senatorial",
  "senile",
  "senior",
  "senseless",
  "sensible",
  "sensitive",
  "sensualist",
  "sentient",
  "sentimental",
  "separate",
  "sepia",
  "septic",
  "sequined",
  "seraphic",
  "serene",
  "serge",
  "sericate",
  "sericeous",
  "sericultural",
  "serious",
  "serpentiform",
  "serpentine",
  "servile",
  "severe",
  "sewable",
  "shabby",
  "shaded",
  "shadeful",
  "shadowed",
  "shadowgraphic",
  "shadowy",
  "shady",
  "shaggy",
  "shagreen",
  "shakespearean",
  "shallow",
  "shamanic",
  "shamanistic",
  "shamefaced",
  "shameful",
  "shameless",
  "shapable",
  "shapeable",
  "shapely",
  "shared",
  "sharp",
  "sharpcut",
  "sharpeyed",
  "sharpset",
  "sharpsighted",
  "sharptongued",
  "sharpwitted",
  "shaven",
  "sheepish",
  "sheepskin",
  "sheer",
  "shelled",
  "shellshocked",
  "shellshocked",
  "shellshocked",
  "shelly",
  "shiftable",
  "shifty",
  "shimmery",
  "shiny",
  "shocked",
  "shockproof",
  "shoddy",
  "shogunal",
  "short",
  "shortcircuited",
  "shorted",
  "shorthanded",
  "shortish",
  "shortsighted",
  "shortsighted",
  "shorttempered",
  "shortterm",
  "shrewd",
  "shrinkable",
  "shrubby",
  "shrunken",
  "shy",
  "sibling",
  "sick",
  "sickening",
  "sicklied",
  "sickly",
  "siderophyllite",
  "sienna",
  "sighted",
  "sightless",
  "sightly",
  "significant",
  "silicone",
  "silk",
  "silken",
  "silky",
  "silly",
  "silt",
  "silty",
  "silvan",
  "silver",
  "silverish",
  "silvern",
  "silvery",
  "silvicolous",
  "silvicultural",
  "simaroubaceous",
  "simian",
  "similar",
  "simious",
  "simple",
  "simplehearted",
  "simpleminded",
  "sincere",
  "sinful",
  "single",
  "singleminded",
  "sinister",
  "sinistrous",
  "sinking",
  "sinless",
  "sirenian",
  "sirenic",
  "sisterlike",
  "sisterly",
  "sitophobic",
  "sizable",
  "sizeable",
  "sized",
  "sizy",
  "skaldic",
  "skarn",
  "skeletal",
  "skeletonlike",
  "skeletonlike",
  "skeptical",
  "sketched",
  "sketchy",
  "skilful",
  "skilled",
  "skimpy",
  "skinny",
  "skipping",
  "skittish",
  "skyblue",
  "skyborne",
  "skyscraping",
  "slandered",
  "slate",
  "slavish",
  "slavocratic",
  "sleepful",
  "sleeping",
  "sleepless",
  "sleepy",
  "slender",
  "slick",
  "slight",
  "slim",
  "slimline",
  "slimming",
  "slimy",
  "slippery",
  "slithery",
  "slobbery",
  "sloppy",
  "slothful",
  "slovenly",
  "slow",
  "slowmotion",
  "slowmoving",
  "slowwitted",
  "sludgy",
  "sluggish",
  "slumberless",
  "slumberous",
  "slushy",
  "sly",
  "small",
  "smallish",
  "smallminded",
  "smallscale",
  "smalltime",
  "smart",
  "smartaleck",
  "smartalecky",
  "smarty",
  "smashable",
  "smashed",
  "smellable",
  "smelly",
  "smileless",
  "smiling",
  "smoggy",
  "smoking",
  "smoky",
  "smooth",
  "smoothspoken",
  "smoothtongued",
  "smudgeless",
  "smug",
  "snaky",
  "snappish",
  "snappy",
  "snazzy",
  "sneaking",
  "sneaky",
  "snide",
  "snippy",
  "snively",
  "snobbish",
  "snoopy",
  "snooty",
  "snoozy",
  "snotty",
  "snowbound",
  "snowcapped",
  "snowclad",
  "snowwhite",
  "snowy",
  "snug",
  "snugging",
  "soaked",
  "soaplike",
  "soaplike",
  "soapstone",
  "soapsudsy",
  "soapy",
  "socalled",
  "sociable",
  "social",
  "socialist",
  "socialistic",
  "socialized",
  "socialminded",
  "socioeconomic",
  "socioeconomical",
  "sociological",
  "sociopathic",
  "sociophobic",
  "sociopolitical",
  "sociopsychological",
  "sodalite",
  "sodium",
  "soft",
  "softhearted",
  "softish",
  "soggy",
  "solar",
  "soldierlike",
  "soldierly",
  "sole",
  "solemn",
  "solid",
  "solidifiable",
  "solitary",
  "sombre",
  "sombrous",
  "some",
  "somniphobic",
  "songful",
  "sonic",
  "sonorous",
  "soot",
  "sooty",
  "sophisticated",
  "sophomoric",
  "sopping",
  "soppy",
  "sorcerous",
  "sorrowless",
  "sorry",
  "soubrettish",
  "soughtafter",
  "soulful",
  "soulless",
  "sound",
  "soupy",
  "sour",
  "sourdough",
  "soured",
  "sourish",
  "southbound",
  "southeastern",
  "southeastward",
  "southern",
  "southernmost",
  "southmost",
  "southwestern",
  "spacious",
  "spangly",
  "spare",
  "sparkling",
  "sparse",
  "spatial",
  "special",
  "specialized",
  "specific",
  "specified",
  "specious",
  "spectacular",
  "spectrophobic",
  "specular",
  "speculative",
  "speedful",
  "speedless",
  "speedy",
  "spellbound",
  "spendthrift",
  "sphalerite",
  "sphene",
  "spheral",
  "sphereless",
  "spherelike",
  "spherical",
  "spheroidal",
  "spherular",
  "sphingine",
  "sphinxian",
  "spicey",
  "spicy",
  "spidersilk",
  "spidery",
  "spiky",
  "spinal",
  "spined",
  "spineless",
  "spinelike",
  "spinescent",
  "spiniferous",
  "spinous",
  "spinulose",
  "spiny",
  "spirited",
  "spiritless",
  "spiritous",
  "spiritual",
  "spiritualistic",
  "spiteful",
  "splendid",
  "splendiferous",
  "splendorous",
  "splintery",
  "splurgy",
  "spodumene",
  "spoiled",
  "spongy",
  "spontaneous",
  "spooky",
  "sporadic",
  "sportful",
  "sporting",
  "sportive",
  "sportsmanlike",
  "sportsmanly",
  "sporty",
  "spotless",
  "spottable",
  "spotted",
  "spotty",
  "sprightful",
  "sprightly",
  "springloaded",
  "springy",
  "sprucing",
  "spy",
  "squalid",
  "square",
  "squarish",
  "squeamish",
  "squirarchal",
  "squirarchical",
  "squirearchal",
  "squirearchical",
  "squirrelish",
  "squirrellike",
  "squirrelly",
  "squishy",
  "stable",
  "stagnant",
  "stagnantory",
  "stainable",
  "stalactiform",
  "stalagmitic",
  "stalagmitical",
  "stalagmometric",
  "stale",
  "stalwart",
  "stampable",
  "standard",
  "standardisable",
  "starchy",
  "starcrossed",
  "starred",
  "starry",
  "starspangled",
  "starstudded",
  "starved",
  "starving",
  "statesmanlike",
  "statesmanly",
  "static",
  "stational",
  "stationary",
  "statistical",
  "statued",
  "statuelike",
  "statuesque",
  "statutory",
  "steadfast",
  "stealthful",
  "stealthless",
  "stealthy",
  "steamheated",
  "steamy",
  "steel",
  "steep",
  "stegophilic",
  "stellar",
  "stenchful",
  "stereotyped",
  "sterile",
  "sterilised",
  "sterilized",
  "sterling",
  "sticky",
  "stigmatophilic",
  "still",
  "stilllife",
  "stimulated",
  "stimulating",
  "stingy",
  "stinky",
  "stoic",
  "stoical",
  "stolen",
  "stomachachy",
  "stomachy",
  "stone",
  "stonebroke",
  "stoned",
  "stonelike",
  "stoneware",
  "stoney",
  "stony",
  "stonyhearted",
  "stoppable",
  "stormproof",
  "stormy",
  "stout",
  "stouthearted",
  "stoutish",
  "straight",
  "straightforward",
  "straightlaced",
  "strained",
  "strange",
  "strategic",
  "strawcolored",
  "streaky",
  "streetsmart",
  "streetwise",
  "strengthened",
  "strenuous",
  "stressed",
  "stressful",
  "stretchable",
  "stretchy",
  "stricken",
  "strict",
  "striking",
  "stringent",
  "striped",
  "stripy",
  "strong",
  "strongish",
  "strongminded",
  "strongwilled",
  "strontium",
  "structural",
  "stubborn",
  "stuck",
  "stuckup",
  "studious",
  "stuffed",
  "stumplike",
  "stumpy",
  "stunty",
  "stupendous",
  "stupid",
  "stylish",
  "suave",
  "subabsolute",
  "subacademic",
  "subacademical",
  "subalgebraic",
  "subalgebraical",
  "subatomic",
  "subaverage",
  "subclimatic",
  "subconscious",
  "subcranial",
  "subcrystalline",
  "subcultural",
  "subdendroid",
  "subdendroidal",
  "subdermal",
  "subdermic",
  "subdivine",
  "subdued",
  "subendocardial",
  "suberin",
  "subevergreen",
  "subgeometric",
  "subgeometrical",
  "subglacial",
  "subhedral",
  "subhemispheric",
  "subhemispherical",
  "subhexagonal",
  "subjective",
  "sublimational",
  "sublime",
  "subliminal",
  "sublinear",
  "submetallic",
  "submissive",
  "subocean",
  "suboceanic",
  "subordinate",
  "subpentagonal",
  "subpericardiac",
  "subpericardial",
  "subpericranial",
  "subpolygonal",
  "subpyramidal",
  "subpyramidic",
  "subpyramidical",
  "subpyriform",
  "subquadrangular",
  "subquadrate",
  "subquinquefid",
  "subrectangular",
  "subsequent",
  "subservient",
  "subsimian",
  "subsimious",
  "subsolar",
  "subsonic",
  "subspheric",
  "subspherical",
  "substantial",
  "subterranean",
  "subterraqueous",
  "subterrestrial",
  "subtle",
  "subtractive",
  "subtransparent",
  "subtrapezoid",
  "subtrapezoidal",
  "subtriangular",
  "subtrigonal",
  "subtrihedral",
  "subtropical",
  "suburban",
  "suburbicarian",
  "subversive",
  "subwealthy",
  "subzero",
  "succeedable",
  "successful",
  "successive",
  "succinct",
  "succulent",
  "sudden",
  "sudoriferous",
  "sudorific",
  "sudsy",
  "suede",
  "sufficient",
  "suffixal",
  "sugar",
  "sugarcandy",
  "sugarcane",
  "sugared",
  "sugarless",
  "sugarloaf",
  "sugary",
  "suicidal",
  "suitable",
  "sulfur",
  "sulfureous",
  "sulfuric",
  "sulfurous",
  "sulfuryl",
  "sulky",
  "sullen",
  "sultanic",
  "sultanlike",
  "sunbaked",
  "sunbeamed",
  "sunbeamy",
  "sundried",
  "sunlit",
  "sunny",
  "sunshiny",
  "super",
  "superagrarian",
  "superangelic",
  "superb",
  "superbeloved",
  "supercatastrophic",
  "supercilious",
  "supercolossal",
  "superconservative",
  "supercriminal",
  "supercurious",
  "superdemocratic",
  "superdesirous",
  "superdifficult",
  "superdivine",
  "superduper",
  "superenergetic",
  "superexcited",
  "superficial",
  "superfluous",
  "supergenerous",
  "superglacial",
  "superhistoric",
  "superhistorical",
  "superimportant",
  "superior",
  "superlative",
  "superlucky",
  "superluxurious",
  "supermarine",
  "supermathematical",
  "supernational",
  "supernatural",
  "supernaturalistic",
  "superpolite",
  "superpowered",
  "superrational",
  "superregal",
  "superromantic",
  "supersafe",
  "superscholarly",
  "superscientific",
  "supersecretive",
  "supersecular",
  "supersecure",
  "supersensitive",
  "superserious",
  "supersmart",
  "supersmooth",
  "supersolar",
  "supersolemn",
  "supersonic",
  "superspiritual",
  "superstitious",
  "superstrict",
  "superstylish",
  "supersweet",
  "superterrestrial",
  "superugly",
  "supervigilant",
  "supervigorous",
  "superwealthy",
  "superzealous",
  "supplemental",
  "supplementary",
  "suppletive",
  "supporting",
  "supportive",
  "supranational",
  "supreme",
  "surah",
  "sure",
  "surefooted",
  "surgical",
  "surly",
  "surprised",
  "surprising",
  "surreal",
  "surreptitious",
  "susceptible",
  "suspect",
  "suspicious",
  "sustainable",
  "svelte",
  "swallowable",
  "swampy",
  "swanky",
  "swashbuckling",
  "sweated",
  "sweating",
  "sweaty",
  "sweepable",
  "sweet",
  "sweetscented",
  "sweettempered",
  "sweltering",
  "swift",
  "swiftfooted",
  "swimming",
  "swindled",
  "swinish",
  "swirly",
  "sybaritic",
  "sycophantic",
  "syllabic",
  "sylphic",
  "sylphish",
  "sylphlike",
  "sylphy",
  "symbiotic",
  "symbolic",
  "symmetric",
  "symmetrical",
  "sympathetic",
  "symphonic",
  "symphonious",
  "symptomatic",
  "synarchist",
  "synecologic",
  "synecological",
  "synonymous",
  "synthetic",
  "syrupy",
  "tabarded",
  "taboo",
  "tacky",
  "tactful",
  "tactical",
  "tailored",
  "tailormade",
  "tainted",
  "talented",
  "talismanic",
  "talismanical",
  "talkable",
  "talkative",
  "talky",
  "tall",
  "tame",
  "tamed",
  "taming",
  "tan",
  "tangerine",
  "tangible",
  "tangled",
  "tangy",
  "tanned",
  "tantalizing",
  "tantalous",
  "tanzanite",
  "tapestried",
  "taphophobic",
  "tardy",
  "targeted",
  "tart",
  "tasteful",
  "tasteless",
  "tasty",
  "tattooed",
  "taupe",
  "taurine",
  "taut",
  "tautological",
  "tawdry",
  "taxdeductible",
  "taxexempt",
  "taxidermal",
  "taxidermic",
  "taxidermy",
  "taxing",
  "taxonomic",
  "taxonomical",
  "teal",
  "tearful",
  "tearing",
  "teary",
  "technical",
  "technocrat",
  "technocratic",
  "technological",
  "technophilic",
  "technophobic",
  "techy",
  "tectonic",
  "tedious",
  "teen",
  "teenage",
  "teensy",
  "teensyweensy",
  "teeny",
  "teenytiny",
  "teenyweeny",
  "tekite",
  "telegraphic",
  "telegraphical",
  "telekinetic",
  "telepathic",
  "temperamental",
  "temperate",
  "temporal",
  "temporary",
  "tempting",
  "temptuous",
  "tender",
  "tenderhearted",
  "tense",
  "tenuous",
  "terdekaphobia",
  "teriyaki",
  "termitic",
  "terracotta",
  "terrazzo",
  "terrestrial",
  "terrible",
  "terrific",
  "terrified",
  "terrifying",
  "territorial",
  "terrorful",
  "terroristic",
  "terrorless",
  "terrorstricken",
  "terse",
  "tertiary",
  "testy",
  "tetartohedral",
  "tetragonal",
  "tetrahedral",
  "textbookish",
  "textile",
  "thalassophilic",
  "thankful",
  "thankless",
  "theatrical",
  "theocentric",
  "theocratic",
  "theocratical",
  "theodicean",
  "theological",
  "theomorphic",
  "theophagous",
  "theophilic",
  "theoretical",
  "theosophic",
  "theosophical",
  "therapeutic",
  "thermal",
  "thermodynamic",
  "thermonuclear",
  "thermophilic",
  "thermophobic",
  "thick",
  "thickset",
  "thickskulled",
  "thickwitted",
  "thieving",
  "thievish",
  "thin",
  "thinnish",
  "thirsty",
  "thistle",
  "thistly",
  "thorium",
  "thorny",
  "thorough",
  "thoroughbred",
  "thoughtful",
  "thoughtless",
  "threadbare",
  "threatening",
  "threatful",
  "threpterophilic",
  "thrifty",
  "thrillful",
  "thrilling",
  "ticklish",
  "tidal",
  "tidy",
  "tiff",
  "tigerseye",
  "tightknit",
  "timbrophilic",
  "timeconsuming",
  "timeless",
  "timely",
  "timid",
  "tin",
  "tinfoil",
  "tinned",
  "tinny",
  "tinted",
  "tiny",
  "tippable",
  "tired",
  "tireless",
  "tiresome",
  "titanic",
  "titaniferous",
  "titanite",
  "titanium",
  "titanous",
  "toadish",
  "toadyish",
  "tokophobic",
  "tolerant",
  "tomophobic",
  "tonguetied",
  "toothsome",
  "topaz",
  "topazine",
  "topiary",
  "topnotch",
  "topsecret",
  "torrential",
  "torrid",
  "tortoiseshell",
  "tortoiseshelled",
  "totalitarian",
  "touchy",
  "tough",
  "touristic",
  "touristy",
  "tourmaline",
  "tourmalinic",
  "towcolored",
  "towering",
  "toxic",
  "toxicological",
  "toxophilic",
  "toy",
  "toylike",
  "trachyte",
  "traditional",
  "tragic",
  "trainsick",
  "traitorous",
  "tranquil",
  "transcendent",
  "transcendental",
  "transcendentalistic",
  "transcolour",
  "transcrystalline",
  "transcultural",
  "transhuman",
  "transient",
  "translucent",
  "translunar",
  "transmarine",
  "transoceanic",
  "transparent",
  "transplanetary",
  "transrational",
  "trapezial",
  "trapeziform",
  "trapezohedral",
  "trapezohedron",
  "trashy",
  "tratasyllabic",
  "tratasyllabical",
  "traumatic",
  "traumatized",
  "traumatophobic",
  "travelsick",
  "travelsick",
  "treacherous",
  "treasonable",
  "treasonous",
  "treelike",
  "tremendous",
  "trendy",
  "tribal",
  "trichophobia",
  "trickish",
  "tricksome",
  "tricksy",
  "tricky",
  "tricolour",
  "tricoloured",
  "tridymite",
  "trifling",
  "trigonal",
  "trigonometric",
  "trigonometrical",
  "trigonous",
  "trihedral",
  "trilateral",
  "trilinear",
  "triliteral",
  "trimetallic",
  "triskaidekaphobic",
  "trisyllabic",
  "trisyllabical",
  "triumphal",
  "triumphant",
  "trivial",
  "troglodytic",
  "troglodytical",
  "trogonoid",
  "trophic",
  "trophied",
  "tropical",
  "troubled",
  "troublesome",
  "troubling",
  "trueblue",
  "trueborn",
  "truehearted",
  "trustful",
  "trusting",
  "trustworthy",
  "truthful",
  "trypanophobic",
  "tsarist",
  "tsaristic",
  "tsunamic",
  "tubby",
  "tuneful",
  "turbid",
  "turophilic",
  "turpentinic",
  "turquoise",
  "turtleshell",
  "turtleshelled",
  "tweed",
  "tweedy",
  "twill",
  "twofaced",
  "typhlophilic",
  "typical",
  "tyrannical",
  "tyrannicidal",
  "tyrannous",
  "tzarist",
  "tzaristic",
  "uber",
  "ubiquitary",
  "ubiquitous",
  "ugly",
  "ulcerative",
  "ulcerous",
  "ultimate",
  "ultraconservative",
  "ultrafaultless",
  "ultramarine",
  "ultramicroscopic",
  "ultramicroscopical",
  "ultramodern",
  "ultramundane",
  "ultrapink",
  "ultrashort",
  "ultrasonic",
  "ultratropical",
  "umbral",
  "unable",
  "unacademic",
  "unacademical",
  "unacceptable",
  "unaccepted",
  "unacidic",
  "unacidulated",
  "unacknowledged",
  "unactivated",
  "unadhesive",
  "unadjoining",
  "unadored",
  "unadult",
  "unadventurous",
  "unadverturesome",
  "unadvised",
  "unaesthetic",
  "unaesthetical",
  "unafraid",
  "unaggressive",
  "unagrarian",
  "unagricultural",
  "unalgebraical",
  "unalienated",
  "unallegorical",
  "unallegorised",
  "unallergic",
  "unalliterated",
  "unalliterative",
  "unalphabetic",
  "unalphabetical",
  "unalphabetised",
  "unamazed",
  "unambitious",
  "unamiable",
  "unamicable",
  "unamorous",
  "unamusable",
  "unamused",
  "unamusing",
  "unanarchic",
  "unanarchistic",
  "unangry",
  "unanguished",
  "unanimated",
  "unanimating",
  "unannotated",
  "unapologetic",
  "unappealing",
  "unappeased",
  "unappreciated",
  "unapproachable",
  "unarithmetical",
  "unarmed",
  "unaroused",
  "unartful",
  "unartistic",
  "unassuming",
  "unathletic",
  "unattractive",
  "unauthorized",
  "unavoidable",
  "unawake",
  "unawakeable",
  "unaware",
  "unbackward",
  "unbathed",
  "unbeatable",
  "unbeaten",
  "unbecoming",
  "unbefriended",
  "unbelievable",
  "unbeloved",
  "unbiased",
  "unbiological",
  "unblacked",
  "unblackened",
  "unblued",
  "unbrowned",
  "unbuoyant",
  "unburied",
  "unburning",
  "uncalorific",
  "uncanny",
  "uncapitalistic",
  "uncarnivorous",
  "uncatalogued",
  "uncategorised",
  "uncertain",
  "unchanged",
  "uncharitable",
  "uncheerable",
  "uncheered",
  "uncheerful",
  "uncheering",
  "uncheery",
  "unchildish",
  "unchildlike",
  "uncitizenly",
  "uncivic",
  "uncivil",
  "uncivilisable",
  "uncivilised",
  "unclean",
  "uncleanable",
  "uncleaned",
  "uncleansable",
  "uncleansed",
  "unclear",
  "uncolourable",
  "uncoloured",
  "uncomfortable",
  "uncommon",
  "uncompetent",
  "unconfident",
  "uncongested",
  "uncongestive",
  "unconquerable",
  "unconscious",
  "unconstant",
  "unconstitutional",
  "uncontagious",
  "uncontinuous",
  "uncontradictable",
  "uncontradicted",
  "uncontradictious",
  "uncontradictive",
  "uncontradictory",
  "uncontrollable",
  "uncooked",
  "uncooperative",
  "uncouth",
  "uncovered",
  "uncreative",
  "uncrystalled",
  "uncrystalline",
  "uncrystallisable",
  "uncrystallised",
  "unculturable",
  "uncultured",
  "uncurable",
  "undamageable",
  "undamaged",
  "undamaging",
  "undead",
  "undecided",
  "undecipherable",
  "undefeatable",
  "undefeated",
  "undefiled",
  "undeified",
  "undeistical",
  "undejected",
  "undelicious",
  "undelighted",
  "undelightful",
  "undelighting",
  "undemocratic",
  "undeniable",
  "undenominated",
  "underage",
  "underaverage",
  "undercoloured",
  "undercover",
  "undereducated",
  "underemployed",
  "underground",
  "underhanded",
  "underpowered",
  "underpriced",
  "underprivileged",
  "underqualified",
  "understated",
  "understood",
  "underterrestrial",
  "underweight",
  "undesirable",
  "undesired",
  "undesirous",
  "undespaired",
  "undespairing",
  "undespised",
  "undespising",
  "undespondent",
  "undespotic",
  "undestined",
  "undestitute",
  "undestroyed",
  "undestructible",
  "undestructive",
  "undevilish",
  "undifficult",
  "undigestible",
  "undignified",
  "undiplomatic",
  "undiseased",
  "undisgraced",
  "undisgusted",
  "undisheartened",
  "undisheveled",
  "undishevelled",
  "undishonoured",
  "undivinable",
  "undivined",
  "undivining",
  "undramatic",
  "undramatical",
  "undramatisable",
  "undramatised",
  "undrinkable",
  "undyed",
  "unearthly",
  "uneasy",
  "uneconomic",
  "uneconomical",
  "uneconomising",
  "uneducated",
  "unemotional",
  "unemployed",
  "unemptied",
  "unempty",
  "unentertainable",
  "unentertained",
  "unentertaining",
  "unenthusiastic",
  "unequal",
  "unequaled",
  "unequalled",
  "unethical",
  "unevolved",
  "unevolving",
  "unexistent",
  "unexistential",
  "unexisting",
  "unexpected",
  "unexperimental",
  "unexplainable",
  "unexplained",
  "unextraordinary",
  "unextravagant",
  "unfair",
  "unfaithful",
  "unfashionable",
  "unfavourable",
  "unfeared",
  "unfearful",
  "unfearing",
  "unfeeling",
  "unfired",
  "unfiring",
  "unfit",
  "unfleshly",
  "unfooled",
  "unfoolish",
  "unforgiving",
  "unfortunate",
  "unfragrant",
  "unfriended",
  "unfrightened",
  "unfrightening",
  "ungentlemanly",
  "ungeometric",
  "ungeometrical",
  "unglacial",
  "unglaciated",
  "ungodlike",
  "ungodly",
  "ungracious",
  "ungrammatical",
  "ungreened",
  "unhappy",
  "unhealthy",
  "unheavenly",
  "unheedful",
  "unheeding",
  "unhelpful",
  "unhelping",
  "unhistoric",
  "unhistorical",
  "unhistoried",
  "unholy",
  "unhonoured",
  "unhuman",
  "unhumane",
  "unhumanistic",
  "unhumanitarian",
  "unhydrated",
  "unhygenic",
  "unhygienic",
  "unicolor",
  "unidentifiable",
  "unidentified",
  "uniform",
  "uniformitarian",
  "unilateral",
  "unilateralised",
  "uniliteral",
  "unimaginable",
  "unimaginative",
  "unimmunised",
  "unimportant",
  "unimpoverished",
  "unincorporated",
  "uninfected",
  "uninfectious",
  "uninfested",
  "uninformed",
  "uninspirable",
  "uninspired",
  "uninspiring",
  "uninsured",
  "unintellectual",
  "unintelligent",
  "unintentional",
  "uninterested",
  "uninteresting",
  "unintroversive",
  "unintroverted",
  "uninvincible",
  "uninvolved",
  "unique",
  "unirritable",
  "unirritated",
  "unisex",
  "united",
  "universal",
  "unjust",
  "unkempt",
  "unkind",
  "unkindhearted",
  "unkissed",
  "unknown",
  "unlawful",
  "unlegal",
  "unlegalised",
  "unlegislated",
  "unlegislative",
  "unleisurely",
  "unliberalised",
  "unliberalized",
  "unliberated",
  "unlight",
  "unlighted",
  "unlightened",
  "unlikely",
  "unlimited",
  "unlit",
  "unliterary",
  "unliterate",
  "unlovable",
  "unloved",
  "unlovely",
  "unlucky",
  "unlunar",
  "unluxuriant",
  "unluxuriating",
  "unluxurious",
  "unmarried",
  "unmathematical",
  "unmedical",
  "unmedicinal",
  "unmelodramatic",
  "unmelted",
  "unmercenary",
  "unmerchantable",
  "unmerciful",
  "unmetalled",
  "unmetallic",
  "unmetallurgic",
  "unmetallurgical",
  "unmindful",
  "unmodified",
  "unmonarchic",
  "unmonarchical",
  "unmotivated",
  "unmystic",
  "unmystical",
  "unmystified",
  "unmythical",
  "unmythological",
  "unnarrowminded",
  "unnational",
  "unnationalised",
  "unnationalistic",
  "unnecessary",
  "unneeded",
  "unnoted",
  "unnoteworthy",
  "unnoticeable",
  "unnoticed",
  "unobjective",
  "unobservant",
  "unoceanic",
  "unodoriferous",
  "unodorous",
  "unoperatable",
  "unopinionated",
  "unopinioned",
  "unoptimistic",
  "unostentatious",
  "unoutlawed",
  "unpacified",
  "unpacifistic",
  "unpaid",
  "unparalleled",
  "unparalysed",
  "unparenthesised",
  "unparenthesized",
  "unparenthetic",
  "unparenthetical",
  "unphilosophic",
  "unphilosophical",
  "unplayable",
  "unplayful",
  "unpleasant",
  "unpleased",
  "unpleasing",
  "unpleasurable",
  "unpoliced",
  "unpolitical",
  "unpopular",
  "unpraiseworthy",
  "unpredestined",
  "unpredictable",
  "unpretending",
  "unpretentious",
  "unprincipled",
  "unprofessional",
  "unprofitable",
  "unpronounceable",
  "unprophesied",
  "unprophetic",
  "unprophetical",
  "unprotected",
  "unpsychic",
  "unpsychological",
  "unpsychopathic",
  "unpsychotic",
  "unpurified",
  "unqualified",
  "unquenchable",
  "unquenched",
  "unquiet",
  "unquietable",
  "unquieted",
  "unquieting",
  "unrationable",
  "unrational",
  "unrationalised",
  "unrationalising",
  "unread",
  "unreadable",
  "unreal",
  "unrealistic",
  "unreasonable",
  "unrectangular",
  "unrefrigerated",
  "unregal",
  "unrelative",
  "unrelativistic",
  "unrelaxable",
  "unrelaxed",
  "unrelaxing",
  "unreligioned",
  "unreligious",
  "unremarkable",
  "unremorseful",
  "unreputable",
  "unrestrained",
  "unrestricted",
  "unrestrictive",
  "unrideable",
  "unritual",
  "unritualistic",
  "unrivaled",
  "unromantic",
  "unromanticised",
  "unrounded",
  "unruly",
  "unsafe",
  "unsainted",
  "unsaintly",
  "unsalted",
  "unsalty",
  "unsanitary",
  "unsanitised",
  "unsanitized",
  "unsatisfied",
  "unsavoury",
  "unscholastic",
  "unschooled",
  "unscientific",
  "unscrupulous",
  "unsecular",
  "unsecularised",
  "unsecure",
  "unselfish",
  "unsentient",
  "unshakable",
  "unshaken",
  "unsightly",
  "unsinful",
  "unsinkable",
  "unskeptical",
  "unskillful",
  "unsleepy",
  "unsocial",
  "unsolar",
  "unsolemn",
  "unsolemnified",
  "unsolemnised",
  "unsolicitated",
  "unsolicited",
  "unsolicitous",
  "unsophisticated",
  "unspecialized",
  "unspecific",
  "unspecified",
  "unspectacular",
  "unspherical",
  "unspirited",
  "unspiriting",
  "unspiritual",
  "unstable",
  "unstoppable",
  "unsubjective",
  "unsuccessful",
  "unsuitable",
  "unsuited",
  "unsure",
  "unsuspecting",
  "unsustainable",
  "unsweet",
  "unsweetened",
  "unsyllabicated",
  "unsyllabified",
  "unsyllabled",
  "unsympathetic",
  "untalented",
  "untameable",
  "unterrestrial",
  "unthankful",
  "unthanking",
  "untheatric",
  "untheologic",
  "untheological",
  "unthinkable",
  "unthinking",
  "untidied",
  "untidy",
  "untidying",
  "untimely",
  "untiring",
  "untouchable",
  "untraditional",
  "untrigonometric",
  "untrigonometrical",
  "untroublesome",
  "untrusting",
  "untruthful",
  "ununbium",
  "ununhexium",
  "ununoctium",
  "ununpentium",
  "ununquadium",
  "ununseptium",
  "ununtrium",
  "unusual",
  "unvacant",
  "unvagrant",
  "unventuresome",
  "unventurous",
  "unverifiable",
  "unverified",
  "unwanted",
  "unwashed",
  "unwasteful",
  "unwealthy",
  "unwearied",
  "unwelcome",
  "unwhite",
  "unwhited",
  "unwhitened",
  "unwhitewashed",
  "unwholesome",
  "unwieldable",
  "unwieldy",
  "unwilling",
  "unwise",
  "unwitty",
  "unwomanish",
  "unwomanlike",
  "unworldly",
  "unworthy",
  "upbeat",
  "upper",
  "upperclass",
  "uppity",
  "upright",
  "upset",
  "upstanding",
  "uptight",
  "uranium",
  "urban",
  "urbane",
  "urgent",
  "urological",
  "usable",
  "used",
  "useful",
  "useless",
  "usual",
  "usurious",
  "utilitarian",
  "utilizable",
  "utopian",
  "utopic",
  "vacant",
  "vaccinated",
  "vacuous",
  "vague",
  "vain",
  "vainglorious",
  "valiant",
  "valid",
  "valorous",
  "valuable",
  "valued",
  "vampiric",
  "vanilla",
  "vanillic",
  "vanitied",
  "vanquishable",
  "vapid",
  "vaporescent",
  "vaporific",
  "vaporish",
  "vaporous",
  "vapory",
  "vapourescent",
  "vapourific",
  "vapourish",
  "vapoury",
  "variable",
  "varicoloured",
  "varied",
  "varve",
  "varying",
  "vast",
  "vaterite",
  "vegan",
  "veganarchist",
  "vegetal",
  "vegetarian",
  "vegetative",
  "veiny",
  "vellum",
  "velour",
  "velvet",
  "velveteen",
  "velvety",
  "venal",
  "venerable",
  "venerated",
  "vengeful",
  "venomous",
  "ventriloquial",
  "ventriloquistic",
  "venturesome",
  "venturous",
  "venustraphobic",
  "verastile",
  "verbose",
  "verifiable",
  "verified",
  "vermicidal",
  "vermicular",
  "vermiform",
  "vermillion",
  "verminous",
  "vermivorous",
  "vernal",
  "versicolor",
  "vertical",
  "veryblue",
  "veryflying",
  "verymad",
  "veryveryblue",
  "veryveryflying",
  "veryverymad",
  "veryveryveryblue",
  "veryveryveryflying",
  "veryveryverymad",
  "vestigial",
  "vexatious",
  "vibrant",
  "viceregal",
  "vicious",
  "victimized",
  "victorious",
  "videophilic",
  "viewable",
  "vigilant",
  "vigorous",
  "vile",
  "villainous",
  "vincible",
  "vinegarish",
  "vinegary",
  "vinicultural",
  "vinifera",
  "vinyl",
  "violent",
  "violet",
  "violety",
  "viperine",
  "viperish",
  "viperous",
  "viral",
  "virile",
  "virtuous",
  "visible",
  "visionary",
  "vital",
  "vitriolic",
  "vivacious",
  "vivid",
  "vixenish",
  "vixenly",
  "vocational",
  "voguish",
  "volatile",
  "volcanic",
  "volcanologic",
  "volcanological",
  "voltaic",
  "volumed",
  "voluminous",
  "voluptuary",
  "voluptuous",
  "voodooistic",
  "voracious",
  "vulcanian",
  "vulcanisable",
  "vulcanological",
  "vulgar",
  "vulnerable",
  "vulpine",
  "vuvuzelaish",
  "wacky",
  "wafery",
  "wageless",
  "wageworking",
  "wailful",
  "wailsome",
  "waiting",
  "wakeful",
  "wakeless",
  "walking",
  "wandering",
  "wanted",
  "warless",
  "warlike",
  "warm",
  "warmblooded",
  "warmhearted",
  "warmish",
  "warmthless",
  "warriorlike",
  "wartlike",
  "warty",
  "wary",
  "washable",
  "washedout",
  "washedup",
  "waspish",
  "waspy",
  "wasteful",
  "watchful",
  "waterborne",
  "waterbreathing",
  "watercolour",
  "watereddown",
  "waterish",
  "waterlocked",
  "waterlog",
  "waterlogged",
  "waterproof",
  "waterrepellent",
  "waterresistant",
  "watertight",
  "waterworn",
  "watery",
  "wavy",
  "wax",
  "waxy",
  "wayfaring",
  "wayward",
  "weak",
  "weakened",
  "weakhanded",
  "weakish",
  "weakly",
  "weakminded",
  "weakwilled",
  "wealthy",
  "weaponed",
  "weaponised",
  "weaponless",
  "wearable",
  "wearied",
  "weariful",
  "weariless",
  "wearing",
  "wearish",
  "wearisome",
  "wearproof",
  "weary",
  "wearying",
  "weatherbeaten",
  "weathered",
  "weatherproof",
  "weathertight",
  "weatherworn",
  "webbed",
  "webby",
  "wedded",
  "wee",
  "weedy",
  "weeping",
  "weepy",
  "weighable",
  "weighted",
  "weightless",
  "weighty",
  "weird",
  "welcome",
  "well",
  "wellaccepted",
  "wellbeloved",
  "wellblacked",
  "wellborn",
  "wellbrowned",
  "wellcoloured",
  "wellcultured",
  "welldesired",
  "welldestroyed",
  "welldramatized",
  "welldressed",
  "welleducated",
  "wellfreckled",
  "wellgroomed",
  "wellknotted",
  "wellknown",
  "wellloved",
  "wellmade",
  "wellmannered",
  "wellneeded",
  "welloff",
  "wellphilosophised",
  "wellpleased",
  "wellpoliced",
  "wellunderstood",
  "werewolflike",
  "westbound",
  "western",
  "westernmost",
  "wet",
  "wetproof",
  "wetproof",
  "wettish",
  "whacky",
  "wheat",
  "wheezy",
  "whimsical",
  "white",
  "whitecollar",
  "whited",
  "whitefaced",
  "whitelivered",
  "whitish",
  "wholehearted",
  "wholesome",
  "wholesouled",
  "wholewheat",
  "wicked",
  "wide",
  "wideawake",
  "wideeyed",
  "widespread",
  "widish",
  "wieldable",
  "wieldy",
  "wifely",
  "wild",
  "wilful",
  "willing",
  "wily",
  "wimpy",
  "winded",
  "windowy",
  "windy",
  "winged",
  "wingless",
  "winning",
  "winsome",
  "winterhardy",
  "winterish",
  "wintery",
  "wintry",
  "wired",
  "wisdomless",
  "wise",
  "wised",
  "wishful",
  "wispy",
  "wisteria",
  "wistful",
  "witching",
  "witchy",
  "witless",
  "witted",
  "witting",
  "witty",
  "wizardlike",
  "wizardly",
  "woebegone",
  "woeful",
  "woesome",
  "wolfish",
  "wolflike",
  "womanish",
  "womanly",
  "wonderful",
  "wonderstricken",
  "wondrous",
  "wood",
  "woodblock",
  "wooded",
  "wooden",
  "woodenheaded",
  "woodsy",
  "woody",
  "wool",
  "woollen",
  "woolly",
  "woollyheaded",
  "woozy",
  "wordperfect",
  "wordy",
  "working",
  "workingclass",
  "worldlyminded",
  "worldlywise",
  "worldwide",
  "wormish",
  "wormlike",
  "wormy",
  "wornout",
  "worried",
  "worriless",
  "worrisome",
  "worrying",
  "worse",
  "worthless",
  "worthwhile",
  "worthy",
  "wounded",
  "wraithlike",
  "wraithlike",
  "wrapped",
  "wrathful",
  "wretched",
  "wrinkleable",
  "wrinkled",
  "wrinkleless",
  "wrinkly",
  "written",
  "wrongful",
  "wrongheaded",
  "wroth",
  "wroughtiron",
  "wuthering",
  "xenophobic",
  "xerophagous",
  "xerophobic",
  "xylophagous",
  "yeasty",
  "yellow",
  "yellowbellied",
  "yellowish",
  "yester",
  "yestern",
  "yielding",
  "yogic",
  "yokelish",
  "young",
  "youthful",
  "yummy",
  "zany",
  "zanyish",
  "zealous",
  "zebraic",
  "zebraprint",
  "zebraprint",
  "zebrine",
  "zincic",
  "zinciferous",
  "zincky",
  "zincoid",
  "zincous",
  "zincy",
  "zinnwaldite",
  "zippered",
  "zippy",
  "zircon",
  "zodiacal",
  "zoisite",
  "zombie",
  "zombified",
  "zoographic",
  "zoographical",
  "zoolatrous",
  "zoological",
  "zoometric",
  "zoometrical",
  "zoophagous",
  "zoophobic"
]

},{}],5:[function(require,module,exports){
module.exports=[
  "aardvark",
  "aardwolf",
  "abalone",
  "abyssiniancat",
  "abyssiniangroundhornbill",
  "acaciarat",
  "achillestang",
  "acornbarnacle",
  "acornweevil",
  "acornwoodpecker",
  "acouchi",
  "adamsstaghornedbeetle",
  "addax",
  "adder",
  "adeliepenguin",
  "admiralbutterfly",
  "adouri",
  "aegeancat",
  "affenpinscher",
  "afghanhound",
  "africanaugurbuzzard",
  "africanbushviper",
  "africancivet",
  "africanclawedfrog",
  "africanelephant",
  "africanfisheagle",
  "africangoldencat",
  "africangroundhornbill",
  "africanharrierhawk",
  "africanhornbill",
  "africanjacana",
  "africanmolesnake",
  "africanparadiseflycatcher",
  "africanpiedkingfisher",
  "africanporcupine",
  "africanrockpython",
  "africanwildcat",
  "africanwilddog",
  "agama",
  "agouti",
  "aidi",
  "airedale",
  "airedaleterrier",
  "akitainu",
  "alabamamapturtle",
  "alaskajingle",
  "alaskanhusky",
  "alaskankleekai",
  "alaskanmalamute",
  "albacoretuna",
  "albatross",
  "albertosaurus",
  "albino",
  "aldabratortoise",
  "allensbigearedbat",
  "alleycat",
  "alligator",
  "alligatorgar",
  "alligatorsnappingturtle",
  "allosaurus",
  "alpaca",
  "alpinegoat",
  "alpineroadguidetigerbeetle",
  "altiplanochinchillamouse",
  "amazondolphin",
  "amazonparrot",
  "amazontreeboa",
  "amberpenshell",
  "ambushbug",
  "americanalligator",
  "americanavocet",
  "americanbadger",
  "americanbittern",
  "americanblackvulture",
  "americanbobtail",
  "americanbulldog",
  "americancicada",
  "americancrayfish",
  "americancreamdraft",
  "americancrocodile",
  "americancrow",
  "americancurl",
  "americangoldfinch",
  "americanindianhorse",
  "americankestrel",
  "americanlobster",
  "americanmarten",
  "americanpainthorse",
  "americanquarterhorse",
  "americanratsnake",
  "americanredsquirrel",
  "americanriverotter",
  "americanrobin",
  "americansaddlebred",
  "americanshorthair",
  "americantoad",
  "americanwarmblood",
  "americanwigeon",
  "americanwirehair",
  "amethystgemclam",
  "amethystinepython",
  "amethystsunbird",
  "ammonite",
  "amoeba",
  "amphibian",
  "amphiuma",
  "amurminnow",
  "amurratsnake",
  "amurstarfish",
  "anaconda",
  "anchovy",
  "andalusianhorse",
  "andeancat",
  "andeancockoftherock",
  "andeancondor",
  "anemone",
  "anemonecrab",
  "anemoneshrimp",
  "angelfish",
  "angelwingmussel",
  "anglerfish",
  "angora",
  "angwantibo",
  "anhinga",
  "ankole",
  "ankolewatusi",
  "annashummingbird",
  "annelid",
  "annelida",
  "anole",
  "anophelesmosquito",
  "ant",
  "antarcticfurseal",
  "antarcticgiantpetrel",
  "antbear",
  "anteater",
  "antelope",
  "antelopegroundsquirrel",
  "antipodesgreenparakeet",
  "antlion",
  "anura",
  "aoudad",
  "apatosaur",
  "ape",
  "aphid",
  "apisdorsatalaboriosa",
  "aplomadofalcon",
  "appaloosa",
  "aquaticleech",
  "arabianhorse",
  "arabianoryx",
  "arabianwildcat",
  "aracari",
  "arachnid",
  "arawana",
  "archaeocete",
  "archaeopteryx",
  "archerfish",
  "arcticduck",
  "arcticfox",
  "arctichare",
  "arcticseal",
  "arcticwolf",
  "argali",
  "argentinehornedfrog",
  "argentineruddyduck",
  "argusfish",
  "arieltoucan",
  "arizonaalligatorlizard",
  "arkshell",
  "armadillo",
  "armedcrab",
  "armednylonshrimp",
  "armyant",
  "armyworm",
  "arrowana",
  "arrowcrab",
  "arrowworm",
  "arthropods",
  "aruanas",
  "asianconstablebutterfly",
  "asiandamselfly",
  "asianelephant",
  "asianlion",
  "asianpiedstarling",
  "asianporcupine",
  "asiansmallclawedotter",
  "asiantrumpetfish",
  "asianwaterbuffalo",
  "asiaticgreaterfreshwaterclam",
  "asiaticlesserfreshwaterclam",
  "asiaticmouflon",
  "asiaticwildass",
  "asp",
  "ass",
  "assassinbug",
  "astarte",
  "astrangiacoral",
  "atlanticblackgoby",
  "atlanticbluetang",
  "atlanticridleyturtle",
  "atlanticsharpnosepuffer",
  "atlanticspadefish",
  "atlasmoth",
  "attwatersprairiechicken",
  "auk",
  "auklet",
  "aurochs",
  "australiancattledog",
  "australiancurlew",
  "australianfreshwatercrocodile",
  "australianfurseal",
  "australiankelpie",
  "australiankestrel",
  "australianshelduck",
  "australiansilkyterrier",
  "austrianpinscher",
  "avians",
  "avocet",
  "axisdeer",
  "axolotl",
  "ayeaye",
  "aztecant",
  "azurevase",
  "azurevasesponge",
  "azurewingedmagpie",
  "babirusa",
  "baboon",
  "backswimmer",
  "bactrian",
  "badger",
  "bagworm",
  "baiji",
  "baldeagle",
  "baleenwhale",
  "balloonfish",
  "ballpython",
  "bandicoot",
  "bangeltiger",
  "bantamrooster",
  "banteng",
  "barasinga",
  "barasingha",
  "barb",
  "barbet",
  "barebirdbat",
  "barnacle",
  "barnowl",
  "barnswallow",
  "barracuda",
  "basenji",
  "basil",
  "basilisk",
  "bass",
  "bassethound",
  "bat",
  "bats",
  "beagle",
  "bear",
  "beardedcollie",
  "beardeddragon",
  "beauceron",
  "beaver",
  "bedbug",
  "bedlingtonterrier",
  "bee",
  "beetle",
  "bellfrog",
  "bellsnake",
  "belugawhale",
  "bengaltiger",
  "bergerpicard",
  "bernesemountaindog",
  "betafish",
  "bettong",
  "bichonfrise",
  "bighorn",
  "bighornedsheep",
  "bighornsheep",
  "bigmouthbass",
  "bilby",
  "billygoat",
  "binturong",
  "bird",
  "birdofparadise",
  "bison",
  "bittern",
  "blackandtancoonhound",
  "blackbear",
  "blackbird",
  "blackbuck",
  "blackcrappie",
  "blackfish",
  "blackfly",
  "blackfootedferret",
  "blacklab",
  "blacklemur",
  "blackmamba",
  "blacknorwegianelkhound",
  "blackpanther",
  "blackrhino",
  "blackrussianterrier",
  "blackwidowspider",
  "blesbok",
  "blobfish",
  "blowfish",
  "blueandgoldmackaw",
  "bluebird",
  "bluebottle",
  "bluebottlejellyfish",
  "bluebreastedkookaburra",
  "bluefintuna",
  "bluefish",
  "bluegill",
  "bluejay",
  "bluemorphobutterfly",
  "blueshark",
  "bluet",
  "bluetickcoonhound",
  "bluetonguelizard",
  "bluewhale",
  "boa",
  "boaconstrictor",
  "boar",
  "bobcat",
  "bobolink",
  "bobwhite",
  "boilweevil",
  "bongo",
  "bonobo",
  "booby",
  "bordercollie",
  "borderterrier",
  "borer",
  "borzoi",
  "boto",
  "boubou",
  "boutu",
  "bovine",
  "brahmanbull",
  "brahmancow",
  "brant",
  "bream",
  "brocketdeer",
  "bronco",
  "brontosaurus",
  "brownbear",
  "brownbutterfly",
  "bubblefish",
  "buck",
  "buckeyebutterfly",
  "budgie",
  "bufeo",
  "buffalo",
  "bufflehead",
  "bug",
  "bull",
  "bullfrog",
  "bullmastiff",
  "bumblebee",
  "bunny",
  "bunting",
  "burro",
  "bushbaby",
  "bushsqueaker",
  "bustard",
  "butterfly",
  "buzzard",
  "caecilian",
  "caiman",
  "caimanlizard",
  "calf",
  "camel",
  "canadagoose",
  "canary",
  "canine",
  "canvasback",
  "capeghostfrog",
  "capybara",
  "caracal",
  "cardinal",
  "caribou",
  "carp",
  "carpenterant",
  "cassowary",
  "cat",
  "catbird",
  "caterpillar",
  "catfish",
  "cats",
  "cattle",
  "caudata",
  "cavy",
  "centipede",
  "cero",
  "chafer",
  "chameleon",
  "chamois",
  "chanticleer",
  "cheetah",
  "chevrotain",
  "chick",
  "chickadee",
  "chicken",
  "chihuahua",
  "chimneyswift",
  "chimpanzee",
  "chinchilla",
  "chinesecrocodilelizard",
  "chipmunk",
  "chital",
  "chrysalis",
  "chrysomelid",
  "chuckwalla",
  "chupacabra",
  "cicada",
  "cirriped",
  "civet",
  "clam",
  "cleanerwrasse",
  "clingfish",
  "clownanemonefish",
  "clumber",
  "coati",
  "cob",
  "cobra",
  "cock",
  "cockatiel",
  "cockatoo",
  "cockerspaniel",
  "cockroach",
  "cod",
  "coelacanth",
  "collardlizard",
  "collie",
  "colt",
  "comet",
  "commabutterfly",
  "commongonolek",
  "conch",
  "condor",
  "coney",
  "conure",
  "cony",
  "coot",
  "cooter",
  "copepod",
  "copperbutterfly",
  "copperhead",
  "coqui",
  "coral",
  "cormorant",
  "cornsnake",
  "corydorascatfish",
  "cottonmouth",
  "cottontail",
  "cougar",
  "cow",
  "cowbird",
  "cowrie",
  "coyote",
  "coypu",
  "crab",
  "crane",
  "cranefly",
  "crayfish",
  "creature",
  "cricket",
  "crocodile",
  "crocodileskink",
  "crossbill",
  "crow",
  "crownofthornsstarfish",
  "crustacean",
  "cub",
  "cuckoo",
  "cur",
  "curassow",
  "curlew",
  "cuscus",
  "cusimanse",
  "cuttlefish",
  "cutworm",
  "cygnet",
  "dachshund",
  "daddylonglegs",
  "dairycow",
  "dalmatian",
  "damselfly",
  "danishswedishfarmdog",
  "darklingbeetle",
  "dartfrog",
  "darwinsfox",
  "dassie",
  "dassierat",
  "davidstiger",
  "deer",
  "deermouse",
  "degu",
  "degus",
  "deinonychus",
  "desertpupfish",
  "devilfish",
  "deviltasmanian",
  "diamondbackrattlesnake",
  "dikdik",
  "dikkops",
  "dingo",
  "dinosaur",
  "diplodocus",
  "dipper",
  "discus",
  "dobermanpinscher",
  "doctorfish",
  "dodo",
  "dodobird",
  "doe",
  "dog",
  "dogfish",
  "dogwoodclubgall",
  "dogwoodtwigborer",
  "dolphin",
  "donkey",
  "dorado",
  "dore",
  "dorking",
  "dormouse",
  "dotterel",
  "douglasfirbarkbeetle",
  "dove",
  "dowitcher",
  "drafthorse",
  "dragon",
  "dragonfly",
  "drake",
  "drever",
  "dromaeosaur",
  "dromedary",
  "drongo",
  "duck",
  "duckbillcat",
  "duckbillplatypus",
  "duckling",
  "dugong",
  "duiker",
  "dungbeetle",
  "dungenesscrab",
  "dunlin",
  "dunnart",
  "dutchshepherddog",
  "dutchsmoushond",
  "dwarfmongoose",
  "dwarfrabbit",
  "eagle",
  "earthworm",
  "earwig",
  "easternglasslizard",
  "easternnewt",
  "easteuropeanshepherd",
  "eastrussiancoursinghounds",
  "eastsiberianlaika",
  "echidna",
  "eel",
  "eelelephant",
  "eeve",
  "eft",
  "egg",
  "egret",
  "eider",
  "eidolonhelvum",
  "ekaltadeta",
  "eland",
  "electriceel",
  "elephant",
  "elephantbeetle",
  "elephantseal",
  "elk",
  "elkhound",
  "elver",
  "emeraldtreeskink",
  "emperorpenguin",
  "emperorshrimp",
  "emu",
  "englishpointer",
  "englishsetter",
  "equestrian",
  "equine",
  "erin",
  "ermine",
  "erne",
  "eskimodog",
  "esok",
  "estuarinecrocodile",
  "ethiopianwolf",
  "europeanfiresalamander",
  "europeanpolecat",
  "ewe",
  "eyas",
  "eyelashpitviper",
  "eyra",
  "fairybluebird",
  "fairyfly",
  "falcon",
  "fallowdeer",
  "fantail",
  "fanworms",
  "fattaileddunnart",
  "fawn",
  "feline",
  "fennecfox",
  "ferret",
  "fiddlercrab",
  "fieldmouse",
  "fieldspaniel",
  "finch",
  "finnishspitz",
  "finwhale",
  "fireant",
  "firebelliedtoad",
  "firecrest",
  "firefly",
  "fish",
  "fishingcat",
  "flamingo",
  "flatcoatretriever",
  "flatfish",
  "flea",
  "flee",
  "flicker",
  "flickertailsquirrel",
  "flies",
  "flounder",
  "fluke",
  "fly",
  "flycatcher",
  "flyingfish",
  "flyingfox",
  "flyinglemur",
  "flyingsquirrel",
  "foal",
  "fossa",
  "fowl",
  "fox",
  "foxhound",
  "foxterrier",
  "frenchbulldog",
  "freshwatereel",
  "frigatebird",
  "frilledlizard",
  "frillneckedlizard",
  "fritillarybutterfly",
  "frog",
  "frogmouth",
  "fruitbat",
  "fruitfly",
  "fugu",
  "fulmar",
  "funnelweaverspider",
  "furseal",
  "gadwall",
  "galago",
  "galah",
  "galapagosalbatross",
  "galapagosdove",
  "galapagoshawk",
  "galapagosmockingbird",
  "galapagospenguin",
  "galapagossealion",
  "galapagostortoise",
  "gallinule",
  "gallowaycow",
  "gander",
  "gangesdolphin",
  "gannet",
  "gar",
  "gardensnake",
  "garpike",
  "gartersnake",
  "gaur",
  "gavial",
  "gazelle",
  "gecko",
  "geese",
  "gelada",
  "gelding",
  "gemsbok",
  "gemsbuck",
  "genet",
  "gentoopenguin",
  "gerbil",
  "gerenuk",
  "germanpinscher",
  "germanshepherd",
  "germanshorthairedpointer",
  "germanspaniel",
  "germanspitz",
  "germanwirehairedpointer",
  "gharial",
  "ghostshrimp",
  "giantschnauzer",
  "gibbon",
  "gilamonster",
  "giraffe",
  "glassfrog",
  "globefish",
  "glowworm",
  "gnat",
  "gnatcatcher",
  "gnu",
  "goa",
  "goat",
  "godwit",
  "goitered",
  "goldeneye",
  "goldenmantledgroundsquirrel",
  "goldenretriever",
  "goldfinch",
  "goldfish",
  "gonolek",
  "goose",
  "goosefish",
  "gopher",
  "goral",
  "gordonsetter",
  "gorilla",
  "goshawk",
  "gosling",
  "gossamerwingedbutterfly",
  "gourami",
  "grackle",
  "grasshopper",
  "grassspider",
  "grayfox",
  "grayling",
  "grayreefshark",
  "graysquirrel",
  "graywolf",
  "greatargus",
  "greatdane",
  "greathornedowl",
  "greatwhiteshark",
  "grebe",
  "greendarnerdragonfly",
  "greyhounddog",
  "grison",
  "grizzlybear",
  "grosbeak",
  "groundbeetle",
  "groundhog",
  "grouper",
  "grouse",
  "grub",
  "grunion",
  "guanaco",
  "guernseycow",
  "guillemot",
  "guineafowl",
  "guineapig",
  "gull",
  "guppy",
  "gypsymoth",
  "gyrfalcon",
  "hackee",
  "haddock",
  "hadrosaurus",
  "hagfish",
  "hairstreak",
  "hairstreakbutterfly",
  "hake",
  "halcyon",
  "halibut",
  "halicore",
  "hamadryad",
  "hamadryas",
  "hammerheadbird",
  "hammerheadshark",
  "hammerkop",
  "hamster",
  "hanumanmonkey",
  "hapuka",
  "hapuku",
  "harborporpoise",
  "harborseal",
  "hare",
  "harlequinbug",
  "harpseal",
  "harpyeagle",
  "harrier",
  "harrierhawk",
  "hart",
  "hartebeest",
  "harvestmen",
  "harvestmouse",
  "hatchetfish",
  "hawaiianmonkseal",
  "hawk",
  "hectorsdolphin",
  "hedgehog",
  "heifer",
  "hellbender",
  "hen",
  "herald",
  "herculesbeetle",
  "hermitcrab",
  "heron",
  "herring",
  "heterodontosaurus",
  "hind",
  "hippopotamus",
  "hoatzin",
  "hochstettersfrog",
  "hog",
  "hogget",
  "hoiho",
  "hoki",
  "homalocephale",
  "honeybadger",
  "honeybee",
  "honeycreeper",
  "honeyeater",
  "hookersealion",
  "hoopoe",
  "hornbill",
  "hornedtoad",
  "hornedviper",
  "hornet",
  "hornshark",
  "horse",
  "horsechestnutleafminer",
  "horsefly",
  "horsemouse",
  "horseshoebat",
  "horseshoecrab",
  "hound",
  "housefly",
  "hoverfly",
  "howlermonkey",
  "huemul",
  "huia",
  "human",
  "hummingbird",
  "humpbackwhale",
  "husky",
  "hydatidtapeworm",
  "hydra",
  "hyena",
  "hylaeosaurus",
  "hypacrosaurus",
  "hypsilophodon",
  "hyracotherium",
  "hyrax",
  "iaerismetalmark",
  "ibadanmalimbe",
  "iberianbarbel",
  "iberianchiffchaff",
  "iberianemeraldlizard",
  "iberianlynx",
  "iberianmidwifetoad",
  "iberianmole",
  "iberiannase",
  "ibex",
  "ibis",
  "ibisbill",
  "ibizanhound",
  "iceblueredtopzebra",
  "icefish",
  "icelandgull",
  "icelandichorse",
  "icelandicsheepdog",
  "ichidna",
  "ichneumonfly",
  "ichthyosaurs",
  "ichthyostega",
  "icterinewarbler",
  "iggypops",
  "iguana",
  "iguanodon",
  "illadopsis",
  "ilsamochadegu",
  "imago",
  "impala",
  "imperatorangel",
  "imperialeagle",
  "incatern",
  "inchworm",
  "indianabat",
  "indiancow",
  "indianelephant",
  "indianglassfish",
  "indianhare",
  "indianjackal",
  "indianpalmsquirrel",
  "indianpangolin",
  "indianrhinoceros",
  "indianringneckparakeet",
  "indianrockpython",
  "indianskimmer",
  "indianspinyloach",
  "indigobunting",
  "indigowingedparrot",
  "indochinahogdeer",
  "indochinesetiger",
  "indri",
  "indusriverdolphin",
  "inexpectatumpleco",
  "inganue",
  "insect",
  "intermediateegret",
  "invisiblerail",
  "iraniangroundjay",
  "iridescentshark",
  "iriomotecat",
  "irishdraughthorse",
  "irishredandwhitesetter",
  "irishsetter",
  "irishterrier",
  "irishwaterspaniel",
  "irishwolfhound",
  "irrawaddydolphin",
  "irukandjijellyfish",
  "isabellineshrike",
  "isabellinewheatear",
  "islandcanary",
  "islandwhistler",
  "isopod",
  "italianbrownbear",
  "italiangreyhound",
  "ivorybackedwoodswallow",
  "ivorybilledwoodpecker",
  "ivorygull",
  "izuthrush",
  "jabiru",
  "jackal",
  "jackrabbit",
  "jaeger",
  "jaguar",
  "jaguarundi",
  "janenschia",
  "japanesebeetle",
  "javalina",
  "jay",
  "jellyfish",
  "jenny",
  "jerboa",
  "joey",
  "johndory",
  "juliabutterfly",
  "jumpingbean",
  "junco",
  "junebug",
  "kagu",
  "kakapo",
  "kakarikis",
  "kangaroo",
  "karakul",
  "katydid",
  "kawala",
  "kentrosaurus",
  "kestrel",
  "kid",
  "killdeer",
  "killerwhale",
  "killifish",
  "kingbird",
  "kingfisher",
  "kinglet",
  "kingsnake",
  "kinkajou",
  "kiskadee",
  "kissingbug",
  "kite",
  "kitfox",
  "kitten",
  "kittiwake",
  "kitty",
  "kiwi",
  "koala",
  "koalabear",
  "kob",
  "kodiakbear",
  "koi",
  "komododragon",
  "koodoo",
  "kookaburra",
  "kouprey",
  "krill",
  "kronosaurus",
  "kudu",
  "kusimanse",
  "labradorretriever",
  "lacewing",
  "ladybird",
  "ladybug",
  "lamb",
  "lamprey",
  "langur",
  "lark",
  "larva",
  "laughingthrush",
  "lcont",
  "leafbird",
  "leafcutterant",
  "leafhopper",
  "leafwing",
  "leech",
  "lemming",
  "lemur",
  "leonberger",
  "leopard",
  "leopardseal",
  "leveret",
  "lhasaapso",
  "lice",
  "liger",
  "lightningbug",
  "limpet",
  "limpkin",
  "ling",
  "lion",
  "lionfish",
  "littlenightmonkeys",
  "lizard",
  "llama",
  "lobo",
  "lobster",
  "locust",
  "loggerheadturtle",
  "longhorn",
  "longhornbeetle",
  "longspur",
  "loon",
  "lorikeet",
  "loris",
  "louse",
  "lovebird",
  "lowchen",
  "lunamoth",
  "lungfish",
  "lynx ",
  "lynx",
  "macaque",
  "macaw",
  "macropod",
  "madagascarhissingroach",
  "maggot",
  "magpie",
  "maiasaura",
  "majungatholus",
  "malamute",
  "mallard",
  "maltesedog",
  "mamba",
  "mamenchisaurus",
  "mammal",
  "mammoth",
  "manatee",
  "mandrill",
  "mangabey",
  "manta",
  "mantaray",
  "mantid",
  "mantis",
  "mantisray",
  "manxcat",
  "mara",
  "marabou",
  "marbledmurrelet",
  "mare",
  "marlin",
  "marmoset",
  "marmot",
  "marten",
  "martin",
  "massasauga",
  "massospondylus",
  "mastiff",
  "mastodon",
  "mayfly",
  "meadowhawk",
  "meadowlark",
  "mealworm",
  "meerkat",
  "megalosaurus",
  "megalotomusquinquespinosus",
  "megaraptor",
  "merganser",
  "merlin",
  "metalmarkbutterfly",
  "metamorphosis",
  "mice",
  "microvenator",
  "midge",
  "milksnake",
  "milkweedbug",
  "millipede",
  "minibeast",
  "mink",
  "minnow",
  "mite",
  "moa",
  "mockingbird",
  "mole",
  "mollies",
  "mollusk",
  "molly",
  "monarch",
  "mongoose",
  "mongrel",
  "monkey",
  "monkfish ",
  "monoclonius",
  "montanoceratops",
  "moorhen",
  "moose",
  "moray",
  "morayeel",
  "morpho",
  "mosasaur",
  "mosquito",
  "moth",
  "motmot",
  "mouflon",
  "mountaincat",
  "mountainlion",
  "mouse",
  "mouse/mice",
  "mousebird",
  "mudpuppy",
  "mule",
  "mullet",
  "muntjac",
  "murrelet",
  "muskox",
  "muskrat",
  "mussaurus",
  "mussel",
  "mustang",
  "mutt",
  "myna",
  "mynah",
  "myotis ",
  "nabarlek",
  "nag",
  "naga",
  "nagapies",
  "nakedmolerat",
  "nandine",
  "nandoo",
  "nandu",
  "narwhal",
  "narwhale",
  "natterjacktoad",
  "nauplius",
  "nautilus",
  "needlefish",
  "needletail",
  "nematode",
  "nene",
  "neonblueguppy",
  "neonbluehermitcrab",
  "neondwarfgourami",
  "neonrainbowfish",
  "neonredguppy",
  "neontetra",
  "nerka",
  "nettlefish",
  "newfoundlanddog",
  "newt",
  "newtnutria",
  "nightcrawler",
  "nighthawk",
  "nightheron",
  "nightingale",
  "nightjar",
  "nijssenissdwarfchihlid",
  "nilgai",
  "ninebandedarmadillo",
  "noctilio",
  "noctule",
  "noddy",
  "noolbenger",
  "northerncardinals",
  "northernelephantseal",
  "northernflyingsquirrel",
  "northernfurseal",
  "northernhairynosedwombat",
  "northernpike",
  "northernseahorse",
  "northernspottedowl",
  "norwaylobster",
  "norwayrat",
  "nubiangoat",
  "nudibranch",
  "numbat",
  "nurseshark",
  "nutcracker",
  "nuthatch",
  "nutria",
  "nyala",
  "nymph",
  "ocelot",
  "octopus",
  "okapi",
  "olingo",
  "olm",
  "opossum",
  "orangutan",
  "orca",
  "oregonsilverspotbutterfly",
  "oriole",
  "oropendola",
  "oropendula",
  "oryx",
  "osprey",
  "ostracod",
  "ostrich",
  "otter",
  "ovenbird",
  "owl",
  "owlbutterfly",
  "ox",
  "oxen",
  "oxpecker",
  "oyster",
  "ozarkbigearedbat",
  "paca ",
  "pachyderm",
  "pacificparrotlet",
  "paddlefish",
  "paintedladybutterfly",
  "panda",
  "pangolin",
  "panther",
  "paperwasp",
  "papillon",
  "parakeet",
  "parrot",
  "partridge",
  "peacock",
  "peafowl",
  "peccary",
  "pekingese",
  "pelican",
  "pelicinuspetrel",
  "penguin",
  "perch",
  "peregrinefalcon",
  "pewee",
  "phalarope",
  "pharaohhound",
  "pheasant",
  "phoebe",
  "phoenix",
  "pig",
  "pigeon",
  "piglet",
  "pika",
  "pike",
  "pikeperch ",
  "pilchard",
  "pinemarten",
  "pinkriverdolphin",
  "pinniped",
  "pintail",
  "pipistrelle",
  "pipit",
  "piranha",
  "pitbull",
  "pittabird",
  "plainsqueaker",
  "plankton",
  "planthopper",
  "platypus",
  "plover",
  "polarbear",
  "polecat",
  "polliwog",
  "polyp",
  "polyturator",
  "pomeranian",
  "pondskater",
  "pony",
  "pooch",
  "poodle",
  "porcupine",
  "porpoise",
  "portuguesemanofwar",
  "possum",
  "prairiedog",
  "prawn",
  "prayingmantid",
  "prayingmantis",
  "primate",
  "pronghorn",
  "pseudodynerusquadrisectus",
  "ptarmigan",
  "pterodactyls",
  "pterosaurs",
  "puffer",
  "pufferfish",
  "puffin",
  "pug",
  "pullet",
  "puma",
  "pupa",
  "pupfish",
  "puppy",
  "purplemarten",
  "pussycat",
  "pygmy",
  "python",
  "quadrisectus",
  "quagga",
  "quahog",
  "quail",
  "queenalexandrasbirdwing",
  "queenalexandrasbirdwingbutterfly",
  "queenant",
  "queenbee",
  "queenconch",
  "queenslandgrouper",
  "queenslandheeler",
  "queensnake",
  "quelea",
  "quetzal",
  "quetzalcoatlus",
  "quillback",
  "quinquespinosus",
  "quokka",
  "quoll",
  "rabbit",
  "rabidsquirrel",
  "raccoon",
  "racer",
  "racerunner",
  "ragfish",
  "rail",
  "rainbowfish",
  "rainbowlorikeet",
  "rainbowtrout",
  "ram",
  "raptors",
  "rasbora",
  "rat",
  "ratfish",
  "rattail",
  "rattlesnake",
  "raven",
  "ray",
  "redhead",
  "redheadedwoodpecker",
  "redpoll",
  "redstart",
  "redtailedhawk",
  "reindeer",
  "reptile",
  "reynard",
  "rhea",
  "rhesusmonkey",
  "rhino",
  "rhinoceros",
  "rhinocerosbeetle",
  "rhodesianridgeback",
  "ringtailedlemur",
  "ringworm",
  "riograndeescuerzo",
  "roach",
  "roadrunner",
  "roan",
  "robberfly",
  "robin",
  "rockrat",
  "rodent",
  "roebuck",
  "roller",
  "rook",
  "rooster",
  "rottweiler",
  "sable",
  "sableantelope",
  "sablefish ",
  "saiga",
  "sakimonkey",
  "salamander",
  "salmon",
  "saltwatercrocodile",
  "sambar",
  "samoyeddog",
  "sandbarshark",
  "sanddollar",
  "sanderling",
  "sandpiper",
  "sapsucker",
  "sardine",
  "sawfish",
  "scallop",
  "scarab",
  "scarletibis",
  "scaup",
  "schapendoes",
  "schipperke",
  "schnauzer",
  "scorpion",
  "scoter",
  "screamer",
  "seabird",
  "seagull",
  "seahog",
  "seahorse",
  "seal",
  "sealion",
  "seamonkey",
  "seaslug",
  "seaurchin",
  "senegalpython",
  "seriema",
  "serpent",
  "serval",
  "shark",
  "shearwater",
  "sheep",
  "sheldrake",
  "shelduck",
  "shibainu",
  "shihtzu",
  "shorebird",
  "shoveler",
  "shrew",
  "shrike",
  "shrimp",
  "siamang",
  "siamesecat",
  "siberiantiger",
  "sidewinder",
  "sifaka",
  "silkworm",
  "silverfish",
  "silverfox",
  "silversidefish",
  "siskin",
  "skimmer",
  "skink",
  "skipper",
  "skua",
  "skunk",
  "skylark",
  "sloth",
  "slothbear",
  "slug",
  "smelts",
  "smew",
  "snail",
  "snake",
  "snipe",
  "snoutbutterfly",
  "snowdog",
  "snowgeese",
  "snowleopard",
  "snowmonkey",
  "snowyowl",
  "sockeyesalmon",
  "solenodon",
  "solitaire",
  "songbird",
  "sora",
  "southernhairnosedwombat",
  "sow",
  "spadefoot",
  "sparrow",
  "sphinx",
  "spider",
  "spidermonkey",
  "spiketail",
  "spittlebug",
  "sponge",
  "spoonbill",
  "spotteddolphin",
  "spreadwing",
  "springbok",
  "springpeeper",
  "springtail",
  "squab",
  "squamata",
  "squeaker",
  "squid",
  "squirrel",
  "stag",
  "stagbeetle",
  "stallion",
  "starfish",
  "starling",
  "steed",
  "steer",
  "stegosaurus",
  "stickinsect",
  "stickleback",
  "stilt",
  "stingray",
  "stinkbug",
  "stinkpot",
  "stoat",
  "stonefly",
  "stork",
  "stud",
  "sturgeon",
  "sugarglider",
  "sulphurbutterfly",
  "sunbear",
  "sunbittern",
  "sunfish",
  "swallow",
  "swallowtail",
  "swallowtailbutterfly",
  "swan",
  "swellfish",
  "swift",
  "swordfish",
  "tadpole",
  "tahr",
  "takin",
  "tamarin",
  "tanager",
  "tapaculo",
  "tapeworm",
  "tapir",
  "tarantula",
  "tarpan",
  "tarsier",
  "taruca",
  "tasmaniandevil",
  "tasmaniantiger",
  "tattler",
  "tayra",
  "teal",
  "tegus",
  "teledu",
  "tench",
  "tenrec",
  "termite",
  "tern",
  "terrapin",
  "terrier",
  "thoroughbred",
  "thrasher",
  "thrip",
  "thrush",
  "thunderbird",
  "thylacine",
  "tick",
  "tiger",
  "tigerbeetle",
  "tigermoth",
  "tigershark",
  "tilefish",
  "tinamou",
  "titi",
  "titmouse",
  "toad",
  "toadfish",
  "tomtit ",
  "topi",
  "tortoise",
  "toucan",
  "towhee",
  "tragopan",
  "treecreeper",
  "trex",
  "triceratops",
  "trogon",
  "trout",
  "trumpeterbird",
  "trumpeterswan",
  "tsetsefly",
  "tuatara",
  "tuna",
  "turaco",
  "turkey",
  "turnstone",
  "turtle",
  "turtledove",
  "uakari",
  "ugandakob",
  "uintagroundsquirrel",
  "ulyssesbutterfly",
  "umbrellabird",
  "umbrette",
  "unau",
  "ungulate",
  "unicorn",
  "upupa",
  "urchin",
  "urial",
  "uromastyxmaliensis",
  "uromastyxspinipes",
  "urson",
  "urubu",
  "urus",
  "urutu",
  "urva",
  "utahprairiedog",
  "vampirebat",
  "vaquita",
  "veery",
  "velociraptor",
  "velvetcrab",
  "velvetworm",
  "venomoussnake",
  "verdin",
  "vervet",
  "viceroybutterfly",
  "vicuna",
  "viper",
  "viperfish",
  "vipersquid",
  "vireo",
  "virginiaopossum",
  "vixen",
  "vole",
  "volvox",
  "vulpesvelox",
  "vulpesvulpes",
  "vulture",
  "walkingstick",
  "wallaby",
  "wallaroo",
  "walleye",
  "walrus",
  "warbler",
  "warthog",
  "wasp",
  "waterboatman",
  "waterbuck",
  "waterbuffalo",
  "waterbug",
  "waterdogs",
  "waterdragons",
  "watermoccasin",
  "waterstrider",
  "waterthrush",
  "wattlebird",
  "watussi",
  "waxwing",
  "weasel",
  "weaverbird",
  "weevil",
  "westafricanantelope",
  "whale",
  "whapuku",
  "whelp",
  "whimbrel",
  "whippet",
  "whippoorwill",
  "whitebeakeddolphin",
  "whiteeye",
  "whitepelican",
  "whiterhino",
  "whitetaileddeer",
  "whitetippedreefshark",
  "whooper",
  "whoopingcrane",
  "widgeon",
  "widowspider",
  "wildcat",
  "wildebeast",
  "wildebeest",
  "willet",
  "wireworm",
  "wisent",
  "wobbegongshark",
  "wolf",
  "wolfspider",
  "wolverine",
  "wombat",
  "woodborer",
  "woodchuck",
  "woodcock",
  "woodnymphbutterfly",
  "woodpecker",
  "woodstorks",
  "woollybearcaterpillar",
  "worm",
  "wrasse",
  "wreckfish",
  "wren",
  "wrenchbird",
  "wryneck",
  "wuerhosaurus",
  "wyvern",
  "xanclomys",
  "xanthareel",
  "xantus",
  "xantusmurrelet",
  "xeme",
  "xenarthra",
  "xenoposeidon",
  "xenops",
  "xenopterygii",
  "xenopus",
  "xenotarsosaurus",
  "xenurine",
  "xenurusunicinctus",
  "xerus",
  "xiaosaurus",
  "xinjiangovenator",
  "xiphias",
  "xiphiasgladius",
  "xiphosuran",
  "xoloitzcuintli",
  "xoni",
  "xrayfish",
  "xraytetra",
  "xuanhanosaurus",
  "xuanhuaceratops",
  "xuanhuasaurus",
  "yaffle",
  "yak",
  "yapok",
  "yardant",
  "yearling",
  "yellowbelliedmarmot",
  "yellowbellylizard",
  "yellowhammer",
  "yellowjacket",
  "yellowlegs",
  "yellowthroat",
  "yellowwhitebutterfly",
  "yeti",
  "ynambu",
  "yorkshireterrier",
  "yosemitetoad",
  "yucker",
  "zander",
  "zanzibardaygecko",
  "zebra",
  "zebradove",
  "zebrafinch",
  "zebrafish",
  "zebralongwingbutterfly",
  "zebraswallowtailbutterfly",
  "zebratailedlizard",
  "zebu",
  "zenaida",
  "zeren",
  "zethusspinipes",
  "zethuswasp",
  "zigzagsalamander",
  "zonetailedpigeon",
  "zooplankton",
  "zopilote",
  "zorilla"
]

},{}],6:[function(require,module,exports){
function groupByFirstLetter(wordCollection) {
  return wordCollection.reduce((result, word) => {
    const firstLetter = word.charAt(0)
    if (!(firstLetter in result)) {
      result[firstLetter] = []
    }
    result[firstLetter].push(word)
    return result
  }, {})
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function pickRandomly(wordCollection) {
  return wordCollection[Math.floor(Math.random() * wordCollection.length)]
}

function findCommonLetters(lettersA, lettersB) {
  return lettersA.reduce((result, letter) => {
    if (lettersB.indexOf(letter) > -1) {
      result.push(letter)
    }
    return result
  }, [])
}

const animals = groupByFirstLetter(require('./animals.json'))
const adjectives = groupByFirstLetter(require('./adjectives.json'))

const possibleLetters = findCommonLetters(
  Object.keys(adjectives),
  Object.keys(animals)
)

function findRandomAdjective(letter) {
  return pickRandomly(adjectives[letter])
}

function findRandomAnimalName(letter) {
  return pickRandomly(animals[letter]).split(' ').join('-')
}

function generateRandomAnimalName() {
  const letter = pickRandomly(possibleLetters)
  const adjective = findRandomAdjective(letter)
  const animal = findRandomAnimalName(letter)
  return `${capitalizeFirstLetter(adjective)} ${animal}`
}

if (require.main === module) {
  console.log(generateRandomAnimalName())
}

module.exports = generateRandomAnimalName

},{"./adjectives.json":4,"./animals.json":5}],7:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("popper.js")):"function"==typeof define&&define.amd?define(["popper.js"],e):(t=t||self).tippy=e(t.Popper)}(this,function(t){"use strict";t=t&&t.hasOwnProperty("default")?t.default:t;function e(){return(e=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var a=arguments[e];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(t[r]=a[r])}return t}).apply(this,arguments)}var a="undefined"!=typeof window,r=a&&navigator.userAgent,n=/MSIE |Trident\//.test(r),i=/UCBrowser\//.test(r),p=a&&/iPhone|iPad|iPod/.test(navigator.platform)&&!window.MSStream,o={a11y:!0,allowHTML:!0,animateFill:!0,animation:"shift-away",appendTo:function(){return document.body},aria:"describedby",arrow:!1,arrowType:"sharp",boundary:"scrollParent",content:"",delay:[0,20],distance:10,duration:[325,275],flip:!0,flipBehavior:"flip",flipOnUpdate:!1,followCursor:!1,hideOnClick:!0,ignoreAttributes:!1,inertia:!1,interactive:!1,interactiveBorder:2,interactiveDebounce:0,lazy:!0,maxWidth:350,multiple:!1,offset:0,onHidden:function(){},onHide:function(){},onMount:function(){},onShow:function(){},onShown:function(){},placement:"top",popperOptions:{},role:"tooltip",showOnInit:!1,size:"regular",sticky:!1,target:"",theme:"dark",touch:!0,touchHold:!1,trigger:"mouseenter focus",updateDuration:0,wait:null,zIndex:9999},s=["arrow","arrowType","boundary","distance","flip","flipBehavior","flipOnUpdate","offset","placement","popperOptions"],l={POPPER:".tippy-popper",TOOLTIP:".tippy-tooltip",CONTENT:".tippy-content",BACKDROP:".tippy-backdrop",ARROW:".tippy-arrow",ROUND_ARROW:".tippy-roundarrow"},c=a?Element.prototype:{},d=c.matches||c.matchesSelector||c.webkitMatchesSelector||c.mozMatchesSelector||c.msMatchesSelector;function f(t){return[].slice.call(t)}function m(t,e){return(c.closest||function(t){for(var e=this;e;){if(d.call(e,t))return e;e=e.parentElement}}).call(t,e)}function u(t,e){for(;t;){if(e(t))return t;t=t.parentElement}}function b(t,e){return{}.hasOwnProperty.call(t,e)}function y(t,e,a){if(Array.isArray(t)){var r=t[e];return null==r?a:r}return t}function v(t,e){var a;return function(){var r=this,n=arguments;clearTimeout(a),a=setTimeout(function(){return t.apply(r,n)},e)}}function h(t,e){return t&&t.modifiers&&t.modifiers[e]}function x(t,e){return t.indexOf(e)>-1}function w(t){return!!t&&t.isVirtual||t instanceof Element}function g(t,e){return"function"==typeof t?t.apply(null,e):t}function k(t,e){t.filter(function(t){return"flip"===t.name})[0].enabled=e}function E(){return document.createElement("div")}function A(t,e){t.innerHTML=e instanceof Element?e.innerHTML:e}function C(t,e){e.content instanceof Element?(A(t,""),t.appendChild(e.content)):t[e.allowHTML?"innerHTML":"textContent"]=e.content}function O(t){return{tooltip:t.querySelector(l.TOOLTIP),backdrop:t.querySelector(l.BACKDROP),content:t.querySelector(l.CONTENT),arrow:t.querySelector(l.ARROW)||t.querySelector(l.ROUND_ARROW)}}function X(t){t.setAttribute("data-inertia","")}function Y(t){var e=E();return"round"===t?(e.className="tippy-roundarrow",A(e,'<svg viewBox="0 0 24 8" xmlns="http://www.w3.org/2000/svg"><path d="M3 8s2.021-.015 5.253-4.218C9.584 2.051 10.797 1.007 12 1c1.203-.007 2.416 1.035 3.761 2.782C19.012 8.005 21 8 21 8H3z"/></svg>')):e.className="tippy-arrow",e}function L(){var t=E();return t.className="tippy-backdrop",t.setAttribute("data-state","hidden"),t}function T(t,e){t.setAttribute("tabindex","-1"),e.setAttribute("data-interactive","")}function I(t,e){t.forEach(function(t){t&&(t.style.transitionDuration="".concat(e,"ms"))})}function S(t,e,a){var r=i&&void 0!==document.body.style.WebkitTransition?"webkitTransitionEnd":"transitionend";t[e+"EventListener"](r,a)}function P(t){var e=t.getAttribute("x-placement");return e?e.split("-")[0]:""}function z(t,e){t.forEach(function(t){t&&t.setAttribute("data-state",e)})}function H(t,e,a){a.split(" ").forEach(function(a){t.classList[e](a+"-theme")})}function M(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.checkHideOnClick,a=t.exclude,r=t.duration;f(document.querySelectorAll(l.POPPER)).forEach(function(t){var n=t._tippy;!n||e&&!0!==n.props.hideOnClick||a&&t===a.popper||n.hide(r)})}var _={passive:!0},D=3,N=!1;function R(){N||(N=!0,p&&document.body.classList.add("tippy-iOS"),window.performance&&document.addEventListener("mousemove",U))}var V=0;function U(){var t=performance.now();t-V<20&&(N=!1,document.removeEventListener("mousemove",U),p||document.body.classList.remove("tippy-iOS")),V=t}function W(t){var e=t.target;if(!(e instanceof Element))return M();var a=m(e,l.POPPER);if(!(a&&a._tippy&&a._tippy.props.interactive)){var r=u(e,function(t){return t._tippy&&t._tippy.reference===t});if(r){var n=r._tippy,i=x(n.props.trigger,"click");if(N||i)return M({exclude:n,checkHideOnClick:!0});if(!0!==n.props.hideOnClick||i)return;n.clearDelayTimeouts()}M({checkHideOnClick:!0})}}function B(){var t=document.activeElement;t&&t.blur&&t._tippy&&t.blur()}var q=Object.keys(o);function j(t,a){var r=e({},a,{content:g(a.content,[t])},a.ignoreAttributes?{}:function(t){return q.reduce(function(e,a){var r=(t.getAttribute("data-tippy-".concat(a))||"").trim();if(!r)return e;if("content"===a)e[a]=r;else try{e[a]=JSON.parse(r)}catch(t){e[a]=r}return e},{})}(t));return(r.arrow||i)&&(r.animateFill=!1),r}function F(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=arguments.length>1?arguments[1]:void 0;Object.keys(t).forEach(function(t){if(!b(e,t))throw new Error("[tippy]: `".concat(t,"` is not a valid option"))})}var K=1;function J(a,r){var i=j(a,r);if(!i.multiple&&a._tippy)return null;var p={},c=null,w=0,A=0,M=!1,R=function(){},V=[],U=i.interactiveDebounce>0?v(nt,i.interactiveDebounce):nt,W=null,B=K++,q=function(t,e){var a=E();a.className="tippy-popper",a.id="tippy-".concat(t),a.style.zIndex=e.zIndex,e.role&&a.setAttribute("role",e.role);var r=E();r.className="tippy-tooltip",r.style.maxWidth=e.maxWidth+("number"==typeof e.maxWidth?"px":""),r.setAttribute("data-size",e.size),r.setAttribute("data-animation",e.animation),r.setAttribute("data-state","hidden"),H(r,"add",e.theme);var n=E();return n.className="tippy-content",n.setAttribute("data-state","hidden"),e.interactive&&T(a,r),e.arrow&&r.appendChild(Y(e.arrowType)),e.animateFill&&(r.appendChild(L()),r.setAttribute("data-animatefill","")),e.inertia&&X(r),C(n,e),r.appendChild(n),a.appendChild(r),a}(B,i);q.addEventListener("mouseenter",function(t){Q.props.interactive&&Q.state.isVisible&&"mouseenter"===p.type&&$(t)}),q.addEventListener("mouseleave",function(){Q.props.interactive&&"mouseenter"===p.type&&document.addEventListener("mousemove",U)});var G,Q={id:B,reference:a,popper:q,popperChildren:O(q),popperInstance:null,props:i,state:{isEnabled:!0,isVisible:!1,isDestroyed:!1,isMounted:!1,isShown:!1},clearDelayTimeouts:vt,set:ht,setContent:function(t){ht({content:t})},show:xt,hide:wt,enable:function(){Q.state.isEnabled=!0},disable:function(){Q.state.isEnabled=!1},destroy:gt};return ut(),i.lazy||(ct(),Q.popperInstance.disableEventListeners()),i.showOnInit&&$(),i.a11y&&!i.target&&((G=a)instanceof Element&&(!d.call(G,"a[href],area[href],button,details,input,textarea,select,iframe,[tabindex]")||G.hasAttribute("disabled")))&&a.setAttribute("tabindex","0"),a._tippy=Q,q._tippy=Q,Q;function Z(t){var e=c=t,a=e.clientX,r=e.clientY;if(Q.popperInstance){var n=P(Q.popper),i=Q.popperChildren.arrow?D+16:D,p=x(["top","bottom"],n),o=x(["left","right"],n),s=p?Math.max(i,a):a,l=o?Math.max(i,r):r;p&&s>i&&(s=Math.min(a,window.innerWidth-i)),o&&l>i&&(l=Math.min(r,window.innerHeight-i));var d=Q.reference.getBoundingClientRect(),f=Q.props.followCursor,m="horizontal"===f,u="vertical"===f;Q.popperInstance.reference={getBoundingClientRect:function(){return{width:0,height:0,top:m?d.top:l,bottom:m?d.bottom:l,left:u?d.left:s,right:u?d.right:s}},clientWidth:0,clientHeight:0},Q.popperInstance.scheduleUpdate(),"initial"===f&&Q.state.isVisible&&et()}}function $(t){if(vt(),!Q.state.isVisible){if(Q.props.target)return function(t){var a=m(t.target,Q.props.target);a&&!a._tippy&&(J(a,e({},Q.props,{content:g(r.content,[a]),appendTo:r.appendTo,target:"",showOnInit:!0})),$(t))}(t);if(M=!0,Q.props.wait)return Q.props.wait(Q,t);dt()&&!Q.state.isMounted&&document.addEventListener("mousemove",Z);var a=y(Q.props.delay,0,o.delay);a?w=setTimeout(function(){xt()},a):xt()}}function tt(){if(vt(),!Q.state.isVisible)return et();M=!1;var t=y(Q.props.delay,1,o.delay);t?A=setTimeout(function(){Q.state.isVisible&&wt()},t):wt()}function et(){document.removeEventListener("mousemove",Z),c=null}function at(){document.body.removeEventListener("mouseleave",tt),document.removeEventListener("mousemove",U)}function rt(t){Q.state.isEnabled&&!lt(t)&&(Q.state.isVisible||(p=t,N&&x(t.type,"mouse")&&(c=t)),"click"===t.type&&!1!==Q.props.hideOnClick&&Q.state.isVisible?tt():$(t))}function nt(t){var e=u(t.target,function(t){return t._tippy}),a=m(t.target,l.POPPER)===Q.popper,r=e===Q.reference;a||r||function(t,e,a,r){if(!t)return!0;var n=a.clientX,i=a.clientY,p=r.interactiveBorder,o=r.distance,s=e.top-i>("top"===t?p+o:p),l=i-e.bottom>("bottom"===t?p+o:p),c=e.left-n>("left"===t?p+o:p),d=n-e.right>("right"===t?p+o:p);return s||l||c||d}(P(Q.popper),Q.popper.getBoundingClientRect(),t,Q.props)&&(at(),tt())}function it(t){if(!lt(t))return Q.props.interactive?(document.body.addEventListener("mouseleave",tt),void document.addEventListener("mousemove",U)):void tt()}function pt(t){t.target===Q.reference&&(Q.props.interactive&&t.relatedTarget&&Q.popper.contains(t.relatedTarget)||tt())}function ot(t){m(t.target,Q.props.target)&&$(t)}function st(t){m(t.target,Q.props.target)&&tt()}function lt(t){var e="ontouchstart"in window,a=x(t.type,"touch"),r=Q.props.touchHold;return e&&N&&r&&!a||N&&!r&&a}function ct(){var a=Q.props.popperOptions,r=Q.popperChildren,n=r.tooltip,i=r.arrow;Q.popperInstance=new t(Q.reference,Q.popper,e({placement:Q.props.placement},a,{modifiers:e({},a?a.modifiers:{},{preventOverflow:e({boundariesElement:Q.props.boundary,padding:D},h(a,"preventOverflow")),arrow:e({element:i,enabled:!!i},h(a,"arrow")),flip:e({enabled:Q.props.flip,padding:Q.props.distance+D,behavior:Q.props.flipBehavior},h(a,"flip")),offset:e({offset:Q.props.offset},h(a,"offset"))}),onUpdate:function(t){Q.props.flip&&!Q.props.flipOnUpdate&&(t.flipped&&(Q.popperInstance.options.placement=t.placement),k(Q.popperInstance.modifiers,!1));var e=n.style;e.top="",e.bottom="",e.left="",e.right="",e[P(Q.popper)]=-(Q.props.distance-10)+"px",a.onUpdate&&a.onUpdate(t)}}))}function dt(){return Q.props.followCursor&&!N&&"focus"!==p.type}function ft(t,e){if(0===t)return e();var a=Q.popperChildren.tooltip,r=function t(r){r.target===a&&(S(a,"remove",t),e())};S(a,"remove",R),S(a,"add",r),R=r}function mt(t,e){var a=arguments.length>2&&void 0!==arguments[2]&&arguments[2];Q.reference.addEventListener(t,e,a),V.push({eventType:t,handler:e,options:a})}function ut(){Q.props.touchHold&&!Q.props.target&&(mt("touchstart",rt,_),mt("touchend",it,_)),Q.props.trigger.trim().split(" ").forEach(function(t){if("manual"!==t)if(Q.props.target)switch(t){case"mouseenter":mt("mouseover",ot),mt("mouseout",st);break;case"focus":mt("focusin",ot),mt("focusout",st);break;case"click":mt(t,ot)}else switch(mt(t,rt),t){case"mouseenter":mt("mouseleave",it);break;case"focus":mt(n?"focusout":"blur",pt)}})}function bt(){V.forEach(function(t){var e=t.eventType,a=t.handler,r=t.options;Q.reference.removeEventListener(e,a,r)}),V=[]}function yt(){return[Q.popperChildren.tooltip,Q.popperChildren.backdrop,Q.popperChildren.content]}function vt(){clearTimeout(w),clearTimeout(A)}function ht(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};F(t,o);var a=Q.props,r=j(Q.reference,e({},Q.props,t,{ignoreAttributes:!0}));r.ignoreAttributes=b(t,"ignoreAttributes")?t.ignoreAttributes:a.ignoreAttributes,Q.props=r,(b(t,"trigger")||b(t,"touchHold"))&&(bt(),ut()),b(t,"interactiveDebounce")&&(at(),U=v(nt,t.interactiveDebounce)),function(t,e,a){var r=O(t),n=r.tooltip,i=r.content,p=r.backdrop,o=r.arrow;t.style.zIndex=a.zIndex,n.setAttribute("data-size",a.size),n.setAttribute("data-animation",a.animation),n.style.maxWidth=a.maxWidth+("number"==typeof a.maxWidth?"px":""),a.role?t.setAttribute("role",a.role):t.removeAttribute("role"),e.content!==a.content&&C(i,a),!e.animateFill&&a.animateFill?(n.appendChild(L()),n.setAttribute("data-animatefill","")):e.animateFill&&!a.animateFill&&(n.removeChild(p),n.removeAttribute("data-animatefill")),!e.arrow&&a.arrow?n.appendChild(Y(a.arrowType)):e.arrow&&!a.arrow&&n.removeChild(o),e.arrow&&a.arrow&&e.arrowType!==a.arrowType&&n.replaceChild(Y(a.arrowType),o),!e.interactive&&a.interactive?T(t,n):e.interactive&&!a.interactive&&function(t,e){t.removeAttribute("tabindex"),e.removeAttribute("data-interactive")}(t,n),!e.inertia&&a.inertia?X(n):e.inertia&&!a.inertia&&function(t){t.removeAttribute("data-inertia")}(n),e.theme!==a.theme&&(H(n,"remove",e.theme),H(n,"add",a.theme))}(Q.popper,a,r),Q.popperChildren=O(Q.popper),Q.popperInstance&&(Q.popperInstance.update(),s.some(function(e){return b(t,e)})&&(Q.popperInstance.destroy(),ct(),Q.state.isVisible||Q.popperInstance.disableEventListeners(),Q.props.followCursor&&c&&Z(c)))}function xt(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:y(Q.props.duration,0,o.duration[0]);if(!Q.state.isDestroyed&&Q.state.isEnabled&&(!N||Q.props.touch))return Q.reference.isVirtual||document.documentElement.contains(Q.reference)?void(Q.reference.hasAttribute("disabled")||!1!==Q.props.onShow(Q)&&(Q.popper.style.visibility="visible",Q.state.isVisible=!0,Q.props.interactive&&Q.reference.classList.add("tippy-active"),I([Q.popper,Q.popperChildren.tooltip,Q.popperChildren.backdrop],0),function(t){var e=!(dt()||"initial"===Q.props.followCursor&&N);Q.popperInstance?(dt()||(Q.popperInstance.scheduleUpdate(),e&&Q.popperInstance.enableEventListeners()),k(Q.popperInstance.modifiers,Q.props.flip)):(ct(),e||Q.popperInstance.disableEventListeners()),Q.popperInstance.reference=Q.reference;var a=Q.popperChildren.arrow;if(dt()){a&&(a.style.margin="0");var r=y(Q.props.delay,0,o.delay);p.type&&Z(r&&c?c:p)}else a&&(a.style.margin="");!function(t,e){var a=t.popper,r=t.options,n=r.onCreate,i=r.onUpdate;r.onCreate=r.onUpdate=function(t){!function(t){t.offsetHeight}(a),e(),i(t),r.onCreate=n,r.onUpdate=i}}(Q.popperInstance,t);var n=Q.props.appendTo;(W="parent"===n?Q.reference.parentNode:g(n,[Q.reference])).contains(Q.popper)||(W.appendChild(Q.popper),Q.props.onMount(Q),Q.state.isMounted=!0)}(function(){Q.state.isVisible&&(dt()||Q.popperInstance.update(),N&&"initial"===Q.props.followCursor&&Z(c),I([Q.popper],i.updateDuration),I(yt(),t),Q.popperChildren.backdrop&&(Q.popperChildren.content.style.transitionDelay=Math.round(t/12)+"ms"),Q.props.sticky&&(I([Q.popper],n?0:Q.props.updateDuration),function t(){Q.popperInstance&&Q.popperInstance.scheduleUpdate(),Q.state.isMounted?requestAnimationFrame(t):I([Q.popper],0)}()),z(yt(),"visible"),function(t,e){ft(t,e)}(t,function(){Q.popperChildren.tooltip.classList.add("tippy-notransition"),Q.props.aria&&Q.reference.setAttribute("aria-".concat(Q.props.aria),Q.popper.id),Q.props.onShown(Q),Q.state.isShown=!0}))}))):gt()}function wt(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:y(Q.props.duration,1,o.duration[1]);!Q.state.isDestroyed&&Q.state.isEnabled&&!1!==Q.props.onHide(Q)&&(Q.popperChildren.tooltip.classList.remove("tippy-notransition"),Q.props.interactive&&Q.reference.classList.remove("tippy-active"),Q.popper.style.visibility="hidden",Q.state.isVisible=!1,Q.state.isShown=!1,I(yt(),t),z(yt(),"hidden"),function(t,e){ft(t,function(){!Q.state.isVisible&&W&&W.contains(Q.popper)&&e()})}(t,function(){M||et(),Q.props.aria&&Q.reference.removeAttribute("aria-".concat(Q.props.aria)),Q.popperInstance.disableEventListeners(),Q.popperInstance.options.placement=Q.props.placement,W.removeChild(Q.popper),Q.props.onHidden(Q),Q.state.isMounted=!1}))}function gt(t){Q.state.isDestroyed||(Q.state.isMounted&&wt(0),bt(),delete Q.reference._tippy,Q.props.target&&t&&f(Q.reference.querySelectorAll(Q.props.target)).forEach(function(t){t._tippy&&t._tippy.destroy()}),Q.popperInstance&&Q.popperInstance.destroy(),Q.state.isDestroyed=!0)}}var G=!1;function Q(t,a){F(a,o),G||(document.addEventListener("click",W,!0),document.addEventListener("touchstart",R,_),window.addEventListener("blur",B),G=!0);var r,n=e({},o,a);r=t,"[object Object]"!=={}.toString.call(r)||r.addEventListener||function(t){var e={isVirtual:!0,attributes:t.attributes||{},setAttribute:function(e,a){t.attributes[e]=a},getAttribute:function(e){return t.attributes[e]},removeAttribute:function(e){delete t.attributes[e]},hasAttribute:function(e){return e in t.attributes},addEventListener:function(){},removeEventListener:function(){},classList:{classNames:{},add:function(e){t.classList.classNames[e]=!0},remove:function(e){delete t.classList.classNames[e]},contains:function(e){return e in t.classList.classNames}}};for(var a in e)t[a]=e[a]}(t);var i=function(t){if(w(t))return[t];if(t instanceof NodeList)return f(t);if(Array.isArray(t))return t;try{return f(document.querySelectorAll(t))}catch(t){return[]}}(t).reduce(function(t,e){var a=e&&J(e,n);return a&&t.push(a),t},[]);return w(t)?i[0]:i}return Q.version="4.0.3",Q.defaults=o,Q.setDefaults=function(t){Object.keys(t).forEach(function(e){o[e]=t[e]})},Q.hideAll=M,Q.group=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=e.delay,r=void 0===a?t[0].props.delay:a,n=e.duration,i=void 0===n?0:n,p=!1;function o(t){p=t,d()}function s(e){e._originalProps.onShow(e),t.forEach(function(t){t.set({duration:i}),t.hide()}),o(!0)}function l(t){t._originalProps.onHide(t),o(!1)}function c(t){t._originalProps.onShown(t),t.set({duration:t._originalProps.duration})}function d(){t.forEach(function(t){t.set({onShow:s,onShown:c,onHide:l,delay:p?[0,Array.isArray(r)?r[1]:r]:r,duration:p?i:t._originalProps.duration})})}t.forEach(function(t){t._originalProps={duration:t.props.duration,onHide:t.props.onHide,onShow:t.props.onShow,onShown:t.props.onShown}}),d()},a&&setTimeout(function(){f(document.querySelectorAll("[data-tippy]")).forEach(function(t){var e=t.getAttribute("data-tippy");e&&Q(t,{content:e})})}),function(t){if(a){var e=document.createElement("style");e.type="text/css",e.textContent=t;var r=document.head,n=r.firstChild;n?r.insertBefore(e,n):r.appendChild(e)}}('.tippy-iOS{cursor:pointer!important}.tippy-notransition{transition:none}.tippy-popper{transition-timing-function:cubic-bezier(.165,.84,.44,1);max-width:calc(100% - 10px);pointer-events:none;outline:0}.tippy-popper[x-placement^=top] .tippy-backdrop{border-radius:40% 40% 0 0}.tippy-popper[x-placement^=top] .tippy-roundarrow{bottom:-8px;-webkit-transform-origin:50% 0;transform-origin:50% 0}.tippy-popper[x-placement^=top] .tippy-roundarrow svg{position:absolute;left:0;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.tippy-popper[x-placement^=top] .tippy-arrow{border-top:8px solid #333;border-right:8px solid transparent;border-left:8px solid transparent;bottom:-7px;margin:0 6px;-webkit-transform-origin:50% 0;transform-origin:50% 0}.tippy-popper[x-placement^=top] .tippy-backdrop{-webkit-transform-origin:0 25%;transform-origin:0 25%}.tippy-popper[x-placement^=top] .tippy-backdrop[data-state=visible]{-webkit-transform:scale(1) translate(-50%,-55%);transform:scale(1) translate(-50%,-55%)}.tippy-popper[x-placement^=top] .tippy-backdrop[data-state=hidden]{-webkit-transform:scale(.2) translate(-50%,-45%);transform:scale(.2) translate(-50%,-45%);opacity:0}.tippy-popper[x-placement^=top] [data-animation=shift-toward][data-state=visible]{-webkit-transform:translateY(-10px);transform:translateY(-10px)}.tippy-popper[x-placement^=top] [data-animation=shift-toward][data-state=hidden]{opacity:0;-webkit-transform:translateY(-20px);transform:translateY(-20px)}.tippy-popper[x-placement^=top] [data-animation=perspective]{-webkit-transform-origin:bottom;transform-origin:bottom}.tippy-popper[x-placement^=top] [data-animation=perspective][data-state=visible]{-webkit-transform:perspective(700px) translateY(-10px) rotateX(0);transform:perspective(700px) translateY(-10px) rotateX(0)}.tippy-popper[x-placement^=top] [data-animation=perspective][data-state=hidden]{opacity:0;-webkit-transform:perspective(700px) translateY(0) rotateX(60deg);transform:perspective(700px) translateY(0) rotateX(60deg)}.tippy-popper[x-placement^=top] [data-animation=fade][data-state=visible]{-webkit-transform:translateY(-10px);transform:translateY(-10px)}.tippy-popper[x-placement^=top] [data-animation=fade][data-state=hidden]{opacity:0;-webkit-transform:translateY(-10px);transform:translateY(-10px)}.tippy-popper[x-placement^=top] [data-animation=shift-away][data-state=visible]{-webkit-transform:translateY(-10px);transform:translateY(-10px)}.tippy-popper[x-placement^=top] [data-animation=shift-away][data-state=hidden]{opacity:0;-webkit-transform:translateY(0);transform:translateY(0)}.tippy-popper[x-placement^=top] [data-animation=scale]{-webkit-transform-origin:bottom;transform-origin:bottom}.tippy-popper[x-placement^=top] [data-animation=scale][data-state=visible]{-webkit-transform:translateY(-10px) scale(1);transform:translateY(-10px) scale(1)}.tippy-popper[x-placement^=top] [data-animation=scale][data-state=hidden]{opacity:0;-webkit-transform:translateY(-10px) scale(.5);transform:translateY(-10px) scale(.5)}.tippy-popper[x-placement^=bottom] .tippy-backdrop{border-radius:0 0 30% 30%}.tippy-popper[x-placement^=bottom] .tippy-roundarrow{top:-8px;-webkit-transform-origin:50% 100%;transform-origin:50% 100%}.tippy-popper[x-placement^=bottom] .tippy-roundarrow svg{position:absolute;left:0;-webkit-transform:rotate(0);transform:rotate(0)}.tippy-popper[x-placement^=bottom] .tippy-arrow{border-bottom:8px solid #333;border-right:8px solid transparent;border-left:8px solid transparent;top:-7px;margin:0 6px;-webkit-transform-origin:50% 100%;transform-origin:50% 100%}.tippy-popper[x-placement^=bottom] .tippy-backdrop{-webkit-transform-origin:0 -50%;transform-origin:0 -50%}.tippy-popper[x-placement^=bottom] .tippy-backdrop[data-state=visible]{-webkit-transform:scale(1) translate(-50%,-45%);transform:scale(1) translate(-50%,-45%)}.tippy-popper[x-placement^=bottom] .tippy-backdrop[data-state=hidden]{-webkit-transform:scale(.2) translate(-50%);transform:scale(.2) translate(-50%);opacity:0}.tippy-popper[x-placement^=bottom] [data-animation=shift-toward][data-state=visible]{-webkit-transform:translateY(10px);transform:translateY(10px)}.tippy-popper[x-placement^=bottom] [data-animation=shift-toward][data-state=hidden]{opacity:0;-webkit-transform:translateY(20px);transform:translateY(20px)}.tippy-popper[x-placement^=bottom] [data-animation=perspective]{-webkit-transform-origin:top;transform-origin:top}.tippy-popper[x-placement^=bottom] [data-animation=perspective][data-state=visible]{-webkit-transform:perspective(700px) translateY(10px) rotateX(0);transform:perspective(700px) translateY(10px) rotateX(0)}.tippy-popper[x-placement^=bottom] [data-animation=perspective][data-state=hidden]{opacity:0;-webkit-transform:perspective(700px) translateY(0) rotateX(-60deg);transform:perspective(700px) translateY(0) rotateX(-60deg)}.tippy-popper[x-placement^=bottom] [data-animation=fade][data-state=visible]{-webkit-transform:translateY(10px);transform:translateY(10px)}.tippy-popper[x-placement^=bottom] [data-animation=fade][data-state=hidden]{opacity:0;-webkit-transform:translateY(10px);transform:translateY(10px)}.tippy-popper[x-placement^=bottom] [data-animation=shift-away][data-state=visible]{-webkit-transform:translateY(10px);transform:translateY(10px)}.tippy-popper[x-placement^=bottom] [data-animation=shift-away][data-state=hidden]{opacity:0;-webkit-transform:translateY(0);transform:translateY(0)}.tippy-popper[x-placement^=bottom] [data-animation=scale]{-webkit-transform-origin:top;transform-origin:top}.tippy-popper[x-placement^=bottom] [data-animation=scale][data-state=visible]{-webkit-transform:translateY(10px) scale(1);transform:translateY(10px) scale(1)}.tippy-popper[x-placement^=bottom] [data-animation=scale][data-state=hidden]{opacity:0;-webkit-transform:translateY(10px) scale(.5);transform:translateY(10px) scale(.5)}.tippy-popper[x-placement^=left] .tippy-backdrop{border-radius:50% 0 0 50%}.tippy-popper[x-placement^=left] .tippy-roundarrow{right:-16px;-webkit-transform-origin:33.33333333% 50%;transform-origin:33.33333333% 50%}.tippy-popper[x-placement^=left] .tippy-roundarrow svg{position:absolute;left:0;-webkit-transform:rotate(90deg);transform:rotate(90deg)}.tippy-popper[x-placement^=left] .tippy-arrow{border-left:8px solid #333;border-top:8px solid transparent;border-bottom:8px solid transparent;right:-7px;margin:3px 0;-webkit-transform-origin:0 50%;transform-origin:0 50%}.tippy-popper[x-placement^=left] .tippy-backdrop{-webkit-transform-origin:50% 0;transform-origin:50% 0}.tippy-popper[x-placement^=left] .tippy-backdrop[data-state=visible]{-webkit-transform:scale(1) translate(-50%,-50%);transform:scale(1) translate(-50%,-50%)}.tippy-popper[x-placement^=left] .tippy-backdrop[data-state=hidden]{-webkit-transform:scale(.2) translate(-75%,-50%);transform:scale(.2) translate(-75%,-50%);opacity:0}.tippy-popper[x-placement^=left] [data-animation=shift-toward][data-state=visible]{-webkit-transform:translateX(-10px);transform:translateX(-10px)}.tippy-popper[x-placement^=left] [data-animation=shift-toward][data-state=hidden]{opacity:0;-webkit-transform:translateX(-20px);transform:translateX(-20px)}.tippy-popper[x-placement^=left] [data-animation=perspective]{-webkit-transform-origin:right;transform-origin:right}.tippy-popper[x-placement^=left] [data-animation=perspective][data-state=visible]{-webkit-transform:perspective(700px) translateX(-10px) rotateY(0);transform:perspective(700px) translateX(-10px) rotateY(0)}.tippy-popper[x-placement^=left] [data-animation=perspective][data-state=hidden]{opacity:0;-webkit-transform:perspective(700px) translateX(0) rotateY(-60deg);transform:perspective(700px) translateX(0) rotateY(-60deg)}.tippy-popper[x-placement^=left] [data-animation=fade][data-state=visible]{-webkit-transform:translateX(-10px);transform:translateX(-10px)}.tippy-popper[x-placement^=left] [data-animation=fade][data-state=hidden]{opacity:0;-webkit-transform:translateX(-10px);transform:translateX(-10px)}.tippy-popper[x-placement^=left] [data-animation=shift-away][data-state=visible]{-webkit-transform:translateX(-10px);transform:translateX(-10px)}.tippy-popper[x-placement^=left] [data-animation=shift-away][data-state=hidden]{opacity:0;-webkit-transform:translateX(0);transform:translateX(0)}.tippy-popper[x-placement^=left] [data-animation=scale]{-webkit-transform-origin:right;transform-origin:right}.tippy-popper[x-placement^=left] [data-animation=scale][data-state=visible]{-webkit-transform:translateX(-10px) scale(1);transform:translateX(-10px) scale(1)}.tippy-popper[x-placement^=left] [data-animation=scale][data-state=hidden]{opacity:0;-webkit-transform:translateX(-10px) scale(.5);transform:translateX(-10px) scale(.5)}.tippy-popper[x-placement^=right] .tippy-backdrop{border-radius:0 50% 50% 0}.tippy-popper[x-placement^=right] .tippy-roundarrow{left:-16px;-webkit-transform-origin:66.66666666% 50%;transform-origin:66.66666666% 50%}.tippy-popper[x-placement^=right] .tippy-roundarrow svg{position:absolute;left:0;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.tippy-popper[x-placement^=right] .tippy-arrow{border-right:8px solid #333;border-top:8px solid transparent;border-bottom:8px solid transparent;left:-7px;margin:3px 0;-webkit-transform-origin:100% 50%;transform-origin:100% 50%}.tippy-popper[x-placement^=right] .tippy-backdrop{-webkit-transform-origin:-50% 0;transform-origin:-50% 0}.tippy-popper[x-placement^=right] .tippy-backdrop[data-state=visible]{-webkit-transform:scale(1) translate(-50%,-50%);transform:scale(1) translate(-50%,-50%)}.tippy-popper[x-placement^=right] .tippy-backdrop[data-state=hidden]{-webkit-transform:scale(.2) translate(-25%,-50%);transform:scale(.2) translate(-25%,-50%);opacity:0}.tippy-popper[x-placement^=right] [data-animation=shift-toward][data-state=visible]{-webkit-transform:translateX(10px);transform:translateX(10px)}.tippy-popper[x-placement^=right] [data-animation=shift-toward][data-state=hidden]{opacity:0;-webkit-transform:translateX(20px);transform:translateX(20px)}.tippy-popper[x-placement^=right] [data-animation=perspective]{-webkit-transform-origin:left;transform-origin:left}.tippy-popper[x-placement^=right] [data-animation=perspective][data-state=visible]{-webkit-transform:perspective(700px) translateX(10px) rotateY(0);transform:perspective(700px) translateX(10px) rotateY(0)}.tippy-popper[x-placement^=right] [data-animation=perspective][data-state=hidden]{opacity:0;-webkit-transform:perspective(700px) translateX(0) rotateY(60deg);transform:perspective(700px) translateX(0) rotateY(60deg)}.tippy-popper[x-placement^=right] [data-animation=fade][data-state=visible]{-webkit-transform:translateX(10px);transform:translateX(10px)}.tippy-popper[x-placement^=right] [data-animation=fade][data-state=hidden]{opacity:0;-webkit-transform:translateX(10px);transform:translateX(10px)}.tippy-popper[x-placement^=right] [data-animation=shift-away][data-state=visible]{-webkit-transform:translateX(10px);transform:translateX(10px)}.tippy-popper[x-placement^=right] [data-animation=shift-away][data-state=hidden]{opacity:0;-webkit-transform:translateX(0);transform:translateX(0)}.tippy-popper[x-placement^=right] [data-animation=scale]{-webkit-transform-origin:left;transform-origin:left}.tippy-popper[x-placement^=right] [data-animation=scale][data-state=visible]{-webkit-transform:translateX(10px) scale(1);transform:translateX(10px) scale(1)}.tippy-popper[x-placement^=right] [data-animation=scale][data-state=hidden]{opacity:0;-webkit-transform:translateX(10px) scale(.5);transform:translateX(10px) scale(.5)}.tippy-tooltip{position:relative;color:#fff;border-radius:4px;font-size:.9rem;padding:.3rem .6rem;line-height:1.4;text-align:center;will-change:transform;background-color:#333}.tippy-tooltip[data-size=small]{padding:.2rem .4rem;font-size:.75rem}.tippy-tooltip[data-size=large]{padding:.4rem .8rem;font-size:1rem}.tippy-tooltip[data-animatefill]{overflow:hidden;background-color:transparent}.tippy-tooltip[data-interactive],.tippy-tooltip[data-interactive] path{pointer-events:auto}.tippy-tooltip[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-tooltip[data-inertia][data-state=hidden]{transition-timing-function:ease}.tippy-arrow,.tippy-roundarrow{position:absolute;width:0;height:0}.tippy-roundarrow{width:24px;height:8px;fill:#333;pointer-events:none}.tippy-backdrop{position:absolute;will-change:transform;background-color:#333;border-radius:50%;width:calc(110% + 2rem);left:50%;top:50%;z-index:-1;transition:all cubic-bezier(.46,.1,.52,.98);-webkit-backface-visibility:hidden;backface-visibility:hidden}.tippy-backdrop:after{content:"";float:left;padding-top:100%}.tippy-backdrop+.tippy-content{transition-property:opacity;will-change:opacity}.tippy-backdrop+.tippy-content[data-state=visible]{opacity:1}.tippy-backdrop+.tippy-content[data-state=hidden]{opacity:0}'),Q});


},{"popper.js":3}],8:[function(require,module,exports){
'use strict';

var getYouTubeID = require('get-youtube-id');

module.exports = function(url){
  var id = getYouTubeID(url);

  if(!id && url.length === 11){
    id = url
  }

  return {
    'default': {
      url: 'http://img.youtube.com/vi/' + id + '/default.jpg',
      width: 120,
      height: 90
    },
    medium: {
      url: 'http://img.youtube.com/vi/' + id + '/mqdefault.jpg',
      width: 320,
      height: 180
    },
    high: {
      url: 'http://img.youtube.com/vi/' + id + '/hqdefault.jpg',
      width: 480,
      height: 360
    },
  }
};

},{"get-youtube-id":9}],9:[function(require,module,exports){

(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.getYouTubeID = factory();
  }
}(this, function (exports) {

  return function (url) {
    if (/youtu\.?be/.test(url)) {

      // Look first for known patterns
      var i;
      var patterns = [
        /youtu\.be\/([^#\&\?]{11})/,  // youtu.be/<id>
        /\?v=([^#\&\?]{11})/,         // ?v=<id>
        /\&v=([^#\&\?]{11})/,         // &v=<id>
        /embed\/([^#\&\?]{11})/,      // embed/<id>
        /\/v\/([^#\&\?]{11})/         // /v/<id>
      ];

      // If any pattern matches, return the ID
      for (i = 0; i < patterns.length; ++i) {
        if (patterns[i].test(url)) {
          return patterns[i].exec(url)[1];
        }
      }

      // If that fails, break it apart by certain characters and look 
      // for the 11 character key
      var tokens = url.split(/[\/\&\?=#\.\s]/g);
      for (i = 0; i < tokens.length; ++i) {
        if (/^[^#\&\?]{11}$/.test(tokens[i])) {
          return tokens[i];
        }
      }
    }

    return null;
  };

}));

},{}],10:[function(require,module,exports){
/* global window, Audio */

const getYoutubeId = require('get-youtube-id');

const generateRandomAnimalName = require('random-animal-name-generator');
const youtubeThumbnail = require('youtube-thumbnail');
const Cookies = require('js-cookie');

const tippy = require('tippy.js');


const chime = new Audio('chime.wav');
chime.volume = 0.02;


window.socket = io();
const cookieClientName = Cookies.get('clientName');
const cookieClientId = Cookies.get('clientId');
window.clientName = cookieClientName || generateRandomAnimalName();
window.clientId = cookieClientId || Cookies.set('clientId', uuidv4());
window.room = window.location.search.split('?')[1];

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('myParam');

timer_pause = 0;
timer_playing = 1;

window.clientTimer = null;
window.clientTimerStatus = timer_pause;
window.clientTimerSeconds = 0;

window.videoHistory = [];
window.serverPlaylist = [];
window.favedData = [];
window.refreshStatusSpam = false;
window.showAllFavs = false;
window.triggeredEvents = [];


// debug


/*
-1 - unstarted (sin empezar)
0 - ended (terminado)
1 - playing (en reproducción)
2 - paused (en pausa)
3 - buffering (almacenando en búfer)
5 - video cued (video en fila)
*/

const YT_STATUS_UNSTARTED = -1;
const YT_STATUS_ENDED = 0;
const YT_STATUS_PLAYING = 1;
const YT_STATUS_PAUSED = 2;
const YT_STATUS_BUFFERING = 3;
const YT_STATUS_CUED = 5;

window.ytStatus = [];
ytStatus[-1] = 'Paused';
ytStatus[0] = 'Ended';
ytStatus[1] = 'Playing';
ytStatus[2] = 'Paused';
ytStatus[3] = 'Buffering';
ytStatus[4] = 'Unknown';
ytStatus[5] = 'Paused'; // is cued!


if (!cookieClientName) {
  const selectedCookieName = prompt('Please enter your name', window.clientName);
  if (selectedCookieName !== window.clientName) {
    const oldName = window.clientName;
    window.clientName = selectedCookieName;
    Cookies.set('clientName', selectedCookieName);
    socket.emit('changeClientName', {
      clientId: window.clientId,
      clientNewName: selectedCookieName,
      clientName: oldName,
    });
  }
}


$('#clientName').text(window.clientName);

socket.on('playVideo', (videoData) => {
  $('.playVideoData').html(`
    <ul>
        <li>time: ${Math.trunc(videoData.time)}</li>
        <li>playOnly: ${videoData.playOnlyFor || ''}</li>
        <li>playNot: ${videoData.playNotFor || ''}</li>
        <li>mode: ${videoData.mode || ''}</li>
    </ul>
  `);


  const { playOnlyFor, playNotFor, mode } = videoData;

  if (playNotFor && window.clientId === playNotFor) {
    return; // early return!
  }

  let send = false;
  if (playOnlyFor) {
    if (playOnlyFor === window.clientId) {
      send = true;
    }
  } else {
    send = true;
  }

  if (send) {
    if (mode == 'pause') {
      log('Server requested to pause video');
    } else {
      log('Server requested to play video');
    }
    const { videoId, time } = videoData;
    loadVideo(videoId, time, mode);
    $('#addLink').val(`https://www.youtube.com/watch?v=${videoId}&t=${Math.trunc(time)}`);
  }
});


function updateClientsData(clientsData) {
  log("Received a new client list... let's update it");

  const allSameVideo = clientsData.map(x => x.videoId).every((val, i, arr) => val === arr[0]);
  const allSameTime = clientsData.map(x => x.time).every((val, i, arr) => Math.abs(Math.trunc(val) - Math.trunc(arr[0])) < 2);

  clientsData.sort((a, b) => ((a.clientName > b.clientName) ? 1 : ((b.clientName > a.clientName) ? -1 : 0)));

  const clients = clientsData.reduce((old, curr) => {
    const allSameVideoCaption = (!allSameVideo) ? `: ${curr.title}` : '';
    const personalTimeText = (curr.clientId === window.clientId) ? 'personalTime' : '';
    const clock = `[<span id="${personalTimeText}">${secondsToClock(curr.time)}</span>]`;

    const clockText = (!allSameTime) ? clock : '';

    const youText = (curr.clientId === window.clientId) ? '(You) ' : '';
    const youClass = (curr.clientId === window.clientId) ? 'currentUser' : '';

    const statusText = (curr.status !== YT_STATUS_PLAYING) ? `<span class=status status_${curr.status}">[${ytStatus[curr.status]}]</span> - ` : '';

    return `${old}<li class="${youClass}">${statusText}${youText}${curr.clientName}${allSameVideoCaption} ${clockText}</li>`;
  }, '');
  $('#syncMeter').html('');

  if (clientsData.length > 1) {
    $('.clientNameWrapper').hide();

    if (allSameVideo && allSameTime) {
      $('#syncMeter').html('<span class="synced">Synced</span>');
    } else {
      $('#syncMeter').html('<span class="unsynced">Not synced <button class="btn btn-small" onClick="syncVideo()">Sync now</button></span>');
    }

    $('#connectedClients').show();
    $('#connectedTotal').html(`Room: ${window.room} - Connected users (${clientsData.length}):<br>`);
    $('#connectedClients').html(`<ul>${clients}</ul>`);
  } else {
    $('.clientNameWrapper').show();
    $('#connectedTotal').text('No one is here!');
    $('#connectedClients').hide();
  }
}

socket.on('getVideoStatus', (requestedData) => {
  if (window.clientId !== requestedData.clientId) {
    sendVideoStatusToServer({
      ...getStatus(),
      requestedBy: requestedData.clientId,
    }, requestedData.goSync);
  }
});

socket.on('pauseVideo', () => {
  player.pauseVideo();
});

socket.on('continueVideo', () => {
  player.playVideo();
});

socket.on('checkSyncAsk', () => {
  socket.emit('checkSyncGet', getStatus());
});

socket.on('updateClientResults', (data, goSyncVideoClientId) => {
  updateClientsData(data.connectedClients);
  if (data) {
    if (data.favedData) {
      window.favedData = data.favedData;
      changeFavData();
      window.refillFavedData(data.serverPlaylist);
    }
    if (data.serverPlaylist) {
      window.serverPlaylist = data.serverPlaylist;
    }
  }

  refreshList(data.serverPlaylist, $('.serverPlaylist'));
  refreshList(window.favedData, $('.favs'));


  if (goSyncVideoClientId && data.connectedClients.length > 1 && goSyncVideoClientId === window.clientId) {
    const allWerePlaying = data.connectedClients.filter(x => x.status === YT_STATUS_PLAYING).length === data.connectedClients.length - 1;
    const clientsWerePlayingSameVideo = data.connectedClients.filter(x => x.clientId !== window.clientId).map(x => x.videoId).length === data.connectedClients.length - 1;

    if (allWerePlaying && clientsWerePlayingSameVideo) {
      const videoIdWatching = data.connectedClients.filter(x => x.clientId !== window.clientId).map(x => x.videoId)[0];
      const maxTime = Math.max(...data.connectedClients.filter(x => x.clientId !== window.clientId).map(x => x.time));
      window.loadVideo(videoIdWatching, maxTime);
      log('all clients were playing so... sync video');
      // window.syncVideo();
    } else {
      log('At least one client is not playing so.. no sync');
    }
  }
});

socket.on('playlistUpdated', (receivedServerPlaylist, favedData) => {
  console.log('playlist updated!');
  window.favedData = favedData; // update it
  window.refillFavedData(receivedServerPlaylist);
  changeFavData();
  window.serverPlaylist = receivedServerPlaylist;
  refreshList(receivedServerPlaylist, $('.serverPlaylist'));
  refreshList(favedData, $('.favs'));
});

socket.on('newClient', (newClient) => {
  if (newClient.clientId !== window.clientId) {
    chime.play();
  }
});

function sendVideoStatusToServer(videoData, goSync) {
  socket.emit('sendVideoStatusToServer', videoData, goSync);
}

function getVideoUrlData(url) {
  // let videoTest = 'https://www.youtube.com/watch?v=TdBSoy9F9NA&t=2091s';
  const videoUrl = url || $('#addLink').val();
  if (videoUrl) {
    const id = getYoutubeId(videoUrl);
    const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
    return {
      ...getStatus(),
      videoId: id,
      time: +(urlParams.get('t') && urlParams.get('t').replace('s', '')) || 0,
    };
  }
  const status = getStatus();
  $('#addLink').val(status.url);
  return {
    ...status,
    videoId: status.videoId,
    time: status.time,
  };
}


const changeFavData = () => {
  const currentVideo = window.getStatus();
  const favedVideo = window.favedData.find(x => x.videoId === currentVideo.videoId);
  const favedByUser = favedVideo && favedVideo.favedBy && favedVideo.favedBy.find(x => x === window.clientId);
  $('#favStar').removeClass('fas');
  $('#favStar').removeClass('far');
  if (favedByUser) {
    $('#favStar').addClass('fas');
  } else {
    $('#favStar').addClass('far');
  }
};


function refreshList(dataList, $dom, reverse = false) {
  const videoHistoryCopy = (reverse) ? dataList.slice(0).reverse() : dataList.slice(0);


  if (videoHistoryCopy.length) {

    const videoList = videoHistoryCopy.reduce((old, curr, index) => {
      if ($dom.selector === '.favs' && !window.showAllFavs && !curr.favedBy.includes(window.clientId)) {
        return old;
      }

      const favedVideo = window.favedData.find(x => x.videoId === curr.videoId);
      const favedByUser = favedVideo && favedVideo.favedBy && favedVideo.favedBy.find(x => x === window.clientId);
      const favedByUserText = (favedByUser) ? 'fas' : 'far';

      const dequeueVideoEl = ($dom.selector === '.serverPlaylist') ? `<i onClick="event.stopPropagation(); window.dequeueVideoByIndex(${index})" class="fa fa-times"/>` : '';

      const base64title = window.btoa(unescape(encodeURIComponent(curr.title)));
      const favElement = ($dom.selector !== '.localHistory') ? `<i data-tippy-content="Added!" onClick="event.stopPropagation(); window.handleFavVideo('${curr.videoId}', '${curr.url}', '${base64title}', ${curr.duration})" class="${favedByUserText} fa-star"/>` : '';


      const addToPlaylistEl = ($dom.selector !== '.serverPlaylist') ? `<i class="smallButton addToQueueFromPlaylist fa fa-plus" onClick="event.stopPropagation(); window.queueVideoByUrl('${curr.url}')(this)" />` : '';


      return `${old}
      <li videoId="${curr.videoId}" onClick={broadcastVideo("${curr.videoId}",0)}>
        <div ><img class="thumbnail" src="${curr.thumbnail.default.url}"/></div>
        <div class="thumbTextWrapper">
            ${curr.title}<br><span class="duration">${secondsToClock(curr.duration)}</span>
            <span class="videoCommands">${favElement}${dequeueVideoEl}${addToPlaylistEl}</span>
        </div>
      </li>
    `;
    }, '');

    $dom.html(`<ul>${videoList}</ul>`);
    debugger;
    tippy('.smallButton', {
      content: 'Added!',
      trigger: 'click',
      arrow: true,
      arrowType: 'sharp',
      placement: 'bottom',
      theme: 'light',

    });
  } else {
    $dom.html(`<div class="noVideosWrapper">No videos on list</div>`);
  }

}

window.playNextVideo = () => {
  socket.emit('playVideo', { ...status, ...window.serverPlaylist[0] });
};


window.getStatus = function () {
  const videoData = player && player.getVideoData();
  const videoUrl = player.getVideoUrl();
  return {
    clientId: window.clientId,
    clientName: window.clientName,
    videoId: videoData && videoData.video_id || null,
    time: player.getCurrentTime(),
    title: videoData && videoData.title || null,
    status: player.getPlayerState(),
    url: videoUrl,
    thumbnail: youtubeThumbnail(videoUrl),
    duration: player.getDuration(),
    socketId: window.socket.id,
    room: window.room,
  };
};

window.refillFavedData = (videoList) => {
  window.favedData.forEach((favedVideo) => {
    const foundVideo = videoList.find(x => x.videoId === favedVideo.videoId);
    if (foundVideo) {
      favedVideo.thumbnail = foundVideo.thumbnail;
      favedVideo.title = foundVideo.title;
      favedVideo.duration = foundVideo.duration;
      favedVideo.url = foundVideo.url;
    } else {
      favedVideo.thumbnail = youtubeThumbnail(favedVideo.url);
    }
  });
};


window.broadcastVideo = function (videoId = null, time) {
  log('sending broadcast to server');

  const videoData = (videoId) ? { videoId, time: 0 } : getVideoUrlData();
  const status = getStatus();
  if (status && status.videoId === videoData.videoId) {
    // just play at the same second
    videoData.time = status.time;
  }

  if (typeof time === 'number') {
    videoData.time = time;
  }
  socket.emit('playVideo', { ...status, ...videoData });
};

window.queueVideoTest = function () {
  queueVideo(getVideoUrlData('https://youtu.be/h8xbjpArhuw'));
  queueVideo(getVideoUrlData('https://www.youtube.com/watch?v=hWIQe9MAa9g'));
  queueVideo(getVideoUrlData('https://youtu.be/NspYa8GcPCs'));
  queueVideo(getVideoUrlData('https://youtu.be/by1QWQprONg'));
};

window.queueVideoByUrl = url => (context) => {
  debugger;
  const videoData = getVideoUrlData(url);
  window.queueVideo(videoData);
};


window.queueVideo = function (videoData) {
  const data = videoData || getVideoUrlData();
  log('sending video to queue to server');
  data.requestedBy = window.clientId;
  socket.emit('queueVideo', data);
};

window.dequeueVideoByIndex = (index) => {
  const videoData = window.serverPlaylist[index];
  videoData.clientId = window.clientId;
  videoData.clientName = window.clientName;
  window.socket.emit('dequeueVideo', videoData, index);
};

window.syncVideo = function () {
  log("Let's ask server for the updated time!");

  socket.emit('askRunningVideoData', {
    clientName: window.clientName,
    clientId: window.clientId,
    goSync: true,
  });
};

window.checkSync = function () {
  log("Let's ask the server for sync data");
  socket.emit('checkSync', {
    clientName: window.clientName,
  });
};

window.pauseVideo = function () {
  log("Let's send a pause event through the server!!");
  const status = getStatus();
  $('#addLink').val(status.url);
  socket.emit('videoPausedGlobal', {
    clientName: window.clientName,
  });
};

window.continueVideo = function () {
  log("Let's send a continue event through the server!!");
  socket.emit('videoContinueGlobal', {
    clientName: window.clientName,
  });
};

window.secondsToClock = function (sec) {
  const sec_num = parseInt(sec, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) { hours = `0${hours}`; }
  if (minutes < 10) { minutes = `0${minutes}`; }
  if (seconds < 10) { seconds = `0${seconds}`; }
  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${+minutes}:${seconds}`;
};


window.addToHistory = function (playerStatus) {
  if (window.videoHistory.length === 0 || window.videoHistory[window.videoHistory.length - 1].videoId !== playerStatus.videoId) {
    window.videoHistory.push(playerStatus);
  }
  refreshList(window.videoHistory, $('.localHistory'), true);
};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0; const
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


window.log = (string) => {
  console.log(`[${window.clientName}] ${string}`);
};

window.favVideo = () => {
  debugger;
  const currentVideo = window.getStatus();
  const {
    videoId,
    url,
    duration,
    title,
  } = currentVideo;
  const b64title = window.btoa(unescape(encodeURIComponent(title)));
  window.handleFavVideo(videoId, url, b64title, duration);
};

window.handleFavVideo = (videoId, url, b64title, duration) => {
  const title = decodeURIComponent(escape(window.atob(b64title)));

  const videoData = {
    videoId,
    room: window.room,
    clientId: window.clientId,
    url,
    title,
    duration,
  };
  socket.emit('toggleFavVideo', videoData);
};


/*

window.updateTime = function (seconds) {
  $("#personalTime").text(secondsToClock(se7conds))
}

window.pauseTime = function (refreshData) {
  if (refreshData) {
    clientTimerSeconds = refreshData;
  }
  clientTimerStatus = timer_pause;
};

window.startTime = function (refreshData) {
  if (refreshData) {
    clientTimerSeconds = refreshData;
  }
  clientTimerStatus = timer_playing;

};

*/

/*
setInterval(function(){
  if (clientTimerStatus == timer_playing) {
    log("click");
    clientTimerSeconds++;
    $("#personalTime").text(secondsToClock(clientTimerSeconds))
  }
}, 1000);
*/


window.changeTab = function (list) {
  $('.serverPlaylist').hide();
  $('.serverHistory').hide();
  $('.localHistory').hide();
  $('.favList').hide();

  $('#serverPlaylist').parent().removeClass('active');
  $('#serverHistory').parent().removeClass('active');
  $('#localHistory').parent().removeClass('active');
  $('#favList').parent().removeClass('active');

  $(`.${list}`).show();
  $(`#${list}`).parent().addClass('active');
};


window.changeFavVisibility = () => {
  window.showAllFavs = !window.showAllFavs;
  refreshList(window.favedData, $('.favs'));
};

},{"get-youtube-id":1,"js-cookie":2,"random-animal-name-generator":6,"tippy.js":7,"youtube-thumbnail":8}]},{},[10])(10)
});
