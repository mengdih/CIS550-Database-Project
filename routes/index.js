var express = require('express');
var router = express.Router();
var path = require('path');

//router.use(express.urlencoded({extended: false}));

/* ----- Connects to your mySQL database ----- */

const database = require('../services/database.js');

async function startup() {
  console.log('Starting application');

  try {
    console.log('Initializing database module');

    await database.initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }
}

startup();

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

router.get('/cuisine/:cuisine/:score/:rating/:price', async function (req, res) {
  var cuisine = req.params.cuisine;
  var score = req.params.score;
  var rating = req.params.rating;
  var price = req.params.price;


  var query = "WITH T AS ( "
    + "SELECT i.CAMIS, AVG(i.SCORE) AS AVG_SCORE "
    + "FROM Inspection i "
    + "JOIN Restaurant r ON i.CAMIS = r.CAMIS "
    + "JOIN Category c ON i.CAMIS = c.CAMIS "
    + "WHERE r.rating > " + rating + " AND r.price < "+ price + " AND SCORE != 'NA'"
    + "AND (UPPER(i.CUISINE_DESCRIPTION) LIKE '%" + cuisine.toUpperCase() + "%' OR UPPER(c.categories) LIKE '%" + cuisine.toUpperCase() + "%') "
    + "GROUP BY i.CAMIS "
    + ") "
    + "SELECT r.name, r.address, r.rating, r.price, t.AVG_SCORE "
    + "FROM T t "
    + "JOIN Restaurant r ON t.CAMIS = r.CAMIS "
    + "WHERE t.AVG_SCORE < " + score + " "
    + "ORDER BY t.AVG_SCORE ASC "

  console.log(query)

// T
// o
// O
// L
// T
// I
// p

  var result = await database.simpleExecute(query);

    console.log(result.rows);
  res.json(result.rows);



  // const result = await connection.execute(
  //   "WITH T AS ( \
  //   SELECT i.CAMIS, AVG(i.SCORE) AS AVG_SCORE \
  //   FROM Inspection i \
  //   JOIN Restaurant r ON i.CAMIS = r.CAMIS \
  //   JOIN Category c ON i.CAMIS = c.CAMIS \
  //   WHERE GRADE_IMPUTED = 'A' AND r.rating > 3 AND r.price < 3 \
  //   AND (UPPER(i.CUISINE_DESCRIPTION) LIKE '%SALAD%' OR UPPER(c.categories) LIKE '%Salad%') \
  //   GROUP BY i.CAMIS \
  //   ) \
  //   SELECT DISTINCT r.CAMIS, r.name, r.address, r.rating, r.price, t.AVG_SCORE \
  //   FROM T t \
  //   JOIN Restaurant r ON t.CAMIS = r.CAMIS \
  //   ORDER BY t.AVG_SCORE ASC \
  //   ;"



  //   // "SELECT r.name \
  //   // FROM Inspection i JOIN Restaurant r ON i.CAMIS = r.CAMIS \
  //   // WHERE i.CUISINE_DESCRIPTION LIKE '%" + cuisine + "%' AND i.SCORE < :filter1 AND r.rating > :filter2 AND r.price < :filter3",
  //   // [score, rating, price]
  //   );

  // console.log(result.rows);
  // res.json(result.rows);
});

router.get('/cuisineNeighborhood/:cuisine/:score/:rating/:price', async function (req, res) {
  var cuisine = req.params.cuisine;
   var score = req.params.score;
  var rating = req.params.rating;
  var price = req.params.price;

  var query = "WITH T AS ( "
    + "SELECT i.CAMIS, AVG(i.SCORE) AS AVG_SCORE, min(BORO) as BORO "
    + "FROM Inspection i "
    + "JOIN Restaurant r ON i.CAMIS = r.CAMIS "
    + "JOIN Category c ON i.CAMIS = c.CAMIS "
    + "WHERE r.rating > " + rating + " AND r.price < "+ price + " AND SCORE != 'NA'"
    + "AND (UPPER(i.CUISINE_DESCRIPTION) LIKE '%" + cuisine.toUpperCase() + "%' OR UPPER(c.categories) LIKE '%" + cuisine.toUpperCase() + "%') "
    + "GROUP BY i.CAMIS "
    + ") \
    SELECT BORO, AVG(AVG_SCORE) AS AVG_SCORE, COUNT(*) as NUM \
    FROM T t \
    WHERE t.AVG_SCORE < " + score + " \
    GROUP BY t.BORO \
    ORDER BY NUM DESC, AVG_SCORE ASC"


console.log(query)


  var result = await database.simpleExecute(query);

    console.log(result.rows);
  res.json(result.rows);
});

/* ----- Q2 (Recommendations) ----- */

//router.get('/recommendations/:selectedBoro/:boro', async function(req, res) {
router.get('/recommendations/:boro', async function(req, res) {
  const boro = req.params.boro;

  console.log("===============");
  console.log('hahaha')
  console.log("boro:", boro);
  var query =
      "SELECT DISTINCT r.Name, c.BOROUGH, i.INSPECTION_DATE, i.CRITICAL_FLAG " +
      "FROM INSPECTION i " +
      "FULL OUTER JOIN RESTAURANT r " +
      "ON r.CAMIS=i.CAMIS " +
      "JOIN COLLISION c " +
      "ON c.BOROUGH= i.boro " +
      "WHERE i.BORO = '" + boro.toUpperCase() +
      "' ORDER BY r.Name, i.INSPECTION_DATE DESC"
      console.log(query)


        var result = await database.simpleExecute(query);

        console.log(result.rows);
        res.json(result.rows);
  // connection.query(query, function (err, rows, fields) {
  //   if (err) {
  //     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!");
  //     console.log(err);
  //   }
  //   else {
  //     console.log(rows);
  //     res.json(rows);
  //   }
  // });
});

/* ----- Q3 (Best Of Decades) ----- */

router.get('/decades', async function(req, res) {
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

router.get('/bestof/:decade', async function(req, res) {
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

router.get('/random', async function(req, res) {
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

async function shutdown(e) {
  let err = e;

  console.log('Shutting down');

  try {
    console.log('Closing database module');

    await database.close();
  } catch (err) {
    console.log('Encountered error', e);

    err = err || e;
  }

  console.log('Exiting process');

  if (err) {
    process.exit(1); // Non-zero failure code
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => {
  console.log('Received SIGTERM');

  shutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');
  process.exit(0);
});

process.on('uncaughtException', err => {
  console.log('Uncaught exception');
  console.error(err);

  shutdown(err);
});
