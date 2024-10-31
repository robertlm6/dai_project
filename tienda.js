// tienda.js
import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"

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

/*app.get("/hola", (req, res) => {
    res.send('Hola desde el servidor');
});*/

import TiendaRouter from "./routes/router_tienda.js"
app.use("/", TiendaRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})
