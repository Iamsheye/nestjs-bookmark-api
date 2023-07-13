import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class EditUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  @IsEnum(["USER", "ADMIN"])
  role?: "USER" | "ADMIN";
}
