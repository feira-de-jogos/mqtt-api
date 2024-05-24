FROM node:20

WORKDIR /app
RUN git clone -b main https://github.com/feira-de-jogos/mqtt-api /app && npm install --prefix /app

CMD [ "npm", "start" ]
