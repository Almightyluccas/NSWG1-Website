CREATE TABLE IF NOT EXISTS campaigns (
                                         id VARCHAR(255) PRIMARY KEY,
                                         name VARCHAR(255) NOT NULL,
                                         description TEXT,
                                         start_date DATE NOT NULL,
                                         end_date DATE NOT NULL,
                                         status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
                                         created_by VARCHAR(255) NOT NULL,
                                         created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                         INDEX idx_status (status),
                                         INDEX idx_dates (start_date, end_date),
                                         INDEX idx_created_by (created_by),
                                         FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
                                        id VARCHAR(255) PRIMARY KEY,
                                        campaign_id VARCHAR(255) NOT NULL,
                                        name VARCHAR(255) NOT NULL,
                                        description TEXT,
                                        date DATE NOT NULL,
                                        time TIME NOT NULL,
                                        location VARCHAR(255) NOT NULL,
                                        max_personnel INT,
                                        status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
                                        created_by VARCHAR(255) NOT NULL,
                                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                        INDEX idx_campaign_id (campaign_id),
                                        INDEX idx_date (date),
                                        INDEX idx_status (status),
                                        INDEX idx_created_by (created_by),
                                        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
                                        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Mission RSVPs table
CREATE TABLE IF NOT EXISTS mission_rsvps (
                                             id VARCHAR(255) PRIMARY KEY,
                                             mission_id VARCHAR(255) NOT NULL,
                                             user_id VARCHAR(255) NOT NULL,
                                             user_name VARCHAR(255) NOT NULL,
                                             status ENUM('attending', 'not-attending', 'maybe') NOT NULL,
                                             notes TEXT,
                                             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                             UNIQUE KEY unique_mission_user (mission_id, user_id),
                                             INDEX idx_mission_id (mission_id),
                                             INDEX idx_user_id (user_id),
                                             INDEX idx_status (status),
                                             FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
                                             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mission attendance table
CREATE TABLE IF NOT EXISTS mission_attendance (
                                                  id VARCHAR(255) PRIMARY KEY,
                                                  mission_id VARCHAR(255) NOT NULL,
                                                  user_id VARCHAR(255) NOT NULL,
                                                  user_name VARCHAR(255) NOT NULL,
                                                  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
                                                  notes TEXT,
                                                  marked_by VARCHAR(255) NOT NULL,
                                                  marked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                  UNIQUE KEY unique_mission_user_attendance (mission_id, user_id),
                                                  INDEX idx_mission_id (mission_id),
                                                  INDEX idx_user_id (user_id),
                                                  INDEX idx_status (status),
                                                  INDEX idx_marked_by (marked_by),
                                                  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
                                                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                                  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Training records table
CREATE TABLE IF NOT EXISTS training_records (
                                                id VARCHAR(255) PRIMARY KEY,
                                                name VARCHAR(255) NOT NULL,
                                                description TEXT,
                                                date DATE NOT NULL,
                                                time TIME NOT NULL,
                                                location VARCHAR(255) NOT NULL,
                                                instructor VARCHAR(255),
                                                max_personnel INT,
                                                status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
                                                created_by VARCHAR(255) NOT NULL,
                                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                INDEX idx_date (date),
                                                INDEX idx_status (status),
                                                INDEX idx_created_by (created_by),
                                                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Training RSVPs table
CREATE TABLE IF NOT EXISTS training_rsvps (
                                              id VARCHAR(255) PRIMARY KEY,
                                              training_id VARCHAR(255) NOT NULL,
                                              user_id VARCHAR(255) NOT NULL,
                                              user_name VARCHAR(255) NOT NULL,
                                              status ENUM('attending', 'not-attending', 'maybe') NOT NULL,
                                              notes TEXT,
                                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                              UNIQUE KEY unique_training_user (training_id, user_id),
                                              INDEX idx_training_id (training_id),
                                              INDEX idx_user_id (user_id),
                                              INDEX idx_status (status),
                                              FOREIGN KEY (training_id) REFERENCES training_records(id) ON DELETE CASCADE,
                                              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Training attendance table
CREATE TABLE IF NOT EXISTS training_attendance (
                                                   id VARCHAR(255) PRIMARY KEY,
                                                   training_id VARCHAR(255) NOT NULL,
                                                   user_id VARCHAR(255) NOT NULL,
                                                   user_name VARCHAR(255) NOT NULL,
                                                   status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
                                                   notes TEXT,
                                                   marked_by VARCHAR(255) NOT NULL,
                                                   marked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                   UNIQUE KEY unique_training_user_attendance (training_id, user_id),
                                                   INDEX idx_training_id (training_id),
                                                   INDEX idx_user_id (user_id),
                                                   INDEX idx_status (status),
                                                   INDEX idx_marked_by (marked_by),
                                                   FOREIGN KEY (training_id) REFERENCES training_records(id) ON DELETE CASCADE,
                                                   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                                   FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Recurring trainings table
CREATE TABLE IF NOT EXISTS recurring_trainings (
                                                   id VARCHAR(255) PRIMARY KEY,
                                                   name VARCHAR(255) NOT NULL,
                                                   description TEXT NOT NULL,
                                                   day_of_week INT NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
                                                   time TIME NOT NULL,
                                                   location VARCHAR(255) NOT NULL,
                                                   instructor VARCHAR(255),
                                                   max_personnel INT,
                                                   is_active BOOLEAN DEFAULT TRUE,
                                                   created_by VARCHAR(255) NOT NULL,
                                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                   INDEX idx_day_of_week (day_of_week),
                                                   INDEX idx_is_active (is_active),
                                                   INDEX idx_created_by (created_by),
                                                   FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Recurring training instances table to track created instances
CREATE TABLE IF NOT EXISTS recurring_training_instances (
                                                            id VARCHAR(255) PRIMARY KEY,
                                                            recurring_training_id VARCHAR(255) NOT NULL,
                                                            training_id VARCHAR(255) NOT NULL,
                                                            scheduled_date DATE NOT NULL,
                                                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                            FOREIGN KEY (recurring_training_id) REFERENCES recurring_trainings(id) ON DELETE CASCADE,
                                                            FOREIGN KEY (training_id) REFERENCES training_records(id) ON DELETE CASCADE,
                                                            UNIQUE KEY unique_recurring_date (recurring_training_id, scheduled_date),
                                                            INDEX idx_scheduled_date (scheduled_date)
);

CREATE TABLE IF NOT EXISTS images (
                                      id INT AUTO_INCREMENT PRIMARY KEY,
                                      public_id TEXT,
                                      image_url TEXT NOT NULL,
                                      alt_text VARCHAR(255),
                                      title TEXT,
                                      description TEXT,
                                      category ENUM('Operations', 'Training', 'Misc'),
                                      unit ENUM('Task Force 160th', 'TACDEVRON2'),
                                      image_type VARCHAR(255) DEFAULT 'Gallery',
                                      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      author_id VARCHAR(255),
                                      CONSTRAINT images_ibfk_1 FOREIGN KEY (author_id) REFERENCES users(id),
                                      INDEX idx_author_id (author_id)
);

CREATE TABLE IF NOT EXISTS users (
                                     id VARCHAR(255) PRIMARY KEY,
                                     perscom_id INT UNIQUE,
                                     steam_id VARCHAR(255),
                                     discord_username VARCHAR(255) NOT NULL,
                                     name VARCHAR(255),
                                     date_of_birth DATE,
                                     email VARCHAR(255) NOT NULL,
                                     profile_image_id VARCHAR(255),
                                     refresh_token TEXT,
                                     refresh_token_expires_at DATETIME,
                                     role TEXT,
                                     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     INDEX idx_perscom_id (perscom_id),
                                     INDEX idx_discord_username (discord_username),
                                     INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id VARCHAR(255) PRIMARY KEY,
                                              token_hash VARCHAR(255) NOT NULL,
                                              expires_at DATETIME NOT NULL,
                                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              INDEX idx_token_hash (token_hash),
                                              INDEX idx_expires_at (expires_at)
);