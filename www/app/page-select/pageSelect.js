angular
	.module('pageSelect', ['ngRoute', 'Backend'])
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.when('/page-select', {
				templateUrl: 'app/page-select/page-select.html',
				controller: 'PageSelectCtrl',
				controllerAs: 'pageselect',
				resolve: {
					PageList: ['Data',
						function(data) {
							return data.pagelist();
						}
					]
				}
			});
		}
	])
	.controller('PageSelectCtrl', ['PageList',
		function(PageList) {
			this.pagelist = PageList;
		}
	]);