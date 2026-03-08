import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI;
const BACKUP_DIR = path.join(process.cwd(), 'backups');

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
}

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
    const folderName = `backup_${timestamp}`;
    const targetDir = path.join(BACKUP_DIR, folderName);

    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
    fs.mkdirSync(targetDir);

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('🔌 Connected to MongoDB...');

        const db = client.db();
        const collections = await db.listCollections().toArray();

        for (const col of collections) {
            console.log(`📦 Backing up collection: ${col.name}...`);
            const data = await db.collection(col.name).find({}).toArray();
            fs.writeFileSync(
                path.join(targetDir, `${col.name}.json`),
                JSON.stringify(data, null, 2)
            );
        }

        console.log(`\n✅ Backup completed successfully to: ${folderName}`);
    } catch (err) {
        console.error('❌ Backup failed:', err);
    } finally {
        await client.close();
    }
}

async function restore() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.error('❌ No backups folder found.');
        return;
    }

    const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup_')).sort().reverse();

    if (backups.length === 0) {
        console.error('❌ No backups available.');
        return;
    }

    // If the user wants to select, we'll list them and take the first one or take an argument
    const selectedBackup = process.argv[3] || backups[0];
    const sourceDir = path.join(BACKUP_DIR, selectedBackup);

    if (!fs.existsSync(sourceDir)) {
        console.error(`❌ Backup "${selectedBackup}" not found.`);
        console.log('Available backups:', backups.join(', '));
        return;
    }

    console.log(`♻️  Restoring from: ${selectedBackup}...`);

    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const colName = path.basename(file, '.json');
            console.log(`📥 Restoring collection: ${colName}...`);

            const rawData = fs.readFileSync(path.join(sourceDir, file), 'utf8');
            const data = JSON.parse(rawData);

            if (data.length > 0) {
                // Warning: this drops existing collection data
                await db.collection(colName).deleteMany({});

                // Mongo restore needs to handle ObjectID if they were stringified, but for JSON it's usually fine
                // for complex types we might need EJSON but for simple shop data JSON is okay
                await db.collection(colName).insertMany(data);
            }
        }

        console.log('\n✅ Restore completed successfully!');
    } catch (err) {
        console.error('❌ Restore failed:', err);
    } finally {
        await client.close();
    }
}

const mode = process.argv[2];

if (mode === 'backup') {
    backup();
} else if (mode === 'restore') {
    restore();
} else {
    console.log('Usage: node scripts/db-manager.js [backup|restore] [optional_folder_name]');
}
