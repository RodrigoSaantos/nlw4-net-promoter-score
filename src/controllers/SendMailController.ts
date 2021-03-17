import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {

  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const userAlredyExists = usersRepository.findOne({ email });

    if (!userAlredyExists) {
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

    const surveyUser = surveysUsersRepository.create({
      user_id: (await userAlredyExists).id,
      survey_id,
    });

    await surveysUsersRepository.save(surveyUser);
    
    await SendMailService.execute(email, (await survey).title, (await survey).description )

    return response.json(surveyUser);
  }
}

export { SendMailController }