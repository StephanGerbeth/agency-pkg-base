"use strict";

var AmpersandModel = require('ampersand-model');
var dataTypeDefinition = require('./dataTypeDefinition');

module.exports = AmpersandModel.extend(dataTypeDefinition, {

    initialize: function() {
        AmpersandModel.prototype.initialize.apply(this, arguments);

        if(module.hot) {
            module.hot.addDisposeHandler(function(data) {
                console.log('WHAT', arguments, this.firstName, this.toJSON());
                data.firstName = this.firstName;
            }.bind(this));
        }
    }
});
