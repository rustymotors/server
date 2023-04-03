all:
	@echo "Please select a valid target"

certs:
	@openssl req -x509 -extensions v3_req -config data/mcouniverse.cnf -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/mcouniverse.pem -days 365
	@openssl rsa -in ./data/private_key.pem -outform DER -pubout | xxd -ps -c 300 | tr -d '\n' > ./data/pub.key
	@cp ./data/mcouniverse.pem  ./data/private_key.pem ./services/sslProxy/
	@echo "certs regenerated. remember to update pub.key for all clients"

test:
	@clear
	@NODE_OPTIONS="--openssl-legacy-provider" npm test

start:
	@LOG_LEVEL=silly npm run start:dev

prod_node:
	npx tsc -b --verbose
	docker-compose --file docker-compose.yml up -d --build

down:
	docker-compose down

enable-node:
	@sudo setcap cap_net_bind_service=+ep $(which node)

docker-init:
	mkdir -p log/mcos
	@npm run start:docker -s
