# Can be located at https://archive.org/details/nginx_1.9.8.tar if needed
FROM nginx:1.25.4@sha256:6db391d1c0cfb30588ba0bf72ea999404f2764febf0f1f196acd5867ac7efa7e as base

COPY nginx.conf /etc/nginx/nginx.conf
COPY mcouniverse.pem /etc/nginx/mcouniverse.pem
COPY private_key.pem /etc/nginx/private_key.pem
COPY fullchain1.pem /etc/nginx/fullchain1.pem
COPY privkey1.pem /etc/nginx/privkey1.pem