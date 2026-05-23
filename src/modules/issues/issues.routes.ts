import { Router } from "express";
import { issueController } from "./issues.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post("/", auth(), issueController.createIssue);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
// router.put("/:id");
// router.delete("/:id");

export const issuesRouter = router;
