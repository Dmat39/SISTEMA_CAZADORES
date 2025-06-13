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
        <form
            onSubmit={handleSubmit}
        >
            <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Nombre *
                    </label>
                    <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                    placeholder="Ingresa el nombre del operador"
                    required
                    />
                </div>
                <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Apellidos *
                    </label>
                    <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                    placeholder="Ingresa el apellido del operador"
                    required
                    />
                </div>
                <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Celular *
                    </label>
                    <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                    placeholder="Ingresa el celular del operador"
                    required
                    />
                </div>
                <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    DNI *
                    </label>
                    <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                    placeholder="Ingresa el dni del operador"
                    required
                    />
                </div>
                <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                        Usuario *
                    </label>
                    <div className="relative">
                        <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                        placeholder="Ingresa el nuevo usuario del operador"
                        required
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <FaRegUser className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                        Contraseña *
                    </label>
                    <div className="relative">
                        <input
                        type= {showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full px-2.5 py-4 hover:border-gray-900"
                        placeholder="Ingresa la nueva contraseña del operador"
                        required
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
            </div>
            <button
            className="text-white cursor-pointer bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 float-end"
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
    );
}
