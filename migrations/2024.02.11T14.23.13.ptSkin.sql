CREATE TABLE PTSkin (
	SkinID INTEGER NOT NULL,
	CreatorID INTEGER,
	SkinTypeID INTEGER,
	PartTypeID INTEGER,
	ESkin VARCHAR(100),
	GSkin VARCHAR(20),
	FSkin VARCHAR(20),
	SSkin VARCHAR(20),
	ISkin VARCHAR(20),
	JSkin VARCHAR(20),
	SwSkin VARCHAR(20),
	BSkin VARCHAR(20),
	Price INTEGER NOT NULL,
	PartFilename VARCHAR(20),
	H0 SMALLINT,
	S0 SMALLINT,
	V0 SMALLINT,
	C0 SMALLINT,
	X0 SMALLINT,
	Y0 SMALLINT,
	H1 SMALLINT,
	S1 SMALLINT,
	V1 SMALLINT,
	C1 SMALLINT,
	X1 SMALLINT,
	Y1 SMALLINT,
	H2 SMALLINT,
	S2 SMALLINT,
	V2 SMALLINT,
	C2 SMALLINT,
	X2 SMALLINT,
	Y2 SMALLINT,
	H3 SMALLINT,
	S3 SMALLINT,
	V3 SMALLINT,
	C3 SMALLINT,
	X3 SMALLINT,
	Y3 SMALLINT,
	H4 SMALLINT,
	S4 SMALLINT,
	V4 SMALLINT,
	C4 SMALLINT,
	X4 SMALLINT,
	Y4 SMALLINT,
	H5 SMALLINT,
	S5 SMALLINT,
	V5 SMALLINT,
	C5 SMALLINT,
	X5 SMALLINT,
	Y5 SMALLINT,
	H6 SMALLINT,
	S6 SMALLINT,
	V6 SMALLINT,
	C6 SMALLINT,
	X6 SMALLINT,
	Y6 SMALLINT,
	H7 SMALLINT,
	S7 SMALLINT,
	V7 SMALLINT,
	C7 SMALLINT,
	X7 SMALLINT,
	Y7 SMALLINT,
	DEFAULTFLAG INTEGER DEFAULT 0,
	CreatorName VARCHAR(24),
	Comment_Text VARCHAR(128),
	CONSTRAINT SYS_PK_12047 PRIMARY KEY (SkinID),
	CONSTRAINT PTSKIN_PARTTYPEPTSKIN FOREIGN KEY (PartTypeID) REFERENCES PartType(PartTypeID),
	CONSTRAINT PTSKIN_SKINTYPEPTSKIN FOREIGN KEY (SkinTypeID) REFERENCES SkinType(SkinTypeID)
);
CREATE INDEX SYS_IDX_PTSKIN_PARTTYPEPTSKIN_12628 ON PTSkin (PartTypeID);
CREATE INDEX SYS_IDX_PTSKIN_SKINTYPEPTSKIN_12636 ON PTSkin (SkinTypeID);
CREATE UNIQUE INDEX SYS_IDX_SYS_PK_12047_12048 ON PTSkin (SkinID);
