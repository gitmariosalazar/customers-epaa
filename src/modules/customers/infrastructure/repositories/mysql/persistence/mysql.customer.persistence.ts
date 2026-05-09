import { Injectable } from '@nestjs/common';
import { InterfaceCustomerRepository } from '../../../../domain/contracts/customer.interface.repository';
import {
  DatabaseAbstract,
  IDatabaseClient,
} from '../../../../../../shared/connections/database/abstract/abstract.database';
import {
  CustomerResponse,
  GeneralCustomerResponse,
} from '../../../../domain/schemas/dto/response/customer.response';
import { CustomerModel } from '../../../../domain/schemas/models/customer.model';
import {
  CustomerSqlResponse,
  GeneralCustomerSqlResponse,
} from '../../../interfaces/sql/customer.sql.response';
import { RpcException } from '@nestjs/microservices';
import { statusCode } from '../../../../../../settings/environments/status-code';
import { CustomerAdapter } from '../../../adapters/postgresql.customer.adapter';

@Injectable()
export class MySQLCustomerPersistence implements InterfaceCustomerRepository {
  constructor(private readonly databaseService: DatabaseAbstract) {}

  async createCustomer(customer: CustomerModel): Promise<CustomerResponse> {
    return this.databaseService.transaction(async (client: IDatabaseClient) => {
      // 1. Insertar en Cliente
      const insertClienteQuery = `
      INSERT INTO cliente (cliente_id, tipo_identificacion_id, cliente_id_valido)
      VALUES (?, ?, ?);
    `;
      await client.query(insertClienteQuery, [
        customer['customerId'],
        customer['identificationType'],
        'CED_VALID',
      ]);
      const clienteId = customer['customerId'];

      // 2. Insertar en Ciudadano
      const insertCiudadanoQuery = `
      INSERT INTO ciudadano (
        ciudadano_id, nombres, apellidos, fecha_nacimiento, fallecido,
        sexo_id, estado_civil_id, profesion_id, parroquia_id, direccion, pais_origen
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?);
    `;
      await client.query(insertCiudadanoQuery, [
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
        customer['originCountry'],
      ]);
      const ciudadanoId = customer['customerId'];

      // 3. Insertar en ClientePersonaNatural
      const insertClientePersonaNaturalQuery = `
      INSERT INTO cliente_persona_natural (ciudadano_id, cliente_id, direccion_acometida)
      VALUES (?, ?, ?);
    `;
      await client.query(insertClientePersonaNaturalQuery, [
        ciudadanoId,
        clienteId,
        customer['address'],
      ]);

      // 4️⃣ Insertar Correos
      const insertCorreoQuery = `
      INSERT INTO correo_electronico (email, cliente_id)
      VALUES (?, ?);
    `;
      for (const email of customer['emails']) {
        await client.query(insertCorreoQuery, [email, clienteId]);
      }

      // 5️⃣ Insertar Teléfonos
      const insertTelefonoQuery = `
      INSERT INTO telefono (cliente_id, numero, tipo_telefono_id, es_valido)
      VALUES (?, ?, ?, ?);
    `;
      for (const numero of customer['phoneNumbers']) {
        await client.query(insertTelefonoQuery, [clienteId, numero, 1, true]);
      }

      return {
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
        deceased: customer['deceased'],
      };
    });
  }

