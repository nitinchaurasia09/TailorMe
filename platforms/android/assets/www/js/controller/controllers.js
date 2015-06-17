'use strict';
/* Controllers */
var appCtrl = angular.module('App.controllers', ['ui.bootstrap', 'ngAnimate', 'ngTouch', 'angucomplete-alt']);

appCtrl.controller('tailorGallery-ctrl', ['$scope', '$rootScope', 'webapi', '$routeParams', function ($scope, $rootScope, webapi, $routeParams) {
    webapi.Call('GET', urlServerUtil.TailorDetailUrl + 'TailorId=' + $routeParams.tailorId + "&Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
        $scope.TailorDetail = data;
    }).error(function (data, err, mess) {
        toastr.success('Error while fetching tailor details -' + data);
    });
    webapi.Call('GET', urlServerUtil.TailorGalleryUrl + 'TailorId=' + $routeParams.tailorId, "{}").success(function (data, status, headers, config) {
        $rootScope.TailorGallery = data;
        $('.navbar-absolute-bottom').show();
        $scope.slides = [];
        var i = 0;
        for (i = 0; i < data.length; i++) {
            var jsonObject = { image: data[i].GalleryImage, description: '' };
            $scope.slides.push(jsonObject);
        }

        $scope.direction = 'left';
        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.direction = (index > $scope.currentIndex) ? 'left' : 'right';
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.prevSlide = function () {

            $scope.direction = 'left';
            $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;

        };

        $scope.nextSlide = function () {

            $scope.direction = 'right';
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.slides.length - 1;

        };
    }).error(function (data, err, mess) {
        toastr.success('Error while fetching gallery details -' + data);
    });
    $scope.showModal = false;
    $scope.toggleModal = function () {
        $scope.showModal = !$scope.showModal;
    }
}])
.animation('.slide-animation', function () {
    return {
        addClass: function (element, className, done) {
            if (className == 'ng-hide') {
                TweenMax.to(element, 0.5, { left: -element.parent().width(), onComplete: done });
            }
            else {
                done();
            }
        },
        removeClass: function (element, className, done) {
            if (className == 'ng-hide') {
                element.removeClass('ng-hide');

                TweenMax.set(element, { left: element.parent().width() });
                TweenMax.to(element, 0.5, { left: 0, onComplete: done });
            }
            else {
                done();
            }
        }
    };
});

