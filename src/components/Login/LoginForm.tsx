import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";

export default function LoginForm({ onSubmit, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full px-6 py-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-2 flex justify-center">
        <img
          src="/logo-muni.png"
          alt="Logo Municipalidad"
          className="w-60 object-contain"
        />
      </div>
      <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        Iniciar Sesión
      </h2>
      <p className="text-center text-gray-500 mb-8 text-sm">
        Bienvenido de vuelta
      </p>

      <div className="space-y-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
            required
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <FaRegUser className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
            required
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none cursor-pointer">
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5 text-gray-400" />
              ) : (
                <FaEye className="w-5 h-5 text-gray-400" />
              )
            }
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full cursor-pointer bg-gradient-to-r bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Cargando...
            </div>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </div>
    </div>
  );
}
