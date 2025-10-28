export class SexModel {
  private sexId: number;
  private name: string;
  private description?: string;

  constructor(sexId: number, name: string, description?: string) {
    this.sexId = sexId;
    this.name = name;
    this.description = description;
  }
  getSexId(): number {
    return this.sexId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setName(name: string): void {
    this.name = name;
  }

  setSexId(sexId: number): void {
    this.sexId = sexId;
  }

  toJSON(): object {
    return {
      sexId: this.sexId,
      name: this.name,
      description: this.description,
    };
  }

}