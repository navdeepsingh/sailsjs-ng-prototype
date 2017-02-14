/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	// User home page index
	showHomePage: function (req, res) {

		// If not logged in, show the public view.
		if (!req.session.authenticated) {
			return res.view('homepage');
		}

		// Otherwise, look up the logged-in user and show the logged-in view,
		// bootstrapping basic user data in the HTML sent from the server
		User.findOne(req.session.User.id, function (err, user) {
			if (err) {
				return res.negotiate(err);
			}

			if (!user) {
				sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
				return res.view('homepage');
			}

			return res.view('dashboard', {
				me: {
					id: user.id,
					name: user.name,
					email: user.email,
					title: user.title,
					isAdmin: !!user.admin,
					gravatarUrl: user.gravatarUrl
				}
			});

		});
	},
	// Admin home page index
	showAdmin: function (req, res) {

		// If not logged in, show the public view.
		if (!req.session.authenticated) {
			return res.view('admin/login', {layout: 'admin/layout'});
		}

		// Otherwise, look up the logged-in user and show the logged-in view,
		// bootstrapping basic user data in the HTML sent from the server
		User.findOne(req.session.User.id, function (err, user) {
			if (err) {
				return res.negotiate(err);
			}

			if (!user) {
				sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
				return res.view('admin/login');
			}

			return res.view('admin/home', {
				me: {
					id: user.id,
					name: user.name,
					email: user.email,
					title: user.title,
					isAdmin: !!user.admin,
					gravatarUrl: user.gravatarUrl
				}
			}, {layout: 'admin/layout'});

		});
	},
        homePage: function (req, res) {

		// If not logged in, show the public view.
		return res.view('homepage/content', {layout: 'homepage/layout'});
		// Otherwise, look up the logged-in user and show the logged-in view,
		// bootstrapping basic user data in the HTML sent from the server
		
	},
	countUsers: function (req, res) {
		User.count({}).exec(function countCB(error, found) {
			res.json({usersCount: found});
		});
	},
};
