import { useState } from "react";
import { FaRegEdit, FaRegTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoIosSave } from "react-icons/io";

const Main = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  return (
    <div className="p-4 sm:ml-64 mt-20">
      <div class="flex flex-row items-center justify-between mb-2">
          <h1 class="text-2xl">Mantenimiento Supervidores</h1>
          <button
            data-modal-target="crud-modal" data-modal-toggle="crud-modal"
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 cursor-pointer flex flex-row items-center gap-1.5"
          >
            <IoIosAddCircleOutline class="w-5 h-5 text-white" />
            Agregar
          </button>
      </div>

      {/* Modal */}
       <div id="crud-modal" tabindex="-1" aria-hidden="true" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative p-4 w-full max-w-md max-h-full">
            {/* Modal content */}
            <div class="relative bg-[#fdfbf5] rounded-lg shadow-sm">
                {/* Modal header  */}
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-[#e8dfc8]">
                    <h3 class="text-lg font-semibold text-[#3d2f1f]">
                        Nuevo Supervisor
                    </h3>
                    <button type="button" class="text-white cursor-pointer rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center bg-[#a89878] hover:bg-[#7a6a52]" data-modal-toggle="crud-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Modal body */}
                <form class="p-4 md:p-5">
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-[#3d2f1f]">Nombres</label>
                            <input type="text" name="name" id="name" class="bg-[#f0e6d0] border border-[#e8dfc8] text-[#3d2f1f] text-sm rounded-lg focus:ring-gray-600 focus:border-primary-600 block w-full p-2.5" placeholder="Jose Edu" required="" />
                        </div>
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-[#3d2f1f]">Apellidos</label>
                            <input type="text" name="name" id="name" class="bg-[#f0e6d0] border border-[#e8dfc8] text-[#3d2f1f] text-sm rounded-lg focus:ring-gray-600 focus:border-primary-600 block w-full p-2.5" placeholder="Perez Galvez" required="" />
                        </div>
                        <div class="col-span-2">
                            <label for="name" class="block mb-2 text-sm font-medium text-[#3d2f1f]">Celular</label>
                            <input type="text" name="name" id="name" class="bg-[#f0e6d0] border border-[#e8dfc8] text-[#3d2f1f] text-sm rounded-lg focus:ring-gray-600 focus:border-primary-600 block w-full p-2.5" placeholder="999666555" required="" />
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="price" class="block mb-2 text-sm font-medium text-[#3d2f1f]">Usuario</label>
                            <input type="text" name="price" id="price" class="bg-[#f0e6d0] border border-[#e8dfc8] text-[#3d2f1f] text-sm rounded-lg focus:ring-gray-600 focus:border-primary-600 block w-full p-2.5" placeholder="98655213" required="" />
                        </div>
                        <div class="col-span-2 sm:col-span-1 relative">
                            <label for="price" class="block mb-2 text-sm font-medium text-[#3d2f1f]">Contraseña</label>
                            <input type={showPassword ? "text" : "password"} name="price" id="price" class="bg-[#f0e6d0] border border-[#e8dfc8] text-[#3d2f1f] text-sm rounded-lg focus:ring-gray-600 focus:border-primary-600 block w-full p-2.5" placeholder="pepito123" required="" />
                            <div className="absolute right-0 bottom-2.5 pr-4 flex items-center">
                              <button type="button" onClick={togglePasswordVisibility} className="focus:outline-none cursor-pointer">
                                {showPassword ? (
                                    <FaEyeSlash className="w-5 h-5 text-[#a89878]" />
                                  ) : (
                                    <FaEye className="w-5 h-5 text-[#a89878]" />
                                  )
                                }
                              </button>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="text-white cursor-pointer inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <IoIosSave class="w-5 h-5 mr-1.5 text-white" />
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    </div> 

    {/* Tabla de Información */}
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-[#a89878] dark:text-gray-400">
          <thead class="text-xs text-[#7a6a52] uppercase bg-[#f0e6d0] border-b-1 border-b-[#e8dfc8]">
            <tr>
              <th scope="col" class="px-6 py-3">
                Nombres
              </th>
              <th scope="col" class="px-6 py-3">
                Apellidos
              </th>
              <th scope="col" class="px-6 py-3">
                Celular
              </th>
              <th scope="col" class="px-6 py-3">
                Usuario
              </th>
              <th scope="col" class="px-6 py-3">
                Contraseña
              </th>
              <th scope="col" class="px-6 py-3">
                Fecha de Creación
              </th>
              <th scope="col" class="px-6 py-3">
                <span class="text-black">Acciones</span>
              </th>
              <th scope="col" class="px-6 py-3">
                <span class="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Jose Edu</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Perez Galvez</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">999666333</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">jose123</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">jose123</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-09</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]" />
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Marlene Linares</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Zapata</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">999652312</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">marlene123</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">marlene123</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-07</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]" />
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Joaquin Cesar</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Vasquez</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">963258741</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-08</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]"/>
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Joaquin Cesar</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Vasquez</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">963258741</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-08</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]" />
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Joaquin Cesar</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Vasquez</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">963258741</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-08</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]" />
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Joaquin Cesar</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Vasquez</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">963258741</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-08</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]" />
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
            <tr class="bg-[#fdfbf5] hover:bg-[#32A3B5] transition-all duration-300 ease-in-out">
              <th scope="row" class="px-6 py-4 font-medium text-[#3d2f1f] whitespace-nowrap hover:text-white">Joaquin Cesar</th>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">Vasquez</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">963258741</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">joaqui14</td>
              <td class="px-6 py-4 text-[#7a6a52] hover:text-white">2025-06-08</td>
              <td class="px-4 py-4">
                <div class="bg-[#E2FFF3] w-full px-4 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegEdit class="w-4 h-4 text-[#4AB58E]" />
                  <span class="text-[#4AB58E]">Editar</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="bg-[#FFE2E3] px-3 py-3 flex flex-row items-center justify-center gap-1.5 rounded-lg cursor-pointer">
                  <FaRegTrashAlt class="w-4 h-4 text-[#BF0609]" />
                  <span class="text-[#BF0609]">Eliminar</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
    </div>
    </div>
  );
};

export default Main;
