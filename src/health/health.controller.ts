import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('api')
export class HealthController {
    constructor(private prisma: DatabaseService) { }

    @Get("/health")
    async getHealth() {
        try {
            await this.prisma.$queryRawUnsafe("SELECT 1");
        } catch {
            throw new ServiceUnavailableException("Database unavailable");
        }

        return {
            status: "ok",
            timestamp: new Date().toISOString(),
        };
    }
}
