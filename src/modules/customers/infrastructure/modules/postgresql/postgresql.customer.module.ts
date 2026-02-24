import { Module } from '@nestjs/common';
import { CustomerController } from '../../controllers/customer.controller';
import { DatabaseServicePostgreSQL } from '../../../../../shared/connections/database/postgresql/postgresql.service';
import { CustomerService } from '../../../application/services/customer.service';
import { PostgresqlCustomerPersistence } from '../../repositories/postgresql/persistence/postgresql.customer.persistence';
import { KafkaServiceModule } from '../../../../../shared/kafka/kafka-service.module';

@Module({
  imports: [KafkaServiceModule],
  controllers: [CustomerController],
  providers: [
    DatabaseServicePostgreSQL,
    CustomerService,
    {
      provide: 'CustomerRepository',
      useClass: PostgresqlCustomerPersistence,
    },
  ],
  exports: [],
})
export class PostgreSQLCustomerModule {}
