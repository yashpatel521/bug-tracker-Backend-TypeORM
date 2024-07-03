import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  BeforeInsert,
} from "typeorm";
import { Role } from "./role.entity";
import * as bcrypt from "bcrypt";
import { userStatus } from "src/types/types";
import { SubRole } from "./subRole.entity";

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
}
