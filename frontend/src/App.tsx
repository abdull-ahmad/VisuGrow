import { Route, Routes } from "react-router-dom"
import RegisterPage from "./pages/Auth/RegisterPage"
import LoginPage from "./pages/Auth/LoginPage"
import ForgotPassword from "./pages/Auth/ForgotPassword"
import ChangePassword from "./pages/Auth/ChangePassword"
import VerifyEmail from "./pages/Auth/VerifyEmail"

function App() {
  return (

    <Routes>
      <Route path="/" element={"Home"} />
      <Route path="/register" element={<RegisterPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/forgot" element={<ForgotPassword/>}></Route>
      <Route path="/reset" element={<ChangePassword/>}></Route>
      <Route path="/verify-email" element= {<VerifyEmail/>}></Route>
    </Routes>  
  )
}

export default App
