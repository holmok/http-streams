import { createServer } from 'http';
import Pino from 'pino';

const PORT = 8080;
const logger = Pino();

const server = createServer();

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

async function longResponse(response, method, url, headers, body) {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Powered-By': 'holmok',
  });
  await wait(1000);
  response.write(`<html>
    <head>  
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700,400italic">
    </head><body>`);
  await wait(5000);
  response.write(`<p>method = ${method}</p>`);
  await wait(1000);
  response.write(`<p>url = ${url}</p>`);
  await wait(1000);
  response.write(`<p>headers = ${JSON.stringify(headers, null, 0)}</p>`);
  await wait(1000);
  response.write(`<p>body = ${body}</p>`);
  await wait(2000);
  response.write('</body></html>');
  response.end();
}

function requestHandler(request, response) {
  const stime = new Date().getTime();
  const { method, url, headers } = request;
  const bodyData = [];
  function requsetDataHandler(chunk) {
    bodyData.push(chunk);
  }
  async function endRequestHandler() {
    const body = Buffer.concat(bodyData).toString();

    await longResponse(response, method, url, headers, body);

    const etime = new Date().getTime();
    const duration = etime - stime;
    logger.info('request', method, headers, url, body, duration);
  }
  request.on('data', requsetDataHandler).on('end', endRequestHandler);
}

function listening() {
  logger.info(`Server listening on port ${PORT}`);
}

server.on('request', requestHandler).on('listening', listening);

server.listen(PORT);
