FROM node:11-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g yarn

RUN yarn install --production

COPY . .

CMD ["npm", "start"]