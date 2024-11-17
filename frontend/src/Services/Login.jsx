import React, { useState } from "react";

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        // Armazene o token (por exemplo, no localStorage)
        localStorage.setItem("token", data.token);
      } else {
        // Lidar com erro de login
      }
    } catch (error) {
      // Lidar com erro de rede
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // Função para fazer requisições autenticadas
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const response = await fetch("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
        } else {
          // Lidar com erro de autenticação
        }
      } catch (error) {
        // Lidar com erro de rede
      }
    } else {
      // Redirecionar para a página de login
    }
  };

  return (
    <div>
      {/* Formulário de login */}
      {/* Botão de logout */}
      {/* Botão para buscar dados protegidos */}
    </div>
  );
}

export default App;
