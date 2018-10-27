(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

require("./photoScroll/index");

},{"./photoScroll/index":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var getDescription = function getDescription(url) {
  return new Promise(function (resolve, reject) {
    var onRequestChange = function onRequestChange(httpRequest) {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          try {
            var json = JSON.parse(httpRequest.responseText);
            resolve(json);
          } catch (e) {
            reject(e);
          }
        } else reject('There was a problem with the request.');
      }
    };

    var httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      reject('Giving up :( Cannot create an XMLHTTP instance');
      return;
    }

    httpRequest.onreadystatechange = function () {
      return onRequestChange(httpRequest);
    };

    httpRequest.open('GET', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.withCredentials = true;
    httpRequest.send();
  });
};

var _default = getDescription;
exports.default = _default;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _photosLoader = require("./photosLoader");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SINGLETON = Symbol('HomeScroll_singleton');
var SINGLETON_ENFORCER = Symbol('HomeScroll_service');

var HomeScroll =
/*#__PURE__*/
function () {
  function HomeScroll(enforcer) {
    _classCallCheck(this, HomeScroll);

    if (enforcer !== SINGLETON_ENFORCER) {
      throw new Error('Cannot construct singleton');
    }

    this.currentPhotoIdx = 0;
    this.nextPhotoToLoadIdx = 0;
    this.photoData = null;
  }

  _createClass(HomeScroll, [{
    key: "init",
    value: function init(document, window) {
      var _this = this;

      window.addEventListener('resize', function () {
        return _this.resizeImage();
      });
      var buttonLeft = document.querySelector('.button-left');
      var buttonRight = document.querySelector('.button-right');
      buttonLeft.style.display = 'none';
      buttonRight.style.display = 'none';
      this.fullScreen = document.querySelector('.full-screen');
      this.slideShow = document.querySelector('.slide-show');
      this.fullScreen.style.display = 'block';
      this.slideShow.style.display = 'none';
    }
  }, {
    key: "resizeImage",
    value: function resizeImage() {
      this._resizeImage(this.mainImage);

      this._resizeImage(this.secondImage);
    }
  }, {
    key: "hide",
    value: function hide() {
      this.stopAutoscroll();
      this.fullScreen.style.display = 'none';
    }
  }, {
    key: "show",
    value: function show() {
      this.startAutoscroll();
      this.fullScreen.style.display = 'block';
    }
  }, {
    key: "_resizeImage",
    value: function _resizeImage(image) {
      if (!image) return;
      var width = image.offsetWidth,
          height = image.offsetHeight;
      var _this$fullScreen = this.fullScreen,
          offsetWidth = _this$fullScreen.offsetWidth,
          offsetHeight = _this$fullScreen.offsetHeight;
      var imageRatio = width / height;
      var spaceRatio = offsetWidth / offsetHeight;
      var delta = 0,
          scale = 1;

      if (spaceRatio > imageRatio) {
        image.setAttribute('width', '100%');
        image.removeAttribute('height');
        scale = width / offsetWidth;
        delta = (offsetHeight - height / scale) / 2;
        image.style.left = '0';
        image.style.top = "".concat(delta, "px");
      } else {
        image.removeAttribute('width');
        image.setAttribute('height', '100%');
        scale = height / offsetHeight;
        delta = (offsetWidth - width / scale) / 2;
        image.style.top = '0';
        image.style.left = "".concat(delta, "px");
      }
    }
  }, {
    key: "setData",
    value: function setData(info) {
      this.setupPhotoShow(info);
    }
  }, {
    key: "setupPhotoShow",
    value: function setupPhotoShow(list) {
      var _this2 = this;

      // remove all previous photos
      this.fullScreen.textContent = ''; // reset data

      this.currentPhotoIdx = 0;
      this.nextPhotoToLoadIdx = 0;
      this.photoData = list;
      this.mainImage = document.createElement('img');
      this.mainImage.className = 'photo';
      this.mainImage.style.opacity = '0';
      this.secondImage = document.createElement('img');
      this.secondImage.className = 'photo';
      this.secondImage.style.opacity = '1';
      this.fullScreen.appendChild(this.mainImage);
      this.fullScreen.appendChild(this.secondImage);
      this.listImages = [];
      (0, _photosLoader.loadPhotos)(list, function (image) {
        _this2.listImages.push(image);

        if (_this2.listImages.length == 1) {
          _this2.showPhoto(0);

          _this2.startAutoscroll();
        }
      });
    }
  }, {
    key: "startAutoscroll",
    value: function startAutoscroll() {
      var _this3 = this;

      if (this.interval) return;
      this.interval = setInterval(function () {
        _this3.showPhoto(_this3.currentPhotoIdx + 1);
      }, 5000);
    }
  }, {
    key: "stopAutoscroll",
    value: function stopAutoscroll() {
      clearInterval(this.interval);
      this.interval = 0;
    }
  }, {
    key: "showPhoto",
    value: function showPhoto(idx) {
      var nbImage = this.listImages.length;
      var n = (idx + nbImage) % nbImage;
      var image = this.listImages[n];
      this.secondImage.src = image.src;
      this.secondImage.style.opacity = '1';
      this.mainImage.style.opacity = '0';
      this.currentPhotoIdx = n;
      this.resizeImage();
      var temp = this.mainImage;
      this.mainImage = this.secondImage;
      this.secondImage = temp;
    }
  }], [{
    key: "instance",
    get: function get() {
      if (!this[SINGLETON]) this[SINGLETON] = new HomeScroll(SINGLETON_ENFORCER);
      return this[SINGLETON];
    }
  }]);

  return HomeScroll;
}();

