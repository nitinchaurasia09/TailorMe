'use strict';
/* Controllers */
var appCtrl = angular.module('App.controllers', ['ui.bootstrap', 'ngAnimate', 'ngTouch', 'angucomplete-alt']);

appCtrl.controller('main-ctrl', ['$scope', '$http', 'webapi', '$rootScope', 'AuthenticationService', '$location', function ($scope, $http, webapi, $rootScope, AuthenticationService, $location) {
    $('.navbar-absolute-bottom').show();
    $scope.setDb = function (dbObj) {

        $rootScope.myDB = dbObj;
    }


    //Code after facebook and google sign in
    //var param = JSON.stringify({
    //    ID: '1', FirstName: 'N', LastName: 'M', Email: 'nm@g.com', AccType: 'FB'
    //});
    //webapi.Call('POST', urlServerUtil.ExternalUserUrl, param).success(function (data, status, headers, config) {
    //    if(data){
    //     }    
    //}).error(function (data) {
    //    alert('Error-' + data);
    //});

    $scope.logout = function () {
        $rootScope.showLogin = true;
        AuthenticationService.ClearCredentials();
    }
    $scope.SetNewCreds = function (_id, _name, _email, _accountType) {
        alert('in SetNewCreds');

        AuthenticationService.SetCredentials(_id, _name, _email, _accountType);
        if ($rootScope.previousRoute == undefined) {
            $location.path('/');
        }
        else {
            window.location.href = "#" + $rootScope.previousRoute.split('#')[1].toString();
        }
    }
    $rootScope.longitude = '';
    $rootScope.latitude = '';
    $scope.GoBack = function () {
        window.history.back();
        return false;
    }
    $rootScope.ShowBackButton = true;
    //alert($location.$$path.toString().indexOf("#/", 2));
    if ($location.$$path.toString().indexOf("/", 1) < 0) {
        $rootScope.ShowBackButton = false;
    }
}]);

appCtrl.controller('location-ctrl', ['$scope', '$http', 'webapi', '$rootScope', 'AuthenticationService', '$location', function ($scope, $http, webapi, $rootScope, AuthenticationService, $location) {

    $scope.redirectToTailorListing = function () {
        window.location.href = "#/tailorlisting/" + $rootScope.latitude + "/" + $rootScope.longitude;
    }

    ///*******For autocomplete****************/
    webapi.Call('GET', urlServerUtil.GetLocationsUrl, "{}").success(function (data, status, headers, config) {
        var json = []
        for (var i = 0; i < data.length; i++) {
            json.push({ "TailorAddress": data[i].TailorAddress, "Latitude": data[i].Latitude, "Longitude": data[i].Longitude })
        }
        $scope.Location = json;
    }).error(function (data) {
        alert('GetLocations - ' + data);
    });
    /***************************************/
}]);

appCtrl.controller('tailorListing-ctrl', ['$scope', '$http', 'webapi', '$rootScope', '$routeParams', 'checkAuthenticated', '$location', function ($scope, $http, webapi, $rootScope, $routeParams, checkAuthenticated, $location) {
    $('.navbar-absolute-bottom').show();
    //$scope.showcss = 'position-center'; 
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
            // alert(i + ',' + current.$index);
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

    $rootScope.longitude = $routeParams.long;
    $rootScope.latitude = $routeParams.lat;
    $scope.searchTailorbyName = function (tname) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "TailorName=" + tname + "&Latitude=" + $routeParams.lat + "&Longitude=" + $routeParams.long, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data) {
            alert('searchTailorbyName - ' + data);
        });
    }

    if ($routeParams.tname != null && $routeParams.tname != '' && $routeParams.tname != undefined) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "TailorName=" + $routeParams.tname + "&Latitude=" + $routeParams.lat + "&Longitude=" + $routeParams.long, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data) {
            alert('searchTailorbyName 2-' + data);
        });
    }
    else if ($routeParams.featId != null && $routeParams.featId != '' && $routeParams.featId != undefined) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Feature=" + $routeParams.featId + "&Category=" + $routeParams.catId + "&Latitude=" + $routeParams.lat + "&Longitude=" + $routeParams.long, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data) {
            alert('searchTailorbyName 3-' + data);
        });
    }
    else if (($routeParams.featId == null && $routeParams.featId == undefined) && ($routeParams.tname == null && $routeParams.tname == undefined) && $routeParams.lat != null) {
        webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Latitude=" + $routeParams.lat + "&Longitude=" + $routeParams.long, "{}").success(function (data, status, headers, config) {
            $rootScope.Tailors = data;
        }).error(function (data) {
            alert('searchTailorbyName 4-' + data);
        });
    }

    $scope.AddtoWishList = function (tId, uId, tName, addres, rating, image) {
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

        $scope.wishList = { TailorID: "", UserID: "" };
        var param = JSON.stringify({
            UserID: $scope.usId, TailorId: $scope.tailId
        });
        webapi.Call('POST', urlServerUtil.WishListUrl, param).success(function (data, status, headers, config) {
            if (data == true) {
                //alert('Wish list saved');
                toastr.success('Wish list saved');
            }
        }).error(function (data) {
            // alert('AddtoWishList error-' + data);
            toastr.error('AddtoWishList error-' + data);
        });
    };

    function getResult(tx, result) {
        var i;
        if (result.rows.length > 0) {
            //alert('Tailor already added to wishlist');
            toastr.warning('Tailor already added to wishlist');
        }
        else {
            tx.executeSql('Insert into wishlist values("' + $scope.usId + '","' + $scope.tailId + '","' + $scope.tName + '","' + $scope.address + '","' + $scope.rating + '","' + $scope.image + '")');
            //alert('Tailor added to your wishlist');
            toastr.success('Tailor added to your wishlist');
        }
    }
}]);