appCtrl.controller('tailor-Detail-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', '$routeParams', function ($scope, $rootScope, webapi, checkAuthenticated, $location, $routeParams) {
    $rootScope.latitude = $routeParams.lat;
    $rootScope.longitude = $routeParams.long;
    $('.navbar-absolute-bottom').show();
    webapi.Call('GET', urlServerUtil.TailorDealsUrl + 'TailorId=' + $routeParams.tailorId, "{}").success(function (data, status, headers, config) {
        $scope.TailorDeals = data;
    }).error(function (data, err, mess) {
        toastr.success('tailor-Detail-ctrl -' + data);
    });

    $scope.AddtoWishList = function (tId, uId, tName, addres, rating, image) {
        debugger;
        if (checkAuthenticated.IsAuthenticated() == false) {
            $location.path("/login");
            return false;
        }
        // $rootScope.myDB.transaction(processQuery);
        $scope.tailId = tId;
        $scope.usId = $rootScope.globals.currentUser.guid;
        $scope.tName = tName;
        $scope.address = addres;
        $scope.rating = rating;
        $scope.image = image;

        //Sumit's code
        $rootScope.myDB.transaction(function (tx) {
            tx.executeSql('Create table if not exists wishlist (userid ,tailorId ,tailorName,address,rating,image)');
            var query = 'select * from wishlist where userid="' + uId + '" and tailorId="' + tId + '"';
            tx.executeSql(query, [], getResult);
            //tx.executeSql('Delete from wishlist');
            // tx.executeSql('Insert into wishlist values("' + uId + '","' + tId + '","' + tName + '","' + addres + '","' + rating + '","'+image+'")');
        });
        function getResult(tx, result) {
            var i;
            if (result.rows.length > 0) {
                //toastr.success('Tailor already added to wishlist');
                toastr.warning('Tailor already added to wishlist');
            }
            else {
                tx.executeSql('Insert into wishlist values("' + $scope.usId + '","' + $scope.tailId + '","' + $scope.tName + '","' + $scope.address + '","' + $scope.rating + '","' + $scope.image + '")');
                //toastr.success('Tailor added to your wishlist');
                toastr.success('Tailor added to your wishlist');
            }
        }
        $scope.wishList = { TailorID: "", UserID: "" };
        var param = JSON.stringify({
            UserID: $scope.usId, TailorId: $scope.tailId
        });
        webapi.Call('POST', urlServerUtil.WishListUrl, param).success(function (data, status, headers, config) {
            if (data == true) {
                // toastr.success('Wish list saved');
                toastr.success('Wish list saved');
            }
        }).error(function (data) {
            toastr.success('AddtoWishList -' + data);
        });
    };


    webapi.Call('GET', urlServerUtil.TailorDetailUrl + 'TailorId=' + $routeParams.tailorId + "&Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
        debugger;
        $scope.TailorDetail = data;
        CreateMap();
    }).error(function (data, err, mess) {
        toastr.success('AddtoWishList 2-' + data);
    });


    function CreateMap() {

        var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng($rootScope.latitude, $rootScope.longitude),
            mapTypeId: google.maps.MapTypeId.RoadMap
        }

        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        $scope.markers = [];

        var infoWindow = new google.maps.InfoWindow();
        var lat_lng = new Array();
        var latlngbounds = new google.maps.LatLngBounds();
        var createMarker = function (info) {

            var myLatlng = new google.maps.LatLng(info.lat, info.long);
            lat_lng.push(myLatlng);

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: myLatlng,
                title: info.city
            });
            marker.content = '<div class="infoWindowContent">' + $scope.TailorDetail.TailorAddress + '</div>';
            latlngbounds.extend(marker.position);
            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.setContent('<h2>' + $scope.TailorDetail.TailorName + '</h2>');
                infoWindow.open($scope.map, marker);
            });
            $scope.map.setCenter(latlngbounds.getCenter());
            $scope.map.fitBounds(latlngbounds);
            $scope.markers.push(marker);
            // $scope.map.setCenter($rootScope.latitude,$rootScope.longitude);
        }
        var cities = [{
            lat: $rootScope.latitude,
            long: $rootScope.longitude
        },
        {
            lat: $scope.TailorDetail.Latitude,
            long: $scope.TailorDetail.Longitude
        }];
        var i = 0;
        for (i = 0; i < cities.length; i++) {

            createMarker(cities[i]);
        }

        $scope.openInfoWindow = function (e, selectedMarker) {
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        }


        //***********ROUTING****************//

        var icons = {
            start: new google.maps.MarkerImage(
             // URL
             '../../images/icons/select-location.png',
             // (width,height)
             new google.maps.Size(44, 32),
             // The origin point (x,y)
             new google.maps.Point(0, 0),
             // The anchor point (x,y)
             new google.maps.Point(22, 32)
            ),
            end: new google.maps.MarkerImage(
             // URL
             'end.png',
             // (width,height)
             new google.maps.Size(44, 32),
             // The origin point (x,y)
             new google.maps.Point(0, 0),
             // The anchor point (x,y)
             new google.maps.Point(22, 32)
            )
        };


        //Initialize the Path Array
        var path = new google.maps.MVCArray();

        //Initialize the Direction Service
        var service = new google.maps.DirectionsService();
        var directions = new google.maps.DirectionsRenderer({ suppressMarkers: true });

        //Set the Path Stroke Color
        var poly = new google.maps.Polyline({ map: $scope.map, strokeColor: '#4986E7' });
        var src;
        var des;
        //Loop and Draw Path Route between the Points on MAP
        for (var i = 0; i < lat_lng.length; i++) {
            //if ((i + 1) < lat_lng.length) {
            src = lat_lng[i];
            //des = lat_lng[i + 1];
            if ((i + 1) < lat_lng.length) {
                des = lat_lng[i];
            }
            path.push(src);
            poly.setPath(path);
            service.route({
                origin: src,
                destination: des,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                        path.push(result.routes[0].overview_path[i]);

                        //var leg = result.routes[0].legs[i];
                        // makeMarker(leg.start_location, icons.start, "title");
                        //makeMarker(leg.end_location, icons.end, 'title');
                    }
                }
            });
            //}
        }
    }
    function makeMarker(position, icon, title) {
        new google.maps.Marker({
            position: position,
            map: map,
            icon: icon,
            title: title
        });
    }

}]);

