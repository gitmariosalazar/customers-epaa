import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { environments } from "../../../../../settings/environments/environments";
import { CustomerController } from "../../controllers/customer.controller";
import { DatabaseServicePostgreSQL } from "../../../../../shared/connections/database/postgresql/postgresql.service";
import { CustomerService } from "../../../application/services/customer.service";
import { PostgresqlCustomerPersistence } from "../../repositories/postgresql/persistence/postgresql.customer.persistence";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: environments.CLIENTS_KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: environments.CLIENTS_KAFKA_CLIENT_ID,
            brokers: [environments.KAFKA_BROKER_URL],
          },
          consumer: {
            groupId: environments.CLIENTS_KAFKA_GROUP_ID,
            allowAutoTopicCreation: true,
          },
        }
      }
    ])
  ],
  controllers: [CustomerController],
  providers: [
    DatabaseServicePostgreSQL, CustomerService,
    {
      provide: 'CustomerRepository',
      useClass: PostgresqlCustomerPersistence
    }
  ],
  exports: []
})
export class PostgreSQLCustomerModule { }