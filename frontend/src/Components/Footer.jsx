import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="container-fluid bg-light mb-0"
      style={{ boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.5)", heigh: "60px" }}
    >
      <div className="container-fluid">
        <div className="row py-2">
          <div className="col text-center">
            <img
              src="../assets/img/logo.png"
              alt="Logo Patinhas e Corações"
              style={{ height: "50px" }}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
