import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Usuarios from '../model/usuarios.js';

mongoose.connect('mongodb://root:example@localhost:27017/myProject?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("Connected to database");

    try {
        const usuarios = await Usuarios.find();

        for (const user of usuarios) {
            const isHashed = user.password.startsWith('$2b$'); // Las contraseñas bcrypt comienzan con "$2b$"
            if (isHashed) continue;

            const hashedPassword = await bcrypt.hash(user.password, 10);

            user.password = hashedPassword;
            await user.save();

            console.log(`Password for user ${user.username} has been encrypted`);
        }

        console.log("All passwords have been encrypted");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error encrypting passwords:", error);
        mongoose.connection.close();
    }
}).catch(error => console.error("Database connection error:", error));
