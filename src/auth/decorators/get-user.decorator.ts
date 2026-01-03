import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si data est fourni (ex: 'id', 'email'), retourner cette propriété
    return data ? user?.[data] : user;
  },
);
