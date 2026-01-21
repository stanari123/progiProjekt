-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_user (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone_number character varying,
  role USER-DEFINED NOT NULL DEFAULT 'suvlasnik'::role_t,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  password_hash text NOT NULL,
  CONSTRAINT app_user_pkey PRIMARY KEY (id)
);
CREATE TABLE public.building (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying,
  address character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT building_pkey PRIMARY KEY (id)
);
CREATE TABLE public.building_membership (
  building_id uuid NOT NULL,
  user_id uuid NOT NULL,
  user_role USER-DEFINED NOT NULL,
  CONSTRAINT building_membership_pkey PRIMARY KEY (building_id, user_id),
  CONSTRAINT building_membership_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.building(id),
  CONSTRAINT building_membership_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id)
);
CREATE TABLE public.discussion (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  poll_description character varying,
  building_id uuid NOT NULL,
  owner_id uuid,
  visibility USER-DEFINED NOT NULL DEFAULT 'privatno'::visibility_t,
  status USER-DEFINED NOT NULL DEFAULT 'otvoreno'::discussion_status_t,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT discussion_pkey PRIMARY KEY (id),
  CONSTRAINT discussion_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.building(id),
  CONSTRAINT discussion_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.app_user(id)
);
CREATE TABLE public.discussion_participant (
  discussion_id uuid NOT NULL,
  user_id uuid NOT NULL,
  can_post boolean DEFAULT true,
  number_of_messages integer DEFAULT 0 CHECK (number_of_messages >= 0),
  CONSTRAINT discussion_participant_pkey PRIMARY KEY (discussion_id, user_id),
  CONSTRAINT discussion_participant_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussion(id),
  CONSTRAINT discussion_participant_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id)
);
CREATE TABLE public.message (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  discussion_id uuid NOT NULL,
  author_id uuid,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_pkey PRIMARY KEY (id),
  CONSTRAINT message_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussion(id),
  CONSTRAINT message_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.app_user(id)
);
CREATE TABLE public.poll (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  discussion_id uuid NOT NULL,
  author_id uuid,
  question text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  closed boolean DEFAULT false,
  CONSTRAINT poll_pkey PRIMARY KEY (id),
  CONSTRAINT poll_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussion(id),
  CONSTRAINT poll_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.app_user(id)
);
CREATE TABLE public.upload (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  url text NOT NULL,
  filename text,
  content_type text,
  size_bytes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT upload_pkey PRIMARY KEY (id),
  CONSTRAINT upload_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.message(id)
);
CREATE TABLE public.vote (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  poll_id uuid NOT NULL,
  user_id uuid,
  value USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vote_pkey PRIMARY KEY (id),
  CONSTRAINT vote_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.poll(id),
  CONSTRAINT vote_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id)
);
CREATE TABLE public.stanplan (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  link text,
  CONSTRAINT stanplan_pkey PRIMARY KEY (id)
);