

const coursesDB = {
    // host: process.env.DB_HOST || "localhost",
    // user:process.env.DB_USER || "root",
    // password:process.env.DB_PASSWORD|| "",
    host: process.env.DB_HOST,
    user:process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB 
  };
  module.exports=coursesDB