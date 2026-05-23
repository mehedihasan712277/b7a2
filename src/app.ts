import express, { type Application, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/authentication/auth.route";
import { issuesRouter } from "./modules/issues/issues.routes";

const app: Application = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
const corsOption = {
    origin: "http://localhost:300",
};
app.use(cors(corsOption));

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRouter);

app.use(globalErrorHandler);
export default app;
