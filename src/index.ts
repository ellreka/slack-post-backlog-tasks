import yargs from 'yargs';
import inquirer from 'inquirer';
import readlineSync from 'readline-sync';
import terminalLink from 'terminal-link';
import {year, month, day, dayOfWeekStr} from './date';
import {getBacklogActivities, getBacklogIssues} from './backlog';
import {postSlackDaily, postSlackTimes} from './slack';
import {backlogIssuesType, backlogActivitiesType} from './interface';

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
  .option('post-type', {
    alias: 't',
    describe: 'times or daily-report',
    type: 'string',
  })
  .help().argv;

(async () => {
  try {
    const getPostType = async (val: string|undefined) => {
      if (val === 'times' || val === 'daily-report') {
        return val
      } else {
        const {type} = await inquirer.prompt([
          {
            name: 'type',
            choices: ['times', 'daily-report'],
            type: 'list',
            message: 'which post type?',
          },
        ])
        return type;
      }
    }

    const postType = await getPostType(argv['post-type']);

    if (postType === 'times') {
      const backlogParams = {
        host: argv['backlog-host'],
        userid: argv['backlog-user-id'],
        apikey: argv['backlog-api-key'],
        startDateUntil: `${year}-${month}-${day}`,
      };

      const response = await getBacklogIssues(backlogParams);

      const backlogResponse: Array<backlogIssuesType> = JSON.parse(
        response.body,
      );

      if (backlogResponse.length === 0) {
        console.log('タスクはありませんでした');
      } else {
        const issuesData = backlogResponse.map(val => {
          const issueLink = `https://${argv['backlog-host']}/view/${val.issueKey}`;

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
        });

        const totalTime = issuesData.reduce(
          (result, current) => result + current.time,
          0,
        );

        const attachmentsObject = issuesData.map(val => {
          return {
            title: val.issue_key,
            title_link: val.issue_link,
            text: `[概要]${val.summary}\n[優先度]${val.priority}\n[予定時間]${val.time}h`,
            color: '#42ce9f',
          };
        });

        const slackParams = {
          token: argv['slack-token'],
          channel: argv['slack-channel'],
          text: `*${year}/${month}/${day}(${dayOfWeekStr}) 合計時間：${totalTime}h*`,
          attachments: attachmentsObject,
        };
        postSlackTimes(slackParams);
      }
    } else if (postType === 'daily-report') {
      const backlogParams = {
        host: argv['backlog-host'],
        userid: argv['backlog-user-id'],
        apikey: argv['backlog-api-key'],
        activityTypeId: 2,
      };

      const response = await getBacklogActivities(backlogParams);

      const backlogResponse: Array<backlogActivitiesType> = JSON.parse(
        response.body,
      );

      const todayTasks = backlogResponse
        .filter((val, index, self) => {
          return (
            val.created.split('T')[0] === `${year}-${month}-${day}` &&
            self.findIndex(val2 => val.project.id === val2.project.id) === index
          );
        })
        .map(val => {
          const projectKey = `${val.project.projectKey}-${val.content.key_id}`;
          return `- [${projectKey}](https://${argv['backlog-host']}/view/${projectKey}) ${val.content.summary}\n`;
        });

      const getThoughts = await inquirer.prompt([
        {
          name: 'thoughts',
          type: 'editor',
          message: '【思ったこと】を入力する',
        },
      ]);

      const slackPostContent = `【やったこと】\n${todayTasks.join(
        '',
      )}【思ったこと】\n${getThoughts.thoughts}\n\n\n【次回やること】\n`;

      const slackParams = {
        token: argv['slack-token'],
        channels: argv['slack-channel'],
        title: `【日報】${year}-${month}-${day}`,
        content: slackPostContent,
        filetype: 'post',
      };

      postSlackDaily(slackParams);
    }
  } catch (error) {
    console.log(error);
  }
})();
