import express, { NextFunction, Request, Response } from "express";
import { pagination } from "typeorm-pagination";
import myDataSource from "./app-data-source";
import Middleware from "./middlewares/Middleware";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
const app = express();
// app.use(Middleware.requestLogs);

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
import projectsRoutes from "./routes/projects.routes";
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
app.use("/projects", projectsRoutes);
app.use("/liveTrack", googlePlayRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Project Management API",
  });
});

// Error handling middleware
app.use(
  (err: RequestError, _req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.code || 500;
    // if (err.code.toString() === "23505") {
    //   statusCode = 409; // Conflict
    // }
    return res.status(statusCode).json({
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
