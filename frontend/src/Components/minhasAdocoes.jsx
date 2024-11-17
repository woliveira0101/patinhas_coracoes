import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";

const MinhasAdocoes = () => {
  const { userData } = useContext(AuthContext);
  const [minhasAdocoes, setMinhasAdocoes] = useState([]);

  useEffect(() => {
    // Função para carregar as adoções do usuário logado
    const carregarMinhasAdocoes = () => {
      const formulariosAdocao =
        JSON.parse(localStorage.getItem("formulariosAdocao")) || [];

      // Filtra os formulários de adoção pelo ID do usuário logado
      const minhasAdocoesFiltradas = formulariosAdocao.filter(
        (formulario) => formulario.adotanteId === userData.id
      );

      setMinhasAdocoes(minhasAdocoesFiltradas);
    };

    // Carrega as adoções quando o componente é montado e quando userData muda
    carregarMinhasAdocoes();
  }, [userData]);

  return (
    <section
      className="container"
      style={{
        paddingTop: "95px",
        minHeight: "92vh",
      }}
    >
      <div className="row">
        <div className="col-8 col-md-10 mt-2 mb-3 mx-auto px-md-5">
          <h1 className="fw-bolded fs-3 text-warning text-center">
            Minhas adoções
          </h1>
        </div>
        <table className="table table-hover mx-auto">
          <thead>
            <tr>
              <th>Data do Pedido</th>
              <th>Nome do Animal</th>
              <th>Tipo de Animal</th>
              <th>Status do Pedido de Adoção</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderiza as linhas da tabela com base nas minhasAdocoes */}
            {minhasAdocoes.map((adocao) => (
              <tr key={adocao.animalId}>
                <td>{adocao.dataPedido}</td>
                <td>
                  <Link
                    to={`/animalDetalhes/${adocao.animalId}`}
                    className="text-dark"
                  >
                    {adocao.animalNome}
                  </Link>
                </td>
                <td>{adocao.animalEspecie}</td>
                <td>{adocao.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MinhasAdocoes;
