// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();

// const db = process.env.DB_NAME;
// const host = process.env.DB_HOST;
// const user = process.env.DB_USER;
// const password = process.env.DB_PASSWORD;
// const port = process.env.DB_PORT;

// const connectToMongoDB = async () => {
//   try {
//     const uri = `mongodb://${host}:${port}/${db}`; 
//     console.log("MongoDB URI:", uri);
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('MongoDB Database connected successfully');
//   } catch (error) {
//     console.log("Database connection error", error);
//     process.exit(1); 
//   }
// };

// module.exports = connectToMongoDB;

const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI;
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(url, {
        });
        console.log('Database is connected');
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
};

module.exports = connectToMongoDB;