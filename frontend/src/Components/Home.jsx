import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    const inicializaAnimaisDoacao = async () => {
      const urlsImagens = [
        "../../public/assets/img/pet_1.jpg",
        "../../public/assets/img/pet_2.jpg",
        "../../public/assets/img/pet_3.jpg",
      ];

      try {
        const base64Strings = await Promise.all(
          urlsImagens.map(async (urlImagem) => {
            const response = await fetch(urlImagem);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          })
        );

        const dataCadastro = new Date().toLocaleDateString();

        const novoAnimal = [
          {
            id: "1",
            dataCadastro: dataCadastro,
            usuarioId: "999999",
            usuarioNome: "João da Silva",
            nomePet: "Steve Jobson",
            descricaoPet:
              "Esse amiguinho quer muito te acompanhar nas suas aventuras.",
            especie: "Cão",
            sexo: "Macho",
            racaPet: "Basset",
            idadePet: "5",
            pesoPet: "10",
            cidade: "Franca",
            estado: "SP",
            personalidadePet: "Brincalhão",
            necessidadesEspeciaisPet: "Nenhum",
            entregaPet: "Sim, na cidade",
            fotosPet: [base64Strings[0]], // Passa a primeira imagem Base64
          },
          {
            id: "2",
            dataCadastro: dataCadastro,
            usuarioId: "999999",
            usuarioNome: "João da Silva",
            nomePet: "Marco Zuckerdog",
            descricaoPet: "Companheiro fiel e protetor da família.",
            especie: "Cão",
            sexo: "Macho",
            racaPet: "Bulldog",
            idadePet: "6",
            pesoPet: "20",
            cidade: "Franca",
            estado: "SP",
            personalidadePet: "Amoroso",
            necessidadesEspeciaisPet: "Nenhum",
            entregaPet: "Sim, na cidade",
            fotosPet: [base64Strings[1]], // Passa a segunda imagem Base64
          },
          {
            id: "3",
            dataCadastro: dataCadastro,
            usuarioId: "999999",
            usuarioNome: "João da Silva",
            nomePet: "Bill Cattes",
            descricaoPet:
              "Esse bichano é esperto, calmo e carinhoso. Ideal para casas ou apartamentos pequenos.",
            especie: "Gato",
            sexo: "Macho",
            racaPet: "Shorthair",
            idadePet: "4",
            pesoPet: "5",
            cidade: "Franca",
            estado: "SP",
            personalidadePet: "Tranquilo",
            necessidadesEspeciaisPet: "Nenhum",
            entregaPet: "Sim, na cidade",
            fotosPet: [base64Strings[2]], // Passa a terceira imagem Base64
          },
        ];

        const animaisDoacao =
          JSON.parse(localStorage.getItem("animaisDoacao")) || [];

        // Verifica se já existe um animal com o mesmo ID antes de adicionar
        novoAnimal.forEach((animal) => {
          const animalExistente = animaisDoacao.find((a) => a.id === animal.id);

          if (!animalExistente) {
            animaisDoacao.push(animal);
          } else {
            console.warn(
              `Animal com ID ${animal.id} já existe no localStorage. Pulando a adição.`
            );
          }
        });

        localStorage.setItem("animaisDoacao", JSON.stringify(animaisDoacao));
        console.log(
          "Dados do formulário salvos no localStorage:",
          animaisDoacao
        );
      } catch (error) {
        console.error("Erro ao buscar ou processar as imagens:", error);
        alert("Erro ao carregar as imagens.");
      }
    };

    inicializaAnimaisDoacao();
  }, []);

  return (
    <>
      <section>
        <div className="container-fluid" style={{ paddingTop: "85px" }}>
          <div className="row">
            <div
              className="col d-flex"
              style={{
                height: "410px",
                backgroundImage:
                  "url(../../public/assets/img/quero_adotar.png)",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <Link
                to="/animais"
                className="d-flex flex-column py-5 px-2 mb-auto ms-1 destaque-zoom"
                style={{
                  textDecoration: "none",
                  fontSize: "45px",
                  textShadow: "4px 4px 4px rgba(0, 0, 0, 0.8)",
                }}
              >
                <span className="text-light">Quero</span>
                <span className="text-light fw-bold">Adotar!</span>
              </Link>
            </div>
            <div
              className="col d-flex"
              style={{
                height: "410px",
                backgroundImage: "url(../../public/assets/img/quero_doar.png)",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <Link
                to="/doacao"
                className="d-flex flex-column py-5 px-4 justify-content-end mt-auto ms-auto destaque-zoom"
                style={{
                  textDecoration: "none",
                  fontSize: "45px",
                  textShadow: "4px 4px 4px rgba(0, 0, 0, 0.85)",
                }}
              >
                <span className="text-light">Quero</span>
                <span className="text-light fw-bold">Doar!</span>
              </Link>
            </div>
            <style>
              {`.destaque-zoom:hover {
                transform: scale(1.1);
                transition: transform 0.6s;
              }`}
            </style>
          </div>
        </div>
      </section>

      <section className="container text-center mt-2 pt-3">
        <h2 className="text-center mt-4">Eles estão esperando por você!</h2>
        <div className="row ms-md-4">
          <div className="col my-2 my-sm-5 ms-sm-5">
            <PetCard
              imgSrc="../../public/assets/img/pet_1.jpg"
              name="Steve Jobson"
              description="Esse amiguinho quer muito te acompanhar nas suas aventuras."
              breed="Basset"
              age={5}
              location="Franca - São Paulo"
            />
          </div>
          <div className="col my-2 my-sm-5">
            <PetCard
              imgSrc="../../public/assets/img/pet_2.jpg"
              name="Marco Zuckerdog"
              description="Companheiro fiel e protetor da família."
              breed="Bulldog"
              age={6}
              location="Franca - São Paulo"
            />
          </div>
          <div className="col my-2 my-sm-5 mx-auto">
            <PetCard
              imgSrc="../../public/assets/img/pet_3.jpg"
              name="Bill Cattes"
              description="Esse bichano é esperto, calmo e carinhoso. Ideal para casas ou apartamentos pequenos."
              breed="Shorthair"
              age={4}
              location="Franca - São Paulo"
            />
          </div>
        </div>

        <div className="mt-3 d-flex justify-content-center align-items-center">
          <Link
            to="/animais"
            type="button"
            className="btn btn-warning btn-lg mb-5"
          >
            Veja mais amiguinhos disponíveis
          </Link>
        </div>
      </section>
    </>
  );
};

const PetCard = ({ imgSrc, name, description, breed, age, location }) => {
  return (
    <div className="card mx-auto" style={{ width: "18rem" }}>
      <img
        src={imgSrc}
        className="card-img-top"
        alt="..."
        style={{
          maxHeight: "160px",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div className="card-body text-center">
        <h5 className="card-title text-center">{name}</h5>
        <p className="card-text text-center p-1">{description}</p>
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item text-center">{breed}</li>
        <li className="list-group-item text-center">{age} anos</li>
        <li className="list-group-item text-center">{location}</li>
      </ul>
      <div className="card-body d-flex justify-content-center">
        <Link
          to="/animalDetalhes"
          className="card-link link-body-emphasis link-offset-2 link-underline-opacity-25 link-underline-opacity-75-hover"
        >
          Quero conhecer melhor!
        </Link>
      </div>
    </div>
  );
};

export default Home;
