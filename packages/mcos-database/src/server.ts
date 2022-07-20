import { createServer, IncomingMessage, ServerResponse } from "http";
import { logger } from "../../mcos-shared/src/logger/index.js";
import type { RequestHandler, ResponseJSON } from "./types.js";

const log = logger.child({ service: "mcoserver:DatabaseMgr" });

const server = createServer(onRequest);

const handlers: RequestHandler[] = [];

function onRequest(request: IncomingMessage, response: ServerResponse) {
  const { "content-type": contentType } = request.headers;

  if (contentType !== "application/jason") {
    response.statusCode = 415;
    response.end();
  }

  const { statusCode, responseContent } = handleRequest(request);

  response.statusCode = statusCode
  response.end(responseContent)
}

server.on("error", (err: Error) => {
  log.error(`Server had an error! ${err.message}`);
});
function handleRequest(request: IncomingMessage): ResponseJSON {
  request.setEncoding("utf8");
  const requestJSON = parseRequest(request.read());

  // TODO: #1167 Create handlers for database microservice requests
  const requestHandler = handlers.find((handler: RequestHandler) => {
    return handler.requestCode === requestJSON.requestCode;
  });

  // Initialize return with failure
  let returnJSON: ResponseJSON = {
    statusCode: 404,
    responseContent: { error: "Unsupported request", message: "" },
  };

  // If we located a matching handler, call it
  if (typeof requestHandler !== "undefined") {
   const responseJSON = requestHandler.handlerFunction(requestJSON)
   returnJSON = {
    statusCode: responseJSON.statusCode,
    responseContent: responseJSON.responseContent
   }
  }
  return returnJSON
}
function parseRequest(requestString: string) {
  try {
    const json = JSON.parse(requestString);
    const { requestCode, requestContent } = json;
    const requestJSON = { requestCode, requestContent };
    return requestJSON;
  } catch (error) {
    const errMessage =  String(error).toString()
    throw new Error(`Unknown error while pasing request: ${errMessage}`);
  }
}
