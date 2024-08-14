import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Project } from "./project.entity";

@Entity()
@Unique(["project", "user"])
export class PinnedProject extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.pinnedProjects)
  user: User;

  @ManyToOne(() => Project, (project) => project.pinnedProjects)
  project: Project;
}
