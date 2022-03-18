FROM nginx:1.9.8 as base

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /etc/nginx/html/index.html
COPY AuthLogin.html /etc/nginx/html/AuthLogin
COPY mcouniverse.crt /etc/nginx/mcouniverse.crt
COPY private_key.pem /etc/nginx/private_key.pem
