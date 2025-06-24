import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";

const ImageViewer = ({ Path, originalName, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      try {
        const fullImageUrl = `${import.meta.env.VITE_API_BASE_URL}/files/${Path}`;
        const response = await fetch(fullImageUrl);
        if (!response.ok) throw new Error("No se pudo obtener la imagen");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        console.error("Error fetching image:", err);
        setError("Error al cargar la imagen");
      } finally {
        setLoading(false);
      }
    };

    if (Path) fetchImage();
  }, [Path]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <div className="absolute top-2 right-3 flex gap-2">
        <button
          type="button"
          onClick={toggleVisibility}
          title="Ver imagen"
          className="text-gray-500 hover:text-gray-800 transition-all duration-200 ease-in cursor-pointer"
        >
          <Icon path={isVisible ? icons.eye : icons.eyeOff} size={0.9} />
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar imagen"
            className="text-gray-500 hover:text-red-600 transition-all duration-200 ease-in cursor-pointer"
          >
            <Icon path={icons.delete} size={0.9} />
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {isVisible && imageUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="relative">
            <div className="bg-white px-6 py-8 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="absolute bg-white w-10 h-10 -top-4 -right-4 rounded-full flex items-center justify-center shadow-lg">
                <button
                  onClick={toggleVisibility}
                  className="absolute top-0.5 right-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <Icon path={icons.close} size={1.4} />
                </button>
              </div>
              <img
                src={imageUrl}
                alt={originalName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;
