const fs = require('fs');
const path = require('path');

/**
 * Удаляет файл изображения из файловой системы
 * @param {string} imageUrl - URL путь к изображению (например, '/utImages/filename.jpg')
 * @returns {Promise<boolean>} - true если файл удален успешно, false если файл не найден или произошла ошибка
 */
const deleteImageFile = async (imageUrl) => {
  try {
    // Проверяем, что imageUrl существует и является путем к utImages
    if (!imageUrl || !imageUrl.startsWith('/utImages/')) {
      console.log('Skipping deletion: not a utImages path or empty:', imageUrl);
      return false;
    }

    // Преобразуем URL путь в файловый путь
    const fileName = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../public/utImages', fileName);

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      console.log('File not found for deletion:', filePath);
      return false;
    }

    // Удаляем файл
    fs.unlinkSync(filePath);
    console.log('Successfully deleted image file:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting image file:', error);
    return false;
  }
};

/**
 * Удаляет аватар пользователя, если он не является изображением по умолчанию
 * @param {string} avatarUrl - URL путь к аватару
 * @returns {Promise<boolean>} - true если файл удален успешно
 */
const deleteAvatarFile = async (avatarUrl) => {
  try {
    // Не удаляем изображения по умолчанию
    if (!avatarUrl || avatarUrl === '/images/woman.png' || avatarUrl.startsWith('/images/')) {
      console.log('Skipping deletion: default avatar or images path:', avatarUrl);
      return false;
    }

    return await deleteImageFile(avatarUrl);
  } catch (error) {
    console.error('Error deleting avatar file:', error);
    return false;
  }
};

module.exports = {
  deleteImageFile,
  deleteAvatarFile
};
