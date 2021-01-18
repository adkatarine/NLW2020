import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');


        return response.json(points);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'Point not found.' });
        }

        /**
         * SELECT * FROM items
         *  JOIN point_items ON items.id = point_items.item_id
         * WHERE point_items.point_id = {id}
         */

        //retorna os itens relacionados com o ponto especifico
        const items = await knex('items')
        .join('points_items', 'item_id', '=', 'points_items.item_id')
        .where('point_item.point_id', id)
        .select('items.title');

        return response.json({point, items});
    }

    async create (request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        // caso um dos itens de coleta esteja errado, o ponto n será add na tabela
        const trx = await knex.transaction();
    
        const point = {
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
        // insere o novo ponto na tabela
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0];
    
        // relaciona os dados das tabelas de pontos e itens
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            };
        })
    
        await trx('point_items').insert(pointItems);
    
        await trx.commit()

        return response.json({
            id: point_id,
            ...point, // o ... retorna todos os dados de um objeto
        });
    }
}

export default PointsController;