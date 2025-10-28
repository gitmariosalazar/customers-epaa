interface IdentificationType {
  type: string;
  name: string;
  description?: string;
}

export type IdentificationTypeRecord = Record<string, IdentificationType>;

export const IDENTIFICATION_TYPES: IdentificationTypeRecord = {
  'CED': {
    type: 'CED',
    name: 'Cédula de Ciudadanía',
    description: 'Documento de identidad para ciudadanos colombianos.'
  },
  'CEX': {
    type: 'CEX',
    name: 'Cédula de Extranjería',
    description: 'Documento de identidad para extranjeros residentes en Colombia.'
  },
  'PAS': {
    type: 'PAS',
    name: 'Pasaporte',
    description: 'Documento de viaje internacional emitido por un país.'
  },
  'RUC': {
    type: 'RUC',
    name: 'Registro Único de Contribuyentes',
    description: 'Número de identificación tributaria para personas jurídicas en Colombia.'
  },
};