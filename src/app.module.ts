import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlbumsModule } from './albums/albums.module';
import { json, urlencoded } from 'express';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { envConfig } from './config/env.config';
import { APP_GUARD } from '@nestjs/core';
import { UploadAccessGuard } from './common/guards/upload-access.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.register({
      secret: envConfig.jwt.secret,
      signOptions: { expiresIn: '24h' },
    }),
    AlbumsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(json({ limit: '50mb' }), urlencoded({ limit: '50mb', extended: true }))
      .forRoutes('*');
  }
}
