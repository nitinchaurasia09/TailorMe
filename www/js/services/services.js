'use strict';
/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('App.services', ['Services.Ajax']).value('version', '0.1');

angular.module('Services.Ajax', []).service('webapi', function ($http) {
    return {
        Call: function (method, url, data) {
            var promise = $http({
                method: method,
                data: data,
                url: url
            }).success(function (data, status, headers, config) {
                return data;
            }).error(function (data) {
                return data;                
            });
            return promise;
        }
    }
}).factory('httpInterceptor', function ($q, $rootScope, $log) {

    var numLoadings = 0;

    return {
        request: function (config) {

            numLoadings++;

            // Show loader
            $rootScope.$broadcast("loader_show");
            return config || $q.when(config)

        },
        response: function (response) {

            if ((--numLoadings) === 0) {
                // Hide loader
                $rootScope.$broadcast("loader_hide");
            }

            return response || $q.when(response);

        },
        responseError: function (response) {

            if (!(--numLoadings)) {
                // Hide loader
                $rootScope.$broadcast("loader_hide");
            }

            return $q.reject(response);
        }
    };
})
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
}).factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', 'webapi',
    function (Base64, $http, $cookieStore, $rootScope, $timeout, webapi) {
        var service = {};
        service.Login = function (username, password, callback) {

            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            //$timeout(function () {
            //    var response = { success: username === 'test@test.com' && password === 'test' };
            //    if (!response.success) {
            //        response.message = 'Username or password is incorrect';
            //    }
            //    callback(response);
            //}, 1000);


            /* Use this for real authentication
             ----------------------------------------------*/
            webapi.Call('GET', urlServerUtil.UserLoginUrl + "UserEmail=" + username + "&Password=" + password, "{}").success(function (data, status, headers, config) {
                callback(data);
            });

        };

        service.SetCredentials = function (guid, username,email, accountType) {
            var authdata = Base64.encode(username + ':' + email+':'+accountType);
            
            $rootScope.globals = {
                currentUser: {
                    guid: guid,
                    username: username,
                    email: email,
                    accountType:accountType,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = '';
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return service;
    }])

.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
    /* jshint ignore:end */
}).service('checkAuthenticated', function ($cookieStore, $rootScope) {

    return {

        IsAuthenticated: function () {
            var promise = $cookieStore.get('globals') == undefined && $cookieStore.get('globals') == null ? $rootScope.globals : $cookieStore.get('globals');
            if (promise != undefined && promise != null && promise != "")
                return promise;
            else
                return false;
        }
    }
});
