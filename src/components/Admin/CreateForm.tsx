import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSerenoByDniApi } from '../../api/admin/serenoApi';

const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const generateUsername = (nombres, apellidoPaterno, apellidoMaterno) => {
  const first = normalize(nombres).split(' ')[0];
  const pat = normalize(apellidoPaterno).split(' ')[0];
  const mat = normalize(apellidoMaterno).charAt(0);
  return `${first}.${pat}.${mat}`;
};

const generatePassword = (nombres, apellidoPaterno) => {
  const pat = normalize(apellidoPaterno).split(' ')[0];
  const first = normalize(nombres).split(' ')[0];
  const digits = Math.floor(1000 + Math.random() * 9000);
  const capitalized = pat.charAt(0).toUpperCase() + pat.slice(1);
  return `${capitalized}${first}${digits}#`;
};

const CreateForm = ({ isOpen, onClose, onSubmit }) => {
  const { isDark } = useTheme();

  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [sereno, setSereno] = useState(null);
  const [dniError, setDniError] = useState('');
  const [searching, setSearching] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = `w-full border px-3 py-2 rounded mt-1 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
      : 'bg-white border-gray-300 text-gray-900'
  }`;
  const readonlyClass = `w-full border px-3 py-2 rounded mt-1 cursor-default ${
    isDark
      ? 'bg-gray-600 border-gray-500 text-gray-300'
      : 'bg-gray-100 border-gray-300 text-gray-600'
  }`;
  const labelClass = `block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`;

  const handleDniChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setDni(value);
    setSereno(null);
    setDniError('');
    setGeneratedUsername('');
    setGeneratedPassword('');
  };

  const handleDniBlur = async () => {
    if (dni.length !== 8) return;
    setSearching(true);
    setDniError('');
    try {
      const res = await getSerenoByDniApi(dni);
      if (res.success && res.data) {
        const s = res.data;
        setSereno(s);
        setGeneratedUsername(generateUsername(s.nombres, s.apellidoPaterno, s.apellidoMaterno));
        setGeneratedPassword(generatePassword(s.nombres, s.apellidoPaterno));
      } else {
        setDniError('DNI no registrado en serenos');
      }
    } catch (err) {
      setDniError(err.message || 'DNI no registrado en serenos');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sereno) return;
    onSubmit?.({
      name: (sereno.nombres || '').split(' ')[0],
      lastname: `${sereno.apellidoPaterno || ''} ${sereno.apellidoMaterno || ''}`.trim(),
      dni,
      phone,
      username: generatedUsername,
      password: generatedPassword,
    });
    handleClose();
  };

  const handleClose = () => {
    setDni('');
    setPhone('');
    setSereno(null);
    setDniError('');
    setGeneratedUsername('');
    setGeneratedPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`rounded-lg shadow-lg max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Dialog.Title className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Crear Supervisor
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            {/* DNI */}
            <div className="mb-4">
              <label className={labelClass}>DNI</label>
              <input
                type="text"
                value={dni}
                onChange={handleDniChange}
                onBlur={handleDniBlur}
                maxLength={8}
                placeholder="Ingrese 8 dígitos"
                className={inputClass}
                required
              />
              {searching && (
                <p className="text-xs text-blue-500 mt-1">Buscando en serenos...</p>
              )}
              {dniError && (
                <p className="text-xs text-red-500 mt-1">{dniError}</p>
              )}
              {sereno && (
                <p className="text-xs text-green-500 mt-1">Sereno encontrado</p>
              )}
            </div>

            {/* Datos del sereno (readonly) */}
            {sereno && (
              <>
                <div className="mb-4">
                  <label className={labelClass}>Nombre</label>
                  <input type="text" value={sereno.nombres || ''} readOnly className={readonlyClass} />
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Apellidos</label>
                  <input
                    type="text"
                    value={`${sereno.apellidoPaterno || ''} ${sereno.apellidoMaterno || ''}`.trim()}
                    readOnly
                    className={readonlyClass}
                  />
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Usuario generado</label>
                  <input type="text" value={generatedUsername} readOnly className={readonlyClass} />
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Contraseña generada</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={generatedPassword}
                      readOnly
                      className={readonlyClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 mt-0.5"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <label className={labelClass}>Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    pattern="\d{9}"
                    title="El número de teléfono debe tener exactamente 9 dígitos."
                    className={inputClass}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className={`mr-2 px-4 py-2 border rounded cursor-pointer ${
                  isDark
                    ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!sereno}
                className={`text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-black hover:bg-gray-800'
                }`}
              >
                Guardar
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateForm;
