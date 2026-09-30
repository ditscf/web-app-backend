import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

function Trim() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  );
}

export class RegisterApplicationDto {
  @Trim()
  @IsEmail({}, { message: "Enter a valid email address." })
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: "First name is required." })
  @MaxLength(80)
  firstName: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: "Last name is required." })
  @MaxLength(80)
  lastName: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: "Phone is required." })
  @MaxLength(32)
  phone: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: "Class is required." })
  @MaxLength(40)
  class: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: "Course is required." })
  @MaxLength(120)
  course: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: "Year of study is required." })
  @MaxLength(40)
  yearOfStudy: string;

  @Trim()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Enter a date of birth as YYYY-MM-DD.",
  })
  dateOfBirth: string;
}
