import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BeforeUpdate,
  OneToMany,
} from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";
import { Version } from "./version.entity";
import { bugPriority, bugStatus, bugType } from "../utils/types";
import { BugImage } from "./bugImage.entity";

@Entity()
export class Bug extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  @Column({ default: "new" })
  status: bugStatus;

  @Column({ default: "medium" })
  priority: bugPriority;

  @Column({ default: "bug" })
  type: bugType;

  @ManyToOne(() => Project, (project) => project.bugs)
  project: Project;

  @ManyToOne(() => User, (user) => user.reportedBugs)
  reportedBy: User;

  @ManyToMany(() => User, (user) => user.assignedBugs)
  @JoinTable()
  assignedTo: User[];

  @ManyToOne(() => Version, (version) => version.bugs)
  version: Version;

  @OneToMany(() => BugImage, (bugImage) => bugImage.bug)
  images: BugImage[]; // Add this relation

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
