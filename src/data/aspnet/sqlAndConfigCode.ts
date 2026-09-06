export const webConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <connectionStrings>
    <!-- Approved Connection String Name: R_WAPP -->
    <add name="R_WAPP" 
         connectionString="Data Source=localhost;Initial Catalog=TenantHubDB;Integrated Security=True;Encrypt=False;TrustServerCertificate=True" 
         providerName="System.Data.SqlClient" />
  </connectionStrings>

  <appSettings>
    <!-- UPI Payment Configuration -->
    <add key="UPI_PayeeAddress" value="tenanthub.landlord@okaxis" />
    <add key="UPI_PayeeName" value="Tenant Hub Property Management" />
    <add key="UPI_PaymentNote" value="Rent and Water Payment" />
    <add key="BaseAppUrl" value="https://your-domain.com" />

    <!-- Email SMTP Settings (Protected configuration recommended for production) -->
    <add key="SmtpHost" value="smtp.gmail.com" />
    <add key="SmtpPort" value="587" />
    <add key="SmtpUser" value="notifications@tenanthub.com" />
    <add key="SmtpPassword" value="YOUR_PROTECTED_APP_PASSWORD" />
    <add key="SmtpFromEmail" value="noreply@tenanthub.com" />
    <add key="SmtpEnableSsl" value="true" />

    <!-- SMS Gateway API Configuration -->
    <add key="SmsApiUrl" value="https://api.textlocal.in/send/" />
    <add key="SmsApiKey" value="YOUR_SECURE_SMS_API_KEY" />
    <add key="SmsSenderId" value="TNTHUB" />
  </appSettings>

  <system.web>
    <compilation debug="true" targetFramework="4.8" />
    <httpRuntime targetFramework="4.8" />
    <sessionState timeout="60" mode="InProc" />
    <customErrors mode="RemoteOnly" defaultRedirect="customerloginpage.aspx" />
  </system.web>

  <system.webServer>
    <defaultDocument>
      <files>
        <clear />
        <add value="customerloginpage.aspx" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>`;

export const databaseSqlScript = `-- =======================================================
-- TENANT HUB - SQL SERVER COMPLETE DATABASE SETUP SCRIPT
-- Database: TenantHubDB
-- Namespace: R_WApp
-- Suffix-Identified Tables (11, 12, 21, 22, 31, 32, 41)
-- =======================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TenantHubDB')
BEGIN
    CREATE DATABASE [TenantHubDB];
END
GO

USE [TenantHubDB];
GO

-- =======================================================
-- 1. CREATE ALL RENT TABLES (RENT_11 through RENT_41)
-- Columns: [DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID]
-- =======================================================

-- Helper to create Rent tables safely
DECLARE @RentTables TABLE (TableName NVARCHAR(50));
INSERT INTO @RentTables VALUES 
('RENT_11'), ('RENT_12'), ('RENT_21'), ('RENT_22'), ('RENT_31'), ('RENT_32'), ('RENT_41');

DECLARE @rName NVARCHAR(50);
DECLARE rCursor CURSOR FOR SELECT TableName FROM @RentTables;
OPEN rCursor;
FETCH NEXT FROM rCursor INTO @rName;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @rSql NVARCHAR(MAX) = N'
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N''[dbo].[' + @rName + ']'') AND type in (N''U''))
    BEGIN
        CREATE TABLE [dbo].[' + @rName + '] (
            [ID] INT IDENTITY(1,1) PRIMARY KEY,
            [DATE] DATE NOT NULL,
            [DAY] VARCHAR(50) NULL,
            [PAYMENT] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [BALANCE] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [TOTAL] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [MODE OF PAYMENT] VARCHAR(100) NULL,
            [PAID] VARCHAR(MAX) NOT NULL DEFAULT ''NOT PAID''
        );
        CREATE NONCLUSTERED INDEX [IX_' + @rName + '_Date] ON [dbo].[' + @rName + ']([DATE] DESC);
    END;';
    EXEC sp_executesql @rSql;
    FETCH NEXT FROM rCursor INTO @rName;
END;

CLOSE rCursor;
DEALLOCATE rCursor;
GO

-- =======================================================
-- 2. CREATE ALL WATER TABLES (Water_11 through Water_41)
-- Columns: [DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], 
--          [KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID]
-- =======================================================

