angular
	.module('sidebar', ['ngRoute'])
	.controller('SideBarCtrl', ['$routeParams', '$scope',
		function($routeParams, $scope) {
			var self = this;
			$scope.$on('$routeChangeSuccess', function(scope, next, current) {
				var browser = $routeParams.browser;
				self.categories = {
					'Frame Rates': ['framesPerSec_raf', 'meanFrameTime', 'droppedFrameCount'],
				};
				if (['chrome', 'safari', 'android'].indexOf(browser) !== -1) {
					self.categories['Paint'] = ['Paint', 'Layout', 'RecalculateStyles', 'CompositeLayers'];
					self.categories['Javascript'] = ['TimerInstall', 'TimerFire', 'EventDispatch', 'FunctionCall'];
				}
				if (browser !== 'safari'){
					self.categories['Network'] = ['domInteractive', 'domLoading'];
				}
			});
		}
	]);