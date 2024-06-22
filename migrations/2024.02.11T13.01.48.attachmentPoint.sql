CREATE TABLE if not exists AttachmentPoint (
	AttachmentPointID INTEGER NOT NULL,
	AttachmentPoint VARCHAR(100) NOT NULL,
	CONSTRAINT SYS_PK_11761 PRIMARY KEY (AttachmentPointID));

CREATE UNIQUE INDEX SYS_IDX_SYS_PK_11761_11762 ON AttachmentPoint (AttachmentPointID);
