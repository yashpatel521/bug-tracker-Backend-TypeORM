import { Request } from "express";
import { User } from "../entity/user.entity";

export type AuthRequest = Request & { user?: User };

export type RequestError = Error & {
  code: number;
};
export type dbType = "mysql" | "postgres";

export type userStatus = "active" | "inactive";
export type appType = "google" | "apple" | "web";

export type projectStatus = "complete" | "inprogress" | "onhold" | "inreview";

export type bugStatus =
  | "backlog"
  | "todo"
  | "inprogress"
  | "complete"
  | "closed"
  | "assigned"
  | "new";

export type bugPriority = "low" | "medium" | "high";

export type bugType = "bug" | "feature" | "enhancement";
// export type ID = number | string;
export type AppDetails = {
  title: string;
  description: string;
  descriptionHTML: string;
  summary: string;
  appId: string;
  url: string;
  icon: string;
  developer: string;
  developerId: string;
  developerEmail: string;
  privacyPolicy: string;
  score: number;
  scoreText: string;
  updated: number;
  reviews: number;
  ratings: number;
  maxInstalls: number;
};
