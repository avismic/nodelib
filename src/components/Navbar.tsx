import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation(); // Get the current location (URL)

  return (
    <div className="text-xl flex justify-center item-center gap-5 mt-10 h-20">
      <a
        href="https://www.mainly.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-xl cursor-pointer transition-all duration-300"
      >
        mainly.ai
      </a>
{/*       <p className="hover:text-xl cursor-pointer transition-all duration-300">
        mainly.ai
      </p> */}
      <Link
        to="/"
        className={`${
          location.pathname === "/" ? "text-2xl font-bold" : "hover:text-2xl"
        } cursor-pointer transition-all duration-300`}
      >
        <p>nodelib</p>
      </Link>
      <Link
        to="/admin"
        className={`${
          location.pathname === "/admin" ? "text-2xl font-bold" : "hover:text-2xl"
        } cursor-pointer transition-all duration-300`}
      >
        <p>admin</p>
      </Link>
    </div>
  );
}

export default Navbar;
