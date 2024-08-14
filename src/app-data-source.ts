import { DataSource } from "typeorm";
import { config } from "./utils/constant";

const myDataSource = new DataSource({
  ...config,
  entities: ["src/entity/*.ts"],
});

export default myDataSource;
