import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class DatabaseService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        const connectionString = configService.getOrThrow<string>('DATABASE_URL');
        const adapter = new PrismaPg({ connectionString });
        super({ adapter });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }

    async clearDatabase(): Promise<void> {
        await this.$executeRawUnsafe(`
          DO $$ DECLARE
              r RECORD;
          BEGIN
              FOR r IN (
                  SELECT tablename FROM pg_tables
                  WHERE schemaname = 'public'
                    AND tablename <> '_prisma_migrations'
              )
              LOOP
                  EXECUTE 'TRUNCATE TABLE "public".' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
              END LOOP;
          END $$;
        `);
    }
}
