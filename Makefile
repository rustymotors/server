all:
	@echo "Please select a valid target"

certs:
	@openssl req -x509 -config data/mcouniverse.cnf -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/cert.crt -days 365
	@openssl rsa -in ./data/private_key.pem -outform DER -pubout | xxd -ps -c 300 | tr -d '\n' > ./data/pub.key
	@echo "certs regenerated. remember to update pub.key for all clients"

test:
	@MCO_DB_USER=testingDummy npm test