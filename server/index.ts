import express from 'express';
import bodyParser from 'body-parser';
import {postSlackMessage} from '../src/slack';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const axios = require('axios');
const qs = require('qs');

const apiUrl = 'https://slack.com/api';

const updateView = (user: any) => {
  let blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          '*Welcome!* \nThis is a home for Stickers app. You can add small notes here!',
      },
      accessory: {
        type: 'button',
        action_id: 'add_note',
        text: {
          type: 'plain_text',
          text: 'Button',
          emoji: true,
        },
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ':wave: Hey, my source code is on <https://glitch.com/edit/#!/apphome-demo-keep|glitch>!',
        },
      ],
    },
    {
      type: 'divider',
    },
  ];
  let view = {
    type: 'home',
    title: {
      type: 'plain_text',
      text: 'Keep notes!',
    },
    blocks: blocks,
  };

  return JSON.stringify(view);
};

app.post('/slack/events', async (req, res) => {
  const {type, user, channel, tab, text, subtype} = req.body.event;
  console.log(type);
  switch (type) {
    case 'url_verification': {
      res.send({challenge: req.body.challenge});
      break;
    }
    case 'app_home_opened': {
      console.log('ホーム');
      const args = {
        token: 'xoxb-423425841490-976290421718-e2hCHolgVmNv6UrXSI5maBCH',
        user_id: 'UCF8SLY9Z',
        view: updateView(user),
      };
      console.log(args);
      const result = await axios.post(
        `${apiUrl}/views.publish`,
        qs.stringify(args),
      );
      console.log(result);
      break;
    }
    default: {
      res.sendStatus(404);
    }
  }
});

app.listen(4000, () => {
  console.log('start server');
});
