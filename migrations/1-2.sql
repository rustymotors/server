CREATE TABLE "sessions"
(
   customer_id serial,
   session_key character(20)  NOT NULL,
   s_key character(20)  NOT NULL,
   context_id character(20)  NOT NULL,
   connection_id character(20)  NOT NULL,
   CONSTRAINT pk_session PRIMARY KEY (customer_id)
)
WITH (
  OIDS = FALSE
);
 
