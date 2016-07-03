'use strict';

var Controller = require('../Controller');
var DomModel = require('../DomModel');
var browserHistory = require('agency-pkg-services/history');

module.exports = Controller.extend({
    modelConstructor: DomModel.extend({
        session: {
            ajax: {
                type: 'string',
                required: true,
                default: null
            },
            deep: {
                type: 'string',
                required: true,
                default: ''
            },
            container: {
                type: 'string',
                required: true,
                default: '.content'
            }
        }
    }),

    initialize: function() {
        Controller.prototype.initialize.apply(this, arguments);

        // $(document).on('click', 'a[data-deep-name="' + this.model.deep + '"]', function(e) {
        //     e.preventDefault();
        //     browserHistory.update([{
        //         name: this.model.deep,
        //         value: $(e.currentTarget).attr('href').replace(/^#/, '') || null
        //     }]);
        // }.bind(this));

        browserHistory.register(this.model.deep, updateContent.bind(this));
    },

    onSuccess: function(content) {
        if(typeof content === 'string') {
            this.el.querySelector(this.model.container).innerHTML = content;
            global.js.parse(this.el.querySelector(this.model.container));
            window.picture.parse(this.el.querySelector(this.model.container));
            this.onContentAdded();
        } else {
            $(this.model.container, this.el).html(content);
            this.onContentAdded();
        }
    },

    onContentAdded: function() {

    },

    onContentRemoved: function(cb) {
        cb();
    }
});

function updateContent(value) {
    if(value) {
        if(this.model.ajax) {
            clearContainer(this.el.querySelector(this.model.container));
            this.onContentRemoved(function() {
                $.ajax({
                    url: this.model.ajax + value,
                    success: this.onSuccess.bind(this),
                    error: onError.bind(this)
                });
            }.bind(this));
        } else {
            this.onContentAdded();
        }
    }
}

function onError(e) {
    console.error('file not found', e);
    this.onSuccess('<h2>File not found!</h2>');
}

function clearContainer(container) {
    $('> *', container).detach();
    container.innerHTML = '';
}
