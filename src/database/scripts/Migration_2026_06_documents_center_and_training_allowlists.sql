CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  doc_type VARCHAR(64) NULL,
  classification VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
  unit VARCHAR(255) NOT NULL DEFAULT 'NSWG1 HQ',
  file_key TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NULL,
  minimum_role VARCHAR(50) NOT NULL DEFAULT 'member',
  uploaded_by VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documents_uploaded_by (uploaded_by),
  INDEX idx_documents_classification (classification),
  INDEX idx_documents_unit (unit),
  FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_tags (
  document_id INT NOT NULL,
  tag VARCHAR(64) NOT NULL,
  PRIMARY KEY (document_id, tag),
  INDEX idx_document_tags_tag (tag),
  FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_allowed_roles (
  document_id INT NOT NULL,
  role VARCHAR(50) NOT NULL,
  PRIMARY KEY (document_id, role),
  INDEX idx_document_allowed_roles_role (role),
  FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_allowed_users (
  document_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (document_id, user_id),
  INDEX idx_document_allowed_users_user_id (user_id),
  FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_allowed_roles (
  training_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  PRIMARY KEY (training_id, role),
  INDEX idx_training_allowed_roles_role (role),
  FOREIGN KEY (training_id) REFERENCES training_records (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_allowed_users (
  training_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (training_id, user_id),
  INDEX idx_training_allowed_users_user_id (user_id),
  FOREIGN KEY (training_id) REFERENCES training_records (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_documents (
  training_id VARCHAR(255) NOT NULL,
  document_id INT NOT NULL,
  PRIMARY KEY (training_id, document_id),
  INDEX idx_training_documents_document_id (document_id),
  FOREIGN KEY (training_id) REFERENCES training_records (id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);
