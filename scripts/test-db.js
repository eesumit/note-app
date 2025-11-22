import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function test() {
    try {
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully');

        const UserSchema = new mongoose.Schema({
            username: String,
        });
        // Use a different model name to avoid overwriting if it exists in cache (though script is fresh)
        const User = mongoose.models.TestUser || mongoose.model('TestUser', UserSchema);

        console.log('Checking if user exists...');
        const user = await User.findOne({});
        console.log('User check complete:', user);

        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
