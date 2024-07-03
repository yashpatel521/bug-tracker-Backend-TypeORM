import express, { NextFunction, Request, Response } from "express";
import { pagination } from "typeorm-pagination";
import myDataSource from "./app-data-source";
import Middleware from "./middlewares/Middleware";
import cors from "cors";

const app = express();
app.use(Middleware.requestLogs);

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from your frontend domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"], // Include Authorization header
};

app.use(cors(corsOptions));

//Import routes files
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import { RequestError } from "./types/types";
import { PORT } from "./types/constant";
import { insertRolesAndSubRoles } from "./seed/seed";

// create and setup express app
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb" }));
app.use(pagination);

//Routes are mention here
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Project Management API",
  });
});

app.use(
  (err: RequestError, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res
      .status(err.code || 500)
      .json({ name: err.name, message: err.message, stack: err.stack });
  }
);

// start express server
myDataSource
  .initialize()
  .then(async () => {
    app.listen(PORT, async () => {
      console.log(`CONNECTED TO DB AND SERVER STARTED ON PORT - ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
