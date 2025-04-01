import { BrowserRouter, Route, Routes } from "react-router-dom"
import Signi from "./components/LoginForm"
import Home from "./components/Home"
import AllList from "./components/All_list"
import Navbar from "./components/Navbar"


function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<AllList />}/>
        <Route path="/admin/signin" element={<Signi/>}/>
        <Route path="/home" element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
