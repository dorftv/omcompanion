FROM node:18-alpine

WORKDIR /app

COPY . /app

RUN npm install
ENTRYPOINT ["nodejs", "app.js"]
#CMD ["/bin/bash"]
