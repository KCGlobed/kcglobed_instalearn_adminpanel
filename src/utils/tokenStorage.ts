export const getToken = () => localStorage.getItem("token");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const storeToken = (token: string) => localStorage.setItem("token", token);
export const storeRefreshToken = (token: string) => localStorage.setItem("refreshToken", token);
export const storeUserID = (userID: string) => localStorage.setItem("userID", userID);

export const clearToken = ()=>{
  localStorage.clear();
}