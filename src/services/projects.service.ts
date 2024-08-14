import myDataSource from "../app-data-source";
import { DailyStats } from "../entity/dailyStats.entity";
import { Project } from "../entity/project.entity";
import { User } from "../entity/user.entity";
import { UserProject } from "../entity/userProject.entity";
import { checkRoleAccess } from "../utils/commonFunction";
import { getAppDetails } from "./googlePlay.service";

class ProjectService {
  async createOrUpdateProject(project: Project) {
    const result = await Project.save(project);
    return result;
  }

  async getAllProjects() {
    const result = await Project.find();
    return result;
  }

  async createDailyStats(dailyStats: DailyStats) {
    const result = await DailyStats.save(dailyStats);
    return result;
  }

  async getDailyStatsByProjectId(projectId: number) {
    const result = await DailyStats.find({
      where: { project: { id: projectId } },
      order: { date: "DESC" },
    });
    return result;
  }

  async getDailyStatsByDate(projectId: number, date: Date) {
    const result = await DailyStats.findOne({
      where: { project: { id: projectId }, date },
    });
    return result;
  }

  async getProjectById(projectId: number): Promise<Project | null> {
    const result = await Project.findOne({
      where: { id: projectId },
    });
    return result;
  }

  async getProjectByAppId(appId: string): Promise<Project | null> {
    const result = await Project.findOne({
      where: { appId },
    });
    return result;
  }

  async addDailyStatsAndUpdateProject(project: Project) {
    const appDetails: Project = await getAppDetails(project.appId);
    if (!appDetails) return;
    //check todays stats exist or not
    const checkTodayDailyStatsExists = await this.getDailyStatsByDate(
      project.id,
      new Date()
    );
    if (checkTodayDailyStatsExists) {
      // update project stats
      const getYestredayDailyStats = await this.getDailyStatsByDate(
        project.id,
        new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      );
      let todayStats = checkTodayDailyStatsExists;
      if (getYestredayDailyStats) {
        todayStats.installCount =
          appDetails.maxInstalls - getYestredayDailyStats.maxInstallCount;
        todayStats.maxInstallCount = appDetails.maxInstalls;
        todayStats.reviewCount =
          appDetails.reviews - getYestredayDailyStats.maxReviewCount;
        todayStats.maxReviewCount = appDetails.reviews;
        todayStats.ratingCount =
          appDetails.ratings - getYestredayDailyStats.maxRatingCount;
        todayStats.maxRatingCount = appDetails.ratings;
        todayStats.updatedAt = new Date();
      } else {
        todayStats.installCount = appDetails.maxInstalls;
        todayStats.maxInstallCount = appDetails.maxInstalls;
        todayStats.ratingCount = appDetails.ratings;
        todayStats.maxRatingCount = appDetails.ratings;
        todayStats.reviewCount = appDetails.reviews;
        todayStats.maxReviewCount = appDetails.reviews;
        todayStats.updatedAt = new Date();
      }
      await DailyStats.save(todayStats);
    } else {
      let installCount = appDetails.maxInstalls,
        ratingCount = appDetails.ratings,
        reviewCount = appDetails.reviews;
      const getYestredayDailyStats = await this.getDailyStatsByDate(
        project.id,
        new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      );
      if (getYestredayDailyStats) {
        installCount =
          appDetails.maxInstalls - getYestredayDailyStats.maxInstallCount;
        ratingCount =
          appDetails.ratings - getYestredayDailyStats.maxRatingCount;
        reviewCount =
          appDetails.reviews - getYestredayDailyStats.maxReviewCount;
      }

      const dailyStats = DailyStats.create({
        project,
        installCount,
        ratingCount,
        reviewCount,
        maxInstallCount: appDetails.maxInstalls,
        maxRatingCount: appDetails.ratings,
        maxReviewCount: appDetails.reviews,
        date: new Date(),
        updatedAt: new Date(),
      });
      await this.createDailyStats(dailyStats);
    }
    let updateProject: Project = project;
    updateProject.maxInstalls = appDetails.maxInstalls;
    updateProject.ratings = appDetails.ratings;
    updateProject.reviews = appDetails.reviews;
    updateProject.score = appDetails.score;
    updateProject.scoreText = appDetails.scoreText;
    updateProject.appIcon = appDetails.appIcon;
    updateProject.appUrl = appDetails.appUrl;
    updateProject.description = appDetails.description;
    updateProject.descriptionHTML = appDetails.descriptionHTML;
    // updateProject.LiveUpdatedAt = new Date(appDetails.updated);
    updateProject.developer = appDetails.developer;
    updateProject.developerId = appDetails.developerId;
    updateProject.developerEmail = appDetails.developerEmail;
    updateProject.privacyPolicyUrl = appDetails.privacyPolicyUrl;
    updateProject.updatedAt = new Date();
    await this.createOrUpdateProject(updateProject);

    return;
  }

