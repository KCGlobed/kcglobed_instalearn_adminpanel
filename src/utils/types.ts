import type { ReactNode } from "react";


export interface LoginCred {
  email: string;
  password: string;
  role: string; // Optional, if you want to include user role in login
  device_id: string,
  device_type: string
}

export interface RoleName {
  name: string
}
export interface Role {
  data: RoleName[]
}
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
  role: Role;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  mobile: string | null;
  subscription_type: string;
  plan_info: {
    id: number;
    plan_name: string;
  }[];
  end_date: string;
  order_date: string;
}

export interface Essay {
  id: string;
  idnumber: string;
  question_json: any;
  exhibits: Exhibit[];
  level?: 'low' | 'medium' | 'high';
  pass_percentage?: string;
  course: {
    id: string;
    name: string;
  }
  subject: {
    id: string;
    name: string;
  }
  chapter: {
    id: string;
    name: string;
  }
  sim_type: {
    visible: string
  }
  visible: number,
  actions?: any;
}

export type Step = {
  title: string;
  content: ReactNode;
};

export type StepProps = {
  initData?: any,
  onDemandQuestionSave?: () => Promise<string>;
  stepKey: string;
  data: Record<string, any>;
  updateData: (key: string, values: Record<string, any>) => void;
};

export type MetaState = {
  questionId?: string;
  courseId?: string | number;
  subjectId?: string | number;
  chapterId?: string | number;
  difficulty_level?: 'low' | 'medium' | 'high';
  pass_percentage?: string;
  simulationId?: string;
};

export interface SubQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface Exhibit {
  name: string;
  exhibits_file: string;
  id?: number;
}
export interface QuestionState {
  description: string;
  exhibits: Exhibit[];
  subQuestions: SubQuestion[];
}
export interface EssayPagination {
  count: number;
  next: string | null;
  previous: string | null;
  results: Essay[];
}

export interface UserState {
  count: number;
  previous: string | null;
  next: string | null;
  results: User[];
  loading: boolean;
  error: string | null;
  page: number;
  type: number;
}
export interface EssayState {
  data: Essay[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
  selectedEssay: Essay | null;
  selectedEssayLoading: boolean;
}

/*--------glossary types----*/

export interface Glossary {
  id: number,
  alphabet: string,
  name: string,
  status: boolean,
  description?: string,
  actions?: any,
  subject?: number,
}

export interface GlossaryForm {
  name: string
  alphabet: string;
  course_id: string;
  description: string;
};

export interface GlossaryPagination {
  count: number;
  next: string | null;
  previous: string | null;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  }
  data: Glossary[];
}

export interface GlossaryState {
  data: Glossary[];
  count?: number;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  },
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
}

/*--------glossary types----*/


/*-----------Tags Start-----*/
export interface Tag {
  id: number;
  name: string;
  status: boolean;
  created_at?: string;
  actions?: any;
}
/*---------Tags End-----------*/


/*-------topic type start ----*/
export interface Topic {
  id: number,
  name: string,
  created_at?: string,
  status: boolean
  actions?: any,
}
export interface TopicPagination {
  count: number;
  next: string | null;
  previous: string | null;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  }
  data: Topic[];
}

export interface TopicState {
  data: Topic[];
  count?: number;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  },
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
}
/*-------topic type End ----*/
/*-------Subject Start ----*/
export interface Subject {
  id: number,
  name: string,
  created_at?: string,
  chapter_info?: {
    id: number;
    name: string;
    status: boolean;
    created_at: string;
  }[];
  status?: boolean,
  actions?: any,
}
export interface SubjectPagination {
  count: number;
  next: string | null;
  previous: string | null;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  }
  data: Subject[];
}
export interface SubjectState {
  data: Subject[];
  count?: number;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  },
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
}

/*-------Subject End ------*/

/*-------Pagination Interface Start ----*/
export interface Pagination<T> {
  data: T[];
  count?: number;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  },
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
}

/*-------Pagination Interface Start ----*/

/*-------student Start ----*/
export interface Student {
  id: number,
  first_name: string,
  last_name: string,
  email: string,
  phone1: "",
  image: null,
  is_active: boolean,
  actions?: any,
}

/*-------student End ----*/
/*-------category Start ----*/
export interface Category {
  id: number;
  name: string;
  description: string;
  parent?: Category | null;
  status?: boolean;
  created_at?: string;
  bg_code?: string | null;
  text_code?: string | null;
  icon?: string | null;
  actions?: any;
}

export interface Subcategory extends Category { }
/*-------category End ----*/



export interface ChapterDetail {
  id: number;
  name: string;
}

export interface BookChapter {
  id: number;
  name: string;
  book_file: string;
  chapter_detail: ChapterDetail;
  status: boolean;
  created_at: string;
}


export interface ChapterBookState {
  data: BookChapter[];
  count?: number;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  },
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
}


export interface ChapterBookPagination {
  count: number;
  next: string | null;
  previous: string | null;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  }
  data: BookChapter[];
}

export interface Plan {
  id: number;
  plan_name: string;
  amount: number;
  currency: string;
  plan_type: number;
  status: boolean;
  created_at: string;
};


export interface SubscriptionPagination {
  count: number;
  next: string | null;
  previous: string | null;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  }
  data: Plan[];
}


