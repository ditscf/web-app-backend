import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { MinistryOption } from "./interfaces/interface";

@Injectable()
export class MinistryService {
  constructor(private readonly database: DatabaseService) {}

  async list(): Promise<{ ministries: MinistryOption[] }> {
    const ministries = await this.database.ministry.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return { ministries };
  }
}
