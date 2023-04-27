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
import { transferRepository } from "../repositories/transfertRepository";
import { FileCurrentUserUpdateInput } from "../entities/File/FileCurrentUserUpdateInput";

@Resolver()
export class FileResolver {
  @Authorized("admin")
  @Query(() => [File])
  async getFiles(): Promise<File[]> {
    const files = await fileRepository.find();
    return files;
  }

  // get by id
  @Authorized("admin")
  @Query(() => File, { nullable: true })
  async getFile(@Arg("name") name: string): Promise<File | null> {
    const file = await fileRepository.findOne({
      where: { name },
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
    const { user } = context;

    if (!user) {
      return null;
    }

    const transfer = await transferRepository.findOne({
      where: { id: data.transferId },
    });

    if (!transfer) {
      return null;
    }

    const newFile = {
      ...data,
      transfer,
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
    @Arg("data") data: FileCurrentUserUpdateInput
  ): Promise<File | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const file = await fileRepository.findOne({
      where: { id: data.id },
    });

    if (!file || file.transfer.createdBy !== user) {
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

  // delete current user file
  @Authorized()
  @Mutation(() => Boolean)
  async deleteCurrentUserFile(
    @Ctx("context") context: AuthCheckerType,
    @Arg("id", () => ID) id: number
  ): Promise<boolean> {
    const { user } = context;

    if (!user) {
      return false;
    }

    const file = await fileRepository.findOne({
      where: { id },
    });

    if (!file || file.transfer.createdBy !== user) {
      return false;
    }

    try {
      await fileRepository.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
