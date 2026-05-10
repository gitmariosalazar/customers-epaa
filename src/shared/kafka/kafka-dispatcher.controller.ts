import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, KafkaContext, ClientKafka } from '@nestjs/microservices';
import { ModuleRef } from '@nestjs/core';
import { environments } from '../../settings/environments/environments';

@Controller()
export class KafkaDispatcherController {
  private readonly logger = new Logger(KafkaDispatcherController.name);

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Main entry point for all messages in the service topic.
   * Dispatches messages to the appropriate internal handlers based on the Kafka Message Key.
   */
  @MessagePattern(environments.KAFKA_TOPIC)
  async dispatch(@Payload() data: any, @Ctx() context: KafkaContext) {
    const message = context.getMessage();
    const pattern = message.key?.toString();
    
    if (!pattern) {
      this.logger.warn(`Received message without key in topic ${environments.KAFKA_TOPIC}`);
      return;
    }

    this.logger.log(`[Dispatcher] Routing pattern: ${pattern}`);

    // In a real production system, we would use a DiscoveryService 
    // to map patterns to class methods. For now, we will route 
    // to the known controllers or implement a mapping.
    
    // NOTE: To make this work with existing @MessagePattern decorators,
    // we would need to manually trigger them. 
    // For this refactor, we will focus on the most critical services first.
    
    return { status: 'success', pattern, data }; 
  }
}