appCtrl.controller('login-ctrl',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', 'webapi',
    function ($scope, $rootScope, $location, AuthenticationService, webapi) {
        debugger;
        $('.navbar-absolute-bottom').show();
        $scope.GetAuthenticated = function () {
            debugger;
            $scope.dataLoading = true;
            webapi.Call('GET', urlServerUtil.UserLoginUrl + "UserEmail=" + $scope.username + "&Password=" + $scope.password, "{}").success(function (data, status, headers, config) {
                if (data != null && data != undefined && data != "null") {
                    toastr.success('Login Successfully');
                    $rootScope.UserInfo = data;
                    $rootScope.showLogin = false;
                    AuthenticationService.SetCredentials(data.GUID, data.FirstName + ' ' + data.LastName, '');
                    if ($rootScope.previousRoute == undefined) {
                        $location.path('/');
                    }
                    else {
                        window.location.href = "#" + $rootScope.previousRoute.split('#')[1].toString();
                    }
                } else {
                    toastr.error('Invalid Credentials');
                    $scope.error = data.message;
                }
            }).error(function (data, status) {
                toastr.success('login -' + data + ' ' + status);
            });
            $scope.dataLoading = false;
        };


        //$scope.$watch('UserInfo', function (value) {
        //    alert('Watch');
        //    alert(value);
        //});

        //Code after facebook and google sign in
        //var param = JSON.stringify({
        //    ID: '1', FirstName: 'N', LastName: 'M', Email: 'nm@g.com', AccType: 'FB'
        //});
        //webapi.Call('POST', urlServerUtil.ExternalUserUrl, param).success(function (data, status, headers, config) {
        //    toastr.success('Login Successfully');
        //    $rootScope.UserInfo = data;
        //    $rootScope.showLogin = false;
        //    AuthenticationService.SetCredentials(data.GUID, data.FirstName + ' ' + data.LastName, '');
        //    if ($rootScope.previousRoute == undefined) {
        //        $location.path('/');
        //    }
        //    else {
        //        window.location.href = "#" + $rootScope.previousRoute.split('#')[1].toString();
        //    }
        //}).error(function (data) {
        //    alert('Error-' + data);
        //});

    }]);




/*Prefect working and no changes required*/
appCtrl.controller('main-ctrl', ['$scope', 'webapi', '$rootScope', 'AuthenticationService', '$location', function ($scope, webapi, $rootScope, AuthenticationService, $location) {
    $rootScope.longitude = null;
    $rootScope.latitude = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.$apply(function () {
                $rootScope.latitude = position.coords.latitude;
                $rootScope.longitude = position.coords.longitude;
            });
        });
    }

    $('.navbar-absolute-bottom').show();
    $scope.setDb = function (dbObj) {
        $rootScope.myDB = dbObj;
    }

    $scope.logout = function () {
        $rootScope.showLogin = true;
        AuthenticationService.ClearCredentials();
    }

    $scope.GoBack = function () {
        window.history.back();
        return false;
    }

    $rootScope.ShowBackButton = true;
    if ($location.$$path.toString().indexOf("/", 1) < 0) {
        $rootScope.ShowBackButton = false;
    }
}]);

appCtrl.controller('location-ctrl', ['$scope', 'webapi', '$rootScope', function ($scope, webapi, $rootScope) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.$apply(function () {
                $rootScope.latitude = position.coords.latitude;
                $rootScope.longitude = position.coords.longitude;
            });
        });
    }
    $scope.getNearByTailor = function () {
        if ($rootScope.latitude != '' && $rootScope.latitude != undefined && $rootScope.latitude != null) {
            window.location.href = "#/tailorlisting/" + $rootScope.latitude + "/" + $rootScope.longitude;
        }
        else {
            toastr.success('Location Service is not enable in your mobile.');
        }
    }

    ///*******For autocomplete****************/
    webapi.Call('GET', urlServerUtil.GetLocationsUrl, "{}").success(function (data, status, headers, config) {
        var json = []
        for (var i = 0; i < data.length; i++) {
            json.push({ "TailorAddress": data[i].TailorAddress, "Latitude": data[i].Latitude, "Longitude": data[i].Longitude })
        }
        $scope.Location = json;
    }).error(function (data, err, mess) {
        toastr.success('GetLocations - ' + data);
    });
    /***************************************/
}]);

