(function () {
	angular.module('RDash')
		.controller('SenderController', SenderController)

	SenderController.$inject = ['$http', 'toastr']

	function SenderController($http, toastr) {

		var vm = this;
		vm.save = save;

		var paginationOptions = {
			pageNumber: 1,
			pageSize: 25,
			field: null,
			sort: null
		};

		function save() {
			console.log(vm);
			$http.post('/sender/update', vm).success(function (response) {
				toastr.success('Succesfully updated user.', 'Operation Succesful!');
			}).error(function (response) {
				toastr.error('Operation was unsuccesful.', 'Oops!');
				console.dir(response);
			});
		}

		var getPage = function () {
			//console.log(paginationOptions);
			var url = '/sender/show';

			$http.get(url)
				.success(function (data) {
					if (data.data) {
						vm.name = data.data.name;
						vm.email = data.data.email;
						vm.id = data.data.id;					
						
					}
				});
		};

		getPage();
	}
})();