/*
  Script de creación de base de datos para ProdePad
  Compatible con SQL Server 2017+
*/

IF DB_ID('ProdePad') IS NULL
BEGIN
  PRINT 'Creando base de datos ProdePad';
  CREATE DATABASE ProdePad;
END
GO

USE ProdePad;
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
  PRINT 'Creando tabla dbo.Roles';
  CREATE TABLE dbo.Roles (
    RoleId       INT IDENTITY(1, 1) PRIMARY KEY,
    Name         NVARCHAR(50) NOT NULL,
    Description  NVARCHAR(255) NULL,
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Roles_Name UNIQUE (Name)
  );
END
GO

IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
  PRINT 'Creando tabla dbo.Usuarios';
  CREATE TABLE dbo.Usuarios (
    UsuarioId    INT IDENTITY(1, 1) PRIMARY KEY,
    Username     NVARCHAR(100) NOT NULL,
    PasswordHash VARBINARY(32) NOT NULL,
    RoleId       INT NOT NULL,
    IsActive     BIT NOT NULL CONSTRAINT DF_Usuarios_IsActive DEFAULT (0),
    CanBet       BIT NOT NULL CONSTRAINT DF_Usuarios_CanBet DEFAULT (0),
    LastLoginAt  DATETIME2(0) NULL,
    CreatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Usuarios_Username UNIQUE (Username),
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles (RoleId)
  );
END
GO

IF OBJECT_ID('dbo.trg_Usuarios_UpdateTimestamp', 'TR') IS NOT NULL
BEGIN
  DROP TRIGGER dbo.trg_Usuarios_UpdateTimestamp;
END
GO

CREATE TRIGGER dbo.trg_Usuarios_UpdateTimestamp
ON dbo.Usuarios
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE u
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Usuarios u
  INNER JOIN inserted i ON u.UsuarioId = i.UsuarioId;
END
GO

CREATE OR ALTER PROCEDURE dbo.AuthenticateUsuario
  @Username NVARCHAR(100)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP 1
    u.UsuarioId,
    u.Username,
    u.PasswordHash,
    u.IsActive,
    u.CanBet,
    u.RoleId,
    r.Name       AS RoleName
  FROM dbo.Usuarios u
  INNER JOIN dbo.Roles r ON r.RoleId = u.RoleId
  WHERE u.Username = @Username;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = 'admin')
BEGIN
  INSERT INTO dbo.Roles (Name, Description)
  VALUES
    ('admin', 'Administrador del sistema con acceso completo');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = 'player')
BEGIN
  INSERT INTO dbo.Roles (Name, Description)
  VALUES
    ('player', 'Jugador habilitado para apostar en torneos y ligas');
END
GO

DECLARE @PlayerRoleId INT = (SELECT RoleId FROM dbo.Roles WHERE Name = 'player');

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Username = 'demo.player')
BEGIN
  INSERT INTO dbo.Usuarios (Username, PasswordHash, RoleId, IsActive, CanBet)
  VALUES
    ('demo.player', HASHBYTES('SHA2_256', 'Demo1234!'), @PlayerRoleId, 1, 1);
END
GO

PRINT 'Base de datos ProdePad lista.';
GO
