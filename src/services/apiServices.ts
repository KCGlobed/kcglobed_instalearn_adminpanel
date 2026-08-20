import { apiRequest } from "./apiRequest";

export const forgotPassword = async (payload: { email: string }): Promise<any> => {
  return await apiRequest(`user/admin-forgot-password/`, 'POST', payload);
};

export const resetPassword = async (payload: { password: string, confirm_password: string, uid: string, token: string }): Promise<any> => {
  return await apiRequest(`user/reset-password/`, 'POST', payload);
};

// ----------------category service start------- //
export async function fetchCategory(page = 1, search: string = "", name: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-category-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createCategory = async (payload: any): Promise<any> => {
  return await apiRequest(`course/create-category/`, 'POST', payload);
};

export const deleteCategory = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-category/${id}`, 'DELETE');
}

export const downloadCategoryPdfApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-category-listing-pdf?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadCategoryExcelApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-category-listing-excel?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const updateCategoryApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`course/edit-category/${id}`, 'POST', payload);
}

export const updateCategoryStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-category-status/${id}`, 'POST', payload);
}

// ----------------category service end------- //
// ----------------sub category service start------- //
export async function fetchSubcategory(page = 1, search: string = "", name: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-subcategory-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const downloadSubCategoryPdfApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-subcategory-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadSubCategoryExcelApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-subcategory-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const createSubCategory = async (payload: any): Promise<any> => {
  return await apiRequest(`course/create-subcategory/`, 'POST', payload);
};

export const updateSubCategoryApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`course/edit-subcategory/${id}`, 'POST', payload);
}

export const deleteSubCategory = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-subcategory/${id}`, 'DELETE');
}

export async function fetchSubCategoryParentList(): Promise<any> {
  const res: any = await apiRequest(`course/get-parent-category/`, "GET");
  return res; // returns { count, next, previous, results } or array
}
export const updateSubCategoryStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-subcategory-status/${id}`, 'POST', payload);
}

// ----------------sub category service end------- //
// ----------------tags service start------- //
export async function fetchTags(page = 1, search: string = "", ordering: string = "", status: string, start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-tags-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res = await apiRequest(query, "GET");
  return res;
}

export const createTag = async (payload: any): Promise<any> => {
  return await apiRequest(`course/create-tags/`, 'POST', payload);
};

export const deleteTag = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-tags/${id}`, 'DELETE');
}

export const updateTagApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`course/edit-tags/${id}`, 'POST', payload)
}

export const updateTagStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-tags-status/${id}`, 'POST', payload)
}

export const downloadTagsPdfApi = async ({ search = "", name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-tags-listing-pdf?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadTagsExcelApi = async ({ search = "", name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-tags-listing-excel?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}
// ----------------tags service end------- //




// ----------------video service start------- //
export async function fetchVideo(page = 1, search: string = "", name: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-videos-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}

export const createVideo = async (payload: any): Promise<any> => {
  return await apiRequest(`course/upload-video/`, 'POST', payload);
};

export const updateVideoApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`course/update-video/${id}`, 'POST', payload);
}

export const deleteVideo = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-video/${id}`, 'DELETE');
}

export const updateVideoStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-video-status/${id}`, 'POST', payload);
}

export const markVideoCompleteApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/make-upload-complete/${id}`, 'POST', payload);
}
// ----------------video service end------- //





// ----------------ebook service start------- //
export async function fetchEbook(page = 1, search: string = "", name: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-book-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}

export const createEbook = async (payload: any): Promise<any> => {
  return await apiRequest(`course/create-book/`, 'POST', payload);
};

export const updateEbookApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`course/edit-book/${id}`, 'POST', payload);
}

export const deleteEbook = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-book/${id}`, 'DELETE');
}

export const updateEbookStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-book-status/${id}`, 'POST', payload);
}

export const downloadEbookPdfApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-ebook-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadEbookExcelApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-ebook-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export async function fetchEbookViewData(id: string | number): Promise<any> {
  const res: any = await apiRequest(`course/view-book-detail/${id}`, "GET");
  return res; // returns { count, next, previous, results } or array
}
// ----------------ebook service end------- //

// ----------------mcq service start------- //
export async function fetchMcq(page = 1, search: string = "", id_number: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `questions/get-mcqs-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${id_number ? `&id_number=${encodeURIComponent(id_number)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}

export async function fetchMcqDetailApi(id: string | number): Promise<any> {
  return await apiRequest(`questions/view-mcq-detail/${id}`, "GET");
}

export const createMcq = async (payload: any): Promise<any> => {
  return await apiRequest(`questions/create-mcq/`, 'POST', payload);
};

export const updateMcqApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`questions/edit-mcq/${id}`, 'POST', payload);
}

export const deleteMcqApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`questions/delete-mcq/${id}`, 'DELETE');
}

export const updateMcqStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`questions/update-mcq-status/${id}`, 'POST', payload);
}

export const downloadMcqPdfApi = async ({ search = "", name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`questions/export-mcqs-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadMcqExcelApi = async ({ search = "", name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`questions/export-mcqs-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export async function fetchChapterListApi(): Promise<any> {
  const res: any = await apiRequest(`course/get-chapters-list/`, "GET");
  return res; // returns { count, next, previous, results } or array
}
export const importMcq = async (payload: any): Promise<any> => {
  return await apiRequest(`questions/import-mcqs/`, 'POST', payload);
};

// ----------------mcq service end------- //

//-----------------------Abhishek Manage Instructor start ------------//

export async function fetchInstructor(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/instructor?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}
export const createInstructor = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/instructor`, 'POST', payload);
};

export const updateInstructorApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/instructor/${id}`, 'POST', payload);
};

export const deleteInstructorApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`user/delete-user/instructor/${id}`, 'DELETE');
};

export const updateInstructorStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/instructor/${id}`, 'POST', payload);
};

