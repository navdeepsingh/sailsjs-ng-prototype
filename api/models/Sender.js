/**
 * Sender.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        // The user's full name
        // e.g. Nikola Tesla
        name: {
            type: 'string',
            required: true
        },
        // The user's title at their job (or something)

        email: {
            type: 'string',
            email: true,
            required: true
        },
        email_template: {
            type: 'string'
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }

    }
};