appCtrl.controller('sidebar-ctrl', ['$scope', 'webapi', '$rootScope', '$location', function ($scope, webapi, $rootScope, $location) {
    $scope.expand = function (anc, dv, ife) {
        if ($('#' + anc).hasClass('active')) {
            $('#' + anc).removeClass("active");
            $('#' + ife).addClass("fa-plus");
            $('#' + ife).removeClass("fa-minus");
            $('#' + dv).removeClass("show");
            $('#' + dv).addClass("hide");
        } else {
            $('#' + anc).addClass("active");
            $('#' + ife).removeClass("fa-plus");
            $('#' + ife).addClass("fa-minus");
            $('#' + dv).removeClass("hide");
            $('#' + dv).addClass("show");
        }
    }

    $scope.GetFeatures = function () {
        webapi.Call('GET', urlServerUtil.FeatureCategory, "{}").success(function (data, status, headers, config) {
            $rootScope.FeaturesAndCategory = data;
        }).error(function (data, err, mess) {
            toastr.error('Error while retrieving categories -' + data);
        });
    }

    $scope.GetFeatures();
    setInterval(function () {
        if ($rootScope.FeaturesAndCategory == '' || $rootScope.FeaturesAndCategory == null || $rootScope.FeaturesAndCategory == undefined) {
            $scope.GetFeatures();
        } else { return false; }
    }, 10000);
}]);

appCtrl.controller('footer-ctrl', ['$scope', 'webapi', '$rootScope', '$location', 'checkAuthenticated', 'AuthenticationService', function ($scope, webapi, $rootScope, $location, checkAuthenticated, AuthenticationService) {

    $rootScope.showLogin = true;
    if (checkAuthenticated.IsAuthenticated() == true) {
        $rootScope.showLogin = false;
    }

    $scope.logout = function () {
        $rootScope.showLogin = true;
        AuthenticationService.ClearCredentials();
    }
    $scope.redirectToTailorListing = function () {
        if ($rootScope.latitude != null && $rootScope.latitude != undefined) {
            webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
                $rootScope.Tailors = data;
                $location.path("/tailorlisting/" + $rootScope.latitude + "/" + $rootScope.longitude);
            }).error(function (data) {
                toastr.error('Error while showing tailor listing -' + data);
            });
        }
        else {
            toastr.warning('Please enable location services on your mobile.');
        }
    }
}]);

