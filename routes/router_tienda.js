// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

router.get("/", async (req, res) => {
    res.redirect('/home');
})

router.get('/home', async (req, res)=>{
    try {
        const productos = await Productos.find({})
            .sort({ 'rating.rate': -1 })
            .limit(10);
        res.render('home.html', { productos });
    } catch (err) {
        res.status(500).send({err})
    }
})

router.post('/search', async (req, res) => {
    const query = req.body.search;
    try {
        const productos = await Productos.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        const message = productos.length === 0 ? 'Products not found.' : null;

        res.render('home.html', { productos, message, query });
    } catch (err) {
        res.status(500).send({ err });
    }
});

router.get('/category/:categorySlug', async (req, res) => {
    const categoryMap = {
        'mens-clothing': "men's clothing",
        'womens-clothing': "women's clothing",
        'jewelery': "jewelery",
        'electronics': "electronics"
    };

    const categoryName = categoryMap[req.params.categorySlug];

    if (!categoryName) {
        return res.status(404).send("Category not found");
    }

    try {
        const productos = await Productos.find({ category: categoryName });

        if (productos.length === 0) {
            return res.render('category.html', {
                productos,
                message: `No products found in ${categoryName}.`,
                categoryName
            });
        }

        res.render('category.html', { productos, categoryName });
    } catch (error) {
        res.status(500).send("Error retrieving category products");
    }
});


router.get('/producto/:id', async (req, res) => {
    const productoId = req.params.id;
    try {
        const producto = await Productos.findById(productoId);
        res.render('producto-detalle.html', { producto });
    } catch (error) {
        res.status(500).send("Error al cargar el producto");
    }
});

router.get('/add-to-cart/:id', async (req, res) => {
    const productoId = req.params.id;

    try {
        const producto = await Productos.findById(productoId);

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const item = req.session.cart.find(item => item.id.toString() === productoId);
        if (item) {
            item.quantity += 1;
        } else {
            req.session.cart.push({
                id: producto._id,
                title: producto.title,
                price: producto.price,
                image: producto.image,
                quantity: 1
            });
        }

        res.redirect('/cart');
    } catch (error) {
        res.status(500).send("Error al agregar el producto al carrito");
    }
});

router.post('/remove-from-cart/:id', (req, res) => {
    const productId = req.params.id;

    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id.toString() !== productId);
    }

    res.redirect('/cart');
});

router.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    res.render('cart.html', { cart, total });
});


router.post('/update-cart/:id/increase', (req, res) => {
    const productId = req.params.id;
    const cart = req.session.cart || [];

    const item = cart.find(item => item.id.toString() === productId);
    if (item) {
        item.quantity += 1;
    }

    res.redirect('/cart');
});

router.post('/update-cart/:id/decrease', (req, res) => {
    const productId = req.params.id;
    const cart = req.session.cart || [];

    const item = cart.find(item => item.id.toString() === productId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
    } else if (item) {
        req.session.cart = cart.filter(item => item.id.toString() !== productId);
    }

    res.redirect('/cart');
});


export default router
