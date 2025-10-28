import { CustomerResponse } from './../../domain/schemas/dto/response/customer.response';
import { CreateCustomerRequest } from "../../domain/schemas/dto/request/create.customer.request"
import { UpdateCustomerRequest } from '../../domain/schemas/dto/request/update.customer.request';

export interface InterfaceCustomerUseCases {
  createCustomer(customer: CreateCustomerRequest): Promise<CustomerResponse>;
  updateCustomer(customerId: string, customer: UpdateCustomerRequest): Promise<CustomerResponse>;
  getCustomerById(customerId: string): Promise<CustomerResponse>;
  deleteCustomer(customerId: string): Promise<boolean>;
  getAllCustomers(limit: number, offset: number): Promise<CustomerResponse[]>;
  verifyCustomerExists(customerId: string): Promise<boolean>;
}