import { Controller, Get, Body, Patch, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { CurrentUser } from "src/types/user";
import { EditUserDto, UpdatePwdDto } from "./dto";

@UseGuards(AuthGuard("jwt"))
@Controller("user")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  findMe(@GetUser() user: CurrentUser) {
    return user;
  }

  @Patch("me")
  update(@GetUser("id") id: number, @Body() updateUserDto: EditUserDto) {
    return this.usersService.updateMe(id, updateUserDto);
  }

  @Patch("password")
  updatePassword(
    @GetUser("id") id: number,
    @Body() updatePwdDto: UpdatePwdDto,
  ) {
    return this.usersService.updatePassword(id, updatePwdDto);
  }

  // @Get()
  // findAllUsers() {
  //   return this.usersService.findAll();
  // }

  // @Get(":id")
  // findOneUser(@Param("id") id: string) {
  //   return this.usersService.findOne(+id);
  // }
}
