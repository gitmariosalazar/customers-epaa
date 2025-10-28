import { Injectable } from "@nestjs/common";
import { InterfaceCustomerRepository } from "../../../../domain/contracts/customer.interface.repository";
import { DatabaseServicePostgreSQL } from "../../../../../../shared/connections/database/postgresql/postgresql.service";
import { CustomerResponse } from "../../../../domain/schemas/dto/response/customer.response";
import { CustomerModel } from "../../../../domain/schemas/models/customer.model";
import { CustomerSqlResponse } from "../../../interfaces/sql/customer.sql.response";
import { RpcException } from "@nestjs/microservices";
import { statusCode } from "../../../../../../settings/environments/status-code";
import { CustomerAdapter } from "../adapters/postgresql.customer.adapter";

@Injectable()
export class PostgresqlCustomerPersistence implements InterfaceCustomerRepository {
  constructor(
    private readonly postgreSqlService: DatabaseServicePostgreSQL
  ) { }

  async createCustomer(customer: CustomerModel): Promise<CustomerResponse> {
    return this.postgreSqlService.transaction(async (client) => {

      // 1. Insertar en Cliente
      const insertClienteQuery = `
      INSERT INTO Cliente (clienteId, tipoIdentificacionId, clienteIdValido)
      VALUES ($1, $2, $3)
      RETURNING clienteId;
    `;
      const clienteResult = await client.query(insertClienteQuery, [
        customer['customerId'],
        customer['identificationType'],
        'CED_VALID'
      ]);
      const clienteId = clienteResult.rows[0].clienteid;

      // 2. Insertar en Ciudadano
      const insertCiudadanoQuery = `
      INSERT INTO Ciudadano (
        ciudadanoId, nombres, apellidos, fechaNacimiento, fallecido,
        sexoId, estadoCivilId, profesionId, parroquiaId, direccion, paisOrigen
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING ciudadanoId;
    `;
      const ciudadanoResult = await client.query(insertCiudadanoQuery, [
        customer['customerId'],
        customer['firstName'],
        customer['lastName'],
        customer['dateOfBirth'],
        customer['deceased'] ?? false,
        customer['sexId'],
        customer['civilStatus'],
        customer['professionId'],
        customer['parishId'],
        customer['address'],
        customer['originCountry']
      ]);
      const ciudadanoId = ciudadanoResult.rows[0].ciudadanoid;

      // 3. Insertar en ClientePersonaNatural
      const insertClientePersonaNaturalQuery = `
      INSERT INTO ClientePersonaNatural (ciudadanoId, clienteId, direccionAcometida)
      VALUES ($1, $2, $3)
      RETURNING clientePersonaNaturalId;
    `;
      await client.query(insertClientePersonaNaturalQuery, [
        ciudadanoId,
        clienteId,
        customer['address']
      ]);

      // 4️⃣ Insertar Correos
      const insertCorreoQuery = `
      INSERT INTO Correo (email, clienteId)
      VALUES ($1, $2);
    `;
      for (const email of customer['emails']) {
        await client.query(insertCorreoQuery, [email, clienteId]);
      }

      // 5️⃣ Insertar Teléfonos
      const insertTelefonoQuery = `
      INSERT INTO Telefono (clienteId, numero, tipoTelefonoId, esValido)
      VALUES ($1, $2, $3, $4);
    `;
      for (const numero of customer['phoneNumbers']) {
        await client.query(insertTelefonoQuery, [clienteId, numero, 1, true]);
      }

      // ✅ Devolver respuesta estructurada
      const response: CustomerResponse = {
        customerId: customer['customerId'],
        firstName: customer['firstName'],
        lastName: customer['lastName'],
        emails: customer['emails'],
        phoneNumbers: customer['phoneNumbers'],
        dateOfBirth: customer['dateOfBirth'],
        sexId: customer['sexId'],
        civilStatus: customer['civilStatus'],
        address: customer['address'],
        professionId: customer['professionId'],
        originCountry: customer['originCountry'],
        identificationType: customer['identificationType'],
        parishId: customer['parishId'],
        deceased: customer['deceased']
      };

      return response;
    });
  }

