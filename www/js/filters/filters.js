'use strict';
/* Filters */
angular.module('App.filters', []).filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    };
}]).filter('splitThreeRecord', function () {
    
    return function (arrayLength) {
        if (arrayLength.toString() != 'NaN') {
            arrayLength = Math.ceil(arrayLength);
            var arr = new Array(arrayLength), i = 0;
            for (; i < arrayLength; i++) {
                arr[i] = i;
            }
        }
        return arr;
    };
});;


