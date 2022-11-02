FROM node:16-slim

WORKDIR /app 

COPY ./poker-tournament-visualization .

RUN npm install -g @angular/cli
RUN npm install

RUN npm run build

EXPOSE 4200:4200

CMD ["node", "index.js"]
