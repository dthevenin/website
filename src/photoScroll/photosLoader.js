export const loadPhoto = (path, name) => new Promise((resolve, reject) => {
  const image = new Image();
  const filePath = path + name;
  image.onload = () => resolve(image);
  image.src = filePath;
  image.onabort = () => reject();
});

export const loadPhotos = (data, clb) => {
  data.images.reduce((promise, { name }) => {
    return promise.then(image => {
      if (image && clb) setTimeout(() => clb(image), 0);
      return loadPhoto(data.imagePath, name);
    });
  }, Promise.resolve());
};
