import Cookies from "js-cookie";

type CookieName = string;
type CookieValue = string;

// Function to set a cookie
const setCookie = (name: CookieName, value: CookieValue): void => {
  Cookies.set(name, value, { secure: true, sameSite: "none", expires: 30 });
};

// Function to get a cookie
const getCookie = (name: CookieName): string | undefined | null => {
  return Cookies.get(name);
};

// Function to remove a cookie
const removeCookie = (name: CookieName): void => {
  Cookies.remove(name);
};

export { getCookie, removeCookie, setCookie };
