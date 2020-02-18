import got from 'got';
import {backlogActivitiesParams, backlogIssuesParams} from './interface';

export const getBacklogActivities = (params: backlogActivitiesParams) => {
  return got(
    `https://${params.host}/api/v2/users/${params.userid}/activities?apiKey=${params.apikey}&activityTypeId[]=${params.activityTypeId}`,
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
};

export const getBacklogIssues = (params: backlogIssuesParams) => {
  return got(
    `https://${params.host}/api/v2/issues?apiKey=${params.apikey}&assigneeId[]=${params.userid}&startDateUntil=${params.startDateUntil}&statusId[]=1&statusId[]=2&statusId[]=3&sort=priority&order=asc`,
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
};
