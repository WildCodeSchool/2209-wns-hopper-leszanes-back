import {
  Resolver,
  Query,
  Authorized,
  Arg,
  ID,
  Ctx,
  Mutation,
} from "type-graphql";
import { In } from "typeorm";
import { transferRepository } from "../repositories/transfertRepository";
import { Transfer } from "../entities/Transfer/Transfer";
import { AuthCheckerType } from "../auth";
import { TransferUpdateInput } from "../entities/Transfer/TransferUpdateInput";
import { TransferCurrentUserUpdateInput } from "../entities/Transfer/TransferCurrentUserUpdateInput";
import { TransferCreateInput } from "../entities/Transfer/TransferCreateInput";
import { User } from "../entities/User/User";
import { userRepository } from "../repositories/userRepository";
import { fileRepository } from "../repositories/fileRepository";
import { File } from "../entities/File/File";

@Resolver()
export class TransferResolver {
  // get all transfers
  @Authorized("admin")
  @Query(() => [Transfer])
  async getTransfers(): Promise<Transfer[]> {
    const transfers = await transferRepository.find({
      relations: ["createdBy"],
    });
    return transfers;
  }

  // get all transfers
  @Authorized()
  @Query(() => [Transfer], { nullable: true })
  async getCurrentUserTransfers(
    @Ctx() context: AuthCheckerType
  ): Promise<Transfer[] | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const transfers = await transferRepository.find({
      where: [
        {
          createdBy: {
            id: user.id,
          },
        },
        {
          users: {
            id: user.id,
          },
        },
      ],
      relations: ["createdBy"],
      order: {
        updatedAt: "DESC",
      },
    });
    return transfers;
  }

  // get by id
  @Authorized("admin")
  @Query(() => Transfer, { nullable: true })
  async getTransfer(@Arg("id", () => ID) id: number): Promise<Transfer | null> {
    const transfer = await transferRepository.findOne({
      where: { id },
      relations: ["createdBy"],
    });

    if (!transfer) {
      return null;
    }

    return transfer;
  }

  @Authorized()
  @Query(() => [User], { nullable: true })
  async getCurrentUserTransferUsers(
    @Arg("id", () => ID) id: number,
    @Ctx() context: AuthCheckerType
  ): Promise<User[] | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const transfer = await transferRepository.findOne({
      where: { id, createdBy: { id: user.id } },
      relations: ["createdBy"],
    });

    if (!transfer) {
      return null;
    }

    return transfer.loadRelation("users");
  }

  @Authorized()
  @Query(() => [File], { nullable: true })
  async getCurrentUserTransferFiles(
    @Arg("id", () => ID) id: number,
    @Ctx() context: AuthCheckerType
  ): Promise<File[] | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const transfer = await transferRepository.findOne({
      where: { id, createdBy: { id: user.id } },
      relations: ["createdBy"],
    });

    if (!transfer) {
      return null;
    }

    return transfer.loadRelation("files");
  }

  @Authorized("admin")
  @Query(() => [User], { nullable: true })
  async getTransferUsers(
    @Arg("id", () => ID) id: number
  ): Promise<User[] | null> {
    const transfer = await transferRepository.findOne({
      where: { id },
      relations: ["createdBy"],
    });

    if (!transfer) {
      return null;
    }

    return transfer.loadRelation("users");
  }

  // create
  @Authorized()
  @Mutation(() => Transfer, { nullable: true })
  async createTransfer(
    @Ctx() context: AuthCheckerType,
    @Arg("data") data: TransferCreateInput
  ): Promise<Transfer | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    try {
      const newTransfer = new Transfer();
      newTransfer.name = data.name;
      newTransfer.description = data.description;
      newTransfer.isPrivate = data.isPrivate;
      newTransfer.createdBy = user;
      newTransfer.createdAt = new Date();
      newTransfer.updatedAt = new Date();

      const transfer = await transferRepository.save(newTransfer);

      return transfer;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  // update
  @Authorized("admin")
  @Mutation(() => Transfer, { nullable: true })
  async updateTransfer(
    @Arg("data") data: TransferUpdateInput
  ): Promise<Transfer | null> {
    const transfer = await transferRepository.findOne({
      where: { id: data.id },
      relations: ["createdBy"],
    });

    if (!transfer) {
      return null;
    }

    const transferUpdated = {
      ...transfer,
      ...data,
      updatedAt: new Date(),
    };

    const result = await transferRepository.save(transferUpdated);
    return result;
  }

  // update current user transfer
  @Authorized()
  @Mutation(() => Transfer, { nullable: true })
  async updateCurrentUserTransfer(
    @Ctx() context: AuthCheckerType,
    @Arg("data") data: TransferCurrentUserUpdateInput
  ): Promise<Transfer | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const transfer = await transferRepository.findOne({
      where: {
        id: data.id,
        createdBy: {
          id: user.id,
        },
      },
      relations: ["createdBy", "users", "files"],
    });

    if (!transfer) {
      return null;
    }

    if (data.userIds) {
      if (data.userIds.length > 0) {
        const users = await userRepository.find({
          where: {
            id: In(data.userIds),
          },
        });
        transfer.users = users;
      } else {
        transfer.users = [];
      }
    }

    if (data.fileIds) {
      if (data.fileIds.length > 0) {
        const files = await fileRepository.find({
          where: {
            id: In(data.fileIds),
          },
        });
        transfer.files = files;
      } else {
        transfer.files = [];
      }
    }

    transfer.updatedAt = new Date();
    if (data.name) {
      transfer.name = data.name;
    }
    if (data.description) {
      transfer.description = data.description;
    }

    try {
      const result = await transferRepository.save(transfer, {
        reload: true,
      });
      return result;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  // delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async deleteTransfer(@Arg("id", () => ID) id: number): Promise<boolean> {
    const transfer = await transferRepository.findOne({
      where: { id },
    });

    if (transfer) {
      try {
        await transferRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }

  // Bulk delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async bulkDeleteTransfers(
    @Arg("ids", () => [ID]) ids: number[]
  ): Promise<boolean> {
    const transfers = await transferRepository.find({
      where: { id: In(ids) },
    });

    if (transfers.length === 0) {
      return false;
    }

    try {
      await transferRepository.delete(ids);
      return true;
    } catch (error) {
      return false;
    }
  }

  // delete current user
  @Authorized()
  @Mutation(() => Boolean)
  async deleteCurrentUserTransfer(
    @Ctx() context: AuthCheckerType,
    @Arg("id", () => ID) id: number
  ): Promise<boolean> {
    const { user } = context;
    if (!user) {
      return false;
    }
    const transfer = await transferRepository.findOne({
      where: {
        id,
        createdBy: {
          id: user.id,
        },
      },
    });

    if (!transfer) {
      return false;
    }

    try {
      await transferRepository.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Bulk delete current user transfers
  @Authorized()
  @Mutation(() => Boolean)
  async bulkDeleteCurrentUserTransfers(
    @Ctx() context: AuthCheckerType,
    @Arg("ids", () => [ID]) ids: number[]
  ): Promise<boolean> {
    const { user } = context;

    if (!user) {
      return false;
    }

    const transfers = await transferRepository.find({
      where: {
        id: In(ids),
        createdBy: {
          id: user.id,
        },
      },
    });

    if (transfers.length === 0) {
      return false;
    }

    try {
      await transferRepository.delete(ids);
      return true;
    } catch (error) {
      return false;
    }
  }
}
