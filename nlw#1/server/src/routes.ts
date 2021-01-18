import express from 'express';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

// index, show, create, update, delete
const routes = express.Router();
const pointController = new PointsController();
const itemsController = new ItemsController();

// retorna itens coletáveis
routes.get('/items', itemsController.index);
// add um novo ponto de coleta
routes.post('/points', pointController.create);

routes.get('/points', pointController.index);
// lista um ponto de coleta especifico
routes.get('/points/:id', pointController.show);

export default routes;