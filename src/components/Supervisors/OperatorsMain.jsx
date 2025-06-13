import { PlusIcon } from "@heroicons/react/24/outline";
import OperatorForm from "./OperatorForm";
import { useState } from "react";
import { Box, Modal, Button } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import OperatorList from "./OperatorList";
import { createOperator } from "../../api/supervisor/operatorApi";
import { toast, Toaster  } from "sonner";


dayjs.extend(utc);

const OperatorsMain = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // await createOperator(formData);
      toast.success('Event has been created')
      console.log('Datos enviados:', formData);
    } catch (error) {
      toast.error('Error al crear operador');
      console.error('Error al crear operador:', error);
      setError(error.response?.data?.message || error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => { 
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  return (
    <>
      <div className="flex flex-row pb-5 items-center justify-between border-b-1 border-gray-200">
        <div className="block">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Operadores</h1>
          <p className="text-gray-600">Gestiona y organiza todos tus operadores</p>
        </div>
        {/* Botón Agregar Modal */}
        <button
          onClick={handleOpenModal} // Abre el modal
          className="cursor-pointer flex flex-row items-center justify-center gap-1 text-white bg-gray-900 hover:bg-[#32A3B5] focus:ring-4 focus:outline-none focus:[#32A3B5] font-medium rounded-lg text-sm px-4 py-2.5 text-center transition-all duration-300 ease-in-out"
          type="button"
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Operador
        </button>
      </div>
      <hr className="pb-4 border-gray-300"/>
      <OperatorList/>

      {/* Modal con Material-UI */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center",}}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: "100%",
            maxWidth: 500,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
            <h3 id="modal-modal-title" className="text-2xl font-semibold text-gray-900">
              Nuevo Operador
            </h3>            
            <Button onClick={handleCloseModal} class="text-white bg-gray-500 flex flex-row items-center justify-center hover:bg-gray-700 rounded-md w-8 h-8 cursor-pointer">
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"  
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </Button>
          </div>
          <div className= "p-4">
            <OperatorForm onSubmit={handleCreate}/>
          </div>
        </Box>
      </Modal>
      <Toaster position="top-right" richColors  />
    </>
  );
};

export default OperatorsMain;