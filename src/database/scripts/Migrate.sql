CREATE TABLE IF NOT EXISTS campaigns
(
    id          VARCHAR(255) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    status      ENUM ('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
    created_by  VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL                                 DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME                                              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions
(
    id            VARCHAR(255) PRIMARY KEY,
    campaign_id   VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    date          DATE         NOT NULL,
    time          TIME         NOT NULL,
    location      VARCHAR(255) NOT NULL,
    max_personnel INT,
    status        ENUM ('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by    VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL                                       DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME                                                    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mission_rsvps
(
    id         VARCHAR(255) PRIMARY KEY,
    mission_id VARCHAR(255)                                 NOT NULL,
    user_id    VARCHAR(255)                                 NOT NULL,
    user_name  VARCHAR(255)                                 NOT NULL,
    status     ENUM ('attending', 'not-attending', 'maybe') NOT NULL,
    notes      TEXT,
    created_at DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME                                              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mission_user (mission_id, user_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mission_attendance
(
    id         VARCHAR(255) PRIMARY KEY,
    mission_id VARCHAR(255)                                  NOT NULL,
    user_id    VARCHAR(255)                                  NOT NULL,
    user_name  VARCHAR(255)                                  NOT NULL,
    status     ENUM ('present', 'absent', 'late', 'excused') NOT NULL,
    notes      TEXT,
    marked_by  VARCHAR(255)                                  NOT NULL,
    marked_at  DATETIME                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_mission_user_attendance (mission_id, user_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_marked_by (marked_by),
    FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_records
(
    id            VARCHAR(255) PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    date          DATE         NOT NULL,
    time          TIME         NOT NULL,
    location      VARCHAR(255) NOT NULL,
    instructor    VARCHAR(255),
    max_personnel INT,
    status        ENUM ('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_by    VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL                                       DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME                                                    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS training_rsvps
(
    id          VARCHAR(255) PRIMARY KEY,
    training_id VARCHAR(255)                                 NOT NULL,
    user_id     VARCHAR(255)                                 NOT NULL,
    user_name   VARCHAR(255)                                 NOT NULL,
    status      ENUM ('attending', 'not-attending', 'maybe') NOT NULL,
    notes       TEXT,
    created_at  DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME                                              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_training_user (training_id, user_id),
    INDEX idx_training_id (training_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (training_id) REFERENCES training_records (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Training attendance table
CREATE TABLE IF NOT EXISTS training_attendance
(
    id          VARCHAR(255) PRIMARY KEY,
    training_id VARCHAR(255)                                  NOT NULL,
    user_id     VARCHAR(255)                                  NOT NULL,
    user_name   VARCHAR(255)                                  NOT NULL,
    status      ENUM ('present', 'absent', 'late', 'excused') NOT NULL,
    notes       TEXT,
    marked_by   VARCHAR(255)                                  NOT NULL,
    marked_at   DATETIME                                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_training_user_attendance (training_id, user_id),
    INDEX idx_training_id (training_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_marked_by (marked_by),
    FOREIGN KEY (training_id) REFERENCES training_records (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users (id) ON DELETE CASCADE
);

-- Recurring trainings table
CREATE TABLE IF NOT EXISTS recurring_trainings
(
    id            VARCHAR(255) PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT         NOT NULL,
    day_of_week   INT          NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
    time          TIME         NOT NULL,
    location      VARCHAR(255) NOT NULL,
    instructor    VARCHAR(255),
    max_personnel INT,
    is_active     BOOLEAN   DEFAULT TRUE,
    created_by    VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

-- Recurring training instances table to track created instances
CREATE TABLE IF NOT EXISTS recurring_training_instances
(
    id                    VARCHAR(255) PRIMARY KEY,
    recurring_training_id VARCHAR(255) NOT NULL,
    training_id           VARCHAR(255) NOT NULL,
    scheduled_date        DATE         NOT NULL,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recurring_training_id) REFERENCES recurring_trainings (id) ON DELETE CASCADE,
    FOREIGN KEY (training_id) REFERENCES training_records (id) ON DELETE CASCADE,
    UNIQUE KEY unique_recurring_date (recurring_training_id, scheduled_date),
    INDEX idx_scheduled_date (scheduled_date)
);

CREATE TABLE IF NOT EXISTS images
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    public_id   TEXT,
    image_url   TEXT     NOT NULL,
    alt_text    VARCHAR(255),
    title       TEXT,
    description TEXT,
    category    ENUM ('Operations', 'Training', 'Misc'),
    unit        ENUM ('Task Force 160th', 'TACDEVRON2'),
    image_type  VARCHAR(255)      DEFAULT 'Gallery',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    author_id   VARCHAR(255),
    CONSTRAINT images_ibfk_1 FOREIGN KEY (author_id) REFERENCES users (id),
    INDEX idx_author_id (author_id)
);

CREATE TABLE IF NOT EXISTS users
(
    id               VARCHAR(255) PRIMARY KEY,
    perscom_id       INT UNIQUE,
    steam_id         VARCHAR(255),
    discord_username VARCHAR(255) NOT NULL,
    name             VARCHAR(255),
    date_of_birth    DATE,
    email            VARCHAR(255) NOT NULL,
    profile_image_id INT,
    role             set ('guest', 'applicant', 'candidate', 'J-1', 'J-2', 'J-3', 'J-4', 'greenTeam', 'member', '160th', 'tacdevron', 'instructor', 'admin', 'superAdmin', 'developer'),
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_perscom_id (perscom_id),
    INDEX idx_discord_username (discord_username),
    INDEX idx_email (email)
);



CREATE TABLE IF NOT EXISTS form_definitions
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    is_active   BOOLEAN               DEFAULT TRUE,
    created_by  VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS form_questions
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    form_id       INT                                                                                                                NOT NULL,
    question_text TEXT                                                                                                               NOT NULL,
    question_type ENUM ('short_answer', 'paragraph', 'multiple_choice', 'checkboxes', 'dropdown', 'date', 'time', 'email', 'number') NOT NULL,
    is_required   BOOLEAN                                                                                                                     DEFAULT FALSE,
    options       JSON, -- For multiple choice, checkboxes, dropdown options
    order_index   INT                                                                                                                NOT NULL,
    created_at    DATETIME                                                                                                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_form_id (form_id),
    INDEX idx_order_index (order_index),
    FOREIGN KEY (form_id) REFERENCES form_definitions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS form_submissions
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    form_id      INT      NOT NULL,
    user_id      VARCHAR(255),
    user_name    VARCHAR(255),
    user_email   VARCHAR(255),
    submitted_at DATETIME NOT NULL                                    DEFAULT CURRENT_TIMESTAMP,
    status       ENUM ('pending', 'reviewed', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by  VARCHAR(255),
    reviewed_at  DATETIME,
    notes        TEXT,
    INDEX idx_form_id (form_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at),
    FOREIGN KEY (form_id) REFERENCES form_definitions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS form_submission_answers
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT      NOT NULL,
    question_id   INT      NOT NULL,
    answer_text   TEXT,
    answer_json   JSON, -- For complex answers like multiple selections
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_submission_id (submission_id),
    INDEX idx_question_id (question_id),
    FOREIGN KEY (submission_id) REFERENCES form_submissions (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES form_questions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_access_logs
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    document_path VARCHAR(500)              NOT NULL,
    document_name VARCHAR(255)              NOT NULL,
    user_id       VARCHAR(255),
    user_name     VARCHAR(255),
    access_type   ENUM ('view', 'download') NOT NULL,
    accessed_at   DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    INDEX idx_document_path (document_path),
    INDEX idx_user_id (user_id),
    INDEX idx_access_type (access_type),
    INDEX idx_accessed_at (accessed_at),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE user_preferences
(
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            VARCHAR(255) NOT NULL UNIQUE,
    active_theme_name  VARCHAR(100)  DEFAULT 'Red',
    homepage_image_url VARCHAR(2048) DEFAULT '/images/tacdev/default.png',
    created_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_custom_themes
(
    id                INT PRIMARY KEY AUTO_INCREMENT,
    user_id           VARCHAR(255)          NOT NULL,
    name              VARCHAR(100) NOT NULL,
    accent_rgb        VARCHAR(50)  NOT NULL,
    accent_darker_rgb VARCHAR(50)  NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name),

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);