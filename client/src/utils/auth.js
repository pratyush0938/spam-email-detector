export const saveUserToLocalStorage = (userData) => {
  localStorage.setItem("userInfo", JSON.stringify(userData));
};

export const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("userInfo");
  return user ? JSON.parse(user) : null;
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("userInfo");
};

export const isAuthenticated = () => {
  const user = getUserFromLocalStorage();
  return !!user?.token;
};
