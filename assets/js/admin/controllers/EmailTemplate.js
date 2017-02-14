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
        .controller('EmailTemplateController', EmailTemplateController)
        .controller('UploadCtrl', UploadCtrl);

    EmailTemplateController.$inject = ['$http', '$uibModal', 'toastr', '$state', '$timeout','$window']

    function EmailTemplateController($http, $uibModal, toastr, $state, $timeout,$window) {

        var vm = this;
        vm.selectTemplate = selectTemplate;
        vm.deleteTemplate = deleteTemplate;
        vm.openUploadForm = openUploadForm;

        function openUploadForm() {

            var modalInstance = $uibModal.open({
                templateUrl: 'uploadContent.html',
				controller: ['$scope', '$uibModalInstance', 'toastr', '$http', UploadCtrl],
            });

            modalInstance.result.then(function (selectedItem) {
                toastr.success('Template Created Successfully', 'Operation Succesful!');
                console.log(selectedItem);
                $timeout(function () {
                    getPage();
                    $state.reload();
                }, 1000);
                //  reload();
            }, function () {
                //  getPage();
            });
        }

        function selectTemplate(image) {
            $http.post('/template/select', { id: image.id, type: 'email' }).success(function (response) {
                toastr.success('Succesfully selected the template.', 'Operation Succesful!');
                getPage();
            }).error(function (response) {
                toastr.error('Operation was unsuccesful.', 'Oops!');
                console.dir(response);
            });
        }
        
          function deleteTemplate(image) {

            if ($window.confirm("Please confirm to delete the template?"))
            {
                $http.post('/template/delete', {id: image.id}).success(function (response) {
                    toastr.success('Template Deleted', 'Operation Succesful!');
                    getPage();
                }).error(function (response) {
                    toastr.error('Operation was unsuccesful.', 'Oops!');
                    console.dir(response);
                });
            }

        }

        var getPage = function () {
            var url = '/template/email_template';

            $http.get(url)
                .success(function (data) {
                    if (data) {
                        vm.emails = data.data;

                    }
                });
        };
        getPage();
    }

    function UploadCtrl($scope, $uibModalInstance, toastr, $http) {
        $scope.ok = function () {
            var file = $scope.myFile1;
            var name = $scope.name;
            var fd = new FormData();
            fd.append('file', file);
            $http.post('/template/upload?type=thumb', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function (response) {
                var thumb_name = response.uploaded_name;
                var file = $scope.myFile;
                var fd = new FormData();
                fd.append('file', file);
                $http.post('/template/upload?type=template', fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).success(function (response) {
                    //toastr.success('Template Added.', 'Operation Succesful!');
                    var temp_name = response.uploaded_name;
                    $http.post('/template/create', {
                        'name': name, 'template': temp_name, 'thumb': thumb_name, 'template_type': 'email'
                    }).success(function (response) {
                        console.log('3');
                        $uibModalInstance.close(true);
                    }).error(function (response) {
                        toastr.error('Cannot add template.', 'Oops!');
                        console.dir(response);
                        $uibModalInstance.dismiss(false);
                    });
                }).error(function (response) {
                    toastr.error('Cant upload the thumbnail.', 'Oops!');
                    console.dir(response);
                    $uibModalInstance.dismiss(false);
                });
            }).error(function (response) {
                toastr.error('Cant upload the template.', 'Oops!');
                console.dir(response);
                $uibModalInstance.dismiss(false);
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss(false);
        };
    }
})();