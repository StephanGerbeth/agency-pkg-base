"use strict";

var js = require('agency-pkg-services/parser/js')(require('./packages'));

(function(){
    $(function() {
        js.parse();
    });
})();
