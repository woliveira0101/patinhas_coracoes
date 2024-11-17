import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Home from "./Components/Home";
import Animais from "./Components/Animais";
import AnimalDetalhes from "./Components/AnimalDetalhes";
import LoginUsuario from "./Components/loginUsuario";
import FormDoacao from "./Components/formDoacao";
import CadastroUsuario from "./Components/cadastroUsuario";
import FormAdocao from "./Components/formAdocao";
import MeusDados from "./Components/meusDados";
import { AuthProvider } from "./Context/MyContext";
import MinhasAdocoes from "./Components/minhasAdocoes";
import MinhasDoacoes from "./Components/minhasDoacoes";
import PrivateRoute from "./PrivateRoute";
import VisualizaPedAdocao from "./Components/visualizaPedAdocao";
import VisualizaPedidoAdocaoDetalhes from "./Components/visualizaPedAdocaoDetalhes";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/animais" element={<Animais />} />
            <Route path="/animalDetalhes/:id" element={<AnimalDetalhes />} />
            <Route path="/cadastroUsuario" element={<CadastroUsuario />} />
            <Route path="/loginUsuario" element={<LoginUsuario />} />
            <Route path="/doacao" element={<FormDoacao />} />
            <Route path="/formAdocao/:id" element={<FormAdocao />} />
            <Route path="/meusDados" element={<MeusDados />} />
            <Route path="/minhasAdocoes" element={<MinhasAdocoes />} />
            <Route path="/minhasDoacoes" element={<MinhasDoacoes />} />
            <Route
              path="/visualizaPedAdocao/:id"
              element={<VisualizaPedAdocao />}
            />
            <Route
              path="/visualizaPedAdocaoDetalhes/:id"
              element={<VisualizaPedidoAdocaoDetalhes />}
            />

            {/* <Route
              path="/doacao"
              element={
                <PrivateRoute>
                  <FormDoacao />
                </PrivateRoute>
              }
            />
            <Route
              path="/formAdocao"
              element={
                <PrivateRoute>
                  <FormAdocao />
                </PrivateRoute>
              }
            />
            <Route
              path="/meusDados"
              element={
                <PrivateRoute>
                  <MeusDados />
                </PrivateRoute>
              }
            />
            <Route
              path="/minhasAdocoes"
              element={
                <PrivateRoute>
                  <MinhasAdocoes />
                </PrivateRoute>
              }
            />
            <Route
              path="/minhasDoacoes"
              element={
                <PrivateRoute>
                  <MinhasDoacoes />
                </PrivateRoute>
              }
            /> */}
          </Routes>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
