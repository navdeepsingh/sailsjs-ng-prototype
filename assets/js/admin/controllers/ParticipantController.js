(function () {
	angular.module('RDash')

		.directive('fileModel', ['$parse', function ($parse) {
			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
					var model = $parse(attrs.fileModel);
					var modelSetter = model.assign;

					element.bind('change', function () {
						scope.$apply(function () {
							modelSetter(scope, element[0].files[0]);
						});
					});
				}
			};
		}])
		.controller('ParticipantController', ParticipantController)
		.controller('ParticipantEditCtrl', ParticipantEditCtrl)
		.controller('ParticipantImportCtrl', ParticipantImportCtrl);

	ParticipantController.$inject = ['$http', '$uibModal', 'uiGridConstants', 'toastr']

	function ParticipantController($http, $uibModal, uiGridConstants, toastr) {

		var vm = this;
		vm.editRow = editRow;
		vm.openImport = openImport;
		vm.sendEmail = sendEmail;
		vm.sendSMSToAll = sendSMSToAll;

		function sendEmail() {
			$http.get('/ui/sendEmailToAll')
				.success(function (data) {
					//	console.log(data);
					toastr.success('Sending emails sent to  unregisterd users.', 'Operation Succesful!');
					//	toastr.error(data.error + '  were unsuccesful.', 'Oops!');

				});
		}
		
		function sendSMSToAll() {
			$http.get('/ui/sendSMSToAll')
				.success(function (data) {
					//	console.log(data);
					toastr.success('Sending SMS to registerd users.', 'Operation Succesful!');
					//	toastr.error(data.error + '  were unsuccesful.', 'Oops!');

				});
		}

		function openImport(grid) {
			$uibModal.open({
				templateUrl: '/templates/participant-import.html',
				controller: ['$http', '$uibModalInstance', 'toastr', 'grid', ParticipantImportCtrl],
				controllerAs: 'vm',
				resolve: {
					grid: function () {
						return grid;
					}
				}
			});
		}

		function editRow(grid, row) {
			$uibModal.open({
				templateUrl: '/templates/participant-edit.html',
				controller: ['$http', '$uibModalInstance', 'grid', 'row', 'toastr', ParticipantEditCtrl],
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

		vm.participantGrid = {
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

		vm.participantGrid.columnDefs = [{
			field: 'id',
			displayName: 'Id',
			enableSorting: false,
			type: 'number',
			enableCellEdit: false,
			width: 60,
			sort: {
				direction: uiGridConstants.ASC,
				priority: 1,
			},
		}, {
			field: 'first_name',
			enableSorting: true,
			enableCellEdit: false
		}, {
			field: 'last_name',
			enableSorting: true,
			enableCellEdit: false
		},
		{
			field: 'email',
			enableSorting: true,
			enableCellEdit: false
		},
		{
			field: 'mobile',
			enableSorting: false,
			enableCellEdit: false
		},
		{
			field: 'token',
			enableSorting: true,
			enableCellEdit: false
		},
		{
			field: 'registered',
			enableSorting: true,
			enableCellEdit: false
		}, {
			field: 'sent',
			width: 120,
			enableSorting: true,
			enableCellEdit: false
		}];



		var getPage = function () {
			//console.log(paginationOptions);
			var url = '/participant/list';
			if (paginationOptions.field !== null && paginationOptions.sort !== null)
				url += "?field=" + paginationOptions.field + "&sort=" + paginationOptions.sort

			$http.get(url)
				.success(function (data) {
					//	console.log(data);
					vm.participantGrid.totalItems = data.total;
					var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;
					vm.participantGrid.data = data.data;
				});
		};


		vm.addRow = function () {

			var newParticipant = {
				"id": "0",
			};
			var rowTmp = {};
			rowTmp.entity = newParticipant;
			vm.editRow(vm.participantGrid, rowTmp);
		}
		getPage();
	}

	function ParticipantImportCtrl($http, $uibModalInstance, toastr, grid) {
		var vm = this;
		vm.submitFile = submitFile;
		function submitFile() {
			var file = vm.myFile;

			var fd = new FormData();
			fd.append('file', file);
			$http.post('/participant/upload', fd, {
				transformRequest: angular.identity,
				headers: { 'Content-Type': undefined }
			}).success(function (response) {
				toastr.success('Succesfully updated user.', 'Operation Succesful!');
				$uibModalInstance.close();
				//	console.log(grid.data.length);
				var url = '/participant/list';
				$http.get(url)
					//	$http.get('/participant/list')
					.success(function (data) {
						grid.data = data.data;
						grid.data.length = data.total;
					});

			}).error(function (response) {
				alert('Cannot edit row (error in console)');
				console.dir(response);
			});
		}
	}

	function ParticipantEditCtrl($http, $uibModalInstance, grid, row, toastr) {
		var vm = this;
		vm.entity = angular.copy(row.entity);
		vm.save = save;
		vm.remove = remove;
		vm.reset = reset;
		vm.resend = resend;
		vm.sendSMS = sendSMS;

		function save() {
			if (row.entity.id == '0') {
				$http.post('/participant/create', vm.entity).success(function (response) {
					row.entity = angular.extend(row.entity, vm.entity);
					//console.log(response);
					row.entity.id = response.participant.id;
					row.entity.registered = response.participant.registered;
					row.entity.sent = response.participant.sent;
					row.entity.token = response.participant.token;
					grid.data.push(row.entity);
					$uibModalInstance.close(row.entity);
					toastr.success('Successfuly saved.', 'Operation Succesful!');
				}).error(function (response) {
					toastr.error('Cannot add row (error in console)', 'Oops!');
					console.dir(response);
				});
			} else {
				//console.log(row.entity);
				$http.post('/participant/update', vm.entity).success(function (response) {
					row.entity = angular.extend(row.entity, vm.entity);
					$uibModalInstance.close(row.entity);
					toastr.success('Successfuly updated.', 'Operation Succesful!');
				}).error(function (response) {
					//alert('');
					toastr.error('Cannot edit row (error in console)', 'Oops!');
					console.dir(response);
				});
			}
			$uibModalInstance.close(row.entity);

		}

		function remove() {
			//	console.dir(row)
			if (row.entity.id != '0') {
				row.entity = angular.extend(row.entity, vm.entity);
				var index = grid.appScope.vm.participantGrid.data.indexOf(row.entity);
				grid.appScope.vm.participantGrid.data.splice(index, 1);

				$http.delete('/participant/destroy/' + row.entity.id).success(function (response) {
					$uibModalInstance.close(row.entity);
					toastr.success('User removed.', 'Operation Succesful!');
				}).error(function (response) {
					alert('Cannot delete row (error in console)');
					console.dir(response);
				});

			}
			$uibModalInstance.close(row.entity);
		}
		function reset() {
			//	console.dir(row)
			if (row.entity.id != '0') {
				$http.post('/participant/reset', vm.entity).success(function (response) {

					row.entity = angular.extend(row.entity, vm.entity);
					row.entity.registered = response.data.registered;;
					row.entity.sent = response.data.sent;
					row.entity.token = response.data.token;
					$uibModalInstance.close(row.entity);
					toastr.success('Succesfully reset the user.', 'Operation Succesful!');
				}).error(function (response) {
					alert('Cannot edit row (error in console)');
					console.dir(response);
				});
			}
			$uibModalInstance.close(row.entity);
		}
		function resend() {
			//	console.dir(row)
			if (row.entity.id != '0') {
				row.entity = angular.extend(row.entity, vm.entity);
				row.entity.sent = true;
				$uibModalInstance.close(row.entity);
				$http.post('/ui/sendEmailToAll', vm.entity).success(function (response) {
					toastr.success('Email send to user.', 'Operation Succesful!');
				}).error(function (response) {
					toastr.error(response.message, 'Oops!');
					console.dir(response);
				});
			}
			$uibModalInstance.close(row.entity);
		}

		function sendSMS() {
			//	console.dir(row)
			if (row.entity.id != '0') {
				row.entity = angular.extend(row.entity, vm.entity);
				$uibModalInstance.close(row.entity);
				$http.post('/ui/sendSMSToAll', vm.entity).success(function (response) {
					toastr.success('sms sent to user.', 'Operation Succesful!');
				}).error(function (response) {
					toastr.error(response.message, 'Oops!');
					console.dir(response);
				});
			}
			$uibModalInstance.close(row.entity);
		}
	}

})();