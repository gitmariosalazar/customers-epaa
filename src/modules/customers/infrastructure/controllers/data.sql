
CREATE TABLE TipoIdentificacion(
  tipoIdentificacionId VARCHAR(5),
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(150),
  CONSTRAINT pk_TipoIdentificacion PRIMARY KEY (tipoIdentificacionId)
);

-- Tabla de Cliente (Ok)
-- Ejemplo de INSERT: 
-- INSERT INTO Cliente (tipoIdentificacionId, fechaRegistro) VALUES ('CED', CURRENT_TIMESTAMP);

CREATE TABLE Cliente(
  clienteId VARCHAR(13) NOT NULL UNIQUE,
  tipoIdentificacionId VARCHAR(5) NOT NULL,
  clienteIdValido VARCHAR(15) NOT NULL,
  fechaRegistro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_Cliente PRIMARY KEY (clienteId),
  CONSTRAINT fk_Cliente_TipoIdentificacion FOREIGN KEY (tipoIdentificacionId) REFERENCES TipoIdentificacion(tipoIdentificacionId)
);

-- Tabla de Ciudadano (Ok)
-- Ejemplo de INSERT: 
-- INSERT INTO Ciudadano (ciudadanoId, nombres, apellidos, fechaNacimiento) VALUES ('1234567890', 'Juan', 'Pérez', '1990-01-01');

CREATE TABLE Ciudadano(
  ciudadanoId VARCHAR(10),
  nombres VARCHAR(100),
  apellidos VARCHAR(100),
  fechaNacimiento DATE,
  fallecido BOOLEAN,
  sexoId INTEGER NOT NULL,
  estadoCivilId INTEGER NOT NULL,
  profesionId INTEGER,
  parroquiaId VARCHAR(8),
  direccion VARCHAR(255),
  paisOrigen VARCHAR(100),
  CONSTRAINT pk_Ciudadano PRIMARY KEY (ciudadanoId),
  CONSTRAINT fk_Ciudadano_Sexo FOREIGN KEY (sexoId) REFERENCES Sexo(sexoId),
  CONSTRAINT fk_Ciudadano_EstadoCivil FOREIGN KEY (estadoCivilId) REFERENCES EstadoCivil(estadoCivilId),
  CONSTRAINT fk_Ciudadano_Profesion FOREIGN KEY (profesionId) REFERENCES Profesion(profesionId),
  CONSTRAINT fk_Ciudadano_Parroquia FOREIGN KEY (parroquiaId) REFERENCES Parroquia(parroquiaId)
);

-- Tabla de ClientePersonaNatural (Ok)
-- Ejemplo de INSERT: 
-- INSERT INTO ClientePersonaNatural (clienteId, ciudadanoId, direccionAcometida) VALUES (1, '1234567890', 'Av. Siempre Viva 742');
CREATE TABLE ClientePersonaNatural(
  clientePersonaNaturalId SERIAL,
  ciudadanoId VARCHAR(10) NOT NULL,
  clienteId VARCHAR(13) NOT NULL,
  direccionAcometida VARCHAR(255) NOT NULL,
  CONSTRAINT pk_ClientePersonaNatural PRIMARY KEY (clientePersonaNaturalId),
  CONSTRAINT fk_ClientePersonaNatural_Ciudadano FOREIGN KEY (ciudadanoId) REFERENCES Ciudadano(ciudadanoId),
  CONSTRAINT fk_ClientePersonaNatural_Cliente FOREIGN KEY (clienteId) REFERENCES Cliente(clienteId)
);


-- Tabla de Correo (Ok)
-- Ejemplo de INSERT: 
-- INSERT INTO Correo (email) VALUES ('correo@ejemplo.com');
CREATE TABLE Correo(
  correoId SERIAL,
  email VARCHAR(100) NOT NULL,
  clienteId VARCHAR(13),
  CONSTRAINT pk_Correo PRIMARY KEY (correoId)
);

-- Tabla de TipoTelefono (Ok)
-- Ejemplo de INSERT: 
-- INSERT INTO TipoTelefono (nombre, descripcion) VALUES ('Móvil', 'Teléfono móvil');
CREATE TABLE TipoTelefono(
  tipoTelefonoId SERIAL,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(150),
  CONSTRAINT pk_TipoTelefono PRIMARY KEY (tipoTelefonoId)
);

-- Tabla de Telefono (Ok)
-- Ejemplo de INSERT: 
-- INSERT INTO Telefono (numero, tipoTelefonoId) VALUES ('0987654321', 1);
CREATE TABLE Telefono(
  telefonoId SERIAL,
  clienteId VARCHAR(13) NOT NULL,
  numero VARCHAR(15) NOT NULL,
  tipoTelefonoId INTEGER NOT NULL,
  esValido BOOLEAN,
  CONSTRAINT pk_Telefono PRIMARY KEY (telefonoId),
  CONSTRAINT fk_Telefono_TipoTelefono FOREIGN KEY (tipoTelefonoId) REFERENCES TipoTelefono(tipoTelefonoId)
);
