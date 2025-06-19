import { useState } from 'react';
import { toast } from 'sonner';

const OperatorAssignmentForm = ({ onClose, onSubmit, operators, incidenceId }) => {
  const [form, setForm] = useState({ userId: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.userId || !incidenceId) {
        toast.error('Debes seleccionar un operador');
        return;
    }
    onSubmit?.({ userId: form.userId, incidenceId });
    setForm({ userId: '' });
  };

  const handleCancel = () => {
    setForm({ userId: '' });
    onClose();
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-semibold mb-4">Asignar nuevo operador</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mt-1 border-gray-300 text-gray-900 text-sm focus:ring-block p-2.5"
          >
            <option value="" disabled hidden>Selecciona un operador</option>
            {operators.map((op) => (
                <option key={op.user.id} value={op.user.id}>
                    {op.name} {op.lastname}
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

export default OperatorAssignmentForm;
