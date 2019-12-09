
CREATE TABLE Restaurant(
CAMIS varchar(50) NOT NULL,
id varchar(255),
name varchar(50),
url varchar(255),
PHONE varchar(20),
latitude float(50),
longitude float(50),
review_count varchar(20),
price varchar(20),
rating float(50),
address varchar(255),
city varchar(255),
state varchar(255),
ZIPCODE varchar(20),
  PRIMARY KEY (CAMIS)
);

CREATE TABLE Category(
CAMIS varchar(50) NOT NULL,
categories varchar(255) NOT NULL,
  PRIMARY KEY (CAMIS, categories),
  FOREIGN KEY (CAMIS) REFERENCES Restaurant(CAMIS)
);

CREATE TABLE Inspection(
CAMIS varchar(50) NOT NULL, 
DBA varchar(50) ,
BORO varchar(20),
STREET varchar(255),
ZIPCODE varchar(20),
PHONE varchar(20),
CUISINE_DESCRIPTION varchar(255), 
INSPECTION_DATE varchar(20)  NOT NULL, 
ACTION varchar(255),
VIOLATION_CODE varchar(20)   NOT NULL, 
VIOLATION_DESCRIPTION varchar(255), 
CRITICAL_FLAG varchar(20), 
SCORE varchar(20), 
GRADE_IMPUTED varchar(20), 
INSPECTION_TYPE varchar(255), 
PRIMARY KEY (CAMIS, INSPECTION_DATE, VIOLATION_CODE),
FOREIGN KEY (CAMIS) REFERENCES Restaurant(CAMIS)
);

 -- mysql -p -u mengdih -h fling.seas.upenn.edu --local-infile mengdih

 -- show warnings\G;

 -- make sure all csv files are in eniac/current directory

 -- LOAD DATA LOCAL INFILE "1124_yelp_data.csv" INTO TABLE Restaurant FIELDS TERMINATED BY ',' ENCLOSED BY '"';

 -- LOAD DATA LOCAL INFILE "1124_categories.csv" INTO TABLE Category FIELDS TERMINATED BY ',' ENCLOSED BY '"';


 -- scp 1117_nyc_restaurant_inspection_data.tsv mengdih@eniac.seas.upenn.edu:~
 -- LOAD DATA LOCAL INFILE "1117_nyc_restaurant_inspection_data.tsv" INTO TABLE Inspection FIELDS TERMINATED BY '\t' ENCLOSED BY '"';
 
 -- LOAD DATA LOCAL INFILE "collisions_cleaned.csv" INTO TABLE Collision FIELDS TERMINATED BY ',' ENCLOSED BY '"';


CREATE TABLE Collision(
ID varchar(50) NOT NULL, 
ACCIDENT_DATE varchar(50),
ACCIDENT_TIME varchar(50),
BOROUGH varchar(20),
ZIP_CODE varchar(20),
NUMBER_OF_PERSONS_INJURED varchar(20),
NUMBER_OF_PERSONS_KILLED varchar(20),
NUMBER_OF_PEDESTRIANS_INJURED varchar(20),
NUMBER_OF_PEDESTRIANS_KILLED varchar(20),
NUMBER_OF_CYCLIST_INJURED varchar(20),
NUMBER_OF_CYCLIST_KILLED varchar(20),
NUMBER_OF_MOTORIST_INJURED varchar(20),
NUMBER_OF_MOTORIST_KILLED varchar(20),
CONTRIBUTING_FACTOR_VEHICLE_1 varchar(255),
CONTRIBUTING_FACTOR_VEHICLE_2 varchar(255),
COLLISION_ID varchar(50),
VEHICLE_TYPE_CODE_1 varchar(50),
VEHICLE_TYPE_CODE_2 varchar(50),
PRIMARY KEY (ID),
FOREIGN KEY (BOROUGH) REFERENCES Inspection(BORO),
);

SELECT owner, table_name
  FROM dba_tables;

-- SELECT COUNT(*)
-- FROM Inspection i JOIN Restaurant r ON i.CAMIS = r.CAMIS;

