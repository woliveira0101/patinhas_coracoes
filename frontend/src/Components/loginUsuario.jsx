import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";

const LoginUsuario = () => {
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [emailError, setEmailError] = React.useState(null);
  const [userLogin, setUserLogin] = React.useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const {
    isUserLoggedIn,
    setIsUserLoggedIn,
    userData,
    setUserData,
    saveUserDataToCookies,
  } = React.useContext(AuthContext);

  console.log(isUserLoggedIn);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (event) => {
    const email = event.target.value;
    setUserLogin({ ...userLogin, email: email });
    if (!validateEmail(email) && email !== "") {
      setEmailError("Por favor, insira um endereço de e-mail válido.");
    } else {
      setEmailError(null);
    }
  };

  const login = () => {
    const { email, password } = userLogin;
    if (!validateEmail(email)) {
      setEmailError("Por favor, insira um endereço de e-mail válido.");
      return;
    }

    // Obtém a lista de usuários do localStorage
    const usuariosStorage = localStorage.getItem("usuarios");
    const usuarios = usuariosStorage ? JSON.parse(usuariosStorage) : [];

    const usuario = usuarios.find(
      (user) => user.email === email && user.password === password
    );

    if (usuario) {
      setUserData({ id: usuario.id, name: usuario.nome }); // Ajustado para usar 'nome' do localStorage
      saveUserDataToCookies({ id: usuario.id, name: usuario.nome }); // Ajustado para usar 'nome' do localStorage
      setIsUserLoggedIn(true);

      navigate("/");
    } else {
      // Define a mensagem de erro caso as credenciais sejam inválidas
      setErrorMessage("Usuário ou senha incorretos.");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      login(); // Chama a função login ao pressionar Enter
    }
  };

  return (
    <section
      className="container"
      style={{
        paddingTop: "95px",
        minHeight: "calc(100vh - 60px)",
      }}
    >
      <div className="row my-5">
        <div
          className="col-8 col-md-5 my-5 mb-5 mx-auto py-5 px-md-5 border rounded bg-body-tertiary"
          style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.3)" }}
        >
          <div className="mx-md-3 mx-1 mb-3">
            <label htmlFor="email_login" className="form-label fw-bold">
              E-mail
            </label>
            <input
              type="email"
              className="form-control"
              id="email_login"
              required
              placeholder="Insira seu e-mail cadastrado"
              aria-describedby="passwordHelpBlock"
              onChange={(e) => {
                setUserLogin({ ...userLogin, email: e.target.value });
                handleEmailChange(e);
              }}
            />
            {emailError && <div className="invalid-tooltip">{emailError}</div>}
          </div>
          <div className="mx-md-3 mx-1 mb-3">
            <label htmlFor="password_login" className="form-label fw-bold">
              Password
            </label>
            <input
              type="password"
              id="password_login"
              className="form-control"
              placeholder="Insira sua senha de 8 dígitos"
              required
              aria-describedby="passwordHelpBlock"
              onChange={(e) =>
                setUserLogin({ ...userLogin, password: e.target.value })
              }
              onKeyDown={handleKeyPress}
            />
          </div>
          <button
            onClick={login}
            type="button"
            className="btn btn-warning mx-auto my-3 w-100 "
          >
            Login
          </button>
          {errorMessage ? (
            <p className="mx-3 my-3 text-danger">{errorMessage}</p>
          ) : (
            <p className="mx-3 my-3 text-light">Espaço</p>
          )}
          <p className="mx-auto my-3 text-center">
            Ainda não é cadastrado? <br />
            Clique{" "}
            <Link
              className="text-warning mx-auto text-center"
              to="/cadastroUsuario"
            >
              AQUI!
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginUsuario;
