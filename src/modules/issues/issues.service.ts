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

const getAllIssuesFromDB = async () => {
    const result = await pool.query(`
        SELECT 
            issues.id,
            issues.title,
            issues.description,
            issues.type,
            issues.status,

            json_build_object(
                'id', users.id,
                'name', users.name,
                'role', users.role
            ) AS reporter,

            issues.created_at,
            issues.updated_at

        FROM issues

        JOIN users
        ON issues.reporter_id = users.id
    `);

    return result;
};

const getOneIssueFromDB = async (id: string) => {
    const result = await pool.query(
        `
        SELECT 
            issues.id,
            issues.title,
            issues.description,
            issues.type,
            issues.status,

            json_build_object(
                'id', users.id,
                'name', users.name,
                'role', users.role
            ) AS reporter,

            issues.created_at,
            issues.updated_at

        FROM issues

        JOIN users
        ON issues.reporter_id = users.id

        WHERE issues.id = $1
        `,
        [id],
    );

    return result;
};

export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getOneIssueFromDB,
};
