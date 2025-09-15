import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validateBody = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      req.body = validated;
      next();
    } catch (error) {
      const joiError = error as any;
      const errors = joiError.details?.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      })) || [];
      
      res.status(400).json({
        error: 'Validation error',
        details: errors
      });
    }
  };
};