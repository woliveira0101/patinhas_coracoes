import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ id: "", name: "" });

  // Função para carregar os dados do cookie
  const loadUserDataFromCookies = () => {
    const storedUserLoggedIn = Cookies.get("isUserLoggedIn");
    const storedUserId = Cookies.get("userId");
    const storedUserName = Cookies.get("userName");

    if (storedUserLoggedIn !== null) {
      setIsUserLoggedIn(storedUserLoggedIn);
    }

    if (storedUserId && storedUserName) {
      setUserData({ id: storedUserId, name: storedUserName });
    }
  };

  // Carrega os dados do cookie ao montar o componente
  useEffect(() => {
    loadUserDataFromCookies();
  }, []);

  // Salva os dados do usuário no cookie sempre que houver alteração
  const saveUserDataToCookies = (userData) => {
    Cookies.set("isUserLoggedIn", JSON.stringify(!isUserLoggedIn));
    Cookies.set("userId", userData.id);
    Cookies.set("userName", userData.name);
  };

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        setIsUserLoggedIn,
        userData,
        setUserData,
        loadUserDataFromCookies,
        saveUserDataToCookies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
