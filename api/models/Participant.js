module.exports = {
	attributes: {
		// The user's first name
		// e.g. Nikola 
		first_name: {
			type: 'string',
			required: true
		},
		// The user's last name
		// e.g. Tesla
		last_name: {
			type: 'string'
		},
		// The user's email address
		// e.g. nikola@tesla.com
		email: {
			type: 'email',
			//	email: true,
			required: true,
			unique: true
		},
		// token to validate the email
		token: {
			type: 'string',
			//	defaultsTo: true
		},
		// to check whether participant accepted the request from email
		mobile: {
			type: 'string',
			defaultsTo: ''
		},
		registered: {
			type: 'boolean',
			defaultsTo: false
		},
		// to check whether email is sent
		sent: {
			type: 'boolean',
			defaultsTo: false
		},
		accepted: {
			type: 'date',
			//	defaultsTo: false
		},
		activate: function () {
			if (this.registered === false) {
				//this.registered = true;
				this.accepted = new Date();
				this.save();
				return true;
			} else {
				return false;
			}
		},
		name: function () {
			return this.first_name + ' ' + this.last_name;
		},
                toJSON: function () {
			var obj = this.toObject();
			delete obj.createdAt;
			delete obj.updatedAt;
			return obj;
		},
	}
};