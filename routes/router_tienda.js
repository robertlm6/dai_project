// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
import logger from "../logger/winston_logger.js";
const router = express.Router();

router.get("/", async (req, res) => {
    res.redirect('/home');
})

router.get('/home', async (req, res)=>{
    const usuario = req.user;
    try {
        const productos = await Productos.find({})
            .sort({ 'rating.rate': -1 })
            .limit(12);
        res.render('home.html', { productos, usuario });
    } catch (err) {
        res.status(500).send({err})
    }
})

router.post('/search', async (req, res) => {
    const query = req.body.search;
    const usuario = req.user;
    try {
        const productos = await Productos.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        const message = productos.length === 0 ? 'Products not found.' : null;

        res.render('home.html', { productos, message, query, usuario });
    } catch (err) {
        res.status(500).send({ err });
    }
});

router.get('/category/:categorySlug', async (req, res) => {
    logger.info("You are using /category route");
    logger.warn("You are using /category route");
    logger.error("You are using /category route");
    const usuario = req.user;
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

        res.render('category.html', { productos, categoryName, usuario });
    } catch (error) {
        res.status(500).send("Error retrieving category products");
    }
});


router.get('/producto/:id', async (req, res) => {
    try {
        const producto = await Productos.findById(req.params.id);

        if (!producto) {
            return res.status(404).send("Product not found.");
        }

        res.render('producto-detalle.html', { producto, user: req.user });
    } catch (error) {
        res.status(500).send("Error loading the product");
    }
});

router.post('/producto/:id/editar', async (req, res) => {
    const user = req.user;

    if (!user || !user.admin) {
        return res.status(403).send("Unauthorized");
    }

    const { title, price } = req.body;

    try {
        const producto = await Productos.findByIdAndUpdate(
            req.params.id,
            { title, price },
            { new: true, runValidators: true }
        );

        res.redirect(`/producto/${producto._id}`);
    } catch (error) {
        const producto = await Productos.findById(req.params.id);

        res.render('producto-detalle.html', {
            producto,
            user,
            error: 'Error updating product info. Please, verify the new data and try again later.'
        });
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
        res.status(500).send("Error adding the product to cart");
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
    const usuario = req.user;
    const cart = req.session.cart || [];
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    res.render('cart.html', { cart, total, usuario });
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