export const downloadInstructorPdfApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-instructor-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadInstructorExcelApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-instructor-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}



export const updateInstructorPublicProfileApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`user/update-instructor-public-profile/${id}`, 'POST', payload);
};

//----------------------------------------Abhishek Manage Instructor end ---------------------------------------------------------//

//==============================Abhishek Manage Faq Topics ===================

export async function fetchFaqTopicsApi(page = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", start_date: string = "", end_date: string = "", status: string = ""): Promise<any> {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  let query = `cms/get-faq-topic-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${encodeURIComponent(ordering)}` : ""}${statusVal ? `&status=${encodeURIComponent(statusVal)}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}

export const addFaqTopicApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-faq-topic/`, 'POST', payload);
};

export const updateFaqTopicApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-faq-topic/${id}`, 'POST', payload);
};

export const deleteFaqTopicApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-faq-topic/${id}`, 'DELETE');
};

export const updateFaqTopicStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-faq-topic-status/${id}`, 'POST', payload);
};


// ----------------------------- Abhishek manage Faq --------------------------------------------//

export const fetchFaqApi = async (page: number = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> => {
  const statusVal = status === "active" ? "1" : status === 'deactive' ? '0' : "";
  let query = `cms/get-faq-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${encodeURIComponent(ordering)}` : ""}${statusVal ? `&status=${encodeURIComponent(statusVal)}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return apiRequest(query, 'GET')
}

export const addFaqApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-faq/`, 'POST', payload);
};

export const updateFaqApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-faq/${id}`, 'POST', payload);
};

export const deleteFaqApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-faq/${id}`, 'DELETE');
};

export const updateFaqStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-faq-status/${id}`, 'POST', payload);
};

export const fetchParentFaqApi = async () => {
  const res: any = await apiRequest(`cms/get-faq-topic-list/`, 'GET');
  return res;
}


// ----------------course service start------- //

export async function fetchCourseApi(page = 1, search: string = "", name: string = "", chapter: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-course-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const deleteCourseApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-course/${id}`, 'DELETE');
};

export const updateCourseStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-course-status/${id}`, 'POST', payload);
};

export const downloadCoursePdfApi = async ({ search = "", name = "", chapter = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-course-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal !== '' ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
};

export const downloadCourseExcelApi = async ({ search = "", name = "", chapter = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-course-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal !== '' ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
};


export const fetchChapterOptionsApi = async () => {
  const res: any = await apiRequest(`course/get-chapters-list/`, 'GET');
  return res;
}

// ----------------course service end------- //




//-------------------chapter service start------------------//
export const getChapterApi = async (page = 1, search: string = "", name: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : "";
  let query = `course/get-chapter-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createChapter = async (payload: any): Promise<any> => {
  return apiRequest(`course/create-chapter/`, 'POST', payload)
}

export const updateChapterApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`course/edit-chapter/${id}`, 'POST', payload);
};

export const deleteChapterApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-chapter/${id}`, 'DELETE');
};

export const updateChapterStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-chapter-status/${id}`, 'POST', payload);
};

export const downloadChapterPdfApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-chapter-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadChapterExcelApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-chapter-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const fetchChapterViewData = async (id: string | number): Promise<any> => {
  const res = await apiRequest(`course/view-chapter-detail/${id}`, 'GET');
  return res;
}

//----- video api start -------//
export const downloadVideoPdfApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-video-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadVideoExcelApi = async ({ search = "", name = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-video-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}


export const videoDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/view-video-detail/${id}`, 'GET');
};


//-----video api end -------------//


// ---Assign chapter Himanshu Start ---//

export const getEbookListApi = async () => {
  const res: any = await apiRequest(`course/get-ebook-list/`, 'GET');
  return res;
}

export const getVideoListApi = async () => {
  const res: any = await apiRequest(`course/get-video-list/`, 'GET');
  return res;
}

export const createAssignChapterLecture = async (payload: any): Promise<any> => {
  return apiRequest(`course/assign-chapter-lecture/`, 'POST', payload)
}

export const getBookSignedUrlApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/get-book-signed-url/${id}`, 'GET');
};

// ---Assign chapter Himanshu End ---//


// ---Course Himanshu Start ---//

export const createCourseApi = async (payload: any): Promise<any> => {
  return apiRequest(`course/create-course/`, 'POST', payload)
}

export const fetchSubCategoryOptionsApi = async () => {
  const res: any = await apiRequest(`course/get-sub-category-listing/`, 'GET');
  return res;
}

export const fetchCategorySubcategoryListApi = async (): Promise<any> => {
  return await apiRequest(`course/get-category-subcategory-list/`, 'GET');
}

export const fetchTagOptionsApi = async () => {
  const res: any = await apiRequest(`course/get-tags-list/`, 'GET');
  return res;
}

export const courseDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/view-course-detail/${id}`, 'GET');
};

export const updateCourseApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`course/edit-course/${id}`, 'POST', payload);
};

export const assignChapterApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`course/assign-chapter-course/${id}`, 'POST', payload);
};

export const fetchCourseDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/view-course-detail/${id}`, 'GET');
};

