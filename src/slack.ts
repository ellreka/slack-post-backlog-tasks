import got from 'got';
import {slackDailyParams, slackTimesParams} from './interface';

export const postSlackDaily = async (params: slackDailyParams) => {
  await got.post('https://slack.com/api/files.upload', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${params.token}`,
    },
    form: params,
  });
};

export const postSlackTimes = async (params: slackTimesParams) => {
  await got.post('https://slack.com/api/chat.postMessage', {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${params.token}`,
    },
    json: params,
  });
};
