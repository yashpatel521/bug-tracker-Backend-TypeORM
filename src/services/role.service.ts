import { BadRequest } from "../Errors/errors";
import { Role } from "../entity/role.entity";

class RoleService {
  async create(role: Role) {
    const result = await Role.save(role);
    return result;
  }

  async getRoleByName(name: string) {
    const role = await Role.findOne({
      where: { name: name.toLocaleLowerCase() },
    });
    return role;
  }

  async getRoleById(roleId: number) {
    const role = await Role.findOne({
      where: { id: roleId },
    });
    return role;
  }

  async insertRoleIfNotExists(role: Role): Promise<Role> {
    const existingRole = await Role.findOne({
      where: { name: role.name.toLocaleLowerCase() },
    });
    if (!existingRole) {
      return await this.create(role);
    }
    return existingRole;
  }

  async getAllRoles() {
    const roles = await Role.find();
    return roles;
  }

  async delete(role: Role) {
    await Role.remove(role);
    return true;
  }
}

export default new RoleService();
