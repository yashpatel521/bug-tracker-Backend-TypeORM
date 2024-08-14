import myDataSource from "../app-data-source";
import { DailyStats } from "../entity/dailyStats.entity";
import { PinnedProject } from "../entity/pinnedProject.entity";

class PinProjectService {
  async create(pinProject: PinnedProject) {
    const result = await PinnedProject.save(pinProject);
    return result;
  }

  async checkPinProjectExists(projectId: number, userId: number) {
    const existingPinProject = await PinnedProject.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
    });
    return existingPinProject;
  }

  async delete(id: number) {
    const result = await PinnedProject.delete(id);
    return result;
  }

  async getPinProjects(userId: number) {
    const pinnedProjectsRepository = myDataSource.getRepository(PinnedProject);

    const pinnedProjects = await pinnedProjectsRepository
      .createQueryBuilder("pinnedProject")
      .leftJoinAndSelect("pinnedProject.project", "project")
      .select([
        "pinnedProject.id",
        "project.id",
        "project.appId",
        "project.appIcon",
        "project.appUrl",
        "project.status",
        "project.title",
        "project.maxInstalls",
      ])
      .where("pinnedProject.userId = :userId", { userId })
      .getMany();

    return pinnedProjects;
  }
}

export default new PinProjectService();
