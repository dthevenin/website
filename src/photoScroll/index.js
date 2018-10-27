import photoScroll from './photoScroll';
import homeScroll from './homeScroll';
import getDescription from './getDescription';

const initHomePage = (data) => {
  const title = document.getElementById('title');
  title.onclick = () => {
    homeScroll.show();
    photoScroll.hide();
  };
  const menu = document.getElementById('menu');
  data.forEach(info => {
    const li = document.createElement('li');
    li.textContent = info.name;
    li.onclick = () => {
      homeScroll.hide();
      photoScroll.setupPhotoShow(info);
      photoScroll.show();
    };
    menu.appendChild(li);
  });
};

const dataFilename = (path, name) => `${path}${name}.json`;

const loadDescriptions = (path, list) => {
  const indexPage = list.shift();
  getDescription(dataFilename(path, indexPage))
    .then(data => homeScroll.setData(data));
  Promise.all(list.map(name => getDescription(dataFilename(path, name))))
    .then(data => initHomePage(data));
};

photoScroll.init(document, window);
homeScroll.init(document, window);

const extractData = () => {
  const { set = '' } = document.currentScript.dataset;
  const list = set.split(' ');
  list.unshift('home');
  return list;
};

const list = extractData();
loadDescriptions('./photos/', list);
