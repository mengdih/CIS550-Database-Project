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
	// 	$http({
	//   	url: '/genres/' + g.genre,
	//     method: 'GET'
	//   }).then(res => {
	//     console.log("movies: ", res.data);
	//     $scope.movies = res.data;
	//   }, err => {
	//     console.log("Movie ERROR: ", err);
	//   });
 //  }

  $scope.sortType = 'score'; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order

  $scope.data = {
    employees: [{
      firstName: 'John',
      lastName: 'Doe',
      age: 30
    },{
      firstName: 'Frank',
      lastName: 'Burns',
      age: 54
    },{
      firstName: 'Sue',
      lastName: 'Banter',
      age: 21
    }]
  };

  $scope.cuisineData = function() {
		$http({
	  	url: '/cuisine/' + $scope.cuisineName,
	    method: 'GET'
	  }).then(res => {
	    console.log("cuisine: ", res.data);
	    $scope.cuisineInfo = res.data;
	  }, err => {
	    console.log("Movie ERROR: ", err);
	  });
  }

  $scope.bestNeighborhood = function() {
    $http({
      url: '/cuisineNeighborhood/' + $scope.cuisineName,
      method: 'GET'
    }).then(res => {
      console.log("movies: ", res.data);
      $scope.neighborhood = res.data[0].neighborhood;
    }, err => {
      console.log("Movie ERROR: ", err);
    });
  }
});

// Controller for the Recommendations Page
app.controller('recommendationsController', function($scope, $http) {
  // TODO: Q2

  $scope.submitIds = function() {
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

// Controller for the Poster Page
app.controller('postersController', function($scope, $http) {
  // TODO: Q3
  $http({
	  url: '/random',
	  method: 'GET'
	}).then(res => {
	  console.log("posters: ", res.data);
	  var data = res.data;

	  var apiKey = 'b9da2ebd';

		posterData = [];

		for (var index in data) {
			d = data[index];
			console.log(d)
			$http({
		  	url: 'http://www.omdbapi.com/?i=' + d.imdb_id + '&apikey=' + apiKey,
		  	method: 'GET'
			}).then(res => {
			  console.log("api request: ", res.data);
			  posterData.push(res.data);
			}, err => {
			  console.log("API ERROR: ", err);
			});
	  }

	  $scope.posterData = posterData
	  console.log(posterData.length)

	  
	  // $scope.rowPosters = rowPosters;
	  // $scope.posterData2 = posterData;

	  // console.log(posterData.length);

	 // 			<div class="movie" id="results" ng-repeat="posterData in rowPosters">
   //          <div class="row" id="rowResults" ng-repeat="poster in posterData">
   //            <div class="column" ng-if="poster.Website != 'N/A'">
   //              <a ng-href="{{poster.Website}}" target="_blank"><img ng-src="{{poster.Poster}}" ng-alt="{{poster.Title}}" width="200" height="300"></a>
   //            </div>
   //            <div class="column" ng-if="poster.Website == 'N/A'">
   //              <img ng-src="{{poster.Poster}}" ng-alt="{{poster.Title}}" width="200" height="300">
   //            </div>
   //          </div>
   //        </div>
	}, err => {
	  console.log("Poster ERROR: ", err);
	});
});
