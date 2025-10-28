import { CreateCustomerRequest } from "../../domain/schemas/dto/request/create.customer.request";
import { UpdateCustomerRequest } from "../../domain/schemas/dto/request/update.customer.request";
import { CustomerResponse } from "../../domain/schemas/dto/response/customer.response";
import { CustomerModel } from "../../domain/schemas/models/customer.model";

export class CustomerMapper {
  static fromCreateCustomerRequestToCustomerModel(customer: CreateCustomerRequest): CustomerModel {
    return new CustomerModel(
      customer.customerId,
      customer.firstName,
      customer.lastName,
      customer.emails,
      customer.phoneNumbers,
      customer.dateOfBirth,
      customer.sexId,
      customer.civilStatus,
      customer.address,
      customer.professionId,
      customer.originCountry,
      customer.identificationType,
      customer.parishId,
      customer.deceased
    );
  }

  static fromCustomerModelToCustomerResponse(customer: CustomerModel): CustomerResponse {
    return {
      customerId: customer.getCustomerId(),
      firstName: customer.getFirstName(),
      lastName: customer.getLastName(),
      emails: customer.getEmails(),
      phoneNumbers: customer.getPhoneNumbers(),
      dateOfBirth: customer.getDateOfBirth(),
      sexId: customer.getSexId(),
      civilStatus: customer.getCivilStatus(),
      address: customer.getAddress(),
      professionId: customer.getProfessionId(),
      originCountry: customer.getOriginCountry(),
      identificationType: customer.getIdentificationType(),
      parishId: customer.getParishId(),
      deceased: customer.getDeceased()
    };
  }

  static fromUpdateCustomerRequestToCustomerModel(customer: UpdateCustomerRequest): CustomerModel {
    return new CustomerModel(
      customer.customerId,
      customer.firstName,
      customer.lastName,
      customer.emails,
      customer.phoneNumbers,
      customer.dateOfBirth,
      customer.sexId,
      customer.civilStatus,
      customer.address,
      customer.professionId,
      customer.originCountry,
      customer.identificationType,
      customer.parishId,
      customer.deceased
    );
  }
}