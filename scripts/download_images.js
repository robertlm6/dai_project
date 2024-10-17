import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const API_URL = 'https://fakestoreapi.com/products';

async function downloadImage(url, filename) {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Failed to download image: ${url}`);

    const stream = fs.createWriteStream(filename);

    response.body.pipe(stream);

    return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

async function downloadAllImages() {
    try {
        const products = await fetch(API_URL).then(res => res.json());

        const imagesFolder = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(imagesFolder)) {
            fs.mkdirSync(imagesFolder, { recursive: true });
        }

        for (const product of products) {
            const imageUrl = product.image;
            const productId = product.id;
            const imageExtension = path.extname(imageUrl);

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

downloadAllImages();
