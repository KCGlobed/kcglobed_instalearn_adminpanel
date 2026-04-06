import { apiRequest } from "./apiRequest";

export const fetchCounter = ():Promise<any> => {
  return apiRequest(`reports/admin-dashboard-counters/`, "GET");
};

export const fetchRefrence = ():Promise<any> => {
  return apiRequest(`reports/admin-dashboard-source-students/`, "GET");
};

export const fetchChart = (id:any):Promise<any> => {
  return apiRequest(`reports/admin-dashboard-students-graph/${id}`, "GET");
};

export const fetchPracticeChart = (id:any):Promise<any> => {
  return apiRequest(`reports/admin-dashboard-practice-test-graph/${id}`, "GET");
};