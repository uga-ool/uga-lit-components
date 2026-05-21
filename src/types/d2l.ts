// D2L/Brightspace API response types

export interface ApiVersions {
  [key: string]: string;
}

export interface ClasslistUser {
  Username: string;
  RoleId: number | null;
  UserId?: number;
  Identifier?: string | number;
  DisplayName?: string;
  FirstName?: string;
  LastName?: string;
  /** Empty when the enrollment role is not set to “display in classlist” in Brightspace. */
  ClasslistRoleDisplayName?: string;
  /** When `null`, the user has no classlist-visible profile image (do not call the profile image route). */
  ImageUrl?: string | null;
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

/** Dropbox folder (assignment) with GradeItemId for quiz grade sync */
export interface DropboxFolder {
  Id: number;
  Name: string;
  GradeItemId: number | null;
  Assessment?: { ScoreDenominator?: number | null } | null;
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
  OrgUnitId: number | string; // D2L API can return as string (D2LID) or number
  UserId: number | string; // D2L API can return as string (D2LID) or number - bulk grade values use string
  GradeObjectId: number | string; // D2L API can return as string (D2LID) or number
  GradeObjectIdentifier?: string; // Alternative field name for GradeObjectId (D2LID as string)
  GradeObjectName?: string;
  GradeObjectType?: number; // GRADEOBJ_T: 1=Numeric, 2=PassFail, 3=SelectBox, 4=Text, etc.
  GradeObjectTypeName?: string;
  DisplayedGrade?: string; // Formatted grade display value
  PointsNumerator?: number | null; // null indicates ungraded
  PointsDenominator?: number | null; // null indicates ungraded
  WeightedNumerator?: number | null;
  WeightedDenominator?: number | null;
  Comments?: {
    Content: string;
    Type: 'Text' | 'Html';
  };
  PrivateComments?: {
    Content: string;
    Type: 'Text' | 'Html';
  };
  LastModified?: string | null; // UTCDateTime
  LastModifiedBy?: string | null; // D2LID
  ReleasedDate?: string | null; // UTCDateTime - for final grades
}

export interface AssignmentSubmission {
  SubmissionId: number;
  SubmissionNumber: number;
  UserId: number | string; // D2L API can return as string (D2LID) or number
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
  // Feedback information from EntityDropbox.Feedback
  FeedbackScore?: number | null;
  IsGraded?: boolean;
  FeedbackText?: string;
  // Group submission information
  IsGroupSubmission?: boolean;
  GroupId?: number | string; // Group ID if this is a group submission
}

/**
 * EntityDropbox structure from D2L Dropbox API
 * Each EntityDropbox represents a user or group's submission status
 */
export interface EntityDropbox {
  Entity: {
    EntityId: number | string; // D2LID
    EntityType: 'User' | 'Group';
    DisplayName?: string; // For User entities
    Name?: string; // For Group entities
  };
  Status: number; // ENTITYDROPBOXSTATUS_T: 0=Unsubmitted, 1=Submitted, 2=Draft, 3=Published
  Feedback?: DropboxFeedbackOut;
  Submissions: Array<{
    Id: number; // D2LID
    SubmittedBy: {
      Id: string; // Username or identifier
      DisplayName: string;
    };
    SubmissionNumber?: number;
    SubmissionDate: string | null; // UTCDateTime
    Comment?: {
      Text?: string;
      Html?: string;
    };
    Files: Array<{
      FileId: number; // D2LID
      FileName: string;
      Size: number; // long
      isRead?: boolean;
      isFlagged?: boolean;
    }>;
    IsRetracted?: boolean;
  }>;
  CompletionDate?: string | null; // UTCDateTime
}

/**
 * DropboxFeedbackOut structure from D2L Dropbox API
 * Contains feedback/grade information for a submission
 */
export interface DropboxFeedbackOut {
  Score: number | null; // decimal
  Feedback?: {
    Text?: string;
    Html?: string;
  };
  RubricAssessments?: Array<any>; // Array of RubricAssessment blocks
  IsGraded: boolean;
  Files?: Array<{
    FileId: number; // D2LID
    FileName: string;
    Size: number; // long
  }>;
  Links?: Array<{
    Type: 'External' | 'Internal' | 'MediaContent';
    LinkId: number; // D2LID
    LinkName: string;
    Href: string | null;
  }>;
  GradedSymbol?: string | null; // For select-box grade objects
}

/**
 * UserGradeValue structure from D2L Grades API
 * Contains both User and GradeValue information
 */
export interface UserGradeValue {
  User: {
    Identifier?: string; // D2LID as string
    UserId?: number; // D2LID as number
    Id?: number | string; // Alternative ID field
    DisplayName?: string;
    FirstName?: string;
    LastName?: string;
    UserName?: string;
  };
  GradeValue: GradeValue | null; // null if ungraded
}

/**
 * Course-wide analytics types for module consumption tracking
 */
export interface CourseAnalytics {
  modules: ModuleAnalytics[];
  overall: OverallStats;
}

export interface ModuleAnalytics {
  moduleId: number;
  moduleName: string;
  contentStats?: {
    totalTopics: number;
    completedTopics: number;
    completionRate: number;
    totalViews: number;
    uniqueViewers: number;
  };
  assignmentStats?: {
    totalAssignments: number;
    submittedAssignments: number;
    submissionRate: number;
    averageScore: number;
    totalSubmissions: number;
  };
  discussionStats?: {
    totalTopics: number;
    totalPosts: number;
    participatingStudents: number;
    averagePostsPerStudent: number;
  };
  quizStats?: {
    totalQuizzes: number;
    completedQuizzes: number;
    completionRate: number;
    averageScore: number;
    totalAttempts: number;
  };
  objectivesStats?: {
    totalObjectives: number;
    completedObjectives: number;
  };
  loginStats?: {
    totalLogins: number;
  };
  gradesStats?: {
    averageGrade: number;
    gradedCount: number;
  };
}

export interface OverallStats {
  totalModules: number;
  totalStudents: number;
  contentStats?: {
    totalTopics: number;
    totalCompletions: number;
    overallCompletionRate: number;
    /** When set (from aggregate API), use for "X of Y possible" display instead of totalTopics * totalStudents */
    totalRequired?: number;
  };
  assignmentStats?: {
    totalAssignments: number;
    totalSubmissions: number;
    overallSubmissionRate: number;
    overallAverageScore: number;
  };
  discussionStats?: {
    totalTopics: number;
    totalPosts: number;
    participatingStudents: number;
  };
  quizStats?: {
    totalQuizzes: number;
    totalAttempts: number;
    overallCompletionRate: number;
    overallAverageScore: number;
  };
  objectivesStats?: {
    totalObjectives: number;
    completedObjectives: number;
  };
  loginStats?: {
    totalLogins: number;
  };
  gradesStats?: {
    averageGrade: number;
    gradedCount: number;
  };
}
