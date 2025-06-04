--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: model; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA model;


ALTER SCHEMA model OWNER TO postgres;

--
-- Name: statistique; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA statistique;


ALTER SCHEMA statistique OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abonnement; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.abonnement (
    id integer NOT NULL,
    libelle character varying NOT NULL,
    prix numeric NOT NULL,
    role character varying NOT NULL
);


ALTER TABLE model.abonnement OWNER TO postgres;

--
-- Name: abonnement_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.abonnement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.abonnement_id_seq OWNER TO postgres;

--
-- Name: abonnement_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.abonnement_id_seq OWNED BY model.abonnement.id;


--
-- Name: animal_food_history; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.animal_food_history (
    id integer NOT NULL,
    idanimal integer NOT NULL,
    food character varying(50) NOT NULL,
    datemodification date NOT NULL
);


ALTER TABLE model.animal_food_history OWNER TO postgres;

--
-- Name: animal_food_history_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.animal_food_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.animal_food_history_id_seq OWNER TO postgres;

--
-- Name: animal_food_history_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.animal_food_history_id_seq OWNED BY model.animal_food_history.id;


--
-- Name: animal_food_quantity_history; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.animal_food_quantity_history (
    id integer NOT NULL,
    idanimal integer NOT NULL,
    quantity double precision NOT NULL,
    datemodification date NOT NULL,
    unity character varying
);


ALTER TABLE model.animal_food_quantity_history OWNER TO postgres;

--
-- Name: animal_food_quantity_history_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.animal_food_quantity_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.animal_food_quantity_history_id_seq OWNER TO postgres;

--
-- Name: animal_food_quantity_history_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.animal_food_quantity_history_id_seq OWNED BY model.animal_food_quantity_history.id;


--
-- Name: animal_poids_history; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.animal_poids_history (
    id integer NOT NULL,
    idanimal integer NOT NULL,
    poids double precision NOT NULL,
    datemodification date NOT NULL
);


ALTER TABLE model.animal_poids_history OWNER TO postgres;

--
-- Name: animal_poids_history_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.animal_poids_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.animal_poids_history_id_seq OWNER TO postgres;

--
-- Name: animal_poids_history_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.animal_poids_history_id_seq OWNED BY model.animal_poids_history.id;


--
-- Name: animal_taille_history; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.animal_taille_history (
    id integer NOT NULL,
    idanimal integer NOT NULL,
    taille double precision NOT NULL,
    datemodification date NOT NULL
);


ALTER TABLE model.animal_taille_history OWNER TO postgres;

--
-- Name: animal_taille_history_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.animal_taille_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.animal_taille_history_id_seq OWNER TO postgres;

--
-- Name: animal_taille_history_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.animal_taille_history_id_seq OWNED BY model.animal_taille_history.id;


--
-- Name: animals_body_picture; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.animals_body_picture (
    id integer NOT NULL,
    filename text NOT NULL,
    date_enregistrement date,
    idanimal integer
);


ALTER TABLE model.animals_body_picture OWNER TO postgres;

--
-- Name: animals_body_picture_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.animals_body_picture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.animals_body_picture_id_seq OWNER TO postgres;

--
-- Name: animals_body_picture_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.animals_body_picture_id_seq OWNED BY model.animals_body_picture.id;


--
-- Name: animals_picture; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.animals_picture (
    id integer NOT NULL,
    filename text NOT NULL,
    idanimal integer
);


ALTER TABLE model.animals_picture OWNER TO postgres;

--
-- Name: animals_picture_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.animals_picture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.animals_picture_id_seq OWNER TO postgres;

--
-- Name: animals_picture_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.animals_picture_id_seq OWNED BY model.animals_picture.id;


--
-- Name: balade; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.balade (
    id integer NOT NULL,
    lieu character varying(100),
    commentaire character varying(200),
    datedebut timestamp without time zone,
    datefin timestamp without time zone
);


ALTER TABLE model.balade OWNER TO postgres;

--
-- Name: balade_equides; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.balade_equides (
    idbalade integer,
    idequide text
);


ALTER TABLE model.balade_equides OWNER TO postgres;

--
-- Name: balade_gps; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.balade_gps (
    idbalade integer,
    gps character varying(50),
    dategps timestamp without time zone
);


ALTER TABLE model.balade_gps OWNER TO postgres;

--
-- Name: balade_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.balade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.balade_id_seq OWNER TO postgres;

--
-- Name: balade_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.balade_id_seq OWNED BY model.balade.id;


--
-- Name: concours; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.concours (
    id integer NOT NULL,
    nom character varying(50) NOT NULL,
    dateconcours date NOT NULL,
    lieu character varying(50),
    discipline character varying(50),
    niveau character varying(20),
    dossard character varying(20),
    commentaire character varying(150),
    placement integer
);


ALTER TABLE model.concours OWNER TO postgres;

--
-- Name: concours_equides; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.concours_equides (
    idconcours integer,
    idequide text
);


ALTER TABLE model.concours_equides OWNER TO postgres;

--
-- Name: concours_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.concours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.concours_id_seq OWNER TO postgres;

--
-- Name: concours_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.concours_id_seq OWNED BY model.concours.id;


--
-- Name: contact; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.contact (
    id integer NOT NULL,
    nom character varying(50) NOT NULL,
    profession character varying(50),
    telephone character varying(50),
    email character varying(50),
    emailproprietaire character varying(100) NOT NULL
);


ALTER TABLE model.contact OWNER TO postgres;

--
-- Name: contact_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.contact_id_seq OWNER TO postgres;

--
-- Name: contact_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.contact_id_seq OWNED BY model.contact.id;


--
-- Name: entrainement; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.entrainement (
    id integer NOT NULL,
    dateentrainement date NOT NULL,
    lieu character varying(50),
    discipline character varying(50),
    commentaire character varying(200),
    note integer
);


ALTER TABLE model.entrainement OWNER TO postgres;

--
-- Name: entrainement_equides; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.entrainement_equides (
    identrainement integer,
    idequide text
);


ALTER TABLE model.entrainement_equides OWNER TO postgres;

--
-- Name: entrainement_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.entrainement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.entrainement_id_seq OWNER TO postgres;

--
-- Name: entrainement_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.entrainement_id_seq OWNED BY model.entrainement.id;


--
-- Name: equide; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.equide (
    id integer NOT NULL,
    nom character varying(50) NOT NULL,
    datenaissance date,
    race character varying(50),
    taille double precision,
    poids double precision,
    sexe character varying(50),
    robe character varying(50),
    nompere character varying(50),
    nommere character varying(50),
    espece character varying(50),
    quantity double precision,
    food character varying(50),
    email character varying(100) NOT NULL,
    numeroidentification text,
    datedeces date,
    informations text,
    datearrivee date,
    datedepart date,
    unity character varying
);


ALTER TABLE model.equide OWNER TO postgres;

--
-- Name: equide_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.equide_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.equide_id_seq OWNER TO postgres;

--
-- Name: equide_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.equide_id_seq OWNED BY model.equide.id;


--
-- Name: event; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.event (
    id integer NOT NULL,
    nom character varying(100),
    dateevent date,
    eventtype character varying(100),
    lieu character varying(100),
    specialiste character varying(100),
    depense numeric,
    heuredebutbalade character varying(100),
    datefinbalade date,
    heurefinbalade character varying(100),
    discipline character varying(100),
    note numeric,
    epreuve character varying(100),
    dossart character varying(100),
    placement character varying(100),
    traitement character varying(100),
    datefinsoins date,
    commentaire text,
    state character varying(20) DEFAULT 'À faire'::character varying NOT NULL,
    todisplay boolean DEFAULT true NOT NULL,
    frequencetype character varying(20),
    frequencevalue character varying(20),
    categoriedepense character varying(50),
    heuredebutevent character varying(20),
    idparent integer,
    optionnotification character varying,
    rappelnotification character varying
);


ALTER TABLE model.event OWNER TO postgres;

--
-- Name: event_animal; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.event_animal (
    idevent integer NOT NULL,
    idanimal integer NOT NULL
);


ALTER TABLE model.event_animal OWNER TO postgres;

--
-- Name: event_document; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.event_document (
    filename text NOT NULL,
    idevent integer NOT NULL
);


ALTER TABLE model.event_document OWNER TO postgres;

--
-- Name: event_group_shares; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.event_group_shares (
    id integer NOT NULL,
    event_id integer NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE model.event_group_shares OWNER TO postgres;

--
-- Name: event_group_shares_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.event_group_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.event_group_shares_id_seq OWNER TO postgres;

--
-- Name: event_group_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.event_group_shares_id_seq OWNED BY model.event_group_shares.id;


--
-- Name: event_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.event_id_seq OWNER TO postgres;

--
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.event_id_seq OWNED BY model.event.id;


--
-- Name: group_animal_shares; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.group_animal_shares (
    id integer NOT NULL,
    group_id integer,
    animal_id integer,
    proposed_by integer,
    status text DEFAULT 'pending'::text,
    proposed_at timestamp without time zone DEFAULT now(),
    CONSTRAINT group_animal_shares_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text])))
);


ALTER TABLE model.group_animal_shares OWNER TO postgres;

--
-- Name: group_animal_shares_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.group_animal_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.group_animal_shares_id_seq OWNER TO postgres;

--
-- Name: group_animal_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.group_animal_shares_id_seq OWNED BY model.group_animal_shares.id;