-- SELECT i.CAMIS, i.SCORE, r.rating, r.price
-- FROM Inspection i 
-- JOIN Restaurant r ON i.CAMIS = r.CAMIS
-- JOIN Category c ON i.CAMIS = c.CAMIS
-- WHERE GRADE_IMPUTED = 'A' AND r.rating > 3 AND r.price < 3
-- AND (i.CUISINE_DESCRIPTION LIKE "%Salad%" OR c.categories LIKE "%Salad%")
-- AND i.CAMIS = '40367715'
-- ;

------------------------------------------------------------------------------------------

-- 1. Input cuisine into textbox, set filter for any subset of 
-- {inspection score, rating, price level, neighborhood/zipcode}, 
-- output best restaurants under the criteria. Output results can be sorted 
-- in either descending or ascending order for {name, rating, price level}.

-- SELECT DISTINCT i.CAMIS, r.name, i.CUISINE_DESCRIPTION, c.categories AS grade

-- (Assume CUISINE_DESCRIPTION = "Salad", GRADE_IMPUTED = 'A', rating > 3, price < 3)

SELECT DISTINCT i.CAMIS, r.name, r.address, r.rating, r.price
FROM Inspection i 
JOIN Restaurant r ON i.CAMIS = r.CAMIS
JOIN Category c ON i.CAMIS = c.CAMIS
WHERE GRADE_IMPUTED = 'A' AND r.rating > 3 AND r.price < 3
AND (i.CUISINE_DESCRIPTION LIKE "%Salad%" OR c.categories LIKE "%Salad%")
ORDER BY r.name
;

------------------------------------------------------------------------------------------

-- 2. One more filter: order by inspection score (average score of all inspections)
WITH T AS (
SELECT i.CAMIS, AVG(i.SCORE) AS AVG_SCORE
FROM Inspection i 
JOIN Restaurant r ON i.CAMIS = r.CAMIS
JOIN Category c ON i.CAMIS = c.CAMIS
WHERE GRADE_IMPUTED = 'A' AND r.rating > 3 AND r.price < 3
AND (i.CUISINE_DESCRIPTION LIKE "%Salad%" OR c.categories LIKE "%Salad%")
GROUP BY i.CAMIS
)
SELECT DISTINCT r.CAMIS, r.name, r.address, r.rating, r.price, t.AVG_SCORE
FROM T t 
JOIN Restaurant r ON t.CAMIS = r.CAMIS
ORDER BY t.AVG_SCORE ASC
;

------------------------------------------------------------------------------------------

-- 3. Another feature where after inputting the cuisine into the checkbox, we choose instead 
-- to find the best neighborhood for that cuisine (another button) (neighborhood with most 
-- restaurants below certain safety threshold score, or maybe above certain rating).

-- (Assume CUISINE_DESCRIPTION = "Salad", GRADE_IMPUTED = 'A', rating > 3, price < 3)


SELECT i.BORO AS BORO, AVG(i.SCORE) AS AVG_SCORE, COUNT(*) as NUM
FROM Inspection i 
JOIN Restaurant r ON i.CAMIS = r.CAMIS
JOIN Category c ON i.CAMIS = c.CAMIS
WHERE GRADE_IMPUTED = 'A' AND r.rating > 3 AND r.price < 3
AND (i.CUISINE_DESCRIPTION LIKE "%Salad%" OR c.categories LIKE "%Salad%")
GROUP BY i.BORO
ORDER BY NUM DESC, AVG_SCORE ASC;

------------------------------------------------------------------------------------------

-- 4. Give the restaurant in a certain BORO, show the total number of violations and most recent violation description 
-- in the past with the lowest inspection score and at least 3 violations in the past, within each category 
-- of violation, ordered by most recent inspections

