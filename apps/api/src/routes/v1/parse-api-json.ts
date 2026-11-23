import { json, type RequestHandler } from 'express';

// Do not send compressed request bodies through body-parser's inflater.
const parse = json({ inflate: false });

export const parseApiJson: RequestHandler = (req, res, next) => {
  parse(req, res, error => {
    if (!error) {
      next();
      return;
    }
    if ([400, 413, 415].includes(error.status)) {
      res.status(error.status).json({ success: false, message: 'Ongeldige aanvraaginhoud.' });
      return;
    }
    next(error);
  });
};
