import { Module } from '@nestjs/common';
import { CustomerController } from '../../controllers/customer.controller';
import { CustomerService } from '../../../application/services/customer.service';
import { KafkaServiceModule } from '../../../../../shared/kafka/kafka-service.module';
import { MySQLCustomerPersistence } from '../../repositories/mysql/persistence/mysql.customer.persistence';

@Module({
  imports: [KafkaServiceModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: 'CustomerRepository',
      useClass: MySQLCustomerPersistence,
    },
  ],
  exports: [],
})
export class MySQLCustomerModule {}
