import got from 'got';
import yargs from 'yargs';
import readlineSync from 'readline-sync';
import terminalLink from 'terminal-link';
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
  .option('backlog-host', {
    demandOption: true,
    describe: "backlog's host",
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
  backlogHost,
  backlogApiKey,
  backlogUserId,
} = argv;

(async () => {
  try {
    const response = await got(
      `https://${backlogHost}/api/v2/issues?apiKey=${backlogApiKey}&assigneeId[]=${backlogUserId}&startDateUntil=${year}-${month}-${day}&statusId[]=1&statusId[]=2&statusId[]=3&sort=priority`,
    );
    const body = JSON.parse(response.body);
    if (body.length === 0) {
      console.log('タスクはありませんでした');
    } else {
      const issuesData = body.map(
        (val: {
          issueKey: string;
          summary: string;
          priority: {
            id: number;
            name: string;
          };
        }) => {
          const issueLink = `https://${backlogHost}/view/${val.issueKey}`;
          const keyLinkText = terminalLink(val.issueKey, issueLink);
          const time = readlineSync.questionFloat(
            `\n[課題キー]${keyLinkText}\n[概要]${val.summary}\n[予定時間]`,
          );
          return {
            issue_key: val.issueKey,
            issue_link: issueLink,
            summary: val.summary,
            priority: val.priority.name,
            time: time,
          };
        },
      );

      const totalTime = issuesData.reduce(
        (
          result: {
            time: number;
          },
          current: {
            time: number;
          },
        ) => {
          return result.time + current.time;
        },
      );

      const attachmentsObject = issuesData.map(
        (val: {
          issue_key: string;
          issue_link: string;
          summary: string;
          priority: {
            id: number;
            name: string;
          };
          time: number;
        }) => {
          return {
            title: val.issue_key,
            title_link: val.issue_link,
            text: `[概要]${val.summary}\n[優先度]${val.priority}\n[予定時間]${val.time}h`,
            color: '#42ce9f',
          };
        },
      );
      const params = {
        token: slackToken,
        channel: slackChannel,
        text: `*${year}/${month}/${day}(${dayOfWeekStr}) 合計時間：${totalTime}h*`,
        attachments: attachmentsObject,
      };

      await got.post('https://slack.com/api/chat.postMessage', {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${slackToken}`,
        },
        json: params,
      });
    }
  } catch (error) {
    console.log(error.response.body);
  }
})();
