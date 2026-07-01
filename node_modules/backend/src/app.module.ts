import { Module } from '@nestjs/common';
import { AuthModule } from './core/auth/auth.module';
import { DocsafeModule } from './modules/docsafe/docsafe.module';

@Module({
  imports: [AuthModule, DocsafeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
