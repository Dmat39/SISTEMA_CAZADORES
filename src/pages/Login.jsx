import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogin } from "../hooks/Login/useLogin";
import LoginForm from "../components/Login/LoginForm";

const LoginPage = () => {
  const { handleLogin, loading, error } = useLogin();
  const navigate = useNavigate();

  const authorized = useSelector((state) => state.auth.authorized);

  if (authorized) return <Navigate to="/dashboard" />;

  const onSubmit = async (credentials) => {
    const result = await handleLogin(credentials);
    if (result) {
      navigate("/dashboard");
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "src/assets/imagen-municipalidad-sjl.jpg" }}
    >
      {/* Capa de Opacidad negra */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      {/* Panel Centrado */}
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="w-full max-w-md relative z-10">
          <LoginForm onSubmit={onSubmit} loading={loading} />

          {/* Mensaje de error */}
          {error && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
