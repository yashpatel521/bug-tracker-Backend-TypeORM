import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  Unique,
  AfterLoad,
  OneToMany,
} from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";
import { SERVER_URL } from "../utils/constant";
import { Bug } from "./bug.entity";

@Entity()
@Unique(["versionNumber", "project"])
export class Version extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  versionNumber: string;

  @Column()
  liveUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, (project) => project.versions)
  project: Project;

  @OneToMany(() => Bug, (bug) => bug.version)
  bugs: Bug[];

  @ManyToOne(() => User, (user) => user.versions)
  createdBy: User;

  @AfterLoad()
  afterLoad() {
    if (this.liveUrl) {
      if (!this.isValidHttpUrl(this.liveUrl)) {
        this.liveUrl = SERVER_URL + this.liveUrl;
      }
    } else {
      this.liveUrl = "";
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
}
