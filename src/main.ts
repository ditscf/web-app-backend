import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule, ObserveInstrument } from "./app.module";

async function bootstrap() {
  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  if (!frontendOrigin) {
    throw new Error("FRONTEND_ORIGIN is required.");
  }

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  if (process.env.TRUST_PROXY === "true") {
    app.getHttpAdapter().getInstance().set("trust proxy", 1);
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });
  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
