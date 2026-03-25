-- Doubtify Database Schema
-- PostgreSQL Schema for the student doubt resolution platform

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('student', 'moderator', 'admin');
CREATE TYPE doubt_status AS ENUM ('open', 'answered', 'resolved', 'closed');
CREATE TYPE rating_type AS ENUM ('upvote', 'downvote');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role DEFAULT 'student',
    bio TEXT,
    avatar_url VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color_code VARCHAR(7), -- Hex color code
    icon VARCHAR(50), -- Icon name/class
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doubts table
CREATE TABLE doubts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    status doubt_status DEFAULT 'open',
    accepted_response_id INTEGER, -- Foreign key to responses table (self-referencing)
    views_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[], -- Array of tag strings
    search_vector tsvector, -- For full-text search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Responses table
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    doubt_id INTEGER NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    parent_response_id INTEGER REFERENCES responses(id) ON DELETE CASCADE, -- For threaded responses
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add the foreign key constraint for accepted_response_id after responses table is created
ALTER TABLE doubts 
ADD CONSTRAINT fk_doubts_accepted_response 
FOREIGN KEY (accepted_response_id) REFERENCES responses(id) ON DELETE SET NULL;

-- Ratings table (for upvotes/downvotes on doubts and responses)
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doubt_id INTEGER REFERENCES doubts(id) ON DELETE CASCADE,
    response_id INTEGER REFERENCES responses(id) ON DELETE CASCADE,
    rating_type rating_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure user can only rate once per doubt/response
    CONSTRAINT unique_user_doubt_rating UNIQUE(user_id, doubt_id),
    CONSTRAINT unique_user_response_rating UNIQUE(user_id, response_id),
    
    -- Ensure rating is for either a doubt or a response, but not both
    CONSTRAINT check_rating_target CHECK (
        (doubt_id IS NOT NULL AND response_id IS NULL) OR 
        (doubt_id IS NULL AND response_id IS NOT NULL)
    )
);

-- User reputation table
CREATE TABLE user_reputation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_reputation INTEGER DEFAULT 0,
    doubts_asked INTEGER DEFAULT 0,
    responses_given INTEGER DEFAULT 0,
    responses_accepted INTEGER DEFAULT 0,
    upvotes_received INTEGER DEFAULT 0,
    downvotes_received INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base table (for resolved doubts)
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    doubt_id INTEGER UNIQUE NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    tags TEXT[],
    category VARCHAR(100),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    helpfulness_score DECIMAL(3,2) DEFAULT 0.00,
    views_count INTEGER DEFAULT 0,
    search_vector tsvector, -- For full-text search
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (for JWT token management)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'doubt_answered', 'response_accepted', 'upvote_received', etc.
    is_read BOOLEAN DEFAULT false,
    related_doubt_id INTEGER REFERENCES doubts(id) ON DELETE CASCADE,
    related_response_id INTEGER REFERENCES responses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_doubts_author ON doubts(author_id);
CREATE INDEX idx_doubts_subject ON doubts(subject_id);
CREATE INDEX idx_doubts_status ON doubts(status);
CREATE INDEX idx_doubts_created_at ON doubts(created_at);
CREATE INDEX idx_doubts_search_vector ON doubts USING GIN(search_vector);

CREATE INDEX idx_responses_doubt ON responses(doubt_id);
CREATE INDEX idx_responses_author ON responses(author_id);
CREATE INDEX idx_responses_parent ON responses(parent_response_id);

CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_doubt ON ratings(doubt_id);
CREATE INDEX idx_ratings_response ON ratings(response_id);

CREATE INDEX idx_knowledge_base_search_vector ON knowledge_base USING GIN(search_vector);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING GIN(tags);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Create triggers for updating search vectors
CREATE OR REPLACE FUNCTION update_doubt_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_doubt_search_vector
    BEFORE INSERT OR UPDATE ON doubts
    FOR EACH ROW EXECUTE FUNCTION update_doubt_search_vector();

CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(NEW.summary, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_base_search_vector
    BEFORE INSERT OR UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_base_search_vector();

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_doubts_updated_at
    BEFORE UPDATE ON doubts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_responses_updated_at
    BEFORE UPDATE ON responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_user_reputation_updated_at
    BEFORE UPDATE ON user_reputation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user reputation
CREATE OR REPLACE FUNCTION calculate_user_reputation(user_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    reputation_score INTEGER := 0;
    accepted_answers INTEGER := 0;
    upvotes INTEGER := 0;
    downvotes INTEGER := 0;
BEGIN
    -- Count accepted answers
    SELECT COUNT(*)
    INTO accepted_answers
    FROM responses r
    WHERE r.author_id = user_id_param AND r.is_accepted = true;

    -- Count upvotes
    SELECT COUNT(*)
    INTO upvotes
    FROM ratings rt
    LEFT JOIN responses r ON rt.response_id = r.id
    LEFT JOIN doubts d ON rt.doubt_id = d.id
    WHERE rt.rating_type = 'upvote' AND (r.author_id = user_id_param OR d.author_id = user_id_param);

    -- Count downvotes
    SELECT COUNT(*)
    INTO downvotes
    FROM ratings rt
    LEFT JOIN responses r ON rt.response_id = r.id
    LEFT JOIN doubts d ON rt.doubt_id = d.id
    WHERE rt.rating_type = 'downvote' AND (r.author_id = user_id_param OR d.author_id = user_id_param);

    -- Calculate reputation (accepted_answer * 10 + upvotes * 2 - downvotes)
    reputation_score := (accepted_answers * 10) + (upvotes * 2) - downvotes;

    RETURN GREATEST(reputation_score, 0); -- Ensure reputation never goes below 0
END;
$$ LANGUAGE plpgsql;