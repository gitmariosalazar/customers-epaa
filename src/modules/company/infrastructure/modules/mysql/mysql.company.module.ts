import { Module } from '@nestjs/common';
import { CompanyController } from '../../controllers/company.controller';
import { CompanyService } from '../../../application/services/company.service';
import { KafkaServiceModule } from '../../../../../shared/kafka/kafka-service.module';
import { MySQLCompanyPersistence } from '../../repositories/mysql/persistence/mysql.company.persistence';

@Module({
  imports: [KafkaServiceModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    {
      provide: 'CompanyRepository',
      useClass: MySQLCompanyPersistence,
    },
  ],
  exports: [],
})
export class MySQLCompanyModule {}
