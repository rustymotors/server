/*
	ClientConnect : This is not a 'login', it is the client saying:
	 	"Hey, I'm authenticated! Let's get the channel encrypted so
	 	  can we do some transactions on a secure channel."

	Given:
		pMsg->customerID
		pMsg->personaID

	o Go to GLS and validate customerID is authenticated
	o verify that personaID is valid
	o Send Ack/Nak result to client
	if (Ack)
		o Retrieve sessionKey
		o SetEncryptionKeys()
		o Set encryption == true for comm channel
	else
		o disconnect
*/
// bool ClientConnect( ConnectionInfo * info, MessageNode * node)
function ClientConnect(info, node) {}

module.exports = ClientConnect;
