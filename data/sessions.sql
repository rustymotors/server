--
-- PostgreSQL database dump
--

-- Dumped from database version 10.0
-- Dumped by pg_dump version 10.0

-- Started on 2017-10-26 21:00:38

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
-- TOC entry 2855 (class 0 OID 0)
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
    session_key character varying(256)
);


ALTER TABLE sessions OWNER TO postgres;

--
-- TOC entry 2848 (class 0 OID 24576)
-- Dependencies: 196
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY sessions (customer_id, session_key) FROM stdin;
0	ad717a8f7ec28a10aed844f9f682c5bdc69fa3ab9016f598e1c49e1d0844a567
16777216	0b0652032ee8af8bdc9f34832eb7168801932f77a5ad7241950ba6ee78ea6aa3
1	4a50cb08af9773e360f709320bf35bd3ca8d1ce4a9e3ff470bbd35d5885c4ceb
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


-- Completed on 2017-10-26 21:00:38

--
-- PostgreSQL database dump complete
--

