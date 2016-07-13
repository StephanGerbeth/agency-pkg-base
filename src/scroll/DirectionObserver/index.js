"use strict";

var Controller = require('../../Controller');
var DomModel = require('../../DomModel');
var Bounds = require('../../Bounds');
var dataTypeDefinition = require('../../dataTypeDefinition');
var element = require('agency-pkg-utils/element');

var viewport = require('agency-pkg-services/viewport');

module.exports = Controller.extend({

    modelConstructor: DomModel.extend(dataTypeDefinition, {

    }),

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        this.bounds = new Bounds();
        this.callbacks = [this.onUp.bind(this), this.onInit.bind(this), this.onDown.bind(this)];

        this.onInit = onInit.bind(this);
        this.onResize = onResize.bind(this);
        this.onScroll = onScroll.bind(this);

        viewport
            .on(viewport.EVENT_TYPES.INIT, this.onInit)
            .on(viewport.EVENT_TYPES.RESIZE, this.onResize)
            .on(viewport.EVENT_TYPES.SCROLL, this.onScroll);
    },

    onInit: function() {
        console.log('init');
    },

    onUp: function() {
        console.log('scroll up');
    },

    onDown: function() {
        console.log('scroll down');
    },

    destroy: function() {
        viewport
            .off(viewport.EVENT_TYPES.INIT, this.onInit)
            .off(viewport.EVENT_TYPES.RESIZE, this.onResize)
            .off(viewport.EVENT_TYPES.SCROLL, this.onScroll);
        Controller.prototype.destroy.apply(this, arguments);
    }
});

function onInit(viewportBounds, direction) {
    element.updateBounds(this.el, this.bounds);
    this.callbacks[1](viewportBounds, direction);
}

function onResize() {
    element.updateBounds(this.el, this.bounds);
    // this.callbacks[direction.y + 1](viewportBounds, direction);
}

function onScroll(viewportBounds, direction) {
    this.callbacks[direction.y + 1](viewportBounds, direction);
}
