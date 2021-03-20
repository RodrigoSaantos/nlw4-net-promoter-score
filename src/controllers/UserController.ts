import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UsersRepository } from '../repositories/UsersRepository';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

class UserController {
  async create(request: Request, response: Response) {
    const { name, email } = request.body

    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
    });

    // if (!( await schema.isValid(request.body))) {
    //   return response.status(400).json({
    //     error: 'Validation failed!'
    //   });
    // }

    try {
      await schema.validate(request.body);
    } catch (err) {
      throw new AppError(err.message);
    }

    const usersRepository = getCustomRepository(UsersRepository);

    const userAlredyExists = await usersRepository.findOne({ email });

    if (userAlredyExists) {
      throw new AppError('User alredy exists!');
    }

    const user = usersRepository.create({
      name,
      email,
    });

    await usersRepository.save(user);

    return response.status(201).json(user);
  }
}

export { UserController };
