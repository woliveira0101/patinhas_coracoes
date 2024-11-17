import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VisualizaPedidoAdocaoDetalhes = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [adotante, setAdotante] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Função para buscar os dados do pedido da localStorage
    const buscarPedido = () => {
      const formulariosAdocao =
        JSON.parse(localStorage.getItem("formulariosAdocao")) || [];
      const pedidoEncontrado = formulariosAdocao.find(
        (pedido) => pedido.formId === Number(id)
      );
      setPedido(pedidoEncontrado);

      // Fetch adopter info if pedido is found
      if (pedidoEncontrado) {
        buscarAdotante(pedidoEncontrado.adotanteId);
      }
    };
    const buscarAdotante = (adotanteId) => {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const adotanteEncontrado = usuarios.find(
        (usuario) => usuario.id === Number(adotanteId)
      );
      setAdotante(adotanteEncontrado);
    };

    buscarPedido();
  }, [id]);

  if (!pedido) {
    return <div>Carregando pedido...</div>;
  }

  if (!adotante) {
    return <div>Carregando dados do adotante...</div>;
  }

  const handleSaveClick = () => {
    const selectElement = document.getElementById("status_pedido");
    const novoStatus = selectElement.value;

    // 1. Buscar os dados do localStorage
    const formulariosAdocao =
      JSON.parse(localStorage.getItem("formulariosAdocao")) || [];

    // 2. Encontrar o índice do pedido a ser atualizado
    const index = formulariosAdocao.findIndex((p) => p.formId === Number(id));

    if (index !== -1) {
      // 3. Atualizar o status do pedido
      formulariosAdocao[index].status = novoStatus;

      // 4. Salvar os dados atualizados de volta no localStorage
      localStorage.setItem(
        "formulariosAdocao",
        JSON.stringify(formulariosAdocao)
      );

      // 5. Atualizar o estado do componente (opcional, mas recomendado)
      setPedido(formulariosAdocao[index]);

      if (novoStatus === "Aprovado") {
        marcarAnimalComoAdotado(pedido.animalId); // Passar o ID do animal
      }

      // Redirecionar para a página anterior
      navigate(-1);
    }
  };

  const marcarAnimalComoAdotado = (animalId) => {
    // 1. Buscar os dados dos animais do localStorage
    const animaisDoacao =
      JSON.parse(localStorage.getItem("animaisDoacao")) || [];

    // 2. Encontrar o índice do animal a ser atualizado
    const indexAnimal = animaisDoacao.findIndex((a) => a.id === animalId);

    if (indexAnimal !== -1) {
      // 3. Atualizar a propriedade "adotado" do animal
      animaisDoacao[indexAnimal].adotado = true;

      // 4. Salvar os dados atualizados de volta no localStorage
      localStorage.setItem("animaisDoacao", JSON.stringify(animaisDoacao));
    }
  };

  return (
    <section
      className="container-fluid"
      style={{
        paddingTop: "95px",
        minHeight: "92vh",
      }}
    >
      <div className="row">
        {/* Adicionei a tag <div className="row"> aqui */}
        <div className="col-md-12">
          <h2 className="mb-4 d-flex justify-content-center mx-auto text-center">
            Pedido de Adoção <br /> {pedido.animalNome}
          </h2>
          <div className="mx-2">
            {/* Detalhes do Pedido */}
            <div className="row d-flex justify-content-center mx-auto">
              <h6 className="col">Nome:</h6>
              <p className="col">{adotante.nome}</p>{" "}
            </div>
            <div className="row d-flex justify-content-center mx-auto">
              <h6 className="col">Telefone 1:</h6>{" "}
              <p className="col">{adotante.telefone1}</p>{" "}
            </div>
            <div className="row d-flex justify-content-center mx-auto">
              <h6 className="col">Telefone 2:</h6>{" "}
              <p className="col">{adotante.telefone2}</p>{" "}
            </div>
            <div className="row d-flex justify-content-center mx-auto">
              <h6 className="col align-baseline">E-mail:</h6>{" "}
              <p className="col align-baseline">{adotante.email}</p>{" "}
            </div>
            <div className="row d-flex justify-content-center mx-auto">
              <h6 className="col align-baseline">Endereço:</h6>{" "}
              <p className="col align-baseline">
                {adotante.endereco}, {adotante.cidade}-{adotante.estado}
              </p>
            </div>
          </div>

          {/* Formulário de Adoção (somente leitura) */}
          <div className="row mx-1">
            <div
              className="col-12 mt-2 mb-3 py-3 px-md-5 border rounded bg-body-tertiary"
              style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.3)" }}
            >
              <h1 className="fw-bolded fs-3 text-warning text-center">
                Formulário de pedido de adoção
              </h1>
              {/* Perguntas e Respostas */}
              {pedido.respostas.map((item, index) => (
                <div className="mx-1 mb-2" key={index}>
                  <label
                    htmlFor={`perguntaform${index + 1}`}
                    className="form-label"
                  >
                    {index + 1}) {item.texto}
                  </label>
                  <textarea
                    className="form-control"
                    id={`perguntaform${index + 1}`}
                    rows="2"
                    disabled
                    readOnly
                    value={item.resposta}
                  ></textarea>
                </div>
              ))}
            </div>
          </div>

          {/* Status do Pedido */}
          <div className="mt-4 d-flex justify-content-center mx-auto">
            <label htmlFor="status_pedido" className="form-label fw-bold fs-4">
              Status:
            </label>
            <select
              id="status_pedido"
              className="form-select ms-2"
              style={{ width: "200px" }}
              aria-label="Default select example"
              value={pedido.status}
              onChange={(e) => setPedido({ ...pedido, status: e.target.value })}
            >
              {/* Opções do Select */}
              {["Em análise", "Aprovado", "Reprovado"].map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>

          {/* Botões */}
          <div className="my-4 d-flex justify-content-center mx-auto">
            <button
              type="button"
              className="btn btn-warning me-2"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveClick}
            >
              Atualizar Status
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualizaPedidoAdocaoDetalhes;
