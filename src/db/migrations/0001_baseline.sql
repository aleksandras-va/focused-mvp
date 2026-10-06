CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

CREATE TYPE public.camera_body_type AS ENUM (
    'mirrorless',
    'dslr',
    'compact',
    'slr',
    'rangefinder'
);

CREATE TYPE public.cosmetic_condition AS ENUM (
    'mint',
    'excellent',
    'good',
    'well_used',
    'damaged'
);

CREATE TYPE public.functional_condition AS ENUM (
    'fully_working',
    'minor_issues',
    'faulty'
);

CREATE TYPE public.inclusion AS ENUM (
    'original_box',
    'charger',
    'oem_battery',
    'third_party_battery',
    'body_cap',
    'rear_cap',
    'lens_hood',
    'strap',
    'memory_card',
    'case',
    'manual',
    'receipt'
);

CREATE TYPE public.listing_status AS ENUM (
    'draft',
    'active',
    'sold',
    'removed'
);

CREATE TYPE public.model_category AS ENUM (
    'camera',
    'lens',
    'accessory'
);

CREATE TYPE public.sensor_format AS ENUM (
    'medium_format',
    'full_frame',
    'aps_c',
    'micro_four_thirds',
    'one_inch'
);

CREATE TABLE public.brand (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT brands_id_not_null NOT NULL,
    slug text CONSTRAINT brands_slug_not_null NOT NULL,
    name text CONSTRAINT brands_name_not_null NOT NULL
);

CREATE TABLE public.camera_spec (
    model_id uuid CONSTRAINT camera_specs_model_id_not_null NOT NULL,
    body_type public.camera_body_type CONSTRAINT camera_specs_body_type_not_null NOT NULL,
    sensor_format public.sensor_format CONSTRAINT camera_specs_sensor_format_not_null NOT NULL,
    megapixels real,
    has_mechanical_shutter boolean DEFAULT true CONSTRAINT camera_specs_has_mechanical_shutter_not_null NOT NULL,
    has_ibis boolean,
    weather_sealed boolean,
    records_4k boolean,
    battery_model text,
    weight_grams smallint,
    width_mm real,
    height_mm real,
    depth_mm real,
    is_film boolean DEFAULT false NOT NULL,
    CONSTRAINT camera_spec_depth_mm_check CHECK ((depth_mm > (0)::double precision)),
    CONSTRAINT camera_spec_height_mm_check CHECK ((height_mm > (0)::double precision)),
    CONSTRAINT camera_spec_weight_grams_check CHECK ((weight_grams > 0)),
    CONSTRAINT camera_spec_width_mm_check CHECK ((width_mm > (0)::double precision))
);

CREATE TABLE public.city (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    "position" integer NOT NULL
);

CREATE TABLE public.lens_spec (
    model_id uuid CONSTRAINT lens_specs_model_id_not_null NOT NULL,
    focal_min_mm real CONSTRAINT lens_specs_focal_min_mm_not_null NOT NULL,
    focal_max_mm real CONSTRAINT lens_specs_focal_max_mm_not_null NOT NULL,
    max_aperture real CONSTRAINT lens_specs_max_aperture_not_null NOT NULL,
    has_stabilization boolean DEFAULT false CONSTRAINT lens_specs_has_stabilization_not_null NOT NULL,
    filter_thread_mm smallint,
    weight_grams smallint,
    diameter_mm real,
    length_mm real,
    CONSTRAINT lens_spec_diameter_mm_check CHECK ((diameter_mm > (0)::double precision)),
    CONSTRAINT lens_spec_focal_range_check CHECK ((focal_max_mm >= focal_min_mm)),
    CONSTRAINT lens_spec_length_mm_check CHECK ((length_mm > (0)::double precision)),
    CONSTRAINT lens_spec_weight_grams_check CHECK ((weight_grams > 0))
);

CREATE TABLE public.listing (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT listings_id_not_null NOT NULL,
    seller_id uuid CONSTRAINT listings_seller_id_not_null NOT NULL,
    description text,
    price_cents integer,
    status public.listing_status DEFAULT 'draft'::public.listing_status CONSTRAINT listings_status_not_null NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT listings_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT listings_updated_at_not_null NOT NULL,
    contact_email text,
    contact_phone text,
    city_id uuid,
    CONSTRAINT listing_active_complete_check CHECK (((status <> 'active'::public.listing_status) OR ((price_cents IS NOT NULL) AND (city_id IS NOT NULL)))),
    CONSTRAINT listing_price_cents_check CHECK ((price_cents >= 0)),
    CONSTRAINT listing_published_check CHECK (((status <> 'active'::public.listing_status) OR (published_at IS NOT NULL)))
);

CREATE TABLE public.listing_inclusion (
    inclusion public.inclusion CONSTRAINT listing_inclusions_inclusion_not_null NOT NULL,
    listing_item_id uuid NOT NULL
);

