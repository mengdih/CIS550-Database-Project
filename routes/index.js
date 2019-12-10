var express = require('express');
var router = express.Router();
var path = require('path');

// require file for connecting to oracleDB
const database = require('../services/database.js');

// function to invote on startup, initializes oracleDB database
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

/* ----- Q2 (Avoids) ----- */
router.get('/avoids', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'avoids.html'));
});

/* ----- Collisions ----- */
router.get('/collision', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'collisions.html'));
});


/* ------------------------------------------------ */
/* ----- Routers to handle data requests ----- */
/* ------------------------------------------------ */

/* ----- P1 (Cuisine/Dashboard) ----- */

// function for querying all restaurants with a certain cuisine
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

var result = await database.simpleExecute(query);

console.log(result.rows);
res.json(result.rows);

});

// function for finding the best neighborhood
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

/* ----- P2 (Avoids) ----- */

// For the first function in the avoids page
router.get('/avoids/:boro', async function(req, res) {
  const boro = req.params.boro;

  console.log("boro:", boro);
  var query =
  "SELECT * "+
  "FROM "+
  "(SELECT X.Name, X.CUISINE_DESCRIPTION, X.INSPECTION_DATE, X.CRITICAL_FLAG, Z.LOW "+
  "FROM "+
  "(SELECT DISTINCT r.CAMIS, r.Name, i.CUISINE_DESCRIPTION, i.INSPECTION_DATE, i.CRITICAL_FLAG, i.SCORE "+
  "FROM INSPECTION i, RESTAURANT r, COLLISION c " +
  "WHERE r.CAMIS=i.CAMIS AND c.BOROUGH=i.BORO AND i.BORO='" + boro.toUpperCase() + "' AND CRITICAL_FLAG != 'Not Applicable') X, "+
  "(SELECT r.CAMIS, COUNT(VIOLATION_CODE) as count "+
  "FROM INSPECTION i, RESTAURANT r, COLLISION c " +
  "WHERE r.CAMIS=i.CAMIS AND c.BOROUGH=i.BORO AND i.BORO='" + boro.toUpperCase() + "' AND CRITICAL_FLAG != 'Not Applicable' "+
  "GROUP BY r.CAMIS) Y, "+
  "(SELECT r.CAMIS, min(i.SCORE) as low "+
  "FROM INSPECTION i, RESTAURANT r, COLLISION c "+
  "WHERE r.CAMIS=i.CAMIS AND c.BOROUGH=i.BORO AND i.BORO='" + boro.toUpperCase() + "' AND CRITICAL_FLAG != 'Not Applicable' AND SCORE !='NA' "+
  "GROUP BY r.CAMIS) Z " +
  "WHERE X.CAMIS=Y.CAMIS AND X.CAMIS=Z.CAMIS AND X.SCORE=Z.low "+
  "ORDER BY Y.count ASC, X.SCORE ASC) " +
  "WHERE ROWNUM <=20"

  console.log(query)
  var result = await database.simpleExecute(query);
  console.log(result.rows);
  res.json(result.rows);

});
// for the second function in the avoids page
router.get('/violation/:restaurantName', async function(req, res) {
  const pubName = req.params.restaurantName;

  console.log("pubName:", pubName);
  var query =
  "SELECT * "+
  "FROM( "+
  "SELECT  Y.count, X.VIOLATION_DESCRIPTION "+
  "FROM "+
  "(SELECT DISTINCT r.CAMIS, r.Name, i.CUISINE_DESCRIPTION, i.INSPECTION_DATE, i.CRITICAL_FLAG, i.SCORE, i.VIOLATION_DESCRIPTION "+
  "FROM INSPECTION i, RESTAURANT r "+
  "WHERE r.CAMIS=i.CAMIS AND r.Name='" + pubName + "'AND CRITICAL_FLAG != 'Not Applicable') X, "+
  "(SELECT r.CAMIS, r.Name, r.ZIPCODE, COUNT(*) as count "+
  "FROM INSPECTION i, RESTAURANT r "+
  "WHERE r.CAMIS=i.CAMIS AND r.Name='" + pubName + "'AND CRITICAL_FLAG != 'Not Applicable' "+
  "GROUP BY r.CAMIS, r.Name, r.ZIPCODE) Y, "+
  "(SELECT r.CAMIS, max(i.INSPECTION_DATE) as recent "+
  "FROM INSPECTION i, RESTAURANT r "+
  "WHERE r.CAMIS=i.CAMIS AND r.Name='" + pubName + "'AND CRITICAL_FLAG != 'Not Applicable' AND SCORE !='NA' "+
  "GROUP BY r.CAMIS) Z "+
  "WHERE X.CAMIS=Y.CAMIS AND X.CAMIS=Z.CAMIS AND X.INSPECTION_DATE=Z.recent "+
  "ORDER BY X.VIOLATION_DESCRIPTION DESC, Z.recent) "+
  "WHERE ROWNUM=1"


  console.log(query)
  var result = await database.simpleExecute(query);
  console.log(result.rows);
  res.json(result.rows);

});

/* ----- P3 (Collision) ----- */

router.get('/collisions/:minVio', async function (req, res) {
  var min_vio = req.params.minVio;

  var query = ""
  + "SELECT AVG(rating) as avgRating, min(contributing_factor_vehicle_2) as contributing_factor FROM "
  + "(SELECT r.zipcode, rating FROM restaurant r join inspection i on r.camis = i.camis) r2 JOIN "
  + "(SELECT zip_code, contributing_factor_vehicle_2 FROM "
  + "(SELECT zip_code, ROWNUM as RN, contributing_factor_vehicle_2 FROM "
  + "(SELECT zip_code, count(*), min(c2.contributing_factor_vehicle_2) as contributing_factor_vehicle_2 FROM Collision c2 JOIN "
  + "(SELECT contributing_factor_vehicle_2 FROM "
  + "(Select contributing_factor_vehicle_2, ROWNUM as RN FROM "
  + "(SELECT contributing_factor_vehicle_2, count(*) as count FROM Collision c JOIN "
  + "  (SELECT DISTINCT zipcode as zipcode FROM "
  + "    (SELECT camis, count(DISTINCT violation_code) as numViolations, min(zipcode) as zipcode "
  + "      FROM inspection i GROUP BY camis "
  + "      HAVING count(DISTINCT violation_code) >= " + min_vio + " )) zips "
  + "  on c.ZIP_CODE = zips.zipcode where contributing_factor_vehicle_2 is not null group by contributing_factor_vehicle_2 order by count(*) DESC)) where RN = 2) maxVeh "
  + "ON c2.contributing_factor_vehicle_2 = maxVeh.contributing_factor_vehicle_2 GROUP BY zip_code order by count(*) DESC)) WHERE RN >= 30) zips "
  + "on r2.zipcode = zips.zip_code"

  console.log(query)

  var result = await database.simpleExecute(query);

  console.log(result.rows);
  res.json(result.rows);
});

module.exports = router;

// function to invote on shutdown, closes oracleDB database
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