appCtrl.controller('tailorListing-ctrl', ['$scope', 'webapi', '$rootScope', '$routeParams', 'checkAuthenticated', '$location', function ($scope, webapi, $rootScope, $routeParams, checkAuthenticated, $location) {
    $('.navbar-absolute-bottom').show();;
    $scope.showActions = 0;
    $scope.showcss = [];
    $scope.getSwipe = function (ctrl, pos, current) {
        if ($scope.showcss.length == 0) {
            for (var i = 0; i < $rootScope.Tailors.length; i++) {
                if (i != current.$index)
                    $scope.showcss.push('position-center');
            }
        }
        /* for (var i = 0; i <= $rootScope.Tailors.length; i++) {
             debugger;
            // toastr.success(i + ',' + current.$index);
             if (i != current.$index) {
                 $("div[id*=lstTail]").removeClass('position-left');
                 $("div[id*=lstTail]").removeClass('position-right');
                 $("div[id*=lstTail]").addClass('position-center');
             }
         }*/
        //if (pos == 'position-left' && $scope.showcss[current.$index] == 'position-center') {
        if (pos == 'position-left' && $("#" + ctrl).hasClass('position-center')) {
            for (var i = 0; i < $rootScope.Tailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $scope.showcss[current.$index] = 'position-left';
            $("#" + ctrl).removeClass('position-center');
            $("#" + ctrl).addClass('position-left');
        }
        // if (pos == 'position-left' && $scope.showcss[current.$index] == 'position-right') {
        if (pos == 'position-left' && $("#" + ctrl).hasClass('position-right')) {
            for (var i = 0; i < $rootScope.Tailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $("#" + ctrl).removeClass('position-right');
            $("#" + ctrl).addClass('position-center');
            $scope.showcss[current.$index] = 'position-center';
        }

        // if (pos == 'position-right' && $scope.showcss[current.$index] == 'position-center') {
        if (pos == 'position-right' && $("#" + ctrl).hasClass('position-center')) {
            for (var i = 0; i < $rootScope.Tailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $("#" + ctrl).removeClass('position-center');
            $("#" + ctrl).addClass('position-right');
            $scope.showcss[current.$index] = 'position-right';
        }

        //if (pos == 'position-right' && $scope.showcss[current.$index] == 'position-left') {
        if (pos == 'position-right' && $("#" + ctrl).hasClass('position-left')) {
            for (var i = 0; i < $rootScope.Tailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $("#" + ctrl).removeClass('position-left');
            $("#" + ctrl).addClass('position-center');
            $scope.showcss[current.$index] = 'position-center';
        }
        $scope.showcss.length = 0;
    }

    if ($rootScope.longitude == undefined && $rootScope.longitude == null && $rootScope.longitude == '')
        $rootScope.longitude = $routeParams.long;
    if ($rootScope.latitude == undefined && $rootScope.latitude == null && $rootScope.latitude == '')
        $rootScope.latitude = $routeParams.lat;

    $scope.searchTailorbyName = function (tname) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "TailorName=" + tname + "&Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data, err, mess) {
            toastr.success('Error in TailorListing Tailor name search' + data);
        });
    }

    if ($routeParams.tname != null) {
        $scope.searchTailorbyName($routeParams.tname);
    }
    else if ($routeParams.featId != null && $routeParams.featId != '' && $routeParams.featId != undefined) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Feature=" + $routeParams.featId + "&Category=" + $routeParams.catId + "&Latitude=" + $routeParams.lat + "&Longitude=" + $routeParams.long, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data, err, mess) {
            toastr.success('Feature/Category search-' + data);
        });
    }
    else if (($routeParams.featId == null && $routeParams.featId == undefined) && ($routeParams.tname == null && $routeParams.tname == undefined) && $routeParams.lat != null) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Latitude=" + $routeParams.lat + "&Longitude=" + $routeParams.long, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data, err, mess) {
            toastr.success('Near by search' + data);
        });
    }


    //Need correction in this.
    $scope.AddtoWishList = function (tId, uId, tName, addres, rating, image) {
        debugger;
        if (checkAuthenticated.IsAuthenticated() == false) {
            $location.path("/login");
            return false;
        }
        // $rootScope.myDB.transaction(processQuery);
        $scope.tailId = tId;
        $scope.usId = $rootScope.globals.currentUser.guid;
        $scope.tName = tName;
        $scope.address = addres;
        $scope.rating = rating;
        $scope.image = image;

        //Sumit's code
        $rootScope.myDB.transaction(function (tx) {
            tx.executeSql('Create table if not exists wishlist (userid ,tailorId ,tailorName,address,rating,image)');
            var query = 'select * from wishlist where userid="' + uId + '" and tailorId="' + tId + '"';
            tx.executeSql(query, [], getResult);
            //tx.executeSql('Delete from wishlist');
            // tx.executeSql('Insert into wishlist values("' + uId + '","' + tId + '","' + tName + '","' + addres + '","' + rating + '","'+image+'")');
        });
        function getResult(tx, result) {
            var i;
            if (result.rows.length > 0) {
                //toastr.success('Tailor already added to wishlist');
                toastr.warning('Tailor already added to wishlist');
            }
            else {
                tx.executeSql('Insert into wishlist values("' + $scope.usId + '","' + $scope.tailId + '","' + $scope.tName + '","' + $scope.address + '","' + $scope.rating + '","' + $scope.image + '")');
                //toastr.success('Tailor added to your wishlist');
                toastr.success('Tailor added to your wishlist');
            }
        }
        $scope.wishList = { TailorID: "", UserID: "" };
        var param = JSON.stringify({
            UserID: $scope.usId, TailorId: $scope.tailId
        });
        webapi.Call('POST', urlServerUtil.WishListUrl, param).success(function (data, status, headers, config) {
            if (data == true) {
                //toastr.success('Wish list saved');
                toastr.success('Wish list saved');
            }
        }).error(function (data) {
            // toastr.success('AddtoWishList error-' + data);
            toastr.error('AddtoWishList error-' + data);
        });
    };
}]);

