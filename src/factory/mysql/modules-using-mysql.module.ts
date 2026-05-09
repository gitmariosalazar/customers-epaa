import { Module } from '@nestjs/common';
import { MySQLCustomerModule } from '../../modules/customers/infrastructure/modules/mysql/mysql.customer.module';
import { MySQLCompanyModule } from '../../modules/company/infrastructure/modules/mysql/mysql.company.module';
@Module({
  imports: [MySQLCustomerModule, MySQLCompanyModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppCustomersModulesUsingMySQL {}
