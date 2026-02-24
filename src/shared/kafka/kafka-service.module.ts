// src/work-orders/shared/kafka/kafka-service.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environments } from '../../settings/environments/environments';

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
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaServiceModule {}
