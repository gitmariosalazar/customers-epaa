export class UpdateCustomerRequest {
  customerId: number
  firstName: string
  lastName: string
  emails: string[]
  phoneNumbers: string[]
  dateOfBirth: Date
  sexId: number
  civilStatus: number
  address: string
  professionId: number
  originCountry: string
  identificationType: string
  parishId: string
  deceased?: boolean

  constructor(
    customerId: number,
    firstName: string,
    lastName: string,
    emails: string[],
    phoneNumbers: string[],
    dateOfBirth: Date,
    sexId: number,
    civilStatus: number,
    address: string,
    professionId: number,
    originCountry: string,
    identificationType: string,
    parishId: string,
    deceased?: boolean
  ) {
    this.customerId = customerId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.emails = emails;
    this.phoneNumbers = phoneNumbers;
    this.dateOfBirth = dateOfBirth;
    this.sexId = sexId;
    this.civilStatus = civilStatus;
    this.address = address;
    this.professionId = professionId;
    this.originCountry = originCountry;
    this.identificationType = identificationType;
    this.parishId = parishId;
    this.deceased = deceased;
  }
}