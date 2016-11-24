const request = require('request');
const express = require('express');

const app = express();

app.post('/', (req, res) => {
  req.on('data', handleInbound);
  res.status(200).end();
});

function handleInbound(data) {
  const inbound = JSON.parse(data.toString());
  if (inbound.text.substring(0,6).toLowerCase() === '/giphy') {
    let query = inbound.text.split(' ').slice(1).join('+');

    makeGiphyRequest(query, inbound.room, (err, outboundPayload) => {
      postToGitTalk(outboundPayload, err => {
        if (err) console.log(err);
      });
    });
  }
}

function makeGiphyRequest(query, room, cb) {
  request(`http://api.giphy.com/v1/gifs/search?q=${ query }&api_key=dc6zaTOxFJmzC`, (err, respose, body) => {
    if (err) return cb(err, null);
    const data = JSON.parse(body).data;
    let random = getRandomInt(0, data.length);
    const gif = data[random].images.downsized.url;

    const outbound = {
      apiKey: '4663019a8424e79757ed681c676ac57c',
      method: 'message',
      room: room,
      action: {
        image: gif,
        avatar: 'http://giphy.com/static/img/giphy_logo_square_social.png'
      }
    };

    cb(null, outbound);
  });
}

function postToGitTalk(outbound, cb) {
  request.post({ url: 'http://localhost:8000/apps', json: outbound }, (err, response, body) => {
    if (err) return cb(err);
    cb(null);
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.listen(8002, () => console.log('server listening on port 8002'));
