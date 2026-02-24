import { Module } from '@nestjs/common';
import { PostgreSQLCustomerModule } from '../../modules/customers/infrastructure/modules/postgresql/postgresql.customer.module';
import { PostgreSQLCompanyModule } from '../../modules/company/infrastructure/modules/postgresql/postgresql.company.module';
@Module({
  imports: [PostgreSQLCustomerModule, PostgreSQLCompanyModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppCustomersModulesUsingPostgreSQL {}
