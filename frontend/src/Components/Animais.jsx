import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";

const Animais = () => {
  const [selectedEspecies, setSelectedEspecies] = React.useState([]);
  const [selectedSexos, setSelectedSexos] = React.useState([]);
  const [selectedIdades, setSelectedIdades] = React.useState([]);
  const [selectedPortes, setSelectedPortes] = React.useState([]);
  const [animaisFiltrados, setAnimaisFiltrados] = useState([]);

  const optionsEspecies = [
    { value: "Cão", label: "Cão" },
    { value: "Gato", label: "Gato" },
    { value: "Ave", label: "Ave" },
    { value: "Equino", label: "Equino" },
    { value: "Réptil", label: "Réptil" },
  ];

  const optionsSexo = [
    { value: "Macho", label: "Macho" },
    { value: "Fêmea", label: "Fêmea" },
  ];

  const optionsIdade = [
    { value: "ate5anos", label: "Até 5 anos" },
    { value: "ate10anos", label: "Até 10 anos" },
    { value: "ate15anos", label: "Até 15 anos" },
    { value: "ate20anos", label: "Até 20 anos" },
  ];

  const optionsPorte = [
    { value: "grande", label: "Grande (mais de 25 Kg)" },
    { value: "medio", label: "Médio (até 25 Kg)" },
    { value: "pequeno", label: "Pequeno (até 10 Kg)" },
  ];

  useEffect(() => {
    const buscarAnimaisDoLocalStorage = () => {
      const animaisDoacao =
        JSON.parse(localStorage.getItem("animaisDoacao")) || [];
      setAnimaisFiltrados(animaisDoacao);
    };

    buscarAnimaisDoLocalStorage();
  }, []);

  useEffect(() => {
    filtrarAnimais();
  }, [selectedEspecies, selectedSexos, selectedIdades, selectedPortes]);

  const filtrarAnimais = () => {
    const animaisData = JSON.parse(localStorage.getItem("animaisDoacao")) || [];
    const animaisDoacao = animaisData.filter((animal) => !animal.adotado);

    const animaisFiltrados = animaisDoacao.filter((animal) => {
      const especieMatch =
        selectedEspecies.length === 0 ||
        selectedEspecies.some((especie) => especie.value === animal.especie);
      const sexoMatch =
        selectedSexos.length === 0 ||
        selectedSexos.some((sexo) => sexo.value === animal.sexo);
      const idadeMatch =
        selectedIdades.length === 0 ||
        (animal.idadePet <= 5 &&
          selectedIdades.some((idade) => idade.value === "ate5anos")) ||
        (animal.idadePet > 5 &&
          animal.idadePet <= 10 &&
          selectedIdades.some((idade) => idade.value === "ate10anos")) ||
        (animal.idadePet > 10 &&
          animal.idadePet <= 15 &&
          selectedIdades.some((idade) => idade.value === "ate15anos")) ||
        (animal.idadePet > 15 &&
          animal.idadePet <= 20 &&
          selectedIdades.some((idade) => idade.value === "ate20anos"));
      const porteMatch =
        selectedPortes.length === 0 ||
        (animal.pesoPet > 25 &&
          selectedPortes.some((porte) => porte.value === "grande")) ||
        (animal.pesoPet <= 25 &&
          animal.pesoPet > 10 && // Corrected range
          selectedPortes.some((porte) => porte.value === "medio")) ||
        (animal.pesoPet <= 10 &&
          selectedPortes.some((porte) => porte.value === "pequeno"));

      return especieMatch && sexoMatch && idadeMatch && porteMatch;
    });

    setAnimaisFiltrados(animaisFiltrados);
  };

  const handleSelectChange = (selectedOptions, setStateFunction) => {
    // Atualiza o estado com os objetos de opções selecionados
    setStateFunction(selectedOptions);
  };

  return (
    <section
      className="container-fluid mt-2 row"
      style={{
        paddingTop: "95px",
        minHeight: "92vh",
      }}
    >
      {/* Filtros - 2 colunas */}
      <div className="col-md-2 mb-4">
        <div>
          <h5 className="text-warning mt-2">Animais</h5>
          <Select
            value={selectedEspecies}
            onChange={(e) => handleSelectChange(e, setSelectedEspecies)}
            options={optionsEspecies}
            placeholder="Selecione"
            isMulti
          />
        </div>
        <div>
          <h5 className="text-warning mt-2">Sexo</h5>
          <Select
            value={selectedSexos}
            onChange={(e) => handleSelectChange(e, setSelectedSexos)}
            options={optionsSexo}
            placeholder="Selecione"
            isMulti
          />
        </div>
        <div>
          <h5 className="text-warning mt-2">Idade</h5>
          <Select
            value={selectedIdades}
            onChange={(e) => handleSelectChange(e, setSelectedIdades)}
            options={optionsIdade}
            placeholder="Selecione"
            isMulti
          />
        </div>
        <div>
          <h5 className="text-warning mt-2">Porte</h5>
          <Select
            value={selectedPortes}
            onChange={(e) => handleSelectChange(e, setSelectedPortes)}
            options={optionsPorte}
            placeholder="Selecione"
            isMulti
          />
        </div>
      </div>

      {/* Cards - 10 colunas */}
      <div className="col-md-10 d-flex flex-wrap mx-auto">
        {animaisFiltrados.map((animal) => (
          <div key={animal.id} className="col-md-4 mb-4 mx-auto">
            <div className="card" style={{ width: "18rem" }}>
              <img
                src={animal.fotosPet[0]}
                className="card-img-top"
                alt={animal.nomePet}
                style={{
                  height: "130px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              <div className="card-body text-center">
                <h5 className="card-title text-center">{animal.nomePet}</h5>
                <p className="card-text text-center">{animal.descricaoPet}</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item text-center">
                  {animal.racaPet}
                </li>
                <li className="list-group-item text-center">
                  {animal.idadePet} anos
                </li>
                <li className="list-group-item text-center">
                  {animal.cidade} - {animal.estado}
                </li>
              </ul>
              <div className="card-body d-flex justify-content-center">
                <Link
                  to={`/animalDetalhes/${animal.id}`}
                  className="card-link link-body-emphasis link-offset-2 link-underline-opacity-25 link-underline-opacity-75-hover"
                >
                  Quero conhecer melhor!
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Animais;
