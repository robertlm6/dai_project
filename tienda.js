// tienda.js
import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"
import TiendaRouter from "./routes/router_tienda.js"
import routerUsuarios from './routes/usuarios.js';
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import connectDB from "./model/db.js"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {
    autoescape: true,
    noCache:    IN == 'development',
    watch:      IN == 'development',
    express: app
})
app.set('view engine', 'html')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.cartItems = req.session.cart || [];
    next();
});

// Authentication
app.use(cookieParser())

const autentificacion = (req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {
            username: data.username,
            admin: data.admin
        };
    }
    next();
};

app.use(autentificacion)

/*app.get("/hola", (req, res) => {
    res.send('Hola desde el servidor');
});*/

app.use("/usuarios", routerUsuarios);
app.use("/", TiendaRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
});
