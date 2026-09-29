import { IsEmail, IsString, Matches } from "class-validator";

export class RequestLoginDto {
  @IsEmail({}, { message: "Enter a valid email address." })
  email: string;
}

export class VerifyLoginDto {
  @IsEmail({}, { message: "Enter a valid email address." })
  email: string;

  @IsString({ message: "Enter the 6-digit login code." })
  @Matches(/^\d{6}$/, { message: "Enter the 6-digit login code." })
  code: string;
}
