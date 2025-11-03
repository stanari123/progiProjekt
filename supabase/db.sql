-- Ekstenzija za UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enumeracije
CREATE TYPE role_t AS ENUM ('admin','suvlasnik','predstavnik');
CREATE TYPE visibility_t AS ENUM ('javno','privatno');
CREATE TYPE vote_choice_t AS ENUM ('da','ne');
CREATE TYPE meeting_status_t AS ENUM ('skica','zakazano','otkazano','održano');
CREATE TYPE discussion_status_t AS ENUM ('otvoreno','zatvoreno');

-- Korisnici
CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    phone_number VARCHAR(30),
    role role_t NOT NULL DEFAULT 'suvlasnik',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Zgrade
CREATE TABLE building (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50),
    address VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Članstva u zgradi
CREATE TABLE building_membership (
    building_id UUID NOT NULL REFERENCES building(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    user_role role_t NOT NULL,
    PRIMARY KEY (building_id, user_id)
);

-- Diskusije
CREATE TABLE discussion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    poll_description VARCHAR(255),
    building_id UUID NOT NULL REFERENCES building(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
    visibility visibility_t NOT NULL DEFAULT 'privatno',
    status discussion_status_t NOT NULL DEFAULT 'otvoreno',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (title, building_id)
);

-- Provjera postojanja vlasnika diskusije
CREATE FUNCTION require_discussion_owner() RETURNS trigger AS $$
BEGIN
    IF NEW.owner_id IS NULL THEN
        RAISE EXCEPTION 'Diskusija mora imati vlasnika';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_require_discussion_owner
BEFORE INSERT ON discussion
FOR EACH ROW EXECUTE FUNCTION require_discussion_owner();

-- Sudionici diskusije
CREATE TABLE discussion_participant (
    discussion_id UUID NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    can_post BOOLEAN DEFAULT TRUE,
    number_of_messages INTEGER DEFAULT 0,
    PRIMARY KEY (discussion_id, user_id),
    CONSTRAINT positive_no_of_messages CHECK (number_of_messages >= 0)
);

-- Poruke
CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
    author_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Provjera postojanja autora poruke
CREATE FUNCTION require_message_author() RETURNS trigger AS $$
BEGIN
    IF NEW.author_id IS NULL THEN
        RAISE EXCEPTION 'Autor mora postojati!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_require_message_author
BEFORE INSERT ON message
FOR EACH ROW EXECUTE FUNCTION require_message_author();

-- Upload (slike i drugi attachmenti uz poruke)
CREATE TABLE upload (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES message(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    filename TEXT,
    content_type TEXT,
    size_bytes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ankete u diskusijama
CREATE TABLE poll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES discussion(id) ON DELETE CASCADE,
    author_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed BOOLEAN DEFAULT FALSE
);

-- Provjera postojanja autora ankete
CREATE FUNCTION require_poll_author() RETURNS trigger AS $$
BEGIN
    IF NEW.author_id IS NULL THEN
        RAISE EXCEPTION 'Autor ankete mora postojati!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_require_poll_author
BEFORE INSERT ON poll
FOR EACH ROW EXECUTE FUNCTION require_poll_author();

-- Glasovi u anketama
CREATE TABLE vote (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES poll(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_user(id) ON DELETE SET NULL,
    value vote_choice_t NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (poll_id, user_id)
);


CREATE INDEX idx_message_discussion ON message(discussion_id, created_at DESC);
CREATE INDEX idx_poll_discussion ON poll(discussion_id);
CREATE INDEX idx_vote_poll ON vote(poll_id);
CREATE INDEX idx_discussion_building ON discussion(building_id);