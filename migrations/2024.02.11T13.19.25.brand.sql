create table if not exists Brand (
    BrandID INTEGER NOT NULL,
    Brand VARCHAR(100) NULL,
    PicName VARCHAR(50) NULL,
    IsStock SMALLINT default 0,
    CONSTRAINT SYS_PK_11763 PRIMARY KEY (BrandID));

CREATE UNIQUE INDEX SYS_IDX_SYS_PK_11795_11796 ON Brand (BrandID);
