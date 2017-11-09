--
-- PostgreSQL database dump
--

-- Dumped from database version 10.0
-- Dumped by pg_dump version 10.0

-- Started on 2017-10-27 20:37:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12980)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2857 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 196 (class 1259 OID 24576)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE sessions (
    customer_id integer NOT NULL,
    session_key character varying(256),
    context_id character(34),
    remote_address character(16)
);


ALTER TABLE sessions OWNER TO postgres;

--
-- TOC entry 2850 (class 0 OID 24576)
-- Dependencies: 196
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY sessions (customer_id, session_key, context_id, remote_address) FROM stdin;
1	d865a6368c07ba080abc3b71f3294f55a8d5449c294dc2b59ec7a62dd866e2e9	\N	69.204.103.206  
\.


--
-- TOC entry 2724 (class 2606 OID 24580)
-- Name: sessions customer_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT customer_id UNIQUE (customer_id);


--
-- TOC entry 2726 (class 2606 OID 24582)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (customer_id);


--
-- TOC entry 2728 (class 2606 OID 24584)
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (context_id);


-- Completed on 2017-10-27 20:37:25

--
-- PostgreSQL database dump complete
--

