import { Resolver, Query, Mutation, Arg, ID, Authorized } from "type-graphql";
import { File } from "../entities/File/File";
import { fileRepository } from "../repositories/fileRepository";
import { FileCreateInput } from "../entities/File/FileCreateInput";
import { FileUpdateInput } from "../entities/File/FileUpdateInput";

@Resolver()
export class FileResolver {
  // Get all files
  @Query(() => [File])
  async getFiles(): Promise<File[]> {
    const files = await fileRepository.find();
    return files;
  }

  // get by unique filename
  @Query(() => File, { nullable: true })
  async getFile(@Arg("filename") filename: string): Promise<File | null> {
    const file = await fileRepository.findOne({
      where: { filename },
    });
    if (!file) {
      return null;
    }

    return file;
  }

  // create
  @Authorized()
  @Mutation(() => File)
  async createFile(@Arg("data") data: FileCreateInput): Promise<File> {
    const newFile = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await fileRepository.save(newFile);
    return result;
  }

  // update
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
      updated_at: new Date(),
    };

    const result = await fileRepository.save(fileUpdated);
    return result;
  }

  // delete
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
