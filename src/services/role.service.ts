import { BadRequest } from "../Errors/errors";
import { Role } from "../entity/role.entity";

class RoleService {
  async create(role: Role) {
    const result = await Role.save(role);
    return result;
  }

  async getRoleByname(name: string) {
    const role = await Role.findOne({
      where: { name: name.toLocaleLowerCase() },
    });
    if (!role) throw new BadRequest("Role not found", 400);
    console.log(role);
    return role;
  }

  async getRoleById(roleId: number) {
    const role = await Role.findOne({
      where: { id: roleId },
    });
    if (!role) throw new BadRequest("Role not found", 400);
    console.log(role);
    return role;
  }

  async checkRoleExists(name: string) {
    const role = await Role.findOne({
      where: { name: name.toLocaleLowerCase() },
    });
    if (role) throw new BadRequest("Role already exists", 400);
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
}

export default new RoleService();
