const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Clear Users and Tasks
        const collections = ['users', 'tasks'];
        
        for (const colName of collections) {
            await mongoose.connection.db.collection(colName).deleteMany({});
            console.log(`Cleared ${colName} collection.`);
        }

        console.log('Database Purge Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error purging database:', err);
        process.exit(1);
    }
};

clearDatabase();