export const assignRelatedCourseApi = async (payload: any): Promise<any> => {
  return await apiRequest(`course/add-related-courses/`, 'POST', payload);
};

export const fetchRelatedCourseOptionsApi = async () => {
  const res: any = await apiRequest(`course/get-course-list/`, 'GET');
  return res;
}

export const assignSampleVideoApi = async (payload: any): Promise<any> => {
  return await apiRequest(`course/upload-course-sample-video/`, 'POST', payload);
};

export const deleteSampleVideoApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-courses-sample-video/${id}`, 'DELETE');
};

export const fetchInstructorOptionsApi = async () => {
  const res: any = await apiRequest(`course/get-instructor-list/`, 'GET');
  return res;
}

export const assignInstructorApi = async (payload: any): Promise<any> => {
  return await apiRequest(`course/add-course-instructor/`, 'POST', payload);
};

// ---Course  End ---//

// ---Payment Settings Start ---//

export const fetchPaymentSettingsApi = async () => {
  const res: any = await apiRequest(`cms/get-setting/`, 'GET');
  return res;
}

export const updatePaymentSettingsApi = async (payload: any): Promise<any> => {
  return apiRequest(`cms/update-setting/`, 'POST', payload)
}

// ---Payment Settings End ---//

// ----course included start----//

export const assignCourseIncludedApi = async (payload: any): Promise<any> => {
  return apiRequest(`course/upload-course-includes/`, 'POST', payload);
};

export const deleteCourseIncludedApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-courses-includes/${id}`, 'DELETE');
};

export const fetchCourseIncludedApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/get-courses-includes-listing/${id}`, 'GET');
};

// ----course included end----//







//----------------Abhishek Manage Student Start----------//

export const fetchStudents = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", description: string = "", ordering: string = "", is_active: string = "", start_date: string = "", end_date: string = "", email: string = "", status: string = ""): Promise<any> => {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-student-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const viewStudentDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`user/view-student-detail/${id}`, 'GET');
};


export const createStudentApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-student/`, 'POST', payload);
};

export const updateStudentApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-student/${id}`, 'POST', payload);
};


export const updateStudentStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-student-status/${id}`, 'POST', payload);
};

export const downloadStudentPdfApi = async ({ search = "", first_name = "", last_name = "", is_active = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-student-registration-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadStudentExcelApi = async ({ search = "", first_name = "", last_name = "", is_active = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-student-registration-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadVideoReportPdfApi = async () => {
  return await apiRequest(`reports/get-video-watch-report-pdf/`, 'GET');
}

export const downloadVideoWatchReportPdfApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/download-video-report/${id}/${courseId}`, 'GET');
}

export const downloadVideoWatchReportExcelApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/download-video-report-csv/${id}/${courseId}`, 'GET');
}

export const downloadCorporateStudentVideoReportPdfApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/download-student-video-report-pdf/${id}/${courseId}`, 'GET');
}

export const downloadCorporateStudentVideoReportExcelApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/download-student-video-report-csv/${id}/${courseId}`, 'GET');
}

export const downloadCorporateStudentNotesReportPdfApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/get-notes-listing-report-pdf/${id}/${courseId}`, 'GET');
}

export const downloadCorporateStudentNotesReportExcelApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/get-notes-listing-report-excel/${id}/${courseId}`, 'GET');
}

export const fetchStudentVideoReportsApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/get-video-report/${id}/${courseId}`, 'GET');
}

export const changeStudentPasswordApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/admin-update-password/`, 'POST', payload);
}

export const changeInstructorPasswordApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/admin-update-password/`, 'POST', payload);
}

export const changeCorporateAdminPasswordApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/admin-update-password/`, 'POST', payload);
};



//----------------Abhishek Manage Student End----------//

export const fetchStudentLoginActivityApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`reports/get-student-login-activity/${id}`, 'GET');
}

export const downloadStudentLoginActivityPdfApi = async (id: string | number) => {
  return await apiRequest(`reports/get-student-login-activity-pdf-report/${id}`, 'GET');
}

export const downloadStudentLoginActivityExcelApi = async (id: string | number) => {
  return await apiRequest(`reports/get-student-login-activity-excel-report/${id}`, 'GET');
}

export const fetchCorporateStudentActivityLogApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`reports/get-students-activity-log/${id}`, 'GET');
}

export const downloadCorporateStudentActivityLogPdfApi = async (id: string | number) => {
  return await apiRequest(`reports/export-students-activity-log-pdf/${id}`, 'GET');
}

export const downloadCorporateStudentActivityLogExcelApi = async (id: string | number) => {
  return await apiRequest(`reports/export-students-activity-log-excel/${id}`, 'GET');
}



//---------manage trial course start ------//

export const fetchTrailCourse = async (page = 1, search: string = "", name: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-trail-course-list/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const addTrailCourseApi = async (payload: any): Promise<any> => {
  return await apiRequest(`course/create-trail-course/`, 'POST', payload);
}

export const fetchCourseChaptersApi = async (id: string | number) => {
  const res: any = await apiRequest(`course/get-course-chapter-list/${id}`, 'GET');
  return res;
}

export const getCourseReviewApi = async (page = 1, first_name: string = "", last_name: string = "", course: string = "", chapter: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = "", approved: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  const approvedVal = approved === 'all' || approved === '' ? '' : approved;
  let query = `course/get-courses-review-rating/?page=${page}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${course ? `&course=${encodeURIComponent(course)}` : ""}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}${approvedVal ? `&approved=${approvedVal}` : ""}${start_date ? `&start_date=${start_date}` : ""}${end_date ? `&end_date=${end_date}` : ""}`;

  const res: any = await apiRequest(query, "GET");
  return res;
}

export const approveRejectCourseReviewApi = async (id: string | number, payload: { approved: number }): Promise<any> => {
  return await apiRequest(`course/approve-reject-courses-review-rating/${id}`, 'POST', payload);
}

export const updateCourseReviewStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-courses-review-rating-status/${id}`, 'POST', { status: payload.status ? 1 : 0 });
}

export const deleteCourseReviewApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-course-review-rating/${id}`, 'DELETE');
}

