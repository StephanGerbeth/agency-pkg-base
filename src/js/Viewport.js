"use strict";

var Vector = require('./Vector');
var Bounds = require('./Bounds');
var Enum = require('enum');
var remove = require('lodash/remove');
var animationFrame = global.animationFrame;
var callbacks = {
    MEASURE: [],
    RESIZE: [],
    SCROLL: []
};

if (global.addEventListener) {
    global.addEventListener('resize', animationFrame.throttle('viewport-resize', callCallbacks.bind(callbacks.RESIZE), callCallbacks.bind(callbacks.MEASURE)), false);
    global.addEventListener('scroll', animationFrame.throttle('viewport-scroll',callCallbacks.bind(callbacks.SCROLL), callCallbacks.bind(callbacks.MEASURE)), true);
} else {
    global.attachEvent('onresize', animationFrame.throttle('viewport-resize', callCallbacks.bind(callbacks.RESIZE), callCallbacks.bind(callbacks.MEASURE)));
    global.attachEvent('scroll', animationFrame.throttle('viewport-scroll', callCallbacks.bind(callbacks.SCROLL), callCallbacks.bind(callbacks.MEASURE)));
}

function callCallbacks(e) {
    for(var i = 0, l = this.length; i < l; i++) {
        this[i](e);
    }
}

var Viewport = function(frame, content) {
    this.frame = frame || this.frame;

    this.content = content || this.content;
    // if(frame === content) {
        this.scrollFrame = global;
    // } else {
    //     this.scrollFrame = this.content;
    // }
    this.init = false;
    this.dimensionKeyName = {width: null, height: null};
    this.scrollKeyName = {x: null, y: null};
    this.scrollX = 0;
    this.scrollY = 0;

    this.dimension = new Vector();
    this.offset = new Vector();
    this.bounds = new Bounds();
    this.scrollPosition = new Vector();
    this.scrollDirection = new Vector();
    this.scrollDimension = new Vector();
    this.scrollRange = new Vector();
    this.callbacks = this.EVENT_TYPES.enums.reduce(function(result, value) {
        result[value.key] = [];
        return result;
    }, {});

    if(this.frame.innerWidth) {
        this.dimensionKeyName.width = 'innerWidth';
        this.dimensionKeyName.height = 'innerHeight';
    } else if(this.frame.offsetWidth) {
        this.dimensionKeyName.width = 'offsetWidth';
        this.dimensionKeyName.height = 'offsetHeight';
    } else {
        this.dimensionKeyName.width = 'clientWidth';
        this.dimensionKeyName.height = 'clientHeight';
    }

    if('scrollX' in this.scrollFrame) {
        this.scrollKeyName.x = 'scrollX';
        this.scrollKeyName.y = 'scrollY';
    } else if('pageXOffset' in this.scrollFrame) {
        this.scrollKeyName.x = 'pageXOffset';
        this.scrollKeyName.y = 'pageYOffset';
    } else {
        this.scrollKeyName.x = 'scrollLeft';
        this.scrollKeyName.y = 'scrollTop';
    }

    callbacks.MEASURE.push(onMeasure.bind(this));
    callbacks.RESIZE.push(onResize.bind(this));
    callbacks.SCROLL.push(onScroll.bind(this));

    if (global.addEventListener) {
        [].forEach.call(this.content.querySelectorAll('img'),function(node) {
            node.addEventListener('load', onImageLoad.bind(this));
        }.bind(this));
    } else {
        [].forEach.call(this.content.querySelectorAll('img'),function(node) {
            node.attachEvent('onload', onImageLoad.bind(this));
        }.bind(this));
    }

    animationFrame.add(function() {
        onMeasure.bind(this)();
        onInit.bind(this)();
    }.bind(this));
};

Viewport.prototype.EVENT_TYPES = new Enum(['RESIZE', 'SCROLL', 'INIT']);
Viewport.prototype.init = false;
Viewport.prototype.frame = global;
Viewport.prototype.content = (document.documentElement || document.body.parentNode || document.body);
Viewport.prototype.dimensionKeyName = {width: null, height: null};
Viewport.prototype.scrollKeyName = {x: null, y: null};
Viewport.prototype.scrollX = 0;
Viewport.prototype.scrollY = 0;

Viewport.prototype.dimension = new Vector();
Viewport.prototype.offset = new Vector();
Viewport.prototype.bounds = new Bounds();
Viewport.prototype.scrollPosition = new Vector();
Viewport.prototype.scrollDirection = new Vector();
Viewport.prototype.scrollDimension = new Vector();
Viewport.prototype.scrollRange = new Vector();
Viewport.prototype.callbacks = [];

