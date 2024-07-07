import { User } from "../entity/user.entity";
import myDataSource from "../app-data-source";

class UserService {
  async findById(id: number) {
    return await User.findOne({
      where: { id },
    });
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
    console.log(query, currentPage, sortBy, sortOrder);
    const pageSize = 5;
    const pageNumber = parseInt(currentPage, 10) || 1;

    let queryBuilder = myDataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.subRole", "subRole");

    if (query) {
      queryBuilder = queryBuilder.where("Lower(user.firstName) LIKE :query", {
        query: `%${query.toLocaleLowerCase()}%`,
      });
      queryBuilder = queryBuilder.orWhere("Lower(user.lastName) LIKE :query", {
        query: `%${query.toLocaleLowerCase()}%`,
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

    return {
      users,
      total: totalUsersCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalUsersCount / pageSize),
    };
  }
}

export default new UserService();
