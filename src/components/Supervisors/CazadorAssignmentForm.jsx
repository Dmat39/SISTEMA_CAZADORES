import { useState } from 'react';
import { toast } from 'sonner';

const CazadorAssignmentForm = ({ onClose, onSubmit, cazadores, incidenceId }) => {
  const [form, setForm] = useState({ 
    userId: '',
    userType: 'hunter'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.userId || !incidenceId) {
        toast.error('Debes seleccionar un cazador');
        return;
    }
    onSubmit?.({ 
      userId: form.userId, 
      incidenceId,
      userType: form.userType 
    });
    setForm({ 
      userId: '',
      userType: 'hunter'
    });
  };

  const handleCancel = () => {
    setForm({ 
      userId: '',
      userType: 'hunter'
    });
    onClose();
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-semibold mb-4">Asignar nuevo cazador</h3>
      <form onSubmit={handleSubmit} >
        <div className="mb-4 justify-items-center">
          <select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="" disabled hidden>Selecciona un cazador</option>
            {cazadores.map((cazador) => (
                <option key={cazador.user.id} value={cazador.user.id}>
                    {cazador.name} {cazador.lastname}
                </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-[#32A3B5] cursor-pointer transition-colors"
          >
            Asignar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CazadorAssignmentForm; 