appCtrl.controller('wishlist-ctrl', ['$rootScope', 'webapi', 'checkAuthenticated', function ($rootScope, webapi, checkAuthenticated) {
    $('.navbar-absolute-bottom').show();
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }

    if (navigator.onLine) {
        webapi.Call('GET', urlServerUtil.WishListUrl + '?UserId=' + $rootScope.globals.currentUser.guid, "{}").success(function (data, status, headers, config) {
            $rootScope.Wishlists = data;
        }).error(function (data) {
            toastr.error('wishlist-ctrl -' + data);
        });
    } else {
        $rootScope.myDB.transaction(function (tx) {
            var query = 'select * from wishlist';
            tx.executeSql(query, [], getResult);
        });
    }

    function getResult(tx, result) {
        if (result.rows.length < 1) {
            // toastr.success('No tailor added in your wishlist');
            toastr.warning('No tailor added in your wishlist');
        }
        else {
            var arWishlist = new Array();
            var i;
            for (i = 0; i < result.rows.length; i++) {
                arWishlist.push(result.rows.item(i));
            }
            $rootScope.Wishlists = arWishlist;
        }
    }
}]);

appCtrl.controller('deal-ctrl', ['$scope', 'webapi', function ($scope, webapi) {
    webapi.Call('GET', urlServerUtil.AllDealsUrl, "{}").success(function (data, status, headers, config) {
        $scope.AllDeals = data;
    }).error(function (data, err, mess) {
        toastr.success('deal-ctrl -' + data);
    });
}]);

appCtrl.controller('change-password-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', function ($scope, $rootScope, webapi, checkAuthenticated, $location) {
    $('.navbar-absolute-bottom').show();
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }

    webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
        $scope.login = data;
    }).error(function (data, err, mess) {
        toastr.success('change-password-ctrl -' + data);
    });

    $scope.updatePassword = function (user) {
        if ($scope.newpassword != $scope.repassword && $scope.newpassword != undefined) {
            toastr.success('New password does not match');
            return false;
        }
        if (user == undefined) {
            toastr.success('Error in Update passord');
        }
        var param = JSON.stringify({
            GUID: $rootScope.globals.currentUser.guid, UserName: user[0].UserName, UserEmail: user[0].UserEmail, UserPhone: user[0].UserPhone, UserLocation: user[0].UserLocation, FirstName: user[0].FirstName, LastName: user[0].LastName, Password: $scope.newpassword, UserImage: user[0].UserImage == undefined ? urlServerUtil.blankImage : user[0].UserImage
        });
        if ($scope.login[0].GUID.toString() == $rootScope.globals.currentUser.guid.toString()) {// && $scope.login[0].Password == $scope.oldpassword) {
            webapi.Call('POST', urlServerUtil.UserUrl, param).success(function (data, status, headers, config) {
                toastr.success('Password updated successfully');
            }).error(function (data, err, mess) {
                toastr.success('updatePassword -' + data);
            });
        } else {
            toastr.warning('Old password does not match');
        }
    };
}]);

appCtrl.controller('user-detail-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', function ($scope, $rootScope, webapi, checkAuthenticated, $location) {
    $('.navbar-absolute-bottom').show();
    $('#myDetailPage').show();
    $('#editDetailPage').hide();
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }

    webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
        $scope.UserDetail = data[0];
    }).error(function (data, err, mess) {
        toastr.success('user-detail-ctrl -' + data);
    });
    $scope.editDetail = function (user) {
        var param = JSON.stringify({
            GUID: $rootScope.globals.currentUser.guid, UserName: user.UserName, UserEmail: user.UserEmail, UserPhone: user.UserPhone, UserLocation: user.UserLocation, FirstName: user.FirstName, LastName: user.LastName, UserImage: $rootScope.UserDetail == undefined ? urlServerUtil.blankImage : $rootScope.UserDetail.UserImage
        });
        webapi.Call('POST', urlServerUtil.UserUrl, param).success(function (data, status, headers, config) {
            toastr.success('User Updated Successfully');
            $scope.user = null;
            webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
                $scope.UserDetail = data[0];
                $('#myDetailPage').show();
                $('#editDetailPage').hide();
            });
        }).error(function (data, err, mess) {
            toastr.success('editDetail -' + data);
        });
    };

    $scope.ShowEditDetail = function () {
        $('#editDetailPage').show();
        $scope.user = { name: '', email: '', phone: '', address: '' };
        $scope.user.name = $scope.UserDetail.UserName;
        $scope.user.email = $scope.UserDetail.UserEmail;
        $scope.user.phone = $scope.UserDetail.UserPhone;
        $scope.user.address = $scope.UserDetail.UserLocation;
        $('#myDetailPage').hide();
    };
}]);

