import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from "typeorm";
import { Bug } from "./bug.entity";
import { SERVER_URL } from "../utils/constant";

@Entity()
export class BugImage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @ManyToOne(() => Bug, (bug) => bug.images)
  bug: Bug;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @AfterLoad()
  afterLoad() {
    if (this.src) {
      if (!this.isValidHttpUrl(this.src)) {
        this.src = SERVER_URL + this.src;
      }
    } else {
      this.src = "https://github.com/shadcn.png";
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
