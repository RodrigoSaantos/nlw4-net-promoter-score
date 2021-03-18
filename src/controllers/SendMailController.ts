import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository"
import { resolve } from 'path';

import SendMailService from "../services/SendMailService";

class SendMailController {

  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = usersRepository.findOne({ email });

    if (!user) {
      return response.status(400).json({
        error: 'User does not exists!'
      })
    }

    const survey = surveysRepository.findOne({ id: survey_id });

    if (!survey) {
      return response.status(400).json({
        error: 'Surveys does not exists!'
      })
    }

    const variables = {
      name: (await user).name,
      title: (await survey).title,
      description: (await survey).description,
      user_id: (await user).id,
      link: process.env.URL_MAIL,
    }

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs')


    const surveysAlredyExists = await surveysUsersRepository.findOne({
      where: [
        {
          user_id: (await user).id
        },
        {
          value: null
        }
      ],
      relations: ['user', 'survey'],
    });

    if (surveysAlredyExists) {
      await SendMailService.execute(email, (await survey).title, variables, npsPath);

      return response.json(surveysAlredyExists);
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: (await user).id,
      survey_id,
    });

    
    await surveysUsersRepository.save(surveyUser);
    
    
    await SendMailService.execute(email, (await survey).title, variables, npsPath )

    return response.json(surveyUser);
  }
}

export { SendMailController }