
const jwt = require('jsonwebtoken')

authStaff = async (req, res, next) => {
    try {
        req.admin=true
        const token = req.header('token').replace('Bearer ', '')
        console.log('new ',)
        const decoded = jwt.verify(token, process.env.JWT_STAFF_SECRET)
        const id=decoded.id
       

        if (!id) {
            throw new Error({ error: 'Please authenticate.' })}
        req.token=token
        req.id = id
        next()
    } catch (e) {
        res.status(401).send( {error: 'Please authenticate.' })
    }
}

module.exports = authStaff