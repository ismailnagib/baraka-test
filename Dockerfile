FROM node:18-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node package*.json ./

RUN npm install --only=production

COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "app" ]
