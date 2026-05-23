import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (payload: IUser) => {
    const { name, email, password, age, role } = payload;

    const hasgedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
        INSERT INTO users(name, email, password, age, role) VALUES($1, $2, $3, $4, COALESCE($5,'user'))
        RETURNING *
        `,
        [name, email, hasgedPassword, age, role],
    );
    delete result.rows[0].password;
    return result;
};

const getAllUsersFromDB = async () => {
    const result = await pool.query(`
            SELECT * FROM users
            `);
    return result;
};

const getOneUserFromDB = async (id: string) => {
    const result = await pool.query(
        `
            SELECT * FROM users WHERE id=$1
            `,
        [id],
    );
    return result;
};

const updateUserFromDB = async (payload: IUser, id: string) => {
    const { name, password, age, is_active, role } = payload;
    const result = await pool.query(
        `
            UPDATE users
            
            SET
            
            name=COALESCE($1,name),
            password=COALESCE($2,password),
            age=COALESCE($3,age),
            is_active=COALESCE($4,is_active),
            role=COALESCE($5,role)

            WHERE id=$6 RETURNING *
            `,
        [name, password, age, is_active, role, id],
    );
    return result;
};

const deleteUserFromDB = async (id: string) => {
    const result = await pool.query(
        `
            DELETE FROM users WHERE id=$1
            `,
        [id],
    );

    return result;
};

export const userService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getOneUserFromDB,
    updateUserFromDB,
    deleteUserFromDB,
};
