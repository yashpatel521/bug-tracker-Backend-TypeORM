import { SubRole } from "../entity/subRole.entity";

class SubRoleService {
  async create(subRole: SubRole) {
    const result = await SubRole.save(subRole);
    return result;
  }

  async getSubRoleById(id: number) {
    const result = await SubRole.findOne({
      where: { id },
    });
    return result;
  }

  async insertSubRoleIfNotExists(subRole: SubRole): Promise<SubRole> {
    const existingSubRole = await SubRole.findOne({
      where: {
        name: subRole.name.toLocaleLowerCase(),
      },
    });
    if (!existingSubRole) {
      return await SubRole.save(subRole);
    }
    return existingSubRole;
  }

  async getSubRoleByName(name: string) {
    const subRole = await SubRole.findOne({
      where: {
        name: name.toLocaleLowerCase(),
      },
    });
    return subRole;
  }

  async getAllSubRoles() {
    const subRoles = await SubRole.find({
      relations: ["role"],
    });
    return subRoles;
  }

  async delete(subRole: SubRole) {
    await SubRole.remove(subRole);
    return true;
  }
}

export default new SubRoleService();
