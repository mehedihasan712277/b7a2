import type { Request, Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.createUserIntoDB(req.body);

        sendResponse(res, { statusCode: 200, success: true, message: "user create successfully", data: result.rows });
    } catch (error: any) {
        sendResponse(res, { statusCode: 500, success: false, message: error.message || "", error: error });
    }
};

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userService.getAllUsersFromDB();

        res.status(200).json({
            success: true,
            message: "Users retrived successfully",
            data: result.rows,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const getSingleUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await userService.getOneUserFromDB(id as string);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Users not found",
                data: result.rows,
            });
        }
        res.status(200).json({
            success: true,
            message: "Users retrived successfully",
            data: result.rows,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await userService.updateUserFromDB(req.body, id as string);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Users not found",
                data: result.rows,
            });
        }
        res.status(200).json({
            success: true,
            message: "Users Updated successfully",
            data: result.rows,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await userService.deleteUserFromDB(id as string);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "Users not found",
                data: result.rows,
            });
        }
        res.status(200).json({
            success: true,
            message: "Users Deleted successfully",
            data: result.rows,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};
export const userController = { createUser, getAllUsers, getSingleUser, updateUser, deleteUser };
