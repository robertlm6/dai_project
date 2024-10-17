import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: `../.env` });

const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

const dbName = 'myProject';

async function productosDeMasDe100() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('productos');

        const query = { price: { $gt: 100 } };
        const productos = await collection.find(query).toArray();

        console.log('Productos que cuestan más de 100 dólares:', productos);
        return productos;

    } catch (error) {
        console.error('Error realizando la consulta:', error);
    } finally {
        await client.close();
    }
}

async function productosConWinterEnDescripcionPorPrecio() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('productos');

        const query = { description: {$regex: "winter", $options: "i"} }
        const productos = await collection.find(query).sort({ price: -1 }).toArray();

        console.log('Productos que contienen la palabra winter en la descripción ordenados por precio:', productos)
        return productos;

    } catch (error) {
        console.error('Error realizando la consulta:', error);
    } finally {
        await client.close();
    }
}

async function productosDeJoyeriaPorRating() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('productos');

        const query = { category: { $regex: "jewelery", $options: "i" } };
        const productos = await collection.find(query).sort({ 'rating.rate': -1 }).toArray();

        console.log('Productos de joyería ordenados por rating:', productos);
        return productos;

    } catch (error) {
        console.log('Error realizando la consulta:', error);
    } finally {
        await client.close();
    }
}

async function reseniasTotales() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('productos');

        const pipeline = [{ $group: { _id: null, totalResenias: { $sum: '$rating.count' } } }];
        const resenias = await collection.aggregate(pipeline).toArray();

        console.log('Reseñas totales:', resenias);
        return resenias;
    } catch (error) {
        console.error('Error realizando la consulta:', error);
    } finally {
        await client.close();
    }
}

async function puntuacionMediaPorCategoria() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('productos');

        const pipeline = [{ $group: { _id: '$category', mediaRating: { $avg: '$rating.rate' } } }];
        const mediaPorCategoria = await collection.aggregate(pipeline).toArray();

        console.log('Puntuacion media por categoria de producto:', mediaPorCategoria);
        return mediaPorCategoria;
    } catch (error) {
        console.error('Error realizando la consulta:', error);
    } finally {
        await client.close();
    }
}

async function sinDigitosEnPassword() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('usuarios');

        const query = { password: { $regex: "^[^0-9]*$" } };
        const usuarios = await collection.find(query).toArray();

        console.log('Usuarios sin digitos en el password:', usuarios);
        return usuarios;
    } catch (error) {
        console.error('Error realizando la consulta:', error);
    } finally {
        await client.close();
    }
}

await productosDeMasDe100();
await productosConWinterEnDescripcionPorPrecio();
await productosDeJoyeriaPorRating();
await reseniasTotales();
await puntuacionMediaPorCategoria();
await sinDigitosEnPassword();

