import yargs from 'yargs';
import inquirer from 'inquirer';
import readlineSync from 'readline-sync';
import terminalLink from 'terminal-link';
import {year, month, day, dayOfWeekStr} from './date';
import {getBacklogActivities, getBacklogIssues} from './backlog';
import {postSlackFilesUpload, postSlackMessage} from './slack';
import {
  backlogIssuesType,
  slackTimesParams,
  backlogActivitiesType,
} from './interface';

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
  .option('skip-input', {
    alias: 's',
    describe: 'skip input',
    type: 'boolean',
  })
  .help().argv;

(async () => {
  try {
    const getPostType = async (val: string | undefined) => {
      if (val === 'times' || val === 'daily-report') {
        return val;
      } else {
        const {type} = await inquirer.prompt([
          {
            name: 'type',
            choices: ['times', 'daily-report'],
            type: 'list',
            message: 'which post type?',
          },
        ]);
        return type;
      }
    };

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
          let time = 0;
          if (!argv['skip-input']) {
            time = readlineSync.questionFloat(
              `${val.issueKey}\n${val.summary}\n:`,
            );
          }
          return {
            issue_key: val.issueKey,
            issue_link: issueLink,
            summary: val.summary,
            time: time,
          };
        });
        const attachmentsArray = issuesData.map(val => {
          return {
            color: '#42ce9f',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `<${val.issue_link}|${val.issue_key}>\n${val.summary}`,
                },
                accessory: {
                  type: 'static_select',
                  initial_option: {
                    value: `${val.time}`,
                    text: {
                      type: 'plain_text',
                      text: `${val.time}%`,
                    },
                  },
                  options: [
                    {
                      value: '0',
                      text: {
                        type: 'plain_text',
                        text: '0%',
                      },
                    },
                    {
                      value: '5',
                      text: {
                        type: 'plain_text',
                        text: '5%',
                      },
                    },
                    {
                      value: '10',
                      text: {
                        type: 'plain_text',
                        text: '10%',
                      },
                    },
                    {
                      value: '20',
                      text: {
                        type: 'plain_text',
                        text: '20%',
                      },
                    },
                    {
                      value: '30',
                      text: {
                        type: 'plain_text',
                        text: '30%',
                      },
                    },
                    {
                      value: '40',
                      text: {
                        type: 'plain_text',
                        text: '40%',
                      },
                    },
                    {
                      value: '50',
                      text: {
                        type: 'plain_text',
                        text: '50%',
                      },
                    },
                    {
                      value: '60',
                      text: {
                        type: 'plain_text',
                        text: '60%',
                      },
                    },
                    {
                      value: '70',
                      text: {
                        type: 'plain_text',
                        text: '70%',
                      },
                    },
                    {
                      value: '80',
                      text: {
                        type: 'plain_text',
                        text: '80%',
                      },
                    },
                    {
                      value: '90',
                      text: {
                        type: 'plain_text',
                        text: '90%',
                      },
                    },
                    {
                      value: '100',
                      text: {
                        type: 'plain_text',
                        text: '100%',
                      },
                    },
                  ],
                },
              },
            ],
          };
        });

        const slackParams = {
          token: argv['slack-token'],
          channel: argv['slack-channel'],
          text: `${year}/${month}/${day}(${dayOfWeekStr})`,
          attachments: attachmentsArray,
        };
        postSlackMessage(slackParams);
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

      let postMessage = '';
      if (argv['skip-input']) {
        postMessage += `【やったこと】\n${todayTasks.join(
          '',
        )}\n【思ったこと】\n\n【次回やること】\n`;
      } else {
        const getThoughts = await inquirer.prompt([
          {
            name: 'thoughts',
            type: 'editor',
            message: '【思ったこと】を入力する',
          },
        ]);
        postMessage += `【やったこと】\n${todayTasks.join(
          '',
        )}\n【思ったこと】\n${getThoughts.thoughts}\n\n【次回やること】\n`;
      }

      const slackParams = {
        token: argv['slack-token'],
        channels: argv['slack-channel'],
        title: `【日報】${year}-${month}-${day}`,
        content: postMessage,
        filetype: 'post',
      };

      postSlackFilesUpload(slackParams);
    }
  } catch (error) {
    console.log(error);
  }
})();
