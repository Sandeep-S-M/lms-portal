import { Request, Response } from 'express';

export const checkHealth = (req: Request, res: Response) => {
  res.setHeader('X-Deployment-Version', 'dynamic-cors-v4');
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors_info: 'mirroring-active-v4'
  });
};
