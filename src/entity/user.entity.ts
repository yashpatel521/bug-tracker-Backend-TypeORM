import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  BeforeInsert,
  AfterLoad,
} from "typeorm";
import { Role } from "./role.entity";
import * as bcrypt from "bcrypt";
import { userStatus } from "../utils/types";
import { SubRole } from "./subRole.entity";
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

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 12);
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
}
