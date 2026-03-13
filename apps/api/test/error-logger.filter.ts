import { ExceptionFilter, Catch, HttpException } from '@nestjs/common';

@Catch()
export class ErrorLoggerFilter implements ExceptionFilter {
  catch(exception: unknown) {
    if (!(exception instanceof HttpException)) {
      console.log(exception);
    }

    throw exception;
  }
}
