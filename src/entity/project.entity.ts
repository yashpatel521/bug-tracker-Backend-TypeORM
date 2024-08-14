import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  AfterLoad,
  BeforeUpdate,
} from "typeorm";
import { User } from "./user.entity";
import { Version } from "./version.entity";
import { UserProject } from "./userProject.entity";
import { Bug } from "./bug.entity";
import { PinnedProject } from "./pinnedProject.entity";
import { DailyStats } from "./dailyStats.entity";
import { appType, projectStatus } from "../utils/types";
import { SERVER_URL } from "../utils/constant";

@Entity()
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ type: "double precision", default: 0 })
  score: number;

  @Column({ default: "0" })
  scoreText: string;

  @Column({ type: "bigint", default: 0 })
  reviews: number;

  @Column({ type: "bigint", default: 0 })
  ratings: number;

  @Column({ type: "bigint", default: 0 })
  maxInstalls: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  descriptionHTML: string;

  @Column({ unique: true })
  appId: string;

  @Column({ nullable: true })
  appUrl: string;

  @Column({ nullable: true })
  appIcon: string;

  @Column({ nullable: true })
  developer: string;

  @Column({ nullable: true })
  developerId: string;

  @Column({ nullable: true })
  developerEmail: string;

  @Column({ nullable: true })
  firebaseAccount: string;

  @Column({ nullable: true })
  privacyPolicyUrl: string;

  @Column({ nullable: true })
  repositoryUrl: string;

  @Column({ nullable: true, default: "inreview" })
  status: projectStatus;

  @Column({ nullable: false, default: "google" })
  appType: appType;

  @ManyToOne(() => User, (user) => user.projects)
  createdBy: User;

  @OneToMany(() => Version, (version) => version.project)
  versions: Version[];

  @OneToMany(() => UserProject, (userProject) => userProject.project)
  userProjects: UserProject[];

  @OneToMany(() => Bug, (bug) => bug.project)
  bugs: Bug[];

  @OneToMany(() => PinnedProject, (pinnedProject) => pinnedProject.project)
  pinnedProjects: PinnedProject[];

  @OneToMany(() => DailyStats, (dailyStats) => dailyStats.project)
  dailyStats: DailyStats[];

  @Column({ type: "timestamptz", default: new Date() })
  LiveUpdatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @AfterLoad()
  afterLoad() {
    if (this.appIcon) {
      if (!this.isValidHttpUrl(this.appIcon)) {
        this.appIcon = SERVER_URL + this.appIcon;
      }
    } else {
      this.appIcon = "https://github.com/shadcn.png";
    }
  }

  isValidHttpUrl(string: string) {
    let url: any;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
