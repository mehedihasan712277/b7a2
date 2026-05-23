import app from "./src/app";
import config from "./src/config";
import { initDB } from "./src/db";

const main = () => {
    initDB();
    app.listen(config.PORT, () => {
        console.log(`Example app listening on port ${config.PORT}`);
    });
};

main();
