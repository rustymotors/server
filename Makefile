all:
	@echo "Please select a valid target"

certs:
	@openssl req -x509 -extensions v3_req -config data/mcouniverse.cnf -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/mcouniverse.crt -days 365
	@openssl rsa -in ./data/private_key.pem -outform DER -pubout | xxd -ps -c 300 | tr -d '\n' > ./data/pub.key
	@echo "certs regenerated. remember to update pub.key for all clients"

test:
	@MCO_DB_USER=testingDummy npm test

start:
	@LOG_LEVEL=silly npm run start:dev

enable-node:
	@sudo setcap cap_net_bind_service=+ep $(which node)