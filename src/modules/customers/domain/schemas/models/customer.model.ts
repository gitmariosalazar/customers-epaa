export class CustomerModel {
  private customerId: number;
  private firstName: string;
  private lastName: string;
  private emails: string[];
  private phoneNumbers: string[];
  private dateOfBirth: Date;
  private sexId: number;
  private civilStatus: number;
  private address: string;
  private professionId: number;
  private originCountry: string;
  private identificationType: string;
  private parishId: string;
  private deceased?: boolean;

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

  getCustomerId(): number {
    return this.customerId;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getEmails(): string[] {
    return this.emails;
  }

  getPhoneNumbers(): string[] {
    return this.phoneNumbers;
  }

  getDateOfBirth(): Date {
    return this.dateOfBirth;
  }

  getSexId(): number {
    return this.sexId;
  }

  getCivilStatus(): number {
    return this.civilStatus;
  }

  getAddress(): string {
    return this.address;
  }

  getProfessionId(): number {
    return this.professionId;
  }

  getOriginCountry(): string {
    return this.originCountry;
  }

  getIdentificationType(): string {
    return this.identificationType;
  }

  getParishId(): string {
    return this.parishId;
  }

  isDeceased(): boolean | undefined {
    return this.deceased;
  }
  getDeceased(): boolean | undefined {
    return this.deceased;
  }

  setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  setLastName(lastName: string): void {
    this.lastName = lastName;
  }

  setEmails(emails: string[]): void {
    this.emails = emails;
  }

  setPhoneNumbers(phoneNumbers: string[]): void {
    this.phoneNumbers = phoneNumbers;
  }

  setDateOfBirth(dateOfBirth: Date): void {
    this.dateOfBirth = dateOfBirth;
  }

  setSexId(sexId: number): void {
    this.sexId = sexId;
  }

  setCivilStatus(civilStatus: number): void {
    this.civilStatus = civilStatus;
  }

  setAddress(address: string): void {
    this.address = address;
  }

  setProfessionId(professionId: number): void {
    this.professionId = professionId;
  }

  setOriginCountry(originCountry: string): void {
    this.originCountry = originCountry;
  }

  setIdentificationType(identificationType: string): void {
    this.identificationType = identificationType;
  }

  setParishId(parishId: string): void {
    this.parishId = parishId;
  }

  setDeceased(deceased: boolean): void {
    this.deceased = deceased;
  }

  setCustomerId(customerId: number): void {
    this.customerId = customerId;
  }

  toJSON(): object {
    return {
      customerId: this.customerId,
      firstName: this.firstName,
      lastName: this.lastName,
      emails: this.emails,
      phoneNumbers: this.phoneNumbers,
      dateOfBirth: this.dateOfBirth,
      sexId: this.sexId,
      civilStatus: this.civilStatus,
      address: this.address,
      professionId: this.professionId,
      originCountry: this.originCountry,
      identificationType: this.identificationType,
      parishId: this.parishId,
      deceased: this.deceased,
    };
  }

}