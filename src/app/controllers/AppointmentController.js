import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/Users';
import Appointment from '../models/Appointment';
import File from '../models/File';
import app from '../../app';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attribute: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { provider_id, date } = req.body;

    if (!(await this.checkIfProviderIDisProvider(provider_id))) {
      return res.status(401).json({
        error: 'You can only create appointments create with providers',
      });
    }

    const hourStart = startOfHour(parseISO(date));

    if (this.checkIfDateIsOlderThanNow(hourStart)) {
      return res.status(400).json({ error: 'Past dates are not permitted!' });
    }

    if (await this.checkIfDateIsAvailable(provider_id, hourStart)) {
      return res.status(400).json({ error: 'Date is unavailable' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    return res.json(appointment);
  }

  checkIfProviderIDisProvider(provider_id) {
    return User.findOne({
      where: { id: provider_id, provider: true },
    });
  }

  checkIfDateIsOlderThanNow(hourStart) {
    return isBefore(hourStart, new Date());
  }

  async checkIfDateIsAvailable(provider_id, hourStart) {
    return Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
  }
}

export default new AppointmentController();