export const fetchCourseAnnouncementApi = async (page = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = "", course: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-courses-announcements/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}${course ? `&course=${encodeURIComponent(course)}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const viewCourseAnnouncementApi = async (id: string | number): Promise<any> => {
  const res: any = await apiRequest(`course/view-courses-announcements/${id}`, "GET");
  return res.data; // assuming standard data structure
}

export const createCourseAnnouncementApi = async (payload: any): Promise<any> => {
  return await apiRequest(`course/add-course-announcements/`, 'POST', payload);
};

export const fetchCourseListWithInstructorApi = async () => {
  const res: any = await apiRequest(`course/get-course-list-with-instructor/`, 'GET');
  return res;
}

export const updateCourseAnnouncementApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`course/update-courses-announcements/${id}`, 'POST', payload);
};

export const deleteCourseAnnouncementApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-course-announcements/${id}`, 'DELETE');
};

export const updateCourseAnnouncementStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-announcements-status/${id}`, 'POST', payload);
};

export const fetchContactApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `reports/get-contact-us-list/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}


export const downloadContactPdfApi = async ({ search = "", first_name = "", email = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-contact-us-pdf-report/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadContactExcelApi = async ({ search = "", first_name = "", email = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-contact-us-csv-report/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}





export const fetchStudentOrdersApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = ""): Promise<any> => {
  return await apiRequest(`reports/get-active-order-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${status && status !== 'all' ? `&subscription_status=${encodeURIComponent(status)}` : ""}${startDate ? `&start_date=${startDate}` : ""}${endDate ? `&end_date=${endDate}` : ""}`, "GET");
};

export const downloadActiveOrderPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-active-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${status && status !== 'all' ? `&status=${encodeURIComponent(status)}&subscription_status=${encodeURIComponent(status)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadActiveOrderExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-active-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${status && status !== 'all' ? `&status=${encodeURIComponent(status)}&subscription_status=${encodeURIComponent(status)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const fetchStudentPerformanceApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", category: string = "", startDate: string = "", endDate: string = ""): Promise<any> => {
  return await apiRequest(`reports/get-student-performance-report/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : ""}${startDate ? `&start_date=${startDate}` : ""}${endDate ? `&end_date=${endDate}` : ""}`, "GET");
};

export const downloadStudentPerformancePdfApi = async ({ search = "", first_name = "", last_name = "", email = "", category = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-student-performance-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadStudentPerformanceExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", category = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-student-performance-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const fetchStudentNotesReportApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", course: string = "", startDate: string = "", endDate: string = ""): Promise<any> => {
  return await apiRequest(`reports/get-student-notes-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${course ? `&course__name=${encodeURIComponent(course)}` : ""}${startDate ? `&start_date=${startDate}` : ""}${endDate ? `&end_date=${endDate}` : ""}`, "GET");
};

export const fetchStudentNotesDetailApi = async (userId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`reports/view-admin-user-notes-report/${userId}/${courseId}`, "GET");
};

export const downloadStudentNotesPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", course = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-admin-notes-listing-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${course ? `&course__name=${encodeURIComponent(course)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadStudentNotesExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", course = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-admin-notes-listing-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${course ? `&course__name=${encodeURIComponent(course)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

// ---------------- blog category service start ------- //
export async function fetchBlogCategoryApi(page = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-blog-category-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const addBlogCategoryApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-blog-category/`, 'POST', payload);
};

export const updateBlogCategoryApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-blog-category/${id}`, 'POST', payload);
};

export const deleteBlogCategoryApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-blog-category/${id}`, 'DELETE');
};

export const updateBlogCategoryStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-blog-category-status/${id}`, 'POST', payload);
};


// ---------------- blog category service end ------- //
export const addBlogPostApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-blog/`, 'POST', payload);
};

export const updateBlogPostApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-blog/${id}`, 'POST', payload);
};

export const deleteBlogPostApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-blog/${id}`, 'DELETE');
};
export const updateBlogStatusApi = async (id: number | string, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-blog-status/${id}`, 'POST', payload);
};

export const fetchBlogPostDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`cms/view-blog-info/${id}`, 'GET');
};

export async function fetchBlogPostApi(page = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-blogs-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}



// ---------------- coupons service start ------- //
export async function fetchCoupons(page = 1, search: string = "", code: string = "", discount_type: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `course/get-coupons-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${code ? `&code=${encodeURIComponent(code)}` : ""}${discount_type ? `&discount_type=${encodeURIComponent(discount_type)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createCoupon = async (payload: any): Promise<any> => {
  return await apiRequest(`course/create-coupons/`, 'POST', payload);
};

export const updateCouponApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`course/edit-coupons/${id}`, 'POST', payload);
};

export const deleteCouponApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`course/delete-coupons/${id}`, 'DELETE');
};

export const updateCouponStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-coupons-status/${id}`, 'POST', payload);
};
// ---------------- coupons service end ------- //

