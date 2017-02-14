(function () {
	angular.module('RDash')
		.controller('UserController', UserController)
		.controller('UserEditCtrl', UserEditCtrl);

	UserController.$inject = ['$http', '$uibModal', 'uiGridConstants']

	function UserController($http, $uibModal, uiGridConstants) {

		var vm = this;
		vm.editRow = editRow;
		//	service.editRow = editRow;

		vm.process = process;

		function process() {
			$http.get('/rabbit/receive').success(function (response) {

				toastr.success('Email processed.', 'Operation Succesful!');
			}).error(function (response) {
				toastr.error('Operation was unsuccesful.', 'Oops!');
				console.dir(response);
			});


		}

		function editRow(grid, row) {
			$uibModal.open({
				templateUrl: '/templates/user-edit.html',
				controller: ['$http', '$uibModalInstance', 'grid', 'row', 'toastr', UserEditCtrl],
				controllerAs: 'vm',
				resolve: {
					grid: function () {
						return grid;
					},
					row: function () {
						return row;
					}
				}
			});
		}

		var paginationOptions = {
			pageNumber: 1,
			pageSize: 25,
			field: null,
			sort: null
		};
		vm.serviceGrid = {
			enableFiltering: true,
			paginationPageSizes: [25, 50, 75],
			paginationPageSize: 25,
			useExternalPagination: true,
			useExternalSorting: true,
			multiSelect: false,
			enableSorting: true,
			enableGridMenu: true,
			enableRowSelection: true,
			enableRowHeaderSelection: false,
			rowTemplate: "<div ng-dblclick=\"grid.appScope.vm.editRow(grid, row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
			onRegisterApi: function (gridApi) {
				vm.gridApi = gridApi;
				vm.gridApi.core.on.sortChanged(null, function (grid, sortColumns) {
					//		console.log(uiGridConstants);
					if (sortColumns.length == 0) {
						paginationOptions.field = null;
						paginationOptions.sort = null;
					} else {
						paginationOptions.field = sortColumns[0].name;
						paginationOptions.sort = sortColumns[0].sort.direction;
					}
					getPage();
				});
				gridApi.pagination.on.paginationChanged(null, function (newPage, pageSize) {
					paginationOptions.pageNumber = newPage;
					paginationOptions.pageSize = pageSize;
					getPage();
				});
			}


		};

		vm.serviceGrid.columnDefs = [{
			field: 'id',
			displayName: 'Id',
			enableSorting: true,
			type: 'number',
			enableCellEdit: false,
			width: 60,
			sort: {
				direction: uiGridConstants.ASC,
				priority: 1,
			},
		}, {
				field: 'name',
				enableSorting: true,
				enableCellEdit: false
			}, {
				field: 'email',
				enableSorting: true,
				enableCellEdit: false
			}, {
				field: 'title',
				width: 120,
				enableSorting: true,
				enableCellEdit: false
			}];

		var getPage = function () {
			//console.log(paginationOptions);
			var url = '/user/list?limit=' + paginationOptions.pageSize + "&skip=" + ((paginationOptions.pageNumber - 1) * paginationOptions.pageSize);
			if (paginationOptions.field !== null && paginationOptions.sort !== null)
				url += "&field=" + paginationOptions.field + "&sort=" + paginationOptions.sort

			$http.get(url)
				.success(function (data) {
					//	console.log(data);
					vm.serviceGrid.totalItems = data.total;
					var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
					vm.serviceGrid.data = data.data;
				});
		};

		getPage();
	}

	function UserEditCtrl($http, $uibModalInstance, grid, row, toastr) {
		var vm = this;
		vm.entity = angular.copy(row.entity);
		vm.save = save;
		vm.remove = remove;
		vm.sendEmail = sendEmail;
		function save() {
			if (row.entity.id) {
				//console.log(row.entity);
				$http.post('/user/update', vm.entity).success(function (response) {
					row.entity = angular.extend(row.entity, vm.entity);
					$uibModalInstance.close(row.entity);
					toastr.success('Succesfully updated user.', 'Operation Succesful!');
				}).error(function (response) {
					toastr.error('Operation was unsuccesful.', 'Oops!');
					console.dir(response);
				});
			}
			$uibModalInstance.close(row.entity);
		}

		function remove() {
			//	console.dir(row)
			if (row.entity.id != '0') {
				row.entity = angular.extend(row.entity, vm.entity);
				var index = grid.appScope.vm.serviceGrid.data.indexOf(row.entity);
				grid.appScope.vm.serviceGrid.data.splice(index, 1);

				$http.delete('/user/destroy/' + row.entity.id).success(function (response) {
					$uibModalInstance.close(row.entity);
					toastr.success('Succesfully deleted user.', 'Operation Succesful!');
				}).error(function (response) {
					toastr.error('Operation was unsuccesful.', 'Oops!');
					console.dir(response);
				});

			}
			$uibModalInstance.close(row.entity);
		}

		function sendEmail() {
			//	console.dir(row)
			if (row.entity.id) {
				//console.log(row.entity);
				$http.post('/rabbit/send', vm.entity).success(function (response) {

					toastr.success('Email sent.', 'Operation Succesful!');
				}).error(function (response) {
					toastr.error('Operation was unsuccesful.', 'Oops!');
					console.dir(response);
				});
			}
			$uibModalInstance.close(row.entity);
		}

	}

})();