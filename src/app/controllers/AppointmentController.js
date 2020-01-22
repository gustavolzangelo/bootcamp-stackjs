import * as Yup from 'yup';
import User from '../models/Users';
import Appointment from '../models/Appointment';

class AppointmentController {
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
}

export default new AppointmentController();
