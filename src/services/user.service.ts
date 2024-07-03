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

  // Assuming dataSource is an instance of DataSource and is already initialized
  // This instance should be accessible in the context of this function

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

  //   async findOrCreate(user: User) {
  //     let result = await this.findByPhoneNumber(user.phoneNumber);
  //     if (!result) {
  //       result = await user.save();
  //     }
  //     return result;
  //   }

  //   async findByPhoneNumber(phoneNumber: string) {
  //     const user = await User.findOne({ where: { phoneNumber } });
  //     return user;
  //   }

  //   async findAllFiltered(filter: FilteredUser) {
  //     let user: SelectQueryBuilder<User> | PaginationAwareObject = getRepository(
  //       User
  //     )
  //       .createQueryBuilder("user")
  //       .leftJoinAndSelect("user.role", "role");

  //     if (filter.ids && filter.ids.length) {
  //       user = user.andWhere("id IN :ids", { ids: filter.ids });
  //     }

  //     if (filter.name) {
  //       user = user.andWhere("name LIKE :name", { name: `%${filter.name}%` });
  //     }

  //     if (filter.phoneNumber) {
  //       user = user.andWhere("user.phoneNumber LIKE :number", {
  //         number: `%${filter.phoneNumber}%`,
  //       });
  //     }

  //     if (filter.role) {
  //       user = user.andWhere("role.name = :role", { role: filter.role });
  //     }

  //     user = await user.paginate();

  //     return user;
  //   }
}

export default new UserService();
