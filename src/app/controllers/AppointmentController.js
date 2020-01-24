import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import User from '../models/Users';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

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
    const { provider_id, date } = req.body;
    const hourStart = await this.GetTimeNow(date);

    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    if (!(await this.checkIfProviderIDisProvider(provider_id))) {
      return res.status(401).json({
        error: 'You can only create appointments create with providers',
      });
    }

    if (await this.checkIfProviderIsTheUser(req)) {
      return res.status(401).json({
        error: "You can't make an appointment with yourself",
      });
    }

    if (await this.checkIfDateIsOlderThanNow(hourStart)) {
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

    this.NotifyAppointmentToProvider(req);

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!appointment.user_id === req.userId) {
      return res.status(401).json({
        erro: "You don't have permission to cancel this appointment.",
      });
    }

    if (await this.checkIfCanCancel(appointment.date)) {
      return res.json(401).json({
        error: "You can't only cancel appointments with 2 hours in advance",
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      text: 'Voce teve um novo cancelamento.',
    });

    return res.json(appointment);
  }

  async checkIfCanCancel(date) {
    const dateWithSub = subHours(date, 2);

    return isBefore(dateWithSub, new Date());
  }

  async checkIfProviderIDisProvider(provider_id) {
    return User.findOne({
      where: { id: provider_id, provider: true },
    });
  }

  async checkIfDateIsOlderThanNow(hourStart) {
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

  async NotifyAppointmentToProvider(req) {
    const { provider_id, date } = req.body;
    const user = await this.GetUser(req);
    const hourStart = await this.GetTimeNow(date);

    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', as' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento para ${user.name} para ${formattedDate}`,
      user: provider_id,
    });
  }

  async GetUser(req) {
    return User.findByPk(req.userId);
  }

  async GetTimeNow(date) {
    return startOfHour(parseISO(date));
  }

  async checkIfProviderIsTheUser(req) {
    return req.userId === req.provider_id;
  }
}

export default new AppointmentController();