  async updateCustomer(customerId: string, customer: CustomerModel): Promise<CustomerResponse> {
    try {
      return await this.postgreSqlService.transaction(async (client) => {
        // 1️⃣ Actualizar datos de Ciudadano
        const updateCiudadanoQuery = `
        UPDATE Ciudadano
        SET nombres = $1,
            apellidos = $2,
            fechaNacimiento = $3,
            fallecido = $4,
            sexoId = $5,
            estadoCivilId = $6,
            profesionId = $7,
            parroquiaId = $8,
            direccion = $9,
            paisOrigen = $10
        WHERE ciudadanoId = $11;
      `;
        await client.query(updateCiudadanoQuery, [
          customer['firstName'],
          customer['lastName'],
          customer['dateOfBirth'],
          customer['deceased'] ?? false,
          customer['sexId'],
          customer['civilStatus'],
          customer['professionId'],
          customer['parishId'],
          customer['address'],
          customer['originCountry'],
          customerId
        ]);

        // 2️⃣ Actualizar dirección de ClientePersonaNatural
        const updateClientePersonaNaturalQuery = `
        UPDATE ClientePersonaNatural
        SET direccionAcometida = $1
        WHERE ciudadanoId = $2;
      `;
        await client.query(updateClientePersonaNaturalQuery, [
          customer['address'],
          customerId
        ]);

        // 3️⃣ Actualizar correos
        // Simplificación: eliminar los existentes y reinsertar
        const deleteCorreosQuery = `DELETE FROM Correo WHERE clienteId = $1;`;
        await client.query(deleteCorreosQuery, [customerId]);

        const insertCorreoQuery = `
        INSERT INTO Correo (email, clienteId)
        VALUES ($1, $2);
      `;
        for (const email of customer['emails']) {
          await client.query(insertCorreoQuery, [email, customerId]);
        }

        // 4️⃣ Actualizar teléfonos
        // Simplificación: eliminar los existentes y reinsertar
        const deleteTelefonosQuery = `DELETE FROM Telefono WHERE clienteId = $1;`;
        await client.query(deleteTelefonosQuery, [customerId]);

        const insertTelefonoQuery = `
        INSERT INTO Telefono (clienteId, numero, tipoTelefonoId, esValido)
        VALUES ($1, $2, $3, $4);
      `;
        for (const numero of customer['phoneNumbers']) {
          await client.query(insertTelefonoQuery, [customerId, numero, 1, true]);
        }

        // 5️⃣ Construir respuesta final
        const updatedCustomer: CustomerResponse = {
          customerId: customer['customerId'],
          firstName: customer['firstName'],
          lastName: customer['lastName'],
          emails: customer['emails'],
          phoneNumbers: customer['phoneNumbers'],
          dateOfBirth: customer['dateOfBirth'],
          sexId: customer['sexId'],
          civilStatus: customer['civilStatus'],
          professionId: customer['professionId'],
          parishId: customer['parishId'],
          address: customer['address'],
          originCountry: customer['originCountry'],
          identificationType: customer['identificationType'],
          deceased: customer['deceased']
        };

        return updatedCustomer;
      });
    } catch (error) {
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<CustomerResponse | null> {
    try {
      const query = `
      SELECT c.clienteId AS "customerId",
             ci.nombres AS "firstName",
             ci.apellidos AS "lastName",
             ci.fechaNacimiento AS "dateOfBirth",
             ci.sexoId AS "sexId",
             ci.estadoCivilId AS "civilStatus",
             ci.direccion AS "address",
             ci.profesionId AS "professionId",
             ci.paisOrigen AS "originCountry",
             c.tipoIdentificacionId AS "identificationType",
             ci.parroquiaId AS "parishId",
             ci.fallecido AS "deceased",
             ARRAY(
               SELECT email FROM Correo WHERE clienteId = c.clienteId
             ) AS emails,
             ARRAY(
               SELECT numero FROM Telefono WHERE clienteId = c.clienteId
             ) AS "phoneNumbers"
      FROM Cliente c
      JOIN Ciudadano ci ON c.clienteId = ci.ciudadanoId
      WHERE c.clienteId = $1 LIMIT 10;
    `;
      const result = await this.postgreSqlService.query<CustomerSqlResponse>(query, [customerId]);

      if (result.length === 0) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: `Customer with ID ${customerId} not found`
        });
      }

      const customerSql = result[0];

      return CustomerAdapter.fromCustomerSQLResponseToCustomerResponse(customerSql);
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(limit: number, offset: number): Promise<CustomerResponse[]> {
    try {
      const query = `
      SELECT c.clienteId AS "customerId",
             ci.nombres AS "firstName",
             ci.apellidos AS "lastName",
             ci.fechaNacimiento AS "dateOfBirth",
             ci.sexoId AS "sexId",
             ci.estadoCivilId AS "civilStatus",
             ci.direccion AS "address",
             ci.profesionId AS "professionId",
             ci.paisOrigen AS "originCountry",
             c.tipoIdentificacionId AS "identificationType",
             ci.parroquiaId AS "parishId",
             ci.fallecido AS "deceased",
             ARRAY(
               SELECT email FROM Correo WHERE clienteId = c.clienteId
             ) AS emails,
             ARRAY(
               SELECT numero FROM Telefono WHERE clienteId = c.clienteId
             ) AS "phoneNumbers"
      FROM Cliente c
      JOIN Ciudadano ci ON c.clienteId = ci.ciudadanoId LIMIT $1 OFFSET $2;
    `;
      const result = await this.postgreSqlService.query<CustomerSqlResponse>(query, [limit, offset]);

      return result.map(CustomerAdapter.fromCustomerSQLResponseToCustomerResponse);
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const deleteQuery = `
      DELETE FROM Cliente
      WHERE clienteId = $1;
    `;
      const result = await this.postgreSqlService.query(deleteQuery, [customerId]);

      return result.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async verifyCustomerExists(customerId: string): Promise<boolean> {
    try {
      const query = `
      SELECT 1
      FROM Cliente
      WHERE clienteId = $1;
    `;
      const result = await this.postgreSqlService.query(query, [customerId]);

      return result.length > 0;
    } catch (error) {
      throw error;
    }
  }

}