appCtrl.controller('sidebar-ctrl', ['$scope', '$http', 'webapi', '$rootScope', '$location', function ($scope, $http, webapi, $rootScope, $location) {
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

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $scope.$apply(function () {
                $rootScope.latitude = position.coords.latitude;
                $rootScope.longitude = position.coords.longitude;
            });
        });
    }

    webapi.Call('GET', urlServerUtil.FeatureCategory, "{}").success(function (data, status, headers, config) {
        $rootScope.FeaturesAndCategory = data;
    }).error(function (data) {
        //alert('Error while retrieving categories -' + data);
        toastr.error('Error while retrieving categories -' + data);
    });
    $scope.submitsearchform = function (url) {
        $location.path(url);
    }
}]);


appCtrl.controller('footer-ctrl', ['$scope', 'webapi', '$rootScope', '$location', function ($scope, webapi, $rootScope, $location) {
    $rootScope.showLogin = true;
    if ($rootScope.globals != "") {
        if ($rootScope.globals.currentUser.guid != null && $rootScope.globals.currentUser.guid != undefined) {
            $rootScope.showLogin = false;
        }
    }
    $scope.logout = function () {
        $rootScope.showLogin = true;
        AuthenticationService.ClearCredentials();
    }
    $scope.redirectToTailorListing = function () {
        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.$apply(function () {
                    $rootScope.latitude = position.coords.latitude;
                    $rootScope.longitude = position.coords.longitude;
                });
            });
        }
        debugger;
        if ($rootScope.latitude != null && $rootScope.latitude != undefined) {
            webapi.Call('GET', urlServerUtil.TailorSearchUrl + "Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
                $rootScope.Tailors = data;
                $location.path("/tailorlisting/" + $rootScope.latitude + "/" + $rootScope.longitude);
            }).error(function (data) {
                //alert('Error while showing tailor listing -' + data);
                toastr.error('Error while showing tailor listing -' + data);
            });
        }
        else {
            //alert('Please enable location services on your mobile.');
            toastr.warning('Please enable location services on your mobile.');
        }
    }
}]);

