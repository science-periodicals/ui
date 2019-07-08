// CSS constants
// Be sure to keep those in sync with the CSS
// Prefix all these constants with `CSS_`
export const CSS_HEADER_HEIGHT = 56;

// NOTE: We add 0,1 or A,B,C ... to the constant value so that they sort lexicographicaly
export const CSS_SHORT = 'CSS_0_SHORT';
export const CSS_TALL = 'CSS_1_TALL';
export const CSS_MOBILE = 'CSS_A_MOBILE';
export const CSS_SMALL_TABLET = 'CSS_B_SMALL_TABLET';
export const CSS_TABLET = 'CSS_C_TABLET';
export const CSS_SMALL_DESKTOP = 'CSS_D_SMALL_DESKTOP';
export const CSS_LARGE_DESKTOP = 'CSS_E_LARGE_DESKTOP';
export const CSS_XLARGE_DESKTOP = 'CSS_F_XLARGE_DESKTOP';
export const CSS_XXLARGE_DESKTOP = 'CSS_G_XXLARGE_DESKTOP';

export const API_LABELS = {
  Dataset: 'Dataset',
  DataCatalog: 'Data',
  DataDownload: 'Data',
  Image: 'Image',
  ImageObject: 'Image',
  Audio: 'Audio',
  AudioObject: 'Audio',
  Video: 'Video',
  VideoObject: 'Video',
  Formula: 'Formula',
  FormulaObject: 'Formula',
  TextBox: 'Text Box',
  TextBoxObject: 'Text Box',
  WPSideBar: 'Text Box',
  SoftwareSourceCode: 'Code source',
  SoftwareSourceCodeObject: 'Code',
  Table: 'Table',
  TableObject: 'Table',
  DocumentObject: 'Article',
  Article: 'Article',
  ScholarlyArticle: 'Article',
  //
  active: 'In progress',
  published: 'Published',
  rejected: 'Rejected',
  //
  CreateReleaseAction: 'Release',
  DeclareAction: 'Declare',
  ReviewAction: 'Review',
  AssessAction: 'Assess',
  AllocateAction: 'Allocate',
  EndorseAction: 'Endorse',
  ScheduleAction: 'Schedule',
  PublishAction: 'Publish',
  PayAction: 'Pay',
  CreateOfferAction: 'Monetize',
  InviteAction: 'Invite',
  InviteEditorAction: 'Invite',
  InviteAuthorAction: 'Invite',
  InviteReviewerAction: 'Invite',
  InvitePoducerAction: 'Invite',
  WaitAction: 'Wait',
  DisclosureAction: 'Disclose',
  AcknowledgeAction: 'Acknowledge',
  TypesettingAction: 'Typeset',

  //
  PublicationIssue: 'Issue',
  SpecialPublicationIssue: 'Special Issue',

  // permissions
  CreateGraphPermission: 'Accept incoming submission',
  ReadPermission: 'Read permission',
  WritePermission: 'Write permission',
  AdminPermission: 'Admin permission',
  InvitePermission: 'Invite permission',
  ViewIdentityPermission: 'View identity permission',

  // Comments
  Comment: 'Comment',
  ReviewerComment: 'Reviewer Comment',
  RevisionRequest: 'Revision Request',
  AuthorResponseComment: 'Author Response',

  // Abstracts
  WPAbstract: 'Abstract',
  WPImpactStatement: 'Impact statement'
};

export const WORKFLOW_ROLE_NAMES = ['editor', 'author', 'reviewer', 'producer'];

export const RE_TWITTER = /^http(s)?:\/\/(www\.)?twitter.com/i;
export const RE_FACEBOOK = /^http(s)?:\/\/(www\.)?facebook.com/i;
export const RE_ORCID = /^http(s)?:\/\/(www\.)?orcid.org/i;
