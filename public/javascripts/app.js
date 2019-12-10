var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard page
app.controller('dashboardController', function($scope, $http) {


  $scope.sortType = 'AVG_SCORE'; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order

  console.log("here")

  $scope.cuisineInfo = {}; // variable for containing cuisineInfo so it can be sorted later

  // function for getting the data for all restaurants with a certain cuisine
  $scope.cuisineData = function() { 
    // if statement to check if input field is empty
    if($scope.cuisineName != null && $scope.cuisineName != ""){
      // default values for parameters
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
        console.log("Cuisine ERROR: ", err);
      });
    }
  }

  // function for getting the best neighborhood
  $scope.bestNeighborhood = function() {
    // if statement to check if input field is empty
    if($scope.cuisineName != null && $scope.cuisineName != ""){
      // default values for parameters
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
        console.log("neighborhood: ", res.data);
        $scope.neighborhood = res.data[0].BORO;
      }, err => {
        console.log("Neighborhood ERROR: ", err);
      });
    }
  }
});

// Controller for the Don't Go Restaurant Page
app.controller('avoidsController', function($scope, $http) {
  /* For the first function
  Input: choose borough via dropdown menu
  Output: Restaurant Name, Cuisine Description, Inspectino Date, Critical Flag, and Inspection Score
  */
  $scope.options = [{boro:'Staten Island'},{boro:'Manhattan'},{boro:'Bronx'},{boro:'Queens'},{boro:'Brooklyn'}];
  $scope.locationInfo = {};
  $scope.submitBoro = function() {
    const boro = $scope.selectedBoro['boro'];
    console.log("debugging");
    console.log("selectedBoro: ", boro);
    $http({
      url: '/avoids/' + boro,
      method: 'GET'
    }).then(res => {
      console.log("location: ", res.data);
      $scope.locationInfo = res.data;
    }, err => {
      console.log("location ERROR: ", err);
    });
  }
 /*For the second function
 Input: Restaurant Name
 Output: Total Number of Violations, Violation Desctription
 */
 $scope.violationInfo = {};
 $scope.cuisineData = function() {
  const restaurantName = $scope.RestaurantName;
  console.log("restaurantName: ",restaurantName);
  $http({
    url: '/violation/' + restaurantName,
    method: 'GET'
  }).then(res => {
    console.log("violationInfo: ", res.data);
    $scope.violationInfo = res.data;
  }, err => {
    console.log("Violation ERROR: ", err);
  });
}
});

// Controller for the Collisions Page

app.controller('collisionController', function($scope, $http) {
  // function to return the average rating of all restaurants in neighborhoods with similar collisions, as well as the contributing factor
  $scope.collisionsData = function() {
   if($scope.minViolations != null && $scope.minViolations != ""){
    $http({
      url: '/collisions/' + $scope.minViolation,
      method: 'GET'
    }).then(res => {
      console.log("Summary statistics: ", res.data);
        $scope.rating = res.data[0].AVGRATING.toFixed(3);
        $scope.factor = res.data[0].CONTRIBUTING_FACTOR;
      }, err => {
        console.log("Collision ERROR: ", err);
      });
  }
}
});
