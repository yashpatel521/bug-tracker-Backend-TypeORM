import roleService from "../services/role.service";
import subRoleService from "../services/subRole.service";
import { Role } from "../entity/role.entity";
import { SubRole } from "../entity/subRole.entity";
import { User } from "../entity/user.entity";
import { userStatus } from "../utils/types";
import myDataSource from "../app-data-source";
import userService from "../services/user.service";
import users from "./user.json";

const roles = ["admin", "employee"];
const subRoles = ["Developer", "Designer", "Tester", "Manager", "Team Leader"];

// insert into database
export async function insertRolesAndSubRoles() {
  // Insert roles
  for (const roleName of roles) {
    let newRole = Role.create({
      name: roleName.toLowerCase(),
    });
    await roleService.insertRoleIfNotExists(newRole);
  }

  // insert admin sub roles
  const adminRole = await roleService.insertRoleIfNotExists(
    Role.create({ name: "admin" })
  );
  let newSubRole = SubRole.create({
    name: "admin",
    role: adminRole,
  });
  await subRoleService.insertSubRoleIfNotExists(newSubRole);

  // Insert subroles
  for (const subRoleName of subRoles) {
    const role = await roleService.insertRoleIfNotExists(
      Role.create({ name: "employee" })
    );
    let newSubRole = SubRole.create({
      name: subRoleName.toLowerCase(),
      role: role,
    });
    await subRoleService.insertSubRoleIfNotExists(newSubRole);
  }

  // Insert users
  for (const user of users) {
    const role = await roleService.insertRoleIfNotExists(
      Role.create({
        name: user.role.toLowerCase(),
      })
    );
    const subRole = await subRoleService.insertSubRoleIfNotExists(
      SubRole.create({
        name: user.subrole.toLowerCase(),
        role: role,
      })
    );
    let newUser = User.create({
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      password: user.password,
      status: user.status as userStatus,
      role,
      subRole,
    });
    await userService.create(newUser);
  }
}
myDataSource
  .initialize()
  .then(() => insertRolesAndSubRoles())
  .catch(console.error);