-- (Assume from #1 or #2, user clicked on restaurant r.CAMIS = "41653607", r.name = "Chopt Creative Salad Co. ",
-- and wanted to see its violation history.


-- most recent violation, total number of violations
WITH T AS (
SELECT CAMIS, INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION
FROM Inspection 
WHERE CAMIS = "41653607" AND INSPECTION_DATE = (
	SELECT MAX(INSPECTION_DATE)
	FROM Inspection WHERE CAMIS = "41653607" 
)),
T2 AS (
SELECT COUNT(*) as NUM_VIOLATIONS
FROM Inspection WHERE CAMIS = "41653607"
)
SELECT CAMIS, INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION, NUM_VIOLATIONS
FROM T t, T2 t2


-- most recent violation (top 3 dates, removed duplicates), total number of violations
WITH T AS (
SELECT DISTINCT CAMIS, i.INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION
FROM Inspection i
INNER JOIN (
	SELECT i2.INSPECTION_DATE
	FROM Inspection i2 WHERE CAMIS = "41653607" 
	ORDER BY i2.INSPECTION_DATE DESC
	LIMIT 3) AS T0
ON i.INSPECTION_DATE = T0.INSPECTION_DATE
WHERE CAMIS = "41653607"),
T2 AS (
SELECT COUNT(*) as NUM_VIOLATIONS
FROM Inspection WHERE CAMIS = "41653607"
)
SELECT CAMIS, INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION, NUM_VIOLATIONS
FROM T t, T2 t2


------------------------ Oracle ------------------------
-- most recent violation (top 3 dates, removed duplicates), total number of violations
WITH T AS (
SELECT DISTINCT CAMIS, i.INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION
FROM Inspection i
INNER JOIN (
	SELECT i2.INSPECTION_DATE
	FROM Inspection i2 WHERE CAMIS = "41653607" 
	ORDER BY i2.INSPECTION_DATE DESC
	WHERE ROWNUM <= 3) AS T0
ON i.INSPECTION_DATE = T0.INSPECTION_DATE
WHERE CAMIS = "41653607"),
T2 AS (
SELECT COUNT(*) as NUM_VIOLATIONS
FROM Inspection WHERE CAMIS = "41653607"
)
SELECT CAMIS, INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION, NUM_VIOLATIONS
FROM T t, T2 t2





WITH T3 AS (SELECT i2.INSPECTION_DATE
FROM Inspection i2 WHERE CAMIS = "41653607" 
ORDER BY i2.INSPECTION_DATE DESC)
,
T0 AS 
(SELECT * FROM T3
WHERE ROWNUM <= 3)
,
T AS (
SELECT DISTINCT CAMIS, i.INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION
FROM Inspection i
INNER JOIN T0
ON i.INSPECTION_DATE = T0.INSPECTION_DATE
WHERE CAMIS = "41653607"),
T2 AS (
SELECT COUNT(*) as NUM_VIOLATIONS
FROM Inspection WHERE CAMIS = "41653607"
)
SELECT CAMIS, INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION, NUM_VIOLATIONS
FROM T t, T2 t2
------------------------ Oracle ------------------------


------------------------------------------------------------------------------------------

-- 5. The most common (currently top 3 most common) contributing reason to vehicle accidents in a neighbourhood with most thai restaurants during certain time period of day and certain day of week.
-- (input: start_time, end_time, current_date, vehicle_type)
-- output: Vehicle_type, CONTRIBUTING_FACTOR_VEHICLE)

