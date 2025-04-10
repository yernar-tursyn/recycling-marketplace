import { body, ValidationChain, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const registerValidator: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Пожалуйста, введите корректный email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен содержать минимум 6 символов"),
  body("name")
    .notEmpty()
    .withMessage("Имя обязательно для заполнения")
    .trim()
    .escape(),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};
