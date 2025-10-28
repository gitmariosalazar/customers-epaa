import { Inject, Injectable } from "@nestjs/common";
import { InterfaceCustomerUseCases } from "../usecases/customer.use-cases.interface";
import { InterfaceCustomerRepository } from "../../domain/contracts/customer.interface.repository";
import { CustomerResponse } from "../../domain/schemas/dto/response/customer.response";
import { RpcException } from "@nestjs/microservices";
import { statusCode } from "../../../../settings/environments/status-code";
import { CreateCustomerRequest } from "../../domain/schemas/dto/request/create.customer.request";
import { validateFields } from "../../../../shared/validators/fields.validators";
import { CustomerModel } from "../../domain/schemas/models/customer.model";
import { CustomerMapper } from "../mappers/customer.mapper";
import { UpdateCustomerRequest } from "../../domain/schemas/dto/request/update.customer.request";

@Injectable()
export class CustomerService implements InterfaceCustomerUseCases {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: InterfaceCustomerRepository
  ) { }

  async verifyCustomerExists(customerId: string): Promise<boolean> {
    return this.customerRepository.verifyCustomerExists(customerId);
  }

  async getAllCustomers(limit: number, offset: number): Promise<CustomerResponse[]> {
    try {
      const customers = await this.customerRepository.getAllCustomers(limit, offset);

      if (!customers || customers.length === 0) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: 'No customers found'
        })
      }

      return customers;

    } catch (error) {
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<CustomerResponse> {
    try {
      const customer = await this.customerRepository.getCustomerById(customerId);

      if (!customer) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: `Customer with ID ${customerId} not found`
        });
      }

      return customer;

    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const deleted = await this.customerRepository.deleteCustomer(customerId);

      if (!deleted) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: `Customer with ID ${customerId} not found`
        });
      }

      return deleted;

    } catch (error) {
      throw error;
    }
  }

  async createCustomer(customer: CreateCustomerRequest): Promise<CustomerResponse> {
    try {
      const requiredFields: string[] = [
        'customerId',
        'firstName',
        'lastName',
        'emails',
        'phoneNumbers',
        'dateOfBirth',
        'sexId',
        'civilStatus',
        'address',
        'professionId',
        'originCountry',
        'identificationType',
        'parishId'
      ];

      const missingFieldsMessage: string[] = validateFields(customer, requiredFields);

      if (missingFieldsMessage.length > 0) {
        throw new RpcException({
          statusCode: statusCode.BAD_REQUEST,
          message: missingFieldsMessage
        });
      }

      const verifyCustomerExists = await this.customerRepository.verifyCustomerExists(customer.customerId.toString());

      if (verifyCustomerExists) {
        throw new RpcException({
          statusCode: statusCode.CONFLICT,
          message: `Customer with ID ${customer.customerId} already exists`
        });
      }

      const customerModel: CustomerModel = CustomerMapper.fromCreateCustomerRequestToCustomerModel(customer);

      const createdCustomer = await this.customerRepository.createCustomer(customerModel);

      if (!createdCustomer || !createdCustomer.customerId) {
        throw new RpcException({
          statusCode: statusCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to create customer'
        });
      }

      return createdCustomer;

    } catch (error) {
      throw error;
    }
  }

  async updateCustomer(customerId: string, customer: UpdateCustomerRequest): Promise<CustomerResponse> {
    try {

      if (!customerId || customerId.trim() === '') {
        throw new RpcException({
          statusCode: statusCode.BAD_REQUEST,
          message: 'customerId is required'
        });
      }

      const verifyCustomerExists = await this.customerRepository.verifyCustomerExists(customerId);

      if (!verifyCustomerExists) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: `Customer with ID ${customerId} not found`
        });
      }

      const requiredFields: string[] = [
        'firstName',
        'lastName',
        'emails',
        'phoneNumbers',
        'dateOfBirth',
        'sexId',
        'civilStatus',
        'address',
        'professionId',
        'originCountry',
        'identificationType',
        'parishId'
      ];

      const missingFieldsMessage: string[] = validateFields(customer, requiredFields);

      if (missingFieldsMessage.length > 0) {
        throw new RpcException({
          statusCode: statusCode.BAD_REQUEST,
          message: missingFieldsMessage
        });
      }

      const customerModel: CustomerModel = CustomerMapper.fromCreateCustomerRequestToCustomerModel(customer);

      const updatedCustomer = await this.customerRepository.updateCustomer(customerId, customerModel);

      if (!updatedCustomer || !updatedCustomer.customerId) {
        throw new RpcException({
          statusCode: statusCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to update customer'
        });
      }

      return updatedCustomer;

    } catch (error) {
      throw error;
    }
  }
}