//----------------- promotional campaigns start ------------------//


export async function fetchPromoCamp(page = 1, search: string = "", title: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-promotional-banner-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createPromoCamp = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-promotional-banner/`, 'POST', payload);
};

export const updatePromoCampApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/update-promotional-banner/${id}`, 'POST', payload);
};

export const deletePromoCampApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-promotional-banner/${id}`, 'DELETE');
};

export const updatePromoCampStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-promotional-banner-status/${id}`, 'POST', payload);
};


//----------------- testimonials start ------------------//

export async function fetchTestimonialsApi(page = 1, search: string = "", name: string = "", testimonials_type: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-testimonials-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${testimonials_type ? `&testimonials_type=${testimonials_type}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createTestimonialsApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-testimonials/`, 'POST', payload);
};

export const updateTestimonialsApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-testimonials/${id}`, 'POST', payload);
};

export const deleteTestimonialsApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-testimonials/${id}`, 'DELETE');
};

export const updateTestimonialStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-testimonials-status/${id}`, 'POST', payload);
};

//----------------- testimonials end ------------------//

//------------------ quiz start ------------------//

export async function fetchQuiz(page = 1, search: string = "", id_number: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = "", name: string = "", description: string = "") {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `questions/get-chapter-quiz-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${id_number ? `&id_number=${encodeURIComponent(id_number)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createQuiz = async (payload: any): Promise<any> => {
  return await apiRequest(`questions/create-chapter-quiz/`, 'POST', payload);
};

export const fetchAllChapters = async (): Promise<any> => {
  return await apiRequest(`course/get-chapter-listing/`, 'GET');
};

export const updateQuizApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`questions/edit-chapter-quiz/${id}`, 'POST', payload);
};

export const updateQuizStatusApi = async (id: number | string, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`questions/update-chapter-quiz-status/${id}`, 'POST', payload);
};

export const deleteQuizApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`questions/delete-chapter-quiz/${id}`, 'DELETE');
};

export const viewQuizApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`questions/view-chapter-quiz-detail/${id}`, 'GET');
};

export const getMcqsListByQuizApi = async (quizId: string | number): Promise<any> => {
  return await apiRequest(`questions/get-mcqs-lists/${quizId}`, 'GET');
};

export const assignMcqsToQuizApi = async (payload: { quiz_id: string | number; mcq_ids: (string | number)[] }): Promise<any> => {
  return await apiRequest(`questions/assign-mcqs-chapter-quiz/`, 'POST', payload);
};

//-------------quiz end-----------------------------//

//----------------- help and support topic start ------------------//

export async function fetchSupportTopic(page = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-help-support-topic-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createSupportTopic = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-help-support-topic/`, 'POST', payload);
};

export const updateSupportTopicApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-help-support-topic/${id}`, 'POST', payload);
};

export const deleteSupportTopicApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-help-support-topic/${id}`, 'DELETE');
};

export const updateSupportTopicStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-help-support-topic-status/${id}`, 'POST', payload);
};

//----------------- help and support topic end ------------------//

//----------------- help and support subtopic start ------------------//

export async function fetchSupportSubTopic(page = 1, search: string = "", title: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-help-support-subtopic-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createSupportSubTopic = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-help-support-subtopic/`, 'POST', payload);
};

export const updateSupportSubTopicApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-help-support-subtopic/${id}`, 'POST', payload);
};

export const deleteSupportSubTopicApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-help-support-subtopic/${id}`, 'DELETE');
};

export const updateSupportSubTopicStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-help-support-subtopic-status/${id}`, 'POST', payload);
};

export const fetchSupportTopicList = async (): Promise<any> => {
  return await apiRequest(`cms/get-help-support-topic-list/`, 'GET');
};

//----------------- help and support subtopic end ------------------//

//----------------- help and support article start ------------------//

export async function fetchSupportArticle(page = 1, search: string = "", title: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `cms/get-help-support-article-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createSupportArticle = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-help-support-article/`, 'POST', payload);
};

export const updateSupportArticleApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-help-support-article/${id}`, 'POST', payload);
};

export const deleteSupportArticleApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-help-support-article/${id}`, 'DELETE');
};

export const updateSupportArticleStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-help-support-article-status/${id}`, 'POST', payload);
};

export const fetchSupportTopicAndSubList = async (): Promise<any> => {
  return await apiRequest(`cms/get-help-support-topic-and-sub-list/`, 'GET');
};

//----------------- help and support article end ------------------//

//----------------- trail student report start ------------------//