  async updateCustomer(
    customerId: string,
    customer: CustomerModel,
  ): Promise<CustomerResponse> {
    return await this.databaseService.transaction(
      async (client: IDatabaseClient) => {
        // 1️⃣ Actualizar datos de Ciudadano
        const updateCiudadanoQuery = `
      UPDATE ciudadano
      SET nombres = ?,
          apellidos = ?,
          fecha_nacimiento = ?,
          fallecido = ?,
          sexo_id = ?,
          estado_civil_id = ?,
          profesion_id = ?,
          parroquia_id = ?,
          direccion = ?,
          pais_origen = ?
      WHERE ciudadano_id = ?;
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
          customerId,
        ]);

        // 2️⃣ Actualizar dirección de ClientePersonaNatural
        const updateClientePersonaNaturalQuery = `
      UPDATE cliente_persona_natural
      SET direccion_acometida = ?
      WHERE ciudadano_id = ?;
    `;
        await client.query(updateClientePersonaNaturalQuery, [
          customer['address'],
          customerId,
        ]);

        // 3️⃣ Actualizar correos
        const deleteCorreosQuery = `DELETE FROM correo_electronico WHERE cliente_id = ?;`;
        await client.query(deleteCorreosQuery, [customerId]);

        const insertCorreoQuery = `
      INSERT INTO correo_electronico (email, cliente_id)
      VALUES (?, ?);
    `;
        for (const email of customer['emails']) {
          await client.query(insertCorreoQuery, [email, customerId]);
        }

        // 4️⃣ Actualizar teléfonos
        const deleteTelefonosQuery = `DELETE FROM telefono WHERE cliente_id = ?;`;
        await client.query(deleteTelefonosQuery, [customerId]);

        const insertTelefonoQuery = `
      INSERT INTO telefono (cliente_id, numero, tipo_telefono_id, es_valido)
      VALUES (?, ?, ?, ?);
    `;
        for (const numero of customer['phoneNumbers']) {
          await client.query(insertTelefonoQuery, [
            customerId,
            numero,
            1,
            true,
          ]);
        }

        return {
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
          deceased: customer['deceased'],
        };
      },
    );
  }

  async getCustomerById(customerId: string): Promise<CustomerResponse | null> {
    const query = `
      SELECT c.cliente_id AS "customerId",
             ci.nombres AS "firstName",
             ci.apellidos AS "lastName",
             ci.fecha_nacimiento AS "dateOfBirth",
             ci.sexo_id AS "sexId",
             ci.estado_civil_id AS "civilStatus",
             ci.direccion AS "address",
             ci.profesion_id AS "professionId",
             ci.pais_origen AS "originCountry",
             c.tipo_identificacion_id AS "identificationType",
             ci.parroquia_id AS "parishId",
             ci.fallecido AS "deceased",
             (SELECT JSON_ARRAYAGG(email) FROM correo_electronico WHERE cliente_id = c.cliente_id) AS emails,
             (SELECT JSON_ARRAYAGG(numero) FROM telefono WHERE cliente_id = c.cliente_id) AS "phoneNumbers"
      FROM cliente c
      JOIN ciudadano ci ON c.cliente_id = ci.ciudadano_id
      WHERE c.cliente_id = ? LIMIT 1;
    `;
    const result = await this.databaseService.query<CustomerSqlResponse>(
      query,
      [customerId],
    );

    if (result.length === 0) {
      throw new RpcException({
        statusCode: statusCode.NOT_FOUND,
        message: `Customer with ID ${customerId} not found`,
      });
    }

    return CustomerAdapter.fromCustomerSQLResponseToCustomerResponse(result[0]);
  }

  async getAllCustomers(
    limit: number,
    offset: number,
  ): Promise<CustomerResponse[]> {
    const query = `
      SELECT c.cliente_id AS "customerId",
             ci.nombres AS "firstName",
             ci.apellidos AS "lastName",
             ci.fecha_nacimiento AS "dateOfBirth",
             ci.sexo_id AS "sexId",
             ci.estado_civil_id AS "civilStatus",
             ci.direccion AS "address",
             ci.profesion_id AS "professionId",
             ci.pais_origen AS "originCountry",
             c.tipo_identificacion_id AS "identificationType",
             ci.parroquia_id AS "parishId",
             ci.fallecido AS "deceased",
             (SELECT JSON_ARRAYAGG(email) FROM correo_electronico WHERE cliente_id = c.cliente_id) AS emails,
             (SELECT JSON_ARRAYAGG(numero) FROM telefono WHERE cliente_id = c.cliente_id) AS "phoneNumbers"
      FROM cliente c
      JOIN ciudadano ci ON c.cliente_id = ci.ciudadano_id LIMIT ? OFFSET ?;
    `;
    const result = await this.databaseService.query<CustomerSqlResponse>(
      query,
      [Number(limit), Number(offset)],
    );
    return result.map(
      CustomerAdapter.fromCustomerSQLResponseToCustomerResponse,
    );
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    const deleteQuery = `DELETE FROM cliente WHERE cliente_id = ?;`;
    const result = await this.databaseService.execute(deleteQuery, [
      customerId,
    ]);
    return result.affectedRows > 0;
  }

  async verifyCustomerExists(customerId: string): Promise<boolean> {
    const query = `SELECT 1 FROM cliente WHERE cliente_id = ? LIMIT 1;`;
    const result = await this.databaseService.query(query, [customerId]);
    return result.length > 0;
  }

  async getGeneralCustomers(
    limit: number,
    offset: number,
  ): Promise<GeneralCustomerResponse[]> {
    const query = `
      SELECT
          c.cliente_id AS "customer_id",
          c.tipo_identificacion_id as "identification_type",
          COALESCE(CONCAT(ci.nombres, ' ', ci.apellidos), e.razon_social, e.nombre_comercial) AS "customer_name",
          COALESCE(cc.correos, JSON_ARRAY()) AS "customers_emails",
          COALESCE(cc.phones, JSON_ARRAY()) AS "customers_phones",
          COALESCE(ci.direccion, e.direccion) AS "customer_address"
      FROM cliente c
      LEFT JOIN ciudadano ci ON ci.ciudadano_id = c.cliente_id
      LEFT JOIN empresa e ON e.ruc = c.cliente_id
      LEFT JOIN cliente_contacto cc ON cc.cliente_id = c.cliente_id
      ORDER BY customer_name
      LIMIT ? OFFSET ?;
    `;
    const result = await this.databaseService.query<GeneralCustomerSqlResponse>(
      query,
      [Number(limit), Number(offset)],
    );
    return result.map(
      CustomerAdapter.fromCustomerSQLResponseToGeneralCustomerResponse,
    );
  }
}
