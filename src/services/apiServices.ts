import { apiRequest } from "./apiRequest";

export const forgotPassword = async (payload: { email: string }): Promise<any> => {
  return await apiRequest(`user/admin-forgot-password/`, 'POST', payload);
};

export const resetPassword = async (payload: { password: string, confirm_password: string, uid: string, token: string }): Promise<any> => {
  return await apiRequest(`user/reset-password/`, 'POST', payload);
};


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
