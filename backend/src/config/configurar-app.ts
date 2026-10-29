import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

// Configuración común de la app HTTP. La usan main.ts y las pruebas e2e para
// que ambos se comporten igual.
export function configurarApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  // Las fotos de perfil subidas viajan como data URI (hasta ~400 KB).
  app.useBodyParser('json', { limit: '1mb' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
}
