import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
try {
    db = SQLite.openDatabaseSync('reviews.db');
} catch (e) {
    console.log("Failed to open DB synchronously:", e);
}

export const initDB = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('reviews.db');
    }
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurantId INTEGER NOT NULL,
        rating REAL NOT NULL,
        text TEXT,
        imageUri TEXT,
        timestamp INTEGER NOT NULL
      );
    `);
        console.log("Database initialized");
    } catch (error) {
        console.log("DB init error:", error);
    }
};

export const addReview = async (restaurantId: number, rating: number, text: string, imageUri: string) => {
    try {
        if (!db) db = await SQLite.openDatabaseAsync('reviews.db');
        const timestamp = Date.now();
        let finalImageUri = imageUri;

        if (imageUri) {
            const filename = imageUri.split('/').pop() || 'photo.jpg';
            const newPath = (FileSystem as any).documentDirectory + filename;
            await (FileSystem as any).copyAsync({ from: imageUri, to: newPath });
            finalImageUri = newPath;
        }

        const result = await db.runAsync(
            "INSERT INTO reviews (restaurantId, rating, text, imageUri, timestamp) VALUES (?, ?, ?, ?, ?)",
            restaurantId, rating, text, finalImageUri, timestamp
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Error adding review:", error);
        throw error;
    }
};

export const getReviewsByRestaurant = async (restaurantId: number) => {
    try {
        if (!db) db = await SQLite.openDatabaseAsync('reviews.db');
        const allRows = await db.getAllAsync(
            "SELECT * FROM reviews WHERE restaurantId = ? ORDER BY timestamp DESC",
            restaurantId
        );
        return allRows;
    } catch (error) {
        console.error("Error getting reviews:", error);
        return [];
    }
};
