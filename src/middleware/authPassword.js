const bcrypt = require("bcrypt");
const mysql = require('mysql2/promise')
const coursesDB =  require('../db-config')
// {
//   host: "localhost",
//   user: "root",
//   password: "",
//   // host: process.env.DB_HOST || "localhost",
//   // user:process.env.DB_USER || "root",
//   // password:process.env.DB_PASSWORD|| "",
//   database: "college"
// };

const authPassword = async (req, res, next) => {
  try {
    const id = req.id;
  let compare=false;
    const oldPassword = req.body.oldPassword;
    if(!req.body.oldPassword){
      next();
    }else{
    const connection = await mysql.createConnection(coursesDB);
   let query =
      "SELECT `password`  from college.students WHERE id= '" + id + "'";
      if(req.admin){
        query =
      "SELECT `password`  from college.teachers WHERE id= '" + id + "'";
      }
    console.log(query);
    const [rows, fields] = await connection.execute(query);
    console.log(rows);
    if (rows[0]) {
          console.log(rows[0].password)
          console.log(oldPassword)
          compare = bcrypt.compareSync(oldPassword, rows[0].password);
          console.log(compare)
    } 
          if (!compare) {
            throw new Error();
          }  
   next();
        }
  } catch (e) {
    res.status(400).send({ error: "Incorrect old password!" });
  }
};

module.exports = authPassword;
