import got from 'got';
import yargs from 'yargs';
import {year, month, day, dayOfWeekStr} from './date';
const argv = yargs
  .usage('$0 <cmd> [args]')
  .option('slack-token', {
    demandOption: true,
    describe: "slack's token",
    type: 'string',
  })
  .option('slack-channel', {
    demandOption: true,
    describe: 'to post slack channel',
    type: 'string',
  })
  .option('backlog-api-key', {
    demandOption: true,
    describe: "backlog's api key",
    type: 'string',
  })
  .option('backlog-space', {
    demandOption: true,
    describe: "backlog's space name",
    type: 'string',
  })
  .option('backlog-user-id', {
    demandOption: true,
    describe: "backlog's userid",
    type: 'string',
  })
  .help().argv;
const {
  slackToken,
  slackChannel,
  backlogSpace,
  backlogApiKey,
  backlogUserId,
} = argv;
console.log(
  slackToken,
  slackChannel,
  backlogSpace,
  backlogApiKey,
  backlogUserId,
);
(async () => {
  try {
    const response = await got(
      `https://${backlogSpace}.backlog.jp/api/v2/issues?apiKey=${backlogApiKey}&assigneeId[]=${backlogUserId}&startDateSince=2020-02-07&startDateUntil=2020-02-07&sort=priority`,
    );
    const issuesData = JSON.parse(response.body).map(
      (val: {
        issueKey: string;
        summary: string;
        priority: {
          id: number;
          name: string;
        };
      }) => {
        return {
          title: val.issueKey,
          title_link: `https://geek.backlog.jp/view/${val.issueKey}`,
          text: `${val.summary}\n優先度：${val.priority.name}\n予定時間：1h`,
        };
      },
    );
    console.log(issuesData);
    const params = {
      token: slackToken,
      channel: slackChannel,
      attachments: issuesData,
      text: `${year}/${month}/${day}(${dayOfWeekStr}) 合計時間：`,
    };

    await got.post('https://slack.com/api/chat.postMessage', {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${slackToken}`,
      },
      json: params,
    });
  } catch (error) {
    console.log(error.response.body);
  }
})();
