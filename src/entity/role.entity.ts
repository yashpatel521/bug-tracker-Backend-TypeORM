import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { User } from "./user.entity";
import { SubRole } from "./subRole.entity";

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => SubRole, (subRole) => subRole.role)
  subRoles: SubRole[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}