  async getAllProjectByUser(
    user: User,
    params: {
      currentPage: string;
      query?: string;
    }
  ) {
    const { query, currentPage } = params;

    const pageSize = 8;
    const pageNumber = parseInt(currentPage, 10) || 1;

    // Initialize QueryBuilder for Project entity
    let queryBuilder = myDataSource
      .getRepository(Project)
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.userProjects", "userProject")
      .leftJoinAndSelect("userProject.user", "projectUser")
      .leftJoinAndSelect(
        "project.pinnedProjects",
        "pinnedProject",
        "pinnedProject.userId = :userId",
        { userId: user.id }
      );

    // Filter projects by user ID within the userProjects relation
    if (!checkRoleAccess(user, ["admin"])) {
      queryBuilder = queryBuilder.innerJoin(
        "project.userProjects",
        "userProjectFilter",
        "userProjectFilter.userId = :userId",
        { userId: user.id }
      );
    }

    // Apply search filters if query is provided
    if (query) {
      queryBuilder = queryBuilder.andWhere(
        "(LOWER(project.title) LIKE :query OR LOWER(project.appId) LIKE :query)",
        { query: `%${query.toLowerCase()}%` }
      );
    }

    // Execute the query and get results along with the count
    const [result, totalProjectCount] = await queryBuilder
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // Format the result to include users and pin status
    const formattedResult = result.map((project) => ({
      ...project,
      isPinned: project.pinnedProjects.length > 0,
    }));

    return {
      result: formattedResult,
      total: totalProjectCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProjectCount / pageSize),
    };
  }

  async getProjectByIdWithDetails(projectId: number, userId: number) {
    const projectRepository = myDataSource.getRepository(Project);

    // First, fetch the project with all relations except dailyStats
    const project = await projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.userProjects", "userProject")
      .leftJoinAndSelect("userProject.user", "user")
      .leftJoinAndSelect("project.versions", "version")
      .leftJoinAndSelect("version.createdBy", "createdBy")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.subRole", "subRole")
      .leftJoinAndSelect(
        "project.pinnedProjects",
        "pinnedProjects",
        "pinnedProjects.userId = :userId",
        { userId }
      )
      .where("project.id = :projectId", { projectId })
      .orderBy("version.versionNumber", "DESC")
      .addOrderBy("project.updatedAt", "DESC")
      .getOne();

    if (!project) {
      return null;
    }
    await this.addDailyStatsAndUpdateProject(project);

    // Fetch the latest 10 dailyStats separately
    const dailyStatsRepository = myDataSource.getRepository(DailyStats);
    const dailyStats = await dailyStatsRepository
      .createQueryBuilder("dailyStats")
      .where("dailyStats.projectId = :projectId", { projectId })
      .orderBy("dailyStats.date", "DESC")
      .take(5)
      .getMany();

    // Combine project details with totals
    return {
      ...project,
      dailyStats,
      isPinned: project.pinnedProjects?.length > 0 || false,
    };
  }

  async checkAccessToProjectByUser(projectId: number, userId: number) {
    const userProject = await UserProject.findOne({
      where: {
        user: {
          id: userId,
        },
        project: {
          id: projectId,
        },
      },
    });
    return userProject ? true : false;
  }

  async getProjectReports(user: User) {
    const projectRepository = myDataSource.getRepository(Project);

    // Using QueryBuilder to get project counts grouped by status for a specific user
    let queryBuilder = projectRepository
      .createQueryBuilder("project")
      .select("project.status", "status")
      .addSelect("COUNT(project.id)", "count");

    if (!checkRoleAccess(user, ["admin"])) {
      queryBuilder = queryBuilder
        .leftJoin("project.userProjects", "userProject")
        .where("userProject.userId = :userId", {
          userId: user.id,
        });
    }

    const projectStatusCounts = await queryBuilder
      .groupBy("project.status")
      .getRawMany();

    const formattedResult: { [key: string]: number } = {
      complete: 0,
      inprogress: 0,
      onhold: 0,
      inreview: 0,
    };
    projectStatusCounts.forEach((curr) => {
      formattedResult[curr.status] = parseInt(curr.count, 10);
    });

    return formattedResult;
  }
}

export default new ProjectService();
