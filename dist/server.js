

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/authentication/auth.route.ts
import { Router } from "express";

// src/modules/authentication/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  PORT: process.env.PORT,
  SECRET: process.env.secret,
  REFRESH_SECRET: process.env.refresh_secret
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                
                name TEXT NOT NULL,
                
                email VARCHAR(255) UNIQUE NOT NULL,
                
                password TEXT NOT NULL,
                
                role VARCHAR(20) DEFAULT 'contributor'
                CHECK (role IN ('contributor', 'maintainer')),

                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
                id SERIAL PRIMARY KEY,

                title VARCHAR(150) NOT NULL,

                description TEXT NOT NULL
                CHECK (LENGTH(description) >= 20),

                type VARCHAR(20) NOT NULL
                CHECK (type IN ('bug', 'feature_request')),

                status VARCHAR(20) DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'resolved')),

                reporter_id INT NOT NULL,

                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    console.log("database connected");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/authentication/auth.service.ts
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hasgedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
            INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4,'contributor'))
            RETURNING *
            
            `,
    [name, email, hasgedPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtpayload, config_default.SECRET, {
    expiresIn: "1d"
  });
  const refreshToken2 = jwt.sign(jwtpayload, config_default.REFRESH_SECRET, {
    expiresIn: "10d"
  });
  delete userData.rows[0].password;
  return { accessToken, refreshToken: refreshToken2, user: userData.rows[0] };
};
var generateFreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = jwt.verify(token, config_default.REFRESH_SECRET);
  const userData = await pool.query(
    `
            SELECT * FROM users WHERE email=$1
            `,
    [decoded.email]
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
    role: user.role
  };
  const accessToken = jwt.sign(jwtpayload, config_default.SECRET, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  createUserIntoDB,
  loginUserIntoDB,
  generateFreshToken
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/utils/errorMessageHandler.ts
var getErrorMessage = (error) => {
  if (error instanceof Error) return error.message;
  return "Unknown error";
};

// src/modules/authentication/auth.controller.ts
var signUp = async (req, res) => {
  try {
    const result = await authService.createUserIntoDB(req.body);
    sendResponse_default(res, { statusCode: 201, success: true, message: "User registered successfully", data: result.rows[0] });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      // true inproduction
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: {
        token: result.accessToken,
        user: result.user
      }
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateFreshToken(req.cookies.refreshToken);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var authController = {
  signUp,
  loginUser,
  refreshToken
};

// src/modules/authentication/auth.route.ts
var router = Router();
router.post("/signup", authController.signUp);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
var authRoute = router;

// src/modules/issues/issues.routes.ts
import { Router as Router2 } from "express";

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload, id) => {
  const { title, description, type, status } = payload;
  if (!id) {
    throw new Error("User is missing");
  }
  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, COALESCE($4,'open'), $5)
        RETURNING *
        `,
    [title, description, type, status, id]
  );
  return result;
};
var getAllIssuesFromDB = async () => {
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
var getOneIssueFromDB = async (id) => {
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
    [id]
  );
  return result;
};
var updateIssueFromDB = async (payload, id, user) => {
  const issue = await pool.query(
    `
            SELECT * FROM issues
            WHERE id=$1
            `,
    [id]
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
            updated_at = NOW()
            
            WHERE id=$4 RETURNING *
            `,
      [payload.title, payload.description, payload.type, id]
    );
    return result;
  } else if (user?.role === USER_ROLE.maintainer) {
    const result = await pool.query(
      `
        UPDATE issues
        
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            status = COALESCE($4, status),
            reporter_id = COALESCE($5, reporter_id),
            updated_at = NOW()

        WHERE id = $6
        
        RETURNING *
        `,
      [payload.title, payload.description, payload.type, payload.status, payload.reporter_id, id]
    );
    return result;
  } else {
    throw new Error("Cannot be updated");
  }
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
            DELETE FROM issues WHERE id=$1
            `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getOneIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req.user?.id || "");
    sendResponse_default(res, { statusCode: 201, success: true, message: "Issue created successfully", data: result.rows[0] });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getOneIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: result.rows
      });
    }
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id: iId } = req.params;
  const { id, name, role } = req.user;
  try {
    const result = await issueService.updateIssueFromDB(req.body, iId, { id, name, role });
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
        data: result.rows
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: result.rows
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: getErrorMessage(error),
      error
    });
  }
};
var issueController = { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue };

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({ message: "Unauthorized" });
      }
      const decoded = jwt2.verify(token, config_default.SECRET);
      const userData = await pool.query(
        `
            SELECT * FROM users WHERE id=$1
            `,
        [decoded.id]
      );
      if (userData.rows.length === 0) {
        res.status(404).json({ message: "User not found" });
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({ message: "Forbidden. The role does not have access" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/issues/issues.routes.ts
var router2 = Router2();
router2.post("/", auth_default(), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(), issueController.updateIssue);
router2.delete("/:id", auth_default(USER_ROLE.maintainer), issueController.deleteIssue);
var issuesRouter = router2;

// src/app.ts
var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
var corsOption = {
  origin: "http://localhost:300"
};
app.use(cors(corsOption));
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.PORT, () => {
    console.log(`Example app listening on port ${config_default.PORT}`);
  });
};
main();
//# sourceMappingURL=server.js.map