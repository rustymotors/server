# Can be located at https://archive.org/details/nginx_1.9.8.tar if needed
FROM nginx:1.25.4@sha256:c26ae7472d624ba1fafd296e73cecc4f93f853088e6a9c13c0d52f6ca5865107 as base

COPY nginx.conf /etc/nginx/nginx.conf
COPY mcouniverse.pem /etc/nginx/mcouniverse.pem
COPY private_key.pem /etc/nginx/private_key.pem
COPY fullchain1.pem /etc/nginx/fullchain1.pem
COPY privkey1.pem /etc/nginx/privkey1.pem