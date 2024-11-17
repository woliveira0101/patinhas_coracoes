const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET_KEY = "sua_chave_secreta"; // Mantenha isso em um arquivo .env na produção

// Rota de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Verifique as credenciais do usuário (substitua isso pela sua lógica de autenticação)
  if (email === "usuario@example.com" && password === "senha") {
    // Crie o JWT
    const token = jwt.sign(
      { userId: 1, email: "usuario@example.com" },
      SECRET_KEY
    );

    // Envie o token na resposta
    res.json({ token });
  } else {
    res.status(401).json({ message: "Credenciais inválidas" });
  }
});

// Rota protegida (requer autenticação)
app.get("/profile", authenticateToken, (req, res) => {
  // req.user estará disponível aqui com os dados do usuário decodificados do JWT
  res.json({ message: `Bem-vindo, ${req.user.email}!` });
});

// Função de middleware para autenticar o token
function authenticateToken(req, res, next) {
  // Obtenha o token do cabeçalho da requisição
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
