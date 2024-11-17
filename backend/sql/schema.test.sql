-- Drop schema if exists and recreate it
DROP SCHEMA IF EXISTS patinhas CASCADE;
CREATE SCHEMA patinhas;

-- Set search path to use the patinhas schema
SET search_path TO patinhas;

-- Create ENUM types first
DO $$ BEGIN
    CREATE TYPE pet_species AS ENUM ('cachorro', 'gato', 'outro');
    CREATE TYPE pet_gender AS ENUM ('macho', 'femea', 'nao sei');
    CREATE TYPE pet_size AS ENUM ('pequeno', 'medio', 'grande');
    CREATE TYPE user_type AS ENUM ('doador', 'adotante', 'ambos');
    CREATE TYPE adoption_status AS ENUM ('aprovado', 'reprovado', 'pendente', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(32) NOT NULL,
    login VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    type user_type,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    zip_code VARCHAR(9),
    street_name VARCHAR(70),
    address_number VARCHAR(10),
    address_complement VARCHAR(255),
    neighborhood VARCHAR(100),
    city_name VARCHAR(100) NOT NULL,
    state_name VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE pets (
    pet_id SERIAL PRIMARY KEY,
    pet_name VARCHAR(50) NOT NULL,
    state VARCHAR(2),
    city VARCHAR(100),
    description VARCHAR(255) NOT NULL,
    species pet_species NOT NULL,
    gender pet_gender NOT NULL,
    breed VARCHAR(20),
    age SMALLINT NOT NULL,
    size pet_size,
    colour VARCHAR(20),
    personality VARCHAR(50),
    special_care VARCHAR(100),
    vaccinated BOOLEAN,
    castrated BOOLEAN,
    vermifuged BOOLEAN,
    is_adopted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adoptions (
    adoption_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    status adoption_status DEFAULT 'pendente',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE
);

CREATE TABLE questions_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50),
    type_description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL,
    question_content VARCHAR(255) NOT NULL,
    question_number INTEGER NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES questions_types(type_id) ON DELETE CASCADE
);

CREATE TABLE adoptions_questions (
    adoption_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (adoption_id, question_id),
    FOREIGN KEY (adoption_id) REFERENCES adoptions(adoption_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE TABLE answers (
    answer_id SERIAL PRIMARY KEY,
    adoption_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id, adoption_id) REFERENCES adoptions_questions(question_id, adoption_id) ON DELETE CASCADE
);

CREATE TABLE donations (
    donation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    donation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE
);

CREATE TABLE pet_images (
    image_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE
);

-- Create updated_at triggers for tables that need it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_address_updated_at
    BEFORE UPDATE ON address
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_types_updated_at
    BEFORE UPDATE ON questions_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