Viewport.prototype.update = function() {
    onResize.bind(this)();
};

Viewport.prototype.on = function(name, fn) {
    this.callbacks[name.toString()].push(fn);
    if(this.EVENT_TYPES.INIT.is(name) && this.init) {
        fn(this.bounds, this.scrollDirection);
    }
    return this;
};

Viewport.prototype.off = function(name, fn) {
    this.callbacks[name] = remove(this.callbacks[name], function(callback) {
        return callback === fn;
    });
    return this;
};

module.exports = Viewport;

function onImageLoad() {
    onMeasure.bind(this)();
    onResize.bind(this)();
}

function onInit() {
    updateOffset(this);
    updateDimension(this.dimension, this.frame, this.dimensionKeyName);
    updateScroll(this.scrollX, this.scrollY, this.content, this.scrollPosition, this.scrollRange, this.scrollDimension, this.dimension);
    this.scrollDirection.resetValues(0, 0, 0);
    update(triggerUpdate.bind(this, this.EVENT_TYPES.INIT), this.bounds, this.scrollPosition, this.offset, this.dimension);
    this.init = true;
}

function onResize() {
    updateOffset(this);
    updateDimension(this.dimension, this.frame, this.dimensionKeyName);
    this.scrollDirection.reset(this.scrollPosition);
    updateScroll(this.scrollX, this.scrollY, this.content, this.scrollPosition, this.scrollRange, this.scrollDimension, this.dimension);
    updateScrollDirection(this.scrollDirection, this.scrollPosition);
    update(triggerUpdate.bind(this, this.EVENT_TYPES.RESIZE), this.bounds, this.scrollPosition, this.offset, this.dimension);
}

function onScroll() {
    this.scrollDirection.reset(this.scrollPosition);
    updateScrollPosition(this.scrollX, this.scrollY, this.scrollPosition);
    updateScrollDirection(this.scrollDirection, this.scrollPosition);
    update(triggerScroll.bind(this), this.bounds, this.scrollPosition, this.offset, this.dimension);
}

function onMeasure() {
    this.scrollX = this.scrollFrame[this.scrollKeyName.x];
    this.scrollY = this.scrollFrame[this.scrollKeyName.y];
}

function update(fn, bounds, scrollPosition, offset, dimension) {
    updateBounds(bounds, scrollPosition, offset, dimension);
    fn();
}

function triggerScroll() {
    triggerUpdate.bind(this)(this.EVENT_TYPES.SCROLL);
}

function triggerUpdate(eventType) {
    for (var i = 0, l = this.callbacks[eventType].length; i < l; i++) {
        (this.callbacks[eventType][i])(this.bounds, this.scrollDirection);
    }
}

function updateOffset(scope) {
    var box = scope.content.getBoundingClientRect();

    var top = box.top + scope.scrollY;
    var left = box.left + scope.scrollX;

    scope.offset.setX(left).setY(top);
}

function updateBounds(bounds, position, offset, dimension) {
    // auf jeden fall korrekt, auf der Verrechnung baut Drag&Drop auf
    bounds.min.resetValues(position.x - offset.x, position.y - offset.y, position.z - offset.z);
    bounds.max.resetValues(position.x + dimension.x - offset.x, position.y + dimension.y - offset.y, position.z + dimension.z - offset.z);
}

function updateScroll(scrollX, scrollY, content, scrollPosition, scrollRange, scrollDimension, viewportDimension) {
    updateScrollDimension(content, scrollDimension);
    updateScrollRange(scrollRange, scrollDimension, viewportDimension);    
    updateScrollPosition(scrollX, scrollY, scrollPosition);
}

function updateDimension(dimension, frame, dimensionKeyName) {
    dimension.resetValues(frame[dimensionKeyName.width], frame[dimensionKeyName.height], 0);
}

function updateScrollDirection(direction, position) {
    direction.subtractLocal(position).multiplyValueLocal(-1).signLocal();
}

function updateScrollDimension(content, dimension) {
    dimension.resetValues(content.scrollWidth, content.scrollHeight, 0);
}

function updateScrollRange(range, scrollDimension, viewportDimension) {
    range.resetValues(scrollDimension.x, scrollDimension.y, 0);
    range.subtractLocal(viewportDimension);
}

function updateScrollPosition(scrollX, scrollY, position) {
    position.resetValues(scrollX, scrollY, 0);
}
