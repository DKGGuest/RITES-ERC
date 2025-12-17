-- ============================================================
-- SARTHI Backend - Database Schema Reference
-- Database: sarthiworkflow
-- User Authentication & Role Management Tables
-- ============================================================
-- NOTE: These tables already exist in sarthiworkflow database
-- This file is for reference only - DO NOT RUN if tables exist
-- ============================================================

-- ============================================================
-- TABLE: user_master
-- Stores user credentials and basic information for login
-- ============================================================
/*
CREATE TABLE IF NOT EXISTS user_master (
    userId              INT             AUTO_INCREMENT PRIMARY KEY,
    password            VARCHAR(100)    NOT NULL,
    userName            VARCHAR(100)    NULL,
    email               VARCHAR(255)    NULL,
    mobileNumber        VARCHAR(10)     NULL,
    createdDate         DATETIME        NULL,
    createdBy           VARCHAR(45)     NULL,
    role_name           VARCHAR(255)    NULL,
    employee_id         VARCHAR(50)     NULL
);
*/

-- ============================================================
-- TABLE: role_master
-- Stores available roles in the system
-- ============================================================
/*
CREATE TABLE IF NOT EXISTS role_master (
    ROLEID              INT             AUTO_INCREMENT PRIMARY KEY,
    ROLENAME            VARCHAR(100)    NOT NULL,
    CREATEDBY           VARCHAR(50)     NULL,
    CREATEDDATE         DATETIME        NULL
);
*/

-- ============================================================
-- TABLE: user_role_master
-- Maps users to roles with permissions
-- ============================================================
/*
CREATE TABLE IF NOT EXISTS user_role_master (
    userRoleId          INT             AUTO_INCREMENT PRIMARY KEY,
    userId              INT             NOT NULL,
    roleId              INT             NOT NULL,
    readPermission      TINYINT(1)      NOT NULL,
    writePermission     TINYINT(1)      NOT NULL,
    createdDate         DATETIME        NULL,
    createdBy           VARCHAR(45)     NULL
);
*/

-- ============================================================
-- EXISTING ROLES IN DATABASE:
-- ============================================================
-- 1: Vendor
-- 2: RIO Help Desk
-- 3: IE
-- 4: IE Secondary
-- 5: Control Manager
-- 6: Rio Finance
-- 7: Process IE
-- 8: SBU Head

-- ============================================================
-- LOGIN CREDENTIALS (Existing Users):
-- ============================================================
-- User ID: 1,  Password: password, Role: Vendor
-- User ID: 13, Password: password, Role: IE (Inspector Engineer)
-- User ID: 20, Password: password, Role: Control Manager
-- User ID: 21, Password: password, Role: Process IE

