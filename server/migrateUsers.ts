import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migrateUsers = async () => {
    try {
        console.log('Starting user migration...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/stealdeal');

        // Access the raw collection to find documents that might not match the schema yet
        // and to check for the 'username' field which Mongoose might strip if strict is true.
        const collection = mongoose.connection.collection('users');
        const allUsers = await collection.find({}).toArray();

        console.log(`Found ${allUsers.length} users to potentialy migrate.`);

        for (const rawUser of allUsers) {
            let updates: any = {};
            let needsUpdate = false;

            // 1. Migrate Username -> Name
            if (!rawUser.name) {
                if (rawUser.username) {
                    console.log(`Migrating username '${rawUser.username}' to name for user ${rawUser._id}`);
                    updates.name = rawUser.username;
                    needsUpdate = true;
                } else {
                    console.log(`No name or username for user ${rawUser._id}. Setting placeholder.`);
                    updates.name = `User ${rawUser._id.toString().slice(-4)}`;
                    needsUpdate = true;
                }
            }

            // 2. Ensure Phone
            if (!rawUser.phone) {
                console.log(`Setting default phone for user ${rawUser._id}`);
                updates.phone = '0000000000'; // Default placeholder
                needsUpdate = true;
            }

            // 3. Remove 'username' field if it exists to clean up (optional, but good for schema compliance)
            let unset: any = {};
            if (rawUser.username) {
                // We only unset if we have successfully migrated it or if it's redundant
                unset.username = "";
                needsUpdate = true;
            }

            if (needsUpdate) {
                const updateOp: any = { $set: updates };
                if (Object.keys(unset).length > 0) {
                    updateOp.$unset = unset;
                }

                await collection.updateOne(
                    { _id: rawUser._id },
                    updateOp
                );
                console.log(`Updated user ${rawUser._id}`);
            }
        }

        console.log('Migration completed successfully.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error migrating users:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

migrateUsers();
