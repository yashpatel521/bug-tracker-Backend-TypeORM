import { SubRole } from "../entity/subRole.entity";

class SubRoleService {
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
}

export default new SubRoleService();
