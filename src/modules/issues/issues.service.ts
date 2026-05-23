import { pool } from "../../db";
import type { IIssue } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssue, id: string) => {
    const { title, description, type, status } = payload;

    if (!id) {
        throw new Error("User is missing");
    }
    const result = await pool.query(
        `
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, COALESCE($4,'open'), $5)
        RETURNING *
        `,
        [title, description, type, status, id],
    );
    return result;
};

export const issueService = {
    createIssueIntoDB,
};
