import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  ManyToOne,
} from "typeorm";
import { Role } from "./role.entity";
import { SubRole } from "./subRole.entity";
import { Project } from "./project.entity";
import { Version } from "./version.entity";
import { UserProject } from "./userProject.entity";
import { Bug } from "./bug.entity";
import { PinnedProject } from "./pinnedProject.entity";
import * as bcrypt from "bcrypt";
import { userStatus } from "../utils/types";
import { SERVER_URL } from "../utils/constant";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ default: "https://github.com/shadcn.png" })
  profile: string;

  @Column()
  password: string;

  @Column({ default: "active" })
  status: userStatus;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @ManyToOne(() => SubRole, (subRole) => subRole.users, { eager: true })
  subRole: SubRole;

  @OneToMany(() => Project, (project) => project.createdBy)
  projects: Project[];

  @OneToMany(() => Version, (version) => version.createdBy)
  versions: Version[];

  @OneToMany(() => UserProject, (userProject) => userProject.user)
  userProjects: UserProject[];

  @OneToMany(() => Bug, (bug) => bug.reportedBy)
  reportedBugs: Bug[];

  @OneToMany(() => Bug, (bug) => bug.assignedTo)
  assignedBugs: Bug[];

  @OneToMany(() => PinnedProject, (pinnedProject) => pinnedProject.user)
  pinnedProjects: PinnedProject[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  @AfterLoad()
  afterLoad() {
    if (this.profile) {
      if (!this.isValidHttpUrl(this.profile)) {
        this.profile = SERVER_URL + this.profile;
      }
    } else {
      this.profile = "https://github.com/shadcn.png";
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
  async updateTimestamp() {
    this.updatedAt = new Date();
  }
}