export async function fetchTrailStudentListing(page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", start_date: string = "", end_date: string = "", subscription_status: string = ""): Promise<any> {
  const statusVal = subscription_status === 'all' ? '' : subscription_status;
  let query = `reports/get-trail-user-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&subscription_status=${encodeURIComponent(statusVal)}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const createTrailRegistration = async (payload: any): Promise<any> => {
  return await apiRequest(`subscription/trail-registration/`, 'POST', payload);
};

export const fetchTrailCoursesListApi = async (): Promise<any> => {
  return await apiRequest(`course/get-trail-courses/`, 'GET');
};

export const downloadTrailStudentPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", start_date = "", end_date = "", subscription_status = "" }: any): Promise<any> => {
  const statusVal = subscription_status === 'all' ? '' : subscription_status;
  return await apiRequest(`reports/get-trail-user-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}${statusVal ? `&subscription_status=${encodeURIComponent(statusVal)}` : ""}`, 'GET');
}

export const downloadTrailStudentExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", start_date = "", end_date = "", subscription_status = "" }: any): Promise<any> => {
  const statusVal = subscription_status === 'all' ? '' : subscription_status;
  return await apiRequest(`reports/get-trail-user-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}${statusVal ? `&subscription_status=${encodeURIComponent(statusVal)}` : ""}`, 'GET');
}

//----------------- trail student report end ------------------//

export async function fetchSubscription(page = 1, search: string = "", plan_name: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `subscription/get-subscription-plan-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${plan_name ? `&plan_name=${encodeURIComponent(plan_name)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}

export const createSubscription = async (payload: any): Promise<any> => {
  return await apiRequest('subscription/create-subscription-plan/', 'POST', payload);
};

export const editSubscriptionApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`subscription/edit-subscription-plan/${id}`, 'POST', payload);
};

export const updateSubscriptionStatusApi = async (id: number | string, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`subscription/update-subscription-plan-status/${id}`, 'POST', payload);
};

export const deleteSubscriptionApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`subscription/delete-subscription-plan/${id}`, 'DELETE');
};

//----------------- student access lock report start ------------------//
export const fetchStudentAccessLockReportApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `reports/get-student-access-lock-report/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const downloadStudentAccessLockPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-student-access-lock-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadStudentAccessLockExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-student-access-lock-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const updateStudentAccountStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`reports/update-student-account-status/${id}`, 'POST', payload);
};

//----------------- Corporate Admin Reports start ------------------//

export const fetchCorporateAdminsApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `reports/get-corporare-admin-user-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const fetchCorporateAdminDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`reports/view-corporare-admin-user/${id}`, 'GET');
};

export const fetchCorporateStudentDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`reports/view-corporate-user-detail/${id}`, 'GET');
};

export const fetchStudentCourseVideoReportApi = async (userId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`reports/view-student-video-report/${userId}/${courseId}`, 'GET');
};

export const fetchCorporateStudentNotesApi = async (userId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`reports/get-student-notes-listing/${userId}/${courseId}`, 'GET');
};

export const fetchStudentAttemptedQuizApi = async (userId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`reports/get-attempted-quiz-list/${userId}/${courseId}`, 'GET');
};

export const downloadStudentQuizReportPdfApi = async (userId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`user_study/get-student-quiz-listing-report-pdf/${userId}/${courseId}`, 'GET');
};

export const downloadStudentQuizReportExcelApi = async (userId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`user_study/get-student-quiz-listing-report-excel/${userId}/${courseId}`, 'GET');
};

export const downloadCorporateAdminPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-corporare-admin-user-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadCorporateAdminExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-corporare-admin-user-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

//----------------- Corporate Admin Subscription Reports start ------------------//

export const createCorporateAdminApi = async (payload: any): Promise<any> => {
  return await apiRequest(`reports/create-corporate-admin-user/`, 'POST', payload);
};

export const updateCorporateAdminApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`reports/update-corporare-admin-user/${id}`, 'POST', payload);
};

export const updateCorporateAdminStatusApi = async (id: string | number, payload: { status: number }): Promise<any> => {
  return await apiRequest(`reports/update-corporare-admin-user-status/${id}`, 'POST', payload);
};

export const assignCorporateAdminSubscriptionApi = async (id: string | number, payload: { plan_id: number; user_id: number }): Promise<any> => {
  return await apiRequest(`reports/assign-subscription-to-corporare-admin/${id}`, 'POST', payload);
};

export const getSubscriptionPlanDropdownApi = async (): Promise<any> => {
  return await apiRequest(`subscription/get-subscription-plan-list/`, 'GET');
};
export const fetchCoAdminSubscriptionsApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = "") => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `reports/get-subscription-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  const res: any = await apiRequest(query, "GET");
  return res;
}

export const downloadCoAdminSubscriptionPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-subscription-report-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadCoAdminSubscriptionExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-subscription-report-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

// ---------------- Student Reminders Start ---------------- //

export const fetchStudentReminderListingApi = async (studentId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`user_study/get-student-reminder-listing/${studentId}/${courseId}`, 'GET');
};

export const downloadStudentReminderReportPdfApi = async (studentId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`user_study/get-student-reminder-listing-report-pdf/${studentId}/${courseId}`, 'GET');
};

export const downloadStudentReminderReportExcelApi = async (studentId: string | number, courseId: string | number): Promise<any> => {
  return await apiRequest(`user_study/get-student-reminder-listing-report-excel/${studentId}/${courseId}`, 'GET');
};

// ---------------- Student Reminders End ---------------- //

// ---------------- Admin Dashboard Reports Start ---------------- //

export const fetchAdminDashboardCounters = async (): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-counters/`, "GET");
};

export const fetchAdminDashboardStudentsGraph = async (filter: string = "month"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-students-graph/${filter}`, "GET");
};

export const fetchAdminDashboardRevenueGraph = async (filter: string = "month"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-revenue-graph/${filter}`, "GET");
};

export const fetchAdminDashboardVideoGraph = async (filter: string = "month"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-students-video-lecture-graph/${filter}`, "GET");
};

export const fetchAdminDashboardOrderGraph = async (filter: string = "month"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-students-order-graph/${filter}`, "GET");
};

export const fetchAdminDashboardCorporateAdminGraph = async (filter: string = "month"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-corporate-admin-graph/${filter}`, "GET");
};

