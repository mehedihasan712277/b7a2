import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req.body, req.user?.id || "");

        sendResponse(res, { statusCode: 201, success: true, message: "Issue created successfully", data: result.rows[0] });
    } catch (error: any) {
        sendResponse(res, { statusCode: 500, success: false, message: error.message || "", error: error });
        console.log(error);
    }
};

export const issueController = { createIssue };
