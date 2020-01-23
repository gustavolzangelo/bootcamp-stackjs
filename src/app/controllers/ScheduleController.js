import Appointment from '../models/Appointment';
import User from '../models/Users';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

class ScheduleController {
  async index(req, res) {
    if (!(await this.checkIfUserIsProvider(req.userId))) {
      res.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }

  async checkIfUserIsProvider(userID) {
    return User.findOne({ where: { id: userID, provider: true } });
  }
}

export default new ScheduleController();
