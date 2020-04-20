FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY client /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]