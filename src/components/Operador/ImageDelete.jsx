import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { deletePhotoApi } from "../../api/photo/photoApi";

const ImageDelete = ({ Path, originalName, onDelete }) => {
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

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleDelete = async () => {
    try {
      await deletePhotoApi(Path);
      onDelete(Path);
    } catch (err) {
      console.error("Error al eliminar la imagen:", err);
    }
  };

  return (
    <>
      <button
        onClick={toggleVisibility}
        className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 transition-all duration-200 ease-in cursor-pointer"
      >
        <Icon path={isVisible ? icons.eye : icons.eyeOff} size={0.9} className="text-gray-600" />
      </button>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {isVisible && imageUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="relative">
            <div className="bg-white opacity-100 px-6 py-8 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <button
                onClick={handleDelete}
                className="absolute top-0 right-0 text-red-600 hover:text-red-800 transition"
                title="Eliminar imagen"
              >
                <Icon path={icons.delete} size={1.4} />
              </button>
              <div>
                <img
                  src={imageUrl}
                  alt={originalName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDelete;
