(function () {
	angular.module('RDash')
		.controller('EmaillogsController', EmaillogsController)

	EmaillogsController.$inject = ['$http', '$uibModal', 'uiGridConstants', 'toastr']

	function EmaillogsController($http, $uibModal, uiGridConstants, toastr) {

		var vm = this;
		vm.LogGrid = {
			enablePaginationControls: false,
			paginationPageSize: 25,
			columnDefs: [
				{ name: 'email' },
				{ name: 'time' },
				{ name: 'status' }
			]
		};
		vm.loading = true;
		vm.search = search;
		vm.failed = failed;
		vm.reset = reset;
		function reset() {
			vm.searchText = '';
			getPage();
		}
		function search() {
			var url = '/ui/emailLog?recipient=' + vm.searchText;
			$http.get(url)
				.success(function (data) {
					//	console.log(data);
					vm.LogGrid.data = data.data;
					//	toastr.error(data.error + '  were unsuccesful.', 'Oops!');

				});
		}
		function failed() {
			var url = '/ui/emailLog?event=failed';
			vm.searchText = '';
			$http.get(url)
				.success(function (data) {
					//	console.log(data);
					vm.LogGrid.data = data.data;
					//	toastr.error(data.error + '  were unsuccesful.', 'Oops!');

				});
		}
		var getPage = function () {
			//console.log(paginationOptions);
			var url = '/ui/emailLog';

			$http.get(url)
				.success(function (data) {
					//	console.log(data);
					//	vm.participantGrid.totalItems = data.total;
					//	var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
					vm.loading = false;
					vm.LogGrid.data = data.data;
				//	vm.LogGrid.core.refresh();
				});
		};

		getPage();

	}
})();