const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Rutas para servir los archivos HTML
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Ruta de login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Aquí deberías verificar las credenciales contra tu base de datos
    // Este es un ejemplo simplificado
    if (email === "usuario@example.com" && password === "password123") {
        const user = { id: 1, email: email };
        const accessToken = jwt.sign(user, process.env.JWT_SECRET);
        res.json({ token: accessToken });
    } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
});

// Ruta protegida de ejemplo
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Acceso permitido a ruta protegida' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});