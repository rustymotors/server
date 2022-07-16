all:
	@echo "Please select a valid target"

certs:
	@openssl req -x509 -extensions v3_req -config data/mcouniverse.cnf -newkey rsa:1024 -nodes -keyout ./data/private_key.pem -out ./data/mcouniverse.pem -days 365
	@openssl rsa -in ./data/private_key.pem -outform DER -pubout | xxd -ps -c 300 | tr -d '\n' > ./data/pub.key
	@cp ./data/mcouniverse.pem  ./data/private_key.pem ./services/sslProxy/
	@echo "certs regenerated. remember to update pub.key for all clients"

test:
	@npm test
	@cd packages/admin && npm test && cd ../..
	@cd packages/auth && npm test && cd ../..
	@cd packages/bin && npm test && cd ../..
	@cd packages/config && npm test && cd ../..
	@cd packages/core && npm test && cd ../..
	@cd packages/admin && npm test && cd ../..
	@cd packages/database && npm test && cd ../..
	@cd packages/lobby && npm test && cd ../..
	@cd packages/login && npm test && cd ../..
	@cd packages/message-types && npm test && cd ../..
	@cd packages/patch && npm test && cd ../..
	@cd packages/persona && npm test && cd ../..
	@cd packages/proxy && npm test && cd ../..
	@cd packages/router && npm test && cd ../..
	@cd packages/shard && npm test && cd ../..
	@cd packages/transactions && npm test && cd ../..


start:
	@LOG_LEVEL=silly npm run start:dev

prod_node:
	tsc -b --verbose
	docker-compose --file docker-compose.yml up -d --build
	docker-compose logs -f --tail 1000

down:
	docker-compose down

enable-node:
	@sudo setcap cap_net_bind_service=+ep $(which node)

docker-init:
	mkdir -p log/mcos
	@npm run start:docker -s
