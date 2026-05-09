import { Injectable } from '@nestjs/common';
import { InterfaceCompanyRepository } from '../../../../domain/contracts/company.interface.repository';
import { DatabaseAbstract, IDatabaseClient } from '../../../../../../shared/connections/database/abstract/abstract.database';
import { CompanyResponse } from '../../../../domain/schemas/dto/response/company.response';
import { CompanyModel } from '../../../../domain/schemas/model/company.model';
import { RpcException } from '@nestjs/microservices';
import { statusCode } from '../../../../../../settings/environments/status-code';
import { CompanySQLResponse } from '../../../interfaces/sql/company.sql.response';
import { CompanyAdapter } from '../../../adapters/company.adapter';

@Injectable()
export class PostgresqlCompanyPersistence implements InterfaceCompanyRepository {
  constructor(private readonly databaseService: DatabaseAbstract) {}

  async createCompany(company: CompanyModel): Promise<CompanyResponse | null> {
    return await this.databaseService.transaction(async (client: IDatabaseClient) => {
      // 1. Insertar en Cliente
      const insertClientQuery = `
        INSERT INTO cliente (cliente_id, tipo_identificacion_id, cliente_id_valido)
        VALUES ($1, $2, $3)
        RETURNING cliente_id;
      `;
      await client.query(insertClientQuery, [
        company['companyRuc'],
        company['identificationType'],
        'CED_VALID',
      ]);
      const clienteId = company['companyRuc'];

      // 2. Insertar en Empresa
      const insertCompanyQuery = `
        INSERT INTO empresa (
          nombre_comercial, razon_social, ruc, direccion, parroquia_id,
          cliente_id, pais
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING empresa_id;
      `;
      await client.query(insertCompanyQuery, [
        company['companyName'],
        company['socialReason'],
        company['companyRuc'],
        company['companyAddress'],
        company['companyParishId'],
        clienteId,
        company['companyCountry'],
      ]);

      // 4️⃣ Insertar Correos
      const insertCorreoQuery = `
        INSERT INTO correo_electronico (email, cliente_id)
        VALUES ($1, $2);
      `;
      for (const email of company['companyEmails']) {
        await client.query(insertCorreoQuery, [email, clienteId]);
      }

      // 5️⃣ Insertar Teléfonos
      const insertTelefonoQuery = `
        INSERT INTO telefono (cliente_id, numero, tipo_telefono_id, es_valido)
        VALUES ($1, $2, $3, $4);
      `;
      for (const numero of company['companyPhones']) {
        await client.query(insertTelefonoQuery, [clienteId, numero, 1, true]);
      }

      const selectQuery = `
        SELECT
            e.empresa_id AS "companyId",
            e.nombre_comercial AS "companyName",
            e.razon_social AS "socialReason",
            e.ruc AS "companyRuc",
            e.direccion AS "companyAddress",
            e.parroquia_id AS "companyParishId",
            e.pais AS "companyCountry",
            COALESCE(cc.correos, '{}') AS "companyEmails",
            COALESCE(cc.phones, '{}') AS "companyPhones",
            cl.tipo_identificacion_id AS "identificationType"
        FROM cliente cl
        INNER JOIN empresa e ON e.cliente_id = cl.cliente_id
        LEFT JOIN cliente_contacto cc ON cc.cliente_id = cl.cliente_id
        WHERE cl.cliente_id = $1;
      `;

      const selectRows = await client.query<CompanySQLResponse>(selectQuery, [company['companyRuc']]);
      return CompanyAdapter.fromCompanySqlResponseToCompanyResponse(selectRows[0]);
    });
  }

  async verifyCompanyExists(companyRuc: string): Promise<boolean> {
    const query = `SELECT 1 FROM empresa WHERE ruc = $1 LIMIT 1;`;
    const result = await this.databaseService.query(query, [companyRuc]);
    return result.length > 0;
  }

