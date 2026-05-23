import express, { type Application, type Request, type Response } from "express";
import { userRouter } from "./modules/user/user.route";
import { profileRouter } from "./modules/profile/profile.route";
import { authRoute } from "./modules/auth/auth.route";
import cookieParser from "cookie-parser";
import cors from "cors";

import logger from "./middleware/logger";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
const corsOption = {
    origin: "http://localhost:300",
};
app.use(cors(corsOption));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use("/api/users", userRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/auth", authRoute);

app.use(globalErrorHandler);
export default app;
