FROM risingstack/alpine:3.4-v8.9.4-4.8.0

MAINTAINER serafeim

RUN apk update

ENV NODE_ENV production
ENV DB_ENV live
ENV PORT 3000

EXPOSE 3000

COPY package.json package.json
RUN npm install --only=production

COPY . .

CMD npm start