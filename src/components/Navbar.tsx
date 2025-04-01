import { Link } from "react-router-dom"

function Navbar() {
  return (
    <div className=" text-xl flex justify-center item-center gap-5 mt-10 h-20">
      <p  className="hover:text-xl cursor-pointer transition-all duration-300"><p>mainly.ai</p></p>
      <Link to="/" className="hover:text-2xl cursor-pointer transition-all duration-300"><p>nodelib</p></Link>
      <Link to="/admin/signin" className="hover:text-2xl cursor-pointer transition-all duration-300"><p>admin</p></Link>
    </div>
  )
}

export default Navbar