export const fetchPracticeChart = async (filter: string = "month"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-practice-test-graph/${filter}`, "GET");
};

export const fetchRecentCorporateAdmins = async (): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-recent-corporate-admin/`, "GET");
};

export const fetchRecentStudents = async (): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-recent-students/`, "GET");
};

// Aliases for compatibility
export const fetchCounter = fetchAdminDashboardCounters;
export const fetchRefrence = async (): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-source-students/`, "GET");
};
export const fetchChart = async (id: any = "week"): Promise<any> => {
  return await apiRequest(`reports/admin-dashboard-students-graph/${id}`, "GET");
};
export const fetchAdminDashboardRecentCorporateAdmin = fetchRecentCorporateAdmins;
export const fetchAdminDashboardRecentStudents = fetchRecentStudents;

// ---------------- Admin Dashboard Reports End ---------------- //

// ---------------- Legal Pages (CMS) Start ---------------- //

export async function fetchLegalPagesApi(page = 1, search: string = "", title: string = "", page_type: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = ""): Promise<any> {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  let query = `cms/get-cms-pages-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${page_type ? `&page_type=${encodeURIComponent(page_type)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const addLegalPageApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-update-cms-page/`, 'POST', payload);
};

export const updateLegalPageApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/create-update-cms-page/`, 'POST', { ...payload, id });
};

export const deleteLegalPageApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-cms-page/${id}`, 'DELETE');
};

export const updateLegalPageStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-cms-page-status/${id}`, 'POST', payload);
};

// ---------------- Legal Pages (CMS) End ---------------- //

// ---------------- Community Category Start ---------------- //

export async function fetchCommunityCategory(page = 1, search: string = "", title: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = ""): Promise<any> {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  let query = `cms/get-community-category-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createCommunityCategory = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-community-category/`, 'POST', payload);
};

export const updateCommunityCategoryApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-community-category/${id}`, 'POST', payload);
};

export const updateCommunityCategoryStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-community-category-status/${id}`, 'POST', payload);
};

export const deleteCommunityCategoryApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-community-category/${id}`, 'DELETE');
};

// ---------------- Community Category End ---------------- //

// ---------------- Community Post Start ---------------- //


// ---------------- Community Post End ---------------- //

// ---------------- Manager Service Start ---------------- //
export async function fetchManagers(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", is_active: string = "", startDate: string = "", endDate: string = "", email: string = "", status: string = ""): Promise<any> {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/manager?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createManagerApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/manager`, 'POST', payload);
};

export const updateManagerApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/manager/${id}`, 'POST', payload);
};

export const updateManagerStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/manager/${id}`, 'POST', payload);
};



export const downloadManagerPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-pdf/manager?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const downloadManagerExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-excel/manager?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};
// ---------------- Manager Service End ---------------- //

// ---------------- Sales User Service Start ---------------- //
export async function fetchSalesUsers(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", is_active: string = "", startDate: string = "", endDate: string = "", email: string = "", status: string = ""): Promise<any> {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/sales_user?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createSalesUserApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/sales_user`, 'POST', payload);
};

export const updateSalesUserApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/sales_user/${id}`, 'POST', payload);
};

export const updateSalesUserStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/sales_user/${id}`, 'POST', payload);
};

export const downloadSalesUserPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-pdf/sales_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const downloadSalesUserExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-excel/sales_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const viewSalesUserDetailApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`user/get-user/sales_user/${id}`, 'GET');
};

// ---------------- Sales User Service End ---------------- //

// ---------------- Marketing User Service Start ---------------- //
export async function fetchMarketingUsers(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", is_active: string = "", startDate: string = "", endDate: string = "", email: string = "", status: string = ""): Promise<any> {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/marketing_user?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createMarketingUserApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/marketing_user`, 'POST', payload);
};

export const updateMarketingUserApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/marketing_user/${id}`, 'POST', payload);
};

export const updateMarketingUserStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/marketing_user/${id}`, 'POST', payload);
};

export const downloadMarketingUserPdfApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-pdf/marketing_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const downloadMarketingUserExcelApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-excel/marketing_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};



// ---------------- Marketing User Service End ---------------- //

// ---------------- Customer Support User Service Start ---------------- //
export async function fetchCustomerSupportUsers(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", is_active: string = "", startDate: string = "", endDate: string = "", email: string = "", status: string = ""): Promise<any> {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/customer_support_user?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createCustomerSupportUserApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/customer_support_user`, 'POST', payload);
};

export const updateCustomerSupportUserApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/customer_support_user/${id}`, 'POST', payload);
};

export const updateCustomerSupportUserStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/customer_support_user/${id}`, 'POST', payload);
};

export const downloadCustomerSupportUserPdfApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-pdf/customer_support_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const downloadCustomerSupportUserExcelApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-excel/customer_support_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};
// ---------------- Customer Support User Service End ---------------- //

// ---------------- Content Management User Service Start ---------------- //
export async function fetchContentManagementUsers(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", is_active: string = "", startDate: string = "", endDate: string = "", email: string = "", status: string = ""): Promise<any> {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/content_management_user?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createContentManagementUserApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/content_management_user`, 'POST', payload);
};

export const updateContentManagementUserApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/content_management_user/${id}`, 'POST', payload);
};

export const updateContentManagementUserStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/content_management_user/${id}`, 'POST', payload);
};

export const downloadContentManagementUserPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-pdf/content_management_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const downloadContentManagementUserExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-excel/content_management_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};
// ---------------- Content Management User Service End ---------------- //

