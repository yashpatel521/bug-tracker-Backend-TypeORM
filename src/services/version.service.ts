import { Version } from "../entity/version.entity";
import { BadRequest } from "../Errors/errors";

class VesrionService {
  async create(version: Version) {
    const result = await Version.save(version);
    return result;
  }

  async getVersionByVersionNumber(versionNumber: string, projectId: number) {
    const result = await Version.findOne({
      where: { versionNumber, project: { id: projectId } },
    });
    return result;
  }

  async getLastVersionNumber(projectId: number) {
    const result = await Version.findOne({
      where: { project: { id: projectId } },
      order: { versionNumber: "DESC" },
    });
    return result;
  }
  async getVersionById(versionId: number) {
    const result = await Version.findOne({
      where: { id: versionId },
    });
    return result;
  }
  async delete(version: Version) {
    await Version.remove(version);
    return true;
  }
}

export default new VesrionService();
