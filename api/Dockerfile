FROM node:18-alpine

# in image
WORKDIR /app

# first '.' is src relative to docker file
# second '.' is desition relative to workdir
COPY . .

RUN npm install

# port exposed by container
# relevant if spinner up containers via docker desktop
# docker desktop can use this for port mappings
EXPOSE 4000

CMD ["node", "app.js"]
