// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads/productos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-random-originalname
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, extension);
    
    // Limpiar nombre del archivo
    const cleanName = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 20);
    
    const filename = `${timestamp}-${random}-${cleanName}${extension}`;
    cb(null, filename);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'), false);
  }
};

// Configuración principal de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Máximo 5MB
    files: 1 // Solo un archivo por vez
  }
});

// Middleware para manejar errores de multer
const manejarErroresUpload = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      req.uploadError = 'El archivo es demasiado grande. Máximo 5MB.';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      req.uploadError = 'Solo se permite subir un archivo por vez.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      req.uploadError = 'Campo de archivo inesperado.';
    } else {
      req.uploadError = 'Error al subir el archivo: ' + error.message;
    }
  } else if (error) {
    req.uploadError = error.message;
  }
  
  next();
};

// Middleware específico para productos
const uploadProducto = upload.single('imagen');

// Función auxiliar para eliminar archivo
const eliminarArchivo = async (rutaArchivo) => {
  try {
    if (rutaArchivo && rutaArchivo !== '/img/default-product.png') {
      const rutaCompleta = path.join(__dirname, '../uploads/productos', path.basename(rutaArchivo));
      await fs.promises.unlink(rutaCompleta);
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
  }
};

module.exports = {
  uploadProducto,
  manejarErroresUpload,
  eliminarArchivo
};