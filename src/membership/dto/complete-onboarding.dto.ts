import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from "class-validator";

export class CompleteOnboardingDto {
  @IsArray({ message: "Choose at least one ministry." })
  @ArrayMinSize(1, { message: "Choose at least one ministry." })
  @ArrayMaxSize(50)
  @ArrayUnique({ message: "Choose each ministry only once." })
  @IsUUID("all", { each: true, message: "Choose ministries from the list." })
  ministryIds: string[];
}
