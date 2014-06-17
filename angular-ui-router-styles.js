(function(){

    var mod = angular.module('angular-ui-router-styles', ['ui.router']);

    mod.directive('uiRouterStyles', ['$rootScope', '$compile',
        function($rootScope, $compile){
			return {
			    restrict: 'EA',
			    link: function(scope, elem, attr) {
			 	   var html = '<link rel="stylesheet" ng-repeat="(stateCtrl, cssUrl) in stateStyles" ng-href="{{cssUrl}}" />';
			 	   angular.element('head').append($compile(html)(scope));
			 	   scope.stateStyles = {};
			 	   scope.makeArr = function(css) {
			 		   return (!Array.isArray(css)) ? [css] : css;
			 	   }
			 	   
			 	   $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			 		   if (fromState && fromState.css){
			 			   fromState.css = scope.makeArr(fromState.css);
			 			   angular.forEach(fromState.css, function(sheet){
			 				   delete scope.stateStyles[sheet];
			 			   });
			 		   }
			 		   if (toState && toState.css){
			 			   toState.css = scope.makeArr(toState.css);
			 			   angular.forEach(toState.css, function(sheet){
			 				   scope.stateStyles[sheet] = sheet;
			 			   });
			 		   }
			 	   });
			    }
			};
        }
    ]);

})();