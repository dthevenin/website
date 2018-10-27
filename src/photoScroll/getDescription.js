const getDescription = url => (
  new Promise((resolve, reject) => {
    const onRequestChange = httpRequest => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          try {
            const json = JSON.parse(httpRequest.responseText);
            resolve(json);
          }
          catch (e) {
            reject(e);
          }
        }
        else reject('There was a problem with the request.');
      }
    };

    const httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      reject('Giving up :( Cannot create an XMLHTTP instance');
      return;
    }
    httpRequest.onreadystatechange = () => onRequestChange(httpRequest);
    httpRequest.open('GET', url);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.withCredentials = true;
    httpRequest.send();
  })
);

export default getDescription;
