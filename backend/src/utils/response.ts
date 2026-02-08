import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string): void => {
  res.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
};

export const sendError = (res: Response, message: string, statusCode: number = 400, error?: any): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  } as ApiResponse);
};



