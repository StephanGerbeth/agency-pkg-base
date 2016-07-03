"use strict";

var PositionObserver = require('./PositionObserver');

module.exports = PositionObserver.extend({

    modelConstructor: PositionObserver.prototype.modelConstructor.extend({
        session: {
            triggered: {
                type: 'boolean',
                default: false
            },
            runOnce: {
                type: 'boolean',
                default: false
            },
            bidirection: {
                type: 'boolean',
                default: false
            },
            position: {
                type: 'number',
                default: 0
            }
        }
    }),

    bindings: {
        'model.triggered': {
            type: 'booleanClass',
            name: 'js-active'
        }
    },

    initialize: function() {
        PositionObserver.prototype.initialize.apply(this, arguments);
    },

    onActive: function(info) {
        if(info.y >= this.model.position && !this.model.triggered) {
            this.model.triggered = true;
        }
    },

    onInactive: function(info) {
        if(!this.model.runOnce && !(info.y === 1 && !this.model.bidirection)) {
            this.model.triggered = false;
        }
    }
});
