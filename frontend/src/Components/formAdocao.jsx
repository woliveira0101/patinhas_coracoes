import React, { useState, useContext } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";

const FormAdocao = () => {
  const { id } = useParams(); // Obtém o ID do animal da URL
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checkboxMarcado, setCheckboxMarcado] = useState(false);
  const [perguntas, setPerguntas] = useState([
    {
      id: 1,
      texto: "Qual o motivo pelo qual você está procurando adotar um pet?",
      resposta: "",
    },
    {
      id: 2,
      texto: "Mora em casa ou apartamento? É permitido animais no imóvel?",
      resposta: "",
    },
    {
      id: 3,
      texto: "Já tem um local preparado para o pet dormir? Como é o local?",
      resposta: "",
    },
    {
      id: 4,
      texto: "Já possui outros pets? São castrados e vacinados?",
      resposta: "",
    },
    {
      id: 5,
      texto:
        "Como irá educá-lo? O que fará quando o pet não se comportar conforme o esperado?",
      resposta: "",
    },
    {
      id: 6,
      texto:
        "Tem certeza que pode arcar com os custos de alimentação, vermifugação, vacinação, castração, assistência veterinária?",
      resposta: "",
    },
    {
      id: 7,
      texto:
        "Quando for viajar o que pretende fazer com o pet? Já tem um plano?",
      resposta: "",
    },
    {
      id: 8,
      texto:
        "Alguém da família tem alergia a pêlos? O que faria se descobrir que alguém da família tem alergia?",
      resposta: "",
    },
    {
      id: 9,
      texto:
        "Todas as pessoas que moram na casa estão cientes e de acordo com a adoção?",
      resposta: "",
    },
    {
      id: 10,
      texto:
        "Tem ciência que esse animal pode crescer, envelhecer, ficar doente, e que você é responsável por prover alimentação, lar, companhia, até o fim da vida dele?",
      resposta: "",
    },
    {
      id: 11,
      texto:
        "Tem ciência que maus-tratos contra animais podem ser punidos com reclusão, multa e proibição da guarda? O que pensa sobre isso?",
      resposta: "",
    },
  ]);

  const handleChange = (id, value) => {
    setPerguntas((prevPerguntas) =>
      prevPerguntas.map((pergunta) =>
        pergunta.id === id ? { ...pergunta, resposta: value } : pergunta
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Obtém os dados do animal do localStorage
    const animaisDoacao =
      JSON.parse(localStorage.getItem("animaisDoacao")) || [];
    const animal = animaisDoacao.find((animal) => animal.id === id);

    if (!userData) {
      alert("Você precisa estar logado para enviar o formulário.");
      return;
    }

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString();

    // Lógica para gerar ID sequencial para o formulário
    const formulariosAdocao =
      JSON.parse(localStorage.getItem("formulariosAdocao")) || [];
    const proximoId =
      formulariosAdocao.length > 0
        ? Math.max(...formulariosAdocao.map((formulario) => formulario.id)) + 1
        : 1;

    // Cria o objeto com os dados do formulário
    const dadosFormulario = {
      formId: proximoId,
      animalId: id,
      animalNome: animal ? animal.nomePet : "Animal não encontrado",
      animalEspecie: animal ? animal.especie : "Indefinido",
      doadorId: animal ? animal.usuarioId : "Indefinido",
      doadorNome: animal ? animal.usuarioNome : "Indefinido",
      adotanteId: userData.id,
      adotanteNome: userData.name,
      respostas: perguntas,
      status: "Em análise",
      dataPedido: dataFormatada,
    };

    // Salva os dados no localStorage
    formulariosAdocao.push(dadosFormulario);
    localStorage.setItem(
      "formulariosAdocao",
      JSON.stringify(formulariosAdocao)
    );

    console.log("Dados do formulário enviados:", dadosFormulario);
    alert("Formulário enviado com sucesso!");
    navigate("/minhasAdocoes");
  };

  return (
    <section className="container" style={{ paddingTop: "93px" }}>
      <div className="row">
        <div
          className="col-10 col-md-10 mt-2 mb-3 mx-auto py-3 px-md-5 border rounded bg-body-tertiary"
          style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.3)" }}
        >
          <h1 className="fw-bolded fs-3 text-warning text-center">
            Preencha o formulário para avaliarmos o pedido de adoção
          </h1>
          <form onSubmit={handleSubmit}>
            {perguntas.map((pergunta) => (
              <div key={pergunta.id} className="mx-1 mb-2">
                <label
                  htmlFor={`perguntaform${pergunta.id}`}
                  className="form-label"
                >
                  {pergunta.id}) {pergunta.texto}
                </label>
                <textarea
                  className="form-control"
                  id={`perguntaform${pergunta.id}`}
                  rows="2"
                  value={pergunta.resposta}
                  onChange={(e) => handleChange(pergunta.id, e.target.value)}
                ></textarea>
              </div>
            ))}
            <div className="form-check my-4">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckDefault"
                required
                checked={checkboxMarcado}
                onChange={(e) => setCheckboxMarcado(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                Declaro que estou ciente e decidido pela adoção, e concordo que
                os dados preenchidos acima sejam avaliados pelos tutores atuais
                do pet, prezando pela segurança e bem estar do mesmo.
              </label>
            </div>
            <button
              type="submit"
              className="btn btn-warning d-flex justify-content-center mx-auto my-3"
              disabled={!checkboxMarcado}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FormAdocao;
