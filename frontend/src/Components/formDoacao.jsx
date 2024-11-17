import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../Context/MyContext";
import { useNavigate } from "react-router-dom";

const FormDoacao = () => {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomePet: "",
    descricaoPet: "",
    especie: "",
    sexo: "",
    racaPet: "",
    idadePet: "",
    pesoPet: "",
    cidade: "",
    estado: "",
    personalidadePet: "",
    necessidadesEspeciaisPet: "",
    entregaPet: "",
    fotosPet: [], // Changed to array to store multiple images
  });
  const [estados, setEstados] = useState("");
  const [cidades, setCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");

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
      if (estadoSelecionado) {
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
  }, [estadoSelecionado]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Atualiza o estado do formulário com base no campo alterado
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: files ? Array.from(files) : value, // Convert FileList to array
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const checkboxDeclaracao = document.getElementById("flexCheckDefault");
    if (!checkboxDeclaracao.checked) {
      alert(
        "Por favor, marque a caixa declarando que você está decidido pela doação."
      );
      return;
    }

    // Handle multiple image uploads
    const fotosPetBase64 = [];
    let imagesProcessed = 0;

    if (formData.fotosPet.length === 0) {
      alert("Por favor, selecione pelo menos uma foto.");
      return;
    }

    for (let i = 0; i < formData.fotosPet.length; i++) {
      const reader = new FileReader();
      reader.onloadend = () => {
        fotosPetBase64.push(reader.result);
        imagesProcessed++;

        if (imagesProcessed === formData.fotosPet.length) {
          createAnimalEntry(fotosPetBase64);
        }
      };
      reader.readAsDataURL(formData.fotosPet[i]);
    }
  };

  const createAnimalEntry = (fotosPetBase64) => {
    let animaisDoacao = JSON.parse(localStorage.getItem("animaisDoacao")) || [];
    let ultimoId =
      animaisDoacao.length > 0
        ? Math.max(...animaisDoacao.map((animal) => animal.id))
        : 0;
    const novoId = ultimoId + 1;

    const dataCadastro = new Date().toLocaleDateString();

    const novoAnimal = {
      id: String(novoId),
      dataCadastro: dataCadastro,
      usuarioId: userData.id,
      usuarioNome: userData.name,
      nomePet: formData.nomePet,
      descricaoPet: formData.descricaoPet,
      especie: formData.especie,
      sexo: formData.sexo,
      racaPet: formData.racaPet,
      idadePet: formData.idadePet,
      pesoPet: formData.pesoPet,
      cidade: cidadeSelecionada,
      estado: estadoSelecionado,
      personalidadePet: formData.personalidadePet,
      necessidadesEspeciaisPet: formData.necessidadesEspeciaisPet,
      entregaPet: formData.entregaPet,
      fotosPet: fotosPetBase64, // Store all base64 image strings
    };

    animaisDoacao.push(novoAnimal);
    localStorage.setItem("animaisDoacao", JSON.stringify(animaisDoacao));

    console.log("Dados do formulário salvos no localStorage:", novoAnimal);

    // Use alert para exibir a mensagem de sucesso
    alert("Animal incluído para adoção com sucesso!");

    // Redireciona para a página de minhas doações
    navigate("/minhasDoacoes");
  };

  return (
    <section className="container " style={{ paddingTop: "95px" }}>
      <div className="row">
        <div
          className="col-10 col-md-10 mt-2 mb-3 mx-auto py-3 px-md-5 border rounded bg-body-tertiary "
          style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.3)" }}
        >
          <h1 className="fw-bolded fs-3 text-warning text-center">
            Cadastre seu pet para doação
          </h1>
          <form>
            <div className="mb-3">
              <label htmlFor="nomePet" className="form-label fw-bolded">
                Nome do Pet
              </label>
              <input
                type="text"
                className="form-control"
                id="nomePet"
                name="nomePet"
                value={formData.nomePet}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descricaoPet" className="form-label fw-bolded">
                Breve descrição do Pet
              </label>
              <textarea
                className="form-control"
                id="descricaoPet"
                name="descricaoPet"
                rows="2"
                value={formData.descricaoPet}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="row d-flex flex-column flex-sm-row">
              <div className="col mb-3">
                <label htmlFor="form_especie" className="form-label fw-bolded">
                  Espécie
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  id="especie"
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  <option value="Cão">Cão</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Equino">Equino</option>
                  <option value="Réptil">Réptil</option>
                </select>
              </div>
              <div className="col mb-3">
                <label htmlFor="form_sexo" className="form-label fw-bolded">
                  Sexo
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  id="sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  <option value="Fêmea">Fêmea</option>
                  <option value="Macho">Macho</option>
                </select>
              </div>
              <div className="col mb-3">
                <label htmlFor="racaPet" className="form-label fw-bolded">
                  Raça do Pet
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="racaPet"
                  name="racaPet"
                  value={formData.racaPet}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col mb-3">
                <label htmlFor="idadePet" className="form-label fw-bolded">
                  Idade(anos)
                </label>
                <input
                  type="number"
                  className="form-control d-inline"
                  id="idadePet"
                  name="idadePet"
                  value={formData.idadePet}
                  onChange={handleChange}
                />
              </div>
              <div className="col mb-3">
                <label htmlFor="pesoPet" className="form-label fw-bolded">
                  Peso(kg)
                </label>
                <input
                  type="number"
                  className="form-control d-inline"
                  id="pesoPet"
                  name="pesoPet"
                  value={formData.pesoPet}
                  onChange={handleChange}
                />
              </div>
              <div className="col mb-3">
                <label htmlFor="form_estado" className="form-label fw-bolded">
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
              <div className="col mb-3">
                <label htmlFor="form_cidade" className="form-label fw-bolded">
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

              <div className="mb-3">
                <label
                  htmlFor="personalidadePet"
                  className="form-label fw-bolded"
                >
                  Personalidade do Pet
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="personalidadePet"
                  name="personalidadePet"
                  value={formData.personalidadePet}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="necessidadesEspeciaisPet"
                  className="form-label fw-bolded"
                >
                  Necessidades Especiais do Pet
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="necessidadesEspeciaisPet"
                  name="necessidadesEspeciaisPet"
                  value={formData.necessidadesEspeciaisPet}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="entregaPet" className="form-label fw-bolded">
                  Disponibilidade para entregar o Pet para o Adotante? Se sim,
                  até quantos quilômetros?
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="entregaPet"
                  name="entregaPet"
                  value={formData.entregaPet}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="fotosPet" className="form-label">
                  Anexe as fotos do seu Pet
                </label>
                <input
                  className="form-control"
                  type="file"
                  id="fotosPet"
                  name="fotosPet"
                  multiple
                  onChange={handleChange}
                />
              </div>
              <div className="form-check my-4 mx-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="flexCheckDefault"
                  required
                />
                <label
                  className="form-check-label ps-1"
                  htmlFor="flexCheckDefault"
                >
                  Declaro que estou decidido pela doação, e concordo em avaliar
                  com critério o perfil dos interessados na adoção deste animal
                  de estimação.
                </label>
              </div>
              <div className="px-3 d-flex justify-content-center mx-auto">
                <button
                  type="submit"
                  className="btn btn-warning my-3 px-5"
                  onClick={handleSubmit}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FormDoacao;