-- (Assume from #3, start_time = "11:00",  end_time = "14:00", current_date = "2019-12-10", vehicle_type = "Bicycle")



WITH T AS (
SELECT c.VEHICLE_TYPE_CODE_1 AS VEHICLE_TYPE_CODE, c.CONTRIBUTING_FACTOR_VEHICLE_1 AS CONTRIBUTING_FACTOR_VEHICLE
FROM Inspection i, Restaurant r, Collision c
WHERE i.CAMIS = r.CAMIS AND i.BORO=c.BOROUGH AND c.ACCIDENT_TIME > "1100" AND c.ACCIDENT_TIME < "1400" AND DAYOFWEEK( "2019-12-10") = DAYOFWEEK(c.ACCIDENT_DATE) AND CUISINE_DESCRIPTION LIKE "%Thai%" AND c.VEHICLE_TYPE_CODE_1 = "Bicycle"

UNION ALL 

SELECT c.VEHICLE_TYPE_CODE_2 AS VEHICLE_TYPE_CODE, c.CONTRIBUTING_FACTOR_VEHICLE_2 AS CONTRIBUTING_FACTOR_VEHICLE
FROM Inspection i, Restaurant r, Collision c
WHERE i.CAMIS = r.CAMIS AND i.BORO=c.BOROUGH AND c.ACCIDENT_TIME > "1100" AND c.ACCIDENT_TIME < "1400" AND DAYOFWEEK( "2019-12-10") = DAYOFWEEK(c.ACCIDENT_DATE) AND CUISINE_DESCRIPTION LIKE "%Thai%" AND c.VEHICLE_TYPE_CODE_2 = "Bicycle")

SELECT VEHICLE_TYPE_CODE, CONTRIBUTING_FACTOR_VEHICLE, COUNT(*) as NUM
FROM T
GROUP BY CONTRIBUTING_FACTOR_VEHICLE
ORDER BY NUM DESC
LIMIT 3;

-- Count AS (
-- 	SELECT CONTRIBUTING_FACTOR_VEHICLE, COUNT(*) as NUM
-- 	FROM T
-- 	GROUP BY CONTRIBUTING_FACTOR_VEHICLE
-- 	ORDER BY NUM DESC
-- 	LIMIT 3
-- ),
-- T2 AS (
-- -- SELECT DISTINCT CAMIS, i.INSPECTION_DATE, VIOLATION_CODE, CRITICAL_FLAG, VIOLATION_DESCRIPTION
-- SELECT t.VEHICLE_TYPE_CODE, t.CONTRIBUTING_FACTOR_VEHICLE
-- FROM T t
-- INNER JOIN (
-- 	SELECT t0.VEHICLE_TYPE_CODE, t0.CONTRIBUTING_FACTOR_VEHICLE, c.NUM AS NUM
-- 	FROM T t0, Count c
-- 	ORDER BY c.NUM DESC
-- 	LIMIT 3) AS T0
-- ON t.CONTRIBUTING_FACTOR_VEHICLE = T0.CONTRIBUTING_FACTOR_VEHICLE)

-- SELECT t2.VEHICLE_TYPE_CODE, t2.CONTRIBUTING_FACTOR_VEHICLE, c.NUM
-- FROM T2 t2, Count c
-- WHERE t2.CONTRIBUTING_FACTOR_VEHICLE = c.CONTRIBUTING_FACTOR_VEHICLE;

------------------------ Oracle ------------------------
WITH T AS (
(SELECT c.VEHICLE_TYPE_CODE_1 AS VEHICLE_TYPE_CODE, c.CONTRIBUTING_FACTOR_VEHICLE_1 AS CONTRIBUTING_FACTOR_VEHICLE
FROM Inspection i, Restaurant r, Collision c
WHERE i.CAMIS = r.CAMIS AND i.BORO=c.BOROUGH AND c.ACCIDENT_TIME > "1100" AND c.ACCIDENT_TIME < "1400" AND DAYOFWEEK( "2019-12-10") = DAYOFWEEK(c.ACCIDENT_DATE) AND CUISINE_DESCRIPTION LIKE "%Thai%" AND c.VEHICLE_TYPE_CODE_1 LIKE "%TAXI%")
UNION ALL
SELECT c.VEHICLE_TYPE_CODE_2 AS VEHICLE_TYPE_CODE, c.CONTRIBUTING_FACTOR_VEHICLE_2 AS CONTRIBUTING_FACTOR_VEHICLE
FROM Inspection i, Restaurant r, Collision c
WHERE i.CAMIS = r.CAMIS AND i.BORO=c.BOROUGH AND c.ACCIDENT_TIME > "1100" AND c.ACCIDENT_TIME < "1400" AND DAYOFWEEK( "2019-12-10") = DAYOFWEEK(c.ACCIDENT_DATE) AND CUISINE_DESCRIPTION LIKE "%Thai%" AND c.VEHICLE_TYPE_CODE_2 LIKE "%TAXI%")
)
, T1 AS (
SELECT VEHICLE_TYPE_CODE, CONTRIBUTING_FACTOR_VEHICLE, COUNT(*) as NUM
FROM T
GROUP BY CONTRIBUTING_FACTOR_VEHICLE
ORDER BY NUM DESC
)
SELECT * FROM T1
WHERE ROWNUM = 3;
------------------------ Oracle ------------------------
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------

