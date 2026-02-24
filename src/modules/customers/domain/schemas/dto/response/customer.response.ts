export interface CustomerResponse {
  customerId: number;
  firstName: string;
  lastName: string;
  emails: string[];
  phoneNumbers: string[];
  dateOfBirth: Date;
  sexId: number;
  civilStatus: number;
  address: string;
  professionId: number;
  originCountry: string;
  identificationType: string;
  parishId: string;
  deceased?: boolean;
}

export interface GeneralCustomerResponse {
  customerId: number;
  identificationType: string;
  customerName: string;
  emails: string[];
  phoneNumbers: string[];
  customerAddress: string;
}
