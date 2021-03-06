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
    blocks: {
      type?: string;
      text?: {
        type: string;
        text: string;
      };
      accessory?: {
        type: string;
        initial_option: {
          value: string;
          text: {
            type: string;
            text: string;
          };
        };
      };
      options?: {
        value: string;
        text: {
          type: string;
          text: string;
        };
      }[];
    }[];
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
