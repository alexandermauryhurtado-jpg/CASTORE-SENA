-- Initial database creation script for SGIA (Sistema de Gestión de Inventario Alimentario)
-- Database Name: sgia_dev

CREATE DATABASE IF NOT EXISTS sgia_dev;
USE sgia_dev;

-- 1. Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON NOT NULL,
    is_system TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    first_login TINYINT(1) DEFAULT 1,
    role_id VARCHAR(36),
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sku_prefix VARCHAR(10) UNIQUE NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(20),
    parent_id VARCHAR(36),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: locations
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('WAREHOUSE', 'ZONE', 'AISLE', 'SHELF', 'CELL') NOT NULL,
    capacity INT,
    parent_id VARCHAR(36),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('NATIONAL', 'INTERNATIONAL', 'MANUFACTURER', 'DISTRIBUTOR') NOT NULL,
    contributor_type ENUM('LARGE', 'COMMON', 'SIMPLIFIED', 'NON_CONTRIBUTOR') NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    contact_name VARCHAR(255),
    payment_terms VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'COP',
    website VARCHAR(255),
    notes TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    has_expiry TINYINT(1) DEFAULT 0,
    expiry_date DATE,
    status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') DEFAULT 'ACTIVE',
    image_url VARCHAR(255),
    category_id VARCHAR(36),
    location_id VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: movements
CREATE TABLE IF NOT EXISTS movements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    lot_number VARCHAR(100),
    doc_reference VARCHAR(100),
    notes TEXT,
    unit_cost DECIMAL(15, 2),
    total_cost DECIMAL(15, 2),
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    supplier_id VARCHAR(36),
    from_location_id VARCHAR(36),
    to_location_id VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: stock_alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type VARCHAR(50) NOT NULL,
    threshold DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    status ENUM('ACTIVE', 'RESOLVED', 'DISMISSED') DEFAULT 'ACTIVE',
    notes TEXT,
    product_id VARCHAR(36) NOT NULL,
    resolved_by VARCHAR(36),
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: password_resets
CREATE TABLE IF NOT EXISTS password_resets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA

-- Roles iniciales
INSERT INTO roles (id, name, description, permissions, is_system) VALUES
('95837648-5c5a-4530-8191-c116498bb66c', 'Súper Admin', 'Acceso total al sistema', '{"dashboard":{"read":true},"users":{"read":true,"create":true,"update":true,"delete":true},"roles":{"read":true,"create":true,"update":true,"delete":true},"products":{"read":true,"create":true,"update":true,"delete":true},"categories":{"read":true,"create":true,"update":true,"delete":true},"locations":{"read":true,"create":true,"update":true,"delete":true},"suppliers":{"read":true,"create":true,"update":true,"delete":true},"movements":{"read":true,"create":true},"alerts":{"read":true,"update":true}}', 1),
('407883d6-4e56-42fc-a4a3-76a08605330e', 'Administrador', 'Administración de inventario y personal', '{"dashboard":{"read":true},"users":{"read":true,"create":true,"update":true,"delete":false},"products":{"read":true,"create":true,"update":true,"delete":true},"categories":{"read":true,"create":true,"update":true,"delete":true},"locations":{"read":true,"create":true,"update":true,"delete":true},"suppliers":{"read":true,"create":true,"update":true,"delete":true},"movements":{"read":true,"create":true},"alerts":{"read":true,"update":true}}', 1),
('7b8097b6-c67b-402c-87b6-1936c64112e7', 'Operador de Bodega', 'Registro de movimientos y gestión de stock', '{"dashboard":{"read":true},"products":{"read":true,"create":false,"update":false,"delete":false},"categories":{"read":true},"locations":{"read":true},"suppliers":{"read":true},"movements":{"read":true,"create":true},"alerts":{"read":true,"update":true}}', 1),
('926f0436-3a78-43d9-952b-472149725f77', 'Consultor', 'Solo lectura de reportes e inventario', '{"dashboard":{"read":true},"products":{"read":true},"categories":{"read":true},"locations":{"read":true},"suppliers":{"read":true},"movements":{"read":true},"alerts":{"read":true}}', 1);

-- Usuario Super Admin Inicial
-- Contraseña temporal: Admin123!
-- Hash generado con bcrypt rounds 12: $2b$12$R.Sj6mS.G7/9mS.G7/9mS.7aZ1YpG.wQ.F.F.F.F.F.F.F.F.F.F.F
-- Nota: En producción, el sistema pedirá cambio de contraseña en el primer login
INSERT INTO users (id, full_name, email, password_hash, is_active, first_login, role_id) VALUES
('f16f735d-0081-432d-862d-96541f77d33b', 'Administrador del Sistema', 'vargasmayo.c99@gmail.com', '$2b$12$LGLTLVZrkTM.DAOepfQGEOXeJAtFMJick9W17kGsUC8XfAWiPNaxi', 1, 1, '95837648-5c5a-4530-8191-c116498bb66c');

-- Categorías Iniciales
INSERT INTO categories (id, name, description, sku_prefix, icon, color, parent_id) VALUES
('26760df7-393e-4a69-8e4a-1c706d856d10', 'Motor', 'Componentes y repuestos del motor', 'MOT', 'engine', '#EF4444', NULL),
('8430b343-7186-4f40-b6ab-156c28f1cc7c', 'Suspensión', 'Amortiguadores, resortes y más', 'SUS', 'activity', '#3B82F6', NULL),
('3f8e5f8b-3e5f-4e5f-9d32-8e5f8e5f8e5f', 'Frenos', 'Pastillas, discos y líquidos', 'FRE', 'disc', '#10B981', NULL),
('1e2f3a4b-5c6d-4e8f-9a0b-1c2d3e4f5a6b', 'Aceites y Lubricantes', 'Aceites de motor y transmisión', 'ACE', 'droplet', '#F59E0B', '26760df7-393e-4a69-8e4a-1c706d856d10');
