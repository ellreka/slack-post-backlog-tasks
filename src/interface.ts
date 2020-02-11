export interface slackDailyParams {
  token: string;
  channels: string;
  title: string;
  content: string;
  filetype: string;
}

export interface slackTimesParams {
  token: string;
  channel: string;
  text: string;
  attachments: {
    title: string;
    title_link: string;
    text: string;
    color: string;
  }[];
}

export interface backlogActivitiesParams {
  host: string;
  userid: string;
  apikey: string;
  activityTypeId: number;
}

export interface backlogIssuesParams {
  host: string;
  userid: string;
  apikey: string;
  startDateUntil: string;
}

export interface backlogIssuesType {
  issueKey: string;
  summary: string;
  priority: {
    id: number;
    name: string;
  };
}

export interface backlogActivitiesType {
  id: number;
  project: {
    id: number;
    projectKey: string;
    name: string;
    chartEnabled: boolean;
    subtaskingEnabled: boolean;
    projectLeaderCanEditProjectLeader: boolean;
    archived: boolean;
    displayOrder: number;
  };
  type: number;
  content: {
    id: number;
    key_id: number;
    summary: string;
    description: string;
    comment: {
      id: number;
      content: string;
    };
  };
  created: string;
}
