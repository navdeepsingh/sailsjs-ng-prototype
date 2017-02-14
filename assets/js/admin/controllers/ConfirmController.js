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
        .controller('ConfirmController', ConfirmController)
        .controller('UploadConfirmCtrl', UploadConfirmCtrl);

    ConfirmController.$inject = ['$http', '$uibModal', 'toastr', '$state', '$timeout', '$window']

    function ConfirmController($http, $uibModal, toastr, $state, $timeout, $window) {

        var vm = this;
        vm.selectTemplate = selectTemplate;
        vm.deleteTemplate = deleteTemplate;
        vm.openUploadForm = openUploadForm;
        vm.smsChecked = false;
        vm.smsSubmit = smsSubmit;
        vm.mobile = '+65 ';
        vm.mobileDone = false;


        function smsSubmit() {
            if (vm.smsChecked) {
                if (vm.mobile.length < 5) {
                    toastr.error('Mobile numbers seems invalid.', 'Oops!');
                    return;
                }
                else {
                    $http.post('/template/smsSubmit', { mobile: vm.mobile, id: vm.participant_id }).success(function (response) {
                        //    toastr.success('Thanks for updating the mobile no.', 'Operation Succesful!');
                        $('.confirmMsg').css('display', 'block');
                        vm.participant_id = "";
                        vm.mobileDone = true;
                        //  getPage();
                    }).error(function (response) {
                        toastr.error('Operation was unsuccesful.', 'Oops!');
                        console.dir(response);
                    });
                }
            }
            else {
                $http.post('/template/nosmsSubmit', { id: vm.participant_id }).success(function (response) {
                    //    toastr.success('Thanks for updating the mobile no.', 'Operation Succesful!');
                    $('.confirmMsg').css('display', 'block');
                    vm.mobileDone = true;
                    vm.participant_id = "";
                    //  getPage();
                }).error(function (response) {
                    toastr.error('Operation was unsuccesful.', 'Oops!');
                    console.dir(response);
                });

            }
        }

        function openUploadForm() {

            var modalInstance = $uibModal.open({
                templateUrl: 'uploadContent_confirm.html',
                controller: ['$scope', '$uibModalInstance', 'toastr', '$http', UploadConfirmCtrl],
            });

            modalInstance.result.then(function (selectedItem) {
                toastr.success('Template Created Successfully', 'Operation Succesful!');
                console.log(selectedItem);
                $timeout(function () {
                    getPage();
                    $state.reload();
                }, 1000);
            }, function () {
                //  getPage();
            });
        }


        function selectTemplate(image) {
            $http.post('/template/select', { id: image.id, type: 'confirm' }).success(function (response) {
                toastr.success('Template Activated', 'Operation Succesful!');
                getPage();
            }).error(function (response) {
                toastr.error('Operation was unsuccesful.', 'Oops!');
                console.dir(response);
            });
        }

        function deleteTemplate(image) {

            if ($window.confirm("Please confirm to delete the template?")) {
                $http.post('/template/delete', { id: image.id }).success(function (response) {
                    toastr.success('Template Deleted', 'Operation Succesful!');
                    getPage();
                }).error(function (response) {
                    toastr.error('Operation was unsuccesful.', 'Oops!');
                    console.dir(response);
                });
            }

        }

        var getPage = function () {
            var url = '/template/confirm_template';

            $http.get(url)
                .success(function (data) {
                    if (data) {
                        vm.templates = data.data;
                    }
                });
        };
        getPage();
    }

    function UploadConfirmCtrl($scope, $uibModalInstance, toastr, $http) {
        $scope.ok = function () {
            var file = $scope.myFile;
            var name = $scope.name;
            var fd = new FormData();
            fd.append('file', file);
            $http.post('/template/upload?type=template', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function (response) {
                var temp_name = response.uploaded_name;
                var file = $scope.myFile1;
                var fd = new FormData();
                fd.append('file', file);
                $http.post('/template/upload?type=thumb', fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).success(function (response) {
                    //toastr.success('Template Added.', 'Operation Succesful!');
                    $uibModalInstance.close(true);
                    var thumb_name = response.uploaded_name;
                    $http.post('/template/create', { 'name': name, 'template': temp_name, 'thumb': thumb_name, 'template_type': 'confirm' }).success(function (response) {
                        toastr.success('Template Created Successfully', 'Operation Succesful!');
                    }).error(function (response) {
                        alert('Cannot add template (error in console)');
                        console.dir(response);
                    });

                }).error(function (response) {
                    toastr.error('Cant upload the files.', 'Oops!');
                    console.dir(response);
                });

            }).error(function (response) {
                toastr.error('Cant upload the files.', 'Oops!');
                console.dir(response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss(false);
        };
    }
})();