DECLARE @WaterTables TABLE (TableName NVARCHAR(50));
INSERT INTO @WaterTables VALUES 
('Water_11'), ('Water_12'), ('Water_21'), ('Water_22'), ('Water_31'), ('Water_32'), ('Water_41');

DECLARE @wName NVARCHAR(50);
DECLARE wCursor CURSOR FOR SELECT TableName FROM @WaterTables;
OPEN wCursor;
FETCH NEXT FROM wCursor INTO @wName;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @wSql NVARCHAR(MAX) = N'
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N''[dbo].[' + @wName + ']'') AND type in (N''U''))
    BEGIN
        CREATE TABLE [dbo].[' + @wName + '] (
            [ID] INT IDENTITY(1,1) PRIMARY KEY,
            [DATE] DATE NOT NULL,
            [DAY] VARCHAR(50) NULL,
            [CURRENT_READINGS] INT NOT NULL DEFAULT 0,
            [PREVIOUS_READINGS] INT NOT NULL DEFAULT 0,
            [KITCHEN] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [TOTAL_BILL] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [BALANCE] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [TOTAL] DECIMAL(18,2) NOT NULL DEFAULT 0.00,
            [PAID] VARCHAR(MAX) NOT NULL DEFAULT ''NOT PAID''
        );
        CREATE NONCLUSTERED INDEX [IX_' + @wName + '_Date] ON [dbo].[' + @wName + ']([DATE] DESC);
    END;';
    EXEC sp_executesql @wSql;
    FETCH NEXT FROM wCursor INTO @wName;
END;

CLOSE wCursor;
DEALLOCATE wCursor;
GO

-- =======================================================
-- 3. INSERT SAMPLE SEED RECORDS
-- =======================================================

-- Tenant 11 (PAID)
IF NOT EXISTS (SELECT 1 FROM [RENT_11] WHERE [DATE] = '2026-08-01')
    INSERT INTO [RENT_11] ([DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID])
    VALUES ('2026-08-01', 'Saturday', 12000.00, 0.00, 12000.00, 'UPI / GPay', 'PAID');

IF NOT EXISTS (SELECT 1 FROM [Water_11] WHERE [DATE] = '2026-08-01')
    INSERT INTO [Water_11] ([DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], [KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID])
    VALUES ('2026-08-01', 'Saturday', 1450, 1390, 150.00, 750.00, 0.00, 750.00, 'PAID');

-- Tenant 12 (NOT PAID)
IF NOT EXISTS (SELECT 1 FROM [RENT_12] WHERE [DATE] = '2026-08-01')
    INSERT INTO [RENT_12] ([DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID])
    VALUES ('2026-08-01', 'Saturday', 14000.00, 500.00, 14500.00, 'Pending', 'NOT PAID');

IF NOT EXISTS (SELECT 1 FROM [Water_12] WHERE [DATE] = '2026-08-01')
    INSERT INTO [Water_12] ([DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], [KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID])
    VALUES ('2026-08-01', 'Saturday', 2100, 2020, 200.00, 950.00, 100.00, 1050.00, 'NOT PAID');

-- Tenant 21 (PAID)
IF NOT EXISTS (SELECT 1 FROM [RENT_21] WHERE [DATE] = '2026-08-01')
    INSERT INTO [RENT_21] ([DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID])
    VALUES ('2026-08-01', 'Saturday', 11500.00, 0.00, 11500.00, 'PhonePe', 'PAID');

IF NOT EXISTS (SELECT 1 FROM [Water_21] WHERE [DATE] = '2026-08-01')
    INSERT INTO [Water_21] ([DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], [KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID])
    VALUES ('2026-08-01', 'Saturday', 1890, 1835, 150.00, 680.00, 0.00, 680.00, 'PAID');

-- Tenant 22 (NOT PAID)
IF NOT EXISTS (SELECT 1 FROM [RENT_22] WHERE [DATE] = '2026-08-01')
    INSERT INTO [RENT_22] ([DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID])
    VALUES ('2026-08-01', 'Saturday', 13000.00, 1000.00, 14000.00, 'Cash', 'NOT PAID');

IF NOT EXISTS (SELECT 1 FROM [Water_22] WHERE [DATE] = '2026-08-01')
    INSERT INTO [Water_22] ([DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], [KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID])
    VALUES ('2026-08-01', 'Saturday', 1650, 1590, 180.00, 820.00, 150.00, 970.00, 'NOT PAID');
GO

PRINT 'Tenant Hub Database initialized successfully with all rent & water tables!';
`;
