import { Module } from '@nestjs/common';

import { DatasulService } from './datasul.service';

@Module({
  providers: [DatasulService],
  exports: [DatasulService],
})
export class DatasulModule {}
