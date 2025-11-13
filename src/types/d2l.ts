// D2L/Brightspace API response types

export interface ApiVersions {
  [key: string]: string;
}

export interface ClasslistUser {
  Username: string;
  RoleId: number;
  UserId?: number;
  DisplayName?: string;
  FirstName?: string;
  LastName?: string;
}

export interface Enrollment {
  OrgUnit: {
    Id: number;
    Name: string;
    Type?: {
      Id: number;
      Code: string;
      Name: string;
    };
  };
  User: {
    Identifier: string;
    DisplayName: string;
    EmailAddress: string;
    OrgDefinedId: string;
    ProfileIdentifier: string;
  };
  Role: {
    Id: number;
    Code: string;
    Name: string;
  };
}

export interface User {
  Identifier: string;
  DisplayName: string;
  EmailAddress: string;
  OrgDefinedId: string;
  ProfileIdentifier: string;
  FirstName: string;
  LastName: string;
  UserName: string;
}

export interface Assignment {
  Id: number;
  Name: string;
  Instructions: {
    Text: string;
    Html: string;
  };
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
}

export interface DiscussionForum {
  ForumId: number;
  Name: string;
  Description?: {
    Text: string;
    Html: string;
  };
}

export interface DiscussionTopic {
  TopicId: number;
  Name: string;
  Description?: {
    Text: string;
    Html: string;
  };
}

export interface DiscussionPost {
  PostId: number;
  ThreadId: number;
  Subject: string;
  Message: {
    Text: string;
    Html: string;
  };
}
