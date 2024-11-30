const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

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

// Rutas HTML
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Ruta de registro
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = new User({ email, password });
        await user.save();

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Ruta de login modificada
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
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

// Ruta de registro de usuarios
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = new User({
            email,
            password,
            role: role || 'user' // si no se especifica, será 'user'
        });
        
        await user.save();
        
        res.status(201).json({ 
            message: 'Usuario creado exitosamente',
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

