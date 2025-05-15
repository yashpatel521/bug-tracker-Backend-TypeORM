import { Brackets } from "typeorm";
import myDataSource from "../app-data-source";
import { Bug } from "../entity/bug.entity";
import { BugImage } from "../entity/bugImage.entity";

class BugService {
  async getBugsByProjectAndVersionId(
    projectId: number,
    versionId: number,
    params: {
      query?: string;
      currentPage: string;
      sortBy?: string;
      sortOrder?: string;
    }
  ) {
    const { query, currentPage, sortBy, sortOrder } = params;
    const pageSize = 5;
    const pageNumber = parseInt(currentPage, 10) || 1;

    const bugRepository = myDataSource.getRepository(Bug);

    let queryBuilder = bugRepository
      .createQueryBuilder("bug")
      .leftJoinAndSelect("bug.reportedBy", "reportedBy")
      .leftJoinAndSelect("bug.assignedTo", "assignedTo")
      .where("bug.projectId = :projectId", { projectId })
      .andWhere("bug.versionId = :versionId", { versionId });

    // Apply search filter if provided
    if (query) {
      queryBuilder = queryBuilder.andWhere(
        "(LOWER(bug.title) LIKE :query OR LOWER(bug.description) LIKE :query)",
        { query: `%${query.toLowerCase()}%` }
      );
    }

    // Apply sorting if provided
    if (sortBy && sortOrder) {
      queryBuilder = queryBuilder.orderBy(
        `bug.${sortBy}`,
        sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC"
      );
    } else {
      // Default sorting by createdAt in descending order
      queryBuilder = queryBuilder.orderBy("bug.createdAt", "DESC");
    }

    // Apply pagination
    queryBuilder = queryBuilder
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize);

    const [bugs, totalBugsCount] = await queryBuilder.getManyAndCount();

    return {
      bugs,
      total: totalBugsCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBugsCount / pageSize),
    };
  }

  async getBugById(bugId: number) {
    const bugRepository = myDataSource.getRepository(Bug);
    const bug = await bugRepository.findOne({
      where: { id: bugId },
      relations: ["reportedBy", "assignedTo", "images", "project"],
    });
    return bug;
  }

  async updateBug(bug: Bug) {
    await Bug.save(bug);
    return true;
  }

  async getImageById(id: number) {
    const result = await BugImage.findOne({
      where: { id },
    });
    return result;
  }
  async deleteBugImage(bugImage: BugImage) {
    await BugImage.remove(bugImage);
    return true;
  }

  async createBugImage(bugImage: BugImage) {
    const result = await BugImage.save(bugImage);
    return result;
  }

  async createBug(bug: Bug) {
    const result = await Bug.save(bug);
    return result;
  }

  async getUserBugs(
    userId: number,
    params: {
      query?: string;
      currentPage: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }
  ) {
    const PAGE_SIZE = 10;
    const page = parseInt(params.currentPage || "1", 10);
    const offset = (page - 1) * PAGE_SIZE;

    const bugRepository = myDataSource.getRepository(Bug);
    const queryBuilder = bugRepository
      .createQueryBuilder("bug")
      .leftJoinAndSelect("bug.project", "project")
      .leftJoinAndSelect("bug.version", "version")
      .leftJoinAndSelect("bug.assignedTo", "assignedTo")
      .leftJoinAndSelect("bug.reportedBy", "reportedBy")
      .select([
        "bug",
        "version",
        "assignedTo",
        "reportedBy",
        "project.id",
        "project.title",
      ])
      .where(
        new Brackets((qb) => {
          qb.where("reportedBy.id = :userId", { userId }).orWhere(
            (subQb: any) => {
              const subQuery = subQb
                .subQuery()
                .select("bugSub.id")
                .from(Bug, "bugSub")
                .leftJoin("bugSub.assignedTo", "assignedUser")
                .where("assignedUser.id = :userId")
                .getQuery();
              return "bug.id IN " + subQuery;
            }
          );
        })
      )
      .take(PAGE_SIZE)
      .skip(offset)
      .setParameter("userId", userId);

    // Search filter
    if (params.query) {
      queryBuilder.andWhere(
        "bug.title ILIKE :query OR bug.description ILIKE :query OR project.title ILIKE :query",
        {
          query: `%${params.query}%`,
        }
      );
    }

    // Sorting
    if (params.sortBy && params.sortBy.toLocaleLowerCase() == "projecttitle") {
      queryBuilder.orderBy(
        `project.title`,
        params.sortOrder?.toLocaleUpperCase() === "ASC" ? "ASC" : "DESC"
      );
    } else if (params.sortBy) {
      queryBuilder.orderBy(
        `bug.${params.sortBy}`,
        params.sortOrder?.toLocaleUpperCase() === "ASC" ? "ASC" : "DESC"
      );
    } else {
      queryBuilder.orderBy("bug.createdAt", "DESC");
    }

    const [bugs, total] = await queryBuilder.getManyAndCount();

    return {
      bugs,
      totalPages: Math.ceil(total / PAGE_SIZE),
      currentPage: page,
    };
  }
}

export default new BugService();
