import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const CadastroUsuario = () => {
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [estados, setEstados] = useState("");
  const [cep, setCep] = useState("");
  const [telefone1, setTelefone1] = useState("");
  const [telefone2, setTelefone2] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cidades, setCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [emailError, setEmailError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuariosStorage = localStorage.getItem("usuarios");
    if (usuariosStorage) {
      setUsuarios(JSON.parse(usuariosStorage));

      // Define o próximo ID com base no último ID da lista
      const ultimoId = Math.max(
        ...JSON.parse(usuariosStorage).map((usuario) => usuario.id)
      );
      setId(ultimoId + 1);
    } else {
      // Define o ID inicial como 1 se não houver usuários no localStorage
      setId(1);
    }
  }, []);

  useEffect(() => {
    const buscarEstados = async () => {
      try {
        const response = await fetch("https://brasilapi.com.br/api/ibge/uf/v1");
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
      }
    };

    buscarEstados();
  }, []);

  useEffect(() => {
    const buscarCidades = async () => {
      if (cep === "" && estadoSelecionado) {
        try {
          const response = await fetch(
            `https://brasilapi.com.br/api/ibge/municipios/v1/${estadoSelecionado}?providers=dados-abertos-br,gov,wikipedia`
          );
          const data = await response.json();
          setCidades(data.map((cidade) => cidade.nome));
        } catch (error) {
          console.error("Erro ao buscar cidades:", error);
        }
      }
    };

    buscarCidades();
  }, [cep, estadoSelecionado]);

  useEffect(() => {
    const buscarCep = async () => {
      setCidades("");

      if (cep.length === 9) {
        try {
          const response = await fetch(
            `https://brasilapi.com.br/api/cep/v1/${cep}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error("CEP não encontrado!");
          }

          setEndereco(data.street || "");
          setEstadoSelecionado(data.state || "");
          setCidadeSelecionada(data.city || "");

          if (data.neighborhood) {
            setEndereco(`${data.street},  , ${data.neighborhood}`);
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      }
    };

    buscarCep();
  }, [cep]);

  const handleCepChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    valor = valor.replace(/^(\d{5})(\d{3})$/, "$1-$2"); // Adiciona o hífen após o quinto dígito
    setCep(valor);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const emailExistente = usuarios.some((usuario) => usuario.email === email);

    if (emailExistente) {
      setEmailError("Este email já está cadastrado.");
      return; // Impede o cadastro
    }

    const novoUsuario = {
      id,
      nome,
      endereco,
      cidade: cidadeSelecionada,
      estado: estadoSelecionado,
      cep,
      telefone1,
      telefone2,
      email,
      password,
    };

    // Atualiza o estado com o novo usuário
    setUsuarios([...usuarios, novoUsuario]);

    // Salva os usuários no localStorage
    localStorage.setItem(
      "usuarios",
      JSON.stringify([...usuarios, novoUsuario])
    );

    // Exibe o alerta por 3 segundos
    const alerta = window.alert(
      "Usuário cadastrado com sucesso! Faça o login."
    );
    setTimeout(function () {
      alerta.close(); // Fecha o alerta após 3 segundos
    }, 3000);

    // Redireciona para a página de login após o cadastro
    navigate("/loginUsuario");
    setEmailError(null);
  };

  return (
    <section className="container" style={{ paddingTop: "95px" }}>
      <div className="row">
        <div
          className="col-8 col-md-10 mt-2 mb-3 mx-auto py-3 px-md-5 border rounded bg-body-tertiary"
          style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.3)" }}
        >
          <h1 className="fw-bolded fs-3 text-warning text-center">
            Preencha as informações abaixo para cadastrar-se!
          </h1>
          <form>
            <div className="mx-1 mb-1">
              <label htmlFor="form_nome" className="form-label fw-bold">
                Nome
              </label>
              <input
                type="text"
                className="form-control"
                id="form_nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="form_endereco" className="form-label fw-bold">
                Endereço
              </label>
              <input
                type="text"
                className="form-control"
                id="form_endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>
            <div className="row mb-1">
              <div className="col-md-5 mx-1 mb-1">
                <label htmlFor="form_cidade" className="form-label fw-bold">
                  Cidade
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={cidadeSelecionada}
                  onChange={(e) => setCidadeSelecionada(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {cidades.length > 0 &&
                    cidades.map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-3 mx-1 mb-1">
                <label htmlFor="form_estado" className="form-label fw-bold">
                  Estado
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={estadoSelecionado}
                  onChange={(e) => setEstadoSelecionado(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {estados.length > 0 &&
                    estados.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.sigla}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-3 mx-1 mb-1">
                <label htmlFor="form_cep" className="form-label fw-bold">
                  CEP
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="form_cep"
                  maxLength="9"
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                />
              </div>
            </div>
            <div className="row mb-1">
              <div className="col-md-5 mx-1 mb-1">
                <label htmlFor="form_telefone1" className="form-label fw-bold">
                  Telefone 1
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="form_telefone1"
                  value={telefone1}
                  onChange={(e) => setTelefone1(e.target.value)}
                />
              </div>
              <div className="col-md-5 mx-1 mb-1">
                <label htmlFor="form_telefone2" className="form-label fw-bold">
                  Telefone 2
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="form_telefone2"
                  value={telefone2}
                  onChange={(e) => setTelefone2(e.target.value)}
                />
              </div>
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="email_login" className="form-label fw-bold">
                E-mail
              </label>
              <input
                type="email"
                className="form-control"
                id="email_login"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
              />
              {emailError && <div className="text-danger">{emailError}</div>}
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="password_login" className="form-label fw-bold">
                Senha
              </label>
              <input
                type="password"
                id="password_login"
                className="form-control"
                placeholder="Insira sua senha de 8 dígitos"
                maxLength="8"
                aria-describedby="passwordHelpBlock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-warning mx-1 mt-3"
              onClick={handleSubmit}
            >
              Cadastrar
            </button>
          </form>
          <p className="mx-1 my-3">
            Já tem cadastro? Faça o seu login clicando{" "}
            <Link className="text-warning" to="/loginUsuario">
              AQUI!
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CadastroUsuario;
