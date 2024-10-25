// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

router.get("/", async (req, res) => {
    res.redirect('/home');
})

router.get('/home', async (req, res)=>{
    try {
        const productos = await Productos.find({})   // todos los productos
        res.render('home.html', { productos })    // ../views/home.html,
    } catch (err) {                                // se le pasa { productos:productos }
        res.status(500).send({err})
    }
})

// ... más rutas aquí

export default router
