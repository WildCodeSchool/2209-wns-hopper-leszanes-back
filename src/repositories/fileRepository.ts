import { dataSource } from "../utils/dataSource";
import { File } from "../entities/File/File";

export const fileRepository = dataSource.getRepository(File);
