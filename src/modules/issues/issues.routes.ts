import { Router } from "express";
import { issueController } from "./issues.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

router.post("/", auth(), issueController.createIssue);
// router.get("/");
// router.get("/:id");
// router.put("/:id");
// router.delete("/:id");

export const issuesRouter = router;
