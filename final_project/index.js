const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
    console.log('[MIDDLEWARE] Revisión auth para ruta:', req.originalUrl);
    console.log('[MIDDLEWARE] Session actual:', req.session);
    const token = req.session.authorization;
    if(token){
        console.log('[MIDDLEWARE] Token encontrado en session.authorization');
        jwt.verify(token, "access", (err,user)=>{
            if(!err){
                console.log('[MIDDLEWARE] Token válido. Payload:', user);
                req.user = user;
                next();
            }
            else{
                console.log('[MIDDLEWARE] Error en verificación JWT:', err.message);
                return res.status(403).json({message: "User not logged in"});
            }
        });
    }
    else{
        console.log('[MIDDLEWARE] No hay token en session.authorization');
        return res.status(403).json({message: "User not logged in"});
    }
});
 
const PORT =5050;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
