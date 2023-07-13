import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePwdDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
