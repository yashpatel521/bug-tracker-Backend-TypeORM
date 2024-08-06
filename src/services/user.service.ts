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
}

export default new UserService();
