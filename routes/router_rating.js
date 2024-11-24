import express from 'express';
import Productos from '../model/productos.js';
import logger from '../logger/winston_logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const desde = parseInt(req.query.desde);
        const hasta = parseInt(req.query.hasta);

        if ((desde !== undefined && desde < 0) || (hasta !== undefined && hasta <= desde)) {
            return res.status(400).json({ error: "Invalid parameters: 'from' must be >= 0 and 'to' > 'from'" });
        }

        let ratings;
        if (desde !== undefined && hasta !== undefined) {
            const limit = hasta - desde;
            ratings = await Productos.find({}, 'rating title')
                .skip(desde)
                .limit(limit);
        } else {
            ratings = await Productos.find({}, 'rating title');
        }

        res.json(ratings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error getting ratings' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const producto = await Productos.findById(req.params.id, 'rating title');

        if (!producto) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: "Error getting rating.", error });
    }
});

router.put('/:id', async (req, res) => {
    const { rate, count } = req.body;

    if (rate < 0 || rate > 5) {
        return res.status(400).json({ message: "Rating must be between 0 y 5." });
    }

    try {
        const producto = await Productos.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ message: "Product not found." });
        }

        producto.rating.rate = rate;
        producto.rating.count = count || producto.rating.count;
        await producto.save();

        res.json({ message: "Rating successfully updated.", producto });
    } catch (error) {
        res.status(500).json({ message: "Error updating rating.", error });
    }
});

export default router;