CREATE TABLE public.listing_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    model_id uuid,
    price_cents integer,
    cosmetic_condition public.cosmetic_condition NOT NULL,
    functional_condition public.functional_condition NOT NULL,
    shutter_count integer,
    sold_separately boolean DEFAULT true NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_name text,
    custom_category public.model_category,
    CONSTRAINT listing_item_model_or_custom_check CHECK ((((model_id IS NOT NULL) AND (custom_name IS NULL) AND (custom_category IS NULL)) OR ((model_id IS NULL) AND (length(btrim(custom_name)) > 0) AND (custom_category IS NOT NULL)))),
    CONSTRAINT listing_item_position_check CHECK (("position" >= 0)),
    CONSTRAINT listing_item_price_cents_check CHECK ((price_cents >= 0)),
    CONSTRAINT listing_item_shutter_count_check CHECK ((shutter_count >= 0))
);

CREATE TABLE public.listing_photo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    storage_key text NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT listing_photo_position_check CHECK (("position" >= 0))
);

CREATE TABLE public.model (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT models_id_not_null NOT NULL,
    category public.model_category CONSTRAINT models_category_not_null NOT NULL,
    brand_id uuid CONSTRAINT models_brand_id_not_null NOT NULL,
    mount_id uuid,
    name text CONSTRAINT models_name_not_null NOT NULL,
    slug text CONSTRAINT models_slug_not_null NOT NULL,
    release_year smallint,
    display_name text CONSTRAINT models_display_name_not_null NOT NULL,
    normalized text GENERATED ALWAYS AS (lower(regexp_replace(display_name, '[^a-zA-Z0-9 ]'::text, ''::text, 'g'::text))) STORED
);

CREATE TABLE public.mount (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT mounts_id_not_null NOT NULL,
    slug text CONSTRAINT mounts_slug_not_null NOT NULL,
    name text CONSTRAINT mounts_name_not_null NOT NULL,
    brand_id uuid
);

CREATE TABLE public.session (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT sessions_id_not_null NOT NULL,
    user_id uuid CONSTRAINT sessions_user_id_not_null NOT NULL,
    expires_at timestamp with time zone CONSTRAINT sessions_expires_at_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT sessions_created_at_not_null NOT NULL
);

CREATE TABLE public.store (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT users_id_not_null NOT NULL,
    email text CONSTRAINT users_email_not_null NOT NULL,
    display_name text CONSTRAINT users_display_name_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT users_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT users_updated_at_not_null NOT NULL,
    phone text,
    password_hash text NOT NULL,
    city_id uuid
);

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT brand_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT brand_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.camera_spec
    ADD CONSTRAINT camera_spec_pkey PRIMARY KEY (model_id);

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.lens_spec
    ADD CONSTRAINT lens_spec_pkey PRIMARY KEY (model_id);

ALTER TABLE ONLY public.listing_inclusion
    ADD CONSTRAINT listing_inclusion_pkey PRIMARY KEY (listing_item_id, inclusion);

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_listing_id_position_key UNIQUE (listing_id, "position") DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.listing_photo
    ADD CONSTRAINT listing_photo_listing_id_position_key UNIQUE (listing_id, "position");

ALTER TABLE ONLY public.listing_photo
    ADD CONSTRAINT listing_photo_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.listing_photo
    ADD CONSTRAINT listing_photo_storage_key_key UNIQUE (storage_key);

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_brand_id_name_mount_id_key UNIQUE NULLS NOT DISTINCT (brand_id, name, mount_id);

ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.mount
    ADD CONSTRAINT mount_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.mount
    ADD CONSTRAINT mount_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_user_id_key UNIQUE (user_id);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);

CREATE INDEX listing_city_id_idx ON public.listing USING btree (city_id);

CREATE INDEX listing_item_model_id_idx ON public.listing_item USING btree (model_id);

CREATE INDEX listing_seller_id_idx ON public.listing USING btree (seller_id);

CREATE INDEX listing_status_published_at_idx ON public.listing USING btree (status, published_at DESC);

CREATE INDEX model_brand_id_idx ON public.model USING btree (brand_id);

CREATE INDEX model_category_idx ON public.model USING btree (category);

CREATE INDEX model_mount_id_idx ON public.model USING btree (mount_id);

CREATE INDEX model_normalized_trgm_idx ON public.model USING gin (normalized public.gin_trgm_ops);

CREATE INDEX session_expires_at_idx ON public.session USING btree (expires_at);

CREATE INDEX session_user_id_idx ON public.session USING btree (user_id);

ALTER TABLE ONLY public.camera_spec
    ADD CONSTRAINT camera_spec_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.lens_spec
    ADD CONSTRAINT lens_spec_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.city(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.listing_inclusion
    ADD CONSTRAINT listing_inclusion_listing_item_id_fkey FOREIGN KEY (listing_item_id) REFERENCES public.listing_item(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listing(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.listing_item
    ADD CONSTRAINT listing_item_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.listing_photo
    ADD CONSTRAINT listing_photo_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listing(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brand(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.model
    ADD CONSTRAINT model_mount_id_fkey FOREIGN KEY (mount_id) REFERENCES public.mount(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.mount
    ADD CONSTRAINT mount_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brand(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.city(id) ON DELETE RESTRICT;

