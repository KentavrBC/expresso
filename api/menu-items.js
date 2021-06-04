const menuItemsRouter = require('express').Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {$menuId: req.menu.id}, (err, rows) => {
        res.status(200).json({menuItems: rows})
    })
});

menuItemsRouter.post('/', (req, res, next) => {
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.description || !menuItem.price || !menuItem.inventory) {
        res.sendStatus(400)
    };
    db.run('INSERT INTO MenuItem (name, description, price, inventory, menu_id) VALUES ($name, $desc, $price, $inv, $menId);', {
        $name: menuItem.name,
        $desc: menuItem.description,
        $price: menuItem.price,
        $inv: menuItem.inventory,
        $menId: req.menu.id
    }, function(err) {
        if(err) {
            next(err)
        } else {
            db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: this.lastID}, (err, row) => {
                if (err) {
                    next(err)
                } 
                else{
                    res.status(201).json({menuItem: row})
                }
            })
        };
    });
});

menuItemsRouter.param('menuItemId', (req, res, next, id) => {
    db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: id}, (err, row) => {
        if (err) {
            next(err)
        }
        else if (!row) {
            res.sendStatus(404)
        } else {
            req.menuItem = row;
            next()
        };
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.description || !menuItem.price || !menuItem.inventory) {
        res.sendStatus(400)
    };
    db.run("UPDATE MenuItem SET name = $name, description = $description, price = $price, inventory = $inventory WHERE id = $id", {
        $name: menuItem.name,
        $description: menuItem.description,
        $price: menuItem.price,
        $inventory: menuItem.inventory,
        $id: req.menuItem.id
    }, (err) => {
        if (err) {
            next(err)
        } else {
            db.get("SELECT * FROM MenuItem WHERE id = $id", {$id: req.menuItem.id}, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({menuItem: row})
                }
            })
        }
    })
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run('DELETE FROM MenuItem WHERE id = $id', {$id: req.menuItem.id}, error => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        };
    });
});

module.exports = menuItemsRouter;