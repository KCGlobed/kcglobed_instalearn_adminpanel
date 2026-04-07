import { apiRequest } from "./apiRequest";

export const forgotPassword = async (payload: { email: string }): Promise<any> => {
  return await apiRequest(`user/admin-forgot-password/`, 'POST', payload);
};

export const resetPassword = async (payload: { password: string, confirm_password: string, uid: string, token: string }): Promise<any> => {
  return await apiRequest(`user/reset-password/`, 'POST', payload);
};


export async function fetchCategory(page = 1, search: string = "", name: string = "", description: string = "", ordering: string = "", status: string = "", start_date: string = "", end_date: string = ""): Promise<any> {
  let query = `course/get-category-listing?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${ordering ? `&ordering=${ordering}` : ""}${status && status !== 'all' ? `&status=${status === 'active' ? 'true' : 'false'}` : ""}`;
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

export const downloadCategoryPdfApi = async ({ search = "", name = "", description = "", start_date = "", end_date = "", subscription_status = "", subscription_type = "", country = "", state = "", city = "" }): Promise<any> => {
  return await apiRequest(`course/export-category-listing-pdf?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}${subscription_status ? `&subscription_status=${encodeURIComponent(subscription_status)}` : ""}${subscription_type ? `&subscription_type=${subscription_type}` : ""}${country ? `&country=${encodeURIComponent(country)}` : ""}${state ? `&state=${state}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}${city ? `&city=${encodeURIComponent(city)}` : ""} `, 'GET');
}

export const downloadCategoryExcelApi = async ({ search = "", name = "", description = "", start_date = "", end_date = "", subscription_status = "", subscription_type = "", country = "", state = "", city = "" }): Promise<any> => {
  return await apiRequest(`course/export-category-listing-excel?${search ? `&search=${encodeURIComponent(search)}` : ""}${name ? `&name=${encodeURIComponent(name)}` : ""}${description ? `&description=${encodeURIComponent(description)}` : ""}${start_date ? `&start_date=${encodeURIComponent(start_date)}` : ""}${end_date ? `&end_date=${encodeURIComponent(end_date)}` : ""}${subscription_status ? `&subscription_status=${encodeURIComponent(subscription_status)}` : ""}${subscription_type ? `&subscription_type=${subscription_type}` : ""}${country ? `&country=${encodeURIComponent(country)}` : ""}${state ? `&state=${state}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}${city ? `&city=${encodeURIComponent(city)}` : ""} `, 'GET');
}

export const updateCategoryApi = async (id: string | number, payload: FormData): Promise<any> => {
  return await apiRequest(`course/edit-category/${id}`, 'POST', payload);
}
