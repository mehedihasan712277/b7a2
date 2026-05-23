import app from "./app";
import config from "./config";
import { initDB } from "./db";

const main = async () => {
    try {
        await initDB();
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
};

// Run initialization (for cold starts)
main();

// Export app for Vercel Serverless
export default app;