appCtrl.controller('review-ctrl', ['$rootScope', 'checkAuthenticated', '$location', '$scope', '$routeParams', 'webapi', function ($rootScope, checkAuthenticated, $location, $scope, $routeParams, webapi) {
    //Mendatory code for authentication        
    $('.navbar-absolute-bottom').show();
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }

    $scope.writeReview = function (review) {
        var param = JSON.stringify({
            UserId: $rootScope.globals.currentUser.guid, UserName: review.name, TailorId: $routeParams.tailorId, Comment: review.comment, ReviewTitle: review.email, Rating: review.quality
        });

        webapi.Call('POST', urlServerUtil.ReviewUrl, param).success(function (data, status, headers, config) {
            $scope.review = null;
            toastr.success('Review added successfully.');
        }).error(function (data) {
            toastr.success('writeReview -' + data);
        });
    };
}]);

appCtrl.controller('add-user-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', function ($scope, $rootScope, webapi, checkAuthenticated, $location) {
    $scope.addDetail = function (user) {
        var param = JSON.stringify({
            GUID: '', UserName: user.name, UserEmail: user.email, UserPhone: user.phone, UserLocation: user.address, FirstName: user.fname, LastName: user.lname, Password: user.pass, UserImage: urlServerUtil.blankImage
        });
        webapi.Call('POST', urlServerUtil.UserUrl, param).success(function (data, status, headers, config) {
            $scope.user = null;
            if (data == true)
                toastr.success('User Added Successfully');
            else
                toastr.success('User already exists');
        }).error(function (data, err, mess) {
            toastr.success('addDetail -' + data);
        });
    };
}]);

appCtrl.controller('help-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {
    webapi.Call('GET', urlServerUtil.PageDescriptionUrl + '3', "{}").success(function (data, status, headers, config) {
        $(".info").html(data[0].Description);
    }).error(function (data, err, mess) {
        toastr.success('help-ctrl - ' + data);
    });
}]);

appCtrl.controller('about-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {
    webapi.Call('GET', urlServerUtil.PageDescriptionUrl + '2', "{}").success(function (data, status, headers, config) {
        $(".info").html(data[0].Description);
    }).error(function (data, err, mess) {
        toastr.success('about-ctrl - ' + data);
    });
}]);

