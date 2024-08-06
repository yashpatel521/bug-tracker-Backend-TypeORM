import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Project } from "./project.entity";

@Entity()
@Unique(["project", "date"])
export class DailyStats extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint", default: 0 })
  installCount: number;

  @Column({ type: "bigint", default: 0 })
  maxInstallCount: number;

  @Column({ type: "bigint", default: 0 })
  ratingCount: number;

  @Column({ type: "bigint", default: 0 })
  maxRatingCount: number;

  @Column({ type: "bigint", default: 0 })
  reviewCount: number;

  @Column({ type: "bigint", default: 0 })
  maxReviewCount: number;

  @Column({ type: "date" })
  date: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.dailyStats)
  project: Project;
}
