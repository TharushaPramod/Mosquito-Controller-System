// fix_index.js — run this ONCE to fix the duplicate key error
// Usage: node fix_index.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const col = mongoose.connection.collection('predictions');

        // Step 1: Show all current indexes
        const indexes = await col.indexes();
        console.log('\nCurrent indexes:');
        indexes.forEach(idx => console.log(' -', JSON.stringify(idx)));

        // Step 2: Drop the bad id_1 index
        try {
            await col.dropIndex('id_1');
            console.log('\n✅ Dropped id_1 index');
        } catch (e) {
            console.log('\n⚠️  id_1 index not found or already dropped:', e.message);
        }

        // Step 3: Clear all existing prediction documents (they are broken)
        const deleted = await col.deleteMany({});
        console.log(`✅ Cleared ${deleted.deletedCount} old prediction documents`);

        // Step 4: Confirm indexes now
        const newIndexes = await col.indexes();
        console.log('\nIndexes after fix:');
        newIndexes.forEach(idx => console.log(' -', JSON.stringify(idx)));

        console.log('\n🎉 Done! Now restart your backend and re-run the Colab sender.');
        process.exit(0);
    })
    .catch(e => {
        console.error('❌ MongoDB connection failed:', e.message);
        process.exit(1);
    });
