'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('grasimApp', [
  'App.filters',
  'App.services',
  'App.directives',
  'App.controllers',
  'ngRoute',
  'mobile-angular-ui',
  'ngCookies',
  'ngAutocomplete',
  'angucomplete-alt'
]);

app.config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {
    $routeProvider.when('/', { templateUrl: 'partials/home.html', controller: 'main-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/help', { templateUrl: 'partials/help.html', controller: 'help-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/contactus', { templateUrl: 'partials/contactus.html', controller: 'contactus-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/trend', { templateUrl: 'partials/tailor-trend.html', controller: 'trend-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/LocationSearch', { templateUrl: 'partials/LocationSearch.html', controller: 'location-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/aboutus', { templateUrl: 'partials/aboutus.html', controller: 'about-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/tailorlisting/:lat/:long', { templateUrl: 'partials/tailor-listing.html', controller: 'tailorListing-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/tailorlisting/:tname/:lat/:long', { templateUrl: 'partials/tailor-listing.html', controller: 'tailorListing-ctrl', reloadOnSearch: false, title: '' });
    //Without lat long
    $routeProvider.when('/tailorlisting/:tname//', { templateUrl: 'partials/tailor-listing.html', controller: 'tailorListing-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/tailorlisting/:featId/:catId/:lat/:long', { templateUrl: 'partials/tailor-listing.html', controller: 'tailorListing-ctrl', reloadOnSearch: false, title: '' });
    //Without lat long
    $routeProvider.when('/tailorlisting/:featId/:catId//', { templateUrl: 'partials/tailor-listing.html', controller: 'tailorListing-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/tailorgallery/:tailorId', { templateUrl: 'partials/tailor-gallery.html', controller: 'tailorGallery-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/tailordetail/:tailorId/:lat/:long', { templateUrl: 'partials/tailor-detail.html', controller: 'tailor-Detail-ctrl', reloadOnSearch: false, title: '' });

    //Without lat long
    $routeProvider.when('/tailordetail/:tailorId//', { templateUrl: 'partials/tailor-detail.html', controller: 'tailor-Detail-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/galleryDetail/:tailorId', { templateUrl: 'partials/tailor-gallery-detail.html', controller: 'tailor-Detail-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/login', { templateUrl: 'partials/login.html', controller: 'login-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/deals', { templateUrl: 'partials/deals.html', controller: 'deal-ctrl', reloadOnSearch: false, title: '' });

    $routeProvider.when('/review/:tailorId', { templateUrl: 'partials/write-review.html', controller: 'review-ctrl', reloadOnSearch: false, title: '' });

    //Given by Sandeep
    $routeProvider.when('/changePassword', { templateUrl: 'partials/Change-password.html', controller: 'change-password-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/detail', { templateUrl: 'partials/myDetail.html', controller: 'user-detail-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/register', { templateUrl: 'partials/AddUser.html', controller: 'add-user-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/userinfo', { templateUrl: 'partials/user-info.html', controller: 'user-detail-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.when('/wishlist', { templateUrl: 'partials/wishlist.html', controller: 'wishlist-ctrl', reloadOnSearch: false, title: '' });
    $routeProvider.otherwise({ redirectTo: '/' });
}]);

app.run(function ($rootScope, $http, $location, $cookieStore) {
    // set the CSRF token here
    //$http.defaults.useXDomain = true;
    //$http.defaults.withCredentials = false;
    $rootScope.globals = $cookieStore.get('globals') == undefined && $cookieStore.get('globals') == null ? '' : $cookieStore.get('globals');
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }


    $rootScope.$on('$locationChangeStart', function (evt, absNewUrl, absOldUrl) {
        $rootScope.previousRoute = absOldUrl;
    });

    $rootScope.$on("$routeChangeSuccess", function (event, currentRoute, previousRoute) {

    });

});

