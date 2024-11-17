import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";

const MinhasDoacoes = () => {
  const { userData } = useContext(AuthContext);
  const [minhasDoacoes, setMinhasDoacoes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarMinhasDoacoes = () => {
      const animaisDoacao =
        JSON.parse(localStorage.getItem("animaisDoacao")) || [];

      // Filtra os animais de doação pelo ID do usuário logado
      const minhasDoacoesFiltradas = animaisDoacao.filter(
        (animal) => animal.usuarioId === userData.id
      );

      setMinhasDoacoes(minhasDoacoesFiltradas);
    };

    carregarMinhasDoacoes();
  }, [userData]);

  const handleExcluirDoacao = (animalId) => {
    const confirmarExclusao = window.confirm(
      "Tem certeza que deseja excluir esta doação?"
    );

    if (confirmarExclusao) {
      const animaisDoacao =
        JSON.parse(localStorage.getItem("animaisDoacao")) || [];
      const animaisDoacaoAtualizado = animaisDoacao.filter(
        (animal) => animal.id !== animalId
      );
      localStorage.setItem(
        "animaisDoacao",
        JSON.stringify(animaisDoacaoAtualizado)
      );
      setMinhasDoacoes(
        animaisDoacaoAtualizado.filter(
          (animal) => animal.usuarioId === userData.id
        )
      );
      alert("Doação excluída com sucesso!");
      navigate("/minhasDoacoes"); // Redireciona para atualizar a lista
    }
  };

  return (
    <section
      className="container "
      style={{
        paddingTop: "95px",
        minHeight: "92vh",
      }}
    >
      <div className="row">
        <div className="col-8 col-md-10 mt-2 mb-3 mx-auto py-3 px-md-5">
          <h1 className="fw-bolded fs-3 text-warning text-center">
            Minhas doações
          </h1>
        </div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Data do Cadastro</th>
              <th>Nome do Animal</th>
              <th>Ver Pedidos de Adoção</th>
              <th>Excluir</th> {/* Nova coluna para exclusão */}
            </tr>
          </thead>
          <tbody>
            {minhasDoacoes.map((doacao) => (
              <tr key={doacao.id}>
                <td>{doacao.dataCadastro}</td>
                <td>
                  <Link
                    to={`/animalDetalhes/${doacao.id}`}
                    className="text-dark"
                  >
                    {doacao.nomePet}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/visualizaPedAdocao/${doacao.id}`}
                    className="btn btn-warning text-dark btn-sm mx-sm-4"
                  >
                    Ver Pedidos
                  </Link>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mx-sm-4"
                    onClick={() => handleExcluirDoacao(doacao.id)} // Chama a função de exclusão com o ID da doação
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MinhasDoacoes;
