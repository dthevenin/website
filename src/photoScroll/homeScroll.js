import { loadPhotos } from './photosLoader';

const SINGLETON = Symbol('HomeScroll_singleton');
const SINGLETON_ENFORCER = Symbol('HomeScroll_service');

class HomeScroll {
  constructor(enforcer) {
    if (enforcer !== SINGLETON_ENFORCER) {
      throw new Error('Cannot construct singleton');
    }

    this.currentPhotoIdx = 0;
    this.nextPhotoToLoadIdx = 0;
    this.photoData = null;
  }

  init(document, window) {
    window.addEventListener('resize', () => this.resizeImage());

    const buttonLeft = document.querySelector('.button-left');
    const buttonRight = document.querySelector('.button-right');

    buttonLeft.style.display = 'none';
    buttonRight.style.display = 'none';

    this.mainView = document.querySelector('.full-screen');
    this.slideShow = document.querySelector('.slide-show');
    this.mainView.style.display = 'block';
    this.slideShow.style.display = 'none';
  }

  static get instance() {
    if (!this[SINGLETON]) this[SINGLETON] = new HomeScroll(SINGLETON_ENFORCER);
    return this[SINGLETON];
  }

  resizeImage() {
    this._resizeImage(this.mainImage);
    this._resizeImage(this.secondImage);
  }

  hide() {
    this.stopAutoscroll();
    this.mainView.style.display = 'none';
  }

  show() {
    this.startAutoscroll();
    this.mainView.style.display = 'block';
  }

  _resizeImage(image) {
    if (!image) return;
    const { width, height } = image;
    const { offsetWidth, offsetHeight } = this.mainView;
    const imageRatio = width / height;
    const spaceRatio = offsetWidth / offsetHeight;

    let delta = 0, scale = 1;

    if (spaceRatio > imageRatio) {
      image.setAttribute('width', '100%');
      image.removeAttribute('height');

      scale = width / offsetWidth;
      delta = (offsetHeight - height / scale) / 2;
      image.style.left = '0';
      image.style.top = `${delta}px`;
    }
    else {
      image.removeAttribute('width');
      image.setAttribute('height', '100%');

      scale = height / offsetHeight;
      delta = (offsetWidth - width / scale) / 2;
      image.style.top = '0';
      image.style.left = `${delta}px`;
    }
  }

  setData(info) {
    this.setupPhotoShow(info);
  }

  setupPhotoShow(list) {
    // remove all previous photos
    this.mainView.textContent = '';

    // reset data
    this.currentPhotoIdx = 0;
    this.nextPhotoToLoadIdx = 0;
    this.photoData = list;

    this.mainImage = document.createElement('img');
    this.mainImage.className = 'photo';
    this.mainImage.style.opacity = '0';

    this.secondImage = document.createElement('img');
    this.secondImage.className = 'photo';
    this.secondImage.style.opacity = '1';

    this.mainView.appendChild(this.mainImage);
    this.mainView.appendChild(this.secondImage);

    this.listImages = [];

    loadPhotos(list, image => {
      this.listImages.push(image);
      if (this.listImages.length === 1) {
        this.showPhoto(0);
        this.startAutoscroll();
      }
    });
  }

  startAutoscroll() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.showPhoto(this.currentPhotoIdx + 1);
    }, 5000);
  }

  stopAutoscroll() {
    clearInterval(this.interval);
    this.interval = 0;
  }

  showPhoto(idx) {
    const nbImage = this.listImages.length;
    const n = (idx + nbImage) % nbImage;
    const image = this.listImages[n];

    this.secondImage.src = image.src;
    this.secondImage.width = image.naturalWidth;
    this.secondImage.height = image.naturalHeight;
    this.secondImage.style.opacity = '1';
    this.mainImage.style.opacity = '0';

    this.currentPhotoIdx = n;
    this.resizeImage();
    const temp = this.mainImage;
    this.mainImage = this.secondImage;
    this.secondImage = temp;
  }
}

export default HomeScroll.instance;
