import { Module } from '@nestjs/common';
import { CompanyController } from '../../controllers/company.controller';
import { DatabaseServicePostgreSQL } from '../../../../../shared/connections/database/postgresql/postgresql.service';
import { CompanyService } from '../../../application/services/company.service';
import { PostgreSQLCompanyPersistence } from '../../repositories/postgresql/persistence/postgresql.company.persistence';
import { KafkaServiceModule } from '../../../../../shared/kafka/kafka-service.module';

@Module({
  imports: [KafkaServiceModule],
  controllers: [CompanyController],
  providers: [
    DatabaseServicePostgreSQL,
    CompanyService,
    {
      provide: 'CompanyRepository',
      useClass: PostgreSQLCompanyPersistence,
    },
  ],
  exports: [],
})
export class PostgreSQLCompanyModule {}