appCtrl.controller('wishlist-ctrl', ['$scope', '$rootScope', 'webapi', '$routeParams', 'checkAuthenticated', function ($scope, $rootScope, webapi, $routeParams, checkAuthenticated) {
    $('.navbar-absolute-bottom').show();
    //$scope.try = "Wishlist";
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }
    $rootScope.longitude = $routeParams.long;
    $rootScope.latitude = $routeParams.lat;

    if (!navigator.onLine) {

        // $rootScope.myDB.transaction(processQuery);
        webapi.Call('GET', urlServerUtil.WishListUrl + '?UserId=' + $rootScope.globals.currentUser.guid, "{}").success(function (data, status, headers, config) {
            $rootScope.Wishlists = data;
        }).error(function (data) {
            // alert('wishlist-ctrl -' + data);
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
            // alert('No tailor added in your wishlist');
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

appCtrl.controller('tailorGallery-ctrl', ['$scope', '$rootScope', 'webapi', '$routeParams', function ($scope, $rootScope, webapi, $routeParams) {

    webapi.Call('GET', urlServerUtil.TailorDetailUrl + 'TailorId=' + $routeParams.tailorId + "&Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
        $scope.TailorDetail = data;
    }).error(function (data) {
        alert('Error while fetching tailor details -' + data);
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

        /*    { image: 'images/deleteImages/img00.jpg', description: 'Image 00' },
            { image: 'images/deleteImages/img01.jpg', description: 'Image 01' },
            { image: 'images/deleteImages/img02.jpg', description: 'Image 02' },
            { image: 'images/deleteImages/img03.jpg', description: 'Image 03' },
            { image: 'images/deleteImages/img04.jpg', description: 'Image 04' }
    ];*/
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
    }).error(function (data) {
        alert('Error while fetching gallery details -' + data);
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
    }).error(function (data) {
        alert('tailor-Detail-ctrl -' + data);
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

        $scope.wishList = { TailorID: "", UserID: "" };
        var param = JSON.stringify({
            UserID: $scope.usId, TailorId: $scope.tailId
        });
        webapi.Call('POST', urlServerUtil.WishListUrl, param).success(function (data, status, headers, config) {
            if (data == true) {
                // alert('Wish list saved');
                toastr.success('Wish list saved');
            }
        }).error(function (data) {
            alert('AddtoWishList -' + data);
        });
    };


    webapi.Call('GET', urlServerUtil.TailorDetailUrl + 'TailorId=' + $routeParams.tailorId + "&Latitude=" + $rootScope.latitude + "&Longitude=" + $rootScope.longitude, "{}").success(function (data, status, headers, config) {
        $scope.TailorDetail = data;
        CreateMap();
    }).error(function (data) {
        alert('AddtoWishList 2-' + data);
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

appCtrl.controller('deal-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {

    webapi.Call('GET', urlServerUtil.AllDealsUrl, "{}").success(function (data, status, headers, config) {
        $scope.AllDeals = data;
    }).error(function (data) {
        alert('deal-ctrl -' + data);
    });
}]);

appCtrl.controller('change-password-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', function ($scope, $rootScope, webapi, checkAuthenticated, $location) {
    $('.navbar-absolute-bottom').show();
    //Mendatory code for authentication
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }

    webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
        $scope.login = data;
    }).error(function (data) {
        alert('change-password-ctrl -' + data);
    });

    $scope.updatePassword = function (user) {

        if ($scope.newpassword != $scope.repassword && $scope.newpassword != undefined) {
            alert('New password does not match');
            return false;
        }
        var param = JSON.stringify({
            GUID: $rootScope.globals.currentUser.guid, Password: $scope.newpassword
        });
        if ($scope.login[0].GUID.toString() == $rootScope.globals.currentUser.guid.toString()) {// && $scope.login[0].Password == $scope.oldpassword) {
            webapi.Call('PUT', urlServerUtil.UserUrl, param).success(function (data, status, headers, config) {
                //alert('Password updated successfully');
                toastr.success('Password updated successfully');
            }).error(function (data) {
                alert('updatePassword -' + data);
            });
        } else {
            // alert('Old password does not match');
            toastr.warning('Old password does not match');
        }
    };
}]);

appCtrl.controller('user-detail-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', function ($scope, $rootScope, webapi, checkAuthenticated, $location) {
    $('.navbar-absolute-bottom').show();
    $('#myDetailPage').show();
    $('#editDetailPage').hide();
    //Mendatory code for authentication
    if (checkAuthenticated.IsAuthenticated() == false) {
        $location.path("/login");
        return false;
    }

    webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
        $scope.UserDetail = data[0];
    }).error(function (data) {
        alert('user-detail-ctrl -' + data);
    });
    $scope.editDetail = function (user) {

        var param = JSON.stringify({
            GUID: $rootScope.globals.currentUser.guid, UserName: user.UserName, UserEmail: user.UserEmail, UserPhone: user.UserPhone, UserLocation: user.UserLocation, FirstName: user.FirstName, LastName: user.LastName
        });
        webapi.Call('POST', urlServerUtil.UserUrl, param).success(function (data, status, headers, config) {
            // alert('User Updated Successfully');
            toastr.success('User Updated Successfully');
            webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
                $scope.UserDetail = data[0];
                $('#myDetailPage').show();
                $('#editDetailPage').hide();
            });
        }).error(function (data) {
            alert('editDetail -' + data);
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


appCtrl.controller('login-ctrl',
    ['$scope', '$http', '$rootScope', '$location', 'AuthenticationService', 'webapi',
    function ($scope, $http, $rootScope, $location, AuthenticationService, webapi) {
        $('.navbar-absolute-bottom').show();
        // AuthenticationService.ClearCredentials();

        $scope.login = function () {
            $scope.dataLoading = true;

            webapi.Call('GET', urlServerUtil.UserLoginUrl + "UserEmail=" + $scope.username + "&Password=" + $scope.password, "{}").success(function (data, status, headers, config) {
                if (data != null && data != undefined && data != "null") {
                    alert('Login Successfully');
                    $rootScope.showLogin = false;
                    AuthenticationService.SetCredentials(data.GUID, data.FirstName + ' ' + data.LastName, '');
                    if ($rootScope.previousRoute == undefined) {
                        $location.path('/');
                    }
                    else {
                        window.location.href = "#" + $rootScope.previousRoute.split('#')[1].toString();
                    }
                } else {
                    // alert('Invalid Credentials');
                    toastr.error('Invalid Credentials');
                    $scope.error = data.message;
                }
            }).error(function (data, status) {
                alert('login -' + data + ' ' + status);
            });
            $scope.dataLoading = false;
        };

        //Given by Sandeep///$rootScope.globals.currentUser.guid
        //$scope.login = { userID: "", password: "", newpassword: "", repassword: "", email: "", phone: "", address: "" };
        //$scope.getDetail = function () {
        //    webapi.Call('GET', urlServerUtil.UserUrl + "/" + $rootScope.globals.currentUser.guid).success(function (data, status, headers, config) {
        //        
        //        $scope.login = data;
        //    });
        //};

        /**************************************************************************************/
        /*

        // This is called with the results from from FB.getLoginStatus().
        var isLoggedIn = false;
        function statusChangeCallback(response) {
            alert('statusChangeCallbak');

            if (response.status === 'connected') {
                
                // Logged into your app and Facebook.
                //console.log(response.authResponse.accessToken);
                $("#logout").show();
                $("#login").hide();
                
                testAPI();
                isLoggedIn = true;
                
               // document.getElementById('facebook').setAttribute('style', 'display: none');
            } else if (response.status === 'not_authorized') {
                document.getElementById('facebook').setAttribute('style', 'display: none');
                // The person is logged into Facebook, but not your app.
                document.getElementById('status').innerHTML = 'Please log ' +
                  'into this app.';
            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
                document.getElementById('status').innerHTML = 'Please log ' +
                  'into Facebook.';
            }
        }
        $("#logout").on('click', function () {
            logout();

        });
        $scope.logout = function () {
            gapi.auth.signOut();

            if (isLoggedIn) {
                FB.logout(function (response) {
                    
                    // Person is now logged out
                    var isLoggedIn = false;
                    $("#status").hide();
                    document.getElementById('signinButton').setAttribute('style', 'display: block');
                    //  document.getElementById('facebook').setAttribute('style', 'display: block');

                });
            }
        }

        $scope.checkLoginState =function() {
            alert('chekLoginstate ng');
            FB.getLoginStatus(function (response) {
                
                statusChangeCallback(response);
                alert('from main - ' + isLoggedIn);
                return isLoggedIn;
            });
        }

        

        window.fbAsyncInit = function () {
            FB.init({
                appId: '781466591940188',
                cookie: true,  // enable cookies to allow the server to access the session
                xfbml: true,  // parse social plugins on this page
                version: 'v2.1', // use version 2.1
                channelUrl:'http://localhost:55264/index.html'
            });



            FB.getLoginStatus(function (response) {
                
                alert('getloginStatus alone');
                statusChangeCallback(response);
            });


        };

        // Load the SDK asynchronously
        (function (d, s, id) {
            
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        function testAPI() {
            //console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', function (response) {
                //console.log('Successful login for: ' + response.name);
                //API hit sending response.id to save in db
                
                AuthenticationService.SetCredentials(response.id, response.name, response.email, 'fb');
                if ($rootScope.previousRoute == undefined) {
                    $location.path('/');
                }
                else {
                    window.location.href = "#" + $rootScope.previousRoute.split('#')[1].toString();
                }
                document.getElementById('signinButton').setAttribute('style', 'display: none');
               // document.getElementById('facebook').setAttribute('style', 'display: none');

                document.getElementById('status').innerHTML =
                  'Thanks for logging in, ' + response.name + '!';
            });
        }*/

        /*********************************************************************************************/



    }]);


appCtrl.controller('review-ctrl',
    ['$rootScope', 'checkAuthenticated', '$location', '$scope', '$routeParams', 'webapi',
    function ($rootScope, checkAuthenticated, $location, $scope, $routeParams, webapi) {
        //Mendatory code for authentication
        $('.navbar-absolute-bottom').show();
        if (checkAuthenticated.IsAuthenticated() == false) {
            $location.path("/login");
            return false;
        }

        $scope.writeReview = function (review) {
            $scope.review = { tailorID: "", userID: "", title: "", comment: "", quality: "" };
            var param = JSON.stringify({
                UserId: $rootScope.globals.currentUser.guid, TailorId: $routeParams.tailorId,
                Comment: review.comment, ReviewTitle: review.title, Rating: review.quality
            });
            webapi.Call('POST', urlServerUtil.ReviewUrl, param).success(function (data, status, headers, config) {
                alert(data);
            }).error(function (data) {
                alert('writeReview -' + data);
            });
        };
    }]);


appCtrl.controller('add-user-ctrl', ['$scope', '$rootScope', 'webapi', 'checkAuthenticated', '$location', function ($scope, $rootScope, webapi, checkAuthenticated, $location) {
    $scope.addDetail = function (user) {
        var param = JSON.stringify({
            GUID: '', UserName: user.name, UserEmail: user.email, UserPhone: user.phone, UserLocation: user.address, FirstName: user.fname, LastName: user.lname, Password: user.pass, UserImage: user.UserImage
        });
        webapi.Call('POST', urlServerUtil.UserUrl, param).success(function (data, status, headers, config) {
            //alert('User Added Successfully');
            toastr.success('User Added Successfully');
        }).error(function (data) {
            alert('addDetail -' + data);
        });
    };
    var imageFromGallery;

    $scope.capturePhoto = function () {
        alert('take pic');
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
            quality: 50,
            destinationType: destinationType.DATA_URL
        });
    };
    $scope.capturePhotoEdit = function () {
        alert('cap pic');
        // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
            quality: 20, allowEdit: true,
            destinationType: destinationType.DATA_URL
        });
    }
    $scope.getPhoto = function (source) {
        alert('get pic');
        // Retrieve image file location from specified source
        navigator.camera.getPicture(onPhotoURISuccess, onFail, {
            quality: 50,
            destinationType: destinationType.FILE_URI,
            sourceType: source
        });
    }
    $scope.selectPicture = function () {

    };
    $scope.uploadPicture = function () {

    };
    function onPhotoDataSuccess(imageData) {
        // Uncomment to view the base64-encoded image data
        // console.log(imageData);

        // Get image handle
        //
        alert(imageData);
        var smallImage = document.getElementById('smallImage');

        // Unhide image elements
        //
        smallImage.style.display = 'block';

        // Show the captured photo
        // The in-line CSS rules are used to resize the image
        //
        smallImage.src = "data:image/jpeg;base64," + imageData;
    }

    function onPhotoURISuccess(imageURI) {
        // Uncomment to view the image file URI
        // console.log(imageURI);

        // Get image handle
        //
        alert(imageURI);
        var largeImage = document.getElementById('largeImage');

        // Unhide image elements
        //
        largeImage.style.display = 'block';

        // Show the captured photo
        // The in-line CSS rules are used to resize the image
        //
        largeImage.src = imageURI;
    }
}]);


appCtrl.controller('help-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {
    webapi.Call('GET', urlServerUtil.PageDescriptionUrl + '3', "{}").success(function (data, status, headers, config) {
        $(".info").html(data[0].Description);
    }).error(function (data) {
        alert('help-ctrl - ' + data);
    });
}]);


appCtrl.controller('about-ctrl', ['$scope', '$rootScope', 'webapi', function ($scope, $rootScope, webapi) {
    webapi.Call('GET', urlServerUtil.PageDescriptionUrl + '2', "{}").success(function (data, status, headers, config) {
        $(".info").html(data[0].Description);
    }).error(function (data) {
        alert('help-ctrl - ' + data);
    });
}]);
