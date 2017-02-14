/**
 * Templates.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        thumb: {
            type: 'string',
            required: true
        },
        template: {
            type: 'string',
            required: true
        },
        type: {
            type: 'string',
            required: true
        },
        active: {
            type: 'boolean',
            defaultsTo: false
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        },
    }
};

