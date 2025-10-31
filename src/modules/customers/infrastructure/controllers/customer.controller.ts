import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { CustomerService } from '../../application/services/customer.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCustomerRequest } from '../../domain/schemas/dto/request/create.customer.request';
import { UpdateCustomerRequest } from '../../domain/schemas/dto/request/update.customer.request';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post('create-customer')
  @MessagePattern('customers.create-customer')
  async createCustomer(@Payload() customer: CreateCustomerRequest) {
    return this.customerService.createCustomer(customer);
  }

  @Put('update-customer/:customerId')
  @MessagePattern('customers.update-customer')
  async updateCustomer(@Payload() data: { customerId: string; customer: UpdateCustomerRequest }) {
    return this.customerService.updateCustomer(data.customerId, data.customer);
  }

  @Get('get-customer/:customerId')
  @MessagePattern('customers.get-customer-by-id')
  async getCustomerById(@Payload() customerId: string) {
    return this.customerService.getCustomerById(customerId);
  }

  @Get('get-all-customers')
  @MessagePattern('customers.get-all-customers')
  async getAllCustomers(@Payload() data: { limit?: number; offset?: number }) {
    const limit = data?.limit ?? 100;
    const offset = data?.offset ?? 0;

    return await this.customerService.getAllCustomers(limit, offset);
  }

  @Delete('delete-customer/:customerId')
  @MessagePattern('customers.delete-customer')
  async deleteCustomer(@Payload() customerId: string) {
    return this.customerService.deleteCustomer(customerId);
  }

  @Get('verify-customer-exists/:customerId')
  @MessagePattern('customers.verify-customer-exists')
  async verifyCustomerExists(@Payload() customerId: string) {
    return this.customerService.verifyCustomerExists(customerId);
  }
}
