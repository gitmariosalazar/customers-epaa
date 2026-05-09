export interface CustomerSqlResponse {
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
  deceased?: boolean | null | number;
}

export interface GeneralCustomerSqlResponse {
  customer_id: number;
  identification_type: string;
  customer_name: string;
  customers_emails: string[];
  customers_phones: string[];
  customer_address: string;
}
