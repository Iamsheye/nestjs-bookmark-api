import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Patch,
  Delete,
} from "@nestjs/common";
import { BookmarksService } from "./bookmarks.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { CreateBookmarkDto, EditBookmarkDto } from "./dto";

@UseGuards(AuthGuard("jwt"))
@Controller("bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  findAllBookmarks(@GetUser("id") id: number) {
    return this.bookmarksService.findAll(id);
  }

  @Get(":id")
  findOneBookmark(
    @GetUser("id") id: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarksService.findOneBookmark(id, bookmarkId);
  }

  @Post()
  createBookmark(@GetUser("id") id: number, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.createBookmark(id, dto);
  }

  @Patch(":id")
  updateBookmark(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarksService.updateBookmark(userId, bookmarkId, dto);
  }

  @Delete(":id")
  deleteBookmark(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
  ) {
    this.bookmarksService.deleteBookmark(userId, bookmarkId);
  }
}
