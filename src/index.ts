import express, { NextFunction, Request, Response } from "express";
import { pagination } from "typeorm-pagination";
import myDataSource from "./app-data-source";
import Middleware from "./middlewares/Middleware";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
const app = express();
app.use(Middleware.requestLogs);

app.use(cors());
app.use(
  fileUpload({
    createParentPath: true,
  })
);
// Use body-parser middleware for JSON payloads
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes files
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import subRoleRoutes from "./routes/subRole.routes";
import googlePlayRoutes from "./routes/googlePlay.routes";
import { RequestError } from "./utils/types";
import { getLocalIpAddress, PORT } from "./utils/constant";

// Additional middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb" }));
app.use(pagination);

// Allow uploads folder to be processed as static
app.use("/uploads", express.static("uploads"));

// Routes are mentioned here
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/subRoles", subRoleRoutes);
app.use("/api/", googlePlayRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Project Management API",
  });
});

// Error handling middleware
app.use(
  (err: RequestError, _req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    console.error(err.stack);

    if (err.code.toString() === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field",
        data: null,
      });
    }

    if (res.headersSent) {
      return next(err);
    }

    res.status(err.code || 500).json({
      success: false,
      name: err.name,
      message: err.message,
      data: err.stack,
    });
  }
);

// Start express server
myDataSource
  .initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `CONNECTED TO DB AND SERVER STARTED ON PORT - ${PORT}\n ${getLocalIpAddress()}`
      );
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
