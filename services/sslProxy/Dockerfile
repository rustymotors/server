# Can be located at https://archive.org/details/nginx_1.9.8.tar if needed
FROM nginx:1.9.8@sha256:5d3b56065cf133f8968a557bf49c639320b2fc4c57c635b5707978fb6b738e1f as base

COPY nginx.conf /etc/nginx/nginx.conf
COPY mcouniverse.pem /etc/nginx/mcouniverse.pem
COPY private_key.pem /etc/nginx/private_key.pem
COPY fullchain1.pem /etc/nginx/fullchain1.pem
COPY privkey1.pem /etc/nginx/privkey1.pem
