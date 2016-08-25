"use strict";

var Buffer = function(length) {
    this.buffer = [];
    this.index = 0;
    // generate buffer array
    for (var i = 0; i < length; i++) {
        this.buffer.push(0);
    }
};
Buffer.prototype.add = function(value) {
    this.buffer[this.index % this.buffer.length] = value;
    this.index++;
};
Buffer.prototype.getAverage = function() {
    var total = 0;
    for (var i = 0; i < this.buffer.length; i++) {
        total += this.buffer[i];
    }
    var avg = total / this.buffer.length;
    return avg;
};
module.exports = Buffer;
