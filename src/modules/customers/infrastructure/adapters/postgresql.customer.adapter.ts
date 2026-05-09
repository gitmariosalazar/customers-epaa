import {
  CustomerResponse,
  GeneralCustomerResponse,
} from '../../domain/schemas/dto/response/customer.response';
import {
  CustomerSqlResponse,
  GeneralCustomerSqlResponse,
} from '../interfaces/sql/customer.sql.response';

export class CustomerAdapter {
  static fromCustomerSQLResponseToCustomerResponse(
    customer: CustomerSqlResponse,
  ): CustomerResponse {
    return {
      customerId: customer.customerId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      emails: customer.emails,
      phoneNumbers: customer.phoneNumbers,
      dateOfBirth: customer.dateOfBirth,
      sexId: customer.sexId,
      civilStatus: customer.civilStatus,
      address: customer.address,
      professionId: customer.professionId,
      originCountry: customer.originCountry,
      identificationType: customer.identificationType,
      parishId: customer.parishId,
      deceased: customer.deceased === true || customer.deceased === 1, // Convert to boolean if it's a number
    };
  }

  static fromCustomerSQLResponseToGeneralCustomerResponse(
    customer: GeneralCustomerSqlResponse,
  ): GeneralCustomerResponse {
    return {
      customerId: customer.customer_id,
      identificationType: customer.identification_type,
      customerName: customer.customer_name,
      emails: customer.customers_emails,
      phoneNumbers: customer.customers_phones,
      customerAddress: customer.customer_address,
    };
  }
}
