export interface CustomerSqlResponse {
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
}