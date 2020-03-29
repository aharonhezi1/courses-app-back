
const jwt = require('jsonwebtoken')

auth = async (req, res, next) => {


    try {   
        let decoded;
        const token = req.header('token').replace('Bearer ', '')
        req.token=token
    //console.log(!!token)
        jwt.verify(token,  process.env.JWT_STAFF_SECRET, function(err, decoded) {
          if(!!decoded){
           // this.decoded=decoded  
            req.id=req.header('studetId').replace('Bearer ', '')
            //console.log(req.id)
            
          }
               
            if(err) {
                jwt.verify(token,  process.env.JWT_SECRET, function(err, decoded2) {
             req.id = decoded2.id 
             console.log(req.id)
                //console.log("!tokenauth")
        this.decoded=decoded2
            });
        } 
        if(!!decoded || !!this.decoded){
            next()
        }
                       
    })
} catch (e) {
        res.status(401).send( {error: 'Please authenticate!!' })
    }
    
}
    
// }

module.exports = auth