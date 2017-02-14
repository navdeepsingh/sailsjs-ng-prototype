(function () {
	angular.module('RDash')
			.controller('LoginController', LoginController);
	LoginController.$inject = ['$window', '$http', 'toastr'];

	function LoginController($window, $http, toastr) {

		var vm = this;
		vm.submitLoginForm = submitLoginForm;
		//$location.url();

		// set-up loginForm loading state
		vm.loginForm = {
			loading: false
		}

		function submitLoginForm() {
			// Set the loading state (i.e. show loading spinner)
			vm.loginForm.loading = true;
			var url = $window.location.href;
			// Submit request to Sails.
			$http.put('/login', {
				email: vm.loginForm.email,
				password: vm.loginForm.password
			})
					.then(function onSuccess(res) {
				$window.location.reload();

						$window.location.href = url;
					})
					.catch(function onError(sailsResponse) {
						console.log(sailsResponse);

						// Handle known error type(s).
						// Invalid username / password combination.
						if (sailsResponse.status === 400 || 404) {
							toastr.error(sailsResponse.status + ': ' + sailsResponse.data, 'Error', {
								closeButton: true
							});
							return;
						}

						toastr.error('An unexpected error occurred, please try again.', 'Error', {
							closeButton: true
						});
						return;

					})
					.finally(function eitherWay() {
						vm.loginForm.loading = false;
					});
		}
	}
})();
