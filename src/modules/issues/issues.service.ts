import { pool } from "../../db";
import { USER_ROLE } from "../../types";
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

const updateIssueFromDB = async (payload: IIssue, id: string, user: { id: number; name: string; role: string } | null) => {
    const { title, description, type } = payload;

    const issue = await pool.query(
        `
            SELECT * FROM issues
            WHERE id=$1
            `,
        [id],
    );
    if (issue.rows.length === 0) {
        throw new Error("Issue not found");
    }
    const { reporter_id, status } = issue.rows[0];

    if (user?.role === USER_ROLE.contributor && user.id === reporter_id && status === "open") {
        const result = await pool.query(
            `
            UPDATE issues
            
            SET
            
            title=COALESCE($1,title),
            description=COALESCE($2,description),
            type=COALESCE($3,type)
            
            WHERE id=$4 RETURNING *
            `,
            [title, description, type, id],
        );
        return result;
    } else if (user?.role === USER_ROLE.maintainer) {
        const result = await pool.query(
            `
            UPDATE issues
            
            SET
            
            title=COALESCE($1,title),
            description=COALESCE($2,description),
            type=COALESCE($3,type)
            
            WHERE id=$4 RETURNING *
            `,
            [title, description, type, id],
        );
        return result;
    } else {
        throw new Error("Cannot be updated");
    }
};

const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(
        `
            DELETE FROM issues WHERE id=$1
            `,
        [id],
    );

    return result;
};

export const issueService = {
    createIssueIntoDB,
    getAllIssuesFromDB,
    getOneIssueFromDB,
    updateIssueFromDB,
    deleteIssueFromDB,
};
