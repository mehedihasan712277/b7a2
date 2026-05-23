import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.join(process.cwd(), ".env"),
});

const config = {
    connection_string: process.env.CONNECTIONSTRING as string,
    PORT: process.env.PORT as string,
    SECRET: process.env.secret as string,
    REFRESH_SECRET: process.env.refresh_secret as string,
};

export default config;
