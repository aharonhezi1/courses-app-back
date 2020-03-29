const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const mysqlAsync =require('mysql2/promise');
const authStaff= require('../middleware/authStaff')
const authPassword = require("../middleware/authPassword");

const coursesDB = require('../db-config')
//{
  // host: process.env.DB_HOST || "localhost",
  // user:process.env.DB_USER || "root",
  // password:process.env.DB_PASSWORD|| "",
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "college"
// };


// create student token
router.get('/api/token',authStaff,(req, res) => {
  const id= req.id
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
res.send({token})
})
//login
router.post("/api/staff/login", async (req, res) => {
  const { id,password} = req.body;
  let compare;
  
  const connection = mysql.createConnection(coursesDB)
  const query =
    "SELECT `password`  from college.teachers WHERE id= '" + id + "'";
  console.log(query);
    connection.query(query, function (error, results, fields) {
    if (error) {
      res.status(401).send({ error: "Authetication Failed" });
    }
    if (results[0]) {
      compare = bcrypt.compareSync(password, results[0].password);
    }
  });
  const token= jwt.sign({ id }, process.env.JWT_STAFF_SECRET, { expiresIn: "1h" });
  const tokenQuery="UPDATE college.teachers SET `token` = '"+token+"'  WHERE id= '" + id + "'";
  connection.query(tokenQuery, function (error, results, fields) {
    if (error) {
      res.send({ error: "set token" });
    }
    if (results) {
      console.log('new token')
    }
  });
  const query2 =
  "SELECT `name`  from college.teachers WHERE id= '" + id + "'";
  connection.query(query2, function (error, results, fields) {
    if (error || !compare)
      res.status(401).send({ error: "Authetication Failed" });
    else{
      results[0]={
        ...results[0],
        token
      }
      res.send(results);
    }
  });
  connection.end()
});

// const  authByToken=async (token)=>{
router.get("/api/teacher",authStaff, async (req, res) => {
  const id=req.id
  const query="SELECT * from college.teachers WHERE id= '"+id+"'"
  console.log(query)
    const connection = mysql.createConnection(coursesDB);
    await connection.query(query, function(
      error,
      results,
      fields
    ) {
      if (error) res.send(error);
      else res.send(results);
    });
    connection.end();
  });

router.patch("/api/teacher",authStaff,authPassword, async (req, res) => {
  const id  = req.id;
  const connection = mysql.createConnection(coursesDB);
  console.log(req.body);
  const updates = Object.keys(req.body).filter(update => update === "password" ||  update ==="name");
  console.log(updates);

  // const allowedUpdates = [ "password", "name"];
  // const isValidOperation = updates.every(update =>
  //   allowedUpdates.includes(update)
  // );
 
  // if (!isValidOperation) {
  //   return res.status(400).send({ error: "Invalid updates!" });
  // }
  if (updates.includes("password")) {
    req.body.password = await bcrypt.hash(req.body.password, 8);
  }
  let query; 
  updates.forEach(update => {
    query =
      "UPDATE `college`.`teachers` SET `" +
      update +
      "` = '" +
      req.body[update] +
      "' WHERE id= '" +
      id +
      "';";
    console.log(query);
    connection.query(query, function(error, results, fields) {
      if (error) res.send(error);
      
    });
    res.send({res:"success"})
  });
  connection.end();
});





module.exports = router;