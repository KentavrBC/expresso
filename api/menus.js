const menuRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menu-items');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Menu", (err, menus) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({menus: menus})
        }
    })
});

menuRouter.post('/', (req, res, next) => {
    const newMenu = req.body.menu;
    if (!newMenu.title) {
        return res.sendStatus(400)
    };
    db.run('INSERT INTO Menu (title) VALUES ($title)', {$title: newMenu.title}, function(error) {
        if (error) {
            next(error)
        } else {
            db.get("SELECT * FROM Menu WHERE id = $id", {$id: this.lastID}, (err, row) => {
                if (err) {
                    next(err)
                } else {
                    res.status(201).json({menu: row})
                }
            })
        }
    })
});

menuRouter.param('menuId', (req, res, next, id) => {
    db.get('SELECT * FROM Menu WHERE id = $id', {$id: id}, (err, row) => {
        if (err) {
            next(err)
        } else if (!row) {
            res.sendStatus(404)
        } else {
            req.menu = row;
            next()
        }
    })
});

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
    if (!req.body.menu.title) { res.sendStatus(400) };
    db.run("UPDATE Menu SET title = $title WHERE id = $id", {$title: req.body.menu.title, $id: req.menu.id}, error => {
        if(error) {
            next(error)
        } else {
            db.get("SELECT * FROM Menu WHERE id = $id", {$id: req.menu.id}, (err, row) => {
                res.status(200).json({menu: row})
            })
        }
    })
});

menuRouter.delete('/:menuId', (req, res, next) => {
    db.get("SELECT * FROM MenuItem WHERE menu_id = $id", {$id: req.menu.id}, (err, row) => {
        if (err) {
            next(err)
        } else if (row) {
            res.sendStatus(400)
        } else {
            db.run('DELETE FROM Menu WHERE id = $id', {$id: req.menu.id}, (err) => {
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            })
        };
    });
});

module.exports = menuRouter;