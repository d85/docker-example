# Docker

Images are made up from several `layers`

| Image        |
| :---         |
| run commands |
| dependencies |
| source code  |
| parent image |

```Dockerfile
FROM node:16-alpine

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

## Images > Run

In the following - the port mapping is only shown as we included the `EXPOSE 4000` line in our Dockerfile

![title](screenshots/run-options.png)

# Docker commands

List images

```sh
docker images
```

Run, specifying a `container name`

```sh
docker run --name myapp_c1 myapp
```

This isn't enough. If we try to hit `localhost:4000` it is unreachable.

We need to map the host port to the container port.

But we first need to stop the container.

# Show running containers

```sh
docker ps
```

Output
```
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS      NAMES
28a30c3963fa   myapp     "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   4000/tcp   myapp_c1
```

To stop the container, we provide either `the container id` or the `container name`

```sh
docker stop myapp_c1
```

Let's run it again, but this time we map a port on our computer to a port on the container

```sh
# -p is for publish
# port number on the left is for the host
# port number on the right is for the container

# -d will run in detached mode
docker run --name myapp_c2 -p 4000:4000 -d myapp
```

Now we can access it again via `localhost:4000`, and also the terminal is not blocked.

# Show all containers including stopped ones

```sh
docker ps -a
```

## docker run
Creates and runs a `new container`

## docker start
Starts and runs an `existing container`

```sh
docker start myapp_c2
```

## Code changes

Without volumes - if we make a change to the code, we need to rebuild the image.

# Layer caching

If we `build an Image`, docker `caches the layers`.

If we then `build another Image` which has the same initial layers as the first images. `Docker will pull those from the cache.`

# Managing Images and Containers

Show images

```sh
docker images
```

```sh
docker image rm myapp4
```

The images won't be removed if there is a container `In use`

Removal can be forced with

```sh
docker image rm myapp5 -f
```

The above doesn't remove running instance(s) of the container if present

The other option is to delete the container first, and then delete the image

## Remove container

```sh
docker container rm myapp_c2
```

## Prune



```sh
docker system prune -a

# WARNING! This will remove:
#   - all stopped containers
#   - all networks not used by at least one container
#   - all images without at least one container associated to them
#   - all build cache
```

## Build image with tag

```sh
docker build -t myapp:v1 .
```

## Run tagged version

```sh
docker run --name myapp_c -p 4000:4000 myapp:v1
```

## Starting an existing container

```sh
docker start myapp_c
```

By default, `docker start` starts and existing container in `detached` mode

For non-detached do this:

```sh
docker start -i myapp_c
```

# Volumes

Without volumes - if we make code changes, we need to rebuild the image - and then run a container based off the new image.

Volumes are a feature of docker that allow us to specify `folders` on our `host` computer that can be `made available` to `running containers`

We can map those folders on our host computer to specific folders inside the container, so that if something changed in the folders on the host computer, that change would also be reflected in the folders we mapped to in the container.

For example - we could map our entire project folder - the `api` folder to the `app` folder in our container - which is where are the source files are located `in the container`.

So if we have a container running this application and we use a `volume` to map the `api directory` to the `app directory` in the container.

So this is a way we can make changes to the project and preview those changes without having to rebuild the image all the time.

One important note is: `the image does not change`. Volumes just gives a way to map directories between the host computer and the container - the image that the container is running, doesn't change at all.

# Use nodemon to listen for file changes

```dockerfile
FROM node:16-alpine

RUN npm install -g nodemon

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

CMD ["npm", "run", "dev"]
```

And in the `package.json`

```json
  ...
  "scripts": {
    "dev": "nodemon -L app.js"
  },
  ...
```

The `-L` argument in the command `nodemon -L app.js` is short for `legacy-watch.` It tells nodemon to use the older, less efficient file watching method for starting the application. The `-L` flag is used to help resolve compatibility issues with certain systems or older versions of nodemon.

`nodemon` it typically used only for development and not for use in `production`.

```sh
docker build -t myapp:nodemon .
```

```sh
docker run --name myapp_c_nodemon -p 4000:4000 --rm myapp:nodemon
```

The `--rm` will remove the container once we stop it later on.

# Mapping Volumes / Getting Live Changes

```sh
docker run --name myapp_c_nodemon -p 4000:4000 --rm -v /home/dan/Desktop/docker-example/api:/app myapp:nodemon
```

## Potential problem

If we delete the `node_modules` folder on the `host`, it would also now be deleted in the container as well. This would cause a problem because the app needs the dependencies in the `node_modules` folder to work.

We need a way to retain the mapping between the `/api` folder on the host computer and the `/app` folder in the container, but to prevent changes to the `node_modules` folder on the host being reflected in the container.

The way we can do this is by adding another `volume` - called `an anonymous volume`.

The `anonymous_volume` will map the `container's node_modules` folder to somewhere else, that is managed by docker.

The docker run command becomes:

```sh
docker run --name myapp_c_nodemon -p 4000:4000 --rm -v /home/dan/Desktop/docker-example/api:/app -v /app/node_modules myapp:nodemon
```

The `/app/node_modules` volume mapping `overrides that specific part of the previous mapping` because `it is more specific`.

# Docker Compose

Docker Compose gives us a way to make a single docker-compose file which contains all the container conguration of our projects.

This file will configure all the different containers that we want to run, that are part of the same project. E.g. The database, the front-end and the back-end.

So then all we need to do is run one command to have docker-compose create all of our images, and then run them all so we get containers for each one.

We create a `docker-compose.yaml` at the `outside of our api folder`

```yaml
version: "3.8"
services:
  api:
    build: ./api
    container_name: api_c
    ports:
      - '4000:4000'
    volumes:
      - ./api:/app
      - ./app/node_modules
```
