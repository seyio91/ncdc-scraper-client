FROM nginx
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx-entry.sh /
COPY ./index.html /usr/share/nginx/html/
COPY ./css /usr/share/nginx/html/css
COPY ./js /usr/share/nginx/html/js
COPY ./images /usr/share/nginx/html/images
EXPOSE 80
CMD ["/nginx-entry.sh"]
