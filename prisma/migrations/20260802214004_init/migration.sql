-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('OFF', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "CitizenshipStatus" AS ENUM ('US_CITIZEN', 'PERMANENT_RESIDENT', 'UNDOCUMENTED', 'DACA', 'INTERNATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "QuestBridgeStatus" AS ENUM ('NOT_APPLICABLE', 'APPLICANT', 'FINALIST', 'MATCHED', 'NOT_SELECTED');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('SAT', 'ACT', 'PSAT', 'AP', 'IB', 'TOEFL', 'IELTS', 'DUOLINGO', 'OTHER');

-- CreateEnum
CREATE TYPE "TestSendStatus" AS ENUM ('NOT_SENT', 'ORDERED', 'SENT', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "CollegeType" AS ENUM ('PUBLIC', 'PRIVATE_NONPROFIT', 'PRIVATE_FORPROFIT');

-- CreateEnum
CREATE TYPE "ApplicationPlatform" AS ENUM ('COMMON_APP', 'COALITION', 'UC', 'APPLY_TEXAS', 'QUESTBRIDGE', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationRound" AS ENUM ('ED1', 'ED2', 'EA', 'REA', 'SCEA', 'RD', 'ROLLING', 'QUESTBRIDGE_MATCH', 'PRIORITY', 'TRANSFER');

-- CreateEnum
CREATE TYPE "SchoolTier" AS ENUM ('REACH', 'TARGET', 'LIKELY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('RESEARCHING', 'PLANNING', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW', 'DECIDED', 'WITHDRAWN', 'COMMITTED');

-- CreateEnum
CREATE TYPE "DecisionOutcome" AS ENUM ('ACCEPTED', 'DENIED', 'DEFERRED', 'WAITLISTED', 'MATCHED', 'WITHDRAWN', 'NO_DECISION');

-- CreateEnum
CREATE TYPE "TestPolicy" AS ENUM ('REQUIRED', 'OPTIONAL', 'BLIND', 'REQUIRED_FOR_SOME');

-- CreateEnum
CREATE TYPE "InterviewPolicy" AS ENUM ('NONE', 'OPTIONAL_INFORMATIONAL', 'OPTIONAL_EVALUATIVE', 'REQUIRED', 'BY_INVITATION');

-- CreateEnum
CREATE TYPE "DeadlineKind" AS ENUM ('APPLICATION', 'CSS_PROFILE', 'FAFSA_PRIORITY', 'INSTITUTIONAL_AID', 'SCHOLARSHIP', 'HONORS_PROGRAM', 'INTERVIEW_REQUEST', 'INTERVIEW_COMPLETE', 'DECISION_RELEASE', 'MID_YEAR_REPORT', 'ENROLLMENT_DEPOSIT', 'HOUSING', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('ESSAY', 'TEACHER_REC', 'COUNSELOR_REC', 'SCHOOL_REPORT', 'MID_YEAR_REPORT', 'FINAL_REPORT', 'TRANSCRIPT', 'TEST_SCORES', 'PORTFOLIO', 'AUDITION', 'INTERVIEW', 'FEE_OR_WAIVER', 'CSS_PROFILE', 'FAFSA', 'IDOC', 'NONCUSTODIAL_PROFILE', 'SUPPLEMENT_FORM', 'LOCI', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'CONFIRMED_RECEIVED', 'WAIVED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "Origin" AS ENUM ('SEEDED', 'DERIVED', 'USER');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "PromptKind" AS ENUM ('PERSONAL_STATEMENT', 'WHY_US', 'WHY_MAJOR', 'COMMUNITY', 'DIVERSITY', 'ACTIVITY', 'INTELLECTUAL_INTEREST', 'CHALLENGE', 'SHORT_ANSWER', 'CREATIVE', 'ADDITIONAL_INFO', 'UC_PIQ', 'OTHER');

-- CreateEnum
CREATE TYPE "EssayStatus" AS ENUM ('NOT_STARTED', 'BRAINSTORM', 'OUTLINE', 'DRAFTING', 'REVISING', 'REVIEW', 'FINAL', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PLANNED', 'ADAPTING', 'READY', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "RecommenderRole" AS ENUM ('TEACHER', 'COUNSELOR', 'MENTOR', 'EMPLOYER', 'COACH', 'PEER', 'OTHER');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('NOT_ASKED', 'ASKED', 'AGREED', 'DECLINED', 'INVITED', 'IN_PROGRESS', 'SUBMITTED', 'CONFIRMED_RECEIVED');

-- CreateEnum
CREATE TYPE "AidRequirementKind" AS ENUM ('FAFSA', 'CSS_PROFILE', 'NONCUSTODIAL_PROFILE', 'IDOC_DOCUMENT', 'INSTITUTIONAL_FORM', 'VERIFICATION', 'TAX_RETURN', 'W2', 'BUSINESS_SUPPLEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "IdocStatus" AS ENUM ('NOT_REQUIRED', 'REQUIRED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('NONE', 'CONSIDERING', 'SUBMITTED', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "ScholarshipScope" AS ENUM ('LOCAL', 'REGIONAL', 'STATE', 'NATIONAL', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "ScholarshipStatus" AS ENUM ('SAVED', 'IN_PROGRESS', 'SUBMITTED', 'AWARDED', 'REJECTED', 'NOT_PURSUED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('ALUMNI', 'ON_CAMPUS', 'VIRTUAL', 'FACULTY', 'GROUP', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('NOT_AVAILABLE', 'AVAILABLE', 'REQUESTED', 'SCHEDULED', 'COMPLETED', 'DECLINED', 'WAIVED');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('CAMPUS_TOUR', 'INFO_SESSION', 'OVERNIGHT', 'VIRTUAL_TOUR', 'COLLEGE_FAIR', 'CLASS_VISIT', 'ADMITTED_STUDENT_DAY');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TRANSCRIPT', 'RESUME', 'BRAG_SHEET', 'AWARD_LETTER', 'TAX_RETURN', 'W2', 'ESSAY_EXPORT', 'PORTFOLIO', 'TEST_REPORT', 'ACCEPTANCE_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('DEADLINE', 'TASK', 'INTERVIEW', 'VISIT', 'DECISION_RELEASE', 'PERSONAL');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('APPLICATION', 'COLLEGE', 'ESSAY', 'TASK', 'SCHOLARSHIP', 'RECOMMENDATION', 'RECOMMENDER', 'DOCUMENT', 'NOTE', 'DEADLINE', 'REQUIREMENT', 'INTERVIEW', 'VISIT', 'AID_REQUIREMENT', 'AID_AWARD');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'COMPLETED', 'SUBMITTED', 'DECISION_RECORDED', 'VERSION_SAVED', 'COMMENTED', 'DELETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DEADLINE_APPROACHING', 'OVERDUE', 'REC_STALE', 'PORTAL_SWEEP', 'DECISION_EXPECTED', 'MILESTONE', 'DIGEST', 'RULE_VIOLATION');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "MilestoneKind" AS ENUM ('FIRST_APPLICATION', 'FIRST_SUBMISSION', 'ALL_EARLY_SUBMITTED', 'ALL_ESSAYS_DONE', 'ALL_RECS_IN', 'FAFSA_FILED', 'FIRST_ACCEPTANCE', 'ALL_SUBMITTED', 'FULLY_FUNDED', 'COMMITTED');

-- CreateEnum
CREATE TYPE "RuleCode" AS ENUM ('MULTIPLE_BINDING_ED', 'REA_EXCLUSIVITY', 'QUESTBRIDGE_ED_CONFLICT', 'ED_ACCEPTED_MUST_WITHDRAW', 'FINAL_REPORT_ORDERING', 'MISSING_FERPA_WAIVER', 'DEADLINE_OVERLOAD', 'UNBALANCED_LIST');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('BLOCKER', 'WARNING', 'INFO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "highSchoolName" TEXT,
    "ceebCode" TEXT,
    "gpaUnweighted" DECIMAL(4,3),
    "gpaWeighted" DECIMAL(4,3),
    "classRank" INTEGER,
    "classSize" INTEGER,
    "intendedMajors" TEXT[],
    "residencyState" TEXT,
    "citizenship" "CitizenshipStatus",
    "isFirstGeneration" BOOLEAN NOT NULL DEFAULT false,
    "needsFinancialAid" BOOLEAN NOT NULL DEFAULT true,
    "feeWaiverEligible" BOOLEAN NOT NULL DEFAULT false,
    "parentsSeparated" BOOLEAN NOT NULL DEFAULT false,
    "questBridgeStatus" "QuestBridgeStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "ferpaWaiverSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 0,
    "digestFrequency" "DigestFrequency" NOT NULL DEFAULT 'DAILY',
    "digestHourLocal" INTEGER NOT NULL DEFAULT 8,
    "reminderOffsetsDays" INTEGER[] DEFAULT ARRAY[30, 14, 7, 3, 1, 0]::INTEGER[],
    "recLeadTimeDays" INTEGER NOT NULL DEFAULT 28,
    "essayLeadTimeDays" INTEGER NOT NULL DEFAULT 21,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "confettiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TestType" NOT NULL,
    "label" TEXT,
    "score" INTEGER NOT NULL,
    "subscores" JSONB,
    "takenOn" TIMESTAMP(3) NOT NULL,
    "isSuperscoreEligible" BOOLEAN NOT NULL DEFAULT true,
    "sendStatus" "TestSendStatus" NOT NULL DEFAULT 'NOT_SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "ipedsId" TEXT,
    "type" "CollegeType",
    "platforms" "ApplicationPlatform"[],
    "isQuestBridgePartner" BOOLEAN NOT NULL DEFAULT false,
    "requiresCssProfile" BOOLEAN NOT NULL DEFAULT false,
    "isNeedBlind" BOOLEAN NOT NULL DEFAULT false,
    "meetsFullNeed" BOOLEAN NOT NULL DEFAULT false,
    "admitRate" DECIMAL(5,4),
    "sat25" INTEGER,
    "sat75" INTEGER,
    "act25" INTEGER,
    "act75" INTEGER,
    "undergradEnrollment" INTEGER,
    "costOfAttendanceCents" INTEGER,
    "testPolicy" "TestPolicy",
    "interviewPolicy" "InterviewPolicy",
    "requiredTeacherRecs" INTEGER NOT NULL DEFAULT 0,
    "requiresCounselorRec" BOOLEAN NOT NULL DEFAULT false,
    "maxTeacherRecs" INTEGER,
    "website" TEXT,
    "admissionsUrl" TEXT,
    "netPriceCalculatorUrl" TEXT,
    "portalUrlHint" TEXT,
    "dataSource" TEXT,
    "dataVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeDeadlineTemplate" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "round" "ApplicationRound" NOT NULL,
    "kind" "DeadlineKind" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "confidence" "Confidence" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeDeadlineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollegeRequirementTemplate" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "round" "ApplicationRound" NOT NULL,
    "type" "RequirementType" NOT NULL,
    "label" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "detail" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeRequirementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayPromptTemplate" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "round" "ApplicationRound",
    "platform" "ApplicationPlatform" NOT NULL,
    "prompt" TEXT NOT NULL,
    "wordMin" INTEGER,
    "wordMax" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "promptKind" "PromptKind" NOT NULL DEFAULT 'OTHER',
    "topicTags" TEXT[],
    "confidence" "Confidence" NOT NULL DEFAULT 'UNVERIFIED',
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayPromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "cycleYear" INTEGER NOT NULL,
    "round" "ApplicationRound" NOT NULL,
    "platform" "ApplicationPlatform" NOT NULL,
    "tier" "SchoolTier",
    "status" "ApplicationStatus" NOT NULL DEFAULT 'RESEARCHING',
    "priority" INTEGER NOT NULL DEFAULT 2,
    "intendedMajor" TEXT,
    "isHonorsProgram" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "applicationFeeCents" INTEGER,
    "feeWaiverApplied" BOOLEAN NOT NULL DEFAULT false,
    "decision" "DecisionOutcome",
    "decidedAt" TIMESTAMP(3),
    "isBindingCommitment" BOOLEAN NOT NULL DEFAULT false,
    "enrollmentDepositPaidAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalAccount" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT,
    "applicantId" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "RequirementType" NOT NULL,
    "label" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "RequirementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "dueAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "confirmedReceivedAt" TIMESTAMP(3),
    "origin" "Origin" NOT NULL DEFAULT 'DERIVED',
    "sourceTemplateId" TEXT,
    "isUserOverridden" BOOLEAN NOT NULL DEFAULT false,
    "essayPromptId" TEXT,
    "recommendationId" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "scholarshipId" TEXT,
    "kind" "DeadlineKind" NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "isHard" BOOLEAN NOT NULL DEFAULT true,
    "origin" "Origin" NOT NULL DEFAULT 'DERIVED',
    "confidence" "Confidence" NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Essay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "promptText" TEXT,
    "wordLimit" INTEGER,
    "charLimit" INTEGER,
    "status" "EssayStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "promptKind" "PromptKind" NOT NULL DEFAULT 'OTHER',
    "topicTags" TEXT[],
    "isMaster" BOOLEAN NOT NULL DEFAULT false,
    "parentEssayId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Essay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayVersion" (
    "id" TEXT NOT NULL,
    "essayId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "label" TEXT,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "charCount" INTEGER NOT NULL,
    "readingTimeSeconds" INTEGER NOT NULL,
    "isAutosave" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EssayVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayPrompt" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "sourceTemplateId" TEXT,
    "prompt" TEXT NOT NULL,
    "wordMin" INTEGER,
    "wordMax" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "promptKind" "PromptKind" NOT NULL DEFAULT 'OTHER',
    "topicTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayAssignment" (
    "id" TEXT NOT NULL,
    "essayId" TEXT NOT NULL,
    "applicationId" TEXT,
    "essayPromptId" TEXT,
    "scholarshipId" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PLANNED',
    "submittedVersionId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "fitWarnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayComment" (
    "id" TEXT NOT NULL,
    "essayVersionId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorName" TEXT,
    "quotedText" TEXT,
    "rangeStart" INTEGER,
    "rangeEnd" INTEGER,
    "body" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommender" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "RecommenderRole" NOT NULL,
    "subject" TEXT,
    "relationship" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "bragSheetDocumentId" TEXT,
    "maxLettersWilling" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "recommenderId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'NOT_ASKED',
    "askedAt" TIMESTAMP(3),
    "agreedAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "confirmedReceivedAt" TIMESTAMP(3),
    "thankedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAidProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fafsaSubmittedAt" TIMESTAMP(3),
    "fafsaConfirmation" TEXT,
    "studentAidIndex" INTEGER,
    "fsaIdCreatedAt" TIMESTAMP(3),
    "cssProfileSubmittedAt" TIMESTAMP(3),
    "cssFeeWaiverGranted" BOOLEAN NOT NULL DEFAULT false,
    "noncustodialRequired" BOOLEAN NOT NULL DEFAULT false,
    "noncustodialSubmittedAt" TIMESTAMP(3),
    "idocStatus" "IdocStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "verificationSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAidProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidRequirement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "kind" "AidRequirementKind" NOT NULL,
    "label" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" "RequirementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "documentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidAward" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "costOfAttendanceCents" INTEGER NOT NULL,
    "tuitionFeesCents" INTEGER,
    "roomBoardCents" INTEGER,
    "booksOtherCents" INTEGER,
    "institutionalGrantCents" INTEGER NOT NULL DEFAULT 0,
    "federalGrantCents" INTEGER NOT NULL DEFAULT 0,
    "stateGrantCents" INTEGER NOT NULL DEFAULT 0,
    "meritScholarshipCents" INTEGER NOT NULL DEFAULT 0,
    "outsideScholarshipCents" INTEGER NOT NULL DEFAULT 0,
    "workStudyCents" INTEGER NOT NULL DEFAULT 0,
    "subsidizedLoanCents" INTEGER NOT NULL DEFAULT 0,
    "unsubsidizedLoanCents" INTEGER NOT NULL DEFAULT 0,
    "parentPlusLoanCents" INTEGER NOT NULL DEFAULT 0,
    "awardLetterDocumentId" TEXT,
    "appealStatus" "AppealStatus" NOT NULL DEFAULT 'NONE',
    "receivedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "url" TEXT,
    "amountCents" INTEGER,
    "isRenewable" BOOLEAN NOT NULL DEFAULT false,
    "scope" "ScholarshipScope" NOT NULL DEFAULT 'NATIONAL',
    "effortEstimateMinutes" INTEGER,
    "deadlineAt" TIMESTAMP(3),
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'SAVED',
    "awardedAmountCents" INTEGER,
    "requirementsNote" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "InterviewType" NOT NULL,
    "isEvaluative" BOOLEAN NOT NULL DEFAULT true,
    "status" "InterviewStatus" NOT NULL DEFAULT 'NOT_AVAILABLE',
    "requestByAt" TIMESTAMP(3),
    "completeByAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "interviewerName" TEXT,
    "interviewerEmail" TEXT,
    "location" TEXT,
    "prepNotes" TEXT,
    "reflectionNotes" TEXT,
    "thankYouSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "type" "VisitType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "countsAsDemonstratedInterest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" INTEGER NOT NULL DEFAULT 2,
    "labels" TEXT[],
    "dueAt" TIMESTAMP(3),
    "startAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimateMinutes" INTEGER,
    "sortOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "parentTaskId" TEXT,
    "applicationId" TEXT,
    "essayId" TEXT,
    "scholarshipId" TEXT,
    "recommendationId" TEXT,
    "aidRequirementId" TEXT,
    "recurrenceRule" TEXT,
    "recurrenceParentId" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "generatorKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "blockingTaskId" TEXT NOT NULL,
    "blockedTaskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "applicationId" TEXT,
    "scholarshipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "plainText" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" TEXT,
    "collegeId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "type" "CalendarEventType" NOT NULL,
    "deadlineId" TEXT,
    "taskId" TEXT,
    "interviewId" TEXT,
    "visitId" TEXT,
    "applicationId" TEXT,
    "externalUid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "isMilestone" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" "EntityType",
    "entityId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "channels" "NotificationChannel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "MilestoneKind" NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "celebratedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleFinding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" "RuleCode" NOT NULL,
    "severity" "Severity" NOT NULL,
    "entityKey" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "explanation" TEXT,
    "citationUrl" TEXT,
    "entityIds" TEXT[],
    "dismissedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "TestScore_userId_type_idx" ON "TestScore"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "College_ipedsId_key" ON "College"("ipedsId");

-- CreateIndex
CREATE INDEX "College_name_idx" ON "College"("name");

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "CollegeDeadlineTemplate_collegeId_cycleYear_idx" ON "CollegeDeadlineTemplate"("collegeId", "cycleYear");

-- CreateIndex
CREATE UNIQUE INDEX "CollegeDeadlineTemplate_collegeId_cycleYear_round_kind_key" ON "CollegeDeadlineTemplate"("collegeId", "cycleYear", "round", "kind");

-- CreateIndex
CREATE INDEX "CollegeRequirementTemplate_collegeId_cycleYear_idx" ON "CollegeRequirementTemplate"("collegeId", "cycleYear");

-- CreateIndex
CREATE INDEX "EssayPromptTemplate_collegeId_cycleYear_idx" ON "EssayPromptTemplate"("collegeId", "cycleYear");

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE INDEX "Application_userId_round_idx" ON "Application"("userId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_collegeId_cycleYear_key" ON "Application"("userId", "collegeId", "cycleYear");

-- CreateIndex
CREATE UNIQUE INDEX "PortalAccount_applicationId_key" ON "PortalAccount"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_essayPromptId_key" ON "Requirement"("essayPromptId");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_recommendationId_key" ON "Requirement"("recommendationId");

-- CreateIndex
CREATE INDEX "Requirement_applicationId_status_idx" ON "Requirement"("applicationId", "status");

-- CreateIndex
CREATE INDEX "Deadline_userId_dueAt_idx" ON "Deadline"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "Deadline_applicationId_idx" ON "Deadline"("applicationId");

-- CreateIndex
CREATE INDEX "Essay_userId_status_idx" ON "Essay"("userId", "status");

-- CreateIndex
CREATE INDEX "EssayVersion_essayId_createdAt_idx" ON "EssayVersion"("essayId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EssayVersion_essayId_versionNumber_key" ON "EssayVersion"("essayId", "versionNumber");

-- CreateIndex
CREATE INDEX "EssayPrompt_applicationId_idx" ON "EssayPrompt"("applicationId");

-- CreateIndex
CREATE INDEX "EssayAssignment_essayId_idx" ON "EssayAssignment"("essayId");

-- CreateIndex
CREATE UNIQUE INDEX "EssayAssignment_essayId_essayPromptId_key" ON "EssayAssignment"("essayId", "essayPromptId");

-- CreateIndex
CREATE UNIQUE INDEX "EssayAssignment_essayId_scholarshipId_key" ON "EssayAssignment"("essayId", "scholarshipId");

-- CreateIndex
CREATE INDEX "EssayComment_essayVersionId_idx" ON "EssayComment"("essayVersionId");

-- CreateIndex
CREATE INDEX "Recommender_userId_idx" ON "Recommender"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_applicationId_status_idx" ON "Recommendation"("applicationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_recommenderId_applicationId_key" ON "Recommendation"("recommenderId", "applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAidProfile_userId_key" ON "FinancialAidProfile"("userId");

-- CreateIndex
CREATE INDEX "AidRequirement_userId_status_idx" ON "AidRequirement"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AidAward_applicationId_key" ON "AidAward"("applicationId");

-- CreateIndex
CREATE INDEX "Scholarship_userId_status_idx" ON "Scholarship"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_applicationId_key" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Visit_userId_occurredAt_idx" ON "Visit"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "Task_userId_status_dueAt_idx" ON "Task"("userId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Task_applicationId_idx" ON "Task"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_userId_generatorKey_key" ON "Task"("userId", "generatorKey");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_blockingTaskId_blockedTaskId_key" ON "TaskDependency"("blockingTaskId", "blockedTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_userId_type_idx" ON "Document"("userId", "type");

-- CreateIndex
CREATE INDEX "Note_userId_updatedAt_idx" ON "Note"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_externalUid_key" ON "CalendarEvent"("externalUid");

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_startAt_idx" ON "CalendarEvent"("userId", "startAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_userId_occurredAt_idx" ON "ActivityEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_entityType_entityId_idx" ON "ActivityEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_userId_kind_key" ON "Milestone"("userId", "kind");

-- CreateIndex
CREATE INDEX "RuleFinding_userId_resolvedAt_idx" ON "RuleFinding"("userId", "resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RuleFinding_userId_code_entityKey_key" ON "RuleFinding"("userId", "code", "entityKey");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestScore" ADD CONSTRAINT "TestScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeDeadlineTemplate" ADD CONSTRAINT "CollegeDeadlineTemplate_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeRequirementTemplate" ADD CONSTRAINT "CollegeRequirementTemplate_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayPromptTemplate" ADD CONSTRAINT "EssayPromptTemplate_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalAccount" ADD CONSTRAINT "PortalAccount_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_essayPromptId_fkey" FOREIGN KEY ("essayPromptId") REFERENCES "EssayPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Essay" ADD CONSTRAINT "Essay_parentEssayId_fkey" FOREIGN KEY ("parentEssayId") REFERENCES "Essay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayVersion" ADD CONSTRAINT "EssayVersion_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayPrompt" ADD CONSTRAINT "EssayPrompt_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayAssignment" ADD CONSTRAINT "EssayAssignment_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayAssignment" ADD CONSTRAINT "EssayAssignment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayAssignment" ADD CONSTRAINT "EssayAssignment_essayPromptId_fkey" FOREIGN KEY ("essayPromptId") REFERENCES "EssayPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayAssignment" ADD CONSTRAINT "EssayAssignment_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayAssignment" ADD CONSTRAINT "EssayAssignment_submittedVersionId_fkey" FOREIGN KEY ("submittedVersionId") REFERENCES "EssayVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayComment" ADD CONSTRAINT "EssayComment_essayVersionId_fkey" FOREIGN KEY ("essayVersionId") REFERENCES "EssayVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommender" ADD CONSTRAINT "Recommender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "Recommender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAidProfile" ADD CONSTRAINT "FinancialAidProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidRequirement" ADD CONSTRAINT "AidRequirement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidRequirement" ADD CONSTRAINT "AidRequirement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidRequirement" ADD CONSTRAINT "AidRequirement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidAward" ADD CONSTRAINT "AidAward_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_aidRequirementId_fkey" FOREIGN KEY ("aidRequirementId") REFERENCES "AidRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_blockingTaskId_fkey" FOREIGN KEY ("blockingTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_blockedTaskId_fkey" FOREIGN KEY ("blockedTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "Deadline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleFinding" ADD CONSTRAINT "RuleFinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
