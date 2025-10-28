import { CustomerResponse } from "../schemas/dto/response/customer.response"
import { CustomerModel } from "../schemas/models/customer.model"

export interface InterfaceCustomerRepository {
  createCustomer(customer: CustomerModel): Promise<CustomerResponse>
  updateCustomer(customerId: string, customer: CustomerModel): Promise<CustomerResponse>
  getCustomerById(customerId: string): Promise<CustomerResponse | null>
  deleteCustomer(customerId: string): Promise<boolean>
  getAllCustomers(limit: number, offset: number): Promise<CustomerResponse[]>
  verifyCustomerExists(customerId: string): Promise<boolean>
}
