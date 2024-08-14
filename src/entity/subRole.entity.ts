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
import { Role } from "./role.entity";

@Entity()
export class SubRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Role, (role) => role.subRoles, {
    nullable: false,
    onDelete: "CASCADE",
  })
  role: Role;

  @OneToMany(() => User, (user) => user.subRole)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}
