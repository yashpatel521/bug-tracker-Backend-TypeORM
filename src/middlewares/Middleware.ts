import { Request, Response, NextFunction } from "express";

class MiddleWare {
  Reset = "\x1b[0m";
  Bright = "\x1b[1m";
  Dim = "\x1b[2m";
  Underscore = "\x1b[4m";
  Blink = "\x1b[5m";
  Reverse = "\x1b[7m";
  Hidden = "\x1b[8m";
  FgBlack = "\x1b[30m";
  FgRed = "\x1b[31m";
  FgGreen = "\x1b[32m";
  FgYellow = "\x1b[33m";
  FgBlue = "\x1b[34m";
  FgMagenta = "\x1b[35m";
  FgCyan = "\x1b[36m";
  FgWhite = "\x1b[37m";
  BgBlack = "\x1b[40m";
  BgRed = "\x1b[41m";
  BgGreen = "\x1b[42m";
  BgYellow = "\x1b[43m";
  BgBlue = "\x1b[44m";
  BgMagenta = "\x1b[45m";
  BgCyan = "\x1b[46m";
  BgWhite = "\x1b[47m";

  setColor(string: string | string[] | undefined, color: string) {
    return color + string + this.Reset;
  }

  requestLogs = (req: Request, res: Response, next: NextFunction) => {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const startTime = new Date();
    let { method, path: url } = req;
    const { body, params, query } = req;
    const userAgent = req.get("user-agent") || "";
    let reqID = new Date().getTime().toString();
    method = this.setColor(method, this.FgGreen);
    reqID = this.setColor(reqID, this.Dim);
    ip = this.setColor(ip, this.Dim);
    url = this.setColor(this.setColor(url, this.FgBlack), this.BgGreen);
    console.log(`REQUEST: ${ip} ` + `${method} path: ${url}`);
    console.log("origin ", req.get("origin"));
    console.log("BODY: ", body);
    console.log("PARAM: ", params);
    console.log("QUERY: ", query);
    res.on("close", () => {
      // console.log(res);
      const { statusCode } = res;
      let scode: any = statusCode;
      if (statusCode >= 200 && statusCode <= 299) {
        scode = this.setColor(statusCode.toString(), this.FgGreen);
      } else if (statusCode >= 300 && statusCode <= 399) {
        scode = this.setColor(statusCode.toString(), this.FgYellow);
      } else if (statusCode >= 400 && statusCode <= 499) {
        scode = this.setColor(statusCode.toString(), this.FgYellow);
      } else if (statusCode >= 500 && statusCode <= 599) {
        scode = this.setColor(statusCode.toString(), this.FgRed);
      }
      const contentLength = res.get("content-length");
      const timeInSec = this.setColor(
        ((new Date().getTime() - startTime.getTime()) / 1000).toString(),
        this.FgGreen
      );
      console.log(
        `\nRESPONSE: ${method} ${url} Status:${scode} ${contentLength} - ${userAgent} ${ip} ${timeInSec}sec \n Response Data :`
      );
      console.log(
        "______________________________________________________________________________________\n"
      );
    });
    next();
  };

  // validator =
  //   (validatorOptions?: ValidatorOptions | undefined) =>
  //   (req: Request, _res: Response, next: NextFunction) => {};
}

export default new MiddleWare();
