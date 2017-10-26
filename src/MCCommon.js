// class ProcContext
// {
// public:
// 	ProcContext( const char *db_user, const char *db_password, const char *db_sid );
// 	~ProcContext();
// 	void Reconnect();
//
// 	// OCI handles.
// 	OCIEnv *envhp;
// 	OCIError *errhp;
// 	OCISvcCtx *svchp;
//     OCIStmt* cda; // Statement handle
//     OCIStmt* stmthp2; // Statement handle for RS
// private:
// 	bool OracleLogin( const char *db_user, const char *db_password, const char *db_sid );
// 	void initializeOCIHandles( const char *db_user, const char *db_password, const char *db_sid );
// 	sword init_handles( OCIEnv **envhp, OCIError **errhp, OCIStmt **cda, OCIStmt **stmthp2, ub4 init_mode );
// 	char connection_db_user[256];
// 	char connection_db_password[256];
// 	char connection_db_sid[256];
// };
//
// struct ConnectionInfo : public DBSpamTiming
// {
// 	DWORD		custID;
// 	DWORD		persID;
// 	char		persName[25];
// 	ProcContext *c;
//
// 	ConnectionInfo() : DBSpamTiming(), custID(0), persID(0), c(NULL)
// 	{
// 		persName[0] = 0;
// 	}
// };

// struct ConnectionInfo
function ConnectionInfo() {
    if (!(this instanceof ConnectionInfo)) {
        return new ConnectionInfo()
    }

    // DWORD		custID;
    this.custID = Buffer.from([0x00, 0x00, 0x00, 0x00])
    // DWORD		persID;
    this.persID = Buffer.from([0x00, 0x00, 0x00, 0x00])
    // char		persName[25];
    this.persName = Buffer.alloc(25)
}

module.exports = ConnectionInfo
