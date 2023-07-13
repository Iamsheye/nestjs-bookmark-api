import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBookmarkDto, EditBookmarkDto } from "./dto";

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async findAll(id: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        description: true,
        url: true,
      },
      where: {
        userId: +id,
      },
    });
    return bookmarks;
  }

  async findOneBookmark(id: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: id,
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        description: true,
        url: true,
        user: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!bookmark) {
      throw new ForbiddenException(
        `Unable to access bookmark with id ${bookmarkId}`,
      );
    }

    return bookmark;
  }

  async createBookmark(id: number, createBookmarkDto: CreateBookmarkDto) {
    try {
      const bookmark = this.prisma.bookmark.create({
        data: {
          ...createBookmarkDto,
          user: {
            connect: {
              id,
            },
          },
        },
      });

      return bookmark;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new NotFoundException(`User with ${id} does not exist`);
        }
      }

      throw e;
    }
  }

  async updateBookmark(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException(
        `Unable to access bookmark with id ${bookmarkId}`,
      );
    }

    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });

    return updatedBookmark;
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException(
        `Unable to access bookmark with id ${bookmarkId}`,
      );
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
