-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
                                     id VARCHAR(255) PRIMARY KEY,
                                     name VARCHAR(255) NOT NULL,
                                     description TEXT,
                                     type ENUM('submission', 'link', 'pdf') NOT NULL DEFAULT 'submission',
                                     status ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'draft',
                                     url TEXT,
                                     fields JSON,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                     created_by VARCHAR(255),
                                     INDEX idx_status (status),
                                     INDEX idx_type (type),
                                     INDEX idx_created_at (created_at)
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
                                                id VARCHAR(255) PRIMARY KEY,
                                                form_id VARCHAR(255) NOT NULL,
                                                user_id VARCHAR(255) NOT NULL,
                                                user_name VARCHAR(255),
                                                data JSON NOT NULL,
                                                status ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
                                                reviewed_by VARCHAR(255),
                                                reviewed_at TIMESTAMP NULL,
                                                notes TEXT,
                                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
                                                INDEX idx_form_id (form_id),
                                                INDEX idx_user_id (user_id),
                                                INDEX idx_status (status),
                                                INDEX idx_created_at (created_at)
);

-- Insert default LOA form
INSERT INTO forms (id, name, description, type, status, created_at) VALUES
    ('loa-form-default', 'Leave of Absence (LOA) Request', 'Please fill out this form prior to leaving for a prolonged period of time. The definition of a LOA would be greater than 4 sessions.', 'submission', 'active', NOW())
ON DUPLICATE KEY UPDATE
                     name = VALUES(name),
                     description = VALUES(description),
                     status = VALUES(status),
                     updated_at = NOW();
