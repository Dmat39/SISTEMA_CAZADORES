import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaRegUser } from "react-icons/fa";
import { setToken } from "../../api/config";
import { useSelector } from "react-redux";

export default function OperatorForm({ onSubmit, loading = false, initialData = {} }) {
    const { token } = useSelector((state) => state.auth);
    useEffect(() => {
    if (token) {
        setToken(token);
    }
    }, [token]);

    const [form, setForm] = useState({
        name: initialData.name || "",
        lastname: initialData.lastName || "",
        dni: initialData.dni || "",
        phone: initialData.phone || "",
        username: initialData.username || "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === "phone" || name === "dni") ? value.replace(/\D/g, "") : value;
        setForm((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div >
            <form
                onSubmit={handleSubmit}
                className="w-full px-6 py-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-5"
            >
                <h2 className="text-2xl font-bold text-center text-emerald-700">Crear Operador</h2>
                <h2 className="text-base/7 font-semibold text-gray-900 mb-1">Nombre</h2>
                <div className="space-y-5">
                    <div className="relative">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 
                            focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <h2 className="text-base/7 font-semibold text-gray-900 mb-1">Apellidos</h2>
                <div className="space-y-5">
                    <div className="relative">
                        <input
                            name="lastname"
                            value={form.lastname}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 
                            focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <h2 className="text-base/7 font-semibold text-gray-900 mb-1">Celular</h2>
                <div className="space-y-5">
                    <div className="relative">
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 
                            focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
                            required
                            pattern="\d{9}"
                            title="El número debe tener exactamente 9 dígitos"
                            disabled={loading}
                        />
                    </div>
                </div>

                <h2 className="text-base/7 font-semibold text-gray-900 mb-1">DNI</h2>
                <div className="space-y-5">
                    <div className="relative">
                        <input
                            name="dni"
                            value={form.dni}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 
                            focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
                            required
                            pattern="\d{8}"
                            title="El dni debe tener exactamente 8 dígitos"
                            disabled={loading}
                        />
                    </div>
                </div>

                <h2 className="text-base/7 font-semibold text-gray-900 mb-1">Usuario</h2>
                <div className="space-y-5">
                    <div className="relative">
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 
                            focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
                            required
                            disabled={loading}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <FaRegUser className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <h2 className="text-base/7 font-semibold text-gray-900 mb-1">Contraseña</h2>
                <div className="space-y-5">
                    <div className="relative">
                        <input
                            name="password"
                            type= {showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 
                            focus:border-green-400 outline-none transition-all duration-300 placeholder-gray-400 text-gray-700"
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
                </div>
                <button
                className="w-full cursor-pointer bg-gradient-to-r bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-4 focus:ring-green-300 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
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
                    Guardando...
                    </div>
                ) : (
                    "Guardar operador"
                )}
                </button>
            </form>
        </div>
    );
}
