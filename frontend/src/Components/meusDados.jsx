import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/MyContext";

const MeusDados = () => {
  const [userFormData, setUserFormData] = useState({
    id: "",
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone1: "",
    telefone2: "",
    email: "",
  });

  const [editando, setEditando] = useState(false);
  const [userDataOriginal, setUserDataOriginal] = useState({});
  const { loadUserDataFromCookies, userData } = useContext(AuthContext);

  useEffect(() => {
    const buscarDadosUsuario = () => {
      try {
        const usuarioId = userData ? userData.id : null;

        if (!usuarioId) {
          console.error("Usuário não está logado.");
          return;
        }

        // Buscar todos os usuários no localStorage
        const usuariosSalvos = localStorage.getItem("usuarios");

        if (usuariosSalvos) {
          const usuariosData = JSON.parse(usuariosSalvos);

          // Encontrar o usuário com o ID correspondente
          const usuarioEncontrado = usuariosData.find(
            (usuario) => usuario.id === parseInt(usuarioId)
          );

          if (usuarioEncontrado) {
            setUserFormData(usuarioEncontrado);
            setUserDataOriginal(usuarioEncontrado);
          } else {
            console.error(
              "Usuário com o ID especificado não encontrado no localStorage."
            );
          }
        } else {
          console.error("Nenhum usuário encontrado no localStorage.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    buscarDadosUsuario();
  }, [userData]);

  const handleChange = (e) => {
    setUserFormData({ ...userFormData, [e.target.id]: e.target.value });
    console.log(userFormData);
  };

  const handleEditUserData = () => {
    try {
      const usuarioId = userData ? userData.id : null;

      if (!usuarioId) {
        console.error("Usuário não está logado.");
        return;
      }

      const usuariosSalvos = localStorage.getItem("usuarios");

      if (usuariosSalvos) {
        const usuariosData = JSON.parse(usuariosSalvos);
        const usuarioIndex = usuariosData.findIndex(
          (usuario) => usuario.id === parseInt(usuarioId)
        );

        if (usuarioIndex !== -1) {
          usuariosData[usuarioIndex] = userFormData;
          localStorage.setItem("usuarios", JSON.stringify(usuariosData));

          // Atualizar userDataOriginal para refletir as mudanças
          setUserDataOriginal(userFormData);

          setEditando(false);
          alert("Dados atualizados com sucesso!");
        } else {
          console.error(
            "Usuário com o ID especificado não encontrado no localStorage."
          );
        }
      } else {
        console.error("Nenhum usuário encontrado no localStorage.");
      }
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  };

  const handleCancelarEdicao = () => {
    setUserFormData({ ...userDataOriginal });
    setEditando(false);
  };

  return (
    <section className="container" style={{ paddingTop: "95px" }}>
      <div className="row">
        <div
          className="col-12 col-md-10 mt-2 mb-3 mx-auto py-3 px-md-5"
          style={{}}
        >
          <h1 className="fw-bolded fs-3 text-warning text-center">
            Meus dados
          </h1>
          <form>
            <div className="mx-1 mb-1">
              <label htmlFor="name" className="form-label fw-bold">
                Nome:
              </label>
              <input
                type="text"
                className="form-control"
                id="nome"
                value={userFormData.nome}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="adress" className="form-label fw-bold">
                Endereço:
              </label>
              <input
                type="text"
                className="form-control"
                id="endereco"
                value={userFormData.endereco}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="city" className="form-label fw-bold">
                Cidade:
              </label>
              <input
                type="text"
                className="form-control"
                id="cidade"
                value={userFormData.cidade}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="state" className="form-label fw-bold">
                Estado:
              </label>
              <input
                type="text"
                className="form-control"
                id="estado"
                value={userFormData.estado}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="cep" className="form-label fw-bold">
                CEP:
              </label>
              <input
                type="text"
                className="form-control"
                id="cep"
                value={userFormData.cep}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="tel1" className="form-label fw-bold">
                Telefone 1:
              </label>
              <input
                type="text"
                className="form-control"
                id="telefone1"
                value={userFormData.telefone1}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="tel2" className="form-label fw-bold">
                Telefone 2:
              </label>
              <input
                type="text"
                className="form-control"
                id="telefone2"
                value={userFormData.telefone2}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            <div className="mx-1 mb-1">
              <label htmlFor="email" className="form-label fw-bold">
                Email:
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={userFormData.email}
                onChange={handleChange}
                disabled={!editando}
              />
            </div>
            {!editando && (
              <button
                type="button"
                className="btn btn-warning d-flex justify-content-center d-flex justify-content-center mx-auto mt-3"
                onClick={() => setEditando(true)}
              >
                Editar dados
              </button>
            )}
            {editando && (
              <div className="d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-warning mx-1 mt-3"
                  onClick={() => handleEditUserData()}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mx-1 mt-3"
                  onClick={handleCancelarEdicao}
                >
                  Cancelar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default MeusDados;
