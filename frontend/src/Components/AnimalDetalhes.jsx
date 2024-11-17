import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const AnimalDetalhes = () => {
  const { id } = useParams(); // Obtém o ID da URL
  const [animal, setAnimal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca o animal no localStorage quando o componente é montado
    const animaisDoacao =
      JSON.parse(localStorage.getItem("animaisDoacao")) || [];
    const animalEncontrado = animaisDoacao.find((animal) => animal.id === id);
    setAnimal(animalEncontrado);
  }, [id]); // Executa o efeito sempre que o ID mudar

  if (!animal) {
    // Exibe uma mensagem de carregamento enquanto o animal não é encontrado
    return <div>Carregando...</div>;
  }

  return (
    <section
      className="container mt-1"
      style={{
        paddingTop: "93px",
        minHeight: "calc(100vh - 160px)",
      }}
    >
      <Link onClick={() => navigate(-1)} className="text-warning fw-bold mb-5">
        Voltar
      </Link>
      <div className="row mb-5 mx-5 px-md-5 mx-auto">
        <div className="col  pt-3">
          {/* Exibe a primeira foto do animal */}
          <img
            className="img-fluid mx-auto"
            src={animal.fotosPet[0]}
            alt={animal.nomePet}
            style={{ maxWidth: "350px", objectFit: "cover" }}
          />
          <div className="mt-3 mx-auto">
            {/* Exibe as demais fotos do animal (se houver) */}
            {animal.fotosPet.map((foto, index) => (
              <img
                key={index}
                className="me-2"
                src={foto}
                alt={animal.nomePet}
                style={{ maxWidth: "100px", objectFit: "cover" }}
              />
            ))}
          </div>
        </div>
        <div className="col pt-2">
          <h1 className="fs-3 mb-1 p-1 text-center mx-auto">
            {animal.nomePet}
          </h1>
          <p className="fs-5 mx-auto">{animal.descricaoPet}</p>
          <ul className="px-3 mx-auto">
            <li>Raça: {animal.racaPet}</li>
            <li>Sexo: {animal.sexo}</li>
            <li>Idade: {animal.idadePet} anos</li>
            <li>Personalidade: {animal.personalidadePet}</li>
            <li>Necessidades Especiais: {animal.necessidadesEspeciaisPet}</li>
            <li>Peso: {animal.pesoPet}</li>
            <li>
              Cidade: {animal.cidade} - {animal.estado}
            </li>
          </ul>
          <Link
            to={`/formAdocao/${animal.id}`}
            className="btn btn-warning text-dark nav-item fw-bolded fs-5 d-flex flex-column mx-auto"
          >
            Quero adotar!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AnimalDetalhes;
