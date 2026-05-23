import { pool } from "../../db";

const createProfileIntoDB = async (payload: any) => {
    const { user_id, bio, address, phone, gender } = payload;

    const user = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [user_id],
    );

    if (user.rows.length === 0) {
        throw new Error("User does not exist");
    }

    const result = await pool.query(
        `
        INSERT INTO profiles(user_id, bio, address, phone, gender) VALUES($1,$2,$3,$4, $5)
        RETURNING *
        `,
        [user_id, bio, address, phone, gender],
    );
    return result;
};

const getAllProfilesFromDB = async () => {
    const result = "";
    return result;
};

const getOneProfileFromDB = async (id: string) => {
    const result = "";
    return result;
};

const updateProfileFromDB = async (payload: any, id: string) => {
    const result = "";
    return result;
};

const deleteProfileFromDB = async (id: string) => {
    const result = "";

    return result;
};

export const profileService = {
    createProfileIntoDB,
    getAllProfilesFromDB,
    getOneProfileFromDB,
    updateProfileFromDB,
    deleteProfileFromDB,
};
