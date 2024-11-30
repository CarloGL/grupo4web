require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
    {
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        email: 'user@gmail.com',
        password: 'user123',
        role: 'user'
    }
];

async function createUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        for (const userData of users) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log(`Usuario creado: ${userData.email}`);
            } else {
                console.log(`Usuario ya existe: ${userData.email}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexión cerrada');
    }
}

createUsers();