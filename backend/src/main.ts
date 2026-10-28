import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = app.get(ConfigService);
  const origenes = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origenes.length > 0 ? origenes : true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('WalkPets API')
    .setDescription(
      'API REST de WalkPets: paseadores de Cipolletti y Neuquén, reseñas y autenticación.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documento = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, documento);

  const puerto = config.get<number>('PORT') ?? 3000;
  await app.listen(puerto);

  console.log(`WalkPets API escuchando en http://localhost:${puerto}/api`);
  console.log(`Documentación Swagger en http://localhost:${puerto}/api/docs`);
}

void bootstrap();
