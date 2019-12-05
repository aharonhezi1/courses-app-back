const express = require("express");
const router = new express.Router();
const mysql = require("mysql");
const mysqlAsync = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const authPassword = require("../middleware/authPassword");

const coursesDB = {
  host: process.env.DB_HOST || "localhost",
  user:process.env.DB_USER || "root",
  password:process.env.DB_PASSWORD|| "",
  database: "college"

};

//login
router.post("/api/students/login", async (req, res) => {
  const { id, password } = req.body;
  let compare;

  const connection = mysql.createConnection(coursesDB);
  const query =
    "SELECT `password`  from college.students WHERE id= '" + id + "'";
  console.log(query);

  connection.query(query, function(error, results, fields) {
    if (error) {
      res.status(401).send({ error: "Authetication Failed" });
    }
    if (results[0]) {
      compare = bcrypt.compareSync(password, results[0].password);
    }
  });
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const tokenQuery =
    "UPDATE college.students SET `token` = '" +
    token +
    "'  WHERE id= '" +
    id +
    "'";
  connection.query(tokenQuery, function(error, results, fields) {
    if (error) {
      res.send({ error: "set token" });
    }
    if (results) {
      console.log("new token");
    }
  });
  const query2 = "SELECT `name`  from college.students WHERE id= '" + id + "'";
  connection.query(query2, function(error, results, fields) {
    if (error || !compare)
      res.status(401).send({ error: "Authetication Failed" });
    else {
      results[0] = {
        ...results[0],
        token
      };
      res.send(results);
    }
  });
  connection.end();
});

router.get("/api/students/courses", auth, async (req, res) => {
  let connection = mysql.createConnection(coursesDB);
  let id;

  id = req.id;
  console.log(id);

  const query2 =
    " SELECT DISTINCT courseId , course_name , start_at   , weekly_sessions  FROM `college`.courses, `college`.`course_student`" +
    "WHERE   student_id='";

  connection.query(query2 + id + "';", function(error, results, fields) {
    console.log(query2);
    console.log(id);
    if (error) res.send(error);
    else res.send(results);
    connection.end();
  });
});

// find student
router.get("/api/student", auth, async (req, res) => {
  const token = req.token;
  const query = "SELECT * from college.students WHERE token= '" + token + "'";
  console.log(query);
  const connection = mysql.createConnection(coursesDB);
  connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else console.log(results);
    res.send(results);
  });
  connection.end();
});

router.get("/api/students", async (req, res) => {
  const connection = mysql.createConnection(coursesDB);
  connection.query("SELECT * from college.students", function(
    error,
    results,
    fields
  ) {
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

router.post("/api/students/:id", async (req, res) => {
  const course_id = req.params.id;
  const { id } = req.body;
  console.log(id,course_id)
  const query =
    "INSERT INTO `college`.`course_student` (`course_id`, `student_id`) VALUES ('" +
    course_id +
    "', '" +
    id +
    "');";
  const connection = mysql.createConnection(coursesDB);
  connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else res.send();
  });
  connection.end();
});

// register a student
router.post("/api/student", async (req, res) => {
  console.log("req: ", req.body);
  const connection = mysql.createConnection(coursesDB);
  const { name, phone, id, residence } = req.body;
  let password = await bcrypt.hash(req.body.password, 8);
  let token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const insertQuery =
    "INSERT INTO `college`.`students` (`name`, `phone`, `id`, `password`, `residence`,`token`) VALUES ('" +
    name +
    "', '" +
    phone +
    "', '" +
    id +
    "', '" +
    password +
    "', '" +
    residence +
    "', '" +
    token +
    "');";
  console.log(insertQuery);
  connection.query(insertQuery, function(error, results, fields) {
    if (error) res.send(error);
    else res.send();
  });
  connection.end();
});

router.delete("/api/students", async (req, res) => {
  const connection = mysql.createConnection(coursesDB);
  console.log(req.body);
  const { id } = req.body;

  const query = "DELETE FROM `college`.`students` WHERE id= '" + id + "';";
  console.log(query);
  connection.query(query, function(error, results, fields) {
    if (error) res.send(error);
    else res.send();
  });
  connection.end();
});
router.patch("/api/students", auth, authPassword, async (req, res) => {
  const id = req.id;
  const connection = mysql.createConnection(coursesDB);
  console.log(req.body);
  const updates = Object.keys(req.body).filter(
    update =>
      update === "phone" || update === "password" || update === "residence"
  );
  console.log(updates);
  if (updates.includes("password")) {
    req.body.password = await bcrypt.hash(req.body.password, 8);
  }
  // const allowedUpdates = ["phone", "password", "residence"];
  // const isValidOperation = updates.every(update =>
  //   allowedUpdates.includes(update)
  // );

  // if (!isValidOperation) {
  //   return res.status(400).send({ error: "Invalid updates!" });
  // }

  let query;
  updates.forEach(update => {
    query =
      "UPDATE `college`.`students` SET `" +
      update +
      "` = '" +
      req.body[update] +
      "' WHERE id= '" +
      id +
      "';";
    console.log(query);
    connection.query(query, function(error, results, fields) {
      if (error) res.send(error);
      else res.send();
    });
  });
  connection.end();
});

module.exports = router;
