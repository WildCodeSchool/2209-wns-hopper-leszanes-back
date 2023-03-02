import { dataSource } from "../utils/dataSource";

import { User } from "../entities/User/User";

export const userRepository = dataSource.getRepository(User);
