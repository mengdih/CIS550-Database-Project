var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard page
app.controller('dashboardController', function($scope, $http) {
 //  $http({
 //    url: '/genres',
 //    method: 'GET'
 //  }).then(res => {
 //    console.log("genres: ", res.data);
 //    $scope.genres = res.data;
 //  }, err => {
 //    console.log("Genre ERROR: ", err);
 //  });

  // $scope.showMovies = function(g) {
  //  $http({
  //    url: '/genres/' + g.genre,
  //     method: 'GET'
  //   }).then(res => {
  //     console.log("movies: ", res.data);
  //     $scope.movies = res.data;
  //   }, err => {
  //     console.log("Movie ERROR: ", err);
  //   });
 //  }

  $scope.sortType = 'AVG_SCORE'; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order

  console.log("here")

  $scope.cuisineInfo = {};

  $scope.cuisineData = function() {
    if($scope.cuisineName != null && $scope.cuisineName != ""){
      var score = 100;
      var rating = -1;
      var price = 100;

      if($scope.scoreFilter != null && $scope.scoreFilter != "") score = $scope.scoreFilter;
      if($scope.ratingFilter != null && $scope.ratingFilter != "") rating = $scope.ratingFilter;
      if($scope.priceFilter != null && $scope.priceFilter != "") price = $scope.priceFilter;

      $http({
        url: '/cuisine/' + $scope.cuisineName + '/' + score + '/' + rating + '/' + price,
        method: 'GET'
      }).then(res => {
        console.log("cuisine: ", res.data);
        $scope.cuisineInfo = res.data;
      }, err => {
        console.log("Movie ERROR: ", err);
      });
    }
  }

  $scope.bestNeighborhood = function() {
    if($scope.cuisineName != null && $scope.cuisineName != ""){
      var score = 100;
      var rating = -1;
      var price = 100;

      if($scope.scoreFilter != null && $scope.scoreFilter != "") score = $scope.scoreFilter;
      if($scope.ratingFilter != null && $scope.ratingFilter != "") rating = $scope.ratingFilter;
      if($scope.priceFilter != null && $scope.priceFilter != "") price = $scope.priceFilter;

      $http({
        url: '/cuisineNeighborhood/' + $scope.cuisineName + '/' + score + '/' + rating + '/' + price,
        method: 'GET'
      }).then(res => {
        console.log("movies: ", res.data);
        $scope.neighborhood = res.data[0].BORO;
      }, err => {
        console.log("Movie ERROR: ", err);
      });
  }
  }

  $scope.globalName = null;
  $scope.hoverNow = false;

  // TOOLTIP HERE!!!!!!!!!!!!!!

  $scope.hoverIn = function(cuisine){
      $scope.globalName = cuisine.NAME;
        $scope.hoverNow = true;
        console.log($scope.globalName);
    };

    $scope.hoverOut = function(cuisine){
      $scope.globalName = null;
        $scope.hoverNow = false;
        console.log($scope.globalName);
    };
});

// Controller for the Recommendations Page
app.controller('avoidsController', function($scope, $http) {
  // TODO: Q2
  $scope.options = [{boro:'Staten Island'},{boro:'Manhattan'},{boro:'Bronx'},{boro:'Queens'},{boro:'Brooklyn'}];
  $scope.locationInfo = {};
  $scope.submitBoro = function() {
  const boro = $scope.selectedBoro['boro'];
  //if($scope.selectedBoro != null || $scope.selectedBoro != ""){
  console.log("debugging");
  //console.log("selectedBoro: ",$scope.selectedBoro['boro']);
  console.log("selectedBoro: ", boro);
    $http({
      //url: '/recommendations/' + $scope.selectedBoro,
      // url: '/recommendations/' + $scope.selectedBoro + '/' + boro,
      url: '/recommendations/' + boro,
      method: 'GET'
    }).then(res => {
      console.log("location: ", res.data);
      $scope.locationInfo = res.data;
    }, err => {
      console.log("location ERROR: ", err);
    });
  //}
}

$scope.restaurantOutput = function() {
  $http({
    url: '/recommendations/' + $scope.movieName,
    method: 'GET'
  }).then(res => {
    console.log("movies: ", res.data);
    $scope.recommendedMovies = res.data;
  }, err => {
    console.log("Movie ERROR: ", err);
  });
}


});

// Controller for the Best Of Page
app.controller('bestofController', function($scope, $http) {
  // TODO: Q3
  $http({
    url: '/decades',
    method: 'GET'
  }).then(res => {
    console.log("decades: ", res.data);
    $scope.decades = res.data;
  }, err => {
    console.log("Decades ERROR: ", err);
  });

  $scope.submitDecade = function() {
    $http({
      url: '/bestof/' + $scope.selectedDecade.decade,
      method: 'GET'
    }).then(res => {
      console.log("best movies: ", res.data);
      $scope.bestofMovies = res.data;
    }, err => {
      console.log("Best Movie ERROR: ", err);
    });
  }
});

// Controller for the Collisions Page
app.controller('collisionController', function($scope, $http) {
  $scope.collisionsData = function() {
    if($scope.minViolations != null && $scope.minViolations != ""){
      $http({
        url: '/collisions/' + $scope.minViolations,
        method: 'GET'
      }).then(res => {
        console.log("movies: ", res.data);
        $scope.rating = res.data[0].AVGRATING;
        $scope.factor = res.data[0].CONTRIBUTING_FACTOR;
      }, err => {
        console.log("Movie ERROR: ", err);
      });
  }
  }
});
