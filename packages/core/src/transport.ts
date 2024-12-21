import type { MessagePort } from "node:worker_threads";

import type { Evaluator } from "./evaluator.js";

/** Request to eval() the code to initiate the module mock. */
interface EvaluateRequest {
  request: "evaluate";
  url: string;
  code: string;
  mockerName: string;
  originalSource: string;
}

export type Request = EvaluateRequest;

interface EvaluateResponse {
  response: "evaluate";
  exports: string[];
}

interface AckResponse {
  response: "ack";
}

export type Response = AckResponse | EvaluateResponse;

interface ServerDeps {
  evaluator: Evaluator;
}

/**
 * The main thread, executing scripts and modules.
 */
export class Server {
  readonly #port: MessagePort;
  readonly #deps: ServerDeps;

  constructor(port: MessagePort, deps: ServerDeps) {
    port.on("message", (request: Request) => {
      this.onMessage(request).then((response) => {
        port.postMessage(response);
      });
    });

    this.#port = port;
    this.#deps = deps;
  }

  [Symbol.dispose]() {
    this.#port.close();
  }

  private async onMessage(request: Request): Promise<Response> {
    if (request.request === "evaluate") {
      return {
        response: "evaluate",
        exports: this.#deps.evaluator.evaluate(request.url, request.code, request.mockerName, request.originalSource),
      };
    }

    return { response: "ack" };
  }
}

/**
 * A child thread, running the ESM customization hook.
 */
export class Client {
  readonly #port: MessagePort;

  constructor(port: MessagePort) {
    this.#port = port;
  }

  [Symbol.dispose]() {
    this.#port.close();
  }

  #request(request: Request): Promise<Response> {
    return new Promise<Response>((resolve) => {
      this.#port.once("message", (response: Response) => {
        resolve(response);
      });

      this.#port.postMessage(request);
    });
  }

  async evaluate(request: Omit<EvaluateRequest, "request">): Promise<EvaluateResponse> {
    const response = await this.#request({ ...request, request: "evaluate" });
    return response as EvaluateResponse;
  }
}
