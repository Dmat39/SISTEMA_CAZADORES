import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import { useLogin } from "../hooks/Login/useLogin";
import LoginForm from "../components/Login/LoginForm";

const LoginPage = () => {
  // const { handleLogin, loading, error } = useLogin();
  // const navigate = useNavigate();

  // const authorized = useSelector((state) => state.auth.authorized);

  // if (authorized) return <Navigate to="/dashboard" />;

  // const onSubmit = async (credentials) => {
  //   const result = await handleLogin(credentials);
  //   if (result) {
  //     navigate("/dashboard");
  //   }
  // };
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative bg-[url(/public/imagen-municipalidad-sjl.jpg)]">
      {/* Capa de Opacidad negra */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      {/* Panel Centrado */}
      <div className="relative z-10 w-96">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
