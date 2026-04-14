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
  return await apiRequest(`course/edit-video/${id}`, 'POST', payload);
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
export async function fetchMcq(page = 1, search: string = "", name: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `questions/get-mcqs-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal ? `&status=${statusVal}` : ""}`;
}



//-----------------------Abhishek Manage Instructor start ------------//

export async function fetchInstructor(page = 1, search: string = "", first_name: string = "", last_name: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  let query = `user/get-user-listing/instructor?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${first_name ? `&first_name=${encodeURIComponent(first_name)}` : ""}${last_name ? `&last_name=${encodeURIComponent(last_name)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${statusVal !== '' ? `&is_active=${statusVal}` : ""}`;
  if (start_date) query += `&start_date=${start_date}`;
  if (end_date) query += `&end_date=${end_date}`;
  return await apiRequest(query, "GET");
}

export const createMcq = async (payload: any): Promise<any> => {
  return await apiRequest(`questions/create-mcq/`, 'POST', payload);
};

export const updateMcqApi = async (id: string | number, payload: any): Promise<any> => {
  return await apiRequest(`questions/edit-mcq/${id}`, 'POST', payload);
}

export const deleteMcqApi = async (id: string | number): Promise<any> => {
  return await apiRequest(`course/delete-mcq/${id}`, 'DELETE');
}

export const updateMcqStatusApi = async (id: string | number, payload: { status: boolean }): Promise<any> => {
  return await apiRequest(`course/update-mcq-status/${id}`, 'POST', payload);
}

export const downloadMcqPdfApi = async ({ search = "", name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-mcq-listing-pdf/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}

export const downloadMcqExcelApi = async ({ search = "", name = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === 'active' ? '1' : status === 'deactive' ? '0' : '';
  return await apiRequest(`course/export-mcq-listing-excel/?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${statusVal ? `&status=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
}
// ----------------mcq service end------- //
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

export const downloadFaqTopicsPdfApi = async ({ search = "", title = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  return await apiRequest(`cms/export-faq-topic-listing-pdf?${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}&name=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
};

export const downloadFaqTopicsExcelApi = async ({ search = "", title = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  return await apiRequest(`cms/export-faq-topic-listing-excel?${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}&name=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
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

export const downloadFaqPdfApi = async ({ search = "", title = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  return await apiRequest(`cms/export-faq-listing-pdf?${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}&name=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
};

export const downloadFaqExcelApi = async ({ search = "", title = "", description = "", status = "", start_date = "", end_date = "" }: any): Promise<any> => {
  const statusVal = status === "active" ? "1" : status === "deactive" ? "0" : "";
  return await apiRequest(`cms/export-faq-listing-excel?${search ? `&search=${encodeURIComponent(search)}` : ""}${title ? `&title=${encodeURIComponent(title)}&name=${encodeURIComponent(title)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${statusVal ? `&status=${statusVal}&is_active=${statusVal}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}`, 'GET');
};
