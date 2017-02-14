/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Passwords = require('machinepack-passwords');
var Gravatar = require('machinepack-gravatar');

module.exports = {
	/**
	 * Check the provided email address and password, and if they
	 * match a real user in the database, sign in to Activity Overlord.
	 */
	index: function (req, res) {
		res.view();
	},
	list: function (req, res) {    // http://localhost:1337/user/list?name=a&limit=2
		var name = req.param('name', ''),
			limit = req.param('limit', '10'),
			skip = req.param('skip', '0'),
			field = req.param('field'),
			sort = req.param('sort', ''),
			count = 0;

		User.count({ name: { 'contains': name } }).exec(function countCB(error, found) {
			//console.log(found);
			var users = User.find().where({ name: { 'contains': name } });
			if (field !== null)
				users.sort(field + " " + sort);
			var myQuery = users.limit(limit).skip(skip).exec(function callBack(err, users) {
				if (err)
					return next(err);
				res.json({ data: users, total: found });
			});
		});

	},
	login: function (req, res) {

		// Try to look up user using the provided email address
		User.findOne({
			email: req.param('email')
		}, function foundUser(err, user) {
			if (err) {
				console.log('bad requet from sails usercontroller');
				return res.negotiate(err);
			}
			if (!user) {
				return res.notFound('User not found.');
				//return res.badRequest('User not found.');
			}
			// Compare password attempt from the form params to the encrypted password
			// from the database (`user.password`)
			Passwords.checkPassword({
				passwordAttempt: req.param('password'),
				encryptedPassword: user.encryptedPassword
			}).exec({
				error: function (err) {
					return res.negotiate(err);
				},
				// If the password from the form params doesn't checkout w/ the encrypted
				// password from the database...
				incorrect: function () {
					return res.notFound('Invalid password.');
				},
				success: function () {

					// Store user id in the user session
					// Log user in
					req.session.authenticated = true;
					req.session.User = user;
					// All done- let the client know that everything worked.
					return res.ok({ id: user.id, name: user.name, email: user.email, role: (user.admin) ? 'admin' : 'user' });
				}
			});
		});

	},
	logout: function (req, res) {

		// Look up the user record from the database which is
		// referenced by the id in the user session (req.session.authenticated)
		if (req.session.authenticated) {
			User.findOne(req.session.User.id, function foundUser(err, user) {
				if (err)
					return res.negotiate(err);

				// If session refers to a user who no longer exists, still allow logout.
				if (!user) {
					sails.log.verbose('Session refers to a user who no longer exists.');
					return res.backToHomePage();
				}

				// Wipe out the session (log out)
				req.session.authenticated = null;
				req.session.User = null;

				// Either send a 200 OK or redirect to the home page
				return res.backToHomePage();

			});
		} else
			return res.backToHomePage();

	},
	
	info: function (req, res) {
		if (req.session.authenticated) {
			return res.ok({
				id: req.session.User.id,
				name: req.session.User.name,
				email: req.session.User.email,
				title: req.session.User.title,
				isAdmin: !!req.session.User.admin,
				gravatarUrl: req.session.User.gravatarUrl
			});
		} else
			return res.forbidden('not loggedin');
	}

};
