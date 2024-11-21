// ./model/productos.js
import mongoose from 'mongoose';

const ProductosSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return /^[A-Z]/.test(value);
            },
            message: 'Title must start with uppercase letters'
        }
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be a positive integer or 0'],
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        rate: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    }
});

const Productos = mongoose.model('productos', ProductosSchema);
export default Productos;
