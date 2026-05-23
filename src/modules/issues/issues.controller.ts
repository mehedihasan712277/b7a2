import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issues.service";
import type { JwtPayload } from "jsonwebtoken";
import { getErrorMessage } from "../../utils/errorMessageHandler";

const createIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req.body, req.user?.id || "");

        sendResponse(res, { statusCode: 201, success: true, message: "Issue created successfully", data: result.rows[0] });
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: getErrorMessage(error),
            error,
        });
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
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: getErrorMessage(error),
            error,
        });
    }
};

const getSingleIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await issueService.getOneIssueFromDB(id as string);

        if (result.rowCount === 0) {
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
                data: result.rows,
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: getErrorMessage(error),
            error,
        });
    }
};

const updateIssue = async (req: Request, res: Response) => {
    const { id: iId } = req.params;
    const { id, name, role } = req.user as JwtPayload & {
        id: number;
        name: string;
        role: string;
    };
    try {
        const result = await issueService.updateIssueFromDB(req.body, iId as string, { id, name, role });

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Issue not found",
                data: result.rows,
            });
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully",
            data: result.rows[0],
        });
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: getErrorMessage(error),
            error,
        });
    }
};

const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await issueService.deleteIssueFromDB(id as string);

        if (result.rowCount === 0) {
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
                data: result.rows,
            });
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue deleted successfully",
        });
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: getErrorMessage(error),
            error,
        });
    }
};
export const issueController = { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue };
