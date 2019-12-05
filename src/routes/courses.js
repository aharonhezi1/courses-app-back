const express = require("express");
const router = new express.Router();
const mysql = require("mysql");
const auth = require("../middleware/auth");

const coursesDB = {
 // host: "localhost",
 //user: "root",
 //password: "",
  // host: "database-course-app.cwyvcashrxzi.us-east-1.rds.amazonaws.com",
  // user:"admin",
  // password:"database-course-app",
  host: process.env.DB_HOST || "localhost",
  user:process.env.DB_USER || "root",
  password:process.env.DB_PASSWORD|| "",
  database: "college"
};

router.get("/api/courses", async (req, res) => {
  const connection = mysql.createConnection(coursesDB);
  await connection.query("SELECT * FROM `college`.courses", function(
    error,
    results,
    fields
  ) {
    if (error) res.send(error);
    else res.send(results);
  });
  connection.end();
});

router.post("/api/courses", async (req, res) => {
  console.log("req: ", req.body);
  const connection = mysql.createConnection(coursesDB);
  const { course_id, course_name, start_at, weekly_sessions } = req.body;
  const query =
    "INSERT INTO `college`.`courses` (`courseId`, `course_name`, `start_at`, `weekly_sessions`) VALUES ('" +
    course_id +
    "', '" +
    course_name +
    "', '" +
    start_at +
    "', '" +
    weekly_sessions +
    "');";
  console.log(query);
  await connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else res.send();
  });
  connection.end();
});

router.delete("/api/courses", async (req, res) => {
  const connection = mysql.createConnection(coursesDB);
  console.log(req.body);
  const { course_id } = req.body;

  const query =
    "DELETE FROM `college`.`courses` WHERE course_id= '" + course_id + "';";
  console.log(query);
  await connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else res.send();
  });
  connection.end();
});
// get students in course
router.get("/api/courses/:id", async (req, res) => {
  const course_id = req.params.id;
  const query =
    "SELECT  id , name , phone , residence FROM `college`.students, `college`.`course_student`" +
    "WHERE   course_id='" +
    course_id +
    "' AND `id`= `student_id`;";
  const connection = mysql.createConnection(coursesDB);
  await connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else {
      results = results.map(res => ({
        id: res.id,
        name: res.name,
        phone: res.phone,
        residence: res.residence
      }));
      res.send(results);
    }
  });
  connection.end();
});

router.post("/api/courses/:id", async (req, res) => {
  const course_id = req.params.id;
  const { id } = req.body;
  const query =
    "INSERT INTO `college`.`course_student` (`course_id`, `student_id`) VALUES ('" +
    course_id +
    "', '" +
    id +
    "');";
  const connection = mysql.createConnection(coursesDB);
  await connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else res.send();
  });
  connection.end();
});

router.post("/api/courses/:id/attendance",auth, async (req, res) => {
  const { student_id, attendance, comment = null } = req.body;
  const course_id = req.params.id;
  const table = "college`.`student_id" + student_id + "course_id" + course_id;

  const connection = mysql.createConnection(coursesDB);
  const query =
    "CREATE TABLE IF NOT EXISTS `" +
    table +
    "` (`session` INT NOT NULL AUTO_INCREMENT, `attendance` BOOLEAN NOT NULL, `comment` VARCHAR(100)  " +
    ", PRIMARY KEY (`session`))";
  const insertQuiry =
    " INSERT INTO `" +
    table +
    "` (`attendance` , `comment`) VALUES (" +
    attendance +
    ", '" +
    comment +
    "');";
  console.log(query);
  console.log(insertQuiry);

  await connection.query(query, function(error, results, fields) {
    if (error) {
      res.send(error);
    }
  });

  await connection.query(insertQuiry, function(error, results, fields) {
    if (error) res.send(error);
    else res.send(results);
  });
  await connection.end();
});
router.patch("/api/courses/:id/attendance", auth, async (req, res) => {
  const { comment, session } = req.body;
  const student_id = req.id;
  const course_id = req.params.id;
  const table =
    "`college`.`student_id" + student_id + "course_id" + course_id + "`";
  const connection = mysql.createConnection(coursesDB);
  const query =
    "UPDATE " +
    table +
    "SET `comment`= '" +
    comment +
    "' WHERE `session`= " +
    session +
    " AND `attendance`= 0";
  await connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else res.send(results);
  });
  connection.end();
});

// show attendance
router.get("/api/courses/:course_id/attendance", auth, async (req, res) => {
  const  student_id = req.id;
const course_id=req.params.course_id
console.log(student_id,course_id)

  const query2 =
    "SELECT * FROM `college`.`student_id" +
    student_id +
    "course_id" +
    course_id +
    "`";
    const connection = mysql.createConnection(coursesDB);

  connection.query(query2, function(error, results, fields) {
    if (error) {res.send(error);
    console.log(error)
    }
    else{
      res.send(results);
      console.log(results)
    }
  });
  connection.end();
});
// query="SELECT * FROM `college`.`student_id"+student_id+"course_id"+course_id+"`"

//     await connection.query(query, function(
//       error,
//       results,
//       fields
//     ) {
//       if (error)
//       res.send(error)
//    else  res.send(results);
//     });
// connection.end();
// })

module.exports = router;
