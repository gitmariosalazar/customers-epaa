import { Module } from "@nestjs/common";
import { PostgreSQLCustomerModule } from "../../modules/customers/infrastructure/modules/postgresql/postgresql.customer.module";
@Module({
  imports: [PostgreSQLCustomerModule],
  controllers: [],
  providers: [],
  exports: []
})
export class AppCustomersModulesUsingPostgreSQL { }