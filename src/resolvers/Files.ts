import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ID,
  Authorized,
  Ctx,
} from "type-graphql";
import { File } from "../entities/File/File";
import { fileRepository } from "../repositories/fileRepository";
import { FileCreateInput } from "../entities/File/FileCreateInput";
import { FileUpdateInput } from "../entities/File/FileUpdateInput";
import { AuthCheckerType } from "../auth";

@Resolver()
export class FileResolver {
  @Authorized("admin")
  @Query(() => [File])
  async getFiles(): Promise<File[]> {
    const files = await fileRepository.find();
    return files;
  }

  @Authorized()
  @Query(() => [File])
  async getCurrentUserFiles(
    @Ctx() context: AuthCheckerType
  ): Promise<File[] | null> {
    // const user = context.user;

    // if (!user) {
    //   return null;
    // }

    const files = await fileRepository.find();
    return files;
  }

  // get by id
  @Authorized()
  @Query(() => File, { nullable: true })
  async getFile(@Arg("id", () => ID) id: number): Promise<File | null> {
    const file = await fileRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!file) {
      return null;
    }

    return file;
  }

  // create
  @Authorized()
  @Mutation(() => File)
  async createFile(
    @Ctx() context: AuthCheckerType,
    @Arg("data") data: FileCreateInput
  ): Promise<File | null> {
    const user = context.user;

    if (!user) {
      return null;
    }

    const newFile = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await fileRepository.save(newFile);
    return result;
  }

  // update
  @Authorized("admin")
  @Mutation(() => File, { nullable: true })
  async updateFile(@Arg("data") data: FileUpdateInput): Promise<File | null> {
    const file = await fileRepository.findOne({
      where: { id: data.id },
    });

    if (!file) {
      return null;
    }

    const fileUpdated = {
      ...file,
      ...data,
      updatedAt: new Date(),
    };

    const result = await fileRepository.save(fileUpdated);
    return result;
  }

  // update current user file
  @Authorized()
  @Mutation(() => File, { nullable: true })
  async currentUserUpdateFile(
    @Ctx("context") context: AuthCheckerType,
    @Arg("data") data: FileUpdateInput
  ): Promise<File | null> {
    // const user = context.user;

    // if (!user) {
    //   return null;
    // }

    const file = await fileRepository.findOne({
      where: { id: data.id },
    });

    if (!file) {
      return null;
    }

    const fileUpdated = {
      ...file,
      ...data,
      updatedAt: new Date(),
    };

    const result = await fileRepository.save(fileUpdated);
    return result;
  }

  // delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async deleteFile(@Arg("id", () => ID) id: number): Promise<boolean> {
    const file = await fileRepository.findOne({
      where: { id },
    });

    if (file) {
      try {
        await fileRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
