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
}

export default new BugService();
