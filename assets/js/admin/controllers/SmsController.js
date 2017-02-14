(function () {
    angular.module('RDash')
        .controller('SmsController', SmsController)

    SmsController.$inject = ['$http', 'toastr']

    function SmsController($http, toastr) {

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
            $http.post('/sms/update', vm).success(function (response) {
                toastr.success('Succesfully SMS Text updated.', 'Operation Succesful!');
            }).error(function (response) {
                toastr.error('Operation was unsuccesful.', 'Oops!');
                console.dir(response);
            });
        }

        var getPage = function () {
            //console.log(paginationOptions);
            var url = '/sms/show';

            $http.get(url)
                .success(function (data) {
                    if (data.data) {
                        vm.text = data.data.text;
                        vm.id = data.data.id;
                        vm.confirm_text = data.data.confirm_text;
                    }
                });
        };
        getPage();
    }
})();