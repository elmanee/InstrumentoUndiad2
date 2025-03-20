import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'Archivo no encontrado' });
    return;
  }
  res.status(200).json({ urlImagen: `/uploads/${req.file.filename}` });
};