export interface SubscriptionState {
  data: Plan[];
  count?: number;
  pagination: {
    total_results: number | null, total_pages: number | null, current_page: number | null, next_page: number | null, page_size: number | null, previous_page: number | null
  },
  next: string | null;
  previous: string | null;
  page: number;
  loading: boolean;
  error: string | null;
}

/*-------MCQ Start ----*/

export interface Option {
  id: number;
  option: string;
}

export interface Mcq {
  id: number;
  id_number: string;
  level: number;
  chapter: {
    id: number;
    name: string;
  };
  status: boolean;
  question_detail: {
    id: number;
    question: string;
    solution_description: string;
  }
  pass_percentage: number;
  options: Option[];
  right_option: Option;
  created_at: string;
  actions?: any;
}

/*-------MCQ End ----*/
/*-------Free trail Start ----*/
type order_detail = {
  id: number;
  start_date: string;
  end_date: string | null;
};

export interface FreeTrailUser {
  billing_address: string;
  state: string;
  country: string;
  plan: any;
  total_amount: any;
  start_date: string;
  end_date: string;
  subscription_type: number;
  subscription_status: number;
  ordered_courses: any;
  user_detail: any;
  city: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  course_detail: {
    id: number;
    name: string;
  };
  order_detail: order_detail;
  actions?: any;
}
/*-------Free trail End ----*/
/*-------Free trail Course Start ----*/
export interface TrailCourse {
  id: number;
  course_detail: {
    id: number;
    name: string;
  };
  actions?: any,
}
/*-------Free trail Course End ----*/
/*-------Free trail Subject Start ----*/
export interface TrailSubject {
  id: number;
  course_detail: {
    id: number;
    name: string;
  };
  subject_info: {
    id: number;
    subject_detail: {
      id: number;
      name: string;
    }
  };
  actions?: any,
}

/*-------Free trail Subject End ----*/
/*-------Free trail Chapter Start ----*/
export interface TrailChapter {
  id: number;
  chapter_info: {
    id: number;
    order: number;
    chapter_detail: {
      id: number;
      name: string;
      status: boolean;
      created_at: string;
    }
  };
  subject_info: {
    id: number;
    subject_detail: {
      id: number;
      name: string;
    }
  };
  actions?: any,
}

/*-------Free trail Chapter End -----*/
/*-------IRS Publication Type Start -----*/
export interface IRSType {
  id: number;
  name: string;
  status: boolean;
  created_at: string;
  actions?: any,
}

export interface IRSFile {
  id: number;
  name: string;
  irs_type: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  };
  status: boolean;
  actions?: any,

}
/*-------IRS Publication Type End -----*/
/*-------Course Video Start -----*/
export interface CourseVideo {
  id: number;
  name: string;
  video_duration: string | number;
  description: string | null;
  is_completed: boolean;
  is_uploaded: boolean;
  status: boolean;
  created_at: string;
  actions?: any;
}
/*-------Course Video End -----*/
/*-------Ebook Start -----*/
export interface Ebook {
  id: number;
  name: string;
  book_file: string;
  status: boolean;
  created_at: string;
  actions?: any;
}
/*-------Ebook End -----*/
/*-------Manager User Start -----*/
export interface ManagerUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone1: string;
  address: string;
  city: string;
  state: string;
  country: string;
  dob: string;
  role: string;
  pincode: string;
  is_active: boolean;
  actions?: any,
}
/*-------Manager User Start -----*/



//--------Abhishek Manage Instructor start------------//

export interface Instructor {
  id: number,
  first_name: string,
  last_name: string,
  email: string,
  address: string,
  city: string,
  state: string,
  country: string,
  pincode: string,
  dob: string,
  is_active: boolean,
  status:boolean,
  role: number,
  created_at: string,
  actions?: any,
}


//--------Abhishek Manage Instructor end------------//


//--------Abhishek Manage Faq Topics start------------//
export interface FaqTopics {
  id: number;
  title: string;
  description: string;
  status: boolean;
  created_at: string;
  actions?: any;
}

export interface Faq extends FaqTopics {
  faq_topic_id: number;
  faq_topic?: {
    id: number;
    title: string;
  };
}

//--------------Faq End------------//


//---------------Abhishek Manage Courses start------------//


type CategoryInfo = {
  id: number;
  name: string;
  description: string;
  bg_code?: string | null;
  text_code?: string | null;
  icon?: string | null;
};

type CategoryItem = {
  id: number;
  category_info: CategoryInfo | null; // 👈 can be null sometimes
  created_at: string; // ISO date string
};

type TagsInfo = {
  id: number;
  name: string;
};

type TagItem = {
  id: number;
  tags: TagsInfo;
};

export interface Courses {
  id: number;
  name: string;
  level:number;
  short_description:string;
  description: string;
  categories: CategoryItem[];
  tags:TagItem[];
  duration: string;
  status: boolean;
  price:number;
  discount:number;
  objective_summary:string[];
  feature_json:string[];
  image:string;
  banner_image:string;
  created_at?: string;
  actions?: any,
}


//--------------------------Abhishek Manage Courses end------------//





// ----------------------------Abhishek Manage Chapter start-------------//



export interface Chapter {
  id: number,
  name: string,
  description?: string,
  created_at?: string,
  status?: boolean,
  actions?: any,
}


//---------------------Abhishek Manage Chapter end------------//

