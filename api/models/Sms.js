/**
 * Sms.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        // The user's full name
        // e.g. Nikola Tesla
        text: {
            type: 'string',
            required: true
        },
        confirm_text: {
            type: 'string',
            required: true
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        },
        // The user's title at their job (or something)



    }
};

