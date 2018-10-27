import { loadPhoto } from './photosLoader';

const SINGLETON = Symbol('photoscroll_singleton');
const SINGLETON_ENFORCER = Symbol('photoscroll_service');

let buttonLeft;
let buttonRight;

class PhotoScroll {
  constructor(enforcer) {
    if (enforcer !== SINGLETON_ENFORCER) {
      throw new Error('Cannot construct singleton');
    }

    this.currentPhotoIdx = 0;
    this.nextPhotoToLoadIdx = 0;
    this.photoData = null;
  }

  init(document, window) {
    window.addEventListener('resize', () => {
      if (this.shouldLoadNextPhoto()) this.loadNextPhoto();
    });

    buttonLeft = document.querySelector('.button-left');
    buttonRight = document.querySelector('.button-right');

    buttonLeft.style.display = 'none';
    buttonRight.style.display = 'none';

    buttonLeft.addEventListener('click', () => this.scrollLeft());
    buttonRight.addEventListener('click', () => this.scrollRight());

    document.documentElement.addEventListener('keydown', evt => this.onKeyDown(evt));

    this.photosDiv = document.querySelector('.photos');
    this.slideShow = document.querySelector('.slide-show');
  }

  static get instance() {
    if (!this[SINGLETON]) this[SINGLETON] = new PhotoScroll(SINGLETON_ENFORCER);
    return this[SINGLETON];
  }


  hide() {
    this.slideShow.style.display = 'none';
  }

  show() {
    this.slideShow.style.display = 'block';
  }

  canScrollLeft() {
    return this.currentPhotoIdx > 0;
  }

  setupPhotoShow(list) {
    // remove all previous photos
    this.photosDiv.textContent = '';

    // hide navigation buttons
    buttonLeft.style.display = 'none';
    buttonRight.style.display = 'none';

    // reset data
    this.currentPhotoIdx = 0;
    this.nextPhotoToLoadIdx = 0;
    this.photoData = list;
    this.photosDiv.style.transform = '';

    if (this.shouldLoadNextPhoto()) {
      this.loadNextPhoto();
      this.configureButtons();
    }
  }

  canScrollRight() {
    const listImages = document.querySelectorAll('.photos .photo');
    if (!listImages.length) return false;
    if (listImages.length == this.currentPhotoIdx) return false;

    const lastPhoto = listImages.item(listImages.length - 1);
    const rect = lastPhoto.getBoundingClientRect();

    return rect.right > this.slideShow.offsetWidth;
  }

  shouldLoadNextPhoto() {
    const listImages = document.querySelectorAll('.photos .photo');
    if (!this.photoData || !this.photoData.images.length ||
      this.nextPhotoToLoadIdx >= this.photoData.images.length) return false;
    if (!listImages.length) return true;

    const lastPhoto = listImages.item(listImages.length - 1);
    const rect = lastPhoto.getBoundingClientRect();

    return rect.left < this.slideShow.offsetWidth;
  }

  loadNextPhoto() {
    const imageData = this.photoData.images[this.nextPhotoToLoadIdx++];
    loadPhoto(this.photoData.imagePath, imageData.name)
      .then(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.className = 'photo';
        this.photosDiv.appendChild(img);
        setTimeout(() => {
          img.className = 'photo visible';
        }, 0);
        if (this.shouldLoadNextPhoto()) this.loadNextPhoto();
      });
  }

  showPhoto(n) {
    const listImages = document.querySelectorAll('.photos .photo');

    n = (n + listImages.length) % listImages.length;

    const selectedPhoto = listImages.item(n);
    const firstPhoto = listImages.item(0);
    const tx = selectedPhoto.offsetLeft - firstPhoto.offsetLeft;
    this.photosDiv.style.transform = `translate(-${tx}px)`;
    this.currentPhotoIdx = n;

    if (this.shouldLoadNextPhoto()) this.loadNextPhoto();
  }

  scrollLeft() {
    if (this.canScrollLeft()) {
      this.showPhoto(this.currentPhotoIdx - 1);
      this.configureButtons();
    }
  }

  scrollRight() {
    if (this.canScrollRight()) {
      this.showPhoto(this.currentPhotoIdx + 1);
      this.configureButtons();
    }
  }

  configureButtons() {
    if (!this.currentPhotoIdx) buttonLeft.style.display = 'none';
    else buttonLeft.style.display = 'block';
    if (this.currentPhotoIdx === this.photoData.images.length - 1) {
      buttonRight.style.display = 'none';
    }
    else buttonRight.style.display = 'block';
  }

  onKeyDown(evt) {
    switch (evt.keyCode) {
      case 37: // ArrowLeft
        evt.preventDefault();
        this.scrollLeft();
        break;

      case 39: // ArrowRight
        evt.preventDefault();
        this.scrollRight();
        break;

      default:
        break;
    }
  }
}

export default PhotoScroll.instance;
