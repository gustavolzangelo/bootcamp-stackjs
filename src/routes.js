import Router from 'express';

import multer from 'multer';
import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProvideController from './app/controllers/ProvideController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/providers', ProvideController.index);

routes.post(
  '/appointments',
  AppointmentController.store.bind(AppointmentController)
);
routes.get('/index', AppointmentController.index);

routes.get('/schedule', ScheduleController.index.bind(ScheduleController));

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
