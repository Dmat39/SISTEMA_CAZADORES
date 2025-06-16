import Icon from "@mdi/react";
import { icons } from '../../plugins/IconLibrary.js';

const FirstOperator = ({ onCreate }) => {
    return (
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-150">
            <div className="flex flex-col items-center justify-center">
            <Icon path={icons.plus} size={2} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay operadores
            </h3>
            <p className="text-gray-500 mb-6">
                Comienza creando tu primer operador para organizar tus
                registros
            </p>
            <button
                onClick={onCreate}
                className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
                type="button"
            >
                <Icon path={icons.add} size={1} />
                Crear primera Operador
            </button>
            </div>
        </div>
    );
};
export default FirstOperator;