--
-- Name: group_invitations; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.group_invitations (
    id integer NOT NULL,
    group_id integer,
    email text NOT NULL,
    status text DEFAULT 'pending'::text,
    invited_at timestamp without time zone DEFAULT now(),
    CONSTRAINT group_invitations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text])))
);


ALTER TABLE model.group_invitations OWNER TO postgres;

--
-- Name: group_invitations_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.group_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.group_invitations_id_seq OWNER TO postgres;

--
-- Name: group_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.group_invitations_id_seq OWNED BY model.group_invitations.id;


--
-- Name: group_members; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.group_members (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp without time zone DEFAULT now(),
    CONSTRAINT group_members_role_check CHECK ((role = ANY (ARRAY['manager'::text, 'member'::text])))
);


ALTER TABLE model.group_members OWNER TO postgres;

--
-- Name: groups; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.groups (
    id integer NOT NULL,
    name text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE model.groups OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.groups_id_seq OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.groups_id_seq OWNED BY model.groups.id;


--
-- Name: note; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.note (
    id integer NOT NULL,
    titre character varying(50) NOT NULL,
    note text NOT NULL,
    email character varying(100) NOT NULL
);


ALTER TABLE model.note OWNER TO postgres;

--
-- Name: note_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.note_id_seq OWNER TO postgres;

--
-- Name: note_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.note_id_seq OWNED BY model.note.id;


--
-- Name: notification; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.notification (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    object_id integer NOT NULL,
    object_type character varying NOT NULL,
    event_date timestamp with time zone NOT NULL,
    title character varying NOT NULL,
    body character varying NOT NULL,
    type_event character varying
);


ALTER TABLE model.notification OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.notification_id_seq OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.notification_id_seq OWNED BY model.notification.id;


--
-- Name: objectif_group_shares; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.objectif_group_shares (
    id integer NOT NULL,
    objectif_id integer NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE model.objectif_group_shares OWNER TO postgres;

--
-- Name: objectif_group_shares_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.objectif_group_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.objectif_group_shares_id_seq OWNER TO postgres;

--
-- Name: objectif_group_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.objectif_group_shares_id_seq OWNED BY model.objectif_group_shares.id;


--
-- Name: objectifs; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.objectifs (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    temporality character varying(100),
    datedebut timestamp without time zone NOT NULL,
    datefin timestamp without time zone NOT NULL,
    is_shared_objectif boolean DEFAULT false
);


ALTER TABLE model.objectifs OWNER TO postgres;

--
-- Name: objectifs_animals; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.objectifs_animals (
    idobjectif integer,
    idanimal integer
);


ALTER TABLE model.objectifs_animals OWNER TO postgres;

--
-- Name: objectifs_etapes; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.objectifs_etapes (
    idobjectif integer NOT NULL,
    etape text NOT NULL,
    id integer NOT NULL,
    state boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE model.objectifs_etapes OWNER TO postgres;

--
-- Name: objectifs_etapes_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.objectifs_etapes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.objectifs_etapes_id_seq OWNER TO postgres;

--
-- Name: objectifs_etapes_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.objectifs_etapes_id_seq OWNED BY model.objectifs_etapes.id;


--
-- Name: objectifs_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.objectifs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.objectifs_id_seq OWNER TO postgres;

--
-- Name: objectifs_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.objectifs_id_seq OWNED BY model.objectifs.id;


--
-- Name: rdv; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.rdv (
    id integer NOT NULL,
    daterdv date NOT NULL,
    specialiste character varying(50),
    lieu character varying(50),
    depense double precision,
    commentaire character varying(200)
);


ALTER TABLE model.rdv OWNER TO postgres;

--
-- Name: rdv_equides; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.rdv_equides (
    idequide text,
    idrdv integer
);


ALTER TABLE model.rdv_equides OWNER TO postgres;

--
-- Name: rdv_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.rdv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.rdv_id_seq OWNER TO postgres;

--
-- Name: rdv_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.rdv_id_seq OWNED BY model.rdv.id;


--
-- Name: user; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model."user" (
    email character varying(80) NOT NULL,
    prenom character varying(20) NOT NULL,
    id integer NOT NULL,
    expotoken character varying(100),
    timezone character varying
);


ALTER TABLE model."user" OWNER TO postgres;

--
-- Name: user_abonnement; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.user_abonnement (
    id_abonnement integer NOT NULL,
    id_user integer NOT NULL,
    date_debut date,
    date_fin date
);


ALTER TABLE model.user_abonnement OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.user_id_seq OWNED BY model."user".id;


--
-- Name: users_picture; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.users_picture (
    id integer NOT NULL,
    filename text NOT NULL,
    id_user integer NOT NULL
);


ALTER TABLE model.users_picture OWNER TO postgres;

--
-- Name: users_picture_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.users_picture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.users_picture_id_seq OWNER TO postgres;

--
-- Name: users_picture_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.users_picture_id_seq OWNED BY model.users_picture.id;


--
-- Name: wish; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.wish (
    id integer NOT NULL,
    nom character varying(50) NOT NULL,
    url text,
    prix numeric,
    destinataire character varying(50),
    email character varying(100) NOT NULL,
    acquis boolean DEFAULT false
);


ALTER TABLE model.wish OWNER TO postgres;

--
-- Name: wish_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.wish_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.wish_id_seq OWNER TO postgres;

--
-- Name: wish_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.wish_id_seq OWNED BY model.wish.id;


--
-- Name: wish_picture; Type: TABLE; Schema: model; Owner: postgres
--

CREATE TABLE model.wish_picture (
    id integer NOT NULL,
    filename text NOT NULL,
    idwish integer NOT NULL
);


ALTER TABLE model.wish_picture OWNER TO postgres;

--
-- Name: wish_picture_id_seq; Type: SEQUENCE; Schema: model; Owner: postgres
--

CREATE SEQUENCE model.wish_picture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE model.wish_picture_id_seq OWNER TO postgres;

--
-- Name: wish_picture_id_seq; Type: SEQUENCE OWNED BY; Schema: model; Owner: postgres
--

ALTER SEQUENCE model.wish_picture_id_seq OWNED BY model.wish_picture.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: abonnement id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.abonnement ALTER COLUMN id SET DEFAULT nextval('model.abonnement_id_seq'::regclass);


--
-- Name: animal_food_history id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_food_history ALTER COLUMN id SET DEFAULT nextval('model.animal_food_history_id_seq'::regclass);


--
-- Name: animal_food_quantity_history id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_food_quantity_history ALTER COLUMN id SET DEFAULT nextval('model.animal_food_quantity_history_id_seq'::regclass);


--
-- Name: animal_poids_history id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_poids_history ALTER COLUMN id SET DEFAULT nextval('model.animal_poids_history_id_seq'::regclass);


--
-- Name: animal_taille_history id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_taille_history ALTER COLUMN id SET DEFAULT nextval('model.animal_taille_history_id_seq'::regclass);


--
-- Name: animals_body_picture id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animals_body_picture ALTER COLUMN id SET DEFAULT nextval('model.animals_body_picture_id_seq'::regclass);


--
-- Name: animals_picture id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animals_picture ALTER COLUMN id SET DEFAULT nextval('model.animals_picture_id_seq'::regclass);


--
-- Name: balade id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.balade ALTER COLUMN id SET DEFAULT nextval('model.balade_id_seq'::regclass);


--
-- Name: concours id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.concours ALTER COLUMN id SET DEFAULT nextval('model.concours_id_seq'::regclass);


--
-- Name: contact id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.contact ALTER COLUMN id SET DEFAULT nextval('model.contact_id_seq'::regclass);


--
-- Name: entrainement id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.entrainement ALTER COLUMN id SET DEFAULT nextval('model.entrainement_id_seq'::regclass);


--
-- Name: equide id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.equide ALTER COLUMN id SET DEFAULT nextval('model.equide_id_seq'::regclass);


--
-- Name: event id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event ALTER COLUMN id SET DEFAULT nextval('model.event_id_seq'::regclass);


--
-- Name: event_group_shares id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_group_shares ALTER COLUMN id SET DEFAULT nextval('model.event_group_shares_id_seq'::regclass);


--
-- Name: group_animal_shares id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_animal_shares ALTER COLUMN id SET DEFAULT nextval('model.group_animal_shares_id_seq'::regclass);


--
-- Name: group_invitations id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_invitations ALTER COLUMN id SET DEFAULT nextval('model.group_invitations_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.groups ALTER COLUMN id SET DEFAULT nextval('model.groups_id_seq'::regclass);


--
-- Name: note id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.note ALTER COLUMN id SET DEFAULT nextval('model.note_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.notification ALTER COLUMN id SET DEFAULT nextval('model.notification_id_seq'::regclass);


--
-- Name: objectif_group_shares id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectif_group_shares ALTER COLUMN id SET DEFAULT nextval('model.objectif_group_shares_id_seq'::regclass);


--
-- Name: objectifs id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectifs ALTER COLUMN id SET DEFAULT nextval('model.objectifs_id_seq'::regclass);


--
-- Name: objectifs_etapes id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectifs_etapes ALTER COLUMN id SET DEFAULT nextval('model.objectifs_etapes_id_seq'::regclass);


--
-- Name: rdv id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.rdv ALTER COLUMN id SET DEFAULT nextval('model.rdv_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model."user" ALTER COLUMN id SET DEFAULT nextval('model.user_id_seq'::regclass);


--
-- Name: users_picture id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.users_picture ALTER COLUMN id SET DEFAULT nextval('model.users_picture_id_seq'::regclass);


--
-- Name: wish id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.wish ALTER COLUMN id SET DEFAULT nextval('model.wish_id_seq'::regclass);


--
-- Name: wish_picture id; Type: DEFAULT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.wish_picture ALTER COLUMN id SET DEFAULT nextval('model.wish_picture_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Data for Name: abonnement; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.abonnement (id, libelle, prix, role) FROM stdin;
1	Free	0	user
2	Premium	5	premium
\.


--
-- Data for Name: animal_food_history; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.animal_food_history (id, idanimal, food, datemodification) FROM stdin;
2	244	Katz	2025-02-23
3	244	Katz2	2025-02-23
4	244	Katz	2025-02-23
1	155	Croquettes	2025-02-19
5	242	Croquettes pour chat 	2025-05-01
\.


--
-- Data for Name: animal_food_quantity_history; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.animal_food_quantity_history (id, idanimal, quantity, datemodification, unity) FROM stdin;
1	165	0.5	2025-02-19	\N
3	244	200	2025-02-23	\N
4	244	500	2025-02-23	\N
5	244	100	2025-02-23	\N
2	155	400	2025-02-19	\N
6	242	2	2025-04-22	\N
7	166	5	2025-04-22	\N
8	166	3	2025-04-22	\N
9	188	3	2025-04-22	\N
10	245	100	2025-04-23	\N
11	245	100	2025-04-23	\N
12	245	100	2025-04-23	\N
13	245	100	2025-04-23	\N
14	245	100	2025-04-23	\N
15	245	100	2025-04-23	\N
16	245	100	2025-04-23	milligramme
17	242	20	2025-05-01	gramme
19	245	100	2025-05-01	mL 
20	244	0.5	2025-05-01	kg
\.


--
-- Data for Name: animal_poids_history; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.animal_poids_history (id, idanimal, poids, datemodification) FROM stdin;
5	158	4.1	2025-02-19
6	157	6	2025-02-19
7	140	400	2025-02-19
8	175	6	2025-02-19
9	155	400	2025-02-19
11	244	50	2025-02-23
12	244	5	2025-02-23
10	244	20	2025-03-01
21	155	472	2025-04-05
22	155	555	2025-05-31
23	155	600	2025-06-13
24	155	470	2025-09-12
25	155	689	2025-07-30
26	155	700	2025-08-27
27	155	499	2025-10-04
28	155	427	2025-11-19
29	155	385	2025-12-23
20	155	375	2025-03-01
15	155	450	2025-03-03
31	242	5.8	2025-05-01
\.


--
-- Data for Name: animal_taille_history; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.animal_taille_history (id, idanimal, taille, datemodification) FROM stdin;
1	140	140	2025-02-19
2	175	30	2025-02-19
4	155	150	2025-02-20
5	155	150	2025-02-20
6	155	150	2025-02-23
7	155	160	2025-02-23
8	155	170	2025-02-23
9	155	180	2025-02-23
10	155	190	2025-02-23
11	155	200	2025-02-23
12	155	210	2025-02-23
13	155	220	2025-02-23
14	155	230	2025-02-23
15	155	240	2025-02-23
16	155	250	2025-02-23
17	155	260	2025-02-23
18	155	270	2025-02-23
19	155	280	2025-02-23
20	155	290	2025-02-23
21	155	300	2025-02-23
22	155	310	2025-02-23
23	155	320	2025-02-23
24	155	330	2025-02-23
25	155	340	2025-02-23
26	155	350	2025-02-23
27	155	360	2025-02-23
28	155	370	2025-02-23
29	155	380	2025-02-23
34	155	390	2025-02-23
35	155	400	2025-02-23
36	155	80	2025-02-23
37	155	150	2025-02-23
39	245	140	2025-02-23
40	244	50	2025-02-23
41	245	160	2025-02-23
42	244	60	2025-02-23
43	155	300	2025-02-23
44	244	80	2025-02-23
45	244	60	2025-02-23
46	244	300	2025-02-23
47	155	10	2025-02-23
49	155	58	2025-02-23
50	244	10	2025-02-23
52	245	200	2025-02-23
53	244	500	2025-02-23
54	244	100	2025-02-23
55	245	50	2025-02-23
56	155	210	2025-02-23
57	244	110	2025-02-23
58	245	140	2025-02-23
59	244	50	2025-02-23
3	155	130	2025-02-19
61	242	30	2025-05-01
\.


--
-- Data for Name: animals_body_picture; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.animals_body_picture (id, filename, date_enregistrement, idanimal) FROM stdin;
\.


--
-- Data for Name: animals_picture; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.animals_picture (id, filename, idanimal) FROM stdin;
84	0B6902A2-769A-4044-9329-BFB5447249DC.jpg	176
85	B3ECF6F0-E9FA-47CC-A01C-2313D30AA817.jpg	177
83	BB9D27E6-402E-4210-9514-686191500F97.jpg	175
73	3CE073D1-4900-4E08-A723-EC00BA0051E6.jpg	165
86	8E15849F-C52C-4310-BD45-5CF0654BD16E.jpg	188
77	6221B48C-3FEA-4DFF-9B23-0CB6998F94F2.jpg	166
89	FF82865C-1122-4579-B2DF-DAC496222FB0.jpg	155
90	1747935E-2028-4ADF-8DAA-F618D6B443FF.jpg	244
91	3E256E71-03C4-424D-BFC9-950FB3114227.jpg	245
88	70E46ADD-CA6A-4847-B96B-3CF41CAFB70C.jpg	242
\.


--
-- Data for Name: balade; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.balade (id, lieu, commentaire, datedebut, datefin) FROM stdin;
\.


--
-- Data for Name: balade_equides; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.balade_equides (idbalade, idequide) FROM stdin;
\.


--
-- Data for Name: balade_gps; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.balade_gps (idbalade, gps, dategps) FROM stdin;
\.


--
-- Data for Name: concours; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.concours (id, nom, dateconcours, lieu, discipline, niveau, dossard, commentaire, placement) FROM stdin;
\.


--
-- Data for Name: concours_equides; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.concours_equides (idconcours, idequide) FROM stdin;
\.


--
-- Data for Name: contact; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.contact (id, nom, profession, telephone, email, emailproprietaire) FROM stdin;
17	Joe	Veto 	0603040507	\N	vasco.app@yopmail.com
19	Romain 	Dev	0621338556	\N	vasco.app@yopmail.com
20	Essai contacts 	\N	754367544	\N	vasco.app@yopmail.com
18	Test 	\N	0621887944	\N	romain.fievezjr@gmail.com
23	rest 	tec 	06112223334	\N	contact.vascoandco@gmail.com
24	szkut 	cln	0567064779	Golfs	contact.vascoandco@gmail.com
25	Uxljf	L val	09876532	\N	vascotest@yopmail.com
26	Test nom très très longggggggggggggffggf	Profession très très longueeeeeeeeeeee	0621887944	Test@gmaiiiiiiiiiiiiiiiiiil.commmmmmmmmmmmmm	adrien.lansing@gmail.com
28	Chantilly	Fin	36884369	\N	contact.vascoandco@gmail.com
29	Déc	Concernant	25578	\N	contact.vascoandco@gmail.com
30	Skiff	Ciccone	478954	\N	contact.vascoandco@gmail.com
27	Ggggggggggggggggg	\N	0621333333	\N	contact.vascoandco@gmail.com
22	Atttt2	Tttt	0606060595	\N	romain.fievezjr@gmail.com
\.


--
-- Data for Name: entrainement; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.entrainement (id, dateentrainement, lieu, discipline, commentaire, note) FROM stdin;
\.


--
-- Data for Name: entrainement_equides; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.entrainement_equides (identrainement, idequide) FROM stdin;
\.


--
-- Data for Name: equide; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.equide (id, nom, datenaissance, race, taille, poids, sexe, robe, nompere, nommere, espece, quantity, food, email, numeroidentification, datedeces, informations, datearrivee, datedepart, unity) FROM stdin;
158	Meringue 	2016-03-14	Bichon Maltais 	\N	4.1	Femelle 	Blanche 	\N	\N	Chien 	\N	\N	brigitte.delrue59@gmail.com	\N	\N	\N	\N	\N	\N
157	Hermès 	2017-04-13	\N	\N	6	Castre	\N	\N	\N	Chat	\N	\N	perrine1122@gmail.com	\N	\N	\N	\N	\N	\N
140	Vasco 	2009-01-01	Fjord	140	400	Hongre	Brunblack	Esgard	Sherry 	Cheval 	\N	\N	perrine1122@gmail.com	\N	\N	\N	\N	\N	\N
141	Prince	\N	\N	\N	\N	\N	\N	\N	\N	Cheval 	\N	\N	perrine1122@gmail.com	\N	\N	\N	\N	\N	\N
143	Sirius 	\N	\N	\N	\N	\N	\N	\N	\N	Chien 	\N	\N	perrine1122@gmail.com	\N	\N	\N	\N	\N	\N
176	Aaaa	2000-02-03	\N	\N	\N	\N	\N	\N	\N	Âne	\N	\N	vasco.app@yopmail.com	Dtjbggtf567	\N	\N	\N	\N	\N
177	Toutou 	2021-03-28	\N	\N	\N	\N	\N	\N	\N	Chien	\N	\N	vasco.app@yopmail.com	Trs466	\N	\N	\N	\N	\N
180	Noëlle 	2000-10-28	\N	\N	\N	\N	\N	\N	\N	Lapin	\N	\N	vasco.app@yopmail.com	\N	\N	\N	\N	\N	\N
175	Test	\N	\N	30	6	\N	\N	\N	\N	Chien	\N	\N	vasco.app@yopmail.com	\N	\N	\N	\N	\N	\N
200	Noëlle	2015-12-10	\N	\N	\N	\N	\N	\N	\N	Lapin	\N	\N	contact.vascoandco@gmail.com	\N	2024-12-07	\N	\N	\N	\N
204	Test	1998-08-22	\N	\N	\N	\N	\N	\N	\N	Poisson	\N	\N	vascotest@yopmail.com	\N	\N	\N	\N	\N	\N
206	UV	\N	\N	\N	\N	\N	\N	\N	\N	Chèvre	\N	\N	vascotest@yopmail.com	\N	2024-12-13	\N	\N	\N	\N
188	Soja du moulin de la Terrasse 	\N	\N	\N	\N	\N	\N	\N	\N	Chien	\N	\N	contact.vascoandco@gmail.com	\N	2024-12-01	\N	\N	\N	\N
166	Petit Prince 	\N	\N	\N	\N	\N	\N	\N	\N	Chevaux	\N	\N	contact.vascoandco@gmail.com	\N	\N	\N	\N	\N	\N
165	Vasco du val d’Allery	2009-01-01	\N	\N	\N	\N	\N	\N	\N	Cheval	0.5	\N	contact.vascoandco@gmail.com	\N	\N	\N	\N	\N	\N
208	Test	\N	\N	\N	\N	\N	\N	\N	\N	Chien	\N	\N	adrien.lansing@gmail.com	\N	\N	\N	\N	\N	\N
209	Jhhh	\N	\N	\N	\N	\N	\N	\N	\N	Chat	\N	\N	adrien.lansing@gmail.com	\N	\N	\N	\N	\N	\N
210	Aaaa	\N	\N	\N	\N	\N	\N	\N	\N	Lapin	\N	\N	adrien.lansing@gmail.com	\N	\N	\N	\N	\N	\N
239	Bbbbb	\N	\N	\N	\N	\N	\N	\N	\N	Lapin	\N	\N	adrien.lansing@gmail.com	\N	\N	\N	\N	\N	\N
240	Ccccc	\N	\N	\N	\N	\N	\N	\N	\N	Furet	\N	\N	adrien.lansing@gmail.com	\N	\N	\N	\N	\N	\N
241	Dddd	\N	\N	\N	\N	\N	\N	\N	\N	Oiseaux	\N	\N	adrien.lansing@gmail.com	\N	\N	\N	\N	\N	\N
243	Test	\N	\N	\N	\N	\N	\N	\N	\N	Chien	\N	\N	touzay.celia@gmail.com	\N	\N	\N	\N	\N	\N
244	Sirius 	\N	\N	\N	\N	\N	\N	\N	\N	Chien	\N	\N	romain.fievezjr@gmail.com	\N	\N	Teubé\nTest\nTest\nTedt\nTest\nTest\nTedt\nTedt	2021-01-01	\N	\N
245	Hermès 	\N	\N	140	\N	\N	\N	\N	\N	Chat	\N	\N	romain.fievezjr@gmail.com	\N	\N	\N	\N	\N	\N
242	Hermès 	\N	\N	\N	\N	\N	\N	\N	\N	Chat	\N	\N	contact.vascoandco@gmail.com	\N	\N	Problème cardiaque 	\N	\N	\N
155	Vasco du val d’allery	\N	\N	140	400	\N	\N	\N	\N	Poney	300	Foin	romain.fievezjr@gmail.com	\N	2025-03-14	\N	\N	\N	\N
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.event (id, nom, dateevent, eventtype, lieu, specialiste, depense, heuredebutbalade, datefinbalade, heurefinbalade, discipline, note, epreuve, dossart, placement, traitement, datefinsoins, commentaire, state, todisplay, frequencetype, frequencevalue, categoriedepense, heuredebutevent, idparent, optionnotification, rappelnotification) FROM stdin;
430	Test validé 	2024-09-22	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Cheval	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1005	Soin yeux 👀	2024-10-30	soins	Test 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-02	\N	À faire	t	\N	tlj	\N	\N	1003	\N	\N
438	Sirius fait des bêtises 	2024-09-22	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Soûlant \n	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
436	Coupe griffe 	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Aucun 	2024-09-23	Ok\n	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
434	Beauté 	2024-09-22	concours	\N	\N	\N	\N	\N	\N	Concours beauté 	\N	\N	\N	\N	\N	2024-09-23	Truc 	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
432	Cc	2024-09-22	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Test 	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
437	Croquette 	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Truc 	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
435	Veto 	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Chose	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
813	Rdv vétérinaire 	2024-10-05	rdv	\N	\N	100	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1003	Soin yeux 👀	2024-10-28	soins	Test 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-02	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1007	Soin yeux 👀	2024-11-01	soins	Test 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-02	\N	À faire	t	\N	tlj	\N	\N	1003	\N	\N
590	Test	2024-09-24	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
622	Test 	2024-09-23	soins	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	Panacur	2024-09-22	\N	Terminé	t	\N	tlj	\N	\N	621	\N	\N
621	Test 	2024-09-22	soins	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	Panacur	2024-09-22	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
241	Test	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
171	Iii	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
170	Testaaa	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
1037	Fin	2024-11-14	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1195	Test	2024-12-17	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
821	Test	2024-10-18	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	19h45	\N	\N	\N
1198	Yyyy	2024-12-17	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1006	Soin yeux 👀	2024-10-31	soins	Test 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-02	\N	À faire	t	\N	tlj	\N	\N	1003	\N	\N
1008	Soin yeux 👀	2024-11-02	soins	Test 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-11-02	\N	À faire	t	\N	tlj	\N	\N	1003	\N	\N
169	Test dépense 	2024-09-22	depense	\N	\N	18	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
249	Test	2024-09-22	concours	\N	\N	\N	\N	\N	\N	Ppp	\N	\N	\N	\N	\N	2024-09-23	\N	À faire	t	\N	\N	\N	\N	\N	\N	\N
309	Toilettage 	2024-09-22	autre	Thiverny 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	À faire	t	\N	tlj	\N	14h0	\N	\N	\N
255	Equifeel Partage 	2024-09-22	entrainement	\N	\N	\N	\N	\N	\N	Equifeel 	4	\N	\N	\N	\N	2024-09-23	Séance 	Terminé	t	\N	\N	\N	\N	\N	\N	\N
310	Vétérinaire 	2024-09-22	rdv	Vetaren	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	À faire	t	\N	tlj	\N	15h22	\N	\N	\N
225	Uuuu	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Yyyy	2024-09-23	\N	À faire	t	\N	\N	\N	\N	\N	\N	\N
227	Petit tour jusque chez Anne et Vic	2024-09-22	balade	Chantilly 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
265	C	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	C	2024-09-23	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
266	C	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	C	2024-09-23	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
267	C	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	C	2024-09-23	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
311	Croquettes 	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Prix chez Truffaut 33 euros 	À faire	t	\N	tlj	\N	\N	\N	\N	\N
228	Anti insectes 	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Emouchine 	2024-09-23	\N	À faire	t	days		\N	\N	\N	\N	\N
229	Anti insectes 	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Emouchine 	2024-09-23	\N	Terminé	t	days		\N	\N	\N	\N	\N
1147	2 	2024-12-13	depense	Jung	\N	56	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	20h05	\N	\N	\N
231	Entraînement spectacle 	2024-09-22	entrainement	Ranch Equin Serein	\N	0	\N	\N	\N	Spectacle 	5	\N	\N	\N	\N	2024-09-23	Super à l’écoute et léger c’était top\n	Terminé	t	\N	\N	\N	\N	\N	\N	\N
232	Vermifuge 	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Eqvalan	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
174	A	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	À faire	t	\N	\N	\N	\N	\N	\N	\N
184	Vaccin	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
183	Bbbb	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
306	Répétition spectacle et dressage 	2024-09-22	entrainement	Ranch	\N	\N	\N	\N	\N	Liberté et dressage	4	\N	\N	\N	\N	2024-09-23	Un Vasco qui n’a pas voulu faire la valse au trot en liberté sinon top et monté juste trop d’énergie sur certains trot et pas possible au galop 	Terminé	t	\N	tlj	\N	18h15	\N	\N	\N
1208	Location pré 	2025-01-19	depense	\N	\N	475	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	garde	\N	\N	\N	\N
1143	Test	2024-12-13	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1201	T’invente	2024-12-17	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
810	Balade champ 	2024-09-19	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1221	Soin œil 	2025-02-04	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-05	\N	Terminé	t	\N	tlj	\N	\N	1220	\N	\N
1144	D	2024-12-13	depense	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
817	Soin œil 	2024-10-01	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	814	\N	\N
818	Soin œil 	2024-10-02	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	814	\N	\N
819	Soin œil 	2024-10-03	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	814	\N	\N
816	Test futur 	2024-10-03	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1000	Vaccins 	2024-10-30	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
997	Testé balade 	2024-10-31	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	16h56	\N	\N	\N
1140	C	2024-12-13	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Bla bla a la 	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1009	Brossage poil soyeux 	2024-10-29	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-31	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1010	Brossage poil soyeux 	2024-10-30	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-31	\N	À faire	t	\N	tlj	\N	\N	1009	\N	\N
1011	Brossage poil soyeux 	2024-10-31	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-31	\N	À faire	t	\N	tlj	\N	\N	1009	\N	\N
1180	Test	2024-12-15	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	13h55	\N	\N	\N
1202	Test	2025-01-06	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1181	Vaccins	2024-12-17	rdv	Clinique Bleu 	Vétérinaire 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1029	Test minuit 1	2024-11-16	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	23h34	\N	\N	\N
1032	Test minuit 4	2024-11-16	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1047	Agility 	2024-12-02	concours	\N	\N	\N	\N	\N	\N	Agility 	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1184	Achat croquettes 	2024-12-18	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1077	Réer 	2024-12-11	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1191	Test	2024-12-17	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1187	Balade en forêt 	2024-12-28	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1205	Test	2025-01-15	depense	\N	\N	84	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	equipement	\N	\N	\N	\N
1214	Test	2025-01-29	entrainement	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1211	Test	2025-01-22	depense	\N	\N	17.82	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	assurance	\N	\N	\N	\N
1088	Rdv 	2024-12-04	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1091	Test 	2024-12-07	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1220	Soin œil 	2025-02-03	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-05	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1137	Test	2024-12-12	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1080	Test 	2024-12-12	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1228	Longe 	2025-02-05	entrainement	\N	\N	\N	\N	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1231	Liberté 	2025-01-25	entrainement	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1234	Séance ça passe 	2025-02-03	entrainement	\N	\N	\N	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1237	Pppp	2025-02-03	entrainement	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1240	Test	2025-02-10	balade	\N	\N	\N	\N	2025-02-10	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1225	Après	2025-02-14	entrainement	\N	\N	\N	\N	\N	\N	Hhh	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1222	Soin œil 	2025-02-05	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-02-05	\N	Terminé	t	\N	tlj	\N	\N	1220	\N	\N
637	Parage 	2024-09-07	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-08	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
721	Parage	2024-09-26	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-28	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1086	Balade dans les champs 	2024-12-01	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
431	Bla	2024-09-22	entrainement	Test	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
433	Test autre 	2024-09-22	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	Salut 	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1217	Test	2025-02-06	depense	\N	\N	88.56	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	equipement	\N	\N	\N	\N
1030	Test minuit 2	2024-11-17	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	0h34	\N	\N	\N
1223	Yyyy	2025-02-08	entrainement	\N	\N	\N	\N	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1188	Test	2024-12-17	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1072	ggg	2024-12-10	concours	Gkbc	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	19h25	\N	\N	\N
1192	Test	2024-12-17	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1075	Test 	2024-12-11	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1196	Test	2024-12-17	concours	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
182	Gg	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
181	Yyyy	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
180	Pp	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
179	II	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
178	Ttt	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
177	Yyyyy	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
176	Hhhhhh	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
175	Zzzzzz	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
173	Test	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
172	Iii	2024-09-22	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
230	Podologue 	2024-09-22	rdv	\N	Podologue	60	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
235	Vaccins 	2024-09-22	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
237	Vaccin 	2024-09-22	rdv	\N	Veto	75	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
238	Vaccin 	2024-09-22	rdv	\N	Veto	75	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	\N	\N	\N	\N	\N	\N
411	Anti puce	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Nexgard combo	2024-09-23	\N	Terminé	t	\N	tlm	\N	\N	\N	\N	\N
308	Location pré 	2024-09-22	depense		\N	475	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23		Terminé	t	\N	tlj	garde	\N	\N	\N	\N
257	Répétition spectacle et tournage teaser	2024-09-22	entrainement	\N	\N	\N	\N	\N	\N	Liberté 	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
307	Soin dermite 	2024-09-22	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Dermaflen	2024-09-23	Ggga	Terminé	t	\N	tlj	\N	19h30	\N	\N	\N
410	Mettre le round de foin 	2024-09-22	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	tlj	\N	18h40	\N	\N	\N
426	Essai	2024-09-22	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1199	Pppp	2024-12-17	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1182	Balade en forêt 	2024-12-17	balade	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N		Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1057	Testtt	2024-12-03	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1203	Test	2025-01-06	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
814	Soin œil 	2024-09-30	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1001	Achat croquettes 	2024-10-28	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
998	Agility 	2024-10-28	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1012	Dans les champs 	2024-10-20	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1247	Test	2025-02-16	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1206	Test	2025-01-15	depense	\N	\N	54.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	alimentation	\N	\N	\N	\N
1212	Hhh	2025-01-22	depense	\N	\N	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	accessoire	\N	\N	\N	\N
1215	Testt	2025-01-30	entrainement	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1038	Bla 	2024-11-23	depense	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1027	Test	2024-11-08	autre	\N	\N	10.05	\N	\N	\N	\N	3	\N	\N	\N	\N	\N	Test	Terminé	t	\N	tlj	\N	15h40	\N	\N	\N
1218	Test ajd	2025-02-08	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1081	Guignol	2024-12-08	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
811	CVM 	2024-09-22	entrainement	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
800	Test4e	2024-09-29	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
806	Test4e	2024-10-01	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	800	\N	\N
1089	Test 	2024-12-05	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
801	Test4e	2024-09-30	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	800	\N	\N
807	Test4e	2024-10-02	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	800	\N	\N
820	Test4e	2024-10-03	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-10-03	\N	Terminé	t	\N	tlj	\N	\N	800	\N	\N
1226	Avant 	2025-02-03	entrainement	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1229	Dressage 	2025-02-08	entrainement	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1232	Séance horrible 	2025-02-06	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1235	Séance nulle 	2025-01-10	entrainement	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1238	Hhh	2025-01-16	entrainement	\N	\N	\N	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1241	Test2	2025-02-01	balade	\N	\N	\N	\N	2025-02-01	\N	\N	5	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1138	A	2024-12-13	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1141	D	2024-12-13	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1311	Test	2025-03-27	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	JourJ	None
1316	Testmultianimaux	2025-04-03	depense	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	alimentation	\N	\N	JourJ	\N
1167	Bbvc	2024-12-14	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1168	Bbvc	2024-12-15	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1169	Bbvc	2024-12-16	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1170	Bbvc	2024-12-17	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1171	Bbvc	2024-12-18	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1172	Bbvc	2024-12-19	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1173	Bbvc	2024-12-20	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1174	Bbvc	2024-12-21	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1175	Bbvc	2024-12-22	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	1166	\N	\N
1166	Bbvc	2024-12-13	balade	\N	\N	\N	\N	2024-12-22	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1318	Test	2025-04-18	depense	\N	\N	110	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	autre	\N	\N	None	\N
1322	Deux	2025-04-15	entrainement	\N	\N	\N	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1324	Quatre	2025-04-17	entrainement	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1326	Zéro 	2025-04-13	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1328	Cinq 	2025-03-21	entrainement	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1330	Quatre 	2025-04-12	entrainement	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1314	Tedt2	2025-04-03	depense	\N	\N	35.46	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	alimentation	\N	\N	JourJ	\N
1320	Test	2025-04-19	soins	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	JourJ	\N
1336	Entraînement 	2025-05-04	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	JourJ	\N
1209	Assurance 	2025-01-19	depense	\N	\N	105	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	assurance	\N	\N	\N	\N
1334	Crème solaire 	2025-05-01	soins	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	15h39	\N	JourJ	\N
1344	Test	2025-05-12	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	20h20	\N	JourJ	\N
1332	Zéro 	2025-04-30	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	JourJ	\N
1338	Test	2025-05-08	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	JourJ	\N
1013	Test 1	2024-10-29	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
812	Ccea 	2024-09-30	concours	\N	\N	\N	\N	\N	\N	Concours complet 	\N	\N	\N	\N	\N	\N	Test	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1076	Test 	2024-12-12	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
815	Gouttes œil 	2024-09-30	depense	\N	\N	15	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
999	Agility 	2024-11-03	concours	\N	\N	\N	\N	\N	\N	Agility 	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1002	Test autre 	2024-10-28	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
439	Ghj	2024-09-22	balade	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
440	H  va k	2024-09-22	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-09-23	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
996	Test	2024-10-29	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1142	C	2024-12-13	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1242	Test3	2025-02-04	balade	\N	\N	\N	\N	2025-02-07	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1031	Test minuit 3	2024-11-17	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	1h8	\N	\N	\N
1243	Test3	2025-02-05	balade	\N	\N	\N	\N	2025-02-07	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	1242	\N	\N
1244	Test3	2025-02-06	balade	\N	\N	\N	\N	2025-02-07	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	1242	\N	\N
1245	Test3	2025-02-07	balade	\N	\N	\N	\N	2025-02-07	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	1242	\N	\N
1329	Trois 	2025-04-22	entrainement	\N	\N	\N	\N	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	JourJ	\N
1036	Gadeeed	2024-11-19	autre	Dog	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1049	Coupe griffes 2 	2024-12-02	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1079	test 	2024-12-11	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1058	Test	2024-12-03	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1303	Test	2025-03-29	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1321	Un	2025-04-14	entrainement	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1087	Test 	2024-12-03	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1090	Test 	2024-12-06	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1323	Trois 	2025-04-16	entrainement	\N	\N	\N	\N	\N	\N	\N	3	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1325	Cinq	2025-04-18	entrainement	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1327	Zéro 	2025-03-15	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1331	Deux 	2025-04-08	entrainement	\N	\N	\N	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	None	\N
1313	Test	2025-04-03	depense	\N	\N	35.45	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	alimentation	\N	\N	JourJ	\N
1246	Test	2025-02-16	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1150	Van	2024-12-14	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-15	\N	À faire	t	\N	tlj	\N	\N	1149	\N	\N
1151	Van	2024-12-15	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-15	\N	À faire	t	\N	tlj	\N	\N	1149	\N	\N
1176	Vb	2024-12-13	concours	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1317	Test	2025-04-03	depense	\N	\N	35.45	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	alimentation	\N	\N	JourJ	\N
1312	Tedt	2025-04-03	concours	\N	\N	\N	\N	\N	\N	Ttt	3	\N	\N	1	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	JourJ	\N
1149	Van	2024-12-13	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-12-15	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1319	Test	2025-04-19	depense	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	soins	\N	\N	JourJ	\N
1333	Butox 	2025-05-01	depense	\N	\N	20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	soins	\N	\N	JourJ	\N
1194	Test	2024-12-17	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1193	Test	2024-12-17	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1190	T es y	2024-12-17	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1189	Test	2024-12-17	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1197	Test	2024-12-17	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1200	Uuuu	2024-12-17	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1183	Parage 	2024-12-17	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1343	Yyyy	2025-05-12	autre	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	20h00	\N	JourJ	\N
1210	Test	2025-01-20	depense	\N	\N	87.14	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	equipement	\N	\N	\N	\N
1213	Test	2025-01-23	rdv	\N	Veto	69.69	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	\N	\N
1216	Hhhh	2025-01-28	entrainement	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1335	Entraînement 	2025-05-01	entrainement	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	15h39	\N	JourJ	\N
1204	JMT	2025-01-15	depense	\N	\N	60	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	alimentation	\N	\N	\N	\N
1207	Acaced 	2025-01-19	depense	\N	\N	300	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	formation	\N	\N	\N	\N
1219	Coupe des griffes	2025-02-08	soins	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1230	Spectacle 	2025-02-09	entrainement	\N	\N	\N	\N	\N	\N	\N	5	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1239	Test 	2025-02-09	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1186	Canicross 	2025-01-12	concours	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1337	Ça fonctionne ?	2025-05-01	autre	\N	\N	10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	JourJ	\N
1224	Jjjj	2025-02-05	entrainement	\N	\N	\N	\N	\N	\N	Test	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1227	Equifeel 	2025-02-01	entrainement	\N	\N	\N	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1233	Séance pas ouf 	2025-02-04	entrainement	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1236	Séance 	2025-01-21	entrainement	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1345	Teststat 	2025-05-13	rdv	\N	\N	325	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	À faire	t	\N	tlj	\N	\N	\N	JourJ	\N
1300	Test1	2025-03-14	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1301	Test2	2025-03-10	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1302	Tedt3	2025-03-15	rdv	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1248	Test	2025-03-09	depense	\N	\N	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1306	Tedt3	2025-03-20	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1305	Test2	2025-03-20	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
1304	Test2	2025-03-20	depense	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Terminé	t	\N	tlj	\N	\N	\N	\N	\N
\.


--
-- Data for Name: event_animal; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.event_animal (idevent, idanimal) FROM stdin;
306	140
307	141
308	140
308	141
1302	155
1303	155
1304	244
1305	155
1306	244
622	176
621	176
637	176
309	158
310	158
311	158
1311	244
1312	155
590	175
1313	155
1314	155
1316	155
810	177
811	176
812	176
410	141
410	140
411	157
813	177
814	177
815	177
816	175
817	177
818	177
819	177
1316	244
1137	155
1317	155
1318	245
1140	166
1141	166
1318	244
1144	166
227	140
229	140
230	140
230	141
231	140
232	140
232	141
1318	155
1319	245
1320	245
238	143
1321	244
1322	244
1072	166
1323	244
1324	244
1075	166
721	176
1076	166
621	175
622	175
1076	188
1077	188
1325	244
1079	188
255	140
1080	200
1081	166
1326	244
1327	244
1328	244
1149	204
1086	165
257	143
257	140
426	165
1087	165
1088	165
1089	165
1090	165
1091	166
1150	204
1151	204
1329	155
1330	155
1331	155
1332	155
1335	165
1336	165
430	175
431	175
432	175
433	175
434	175
435	175
436	175
437	175
438	175
439	175
440	175
997	176
998	177
999	177
1000	175
1001	177
1001	175
1002	180
1337	242
1338	245
1003	176
1005	176
1006	176
1007	176
1166	204
1008	176
1009	177
1010	177
1011	177
1012	176
1013	165
1167	204
1168	204
1169	204
1170	204
1171	204
1172	204
1173	204
1174	204
1175	204
1176	206
1343	244
1344	244
1345	244
1182	188
1183	165
1036	165
1037	166
1038	165
1186	188
1187	165
1188	208
1189	208
1190	208
1191	208
1192	208
1047	188
1193	208
1194	208
1195	208
1196	208
1197	208
1198	210
1199	209
1200	208
1201	208
1204	188
1207	165
1207	166
1207	188
1208	165
1208	166
1209	165
1209	166
1217	155
1219	242
1220	166
1221	166
1222	166
1223	155
1224	155
1225	155
1226	155
1227	165
1228	165
1229	165
1230	165
1231	165
1232	165
1233	165
1234	165
1235	165
1236	165
1237	155
1238	155
1239	200
1240	155
1242	155
1243	155
1244	155
1245	155
1246	157
1247	243
1248	155
1300	155
1301	155
\.


--
-- Data for Name: event_document; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.event_document (filename, idevent) FROM stdin;
\.


--
-- Data for Name: event_group_shares; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.event_group_shares (id, event_id, group_id, created_at) FROM stdin;
\.


--
-- Data for Name: group_animal_shares; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.group_animal_shares (id, group_id, animal_id, proposed_by, status, proposed_at) FROM stdin;
\.


--
-- Data for Name: group_invitations; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.group_invitations (id, group_id, email, status, invited_at) FROM stdin;
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.group_members (group_id, user_id, role, joined_at) FROM stdin;
1	21	manager	2025-05-11 13:43:06.464223
2	21	manager	2025-05-11 13:43:58.656759
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.groups (id, name, created_by, created_at) FROM stdin;
1	Test	21	2025-05-11 13:43:06.452581
2	Premier groupe	21	2025-05-11 13:43:58.646806
\.


--
-- Data for Name: note; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.note (id, titre, note, email) FROM stdin;
21	New note 	<b><i><u>Je test les nouveautés </u></i></b><div><br /></div><h2>Est-ce que ça fonctionne bien ?</h2><div><br /></div><div><ul><li>A<br /></li><li>B<br /></li><li>C <br /></li></ul></div>	contact.vascoandco@gmail.com
17	Essai 	<div>bla bla relou car pas correcteur </div>	contact.vascoandco@gmail.com
16	Test ancien 7	Test ancien7	romain.fievezjr@gmail.com
19	Test7	<div>Test7</div><div><a href="https://google.com">https://google.com</a></div>	romain.fievezjr@gmail.com
15	Je sais pas 	<ul><li><i>je</i><span> test un </span><b>truc</b><span> </span><br /></li></ul>	vasco.app@yopmail.com
18	Test	<div>nwlwbksgsobdcdodbfv</div>	vascotest@yopmail.com
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.notification (id, user_id, object_id, object_type, event_date, title, body, type_event) FROM stdin;
\.


--
-- Data for Name: objectif_group_shares; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.objectif_group_shares (id, objectif_id, group_id, created_at) FROM stdin;
\.


--
-- Data for Name: objectifs; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.objectifs (id, title, temporality, datedebut, datefin, is_shared_objectif) FROM stdin;
30	Ttttt	year	2024-06-16 00:00:00	2025-06-16 00:00:00	f
37	Balade seul	month	2024-06-10 02:00:00	2024-07-10 02:00:00	f
41	Perdre poids 	month	2024-09-22 02:00:00	2024-10-22 02:00:00	f
43	Test	week	2024-09-27 02:00:00	2024-10-04 02:00:00	f
44	Trotter en main 	month	2024-09-30 02:00:00	2024-10-30 02:00:00	f
45	Objectivement test	month	2024-10-28 01:00:00	2024-11-28 02:00:00	f
46	Essai deux 	year	2024-10-28 01:00:00	2025-10-28 02:00:00	f
51	Vu	tobedelete	2024-11-19 01:00:00	2024-11-23 01:00:00	f
54	Fg k g deg de	tobedelete	2024-12-13 01:00:00	2024-12-31 01:00:00	f
55	Test	tobedelete	2024-12-13 01:00:00	2024-12-13 01:00:00	f
56	Bb	tobedelete	2024-12-13 01:00:00	2024-12-14 01:00:00	f
57	Augmenter notre endurance avant le canicross 	tobedelete	2025-01-01 01:00:00	2025-01-12 01:00:00	f
58	Hhhh	tobedelete	2024-12-17 01:00:00	2024-12-17 01:00:00	f
59	Test	tobedelete	2025-02-01 01:00:00	2025-02-28 01:00:00	f
60	Test2	tobedelete	2025-02-01 01:00:00	2025-02-26 01:00:00	f
61	Test 	tobedelete	2025-02-09 01:00:00	2025-02-09 01:00:00	f
62	Tedt	tobedelete	2025-04-23 02:00:00	2025-04-23 02:00:00	f
63	Nettoyer pré 	tobedelete	2025-05-01 02:00:00	2025-05-01 02:00:00	f
64	Test 	tobedelete	2025-04-10 02:00:00	2025-04-30 02:00:00	f
65	Objectif futur 	tobedelete	2025-05-23 02:00:00	2025-06-20 02:00:00	f
\.


--
-- Data for Name: objectifs_animals; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.objectifs_animals (idobjectif, idanimal) FROM stdin;
37	140
41	175
43	175
44	176
45	180
45	175
45	176
46	180
46	177
51	174
54	205
55	207
56	204
57	188
58	209
59	223
60	228
61	200
62	245
63	165
63	166
64	165
65	200
\.


--
-- Data for Name: objectifs_etapes; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.objectifs_etapes (idobjectif, etape, id, state, "order") FROM stdin;
55	Jhh	95	f	0
51	Vj	86	f	0
37	Petit tour	61	t	1
37	Moyen tour	59	f	2
37	Grand tour	60	f	3
56	 Bv	96	f	0
56	Ch	97	t	1
58	Iiiiiiiiiiipppplkjjbtyun	101	f	0
59	Test	102	f	0
60	Tedt	103	f	0
43	Testeeez	75	t	0
44	1 pas	76	t	0
44	2 pas 	77	f	1
41	-1kg	72	t	0
41	-2kg	71	t	1
45	1	78	f	0
45	2	79	f	1
46	Étape deux	80	f	1
46	Étape un 	81	f	0
57	2 km	98	t	0
57	4 km 	100	f	1
57	6 km	99	f	2
61	1	104	f	0
61	2	105	f	1
54	C j 	92	t	0
54	´ b W 	93	t	1
54	Di ilwj	94	t	2
62	Tedt	106	f	0
63	Nettoyer grand pré 	107	f	1
63	Nettoyer petit pré 	108	f	0
64	Test moins un 	109	f	0
65	Futur 	110	f	0
\.


--
-- Data for Name: rdv; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.rdv (id, daterdv, specialiste, lieu, depense, commentaire) FROM stdin;
\.


--
-- Data for Name: rdv_equides; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.rdv_equides (idequide, idrdv) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model."user" (email, prenom, id, expotoken, timezone) FROM stdin;
romain.fievezjr@gmail.com	Romain	21	\N	Europe/Paris
adrien.lansing@gmail.com	Romain	39	ExponentPushToken[IeSV5QNJOeZ8xJL4SPDi4S]	Europe/Paris
perrine1122@gmail.com	Perrine	11	ExponentPushToken[IeSV5QNJOeZ8xJL4SPDi4S]	Europe/Paris
test@gmail.com	Romain	12	ExponentPushToken[IeSV5QNJOeZ8xJL4SPDi4S]	Europe/Paris
vasco.app@yopmail.com	Testeuse	44	ExponentPushToken[Bzhl45N-AaJ5G1fwel8Grb]	Europe/Paris
dev@gmail.com	Romain	10	ExponentPushToken[IeSV5QNJOeZ8xJL4SPDi4S]	Europe/Paris
test2@gmail.com	Romain	14	\N	Europe/Paris
test3@gmail.com	Romain	15	\N	Europe/Paris
test4@gmail.com	Romain	16	\N	Europe/Paris
test5@gmail.com	Romain	17	\N	Europe/Paris
romain.fievez.pro@gmail.com	Romain 	42	ExponentPushToken[IeSV5QNJOeZ8xJL4SPDi4S]	Europe/Paris
brigitte.delrue59@gmail.com	Brigitte 	22	ExponentPushToken[IeSV5QNJOeZ8xJL4SPDi4S]	Europe/Paris
vascotest@yopmail.com	Test	45	\N	\N
contact.vascoandco@gmail.com	Perrine	43	ExponentPushToken[Bzhl45N-AaJ5G1fwel8Grb]	Europe/Paris
\.


--
-- Data for Name: user_abonnement; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.user_abonnement (id_abonnement, id_user, date_debut, date_fin) FROM stdin;
1	14	\N	\N
1	15	\N	\N
1	16	\N	\N
1	17	\N	\N
1	18	\N	\N
1	19	\N	\N
1	20	\N	\N
1	22	\N	\N
1	23	\N	\N
1	24	\N	\N
1	25	\N	\N
1	26	\N	\N
1	27	\N	\N
1	28	\N	\N
1	29	\N	\N
1	30	\N	\N
1	31	\N	\N
1	32	\N	\N
1	33	\N	\N
1	34	\N	\N
1	35	\N	\N
1	36	\N	\N
1	37	\N	\N
1	38	\N	\N
1	39	\N	\N
1	40	\N	\N
1	41	\N	\N
1	42	\N	\N
1	44	\N	\N
1	45	\N	\N
2	43	\N	2025-05-29
2	11	\N	2026-05-29
2	21	\N	2025-05-29
\.


--
-- Data for Name: users_picture; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.users_picture (id, filename, id_user) FROM stdin;
1	04A55C94-5E95-4DD0-BCA3-70702D5300A0undefined.jpg	21
\.


--
-- Data for Name: wish; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.wish (id, nom, url, prix, destinataire, email, acquis) FROM stdin;
26	Livre	\N	20	Pour moi	contact.vascoandco@gmail.com	t
27	Livre	\N	35	Pour moi	contact.vascoandco@gmail.com	f
25	Test6	\N	\N	Pour moi	romain.fievezjr@gmail.com	f
23	test6	\N	123	Pour moi	romain.fievezjr@gmail.com	t
16	Tiguan	https://www.volkswagen.fr/fr/modeles-et-configurateur/tiguan.html	36000	Pour moi	perrine1122@gmail.com	f
18	Test	\N	10	Pour moi	perrine1122@gmail.com	f
19	Ggg	\N	\N	Pour moi	perrine1122@gmail.com	f
21	Gâteau 	\N	\N	Pour moi	vasco.app@yopmail.com	f
22	Sangle 	\N	70	Pour moi	vasco.app@yopmail.com	f
24	Essai souhait	\N	20	Pour moi	vasco.app@yopmail.com	f
28	Tu kvx		\N	Pour moi	vascotest@yopmail.com	f
\.


--
-- Data for Name: wish_picture; Type: TABLE DATA; Schema: model; Owner: postgres
--

COPY model.wish_picture (id, filename, idwish) FROM stdin;
12	4f3f561f-5a4c-4546-ab29-9815585d2e7703lRXZVd0WWsWRDvA7Hanh8Bl0v2.jpg	19
14	8F50C240-F1CD-4002-A999-38BEBD0B3EC4.jpg	21
15	0E6FF20D-8855-40AF-83E7-6634454D555A.jpg	22
16	A41C30AF-0FF2-49BD-824A-0B2B5AEFCD2D.jpg	26
17	37E86124-6150-423A-8D99-EB6E1D48A168.jpg	27
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, created_by, created_at) FROM stdin;
1	Test	21	2025-05-11 13:34:33.26169
2	Test	21	2025-05-11 13:40:47.815408
\.


--
-- Name: abonnement_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.abonnement_id_seq', 2, true);


--
-- Name: animal_food_history_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.animal_food_history_id_seq', 6, true);


--
-- Name: animal_food_quantity_history_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.animal_food_quantity_history_id_seq', 20, true);


--
-- Name: animal_poids_history_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.animal_poids_history_id_seq', 31, true);


--
-- Name: animal_taille_history_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.animal_taille_history_id_seq', 61, true);


--
-- Name: animals_body_picture_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.animals_body_picture_id_seq', 7, true);


--
-- Name: animals_picture_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.animals_picture_id_seq', 92, true);


--
-- Name: balade_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.balade_id_seq', 1, false);


--
-- Name: concours_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.concours_id_seq', 1, false);


--
-- Name: contact_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.contact_id_seq', 30, true);


--
-- Name: entrainement_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.entrainement_id_seq', 1, false);


--
-- Name: equide_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.equide_id_seq', 250, true);


--
-- Name: event_group_shares_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.event_group_shares_id_seq', 1, false);


--
-- Name: event_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.event_id_seq', 1345, true);


--
-- Name: group_animal_shares_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.group_animal_shares_id_seq', 1, false);


--
-- Name: group_invitations_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.group_invitations_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.groups_id_seq', 2, true);


--
-- Name: note_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.note_id_seq', 21, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.notification_id_seq', 1717, true);


--
-- Name: objectif_group_shares_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.objectif_group_shares_id_seq', 1, false);


--
-- Name: objectifs_etapes_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.objectifs_etapes_id_seq', 110, true);


--
-- Name: objectifs_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.objectifs_id_seq', 65, true);


--
-- Name: rdv_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.rdv_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.user_id_seq', 45, true);


--
-- Name: users_picture_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.users_picture_id_seq', 1, true);


--
-- Name: wish_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.wish_id_seq', 28, true);


--
-- Name: wish_picture_id_seq; Type: SEQUENCE SET; Schema: model; Owner: postgres
--

SELECT pg_catalog.setval('model.wish_picture_id_seq', 17, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 2, true);


--
-- Name: abonnement abonnement_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.abonnement
    ADD CONSTRAINT abonnement_pkey PRIMARY KEY (id);


--
-- Name: animal_food_history animal_food_history_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_food_history
    ADD CONSTRAINT animal_food_history_pkey PRIMARY KEY (id);


--
-- Name: animal_food_quantity_history animal_food_quantity_history_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_food_quantity_history
    ADD CONSTRAINT animal_food_quantity_history_pkey PRIMARY KEY (id);


--
-- Name: animal_poids_history animal_poids_history_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_poids_history
    ADD CONSTRAINT animal_poids_history_pkey PRIMARY KEY (id);


--
-- Name: animal_taille_history animal_taille_history_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_taille_history
    ADD CONSTRAINT animal_taille_history_pkey PRIMARY KEY (id);


--
-- Name: animals_body_picture animals_body_picture_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animals_body_picture
    ADD CONSTRAINT animals_body_picture_pkey PRIMARY KEY (id);


--
-- Name: animals_picture animals_picture_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animals_picture
    ADD CONSTRAINT animals_picture_pkey PRIMARY KEY (id);


--
-- Name: balade balade_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.balade
    ADD CONSTRAINT balade_pkey PRIMARY KEY (id);


--
-- Name: concours concours_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.concours
    ADD CONSTRAINT concours_pkey PRIMARY KEY (id);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- Name: entrainement entrainement_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.entrainement
    ADD CONSTRAINT entrainement_pkey PRIMARY KEY (id);


--
-- Name: equide equide_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.equide
    ADD CONSTRAINT equide_pkey PRIMARY KEY (id);


--
-- Name: event_animal event_animal_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_animal
    ADD CONSTRAINT event_animal_pkey PRIMARY KEY (idanimal, idevent);


--
-- Name: event_document event_document_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_document
    ADD CONSTRAINT event_document_pkey PRIMARY KEY (filename, idevent);


--
-- Name: event_group_shares event_group_shares_event_id_group_id_key; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_group_shares
    ADD CONSTRAINT event_group_shares_event_id_group_id_key UNIQUE (event_id, group_id);


--
-- Name: event_group_shares event_group_shares_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_group_shares
    ADD CONSTRAINT event_group_shares_pkey PRIMARY KEY (id);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: group_animal_shares group_animal_shares_group_id_animal_id_key; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_animal_shares
    ADD CONSTRAINT group_animal_shares_group_id_animal_id_key UNIQUE (group_id, animal_id);


--
-- Name: group_animal_shares group_animal_shares_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_animal_shares
    ADD CONSTRAINT group_animal_shares_pkey PRIMARY KEY (id);


--
-- Name: group_invitations group_invitations_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_invitations
    ADD CONSTRAINT group_invitations_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: note note_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: objectif_group_shares objectif_group_shares_objectif_id_group_id_key; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectif_group_shares
    ADD CONSTRAINT objectif_group_shares_objectif_id_group_id_key UNIQUE (objectif_id, group_id);


--
-- Name: objectif_group_shares objectif_group_shares_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectif_group_shares
    ADD CONSTRAINT objectif_group_shares_pkey PRIMARY KEY (id);


--
-- Name: objectifs_etapes objectifs_etapes_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectifs_etapes
    ADD CONSTRAINT objectifs_etapes_pkey PRIMARY KEY (id);


--
-- Name: objectifs objectifs_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectifs
    ADD CONSTRAINT objectifs_pkey PRIMARY KEY (id);


--
-- Name: rdv rdv_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.rdv
    ADD CONSTRAINT rdv_pkey PRIMARY KEY (id);


--
-- Name: objectifs_animals unique_idobjectif_idanimal; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectifs_animals
    ADD CONSTRAINT unique_idobjectif_idanimal UNIQUE (idobjectif, idanimal);


--
-- Name: user_abonnement user_abonnement_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.user_abonnement
    ADD CONSTRAINT user_abonnement_pkey PRIMARY KEY (id_abonnement, id_user);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: users_picture users_picture_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.users_picture
    ADD CONSTRAINT users_picture_pkey PRIMARY KEY (id);


--
-- Name: wish_picture wish_picture_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.wish_picture
    ADD CONSTRAINT wish_picture_pkey PRIMARY KEY (id);


--
-- Name: wish wish_pkey; Type: CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.wish
    ADD CONSTRAINT wish_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: event_group_shares event_group_shares_event_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_group_shares
    ADD CONSTRAINT event_group_shares_event_id_fkey FOREIGN KEY (event_id) REFERENCES model.event(id) ON DELETE CASCADE;


--
-- Name: event_group_shares event_group_shares_group_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_group_shares
    ADD CONSTRAINT event_group_shares_group_id_fkey FOREIGN KEY (group_id) REFERENCES model.groups(id) ON DELETE CASCADE;


--
-- Name: animal_food_history fk_animal_food_history_idanimal; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_food_history
    ADD CONSTRAINT fk_animal_food_history_idanimal FOREIGN KEY (idanimal) REFERENCES model.equide(id) ON DELETE CASCADE;


--
-- Name: animal_food_quantity_history fk_animal_food_quantity_history_idanimal; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_food_quantity_history
    ADD CONSTRAINT fk_animal_food_quantity_history_idanimal FOREIGN KEY (idanimal) REFERENCES model.equide(id) ON DELETE CASCADE;


--
-- Name: animal_poids_history fk_animal_poids_history_idanimal; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_poids_history
    ADD CONSTRAINT fk_animal_poids_history_idanimal FOREIGN KEY (idanimal) REFERENCES model.equide(id) ON DELETE CASCADE;


--
-- Name: animal_taille_history fk_animal_taille_history_idanimal; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.animal_taille_history
    ADD CONSTRAINT fk_animal_taille_history_idanimal FOREIGN KEY (idanimal) REFERENCES model.equide(id) ON DELETE CASCADE;


--
-- Name: balade_equides fk_balade_equides_idbalade; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.balade_equides
    ADD CONSTRAINT fk_balade_equides_idbalade FOREIGN KEY (idbalade) REFERENCES model.balade(id) ON DELETE CASCADE;


--
-- Name: balade_gps fk_balade_gps_idbalade; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.balade_gps
    ADD CONSTRAINT fk_balade_gps_idbalade FOREIGN KEY (idbalade) REFERENCES model.balade(id) ON DELETE CASCADE;


--
-- Name: concours_equides fk_concours_equides_idconcours; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.concours_equides
    ADD CONSTRAINT fk_concours_equides_idconcours FOREIGN KEY (idconcours) REFERENCES model.concours(id) ON DELETE CASCADE;


--
-- Name: entrainement_equides fk_entrainement_equides_identrainement; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.entrainement_equides
    ADD CONSTRAINT fk_entrainement_equides_identrainement FOREIGN KEY (identrainement) REFERENCES model.entrainement(id) ON DELETE CASCADE;


--
-- Name: event_animal fk_event_animal_idanimal; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_animal
    ADD CONSTRAINT fk_event_animal_idanimal FOREIGN KEY (idanimal) REFERENCES model.equide(id) ON DELETE CASCADE;


--
-- Name: event_animal fk_event_animal_idevent; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.event_animal
    ADD CONSTRAINT fk_event_animal_idevent FOREIGN KEY (idevent) REFERENCES model.event(id) ON DELETE CASCADE;


--
-- Name: objectifs_etapes fk_objectifs_etapes; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectifs_etapes
    ADD CONSTRAINT fk_objectifs_etapes FOREIGN KEY (idobjectif) REFERENCES model.objectifs(id) ON DELETE CASCADE;


--
-- Name: rdv_equides fk_rdv_equides_idrdv; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.rdv_equides
    ADD CONSTRAINT fk_rdv_equides_idrdv FOREIGN KEY (idrdv) REFERENCES model.rdv(id) ON DELETE CASCADE;


--
-- Name: group_animal_shares group_animal_shares_animal_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_animal_shares
    ADD CONSTRAINT group_animal_shares_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES model.equide(id) ON DELETE CASCADE;


--
-- Name: group_animal_shares group_animal_shares_group_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_animal_shares
    ADD CONSTRAINT group_animal_shares_group_id_fkey FOREIGN KEY (group_id) REFERENCES model.groups(id) ON DELETE CASCADE;


--
-- Name: group_animal_shares group_animal_shares_proposed_by_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_animal_shares
    ADD CONSTRAINT group_animal_shares_proposed_by_fkey FOREIGN KEY (proposed_by) REFERENCES model."user"(id) ON DELETE CASCADE;


--
-- Name: group_invitations group_invitations_group_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_invitations
    ADD CONSTRAINT group_invitations_group_id_fkey FOREIGN KEY (group_id) REFERENCES model.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES model.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES model."user"(id) ON DELETE CASCADE;


--
-- Name: groups groups_created_by_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES model."user"(id) ON DELETE CASCADE;


--
-- Name: objectif_group_shares objectif_group_shares_group_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectif_group_shares
    ADD CONSTRAINT objectif_group_shares_group_id_fkey FOREIGN KEY (group_id) REFERENCES model.groups(id) ON DELETE CASCADE;


--
-- Name: objectif_group_shares objectif_group_shares_objectif_id_fkey; Type: FK CONSTRAINT; Schema: model; Owner: postgres
--

ALTER TABLE ONLY model.objectif_group_shares
    ADD CONSTRAINT objectif_group_shares_objectif_id_fkey FOREIGN KEY (objectif_id) REFERENCES model.objectifs(id) ON DELETE CASCADE;


--
-- Name: groups groups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES model."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

