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

const getAllIssues = async (req: Request, res: Response) => {
    try {
        const result = await issueService.getAllIssuesFromDB();

        sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result.rows,
        });
    } catch (error: any) {
        sendResponse(res, { statusCode: 500, success: false, message: error.message || "", error: error });
    }
};

const getSingleIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await issueService.getOneIssueFromDB(id as string);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Users not found",
                data: result.rows,
            });
        }
        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error: any) {
        sendResponse(res, { statusCode: 500, success: false, message: error.message || "", error: error });
    }
};

export const issueController = { createIssue, getAllIssues, getSingleIssue };
