import { Router } from "express";
import projectsController from "../controllers/projects.controller";
import { Auth } from "../middlewares/Auth";

const router = Router();

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
router.get(
  "/getLastVersionNumber/:projectId",
  Auth,
  projectsController.getLastVersionNumber
);
router.get("/getPinProjects", Auth, projectsController.getPinProjects);
router.get("/getProjectReports", Auth, projectsController.getProjectReports);
router.get(
  "/:projectId/bugs/:versionId",
  Auth,
  projectsController.getProjectsBugsByVesrioinId
);
router.get("/bugs/:bugId", Auth, projectsController.getBugDetail);

router.post("/", Auth, projectsController.createProject);
router.post("/AddUserToProject", Auth, projectsController.addUserToProject);
router.post(
  "/deleteUserToProject",
  Auth,
  projectsController.deleteUserToProject
);
router.post(
  "/addVersionToProject",
  Auth,
  projectsController.addVersionToProject
);
router.post("/togglePin/:projectId", Auth, projectsController.tooglePin);
router.post("/bugs/:bugId/update", Auth, projectsController.updateBugDetail);

export default router;
