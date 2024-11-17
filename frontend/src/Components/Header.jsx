import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/MyContext";

const Header = () => {
  const {
    isUserLoggedIn,
    setIsUserLoggedIn,
    userData,
    setUserData,
    saveUserDataToCookies,
  } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const userLoggedData = userData;

  const handleLogout = () => {
    setUserData({ id: "", name: "" });

    saveUserDataToCookies({ id: "", name: "" });

    setIsUserLoggedIn(false);

    navigate("/");
  };

  return (
    <div>
      <nav
        className="navbar fixed-top navbar-expand-md bg-body-tertiary"
        style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.3)" }}
      >
        <div className="container-fluid px-md-5 mx-md-5 mx-1">
          <Link className="navbar-brand ms-3" to="/">
            <img
              style={{ maxWidth: "55px" }}
              alt="Logo"
              src="../../public/assets/img/Logo.png"
            />
          </Link>
          <button
            className="navbar-toggler me-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            id="navbarTooggler"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav align-items-center ms-auto fw-bolded fs-5">
              <li className="nav-item px-3">
                <Link
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/"
                  onClick={() => {
                    const navbarToggler =
                      document.getElementById("navbarToggler");
                    const bsCollapse =
                      bootstrap.Collapse.getInstance(navbarToggler);
                    bsCollapse && bsCollapse.hide();
                  }}
                >
                  Início
                </Link>
              </li>
              <li className="nav-item px-2">
                <Link
                  className={`nav-link ${
                    location.pathname === "/animais" ? "active" : ""
                  }`}
                  to="/animais"
                  onClick={() => {
                    const navbarToggler =
                      document.getElementById("navbarToggler");
                    const bsCollapse =
                      bootstrap.Collapse.getInstance(navbarToggler);
                    bsCollapse && bsCollapse.hide();
                  }}
                >
                  Quero adotar
                </Link>
              </li>
              <li className="nav-item px-2">
                <Link
                  className={`nav-link ${
                    location.pathname === "/doacao" ? "active" : ""
                  }`}
                  to="/doacao"
                  onClick={() => {
                    const navbarToggler =
                      document.getElementById("navbarToggler");
                    const bsCollapse =
                      bootstrap.Collapse.getInstance(navbarToggler);
                    bsCollapse && bsCollapse.hide();
                  }}
                >
                  Quero doar
                </Link>
              </li>
              <li className="nav-item px-2 btn-group">
                {isUserLoggedIn ? (
                  <div className="dropdown">
                    <button
                      className="btn btn-warning text-dark nav-item fw-bolded fs-5 dropdown-toggle"
                      type="button"
                      id="userDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      onClick={() => {
                        const navbarToggler =
                          document.getElementById("navbarToggler");
                        const bsCollapse =
                          bootstrap.Collapse.getInstance(navbarToggler);
                        bsCollapse && bsCollapse.hide();
                      }}
                    >
                      {userLoggedData.name}
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="userDropdown"
                    >
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/meusDados"
                          onClick={() => {
                            const navbarToggler =
                              document.getElementById("navbarToggler");
                            const bsCollapse =
                              bootstrap.Collapse.getInstance(navbarToggler);
                            bsCollapse && bsCollapse.hide();
                          }}
                        >
                          Meus dados
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/minhasAdocoes"
                          onClick={() => {
                            const navbarToggler =
                              document.getElementById("navbarToggler");
                            const bsCollapse =
                              bootstrap.Collapse.getInstance(navbarToggler);
                            bsCollapse && bsCollapse.hide();
                          }}
                        >
                          Minha adoções
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/minhasDoacoes"
                          onClick={() => {
                            const navbarToggler =
                              document.getElementById("navbarToggler");
                            const bsCollapse =
                              bootstrap.Collapse.getInstance(navbarToggler);
                            bsCollapse && bsCollapse.hide();
                          }}
                        >
                          Minhas doações
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            handleLogout();
                            const navbarToggler =
                              document.getElementById("navbarToggler");
                            const bsCollapse =
                              bootstrap.Collapse.getInstance(navbarToggler);
                            bsCollapse && bsCollapse.hide();
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <Link
                    className="btn btn-warning text-dark nav-item fw-bolded fs-5 mt-3"
                    to="/loginUsuario"
                    onClick={() => {
                      const navbarToggler =
                        document.getElementById("navbarToggler");
                      const bsCollapse =
                        bootstrap.Collapse.getInstance(navbarToggler);
                      bsCollapse && bsCollapse.hide();
                    }}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