var _default = HomeScroll.instance;
exports.default = _default;

},{"./photosLoader":6}],4:[function(require,module,exports){
"use strict";

var _photoScroll = _interopRequireDefault(require("./photoScroll"));

var _homeScroll = _interopRequireDefault(require("./homeScroll"));

var _getDescription = _interopRequireDefault(require("./getDescription"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initHomePage = function initHomePage(data) {
  var title = document.getElementById('title');

  title.onclick = function () {
    _homeScroll.default.show();

    _photoScroll.default.hide();
  };

  var menu = document.getElementById('menu');
  data.forEach(function (info) {
    var li = document.createElement('li');
    li.textContent = info.name;

    li.onclick = function () {
      _homeScroll.default.hide();

      _photoScroll.default.setupPhotoShow(info);

      _photoScroll.default.show();
    };

    menu.appendChild(li);
  });
};

var dataFilename = function dataFilename(path, name) {
  return "".concat(path).concat(name, ".json");
};

var loadDescriptions = function loadDescriptions(path, list) {
  var indexPage = list.shift();
  (0, _getDescription.default)(dataFilename(path, indexPage)).then(function (data) {
    return _homeScroll.default.setData(data);
  });
  Promise.all(list.map(function (name) {
    return (0, _getDescription.default)(dataFilename(path, name));
  })).then(function (data) {
    return initHomePage(data);
  });
};

_photoScroll.default.init(document, window);

_homeScroll.default.init(document, window);

var extractData = function extractData() {
  var _document$currentScri = document.currentScript.dataset.set,
      set = _document$currentScri === void 0 ? '' : _document$currentScri;
  var list = set.split(' ');
  list.unshift('home');
  return list;
};

var list = extractData();
loadDescriptions('./photos/', list);

},{"./getDescription":2,"./homeScroll":3,"./photoScroll":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _photosLoader = require("./photosLoader");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SINGLETON = Symbol('photoscroll_singleton');
var SINGLETON_ENFORCER = Symbol('photoscroll_service');
var buttonLeft;
var buttonRight;

var PhotoScroll =
/*#__PURE__*/
function () {
  function PhotoScroll(enforcer) {
    _classCallCheck(this, PhotoScroll);

    if (enforcer !== SINGLETON_ENFORCER) {
      throw new Error('Cannot construct singleton');
    }

    this.currentPhotoIdx = 0;
    this.nextPhotoToLoadIdx = 0;
    this.photoData = null;
  }

  _createClass(PhotoScroll, [{
    key: "init",
    value: function init(document, window) {
      var _this = this;

      window.addEventListener('resize', function () {
        if (_this.shouldLoadNextPhoto()) _this.loadNextPhoto();
      });
      buttonLeft = document.querySelector('.button-left');
      buttonRight = document.querySelector('.button-right');
      buttonLeft.style.display = 'none';
      buttonRight.style.display = 'none';
      buttonLeft.addEventListener('click', function () {
        return _this.scrollLeft();
      });
      buttonRight.addEventListener('click', function () {
        return _this.scrollRight();
      });
      document.documentElement.addEventListener('keydown', function (evt) {
        return _this.onKeyDown(evt);
      });
      this.photosDiv = document.querySelector('.photos');
      this.slideShow = document.querySelector('.slide-show');
    }
  }, {
    key: "hide",
    value: function hide() {
      this.slideShow.style.display = 'none';
    }
  }, {
    key: "show",
    value: function show() {
      this.slideShow.style.display = 'block';
    }
  }, {
    key: "canScrollLeft",
    value: function canScrollLeft() {
      return this.currentPhotoIdx > 0;
    }
  }, {
    key: "setupPhotoShow",
    value: function setupPhotoShow(list) {
      // remove all previous photos
      this.photosDiv.textContent = ''; // hide navigation buttons

      buttonLeft.style.display = 'none';
      buttonRight.style.display = 'none'; // reset data

      this.currentPhotoIdx = 0;
      this.nextPhotoToLoadIdx = 0;
      this.photoData = list;
      this.photosDiv.style.transform = '';

      if (this.shouldLoadNextPhoto()) {
        this.loadNextPhoto();
        this.configureButtons();
      }
    }
  }, {
    key: "canScrollRight",
    value: function canScrollRight() {
      var listImages = document.querySelectorAll('.photos .photo');
      if (!listImages.length) return false;
      if (listImages.length == this.currentPhotoIdx) return false;
      var lastPhoto = listImages.item(listImages.length - 1);
      var rect = lastPhoto.getBoundingClientRect();
      return rect.right > this.slideShow.offsetWidth;
    }
  }, {
    key: "shouldLoadNextPhoto",
    value: function shouldLoadNextPhoto() {
      var listImages = document.querySelectorAll('.photos .photo');
      if (!this.photoData || !this.photoData.images.length || this.nextPhotoToLoadIdx >= this.photoData.images.length) return false;
      if (!listImages.length) return true;
      var lastPhoto = listImages.item(listImages.length - 1);
      var rect = lastPhoto.getBoundingClientRect();
      return rect.left < this.slideShow.offsetWidth;
    }
  }, {
    key: "loadNextPhoto",
    value: function loadNextPhoto() {
      var _this2 = this;

      var imageData = this.photoData.images[this.nextPhotoToLoadIdx++];
      (0, _photosLoader.loadPhoto)(this.photoData.imagePath, imageData.name).then(function (image) {
        var img = document.createElement('img');
        img.src = image.src;
        img.className = 'photo';

        _this2.photosDiv.appendChild(img);

        setTimeout(function () {
          img.className = 'photo visible';
        }, 0);
        if (_this2.shouldLoadNextPhoto()) _this2.loadNextPhoto();
      });
    }
  }, {
    key: "showPhoto",
    value: function showPhoto(n) {
      var listImages = document.querySelectorAll('.photos .photo');
      n = (n + listImages.length) % listImages.length;
      var selectedPhoto = listImages.item(n);
      var firstPhoto = listImages.item(0);
      var tx = selectedPhoto.offsetLeft - firstPhoto.offsetLeft;
      this.photosDiv.style.transform = "translate(-".concat(tx, "px)");
      this.currentPhotoIdx = n;
      if (this.shouldLoadNextPhoto()) this.loadNextPhoto();
    }
  }, {
    key: "scrollLeft",
    value: function scrollLeft() {
      if (this.canScrollLeft()) {
        this.showPhoto(this.currentPhotoIdx - 1);
        this.configureButtons();
      }
    }
  }, {
    key: "scrollRight",
    value: function scrollRight() {
      if (this.canScrollRight()) {
        this.showPhoto(this.currentPhotoIdx + 1);
        this.configureButtons();
      }
    }
  }, {
    key: "configureButtons",
    value: function configureButtons() {
      if (!this.currentPhotoIdx) buttonLeft.style.display = 'none';else buttonLeft.style.display = 'block';

      if (this.currentPhotoIdx === this.photoData.images.length - 1) {
        buttonRight.style.display = 'none';
      } else buttonRight.style.display = 'block';
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(evt) {
      switch (evt.keyCode) {
        case 37:
          // ArrowLeft
          evt.preventDefault();
          this.scrollLeft();
          break;

        case 39:
          // ArrowRight
          evt.preventDefault();
          this.scrollRight();
          break;

        default:
          break;
      }
    }
  }], [{
    key: "instance",
    get: function get() {
      if (!this[SINGLETON]) this[SINGLETON] = new PhotoScroll(SINGLETON_ENFORCER);
      return this[SINGLETON];
    }
  }]);

  return PhotoScroll;
}();

var _default = PhotoScroll.instance;
exports.default = _default;

},{"./photosLoader":6}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadPhotos = exports.loadPhoto = void 0;

var loadPhoto = function loadPhoto(path, name) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    var filePath = path + name;

    image.onload = function () {
      return resolve(image);
    };

    image.src = filePath;

    image.onabort = function () {
      return reject();
    };
  });
};

exports.loadPhoto = loadPhoto;

var loadPhotos = function loadPhotos(data, clb) {
  data.images.reduce(function (promise, _ref) {
    var name = _ref.name;
    return promise.then(function (image) {
      if (image && clb) setTimeout(function () {
        return clb(image);
      }, 0);
      return loadPhoto(data.imagePath, name);
    });
  }, Promise.resolve());
};

exports.loadPhotos = loadPhotos;

},{}]},{},[1]);
