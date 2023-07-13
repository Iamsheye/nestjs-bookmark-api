import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { EditUserDto } from "./dto/edit-user.dto";
import { UpdatePwdDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // async findAll() {
  //   const users = await this.prisma.users.findMany({
  //     orderBy: {
  //       id: "desc",
  //     },
  //     select: {
  //       id: true,
  //       createdAt: true,
  //       updatedAt: true,
  //       email: true,
  //       firstName: true,
  //       lastName: true,
  //       role: true,
  //       bookmarks: true,
  //     },
  //   });

  //   return users;
  // }

  // async findOne(id: number) {
  //   const user = await this.prisma.users.findUnique({
  //     where: {
  //       id: id,
  //     },
  //     select: {
  //       id: true,
  //       createdAt: true,
  //       updatedAt: true,
  //       email: true,
  //       firstName: true,
  //       lastName: true,
  //       role: true,
  //       bookmarks: true,
  //     },
  //   });

  //   if (!user) {
  //     throw new NotFoundException("User not found");
  //   }

  //   return user;
  // }

  async updateMe(id: number, updateUserDto: EditUserDto) {
    const newUser = await this.prisma.users.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
      },
    });

    delete newUser.hashedPassword;
    return newUser;
  }

  async updatePassword(id: number, updatePwdDto: UpdatePwdDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await argon.verify(
      user.hashedPassword,
      updatePwdDto.oldPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid old password");
    }

    const hashedPassword = await argon.hash(updatePwdDto.newPassword);

    const newUser = await this.prisma.users.update({
      where: {
        id,
      },
      data: {
        hashedPassword,
      },
    });

    delete newUser.hashedPassword;
    return newUser;
  }
}
