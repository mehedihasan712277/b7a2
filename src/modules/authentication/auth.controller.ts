import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { getErrorMessage } from "../../utils/errorMessageHandler";

const signUp = async (req: Request, res: Response) => {
    try {
        const result = await authService.createUserIntoDB(req.body);

        sendResponse(res, { statusCode: 201, success: true, message: "User registered successfully", data: result.rows[0] });
    } catch (error: unknown) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: getErrorMessage(error),
            error,
        });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);

        const { refreshToken } = result;

        res.cookie("refreshToken", refreshToken, {
            secure: false, // true inproduction
            httpOnly: true,
            sameSite: "lax",
        });
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: {
                token: result.accessToken,
                user: result.user,
            },
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

const refreshToken = async (req: Request, res: Response) => {
    try {
        const result = await authService.generateFreshToken(req.cookies.refreshToken);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Access token generated",
            data: result,
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

export const authController = {
    signUp,
    loginUser,
    refreshToken,
};
