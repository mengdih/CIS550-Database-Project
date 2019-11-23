var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */

var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* ------------------------------------------- */
/* ----- Routers to handle FILE requests ----- */
/* ------------------------------------------- */

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

/* ----- Q2 (Recommendations) ----- */
router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

/* ----- Q3 (Best Of Decades) ----- */
router.get('/bestof', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

/* ----- Bonus (Posters) ----- */
router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

/* Template for a FILE request router:

Specifies that when the app recieves a GET request at <PATH>,
it should respond by sending file <MY_FILE>

router.get('<PATH>', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', '<MY_FILE>'));
});

*/


/* ------------------------------------------------ */
/* ----- Routers to handle data requests ----- */
/* ------------------------------------------------ */

/* ----- Q1 (Dashboard) ----- */

router.get('/cuisine/:cuisine', function (req, res) {
  var cuisine = req.params.cuisine;

  var query = "SELECT title, rating, vote_count FROM Genres g, Movies m WHERE g.movie_id = m.id \
  AND genre = '" + cuisine + "' ORDER BY rating DESC, vote_count DESC LIMIT 10";

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/cuisineNeighborhood/:cuisine', function (req, res) {
  var cuisine = req.params.cuisine;

  var query = "SELECT title, rating, vote_count FROM Genres g, Movies m WHERE g.movie_id = m.id \
  AND genre = '" + genre + "' ORDER BY rating DESC, vote_count DESC LIMIT 10";

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

/* ----- Q2 (Recommendations) ----- */

router.get('/recommendations/:movie', function(req, res) {
  var movieName = req.params.movie;

  var query = "SELECT title, id, rating, vote_count FROM Movies m JOIN \
  (SELECT g.movie_id FROM Genres g JOIN (SELECT DISTINCT genre FROM Genres g, Movies m \
  WHERE g.movie_id = m.id AND m.title = '" + movieName + "') temp on temp.genre = g.genre \
  GROUP BY g.movie_id HAVING COUNT(*) >= ANY (SELECT COUNT(DISTINCT genre) FROM Genres g, Movies m \
  WHERE g.movie_id = m.id AND m.title = '" + movieName + "')) goodMovies ON \
  m.id = goodMovies.movie_id WHERE m.title <> '" + movieName + "' ORDER BY rating DESC, vote_count DESC \
  LIMIT 5";

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

/* ----- Q3 (Best Of Decades) ----- */

router.get('/decades', function(req, res) {
  var query = "SELECT temp*10 AS decade FROM (SELECT DISTINCT SUBSTRING(release_year, 1, 3) AS temp \
  FROM Movies) decadeStub ORDER BY decade";

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/bestof/:decade', function(req, res) {
  var decade = req.params.decade;
  var decadeEnd = decade.substring(0, decade.length - 1) + 9;

  var query = "SELECT g1.genre, m1.title, m1.release_year, m1.vote_count FROM \
  Genres g1 JOIN Movies m1 JOIN \
  (SELECT g.genre, MAX(vote_count) as maxVotes FROM Genres g JOIN Movies m on g.movie_id = m.id \
  WHERE release_year <= " + decadeEnd + " AND release_year >= " + decade + " GROUP BY g.genre) temp \
  ON g1.movie_id = m1.id AND g1.genre = temp.genre AND m1.vote_count = temp.maxVotes \
  WHERE release_year <= " + decadeEnd + " AND release_year >= " + decade + " ORDER BY g1.genre";

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


/* ----- Bonus (Posters) ----- */

router.get('/random', function(req, res) {
  var numPosters = Math.floor(Math.random() * 6) + 10; 

  var query = "SELECT imdb_id FROM Movies ORDER BY RAND() LIMIT " + numPosters + ";";

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

/* General Template for GET requests:

router.get('/routeName/:customParameter', function(req, res) {
  // Parses the customParameter from the path, and assigns it to variable myData
  var myData = req.params.customParameter;
  var query = '';
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      // Returns the result of the query (rows) in JSON as the response
      res.json(rows);
    }
  });
});
*/


module.exports = router;
