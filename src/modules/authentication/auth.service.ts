import bcrypt from "bcryptjs";
import { pool } from "./../../db/index";

import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const createUserIntoDB = async (payload: { name: string; email: string; password: string; role: string }) => {
    const { name, email, password, role } = payload;
    const hasgedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
            INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4,'contributor'))
            RETURNING *
            
            `,
        [name, email, hasgedPassword, role],
    );
    delete result.rows[0].password;

    return result;
};

const loginUserIntoDB = async (payload: { email: string; password: string }) => {
    const { email, password } = payload;

    const userData = await pool.query(
        `
    SELECT * FROM users WHERE email=$1
    `,
        [email],
    );
    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials!");
    }

    // 2. Compare the password -> Done
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        throw new Error("Invalid Credentials!");
    }

    //3. Generate Token
    const jwtpayload = {
        id: user.id,
        name: user.name,
        is_active: user.is_active,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(jwtpayload, config.SECRET, {
        expiresIn: "1d",
    });

    const refreshToken = jwt.sign(jwtpayload, config.REFRESH_SECRET, {
        expiresIn: "10d",
    });

    return { accessToken, refreshToken };
};

const generateFreshToken = async (token: string) => {
    if (!token) {
        throw new Error("Unauthorized");
    }
    const decoded = jwt.verify(token as string, config.REFRESH_SECRET) as JwtPayload;

    const userData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
            `,
        [decoded.email],
    );
    if (userData.rows.length === 0) {
        throw new Error("User not found");
    }

    const user = userData.rows[0];

    if (!user.is_active) {
        throw new Error("Forbidden");
    }

    const jwtpayload = {
        id: user.id,
        name: user.name,
        is_active: user.is_active,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(jwtpayload, config.SECRET, {
        expiresIn: "1d",
    });

    return { accessToken };
};

export const authService = {
    createUserIntoDB,
    loginUserIntoDB,
    generateFreshToken,
};
