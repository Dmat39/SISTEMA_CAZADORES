import { useState, useEffect } from "react";
import { getSubRegistroIncidenceImageApi } from "../../api/operador/registroIncidenceApi";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";

const ImageViewer = ({ Path, originalName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      try {
          const imagePath = Path.replace("192.168.13.46:3000/api/v1/files/records/", "");
           const blob = await getSubRegistroIncidenceImageApi(imagePath);
          const url = URL.createObjectURL(blob);
          console.log("Image URL:", Path);
          setImageUrl(url);
      } catch (err) {
        console.error("Error fetching image:", err);
        setError("Error al cargar la imagen");
      } finally {
        setLoading(false);
      }
    };

    if (Path) {
      fetchImage();
    }
  }, [Path]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
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
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]">
          <div className="relative bg-white p-8 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div>
              <img
                src={imageUrl}
                alt={originalName}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={toggleVisibility}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Icon path={icons.close} size={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;