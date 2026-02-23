-- Database Schema for Indian Housing Society Management (SaaS Multi-tenant)

-- 1. Platform & Society Management
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACTIVE, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- Free, Basic, Professional, Enterprise
    max_flats INTEGER,
    monthly_price DECIMAL(12, 2),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE society_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    plan_id UUID REFERENCES subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status VARCHAR(20),
    auto_renew BOOLEAN DEFAULT TRUE
);

-- 2. User & RBAC
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- SUPER_ADMIN, SOCIETY_ADMIN, ACCOUNTANT, MEMBER, AUDITOR, STAFF
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id), -- NULL for Super Admin
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- 3. Housing Structure
CREATE TABLE wings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    name VARCHAR(50) NOT NULL -- A, B, C or Jasmine, Lotus etc.
);

CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wing_id UUID REFERENCES wings(id),
    unit_number VARCHAR(20) NOT NULL,
    unit_type VARCHAR(20), -- 1BHK, 2BHK, Shop, Penthouse
    area_sqft DECIMAL(10, 2),
    owner_name VARCHAR(255),
    is_occupied BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Financial Accounting (Double Entry)
CREATE TABLE account_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES account_groups(id),
    type VARCHAR(20) NOT NULL -- ASSET, LIABILITY, INCOME, EXPENSE
);

CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    group_id UUID REFERENCES account_groups(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    is_system_defined BOOLEAN DEFAULT FALSE -- Fixed Ledgers like 'Maintenance Receivable'
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    voucher_number VARCHAR(50),
    transaction_date DATE DEFAULT CURRENT_DATE,
    narration TEXT,
    created_by UUID REFERENCES users(id)
);

CREATE TABLE account_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES journal_entries(id),
    ledger_id UUID REFERENCES ledgers(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    balance_after DECIMAL(15, 2)
);

-- 5. Maintenance & Billing
CREATE TABLE maintenance_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    unit_id UUID REFERENCES units(id),
    bill_number VARCHAR(50) UNIQUE,
    bill_period_start DATE,
    bill_period_end DATE,
    due_date DATE,
    principal_amount DECIMAL(15, 2),
    previous_dues DECIMAL(15, 2) DEFAULT 0,
    interest_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_bill_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES maintenance_bills(id),
    charge_name VARCHAR(100), -- Service Charge, Sinking Fund, Parking, Water
    amount DECIMAL(12, 2)
);

-- 6. Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    unit_id UUID REFERENCES units(id),
    bill_id UUID REFERENCES maintenance_bills(id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_mode VARCHAR(20), -- ONLINE, CHEQUE, CASH, NEFT
    payment_reference VARCHAR(100), -- Razorpay ID, Cheque No
    status VARCHAR(20), -- SUCCESS, FAILED, PENDING
    reconciled BOOLEAN DEFAULT FALSE
);

-- 7. Statutory Records
CREATE TABLE member_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id),
    unit_id UUID REFERENCES units(id),
    full_name VARCHAR(255),
    membership_date DATE,
    share_certificate_no VARCHAR(50),
    distinctive_nos_from INTEGER,
    distinctive_nos_to INTEGER,
    nominee_name VARCHAR(255),
    remarks TEXT
);