  async updateCompany(companyRuc: string, company: CompanyModel): Promise<CompanyResponse | null> {
    return await this.databaseService.transaction(async (client: IDatabaseClient) => {
      // Actualizar Empresa
      const updateCompanyQuery = `
        UPDATE empresa
        SET nombre_comercial = $1,
            razon_social = $2,
            direccion = $3,
            parroquia_id = $4,
            pais = $5
        WHERE ruc = $6;
      `;
      const { affectedRows } = await client.execute(updateCompanyQuery, [
        company['companyName'],
        company['socialReason'],
        company['companyAddress'],
        company['companyParishId'],
        company['companyCountry'],
        companyRuc,
      ]);

      // Actualizar Correos
      const deleteEmailsQuery = `DELETE FROM correo_electronico WHERE cliente_id = $1;`;
      await client.query(deleteEmailsQuery, [companyRuc]);

      const insertEmailQuery = `INSERT INTO correo_electronico (email, cliente_id) VALUES ($1, $2);`;
      for (const email of company['companyEmails']) {
        await client.query(insertEmailQuery, [email, companyRuc]);
      }

      // Actualizar Teléfonos
      const deletePhonesQuery = `DELETE FROM telefono WHERE cliente_id = $1;`;
      await client.query(deletePhonesQuery, [companyRuc]);

      const insertPhoneQuery = `INSERT INTO telefono (cliente_id, numero, tipo_telefono_id, es_valido) VALUES ($1, $2, $3, $4);`;
      for (const numero of company['companyPhones']) {
        await client.query(insertPhoneQuery, [companyRuc, numero, 1, true]);
      }

      if (affectedRows === 0) {
        throw new RpcException({
          statusCode: statusCode.NOT_FOUND,
          message: `Company with RUC ${companyRuc} not found.`,
        });
      }

      const selectQuery = `
        SELECT
            e.empresa_id AS "companyId",
            e.nombre_comercial AS "companyName",
            e.razon_social AS "socialReason",
            e.ruc AS "companyRuc",
            e.direccion AS "companyAddress",
            e.parroquia_id AS "companyParishId",
            e.pais AS "companyCountry",
            COALESCE(cc.correos, '{}') AS "companyEmails",
            COALESCE(cc.phones, '{}') AS "companyPhones",
            cl.tipo_identificacion_id AS "identificationType"
        FROM cliente cl
        INNER JOIN empresa e ON e.cliente_id = cl.cliente_id
        LEFT JOIN cliente_contacto cc ON cc.cliente_id = cl.cliente_id
        WHERE cl.cliente_id = $1;
      `;

      const selectRows = await client.query<CompanySQLResponse>(selectQuery, [companyRuc]);
      return CompanyAdapter.fromCompanySqlResponseToCompanyResponse(selectRows[0]);
    });
  }

  async getCompanyByRuc(companyRuc: string): Promise<CompanyResponse | null> {
    const query = `
      SELECT
          e.empresa_id AS "companyId",
          e.nombre_comercial AS "companyName",
          e.razon_social AS "socialReason",
          e.ruc AS "companyRuc",
          e.direccion AS "companyAddress",
          e.parroquia_id AS "companyParishId",
          e.pais AS "companyCountry",
          COALESCE(cc.correos, '{}') AS "companyEmails",
          COALESCE(cc.phones, '{}') AS "companyPhones",
          cl.tipo_identificacion_id AS "identificationType"
      FROM cliente cl
      INNER JOIN empresa e ON e.cliente_id = cl.cliente_id
      LEFT JOIN cliente_contacto cc ON cc.cliente_id = cl.cliente_id
      WHERE cl.cliente_id = $1;
    `;
    const result = await this.databaseService.query<CompanySQLResponse>(query, [companyRuc]);
    if (result.length === 0) {
      throw new RpcException({
        statusCode: statusCode.NOT_FOUND,
        message: `Company with RUC ${companyRuc} not found.`,
      });
    }

    return CompanyAdapter.fromCompanySqlResponseToCompanyResponse(result[0]);
  }

  async getAllCompanies(limit: number, offset: number): Promise<CompanyResponse[] | null> {
    const query = `
      SELECT
          e.empresa_id AS "companyId",
          e.nombre_comercial AS "companyName",
          e.razon_social AS "socialReason",
          e.ruc AS "companyRuc",
          e.direccion AS "companyAddress",
          e.parroquia_id AS "companyParishId",
          e.pais AS "companyCountry",
          COALESCE(cc.correos, '{}') AS "companyEmails",
          COALESCE(cc.phones, '{}') AS "companyPhones",
          cl.tipo_identificacion_id AS "identificationType"
      FROM cliente cl
      INNER JOIN empresa e ON e.cliente_id = cl.cliente_id
      LEFT JOIN cliente_contacto cc ON cc.cliente_id = cl.cliente_id
      LIMIT $1 OFFSET $2;
    `;
    const result = await this.databaseService.query<CompanySQLResponse>(query, [limit, offset]);
    const companies: CompanyResponse[] = result.map((companySqlResponse) =>
      CompanyAdapter.fromCompanySqlResponseToCompanyResponse(companySqlResponse),
    );
    return companies;
  }

  async deleteCompany(companyRuc: string): Promise<boolean> {
    const query = `DELETE FROM empresa WHERE ruc = $1;`;
    const result = await this.databaseService.execute(query, [companyRuc]);
    return result.affectedRows > 0;
  }
}
