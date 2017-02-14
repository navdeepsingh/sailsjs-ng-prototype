(function () {
	angular.module('RDash',
		[ 'toastr', 'ngAnimate', 'ui.bootstrap', 'ui.router', 'ngCookies', 'ui.grid',
			'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.pagination',
			'ui.grid.pagination'])
		.config(['$stateProvider', '$urlRouterProvider',
			function ($stateProvider, $urlRouterProvider) {

				// For unmatched routes
				$urlRouterProvider.otherwise('/');

				// Application routes
				$stateProvider
					.state('users', {
						url: '/participants',
						templateUrl: '/templates/participant.html',
						//	controller: 'DashboardController',
					})
					.state('index', {
						url: '/',
						templateUrl: '/templates/users.html'
					})
					.state('sender', {
						url: '/sender',
						templateUrl: '/templates/sender.html'
					})
					.state('sms', {
						url: '/sms',
						templateUrl: '/templates/sms.html'
					})
					.state('confirm', {
						url: '/confirm',
						templateUrl: '/templates/confirm.html'
					})
					.state('emailtemplate', {
						url: '/emailtemplate',
						templateUrl: '/templates/emailtemplate.html'
					})
                                                .state('emaillogs', {
						url: '/emaillogs',
						templateUrl: '/templates/emaillogs.html'
					})
			}
		]);
})();