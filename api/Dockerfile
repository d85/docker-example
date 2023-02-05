FROM node:16-alpine

# in image
WORKDIR /app

COPY package.json .

RUN npm install

# first '.' is src relative to docker file
# second '.' is desition relative to workdir
COPY . .

# port exposed by container
# relevant if spinner up containers via docker desktop
# docker desktop can use this for port mappings
EXPOSE 4000

CMD ["node", "app.js"]
