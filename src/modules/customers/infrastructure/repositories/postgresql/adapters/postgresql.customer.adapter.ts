import { CustomerResponse } from "../../../../domain/schemas/dto/response/customer.response";
import { CustomerSqlResponse } from "../../../interfaces/sql/customer.sql.response";

export class CustomerAdapter {
  static fromCustomerSQLResponseToCustomerResponse(customer: CustomerSqlResponse): CustomerResponse {
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
      deceased: customer.deceased
    }

  }
}