import { Router } from "express";
import projectsController from "../controllers/projects.controller";
import { Auth } from "../middlewares/Auth";

const router = Router();

//Projects
router.get("/", Auth, projectsController.viewAll);
router.get(
  "/projectDetails/:projectId",
  Auth,
  projectsController.viewProjectDetails
);
router.get(
  "/projectDetails/:projectId/memberInProject",
  Auth,
  projectsController.memberInProject
);
router.get("/getPinProjects", Auth, projectsController.getPinProjects);
router.get("/getProjectReports", Auth, projectsController.getProjectReports);
router.post("/", Auth, projectsController.createProject);
router.post("/editUserToProject", Auth, projectsController.editUserToProject);
router.post("/update/:projectId", Auth, projectsController.updateProject);
router.post("/togglePin/:projectId", Auth, projectsController.tooglePin);

//Bugs
router.get("/bugs/:bugId", Auth, projectsController.getBugDetail);
router.post("/bugs", Auth, projectsController.createBug);
router.post("/bugs/update", Auth, projectsController.updateBugDetail);
router.post("/bugs/image/:bugId", Auth, projectsController.addImageToBug);
router.delete("/bugs/image/:ImageId", Auth, projectsController.deleteBugImage);

//Versions
router.get("/getVersions/:projectId", Auth, projectsController.getVersions);
router.delete("/version/:versionId", Auth, projectsController.deleteVersion);
router.post(
  "/addVersionToProject",
  Auth,
  projectsController.addVersionToProject
);
router.get(
  "/:projectId/bugs/:versionId",
  Auth,
  projectsController.getProjectsBugsByVesrioinId
);
export default router;
