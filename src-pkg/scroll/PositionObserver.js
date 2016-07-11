"use strict";

var Controller = require('../Controller');
var DomModel = require('../DomModel');
var dataTypeDefinition = require('../dataTypeDefinition');
var Vector = require('../Vector');
var Bounds = require('../Bounds');

var element = require('agency-pkg-utils/element');
var viewport = require('agency-pkg-services/viewport');

var viewportDimension = new Vector();
var objectDimension = new Vector();

module.exports = Controller.extend({
    operation: 'subtractLocal',

    modelConstructor: DomModel.extend(dataTypeDefinition, {
        session: {
            extendedRange: {
                type: 'boolean',
                required: true,
                default: function() {
                    return false;
                }
            }
        }
    }),

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        this.bounds = new Bounds();
        this.outOfViewportInfo = null;

        if(this.model.extendedRange) {
            this.operation = 'addLocal';
        }

        this.onInit = onInit.bind(this);
        this.onResize = onResize.bind(this);
        this.onScroll = onScroll.bind(this);

        viewport
            .on(viewport.EVENT_TYPES.INIT, this.onInit)
            .on(viewport.EVENT_TYPES.RESIZE, this.onResize)
            .on(viewport.EVENT_TYPES.SCROLL, this.onScroll);
    },

    onActive: function() {
        // console.log('HUI', info.y, direction.y);
    },

    onInactive: function() {
//        console.log('BOOM', info.y);
    },

    destroy: function() {
        viewport
            .off(viewport.EVENT_TYPES.INIT, this.onInit)
            .off(viewport.EVENT_TYPES.RESIZE, this.onResize)
            .off(viewport.EVENT_TYPES.SCROLL, this.onScroll);
        Controller.prototype.destroy.apply(this, arguments);
    }
});

function onScroll(viewportBounds, direction) {
    if(this.bounds.intersects(viewportBounds)) {
        this.outOfViewportInfo = null;
        this.onActive(getIntersectionInfo(this.bounds, viewportBounds, this.operation), direction);
    } else {
        if(!this.outOfViewportInfo) {
            this.outOfViewportInfo = new Vector();
            this.outOfViewportInfo.reset(getIntersectionInfo(this.bounds, viewportBounds, this.operation)).clampLocal(-1, 1);
            this.onInactive(this.outOfViewportInfo, direction);
        }
    }
}

function onInit(viewportBounds, direction) {
    element.updateBounds(this.el, this.bounds);
    viewportDimension = viewportBounds.getDimension(viewportDimension);
    onScroll.bind(this)(viewportBounds, direction);
}

function onResize(viewportBounds, direction) {
    element.updateBounds(this.el, this.bounds);
    viewportDimension = viewportBounds.getDimension(viewportDimension);
    onScroll.bind(this)(viewportBounds, direction);
}

function getIntersectionInfo(bounds, viewportBounds, operation) {
    return normalizeIntersectionInfoByRange(bounds.getIntersectionInfo(viewportBounds), getRange(bounds, operation));
}

function getRange(bounds, operation) {
    return bounds.getDimension(objectDimension)[operation](viewportDimension);
}

function normalizeIntersectionInfoByRange(intersectionInfo, range) {
    return intersectionInfo.divideLocal(range.absLocal());
}
