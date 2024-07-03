// import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

// export class CreatePrice {
//   @IsNumber()
//   bayId: number;

//   @IsDateString()
//   startTime: Date;

//   @IsDateString()
//   endTime: Date;

//   @IsNumber()
//   priority: number;

//   @IsNumber()
//   amount: number;
// }

// export class CreatePriceFromGenericPrice {
//   @IsNumber()
//   genericPriceSheetId: number;

//   @IsDateString()
//   startTime: Date;

//   @IsDateString()
//   endTime: Date;

//   @IsArray()
//   weekday: number[];
// }

// export class CreateRecurringPrice {
//   @IsNumber()
//   bayId: number;

//   @IsNumber()
//   @Min(1)
//   @Max(7)
//   weekDay: 1 | 2 | 3 | 4 | 5 | 6 | 7;

//   @IsDateString()
//   startTime: Date;

//   @IsDateString()
//   endTime: Date;

//   @IsNumber()
//   priority: number;

//   @IsNumber()
//   amount: number;
// }

// export class CreateGenericPrice {
//   @IsNumber()
//   bayId: number;

//   @IsDateString()
//   startTime: string;

//   @IsDateString()
//   endTime: string;

//   @IsNumber()
//   amount: number;
// }

// export class CreateGenericPriceSheet {
//   @IsString()
//   name: string;

//   @IsString()
//   colour: string;

//   @IsNumber()
//   priority: number;

//   @IsArray()
//   @ValidateNested()
//   @Type(() => CreateGenericPrice)
//   genericPrices: CreateGenericPrice[];
// }
