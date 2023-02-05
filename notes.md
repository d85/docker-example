# Docker

Images are made up from several `layers`

| Image        |
| :---         |
| run commands |
| dependencies |
| source code  |
| parent image |

```Dockerfile
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
```

# Build the Image

```sh
# -t tagname
# '.' is relative path to Dockerfile from command line current dir
docker build -t myapp .
```

We don't want to copy over the `node_modules` folder if there is one

Create a `.dockerignore` file

.dockerignore

```dockerignore
node_modules

*.md
```