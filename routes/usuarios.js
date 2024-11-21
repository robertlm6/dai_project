// ./routes/usuarios.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Usuarios from '../model/usuarios.js';

const router = express.Router();

router.get('/login', (req, res) => {
    res.render("login.html");
});

router.post('/login', async (req, res) => {
    try {
        const user = await Usuarios.findOne({ username: req.body.username });
        if (!user) {
            return res.render("login.html", {error: 'Wrong username or password'});
        }

        // Testing credentials: donero --> ewedon / johnd --> m38rmF$
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.render("login.html", {error: 'Wrong username or password'});
        }

        const token = jwt.sign({ usuario: user.username, admin: user.admin || false }, process.env.SECRET_KEY);

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }).render("bienvenida.html", { usuario: user.username });
    } catch (err) {
        return res.render("login.html", {error: 'An error ocurred while logging in. Please try again later.'});
    }
});

router.get('/logout', (req, res) => {
    const usuario = req.username;
    req.session.cart = [];
    res.clearCookie('access_token').render("despedida.html", {usuario});
});

export default router;
