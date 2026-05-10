import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { environments } from './settings/environments/environments';
import * as morgan from 'morgan';
import { DatabaseAbstract } from './shared/connections/database/abstract/abstract.database';

import { CustomServerKafka } from './shared/kafka/custom-server-kafka';

async function bootstrap() {
  const logger: Logger = new Logger('QRCodeMain');

  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'));
  await app.listen(environments.NODE_ENV === 'production' ? 3011 : 4011);

  const dbService = app.get(DatabaseAbstract);
  logger.log(await dbService.connect());

  logger.log(
    `🚀🎉 The Customers microservice is running on: http://localhost:${environments.NODE_ENV === 'production' ? 3011 : 4011}✅`,
  );

  const microservice = await NestFactory.createMicroservice(AppModule, {
    strategy: new CustomServerKafka(
      {
        client: {
          clientId: environments.CLIENTS_KAFKA_CLIENT_ID,
          brokers: [environments.KAFKA_BROKER_URL],
        },
        consumer: {
          groupId: environments.CLIENTS_KAFKA_GROUP_ID,
          allowAutoTopicCreation: true,
        },
      },
      environments.KAFKA_TOPIC, // clients_topic
    ),
  });

  await microservice.listen();
  logger.log(`Nest application successfully started`);
}
bootstrap();
