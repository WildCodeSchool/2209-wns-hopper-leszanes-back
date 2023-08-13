import { Link } from "../entities/Link/Link";
import { dataSource } from "../utils/dataSource";

export const linkRepository = dataSource.getRepository(Link);
