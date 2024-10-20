import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

console.log('🏁 seed.js ----------------->');

const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

const dbName = 'myProject';

async function Inserta_datos_en_coleccion(coleccion, url) {
    try {
        const datos = await fetch(url).then(res => res.json());
        console.log(`Insertando ${datos.length} datos en la colección ${coleccion}`);

        await client.connect();
        console.log('Conectado correctamente a la BD');
        const db = client.db(dbName);
        const collection = db.collection(coleccion);

        const result = await collection.insertMany(datos);
        console.log(`${result.insertedCount} documentos insertados en la colección ${coleccion}`);

        return `${datos.length} datos traídos para ${coleccion}`;

    } catch (err) {
        err.errorResponse += ` en fetch ${coleccion}`;
        throw err;
    } finally {
        await client.close();
    }
}

// Inserción consecutiva
Inserta_datos_en_coleccion('productos', 'https://fakestoreapi.com/products')
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => Inserta_datos_en_coleccion('usuarios', 'https://fakestoreapi.com/users'))
    .then((r) => console.log(`Todo bien: ${r}`))
    .catch((err) => console.error('Algo mal: ', err.errorResponse));

console.log('Lo primero que pasa');
