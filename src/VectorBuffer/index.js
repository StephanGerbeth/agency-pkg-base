"use strict";

var Vector = require('../Vector');
var fill = require('lodash/fill');

function VectorBuffer(size) {
    if (!(this instanceof VectorBuffer)) {
        return new VectorBuffer(size);
    }
    this.size = size;
    this.list = fill(Array(this.size), new Vector());
}

VectorBuffer.prototype.list = [];
VectorBuffer.prototype.count = 0;
VectorBuffer.prototype.size = 0;

VectorBuffer.prototype.add = function(value) {
    this.list[this.count % this.size] = value;
    this.count++;
    return this;
};

VectorBuffer.prototype.getAverage = function() {
    var result = new Vector();
    for(var i = 0; i < this.size; i++) {
        result.addLocal(this.list[i]);
    }
    return result.divideValueLocal(this.size).normalizeLocal();
};

module.exports = VectorBuffer;
