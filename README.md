angular-ui-router-styles
========================

Small module providing the ability to have state-specific CSS stylesheets, by integrating with AngularUI Router.
This module is based on https://raw.githubusercontent.com/tennisgent/angular-route-styles which works with Angular's built-in `$routeProvider`.

How to install:
---------------

**1) Download or clone this repository**

**2) Include the `angular-ui-router-styles.js` file to your `index.html` file**

```html
<!-- attribute e.g. -->
<!-- should be added at the end of your body tag -->
<body>
	<div ng-app="myApp" ui-router-styles>
    ...
	</div>
    <script scr="path/to/angular-ui-router-styles.js"></script>
</body>
```


```html 
<!-- tag e.g. -->
<!-- should be added at the end of your body tag -->
<body>
	<div ng-app="myApp">
    	<ui-router-styles>
		...
		</ui-router-styles>
	</div>
    <script scr="path/to/angular-ui-router-styles.js"></script>
</body>
```

**3) Declare the `'angular-ui-router-styles'` module as a dependency in your main app**

```javascript
angular.module('myApp', ['ngRoute','angular-ui-router-styles' /* other dependencies here */]);
```
**NOTE**: you must also include the `ui-router` service module, or at least make the
module available by adding the script to your html file.

**4) Add your route-specific styles to the `$stateProvider` in your app's config**

```javascript
var app = angular.module('myApp', []);
app.config(['$stateProvider', function($stateProvider){
	$stateProvider
        .state("state.one", {
            url: "/some/state/1",
            templateUrl: 'partials/partial1.html',
        	css: 'styles/partial1.css'
        })
        .state("state.two", {
            url: "/some/state/2",
            templateUrl: 'partials/partial2.html',
        	css: ['styles/partial1.css','styles/partial2.css']
        })
        .state("state.three", {
            url: "/some/state/3",
            templateUrl: 'partials/partial3.html'
        })
        // more states can be declared here
}]);
```
**Things to notice:**
* Specifying a css property on the state is completely optional, as it was omitted from the `'/some/state/3'` example. If the state doesn't have a css property, the service will simply do nothing for that state.
* You can even have multiple page-specific stylesheets per route, as in the `'/some/state/2'` example above, where the css property is an **array** of relative paths to the stylesheets needed for that state.

How does it work?
-----------------
###State Setup:

This config adds a custom css property to the object that is used to setup each page's state. That object gets passed to each `'$stateChangeStart'` event as `toState`. So when listening to the `'$stateChangeStart'` event, we can grab the css property that we specified and append/remove those `<link />` tags as needed.

###Custom Head Directive:

```javascript
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
```

This directive does the following things:

* It compiles (using `$compile`) an html string that creates a set of <link /> tags for every item in the `scope.stateStyles` object using `ng-repeat` and `ng-href`.
* It appends that compiled set of `<link />` elements to the `<head>` tag.
* It then uses the `$rootScope` to listen for `'$stateChangeStart'` events. For every `'$stateChangeStart'` event, it grabs the fromState object (the state that the user is about to leave) and removes its partial-specific css file(s) from the `<head>` tag. It also grabs the `toState` object (the state that the user is about to go to) and adds any of its partial-specific css file(s) to the `<head>` tag.
* And the `ng-repeat` part of the compiled `<link />` tag handles all of the adding and removing of the page-specific stylesheets based on what gets added to or removed from the `scope.stateStyles` object.
