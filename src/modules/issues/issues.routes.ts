import { Router } from "express";
import { issueController } from "./issues.controller";

const router = Router();

router.post("/", issueController.createIssue);
// router.get("/");
// router.get("/:id");
// router.put("/:id");
// router.delete("/:id");

export const issuesRouter = router;
