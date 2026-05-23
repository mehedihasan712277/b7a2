import app from "./app";
// import config from "./config";
import { initDB } from "./db";

const main = async () => {
    await initDB(); // Make sure this is async if needed
};

main();

// Export the Express app for Vercel (this is crucial)
export default app;
