FROM node:9.8-alpine
MAINTAINER Thanh NGUYEN <u.nguyenthanh@gmail.com>

ENV CONSUL_API_URL "http://localhost:8500"

RUN mkdir -p /cui
COPY . /cui
WORKDIR /cui

RUN npm install
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 3000

RUN cp ./docker/entrypoint.sh ./
RUN cp ./docker/config.js ./

ENTRYPOINT ["./entrypoint.sh"]
CMD ["sh", "-c", "npm start"]