// ---------------- Finance User Service Start ---------------- //
export async function fetchFinanceUsers(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", is_active: string = "", startDate: string = "", endDate: string = "", email: string = "", status: string = ""): Promise<any> {
  const activeFilter = status || is_active;
  const statusVal = activeFilter === 'active' ? '1' : activeFilter === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/finance_user?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const createFinanceUserApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/create-user/finance_user`, 'POST', payload);
};

export const updateFinanceUserApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`user/update-user/finance_user/${id}`, 'POST', payload);
};

export const updateFinanceUserStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`user/change-user-status/finance_user/${id}`, 'POST', payload);
};

export const downloadFinanceUserPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-pdf/finance_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};

export const downloadFinanceUserExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`reports/get-user-report-excel/finance_user?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, "GET");
};
// ---------------- Finance User Service End ---------------- //

// ---------------- Community Post Start ---------------- //

export async function fetchCommunityPosts(page = 1, search: string = "", title: string = "", description: string = "", ordering: string = "", status: string = "", startDate: string = "", endDate: string = ""): Promise<any> {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  let query = `cms/get-community-post-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (startDate) query += `&start_date=${startDate}`;
  if (endDate) query += `&end_date=${endDate}`;
  return await apiRequest(query, "GET");
}

export const fetchCommunityCategoryList = async (): Promise<any> => {
  return await apiRequest(`cms/get-community-category-list/`, 'GET');
};

export const createCommunityPostApi = async (payload: any): Promise<any> => {
  return await apiRequest(`cms/create-community-post/`, 'POST', payload);
};

export const updateCommunityPostApi = async (id: number | string, payload: any): Promise<any> => {
  return await apiRequest(`cms/edit-community-post/${id}`, 'POST', payload);
};

export const getCommunityPostDetailApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/get-community-post-detail/${id}`, 'GET');
};

export const updateCommunityPostStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`cms/update-community-post-status/${id}`, 'POST', payload);
};

export const deleteCommunityPostApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`cms/delete-community-post/${id}`, 'DELETE');
};

// ---------------- Community Post End ---------------- //

export const getJobApplicationApi = async (page: number = 1, search: string = "", ordering: string = "", start_date: string = "", end_date: string = "", full_name: string = "", email: string = "", mobile: string = "") => {
  const resolvedFullName = full_name || search || email || mobile;
  let query = `reports/get-job-application-list/?page=${page}${ordering ? `&ordering=${encodeURIComponent(ordering)}` : ""}${resolvedFullName ? `&search=${encodeURIComponent(resolvedFullName)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
};

export const downloadJobApplicationPdfApi = async ({ search = "", full_name = "", email = "", mobile = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const resolvedFullName = full_name || search;
  return await apiRequest(`reports/get-job-application-pdf-report/?${resolvedFullName ? `&full_name=${encodeURIComponent(resolvedFullName)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadJobApplicationExcelApi = async ({ search = "", full_name = "", email = "", mobile = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const resolvedFullName = full_name || search;
  return await apiRequest(`reports/get-job-application-csv-report/?${resolvedFullName ? `&full_name=${encodeURIComponent(resolvedFullName)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const deleteJobApplicationApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`reports/delete-job-application/${id}`, 'DELETE');
};

export const viewJobApplicationApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`reports/view-job-application-detail/${id}`, 'GET');
};

// ---------------- Partner Request Start ---------------- //

export const getPartnerApi = async (page: number = 1, search: string = "", ordering: string = "", start_date: string = "", end_date: string = "", first_name: string = "", last_name: string = "", email: string = "", mobile: string = "", partner_type: string = "") => {
  const resolvedSearch = search;
  let query = `reports/get-partner-request-list/?page=${page}${ordering ? `&ordering=${encodeURIComponent(ordering)}` : ""}${resolvedSearch ? `&search=${encodeURIComponent(resolvedSearch)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ""}${partner_type ? `&partner_type=${encodeURIComponent(partner_type)}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
};

export const downloadPartnerPdfApi = async ({ search = "", first_name = "", last_name = "", email = "", mobile = "", partner_type = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-partner-request-pdf-report/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ""}${partner_type ? `&partner_type=${encodeURIComponent(partner_type)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadPartnerExcelApi = async ({ search = "", first_name = "", last_name = "", email = "", mobile = "", partner_type = "", start_date = "", end_date = "" }: any): Promise<any> => {
  return await apiRequest(`reports/get-partner-request-csv-report/?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${mobile ? `&mobile=${encodeURIComponent(mobile)}` : ""}${partner_type ? `&partner_type=${encodeURIComponent(partner_type)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const viewPartnerRequestApi = async (id: number | string): Promise<any> => {
  return await apiRequest(`reports/view-partner-request-detail/${id}`, 'GET');
};

// ---------------- Partner Request End ---------------- //

export const getBlogCommentsApi = async (page = 1, search: string = "", first_name: string = "", last_name: string = "", email: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = "") => {
  const statusVal = status === 'all' || status === '' ? '' : status;
  let query = `cms/get-blogs-comments-listing/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  const res: any = await apiRequest(query, "GET");
  return res;
};

export const updateBlogCommentStatusApi = async (id: string | number, payload: { status: number }): Promise<any> => {
  return await apiRequest(`cms/update-blog-comment-status/${id}`, 'POST', payload);
};

export const deleteBlogCommentApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`cms/delete-blog-comment/${id}`, "DELETE");
};