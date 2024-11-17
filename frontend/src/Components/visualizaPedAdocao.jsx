import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const VisualizaPedAdocao = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pedidosAdocao, setPedidosAdocao] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca o animal no localStorage
    const animaisDoacao =
      JSON.parse(localStorage.getItem("animaisDoacao")) || [];
    const animalEncontrado = animaisDoacao.find((animal) => animal.id === id);
    setAnimal(animalEncontrado);

    // Busca os pedidos de adoção do animal no localStorage
    const formulariosAdocao =
      JSON.parse(localStorage.getItem("formulariosAdocao")) || [];
    const pedidosAnimal = formulariosAdocao.filter(
      (pedido) => pedido.animalId === id
    );
    setPedidosAdocao(pedidosAnimal);
  }, [id]);

  const atualizarStatusPedido = (pedidoId, novoStatus) => {
    // Atualiza o localStorage
    const formulariosAdocao =
      JSON.parse(localStorage.getItem("formulariosAdocao")) || [];
    const index = formulariosAdocao.findIndex(
      (pedido) => pedido.animalId === pedidoId
    );

    if (index !== -1) {
      formulariosAdocao[index].status = novoStatus;
      localStorage.setItem(
        "formulariosAdocao",
        JSON.stringify(formulariosAdocao)
      );
    }
  };

  if (!animal) {
    return <div>Carregando...</div>;
  }

  return (
    <section
      className="container-fluid"
      style={{
        paddingTop: "93px",
        minHeight: "calc(100vh - 154px)",
      }}
    >
      <Link to="/minhasDoacoes" className="text-warning fw-bold my-2">
        Voltar
      </Link>
      <div className="row">
        {/* Informações do Animal */}
        <div className="col-md-4 mt-2 pt-4">
          <div className="d-flex justify-content-center">
            <img
              className=""
              src={animal.fotosPet[0]} // Exibe a primeira foto do animal
              alt={animal.nomePet}
              style={{ maxWidth: "400px" }}
            />
          </div>
          <h1 className="fs-3 p-2 text-center">{animal.nomePet}</h1>
          <p className="fs-5 text-center">{animal.descricaoPet}</p>
          <ul
            className="ms-4 p-2 text-center"
            style={{ listStyleType: "none" }}
          >
            <li>Raça: {animal.racaPet}</li>
            <li>Sexo: {animal.sexo}</li>
            <li>Idade: {animal.idadePet} anos</li>
            <li>Personalidade: {animal.personalidadePet}</li>
            <li>Necessidades Especiais: {animal.necessidadesEspeciaisPet}</li>
            <li>Porte: {animal.pesoPet} kg</li>
            <li>
              Cidade: {animal.cidade} - {animal.estado}
            </li>
          </ul>
        </div>

        {/* Tabela de Pedidos de Adoção */}
        <div className="col-md-8 mt-2 pt-4">
          <h2 className="text-center mb-3">Pedidos de Adoção</h2>
          {pedidosAdocao.length === 0 ? (
            <p>Não há pedidos de adoção para este animal.</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Data do Pedido</th>
                  <th>Nome do Adotante</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosAdocao.map((pedido) => (
                  <tr key={pedido.formId}>
                    <td>{pedido.dataPedido}</td>
                    <td>{pedido.adotanteNome}</td>
                    <td>{pedido.status}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-warning text-dark btn-sm me-2"
                        onClick={() =>
                          navigate(
                            `/visualizaPedAdocaoDetalhes/${pedido.formId}`
                          )
                        }
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

export default VisualizaPedAdocao;
