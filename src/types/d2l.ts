// D2L/Brightspace API response types

export interface ApiVersions {
  [key: string]: string;
}

export interface ClasslistUser {
  Username: string;
  RoleId: number;
  UserId?: number;
  Identifier?: string | number;
  DisplayName?: string;
  FirstName?: string;
  LastName?: string;
  ClasslistRoleDisplayName?: string;
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

export interface MyItemsDue {
  Id?: number;
  ItemId?: number;
  AssignmentId?: number;
  TopicId?: number;
  ForumId?: number;
  Name?: string;
  Title?: string;
  ItemName?: string;
  DueDate?: string | null;
  EndDate?: string | null;
  StartDate?: string | null;
  Instructions?: {
    Text?: string;
    Html?: string;
  };
  Description?: {
    Text?: string;
    Html?: string;
    Content?: string;
  };
  Availability?: {
    StartDate?: string;
    EndDate?: string;
  };
  DropboxType?: number;
  Type?: number;
  ItemType?: string | number;
  ContentType?: string;
  Assessment?: {
    Rubrics?: Array<{ Name: string }>;
  };
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
  DueDate?: string | null;
  EndDate?: string | null;
  StartDate?: string | null;
  Availability?: {
    StartDate?: string;
    EndDate?: string;
  };
}

// Extended type for topics with ForumId added during processing
export interface DiscussionTopicWithForum extends DiscussionTopic {
  ForumId: number;
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

export interface GradeObject {
  OrgUnitId: number;
  GradeObjectId: number;
  Name: string;
  ShortName?: string;
  Type: number; // 1 = Numeric, 2 = Pass/Fail, 3 = Selectbox, 4 = Text, 5 = Calculated
  MaxPoints?: number;
  CanExceedMaxPoints?: boolean;
  IsBonus?: boolean;
  ExcludeFromFinalGrade?: boolean;
  GradeSchemeId?: number;
}

export interface GradeValue {
  OrgUnitId: number;
  UserId: number;
  GradeObjectId: number;
  PointsNumerator?: number;
  PointsDenominator?: number;
  WeightedNumerator?: number;
  WeightedDenominator?: number;
  Comments?: {
    Text: string;
    Html: string;
  };
}

export interface AssignmentSubmission {
  SubmissionId: number;
  SubmissionNumber: number;
  UserId: number;
  UserName: string;
  DisplayName: string;
  SubmittedDate: string;
  IsRetracted: boolean;
  Files: Array<{
    FileId: number;
    FileName: string;
    FileSize: number;
  }>;
  TextSubmission?: string;
}
