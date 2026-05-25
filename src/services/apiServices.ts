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

export const updateInstructorStatusApi = async (id: string | number, payload: { is_active: boolean }): Promise<any> => {
  return await apiRequest(`user/update-user-status/instructor/${id}`, 'POST', payload);
};

export const downloadInstructorPdfApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`user/export-user-listing-pdf/instructor?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadInstructorExcelApi = async ({ search = "", first_name = "", last_name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`user/export-user-listing-excel/instructor?${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}



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
export const fetchStudentVideoReportsApi = async (id: string | number, courseId: string | number) => {
  return await apiRequest(`reports/get-video-report/${id}/${courseId}`, 'GET');
}

export const changeStudentPasswordApi = async (payload: any): Promise<any> => {
  return await apiRequest(`user/admin-update-password/`, 'POST', payload);
}



//----------------Abhishek Manage Student End----------//


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

