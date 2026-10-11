export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "SINGLE" | "MULTIPLE";
export type ExamStatus = "IN_PROGRESS" | "COMPLETED" | "AUTO_SUBMITTED";
export type Role = "ADMIN" | "USER";

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: T;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  status: string;
  totalPoints: number;
  accessToken: string;
  refreshToken: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: Role;
  status: string;
  total_points: number;
  total_attempts: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  question_count: number;
  createdAt: string;
};

export type CategoryDetail = Omit<Category, "question_count"> & {
  difficultyBreakdown: { difficulty: Difficulty; count: number }[];
};

export type QuestionOption = {
  key: string;
  text: string;
};

export type ExamQuestion = {
  questionId: string;
  order: number;
  questionType: QuestionType;
  questionText: string;
  options: QuestionOption[];
  difficulty: Difficulty;
  /** Only present when resuming an in-progress attempt. */
  selectedAnswers?: string[];
};

export type StartExamResponse = {
  attemptId: string;
  category: { id: string; name: string; slug: string };
  difficulty: Difficulty | "MIXED";
  questionCount: number;
  durationSeconds: number;
  startedAt: string;
  expiresAt: string;
  questions: ExamQuestion[];
};

export type SubmitExamResponse = {
  attemptId: string;
  questionCount: number;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  status: ExamStatus;
};

export type ResultQuestion = {
  order: number;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options: QuestionOption[];
  correctAnswers: string[];
  selectedAnswers: string[];
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string | null;
};

export type ExamResult = {
  attempt: {
    id: string;
    category: { name: string; slug: string };
    difficulty: Difficulty | "MIXED";
    questionCount: number;
    status: ExamStatus;
    totalScore: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    startedAt: string;
    submittedAt: string;
  };
  questions: ResultQuestion[];
};

export type HistoryItem = {
  id: string;
  difficulty: Difficulty | "MIXED";
  question_count: number;
  status: ExamStatus;
  total_score: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  started_at: string;
  submitted_at: string;
  category_name: string;
  category_slug: string;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  avatar: string | null;
  rank: number;
  /** Present on the global leaderboard. */
  total_points?: number;
  /** Present on the per-category leaderboard. */
  category_points?: number;
};

export type Leaderboard = {
  category?: { id: string; name: string; slug: string };
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
};

export type CategoryProgress = {
  id: string;
  name: string;
  slug: string;
  attempts: number;
  points: number;
  avg_accuracy: number;
};

export type Progress = {
  overall: {
    total_attempts: number;
    total_points_earned: number;
    total_correct: number;
    total_wrong: number;
    total_unanswered: number;
    total_questions_attempted: number;
    accuracy: number;
  };
  categoryBreakdown: CategoryProgress[];
  strongestCategory: CategoryProgress | null;
  weakestCategory: CategoryProgress | null;
  scoreTrend: {
    id: string;
    total_score: number;
    correct_count: number;
    question_count: number;
    createdAt: string;
    category_name: string;
  }[];
};
