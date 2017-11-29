FROM zenato/puppeteer

USER root

RUN apt-get update
RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb
RUN dpkg -i dumb-init_*.deb

ADD . /code

WORKDIR /code

EXPOSE 5000
CMD npm install && dumb-init node app.js

