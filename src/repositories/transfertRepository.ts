import { dataSource } from "../utils/dataSource";
import { Transfer } from "../entities/Transfer/Transfer";

export const transferRepository = dataSource.getRepository(Transfer);
