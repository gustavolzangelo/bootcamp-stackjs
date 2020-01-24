import Notification from '../schemas/Notification';
import User from '../models/Users';
import Appointment from '../models/Appointment';

class NotificationController {
  async index(req, res) {
    if (!(await this.checkIfProviderIDisProvider(req.userId))) {
      res.status(401).json({ error: 'User is not a provider' });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort('createdAt')
      .limit(20);

    res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }

  async checkIfProviderIDisProvider(user_id) {
    return User.findOne({
      where: { id: user_id, provider: true },
    });
  }
}

export default new NotificationController();
