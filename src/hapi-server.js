import Hapi from 'hapi';
import PinoLogger from 'hapi-pino';

const server = Hapi.server({
  host: 'localhost',
  port: 8000,
});

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

server.route({
  method: 'GET',
  path: '/',
  async handler(request, h) {
    await longResponse(
      request.raw.res,
      request.method,
      request.url.path,
      request.headers,
      request.body || '<none>',
    );
    return h.abandon;
  },
});

(async function start() {
  await server.register({
    plugin: PinoLogger,
    options: {
      prettyPrint: process.env.NODE_ENV !== 'production',
    },
  });

  try {
    await server.start();
  } catch (err) {
    server.logger().error(err);
    process.exit(1);
  }
}());
