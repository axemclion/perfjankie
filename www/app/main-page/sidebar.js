angular
	.module('sidebar', ['ngRoute'])
	.controller('SideBarCtrl', [

		function() {
			this.categories = {
				js: ['EvaluateScript', 'TimerFire', 'EventDispatch', 'FunctionCall'],
				paint: ['Paint', 'Layout', 'RecalculateStyles', 'CompositeLayers'],
				content: ['ParseHTML', 'DecodeImage']
			};
		}
	]);