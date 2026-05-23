import type { Request, Response } from "express";
import { profileService } from "./profile.service";

const createProfile = async (req: Request, res: Response) => {
    try {
        const result = await profileService.createProfileIntoDB(req.body);

        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ message: error.message, error: error });
    }
};

export const profileController = { createProfile };
