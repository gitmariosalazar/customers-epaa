import { Injectable } from '@nestjs/common';
import { InterfaceCustomerRepository } from '../../../../domain/contracts/customer.interface.repository';
import { DatabaseServicePostgreSQL } from '../../../../../../shared/connections/database/postgresql/postgresql.service';
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
import { CustomerAdapter } from '../adapters/postgresql.customer.adapter';

@Injectable()
export class PostgresqlCustomerPersistence
  implements InterfaceCustomerRepository
{
  constructor(private readonly postgreSqlService: DatabaseServicePostgreSQL) {}

  async createCustomer(customer: CustomerModel): Promise<CustomerResponse> {
    return this.postgreSqlService.transaction(async (client) => {
      // 1. Insertar en Cliente
      const insertClienteQuery = `
      INSERT INTO cliente (cliente_id, tipo_identificacion_id, cliente_id_valido)
      VALUES ($1, $2, $3)
      RETURNING cliente_id;
    `;
      const clienteResult = await client.query(insertClienteQuery, [
        customer['customerId'],
        customer['identificationType'],
        'CED_VALID',
      ]);
      const clienteId = clienteResult.rows[0].cliente_id;

      // 2. Insertar en Ciudadano
      const insertCiudadanoQuery = `
      INSERT INTO ciudadano (
        ciudadano_id, nombres, apellidos, fecha_nacimiento, fallecido,
        sexo_id, estado_civil_id, profesion_id, parroquia_id, direccion, pais_origen
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING ciudadano_id;
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
        customer['originCountry'],
      ]);
      const ciudadanoId = ciudadanoResult.rows[0].ciudadano_id;

      // 3. Insertar en ClientePersonaNatural
      const insertClientePersonaNaturalQuery = `
      INSERT INTO cliente_persona_natural (ciudadano_id, cliente_id, direccion_acometida)
      VALUES ($1, $2, $3)
      RETURNING cliente_persona_natural_id;
    `;
      await client.query(insertClientePersonaNaturalQuery, [
        ciudadanoId,
        clienteId,
        customer['address'],
      ]);

      // 4️⃣ Insertar Correos
      const insertCorreoQuery = `
      INSERT INTO correo_electronico (email, cliente_id)
      VALUES ($1, $2);
    `;
      for (const email of customer['emails']) {
        await client.query(insertCorreoQuery, [email, clienteId]);
      }

      // 5️⃣ Insertar Teléfonos
      const insertTelefonoQuery = `
      INSERT INTO telefono (cliente_id, numero, tipo_telefono_id, es_valido)
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
        deceased: customer['deceased'],
      };

      return response;
    });
  }

  async updateCustomer(
    customerId: string,
    customer: CustomerModel,
  ): Promise<CustomerResponse> {
    try {
      return await this.postgreSqlService.transaction(async (client) => {
        // 1️⃣ Actualizar datos de Ciudadano
        const updateCiudadanoQuery = `
        UPDATE ciudadano
        SET nombres = $1,
            apellidos = $2,
            fecha_nacimiento = $3,
            fallecido = $4,
            sexo_id = $5,
            estado_civil_id = $6,
            profesion_id = $7,
            parroquia_id = $8,
            direccion = $9,
            pais_origen = $10
        WHERE ciudadano_id = $11;
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
        SET direccion_acometida = $1
        WHERE ciudadano_id = $2;
      `;
        await client.query(updateClientePersonaNaturalQuery, [
          customer['address'],
          customerId,
        ]);

        // 3️⃣ Actualizar correos
        // Simplificación: eliminar los existentes y reinsertar
        const deleteCorreosQuery = `DELETE FROM correo_electronico WHERE cliente_id = $1;`;
        await client.query(deleteCorreosQuery, [customerId]);

        const insertCorreoQuery = `
        INSERT INTO correo_electronico (email, cliente_id)
        VALUES ($1, $2);
      `;
        for (const email of customer['emails']) {
          await client.query(insertCorreoQuery, [email, customerId]);
        }

        // 4️⃣ Actualizar teléfonos
        // Simplificación: eliminar los existentes y reinsertar
        const deleteTelefonosQuery = `DELETE FROM telefono WHERE cliente_id = $1;`;
        await client.query(deleteTelefonosQuery, [customerId]);

        const insertTelefonoQuery = `
        INSERT INTO telefono (cliente_id, numero, tipo_telefono_id, es_valido)
        VALUES ($1, $2, $3, $4);
      `;
        for (const numero of customer['phoneNumbers']) {
          await client.query(insertTelefonoQuery, [
            customerId,
            numero,
            1,
            true,
          ]);
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
          deceased: customer['deceased'],
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
             ARRAY(
               SELECT email FROM correo_electronico WHERE cliente_id = c.cliente_id
             ) AS emails,
             ARRAY(
               SELECT numero FROM telefono WHERE cliente_id = c.cliente_id
             ) AS "phoneNumbers"
      FROM cliente c
      JOIN ciudadano ci ON c.cliente_id = ci.ciudadano_id
      WHERE c.cliente_id = $1 LIMIT 10;
    `;
      const result = await this.postgreSqlService.query<CustomerSqlResponse>(
        query,
        [customerId],
      );

      if (result.length === 0) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: `Customer with ID ${customerId} not found`,
        });
      }

      const customerSql = result[0];

      return CustomerAdapter.fromCustomerSQLResponseToCustomerResponse(
        customerSql,
      );
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers(
    limit: number,
    offset: number,
  ): Promise<CustomerResponse[]> {
    try {
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
             ARRAY(
               SELECT email FROM correo_electronico WHERE cliente_id = c.cliente_id
             ) AS emails,
             ARRAY(
               SELECT numero FROM telefono WHERE cliente_id = c.cliente_id
             ) AS "phoneNumbers"
      FROM cliente c
      JOIN ciudadano ci ON c.cliente_id = ci.ciudadano_id LIMIT $1 OFFSET $2;
    `;
      const result = await this.postgreSqlService.query<CustomerSqlResponse>(
        query,
        [limit, offset],
      );

      return result.map(
        CustomerAdapter.fromCustomerSQLResponseToCustomerResponse,
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const deleteQuery = `
      DELETE FROM cliente
      WHERE cliente_id = $1;
    `;
      const result = await this.postgreSqlService.query(deleteQuery, [
        customerId,
      ]);

      return result.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async verifyCustomerExists(customerId: string): Promise<boolean> {
    try {
      const query = `
      SELECT 1
      FROM cliente
      WHERE cliente_id = $1;
    `;
      const result = await this.postgreSqlService.query(query, [customerId]);

      return result.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async getGeneralCustomers(
    limit: number,
    offset: number,
  ): Promise<GeneralCustomerResponse[]> {
    try {
      const query = `
        SELECT
            c.cliente_id AS "customer_id",
            c.tipo_identificacion_id as "identification_type",
            COALESCE(ci.nombres || ' ' || ci.apellidos, e.razon_social, e.nombre_comercial) AS "customer_name",
            COALESCE(cc.correos, '{}') AS "customers_emails",
            COALESCE(cc.phones, '{}') AS "customers_phones",
            COALESCE(ci.direccion, e.direccion) AS "customer_address"
        FROM cliente c
        LEFT JOIN ciudadano ci ON ci.ciudadano_id = c.cliente_id
        LEFT JOIN empresa e ON e.ruc = c.cliente_id
        LEFT JOIN cliente_contacto cc ON cc.cliente_id = c.cliente_id
        order by customer_name
        limit $1 offset $2;
    `;
      const result =
        await this.postgreSqlService.query<GeneralCustomerSqlResponse>(query, [
          limit,
          offset,
        ]);

      return result.map(
        CustomerAdapter.fromCustomerSQLResponseToGeneralCustomerResponse,
      );
    } catch (error) {
      throw error;
    }
  }
}
