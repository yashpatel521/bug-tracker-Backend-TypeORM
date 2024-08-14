import { User } from "../entity/user.entity";
import myDataSource from "../app-data-source";
import userProjectService from "./userProject.service";

class UserService {
  async findById(id: number): Promise<User | null> {
    return await User.findOne({
      where: { id },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }
  async create(user: User) {
    const result = await User.save(user);
    return result;
  }

  async findByEmail(email: string) {
    const result = await User.findOne({
      where: { email },
    });
    return result;
  }

  async insertUserIfNotExist(user: User) {
    let existingUser = await this.findByEmail(user.email);
    if (!existingUser) {
      return await user.save();
    }
    return existingUser;
  }

  async updateUser(user: User) {
    const result = await this.create(user);
    return result;
  }

  async findAll(params: {
    query?: string;
    currentPage: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { query, currentPage, sortBy, sortOrder } = params;
    const pageSize = 5;
    const pageNumber = parseInt(currentPage, 10) || 1;

    let queryBuilder = myDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.subRole", "subRole");

    if (query) {
      queryBuilder = queryBuilder.where("LOWER(user.firstName) LIKE :query", {
        query: `%${query.toLowerCase()}%`,
      });
      queryBuilder = queryBuilder.orWhere("LOWER(user.lastName) LIKE :query", {
        query: `%${query.toLowerCase()}%`,
      });
    }

    if (sortBy && sortOrder) {
      queryBuilder = queryBuilder.orderBy(
        `user.${sortBy}`,
        sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"
      );
    }

    const [users, totalUsersCount] = await queryBuilder
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const usersWithProjectCount = await Promise.all(
      users.map(async (user) => {
        const projectAssigned =
          await userProjectService.getProjectCountByUserId(user.id);
        return { ...user, projectAssigned };
      })
    );

    return {
      users: usersWithProjectCount,
      total: totalUsersCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalUsersCount / pageSize),
    };
  }

  async getProfile(id: number) {
    let queryBuilder = myDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoin("user.projects", "project")
      .leftJoin("user.versions", "version")
      .leftJoin("user.pinnedProjects", "pinnedProject")
      .leftJoin("user.reportedBugs", "reportedBug")
      .addSelect("COUNT(DISTINCT project.id)", "projectCount")
      .addSelect("COUNT(DISTINCT version.id)", "versionCount")
      .addSelect("COUNT(DISTINCT pinnedProject.id)", "pinnedProjectCount")
      .addSelect("COUNT(DISTINCT reportedBug.id)", "reportedBugCount")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.subRole", "subRole")
      .where("user.id = :id", { id })
      .groupBy("user.id")
      .addGroupBy("role.id")
      .addGroupBy("subRole.id");

    const rawResult = await queryBuilder.getRawAndEntities();
    const user = rawResult.entities[0];
    const rawCounts = rawResult.raw[0];

    return {
      ...user,
      projectCount: parseInt(rawCounts.projectCount, 10),
      versionCount: parseInt(rawCounts.versionCount, 10),
      pinnedProjectCount: parseInt(rawCounts.pinnedProjectCount, 10),
      reportedBugCount: parseInt(rawCounts.reportedBugCount, 10),
    };
  }
  async updateProfile(user: User) {
    await User.save(user);
    return user;
  }
}

export default new UserService();
