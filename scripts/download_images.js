// Importar módulos
import fetch from 'node-fetch'; // Para hacer las peticiones HTTP
import fs from 'fs';            // Para manejar el sistema de archivos
import path from 'path';        // Para manejar rutas de archivos

// URL de la API de productos
const API_URL = 'https://fakestoreapi.com/products';

// Función para descargar una imagen
async function downloadImage(url, filename) {
    const response = await fetch(url);

    // Verificar que la respuesta fue exitosa
    if (!response.ok) throw new Error(`Failed to download image: ${url}`);

    // Crear un flujo de escritura en el archivo
    const stream = fs.createWriteStream(filename);

    // Descargar el archivo de la imagen y guardarlo
    response.body.pipe(stream);

    // Devolver una promesa que se resuelve cuando la descarga esté completa
    return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

// Función para descargar todas las imágenes
async function downloadAllImages() {
    try {
        // Obtener los datos de los productos
        const products = await fetch(API_URL).then(res => res.json());

        // Crear la carpeta 'images' si no existe
        const imagesFolder = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesFolder)) {
            fs.mkdirSync(imagesFolder, { recursive: true });
        }

        // Recorrer todos los productos y descargar sus imágenes
        for (const product of products) {
            const imageUrl = product.image;
            const productId = product.id;
            const imageExtension = path.extname(imageUrl); // Obtener la extensión del archivo (.jpg, .png, etc.)

            // Crear el nombre del archivo de la imagen basado en el ID del producto
            const filename = path.join(imagesFolder, `product_${productId}${imageExtension}`);

            console.log(`Descargando imagen: ${imageUrl}`);
            await downloadImage(imageUrl, filename);
            console.log(`Imagen guardada como: ${filename}`);
        }

        console.log('Todas las imágenes han sido descargadas exitosamente.');
    } catch (error) {
        console.error('Error descargando imágenes: ', error);
    }
}

// Ejecutar la función de descarga
downloadAllImages();
