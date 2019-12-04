const express = require('express')
const app = express()
const cors = require('cors')
const studentsRoute=require('./routes/stutents')
const coursesRoute=require('./routes/courses')
const studentsAtCoursesRoute=require('./routes/teachers')

app.use(cors())
app.use(express.json())
app.use(studentsRoute)
app.use(coursesRoute)
app.use(studentsAtCoursesRoute)

app.listen(3000, () => {
    console.log('Server started!')
  })