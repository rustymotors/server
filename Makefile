all:
	@npm install

certs:
	@openssl req -x509 -extensions v3_req -config data/mcouniverse.cnf -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/mcouniverse.pem -days 365
	@openssl rsa -in ./data/private_key.pem -outform DER -pubout | xxd -ps -c 300 | tr -d '\n' > ./data/pub.key
	@cp ./data/mcouniverse.pem  ./data/private_key.pem ./services/sslProxy/
	@echo "certs regenerated. remember to update pub.key for all clients"

test:
	@clear
	@npm test

build:
	@npm run build:dev

start:
	@EXTERNAL_HOST=10.10.5.20 PRIVATE_KEY_FILE=data/private_key.pem CERTIFICATE_FILE=data/mcouniverse.crt PUBLIC_KEY_FILE=data/pub.key LOG_LEVEL=trace npm run start:dev

prod_node:
	docker-compose --file docker-compose.yml up -d --build

up:
	docker-compose up -d --build

down:
	docker-compose down

enable-node:
	@sudo setcap cap_net_bind_service=+ep $(which node)

docker-init:
	mkdir -p log/mcos
	@npm run start:docker -s


clean:
	@rm -rf node_modules
	@rm -rf dist

.PHONY: all certs test build start prod_node up down enable-node docker-init clean