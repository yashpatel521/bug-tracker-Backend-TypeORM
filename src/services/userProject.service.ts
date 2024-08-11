import { UserProject } from "../entity/userProject.entity";
import { BadRequest } from "../Errors/errors";

class UserProjectService {
  async create(userProject: UserProject) {
    const result = await UserProject.save(userProject);
    return result;
  }

  async delete(projectId: number, userId: number) {
    const userProject = await UserProject.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });
    if (!userProject) {
      throw new BadRequest("User project not found");
    }
    await UserProject.delete(userProject.id);
    return "User project deleted successfully";
  }

  async getUsersInProject(projectId: number) {
    const userProjects = await UserProject.find({
      where: { project: { id: projectId } },
      relations: ["user"],
    });
    return userProjects;
  }

  async getProjectCountByUserId(userId: number) {
    const projectCount = await UserProject.count({
      where: { user: { id: userId } },
    });
    return projectCount;
  }
  async deleteProjectUser(projectId: number) {
    await UserProject.delete({ project: { id: projectId } });
  }
}

export default new UserProjectService();
