export class Session {
    static schema = `CREATE TABLE IF NOT EXISTS "sessions"
  (
    customer_id integer,
    sessionkey text NOT NULL,
    skey text NOT NULL,
    context_id text NOT NULL,
    connection_id text NOT NULL,
    CONSTRAINT pk_session PRIMARY KEY(customer_id)
  );`;
}