appCtrl.controller('trend-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {
    webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Feature=E0357B88-660D-40BE-AEE1-CB2024370E46&Latitude=" + $rootScope.longitude + "&Longitude=" + $rootScope.latitude + "&trend=1", "{}").success(function (data, status, headers, config) {
        $rootScope.TrendTailors = data;
    }).error(function (data) {
        toastr.success('Trend-' + data);
    });
    $('.navbar-absolute-bottom').show();;
    $scope.showActions = 0;
    $scope.showcss = [];
    $scope.getSwipe = function (ctrl, pos, current) {
        if ($scope.showcss.length == 0) {
            for (var i = 0; i < $rootScope.TrendTailors.length; i++) {
                if (i != current.$index)
                    $scope.showcss.push('position-center');
            }
        }
        /* for (var i = 0; i <= $rootScope.TrendTailors.length; i++) {
             debugger;
            // toastr.success(i + ',' + current.$index);
             if (i != current.$index) {
                 $("div[id*=lstTail]").removeClass('position-left');
                 $("div[id*=lstTail]").removeClass('position-right');
                 $("div[id*=lstTail]").addClass('position-center');
             }
         }*/
        //if (pos == 'position-left' && $scope.showcss[current.$index] == 'position-center') {
        if (pos == 'position-left' && $("#" + ctrl).hasClass('position-center')) {
            for (var i = 0; i < $rootScope.TrendTailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $scope.showcss[current.$index] = 'position-left';
            $("#" + ctrl).removeClass('position-center');
            $("#" + ctrl).addClass('position-left');
        }
        // if (pos == 'position-left' && $scope.showcss[current.$index] == 'position-right') {
        if (pos == 'position-left' && $("#" + ctrl).hasClass('position-right')) {
            for (var i = 0; i < $rootScope.TrendTailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $("#" + ctrl).removeClass('position-right');
            $("#" + ctrl).addClass('position-center');
            $scope.showcss[current.$index] = 'position-center';
        }

        // if (pos == 'position-right' && $scope.showcss[current.$index] == 'position-center') {
        if (pos == 'position-right' && $("#" + ctrl).hasClass('position-center')) {
            for (var i = 0; i < $rootScope.TrendTailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $("#" + ctrl).removeClass('position-center');
            $("#" + ctrl).addClass('position-right');
            $scope.showcss[current.$index] = 'position-right';
        }

        //if (pos == 'position-right' && $scope.showcss[current.$index] == 'position-left') {
        if (pos == 'position-right' && $("#" + ctrl).hasClass('position-left')) {
            for (var i = 0; i < $rootScope.TrendTailors.length; i++) {
                $scope.showcss.push('position-center');
                $("div[id*=lstTail]").removeClass('position-left');
                $("div[id*=lstTail]").removeClass('position-right');
                $("div[id*=lstTail]").addClass('position-center');
            }
            $("#" + ctrl).removeClass('position-left');
            $("#" + ctrl).addClass('position-center');
            $scope.showcss[current.$index] = 'position-center';
        }
        $scope.showcss.length = 0;
    }

    //Need correction in this.
    $scope.AddtoWishList = function (tId, uId, tName, addres, rating, image) {
        debugger;
        if (checkAuthenticated.IsAuthenticated() == false) {
            $location.path("/login");
            return false;
        }
        // $rootScope.myDB.transaction(processQuery);
        $scope.tailId = tId;
        $scope.usId = $rootScope.globals.currentUser.guid;
        $scope.tName = tName;
        $scope.address = addres;
        $scope.rating = rating;
        $scope.image = image;

        //Sumit's code
        $rootScope.myDB.transaction(function (tx) {
            tx.executeSql('Create table if not exists wishlist (userid ,tailorId ,tailorName,address,rating,image)');
            var query = 'select * from wishlist where userid="' + uId + '" and tailorId="' + tId + '"';
            tx.executeSql(query, [], getResult);
            //tx.executeSql('Delete from wishlist');
            // tx.executeSql('Insert into wishlist values("' + uId + '","' + tId + '","' + tName + '","' + addres + '","' + rating + '","'+image+'")');
        });
        function getResult(tx, result) {
            var i;
            if (result.rows.length > 0) {
                //toastr.success('Tailor already added to wishlist');
                toastr.warning('Tailor already added to wishlist');
            }
            else {
                tx.executeSql('Insert into wishlist values("' + $scope.usId + '","' + $scope.tailId + '","' + $scope.tName + '","' + $scope.address + '","' + $scope.rating + '","' + $scope.image + '")');
                //toastr.success('Tailor added to your wishlist');
                toastr.success('Tailor added to your wishlist');
            }
        }
        $scope.wishList = { TailorID: "", UserID: "" };
        var param = JSON.stringify({
            UserID: $scope.usId, TailorId: $scope.tailId
        });
        webapi.Call('POST', urlServerUtil.WishListUrl, param).success(function (data, status, headers, config) {
            if (data == true) {
                //toastr.success('Wish list saved');
                toastr.success('Wish list saved');
            }
        }).error(function (data) {
            // toastr.success('AddtoWishList error-' + data);
            toastr.error('AddtoWishList error-' + data);
        });
    };
}]);

appCtrl.controller('contactus-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {
    $scope.addQuery = function (Query) {
        debugger;
        var param = JSON.stringify({
            Guid: '', UserName: Query.UserName, UserEmail: Query.Email, UserPhone: Query.UserPhone, QueryDescription: Query.Description, TailorId: '', DeleteStatus: 0
        });
        webapi.Call('POST', urlServerUtil.QueryUrl, param).success(function (data, status, headers, config) {
            $scope.Query = null;
            toastr.success('Query Added Successfully');
        }).error(function (data) {
            toastr.success('addDetail -' + data);
        });
    };
}]);
