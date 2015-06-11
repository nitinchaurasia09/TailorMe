'use strict';
/* Directives */
angular.module('App.directives', []);
/*Directive created for Phone only*/
var phoneRegx = /(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/;
var phoneTenDigitRegx = /^[0-9]{1,10}$/;

angular.module('App.directives').directive('appVersion', ['version', function (version) {
    return function (scope, elm, attrs) {
        elm.text(version);
    };
}
]).directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
            scope.stars = [];
            for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                    filled: i < scope.ratingValue
                });
            }
        }
    }
}).directive('slider', function ($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            images: '='
        },
        link: function (scope, elem, attrs) {

            scope.currentIndex = 0;

            scope.next = function () {
                scope.currentIndex < scope.images.length - 1 ? scope.currentIndex++ : scope.currentIndex = 0;
            };

            scope.prev = function () {
                scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
            };

            scope.$watch('currentIndex', function () {
                scope.images.forEach(function (image) {
                    image.visible = false;
                });
                scope.images[scope.currentIndex].visible = true;

            });

            /* Start: For Automatic slideshow*/

            var timer;

            var sliderFunc = function () {
                timer = $timeout(function () {
                    scope.next();
                    timer = $timeout(sliderFunc, 5000);
                }, 5000);
            };

            sliderFunc();

            scope.$on('$destroy', function () {
                $timeout.cancel(timer);
            });

            /* End : For Automatic slideshow*/

        },
        templateUrl: 'templates/templateurl.html'
    }
}).directive("loader", function ($rootScope) {

    return function ($scope, element, attrs) {

        $scope.$on("loader_show", function () {

            return element.show();
        });
        return $scope.$on("loader_hide", function () {

            return element.hide();
        });
    };
}
).directive('modalDialog', function () {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true, // Replace with the template below
        transclude: true, // we want to insert custom content inside the directive
        link: function (scope, element, attrs) {

            scope.dialogStyle = {};
            if (attrs.width)
                scope.dialogStyle.width = attrs.width;
            if (attrs.height)
                scope.dialogStyle.height = attrs.height;
            scope.hideModal = function () {
                scope.show = false;
            };
        },
        template: '<div class=\'ng-modal\' ng-show=\'show\'>  <div class=\'ng-modal-overlay\' ng-click=\'hideModal()\'></div>  <div class=\'ng-modal-dialog\' ng-style=\'dialogStyle\'> <div class=\'ng-modal-close\' ng-click=\'hideModal()\'>X</div>    <div class=\'ng-modal-dialog-content\' ng-transclude></div>            </div></div>' // See below
    };
})
.directive('autoComplete', function ($timeout) {
    return function (scope, iElement, iAttrs) {
        iElement.autocomplete({
            source: scope[iAttrs.uiItems],
            select: function () {
                $timeout(function () {
                    iElement.trigger('input');
                }, 0);
            }
        });
    };
}).directive('phoneOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue === undefined) return '';
                var isUsphone = phoneRegx.test(inputValue),
				isphoneTenNumber = phoneTenDigitRegx.test(inputValue);
                if (inputValue.length == 10 && isphoneTenNumber === true) {
                    modelCtrl.$setValidity('txtPhone', true);
                    return inputValue;
                }
                else if (inputValue.length == 12 && isUsphone === true) {
                    modelCtrl.$setValidity('txtPhone', true);
                    return inputValue;
                }
                else {
                    modelCtrl.$setValidity('txtPhone', false);
                    return undefined;
                }
                return inputValue;
            });
        }
    };
}).directive('passwordOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue === undefined) return '';

                var validLength = 6,
				minSuccess = 3,
				isNumeric = +/\d+/.test(inputValue),
				isCapitals = +/[A-Z]+/.test(inputValue),
				isSmall = +/[a-z]+/.test(inputValue),
				isSpecial = +/[!@#$%&\/=\?_\.,:;\-]+/.test(inputValue);
                if (isNumeric + isCapitals + isSmall + isSpecial < minSuccess || inputValue.length < validLength) {
                    modelCtrl.$setValidity('Txt_NewPassword', false);
                    return undefined;
                }
                else {
                    modelCtrl.$setValidity('Txt_NewPassword', true);
                    return inputValue;
                }
                return inputValue;
            });
        }
    };
});




