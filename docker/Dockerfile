# Build image
#
# docker build . -t cobalt-web -f docker/Dockerfile 

# Run image
#
# docker run -e COBALT_WEB_API_BASE_URL='http://localhost:8080' -e COBALT_WEB_PORT='3000' -p 3000:3000 cobalt-web

# Stop image
#
# docker stop $(docker ps -q --filter ancestor=cobalt-web)

FROM node:18.12.1-alpine

EXPOSE 3000

# Switch to non-root user

RUN adduser -D appuser
WORKDIR /home/appuser
USER appuser

# Copy over application code, archive, and run it
COPY --chown=appuser:appuser . /home/appuser/app/

WORKDIR /home/appuser/app

RUN npm install && npm run build

CMD ["sh", "-c", "npm run start"]